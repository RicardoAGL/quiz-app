/**
 * Gamification Service
 * Streak tracking and badge logic
 */

import * as storage from './storage';

const STREAK_KEY = storage.STORAGE_KEYS.STREAK;

/**
 * Get today's date as a YYYY-MM-DD string in local time.
 */
const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Calculate the difference in calendar days between two YYYY-MM-DD date strings.
 */
const daysBetween = (dateA, dateB) => {
  const a = new Date(dateA + 'T00:00:00');
  const b = new Date(dateB + 'T00:00:00');
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

/**
 * Record activity for today and update streak.
 * @returns {{ currentStreak: number, lastActiveDate: string }}
 */
export const recordActivity = () => {
  const today = getToday();
  const saved = storage.getItem(STREAK_KEY) || { lastActiveDate: null, currentStreak: 0 };

  if (saved.lastActiveDate === today) {
    // Already active today
    return saved;
  }

  let newStreak;
  if (saved.lastActiveDate && daysBetween(saved.lastActiveDate, today) === 1) {
    // Consecutive day
    newStreak = saved.currentStreak + 1;
  } else if (saved.lastActiveDate === today) {
    newStreak = saved.currentStreak;
  } else {
    // Streak broken or first activity
    newStreak = 1;
  }

  const updated = { lastActiveDate: today, currentStreak: newStreak };
  storage.setItem(STREAK_KEY, updated);
  return updated;
};

/**
 * Get the current streak without modifying it.
 * @returns {{ currentStreak: number, lastActiveDate: string|null }}
 */
export const getStreak = () => {
  const saved = storage.getItem(STREAK_KEY);
  if (!saved) return { currentStreak: 0, lastActiveDate: null };

  const today = getToday();
  const diff = saved.lastActiveDate ? daysBetween(saved.lastActiveDate, today) : 999;

  // If more than 1 day has passed, streak is effectively 0
  if (diff > 1) {
    return { currentStreak: 0, lastActiveDate: saved.lastActiveDate };
  }

  return saved;
};

/**
 * Accuracy tier for color-coding.
 * @param {number} accuracy - Accuracy percentage (0-100)
 * @returns {'red'|'amber'|'blue'|'green'|'none'}
 */
export const getAccuracyTier = (accuracy) => {
  if (accuracy === 0 || isNaN(accuracy)) return 'none';
  if (accuracy < 50) return 'red';
  if (accuracy < 75) return 'amber';
  if (accuracy < 90) return 'blue';
  return 'green';
};

/**
 * Tier color mapping for progress rings.
 */
export const TIER_COLORS = {
  none: '#95a5a6',
  red: '#e74c3c',
  amber: '#f39c12',
  blue: '#3498db',
  green: '#27ae60',
};

export default { recordActivity, getStreak, getAccuracyTier, TIER_COLORS };
