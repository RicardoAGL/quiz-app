/**
 * Mastery Service
 * Tracks module mastery levels and improvement over time.
 */

/**
 * Mastery level definitions.
 * Each level has a key, label, color, and test function.
 */
export const MASTERY_LEVELS = {
  NONE: { key: 'none', label: 'Sin empezar', color: '#95a5a6', icon: '' },
  STARTED: { key: 'started', label: 'En progreso', color: '#3498db', icon: '📘' },
  COVERED: { key: 'covered', label: 'Visto todo', color: '#9b59b6', icon: '📋' },
  COMPETENT: { key: 'competent', label: 'Competente', color: '#f39c12', icon: '🎯' },
  MASTERED: { key: 'mastered', label: 'Dominado', color: '#27ae60', icon: '🏆' },
};

/**
 * Calculate mastery level for a module.
 * @param {Array} moduleQuestions - Questions in the module
 * @param {Object} stats - Global stats object
 * @returns {{ level: Object, coverage: number, accuracy: number, totalAttempts: number }}
 */
export const getModuleMastery = (moduleQuestions, stats) => {
  if (!moduleQuestions || moduleQuestions.length === 0) {
    return { level: MASTERY_LEVELS.NONE, coverage: 0, accuracy: 0, totalAttempts: 0 };
  }

  const total = moduleQuestions.length;
  let answered = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let questionsWithMultipleAttempts = 0;
  let correctOnMultipleAttempts = 0;

  moduleQuestions.forEach((q) => {
    const s = stats[q.id];
    if (s && (s.correct > 0 || s.incorrect > 0)) {
      answered++;
      totalCorrect += s.correct;
      totalIncorrect += s.incorrect;

      const attempts = s.correct + s.incorrect;
      if (attempts >= 2) {
        questionsWithMultipleAttempts++;
        const acc = s.correct / attempts;
        if (acc >= 0.9) {
          correctOnMultipleAttempts++;
        }
      }
    }
  });

  const coverage = answered / total;
  const totalAttempts = totalCorrect + totalIncorrect;
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

  // Determine mastery level (highest matching)
  let level = MASTERY_LEVELS.NONE;

  if (answered > 0) {
    level = MASTERY_LEVELS.STARTED;
  }

  // Covered: seen all questions at least once
  if (coverage >= 1.0) {
    level = MASTERY_LEVELS.COVERED;
  }

  // Competent: 75%+ accuracy overall
  if (coverage >= 1.0 && accuracy >= 75) {
    level = MASTERY_LEVELS.COMPETENT;
  }

  // Mastered: 90%+ accuracy on questions with 2+ attempts, and full coverage
  if (
    coverage >= 1.0 &&
    accuracy >= 90 &&
    questionsWithMultipleAttempts >= total * 0.8 &&
    correctOnMultipleAttempts >= questionsWithMultipleAttempts * 0.9
  ) {
    level = MASTERY_LEVELS.MASTERED;
  }

  return { level, coverage, accuracy, totalAttempts };
};

export default { getModuleMastery, MASTERY_LEVELS };
