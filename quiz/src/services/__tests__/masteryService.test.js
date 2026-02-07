import { describe, it, expect } from 'vitest';
import { getModuleMastery, MASTERY_LEVELS } from '../masteryService';

const makeQuestions = (count, prefix = 'q') =>
  Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i + 1}` }));

describe('masteryService', () => {
  describe('getModuleMastery', () => {
    it('should return NONE for empty questions', () => {
      const result = getModuleMastery([], {});
      expect(result.level).toBe(MASTERY_LEVELS.NONE);
      expect(result.coverage).toBe(0);
    });

    it('should return NONE when no stats exist', () => {
      const questions = makeQuestions(5);
      const result = getModuleMastery(questions, {});
      expect(result.level).toBe(MASTERY_LEVELS.NONE);
    });

    it('should return STARTED when some questions are answered', () => {
      const questions = makeQuestions(5);
      const stats = { q1: { correct: 1, incorrect: 0 } };
      const result = getModuleMastery(questions, stats);
      expect(result.level).toBe(MASTERY_LEVELS.STARTED);
      expect(result.coverage).toBe(0.2);
    });

    it('should return COVERED when all questions seen', () => {
      const questions = makeQuestions(3);
      const stats = {
        q1: { correct: 1, incorrect: 1 },
        q2: { correct: 0, incorrect: 1 },
        q3: { correct: 1, incorrect: 0 },
      };
      const result = getModuleMastery(questions, stats);
      expect(result.level).toBe(MASTERY_LEVELS.COVERED);
      expect(result.coverage).toBe(1);
    });

    it('should return COMPETENT when full coverage and 75%+ accuracy', () => {
      const questions = makeQuestions(4);
      const stats = {
        q1: { correct: 3, incorrect: 1 },
        q2: { correct: 4, incorrect: 0 },
        q3: { correct: 3, incorrect: 1 },
        q4: { correct: 3, incorrect: 1 },
      };
      const result = getModuleMastery(questions, stats);
      expect(result.level).toBe(MASTERY_LEVELS.COMPETENT);
      expect(result.accuracy).toBeGreaterThanOrEqual(75);
    });

    it('should return MASTERED with 90%+ accuracy and 2+ attempts on most', () => {
      const questions = makeQuestions(5);
      const stats = {
        q1: { correct: 9, incorrect: 1 },
        q2: { correct: 10, incorrect: 0 },
        q3: { correct: 9, incorrect: 1 },
        q4: { correct: 10, incorrect: 0 },
        q5: { correct: 9, incorrect: 1 },
      };
      const result = getModuleMastery(questions, stats);
      expect(result.level).toBe(MASTERY_LEVELS.MASTERED);
    });

    it('should not return MASTERED if accuracy is below 90%', () => {
      const questions = makeQuestions(4);
      const stats = {
        q1: { correct: 3, incorrect: 1 },
        q2: { correct: 3, incorrect: 1 },
        q3: { correct: 3, incorrect: 1 },
        q4: { correct: 3, incorrect: 1 },
      };
      const result = getModuleMastery(questions, stats);
      expect(result.level).not.toBe(MASTERY_LEVELS.MASTERED);
    });

    it('should not return COMPETENT if coverage is incomplete', () => {
      const questions = makeQuestions(5);
      const stats = {
        q1: { correct: 10, incorrect: 0 },
        q2: { correct: 10, incorrect: 0 },
        q3: { correct: 10, incorrect: 0 },
      };
      const result = getModuleMastery(questions, stats);
      expect(result.level).toBe(MASTERY_LEVELS.STARTED);
    });

    it('should calculate accuracy correctly', () => {
      const questions = makeQuestions(2);
      const stats = {
        q1: { correct: 3, incorrect: 1 },
        q2: { correct: 1, incorrect: 1 },
      };
      const result = getModuleMastery(questions, stats);
      // 4 correct out of 6 total = 66.67%
      expect(result.accuracy).toBeCloseTo(66.67, 1);
    });
  });
});
