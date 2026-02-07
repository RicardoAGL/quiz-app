import { describe, it, expect } from 'vitest';
import { shuffleOptions, toOriginalIndex } from '../shuffleService';

describe('shuffleService', () => {
  describe('shuffleOptions', () => {
    const options = ['Option A', 'Option B', 'Option C', 'Option D'];

    it('should return all original options in shuffled array', () => {
      const result = shuffleOptions(options, 2);

      expect(result.shuffledOptions).toHaveLength(4);
      expect(result.shuffledOptions.sort()).toEqual([...options].sort());
    });

    it('should return a valid shuffledCorrectAnswer index', () => {
      const result = shuffleOptions(options, 2);

      expect(result.shuffledCorrectAnswer).toBeGreaterThanOrEqual(0);
      expect(result.shuffledCorrectAnswer).toBeLessThan(4);
      // The shuffled correct answer should point to the original correct option
      expect(result.shuffledOptions[result.shuffledCorrectAnswer]).toBe('Option C');
    });

    it('should return a shuffleMap of correct length', () => {
      const result = shuffleOptions(options, 2);

      expect(result.shuffleMap).toHaveLength(4);
    });

    it('should have shuffleMap containing all original indices', () => {
      const result = shuffleOptions(options, 2);

      expect([...result.shuffleMap].sort()).toEqual([0, 1, 2, 3]);
    });

    it('should correctly map shuffled positions to original options', () => {
      const result = shuffleOptions(options, 2);

      result.shuffleMap.forEach((originalIndex, shuffledIndex) => {
        expect(result.shuffledOptions[shuffledIndex]).toBe(options[originalIndex]);
      });
    });

    it('should track correct answer for index 0', () => {
      const result = shuffleOptions(options, 0);

      expect(result.shuffledOptions[result.shuffledCorrectAnswer]).toBe('Option A');
    });

    it('should track correct answer for last index', () => {
      const result = shuffleOptions(options, 3);

      expect(result.shuffledOptions[result.shuffledCorrectAnswer]).toBe('Option D');
    });

    it('should handle 2-option arrays', () => {
      const twoOptions = ['Yes', 'No'];
      const result = shuffleOptions(twoOptions, 0);

      expect(result.shuffledOptions).toHaveLength(2);
      expect(result.shuffledOptions[result.shuffledCorrectAnswer]).toBe('Yes');
    });

    it('should produce different orderings over many runs (statistical)', () => {
      const seenOrders = new Set();

      for (let i = 0; i < 100; i++) {
        const result = shuffleOptions(options, 0);
        seenOrders.add(result.shuffledOptions.join(','));
      }

      // With 4 options there are 24 permutations; we should see at least 2 different orderings
      expect(seenOrders.size).toBeGreaterThan(1);
    });

    it('should not mutate the original options array', () => {
      const original = ['A', 'B', 'C', 'D'];
      const copy = [...original];

      shuffleOptions(original, 0);

      expect(original).toEqual(copy);
    });
  });

  describe('toOriginalIndex', () => {
    it('should return the original index for a given shuffled index', () => {
      const shuffleMap = [2, 0, 3, 1]; // position 0 was originally index 2, etc.

      expect(toOriginalIndex(0, shuffleMap)).toBe(2);
      expect(toOriginalIndex(1, shuffleMap)).toBe(0);
      expect(toOriginalIndex(2, shuffleMap)).toBe(3);
      expect(toOriginalIndex(3, shuffleMap)).toBe(1);
    });

    it('should work with identity map (no shuffle)', () => {
      const shuffleMap = [0, 1, 2, 3];

      expect(toOriginalIndex(0, shuffleMap)).toBe(0);
      expect(toOriginalIndex(3, shuffleMap)).toBe(3);
    });

    it('should integrate with shuffleOptions output', () => {
      const options = ['A', 'B', 'C', 'D'];
      const { shuffleMap, shuffledCorrectAnswer } = shuffleOptions(options, 1);

      // The original index of the shuffled correct answer should be 1
      expect(toOriginalIndex(shuffledCorrectAnswer, shuffleMap)).toBe(1);
    });
  });
});
