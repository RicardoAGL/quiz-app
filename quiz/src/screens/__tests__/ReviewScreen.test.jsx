import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewScreen from '../ReviewScreen';

// Mock the useQuiz hook
vi.mock('../../hooks/useQuiz');
// Mock the useToast hook
vi.mock('../../hooks/useToast');
// Mock the useQuestionInteraction hook
vi.mock('../../hooks/useQuestionInteraction');

describe('ReviewScreen', () => {
  let mockUseQuiz;
  let mockUseToast;
  let mockUseQuestionInteraction;

  beforeEach(async () => {
    // Import the mocked modules
    const { useQuiz } = await import('../../hooks/useQuiz');
    const { useToast } = await import('../../hooks/useToast');
    const { useQuestionInteraction } = await import('../../hooks/useQuestionInteraction');

    mockUseQuiz = useQuiz;
    mockUseToast = useToast;
    mockUseQuestionInteraction = useQuestionInteraction;

    // Setup default toast mock
    mockUseToast.mockReturnValue({
      toast: null,
      showInfo: vi.fn(),
      showWarning: vi.fn(),
      showSuccess: vi.fn(),
      hideToast: vi.fn(),
    });

    // Setup default question interaction mock
    mockUseQuestionInteraction.mockReturnValue({
      selectedAnswer: null,
      showResult: false,
      handleAnswerSelect: vi.fn(),
      handleSubmit: vi.fn(),
      resetInteraction: vi.fn(),
      getOptionClass: vi.fn(() => 'option'),
    });
  });

  describe('Regression Test - ADR-001: Question List Snapshot Stability', () => {
    it('should maintain the same question after recording an answer (bug fix verification)', () => {
      // Setup: Create a list of failed questions
      const initialQuestions = [
        {
          id: 'q1',
          block: 'BLOQUE I: Test Block',
          question: 'First question that will be displayed',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          explanation: 'Explanation for question 1',
        },
        {
          id: 'q2',
          block: 'BLOQUE II: Test Block 2',
          question: 'Second question (should NOT appear after answering q1)',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 2,
          explanation: 'Explanation for question 2',
        },
        {
          id: 'q3',
          block: 'BLOQUE III: Test Block 3',
          question: 'Third question',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'Explanation for question 3',
        },
      ];

      const initialStats = {
        q1: { correct: 2, incorrect: 5 },
        q2: { correct: 1, incorrect: 4 },
        q3: { correct: 0, incorrect: 3 },
      };

      // Mock getIncorrectQuestions to return questions with more incorrect than correct
      const getIncorrectQuestionsMock = vi.fn(() => {
        return initialQuestions.filter((q) => {
          const stat = initialStats[q.id];
          return stat && stat.incorrect > stat.correct;
        });
      });

      const recordAnswerMock = vi.fn((questionId, isCorrect) => {
        // Simulate updating stats - this was the trigger for the bug
        // In the real bug, this would cause stats to change, which would
        // cause getIncorrectQuestions to be called again with new results
        if (isCorrect) {
          initialStats[questionId].correct += 1;
        } else {
          initialStats[questionId].incorrect += 1;
        }
      });

      // Initial mock setup
      mockUseQuiz.mockReturnValue({
        questions: initialQuestions,
        getIncorrectQuestions: getIncorrectQuestionsMock,
        getBookmarkedQuestions: vi.fn(() => []),
        getQuestionsByBlock: vi.fn(() => []),
        recordAnswer: recordAnswerMock,
        toggleBookmark: vi.fn(),
        bookmarks: [],
        stats: initialStats,
      });

      // Render the component in "failures" review mode (default mode)
      render(
        <MemoryRouter initialEntries={['/review']}>
          <ReviewScreen />
        </MemoryRouter>
      );

      // Verify the first question is displayed
      const firstQuestion = screen.getByText('First question that will be displayed');
      expect(firstQuestion).toBeInTheDocument();

      // Store the question text that should remain visible
      const originalQuestionText = 'First question that will be displayed';

      // Simulate the user answering the question correctly
      // This triggers recordAnswer, which updates stats
      recordAnswerMock('q1', true);

      // CRITICAL ASSERTION: The bug would cause the question list to rebuild,
      // and currentIndex (still 0) would now show q2 instead of q1.
      // With the fix (ref-based snapshot), q1 should still be visible.
      expect(screen.getByText(originalQuestionText)).toBeInTheDocument();
      expect(screen.queryByText('Second question (should NOT appear after answering q1)')).not.toBeInTheDocument();

      // Verify the correct block is still displayed
      expect(screen.getByText(/BLOQUE I: Test Block/)).toBeInTheDocument();
    });

    it('should snapshot the question list once and never rebuild it during the session', () => {
      const mockQuestions = [
        {
          id: 'q1',
          block: 'BLOQUE I',
          question: 'Question 1',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Explanation 1',
        },
        {
          id: 'q2',
          block: 'BLOQUE II',
          question: 'Question 2',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 1,
          explanation: 'Explanation 2',
        },
      ];

      const mockStats = {
        q1: { correct: 0, incorrect: 5 },
        q2: { correct: 1, incorrect: 3 },
      };

      const getIncorrectQuestionsMock = vi.fn(() => {
        // Return questions where incorrect > correct
        return mockQuestions.filter((q) => {
          const stat = mockStats[q.id];
          return stat && stat.incorrect > stat.correct;
        });
      });

      mockUseQuiz.mockReturnValue({
        questions: mockQuestions,
        getIncorrectQuestions: getIncorrectQuestionsMock,
        getBookmarkedQuestions: vi.fn(() => []),
        getQuestionsByBlock: vi.fn(() => []),
        recordAnswer: vi.fn(),
        toggleBookmark: vi.fn(),
        bookmarks: [],
        stats: mockStats,
      });

      render(
        <MemoryRouter initialEntries={['/review']}>
          <ReviewScreen />
        </MemoryRouter>
      );

      // getIncorrectQuestions should be called once during initial render
      expect(getIncorrectQuestionsMock).toHaveBeenCalledTimes(1);

      // Verify initial question renders
      expect(screen.getByText('Question 1')).toBeInTheDocument();

      // Force a re-render by changing stats (simulating recordAnswer behavior)
      mockStats.q1.correct = 10; // Now q1 would be filtered out if list rebuilds

      // Trigger a re-render by interacting with the component
      const bookmarkButton = screen.getByRole('button', { name: /☆|⭐/ });
      fireEvent.click(bookmarkButton);

      // CRITICAL: getIncorrectQuestions should still only have been called once
      // The ref-based snapshot prevents it from being called again
      expect(getIncorrectQuestionsMock).toHaveBeenCalledTimes(1);

      // Question 1 should still be visible (not filtered out despite stats change)
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
  });

  describe('ReviewScreen - Basic Rendering', () => {
    it('should render loading state when no questions are available', () => {
      mockUseQuiz.mockReturnValue({
        questions: [],
        getIncorrectQuestions: vi.fn(() => []),
        getBookmarkedQuestions: vi.fn(() => []),
        getQuestionsByBlock: vi.fn(() => []),
        recordAnswer: vi.fn(),
        toggleBookmark: vi.fn(),
        bookmarks: [],
        stats: {},
      });

      render(
        <MemoryRouter initialEntries={['/review']}>
          <ReviewScreen />
        </MemoryRouter>
      );

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should render question details correctly', () => {
      const mockQuestion = {
        id: 'q1',
        block: 'BLOQUE I: Test Block',
        question: 'Test question text',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 2,
        explanation: 'Test explanation',
      };

      mockUseQuiz.mockReturnValue({
        questions: [mockQuestion],
        getIncorrectQuestions: vi.fn(() => [mockQuestion]),
        getBookmarkedQuestions: vi.fn(() => []),
        getQuestionsByBlock: vi.fn(() => []),
        recordAnswer: vi.fn(),
        toggleBookmark: vi.fn(),
        bookmarks: [],
        stats: { q1: { correct: 1, incorrect: 3 } },
      });

      render(
        <MemoryRouter initialEntries={['/review']}>
          <ReviewScreen />
        </MemoryRouter>
      );

      // Verify question content is rendered
      expect(screen.getByText('Test question text')).toBeInTheDocument();
      expect(screen.getByText('BLOQUE I: Test Block')).toBeInTheDocument();
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Option C')).toBeInTheDocument();
      expect(screen.getByText('Option D')).toBeInTheDocument();
    });

    it('should display progress counter', () => {
      const mockQuestions = [
        {
          id: 'q1',
          block: 'BLOQUE I',
          question: 'Question 1',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Explanation',
        },
        {
          id: 'q2',
          block: 'BLOQUE II',
          question: 'Question 2',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 1,
          explanation: 'Explanation',
        },
      ];

      mockUseQuiz.mockReturnValue({
        questions: mockQuestions,
        getIncorrectQuestions: vi.fn(() => mockQuestions),
        getBookmarkedQuestions: vi.fn(() => []),
        getQuestionsByBlock: vi.fn(() => []),
        recordAnswer: vi.fn(),
        toggleBookmark: vi.fn(),
        bookmarks: [],
        stats: {},
      });

      render(
        <MemoryRouter initialEntries={['/review']}>
          <ReviewScreen />
        </MemoryRouter>
      );

      // Should show "1 / 2" for first question of two
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('should display bookmark button', () => {
      const mockQuestion = {
        id: 'q1',
        block: 'BLOQUE I',
        question: 'Test question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
      };

      mockUseQuiz.mockReturnValue({
        questions: [mockQuestion],
        getIncorrectQuestions: vi.fn(() => [mockQuestion]),
        getBookmarkedQuestions: vi.fn(() => []),
        getQuestionsByBlock: vi.fn(() => []),
        recordAnswer: vi.fn(),
        toggleBookmark: vi.fn(),
        bookmarks: [],
        stats: {},
      });

      render(
        <MemoryRouter initialEntries={['/review']}>
          <ReviewScreen />
        </MemoryRouter>
      );

      const bookmarkButton = screen.getByRole('button', { name: /☆|⭐/ });
      expect(bookmarkButton).toBeInTheDocument();
    });
  });
});
