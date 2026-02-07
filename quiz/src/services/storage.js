/**
 * Storage Service
 * Abstraction layer for data persistence
 * Makes it easy to swap storage mechanisms (LocalStorage, SessionStorage, IndexedDB, etc.)
 */

export const STORAGE_KEYS = {
  QUIZ_STATS: 'quizStats',
  BOOKMARKS: 'bookmarks',
  HAS_SEEN_SPLASH: 'hasSeenSplash',
  SELECTED_TOPIC: 'selectedTopic',
  STREAK: 'quizStreak',
};

/**
 * Get item from storage
 * @param {string} key - Storage key
 * @returns {any|null} Parsed value or null if not found/error
 */
export const getItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from storage (key: ${key}):`, error);
    return null;
  }
};

/**
 * Set item in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to storage (key: ${key}):`, error);
    return false;
  }
};

/**
 * Remove item from storage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from storage (key: ${key}):`, error);
    return false;
  }
};

/**
 * Get quiz statistics
 * @returns {Object} Statistics object
 */
export const getStats = () => {
  return getItem(STORAGE_KEYS.QUIZ_STATS) || {};
};

/**
 * Save quiz statistics
 * @param {Object} stats - Statistics object
 * @returns {boolean} Success status
 */
export const saveStats = (stats) => {
  return setItem(STORAGE_KEYS.QUIZ_STATS, stats);
};

/**
 * Get bookmarked questions
 * @returns {Array} Array of question IDs
 */
export const getBookmarks = () => {
  return getItem(STORAGE_KEYS.BOOKMARKS) || [];
};

/**
 * Save bookmarked questions
 * @param {Array} bookmarks - Array of question IDs
 * @returns {boolean} Success status
 */
export const saveBookmarks = (bookmarks) => {
  return setItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
};

/**
 * Reset all quiz data
 * @returns {boolean} Success status
 */
/**
 * Get whether user has seen splash screen
 * @returns {boolean}
 */
export const getHasSeenSplash = () => {
  return getItem(STORAGE_KEYS.HAS_SEEN_SPLASH) === true;
};

/**
 * Set splash screen as seen
 * @returns {boolean} Success status
 */
export const setHasSeenSplash = () => {
  return setItem(STORAGE_KEYS.HAS_SEEN_SPLASH, true);
};

/**
 * Get selected topic ID
 * @returns {string|null}
 */
export const getSelectedTopic = () => {
  return getItem(STORAGE_KEYS.SELECTED_TOPIC);
};

/**
 * Save selected topic ID
 * @param {string} topicId
 * @returns {boolean} Success status
 */
export const saveSelectedTopic = (topicId) => {
  return setItem(STORAGE_KEYS.SELECTED_TOPIC, topicId);
};

/**
 * Reset all quiz data
 * @returns {boolean} Success status
 */
export const resetAllData = () => {
  const statsRemoved = removeItem(STORAGE_KEYS.QUIZ_STATS);
  const bookmarksRemoved = removeItem(STORAGE_KEYS.BOOKMARKS);
  const splashRemoved = removeItem(STORAGE_KEYS.HAS_SEEN_SPLASH);
  const topicRemoved = removeItem(STORAGE_KEYS.SELECTED_TOPIC);
  const streakRemoved = removeItem(STORAGE_KEYS.STREAK);
  return statsRemoved && bookmarksRemoved && splashRemoved && topicRemoved && streakRemoved;
};

export default {
  getItem,
  setItem,
  removeItem,
  getStats,
  saveStats,
  getBookmarks,
  saveBookmarks,
  getHasSeenSplash,
  setHasSeenSplash,
  getSelectedTopic,
  saveSelectedTopic,
  resetAllData,
  STORAGE_KEYS,
};
