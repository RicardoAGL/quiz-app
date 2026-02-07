import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  gatherExportData,
  validateImportData,
  applyImportData,
} from '../exportImportService';
import * as storage from '../storage';

vi.mock('../storage', () => ({
  getStats: vi.fn(),
  getBookmarks: vi.fn(),
  getItem: vi.fn(),
  saveStats: vi.fn(() => true),
  saveBookmarks: vi.fn(() => true),
  setItem: vi.fn(() => true),
  removeItem: vi.fn(() => true),
  STORAGE_KEYS: {
    QUIZ_STATS: 'quizStats',
    BOOKMARKS: 'bookmarks',
    STREAK: 'quizStreak',
  },
}));

describe('exportImportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('gatherExportData', () => {
    it('should gather stats, bookmarks, and streak', () => {
      storage.getStats.mockReturnValue({ q1: { correct: 3, incorrect: 1 } });
      storage.getBookmarks.mockReturnValue(['q1', 'q2']);
      storage.getItem.mockReturnValue({ currentStreak: 5, lastActiveDate: '2026-01-15' });

      const data = gatherExportData();

      expect(data.version).toBe(1);
      expect(data.exportedAt).toBeDefined();
      expect(data.stats).toEqual({ q1: { correct: 3, incorrect: 1 } });
      expect(data.bookmarks).toEqual(['q1', 'q2']);
      expect(data.streak).toEqual({ currentStreak: 5, lastActiveDate: '2026-01-15' });
    });

    it('should handle empty data', () => {
      storage.getStats.mockReturnValue({});
      storage.getBookmarks.mockReturnValue([]);
      storage.getItem.mockReturnValue(null);

      const data = gatherExportData();

      expect(data.stats).toEqual({});
      expect(data.bookmarks).toEqual([]);
      expect(data.streak).toBeNull();
    });
  });

  describe('validateImportData', () => {
    it('should accept valid data', () => {
      const data = {
        version: 1,
        stats: { q1: { correct: 1, incorrect: 0 } },
        bookmarks: ['q1'],
      };
      expect(validateImportData(data)).toEqual({ valid: true });
    });

    it('should reject null data', () => {
      expect(validateImportData(null).valid).toBe(false);
    });

    it('should reject non-object data', () => {
      expect(validateImportData('string').valid).toBe(false);
    });

    it('should reject missing version', () => {
      expect(validateImportData({ stats: {} }).valid).toBe(false);
    });

    it('should reject future version', () => {
      expect(validateImportData({ version: 999 }).valid).toBe(false);
    });

    it('should reject invalid stats type', () => {
      expect(validateImportData({ version: 1, stats: 'bad' }).valid).toBe(false);
    });

    it('should reject invalid bookmarks type', () => {
      expect(validateImportData({ version: 1, bookmarks: 'bad' }).valid).toBe(false);
    });

    it('should accept data with only version', () => {
      expect(validateImportData({ version: 1 })).toEqual({ valid: true });
    });
  });

  describe('applyImportData', () => {
    it('should sanitize and save stats, bookmarks, and streak to storage', () => {
      const data = {
        stats: { q1: { correct: 5, incorrect: 2 } },
        bookmarks: ['q1', 'q3'],
        streak: { currentStreak: 3, longestStreak: 7, lastPracticeDate: '2025-06-15T12:00:00.000Z' },
      };

      const result = applyImportData(data);

      expect(storage.saveStats).toHaveBeenCalledWith({ q1: { correct: 5, incorrect: 2 } });
      expect(storage.saveBookmarks).toHaveBeenCalledWith(['q1', 'q3']);
      expect(storage.setItem).toHaveBeenCalledWith('quizStreak', {
        currentStreak: 3,
        longestStreak: 7,
        lastPracticeDate: '2025-06-15T12:00:00.000Z',
      });
      expect(result.stats).toEqual({ q1: { correct: 5, incorrect: 2 } });
      expect(result.bookmarks).toEqual(['q1', 'q3']);
    });

    it('should handle missing fields gracefully', () => {
      const data = { version: 1 };

      const result = applyImportData(data);

      expect(storage.saveStats).toHaveBeenCalledWith({});
      expect(storage.saveBookmarks).toHaveBeenCalledWith([]);
      expect(result.stats).toEqual({});
      expect(result.bookmarks).toEqual([]);
    });

    it('should clear existing streak when imported data has no streak', () => {
      const data = { stats: { q1: { correct: 1, incorrect: 0 } }, bookmarks: [] };

      applyImportData(data);

      expect(storage.removeItem).toHaveBeenCalledWith('quizStreak');
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('should strip dangerous keys and invalid entries during sanitization', () => {
      const data = {
        stats: {
          q1: { correct: 3, incorrect: 1 },
          __proto__: { correct: 99, incorrect: 0 },
          q2: 'bad-entry',
        },
        bookmarks: ['q1', '', 42, 'q3'],
        streak: { currentStreak: -5, longestStreak: 'bad' },
      };

      const result = applyImportData(data);

      // __proto__ stripped, q2 skipped (not an object)
      expect(result.stats).toEqual({ q1: { correct: 3, incorrect: 1 } });
      // empty string and non-string filtered out
      expect(result.bookmarks).toEqual(['q1', 'q3']);
      // negative currentStreak defaults to 0, invalid longestStreak defaults to 0
      expect(result.streak).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
      });
    });
  });
});
