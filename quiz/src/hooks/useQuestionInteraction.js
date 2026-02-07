import { useState, useCallback } from 'react';
import { shuffleOptions } from '../services/shuffleService';

/**
 * Custom hook for question interaction logic
 * Shared between QuizScreen and ReviewScreen
 * Handles answer selection, submission, result display, and option shuffling
 *
 * @param {Function} onAnswerSubmit - Callback when answer is submitted (questionId, isCorrect)
 * @returns {Object} Question interaction state and handlers
 */
export const useQuestionInteraction = (onAnswerSubmit) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [shuffleState, setShuffleState] = useState(null);

  /**
   * Handle answer selection (in shuffled space)
   * @param {number} index - Selected answer index in shuffled order
   */
  const handleAnswerSelect = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  /**
   * Submit the selected answer.
   * Translates shuffled selection back to original index for stats recording.
   * @param {Object} currentQuestion - Current question object
   * @param {Function} onSuccess - Optional callback on successful submission
   * @returns {boolean|null} True if correct, false if incorrect, null if no answer selected
   */
  const handleSubmit = (currentQuestion, onSuccess) => {
    if (selectedAnswer === null) {
      return null;
    }

    const correctAnswer = shuffleState
      ? shuffleState.shuffledCorrectAnswer
      : currentQuestion.correctAnswer;

    const isCorrect = selectedAnswer === correctAnswer;

    if (onAnswerSubmit) {
      onAnswerSubmit(currentQuestion.id, isCorrect);
    }

    setShowResult(true);

    if (onSuccess) {
      onSuccess(isCorrect);
    }

    return isCorrect;
  };

  /**
   * Reset state for next question and shuffle its options.
   * @param {Object} [question] - The new question to shuffle options for. If omitted, just resets state.
   */
  const resetInteraction = useCallback((question) => {
    setSelectedAnswer(null);
    setShowResult(false);

    if (question && question.options) {
      const result = shuffleOptions(question.options, question.correctAnswer);
      setShuffleState(result);
    } else {
      setShuffleState(null);
    }
  }, []);

  /**
   * Get CSS class for option button (works in shuffled space)
   * @param {number} index - Option index (in shuffled order)
   * @param {number} correctAnswer - Correct answer index (original, from question data)
   * @returns {string} CSS class name
   */
  const getOptionClass = (index, correctAnswer) => {
    const effectiveCorrect = shuffleState
      ? shuffleState.shuffledCorrectAnswer
      : correctAnswer;

    let className = 'option-button';

    if (showResult) {
      if (index === effectiveCorrect) {
        className += ' correct-option';
      } else if (index === selectedAnswer && selectedAnswer !== effectiveCorrect) {
        className += ' incorrect-option';
      }
    } else if (selectedAnswer === index) {
      className += ' selected-option';
    }

    return className;
  };

  return {
    selectedAnswer,
    showResult,
    shuffledOptions: shuffleState ? shuffleState.shuffledOptions : null,
    shuffledCorrectAnswer: shuffleState ? shuffleState.shuffledCorrectAnswer : null,
    handleAnswerSelect,
    handleSubmit,
    resetInteraction,
    getOptionClass,
  };
};

export default useQuestionInteraction;
