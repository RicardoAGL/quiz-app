import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuizProvider } from '../context/QuizContext';

/**
 * Renders a component wrapped with all necessary providers (BrowserRouter, QuizProvider).
 * Use this for integration-style tests that need routing and quiz context.
 *
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} [options] - Additional options passed to @testing-library/react render
 * @returns {Object} The render result from @testing-library/react
 */
export function renderWithProviders(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <QuizProvider>{children}</QuizProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Creates a mock localStorage object for testing.
 * Useful for isolating tests from the real browser localStorage.
 *
 * @returns {Object} A mock localStorage with getItem, setItem, removeItem, and clear methods
 */
export function mockLocalStorage() {
  let store = {};

  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] || null,
    _getStore: () => ({ ...store }),
  };
}

/**
 * Creates an array of sample quiz questions for use in tests.
 * Covers multiple blocks with varied options and explanations.
 *
 * @param {number} [count=5] - Number of questions to generate (max 5 from preset, extras are generated)
 * @returns {Array<Object>} Array of question objects matching the app's question schema
 */
export function createMockQuestions(count = 5) {
  const presetQuestions = [
    {
      id: 'test-q1',
      block: 'BLOQUE I: Test Block A',
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
      correctAnswer: 2,
      explanation: 'Paris is the capital and largest city of France.',
    },
    {
      id: 'test-q2',
      block: 'BLOQUE I: Test Block A',
      question: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Mercury', 'Earth', 'Mars'],
      correctAnswer: 1,
      explanation: 'Mercury is the closest planet to the Sun in our solar system.',
    },
    {
      id: 'test-q3',
      block: 'BLOQUE II: Test Block B',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      explanation: 'Basic arithmetic: 2 + 2 = 4.',
    },
    {
      id: 'test-q4',
      block: 'BLOQUE II: Test Block B',
      question: 'Which element has the symbol "O"?',
      options: ['Gold', 'Osmium', 'Oxygen', 'Oganesson'],
      correctAnswer: 2,
      explanation: 'Oxygen has the chemical symbol "O" and atomic number 8.',
    },
    {
      id: 'test-q5',
      block: 'BLOQUE III: Test Block C',
      question: 'In what year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: 2,
      explanation: 'World War II ended in 1945 with the surrender of Japan.',
    },
  ];

  if (count <= presetQuestions.length) {
    return presetQuestions.slice(0, count);
  }

  // Generate additional questions beyond the preset set
  const additional = Array.from({ length: count - presetQuestions.length }, (_, i) => ({
    id: `test-q${presetQuestions.length + i + 1}`,
    block: `BLOQUE ${Math.ceil((i + 1) / 2)}: Generated Block`,
    question: `Generated test question ${i + 1}?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: i % 4,
    explanation: `Explanation for generated question ${i + 1}.`,
  }));

  return [...presetQuestions, ...additional];
}
