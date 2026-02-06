import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getItem,
  setItem,
  removeItem,
  getStats,
  saveStats,
  getBookmarks,
  saveBookmarks,
  resetAllData,
} from '../storage';

describe('storage', () => {
  // Mock localStorage
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getItem', () => {
    it('should retrieve and parse item from localStorage', () => {
      const testData = { name: 'test', value: 123 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));

      const result = getItem('testKey');

      expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
      expect(result).toEqual(testData);
    });

    it('should return null when item does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getItem('nonExistentKey');

      expect(result).toBeNull();
    });

    it('should return null on JSON parse error', () => {
      localStorageMock.getItem.mockReturnValue('invalid JSON {');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = getItem('badKey');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error reading from storage'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle localStorage exception', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = getItem('testKey');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty string', () => {
      localStorageMock.getItem.mockReturnValue('');

      const result = getItem('emptyKey');

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should stringify and store item in localStorage', () => {
      const testData = { name: 'test', value: 123 };

      const result = setItem('testKey', testData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify(testData)
      );
      expect(result).toBe(true);
    });

    it('should handle primitive values', () => {
      setItem('stringKey', 'hello');
      setItem('numberKey', 42);
      setItem('boolKey', true);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('stringKey', '"hello"');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('numberKey', '42');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('boolKey', 'true');
    });

    it('should handle arrays', () => {
      const testArray = [1, 2, 3, 'four'];

      setItem('arrayKey', testArray);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'arrayKey',
        JSON.stringify(testArray)
      );
    });

    it('should return false on localStorage exception', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = setItem('testKey', { data: 'test' });

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle null and undefined', () => {
      setItem('nullKey', null);
      setItem('undefinedKey', undefined);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('nullKey', 'null');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('undefinedKey', undefined);
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      const result = removeItem('testKey');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('testKey');
      expect(result).toBe(true);
    });

    it('should return false on localStorage exception', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = removeItem('testKey');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle removing non-existent key', () => {
      // removeItem on non-existent key should not throw
      const result = removeItem('nonExistentKey');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nonExistentKey');
      expect(result).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return stats object from localStorage', () => {
      const mockStats = {
        q1: { correct: 5, incorrect: 2 },
        q2: { correct: 3, incorrect: 1 },
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockStats));

      const result = getStats();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('quizStats');
      expect(result).toEqual(mockStats);
    });

    it('should return empty object when no stats exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getStats();

      expect(result).toEqual({});
    });

    it('should return empty object on parse error', () => {
      localStorageMock.getItem.mockReturnValue('invalid JSON');
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = getStats();

      expect(result).toEqual({});
    });
  });

  describe('saveStats', () => {
    it('should save stats object to localStorage', () => {
      const mockStats = {
        q1: { correct: 5, incorrect: 2 },
        q2: { correct: 3, incorrect: 1 },
      };

      const result = saveStats(mockStats);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'quizStats',
        JSON.stringify(mockStats)
      );
      expect(result).toBe(true);
    });

    it('should handle empty stats object', () => {
      const result = saveStats({});

      expect(localStorageMock.setItem).toHaveBeenCalledWith('quizStats', '{}');
      expect(result).toBe(true);
    });

    it('should return false on storage error', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = saveStats({ q1: { correct: 1, incorrect: 0 } });

      expect(result).toBe(false);
    });
  });

  describe('getBookmarks', () => {
    it('should return bookmarks array from localStorage', () => {
      const mockBookmarks = ['q1', 'q3', 'q7'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));

      const result = getBookmarks();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('bookmarks');
      expect(result).toEqual(mockBookmarks);
    });

    it('should return empty array when no bookmarks exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getBookmarks();

      expect(result).toEqual([]);
    });

    it('should return empty array on parse error', () => {
      localStorageMock.getItem.mockReturnValue('invalid JSON');
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = getBookmarks();

      expect(result).toEqual([]);
    });
  });

  describe('saveBookmarks', () => {
    it('should save bookmarks array to localStorage', () => {
      const mockBookmarks = ['q1', 'q3', 'q7'];

      const result = saveBookmarks(mockBookmarks);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bookmarks',
        JSON.stringify(mockBookmarks)
      );
      expect(result).toBe(true);
    });

    it('should handle empty bookmarks array', () => {
      const result = saveBookmarks([]);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('bookmarks', '[]');
      expect(result).toBe(true);
    });

    it('should return false on storage error', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = saveBookmarks(['q1', 'q2']);

      expect(result).toBe(false);
    });
  });

  describe('resetAllData', () => {
    it('should remove both quizStats and bookmarks', () => {
      const result = resetAllData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quizStats');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('bookmarks');
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should return false if stats removal fails', () => {
      localStorageMock.removeItem.mockImplementation((key) => {
        if (key === 'quizStats') {
          throw new Error('Cannot remove stats');
        }
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = resetAllData();

      expect(result).toBe(false);
    });

    it('should return false if bookmarks removal fails', () => {
      localStorageMock.removeItem.mockImplementation((key) => {
        if (key === 'bookmarks') {
          throw new Error('Cannot remove bookmarks');
        }
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = resetAllData();

      expect(result).toBe(false);
    });

    it('should return false if both removals fail', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = resetAllData();

      expect(result).toBe(false);
    });

    it('should only remove quiz-specific keys', () => {
      // This test verifies we're not calling clear() or removing other keys
      resetAllData();

      expect(localStorageMock.clear).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quizStats');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('bookmarks');
    });
  });
});
