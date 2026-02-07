/**
 * Quiz Algorithm Constants
 * Constants for the weighted question selection algorithm
 */

/**
 * Weight assigned to unanswered questions
 * Higher value = higher priority
 * Unanswered questions get maximum priority (10x more likely than baseline)
 */
export const UNANSWERED_QUESTION_WEIGHT = 10;

/**
 * Failure rate multiplier
 * Applied to the failure rate (incorrect/total) to calculate base weight
 * Higher value = more weight given to failed questions
 */
export const FAILURE_RATE_MULTIPLIER = 3;

/**
 * Base weight for questions
 * Added to all questions to ensure minimum selection probability
 */
export const BASE_WEIGHT = 0.5;

/**
 * Route paths used throughout the application
 */
export const ROUTES = {
  ROOT: '/',
  SPLASH: '/splash',
  TOPICS: '/topics',
  MODULE_GRID: '/topics/:topicId',
  HOME: '/home',
  DASHBOARD: '/topics/:topicId/dashboard',
  QUIZ: '/quiz',
  SEQUENTIAL_MODE: '/sequential-mode',
  REVIEW: '/review',
  REVIEW_MODE: '/review/:mode',
  REVIEW_BLOCK: '/review/:mode/:blockName',
  STATISTICS: '/statistics',
  TIME_ATTACK: '/time-attack',
  MULTI_QUIZ_SELECT: '/topics/:topicId/multi-quiz',
};

/**
 * Review modes
 */
export const REVIEW_MODES = {
  BOOKMARKED: 'bookmarked',
  BLOCK: 'block',
  SEQUENTIAL: 'sequential',
  FAILED: 'failed',
};

export default {
  UNANSWERED_QUESTION_WEIGHT,
  FAILURE_RATE_MULTIPLIER,
  BASE_WEIGHT,
  ROUTES,
  REVIEW_MODES,
};
