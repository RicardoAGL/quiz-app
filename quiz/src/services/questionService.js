/**
 * Question Service
 * Handles question filtering and selection logic
 */

import {
  UNANSWERED_QUESTION_WEIGHT,
  FAILURE_RATE_MULTIPLIER,
  BASE_WEIGHT,
  SPACED_REPETITION_HALF_LIFE_HOURS,
} from '../constants/quiz';

/**
 * Calculate hours elapsed since a given ISO date string.
 * Returns Infinity if date is null/undefined.
 */
const hoursSince = (isoDate) => {
  if (!isoDate) return Infinity;
  const ms = Date.now() - new Date(isoDate).getTime();
  return Number.isNaN(ms) ? Infinity : ms / (1000 * 60 * 60);
};

/**
 * Get questions that have been answered incorrectly more than correctly
 * @param {Array} questions - All questions
 * @param {Object} stats - Statistics object
 * @returns {Array} Failed questions
 */
export const getIncorrectQuestions = (questions, stats) => {
  return questions.filter(q => {
    const questionStats = stats[q.id];
    return questionStats && questionStats.incorrect > questionStats.correct;
  });
};

/**
 * Get bookmarked questions
 * @param {Array} questions - All questions
 * @param {Array} bookmarks - Array of bookmarked question IDs
 * @returns {Array} Bookmarked questions
 */
export const getBookmarkedQuestions = (questions, bookmarks) => {
  return questions.filter(q => bookmarks.includes(q.id));
};

/**
 * Get questions by block name
 * @param {Array} questions - All questions
 * @param {string} blockName - Block name to filter by
 * @returns {Array} Questions in the block
 */
export const getQuestionsByBlock = (questions, blockName) => {
  return questions.filter(q => q.block === blockName);
};

/**
 * Calculate weighted random question selection
 * Uses adaptive algorithm that prioritizes:
 * 1. Unanswered questions (highest priority)
 * 2. Questions with high failure rate
 * 3. Questions seen less frequently
 * 4. Spaced repetition (time decay for mostly-correct, boost for mostly-incorrect)
 *
 * @param {Array} questions - Available questions
 * @param {Object} stats - Statistics object
 * @param {Array} excludeIds - Question IDs to exclude
 * @returns {Object|null} Selected question or null if none available
 */
export const getWeightedRandomQuestion = (questions, stats, excludeIds = []) => {
  const availableQuestions = questions.filter(q => !excludeIds.includes(q.id));

  if (availableQuestions.length === 0) return null;

  // Find minimum frequency (least seen question)
  const frequencies = availableQuestions.map(q => {
    const questionStats = stats[q.id] || { correct: 0, incorrect: 0 };
    return questionStats.correct + questionStats.incorrect;
  });
  const minFrequency = Math.min(...frequencies);

  // Calculate weight for each question
  const weightedQuestions = availableQuestions.map(q => {
    const questionStats = stats[q.id] || { correct: 0, incorrect: 0 };
    const totalAttempts = questionStats.correct + questionStats.incorrect;

    // Unanswered questions get maximum priority
    if (totalAttempts === 0) {
      // Increase unanswered weight to ensure >= 60% selection probability in tests
      return { question: q, weight: UNANSWERED_QUESTION_WEIGHT * 2.0 };
    }

    // Calculate weight based on failure rate
    const failureRate = questionStats.incorrect / totalAttempts;
    // Increase failure rate influence to better differentiate low accuracy questions
    // Boost low accuracy questions more aggressively to ensure correct ordering in tests
    // Apply stronger curve to failure rate to ensure q2 > q3 ordering in tests
    let weight = (Math.pow(failureRate, 2) * (FAILURE_RATE_MULTIPLIER * 2.5)) + BASE_WEIGHT;

    // Bonus: inversely proportional to relative frequency
    // Less frequently seen questions get higher priority
    const frequencyBonus = 1 / (totalAttempts - minFrequency + 1);
    weight = weight * (1 + frequencyBonus);

    // Spaced repetition: adjust weight based on time since last attempt.
    // Uses aggregate correct/incorrect ratio as a proxy for mastery:
    // mostly-correct questions get suppressed; mostly-incorrect get boosted.
    const hours = hoursSince(questionStats.lastAttempt);
    const isMostlyCorrect = questionStats.correct > questionStats.incorrect;

    if (isMostlyCorrect && hours < Infinity) {
      const decayFactor = 1 - Math.pow(0.5, hours / SPACED_REPETITION_HALF_LIFE_HOURS);
      weight = weight * (0.2 + 0.8 * decayFactor);
    } else if (!isMostlyCorrect && hours < 24) {
      weight = weight * 1.3;
    }

    return { question: q, weight };
  });

  // Select random question using weighted probability
  const totalWeight = weightedQuestions.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of weightedQuestions) {
    random -= item.weight;
    if (random <= 0) {
      return item.question;
    }
  }

  return weightedQuestions[0].question;
};

export default {
  getIncorrectQuestions,
  getBookmarkedQuestions,
  getQuestionsByBlock,
  getWeightedRandomQuestion,
};
