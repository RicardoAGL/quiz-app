import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuestionInteraction } from '../useQuestionInteraction';

describe('useQuestionInteraction', () => {
  let mockOnAnswerSubmit;
  let mockQuestion;

  beforeEach(() => {
    mockOnAnswerSubmit = vi.fn();
    mockQuestion = {
      id: 'q1',
      question: 'Test question?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 2, // Index 2 = Option C
      explanation: 'Test explanation',
    };
  });

  describe('initial state', () => {
    it('should initialize with no answer selected and no result shown', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      expect(result.current.selectedAnswer).toBeNull();
      expect(result.current.showResult).toBe(false);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      expect(typeof result.current.handleAnswerSelect).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.resetInteraction).toBe('function');
      expect(typeof result.current.getOptionClass).toBe('function');
    });
  });

  describe('handleAnswerSelect', () => {
    it('should select answer when no result is shown', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(1);
      });

      expect(result.current.selectedAnswer).toBe(1);
    });

    it('should allow changing selection before submission', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(0);
      });

      expect(result.current.selectedAnswer).toBe(0);

      act(() => {
        result.current.handleAnswerSelect(3);
      });

      expect(result.current.selectedAnswer).toBe(3);
    });

    it('should prevent selection after result is shown', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      // Select and submit answer
      act(() => {
        result.current.handleAnswerSelect(1);
      });

      act(() => {
        result.current.handleSubmit(mockQuestion);
      });

      expect(result.current.showResult).toBe(true);

      // Try to change selection after submission
      act(() => {
        result.current.handleAnswerSelect(2);
      });

      // Selection should remain unchanged
      expect(result.current.selectedAnswer).toBe(1);
    });

    it('should accept index 0', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(0);
      });

      expect(result.current.selectedAnswer).toBe(0);
    });
  });

  describe('handleSubmit', () => {
    it('should return null when no answer is selected', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      let submitResult;
      act(() => {
        submitResult = result.current.handleSubmit(mockQuestion);
      });

      expect(submitResult).toBeNull();
      expect(mockOnAnswerSubmit).not.toHaveBeenCalled();
      expect(result.current.showResult).toBe(false);
    });

    it('should return true and call callback with correct answer', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(2); // Correct answer
      });

      let submitResult;
      act(() => {
        submitResult = result.current.handleSubmit(mockQuestion);
      });

      expect(submitResult).toBe(true);
      expect(mockOnAnswerSubmit).toHaveBeenCalledWith('q1', true);
      expect(result.current.showResult).toBe(true);
    });

    it('should return false and call callback with incorrect answer', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(1); // Incorrect answer
      });

      let submitResult;
      act(() => {
        submitResult = result.current.handleSubmit(mockQuestion);
      });

      expect(submitResult).toBe(false);
      expect(mockOnAnswerSubmit).toHaveBeenCalledWith('q1', false);
      expect(result.current.showResult).toBe(true);
    });

    it('should work without onAnswerSubmit callback', () => {
      const { result } = renderHook(() => useQuestionInteraction(null));

      act(() => {
        result.current.handleAnswerSelect(2);
      });

      let submitResult;
      act(() => {
        submitResult = result.current.handleSubmit(mockQuestion);
      });

      expect(submitResult).toBe(true);
      expect(result.current.showResult).toBe(true);
    });

    it('should call optional onSuccess callback', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));
      const onSuccess = vi.fn();

      act(() => {
        result.current.handleAnswerSelect(2);
      });

      act(() => {
        result.current.handleSubmit(mockQuestion, onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledWith(true);
    });

    it('should call onSuccess with false for incorrect answer', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));
      const onSuccess = vi.fn();

      act(() => {
        result.current.handleAnswerSelect(0);
      });

      act(() => {
        result.current.handleSubmit(mockQuestion, onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledWith(false);
    });

    it('should handle answer index 0 as correct answer', () => {
      const questionWithFirstCorrect = {
        ...mockQuestion,
        correctAnswer: 0,
      };

      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(0);
      });

      let submitResult;
      act(() => {
        submitResult = result.current.handleSubmit(questionWithFirstCorrect);
      });

      expect(submitResult).toBe(true);
      expect(mockOnAnswerSubmit).toHaveBeenCalledWith('q1', true);
    });

    it('should set showResult flag on submission', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(1);
      });

      expect(result.current.showResult).toBe(false);

      act(() => {
        result.current.handleSubmit(mockQuestion);
      });

      expect(result.current.showResult).toBe(true);
    });
  });

  describe('resetInteraction', () => {
    it('should clear selected answer and result state', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      // Select and submit
      act(() => {
        result.current.handleAnswerSelect(2);
      });

      act(() => {
        result.current.handleSubmit(mockQuestion);
      });

      expect(result.current.selectedAnswer).toBe(2);
      expect(result.current.showResult).toBe(true);

      // Reset
      act(() => {
        result.current.resetInteraction();
      });

      expect(result.current.selectedAnswer).toBeNull();
      expect(result.current.showResult).toBe(false);
    });

    it('should be safe to call on initial state', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.resetInteraction();
      });

      expect(result.current.selectedAnswer).toBeNull();
      expect(result.current.showResult).toBe(false);
    });

    it('should allow new interaction after reset', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      // First interaction
      act(() => {
        result.current.handleAnswerSelect(1);
        result.current.handleSubmit(mockQuestion);
      });

      // Reset
      act(() => {
        result.current.resetInteraction();
      });

      // Second interaction should work
      act(() => {
        result.current.handleAnswerSelect(3);
      });

      expect(result.current.selectedAnswer).toBe(3);
      expect(result.current.showResult).toBe(false);
    });
  });

  describe('getOptionClass', () => {
    it('should return base class when no selection and no result', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      const className = result.current.getOptionClass(0, 2);

      expect(className).toBe('option-button');
    });

    it('should add selected-option class for selected answer before submission', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(1);
      });

      const className = result.current.getOptionClass(1, 2);

      expect(className).toBe('option-button selected-option');
    });

    it('should not add selected class to non-selected options', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(1);
      });

      const className = result.current.getOptionClass(0, 2);

      expect(className).toBe('option-button');
    });

    it('should add correct-option class to correct answer after submission', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(2);
      });

      act(() => {
        result.current.handleSubmit(mockQuestion);
      });

      const className = result.current.getOptionClass(2, 2);

      expect(className).toBe('option-button correct-option');
    });

    it('should add incorrect-option class to wrong selected answer', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(1);
      });

      act(() => {
        result.current.handleSubmit(mockQuestion);
      });

      const className = result.current.getOptionClass(1, 2);

      expect(className).toBe('option-button incorrect-option');
    });

    it('should highlight correct answer even when not selected', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(1); // Wrong answer
      });

      act(() => {
        result.current.handleSubmit(mockQuestion);
      });

      // Correct answer should show as correct
      const correctClassName = result.current.getOptionClass(2, 2);
      expect(correctClassName).toBe('option-button correct-option');

      // Wrong answer should show as incorrect
      const incorrectClassName = result.current.getOptionClass(1, 2);
      expect(incorrectClassName).toBe('option-button incorrect-option');

      // Other options should have base class
      const otherClassName = result.current.getOptionClass(0, 2);
      expect(otherClassName).toBe('option-button');
    });

    it('should handle index 0 as correct answer', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(0);
      });

      act(() => {
        result.current.handleSubmit({ ...mockQuestion, correctAnswer: 0 });
      });

      const className = result.current.getOptionClass(0, 0);

      expect(className).toBe('option-button correct-option');
    });

    it('should show correct and incorrect styling together when wrong answer selected', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(3); // Wrong
      });

      act(() => {
        result.current.handleSubmit(mockQuestion);
      });

      // All options should have correct styling
      const option0 = result.current.getOptionClass(0, 2);
      const option1 = result.current.getOptionClass(1, 2);
      const option2 = result.current.getOptionClass(2, 2);
      const option3 = result.current.getOptionClass(3, 2);

      expect(option0).toBe('option-button');
      expect(option1).toBe('option-button');
      expect(option2).toBe('option-button correct-option');
      expect(option3).toBe('option-button incorrect-option');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete question flow: select, submit, reset, repeat', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      // First question
      act(() => {
        result.current.handleAnswerSelect(2);
      });
      act(() => {
        result.current.handleSubmit(mockQuestion);
      });

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith('q1', true);
      expect(result.current.showResult).toBe(true);

      // Reset for next question
      act(() => {
        result.current.resetInteraction();
      });

      // Second question
      const newQuestion = { ...mockQuestion, id: 'q2', correctAnswer: 1 };
      act(() => {
        result.current.handleAnswerSelect(1);
      });
      act(() => {
        result.current.handleSubmit(newQuestion);
      });

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith('q2', true);
      expect(mockOnAnswerSubmit).toHaveBeenCalledTimes(2);
    });

    it('should maintain state consistency throughout interactions', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      // No selection initially
      expect(result.current.selectedAnswer).toBeNull();
      expect(result.current.showResult).toBe(false);

      // Select answer
      act(() => {
        result.current.handleAnswerSelect(1);
      });
      expect(result.current.selectedAnswer).toBe(1);
      expect(result.current.showResult).toBe(false);

      // Submit answer
      act(() => {
        result.current.handleSubmit(mockQuestion);
      });
      expect(result.current.selectedAnswer).toBe(1);
      expect(result.current.showResult).toBe(true);

      // Attempt to change selection (should be prevented)
      act(() => {
        result.current.handleAnswerSelect(2);
      });
      expect(result.current.selectedAnswer).toBe(1);
      expect(result.current.showResult).toBe(true);

      // Reset
      act(() => {
        result.current.resetInteraction();
      });
      expect(result.current.selectedAnswer).toBeNull();
      expect(result.current.showResult).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid selections before submission', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(0);
        result.current.handleAnswerSelect(1);
        result.current.handleAnswerSelect(2);
        result.current.handleAnswerSelect(3);
      });

      expect(result.current.selectedAnswer).toBe(3);
    });

    it('should handle submission without onSuccess callback', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(2);
      });

      expect(() => {
        act(() => {
          result.current.handleSubmit(mockQuestion);
        });
      }).not.toThrow();
    });

    it('should handle getOptionClass with various index combinations', () => {
      const { result } = renderHook(() => useQuestionInteraction(mockOnAnswerSubmit));

      act(() => {
        result.current.handleAnswerSelect(0);
      });

      act(() => {
        result.current.handleSubmit(mockQuestion);
      });

      // Test all indices
      for (let i = 0; i < 4; i++) {
        const className = result.current.getOptionClass(i, 2);
        expect(typeof className).toBe('string');
        expect(className).toContain('option-button');
      }
    });

    it('should work with undefined onAnswerSubmit', () => {
      const { result } = renderHook(() => useQuestionInteraction(undefined));

      expect(() => {
        act(() => {
          result.current.handleAnswerSelect(2);
          result.current.handleSubmit(mockQuestion);
          result.current.resetInteraction();
        });
      }).not.toThrow();
    });
  });
});
