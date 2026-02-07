/**
 * Progress Service
 * Calculates progress metrics for modules and topics
 */

/**
 * Calculate progress for a single module.
 * @param {Array} moduleQuestions - Questions in the module
 * @param {Object} stats - Global stats object
 * @returns {{ answered: number, total: number, accuracy: string, completion: number }}
 */
export const getModuleProgress = (moduleQuestions, stats) => {
  const total = moduleQuestions.length;
  if (total === 0) return { answered: 0, total: 0, accuracy: '0.0', completion: 0 };

  let answered = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;

  moduleQuestions.forEach((q) => {
    const s = stats[q.id];
    if (s) {
      answered++;
      totalCorrect += s.correct;
      totalIncorrect += s.incorrect;
    }
  });

  const totalAttempts = totalCorrect + totalIncorrect;
  const accuracy = totalAttempts > 0
    ? ((totalCorrect / totalAttempts) * 100).toFixed(1)
    : '0.0';
  const completion = Math.round((answered / total) * 100);

  return { answered, total, accuracy, completion };
};

/**
 * Calculate aggregate progress across all modules in a topic.
 * @param {Array} topicModules - Array of loaded module objects (each has .data.questions)
 * @param {Object} stats - Global stats object
 * @returns {{ answered: number, total: number, accuracy: string, completion: number, moduleCount: number }}
 */
export const getTopicProgress = (topicModules, stats) => {
  let totalQuestions = 0;
  let totalAnswered = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;

  topicModules.forEach((mod) => {
    const questions = mod.data.questions;
    totalQuestions += questions.length;

    questions.forEach((q) => {
      const s = stats[q.id];
      if (s) {
        totalAnswered++;
        totalCorrect += s.correct;
        totalIncorrect += s.incorrect;
      }
    });
  });

  const totalAttempts = totalCorrect + totalIncorrect;
  const accuracy = totalAttempts > 0
    ? ((totalCorrect / totalAttempts) * 100).toFixed(1)
    : '0.0';
  const completion = totalQuestions > 0
    ? Math.round((totalAnswered / totalQuestions) * 100)
    : 0;

  return {
    answered: totalAnswered,
    total: totalQuestions,
    accuracy,
    completion,
    moduleCount: topicModules.length,
  };
};

export default { getModuleProgress, getTopicProgress };
