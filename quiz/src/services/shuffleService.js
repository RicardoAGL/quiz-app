/**
 * Shuffle Service
 * Provides Fisher-Yates shuffle for answer options
 */

/**
 * Shuffle an array of options and track where the correct answer moved.
 * Uses the Fisher-Yates (Knuth) shuffle algorithm for unbiased randomization.
 *
 * @param {Array} options - Array of option strings
 * @param {number} correctAnswer - Index of the correct answer in the original array
 * @returns {{ shuffledOptions: Array, shuffledCorrectAnswer: number, shuffleMap: number[] }}
 *   shuffleMap[i] = original index that is now at position i
 */
export const shuffleOptions = (options, correctAnswer) => {
  const shuffleMap = options.map((_, i) => i);

  // Fisher-Yates shuffle on the index map
  for (let i = shuffleMap.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffleMap[i], shuffleMap[j]] = [shuffleMap[j], shuffleMap[i]];
  }

  const shuffledOptions = shuffleMap.map(originalIndex => options[originalIndex]);
  const shuffledCorrectAnswer = shuffleMap.indexOf(correctAnswer);

  return { shuffledOptions, shuffledCorrectAnswer, shuffleMap };
};

/**
 * Translate a selected index in shuffled order back to the original index.
 *
 * @param {number} shuffledIndex - The index selected in shuffled order
 * @param {number[]} shuffleMap - The shuffle mapping (shuffleMap[i] = original index at position i)
 * @returns {number} The original index
 */
export const toOriginalIndex = (shuffledIndex, shuffleMap) => {
  return shuffleMap[shuffledIndex];
};

export default { shuffleOptions, toOriginalIndex };
