/**
 * Export/Import Service
 * Handles backup and restore of user progress data as JSON files.
 */

import * as storage from './storage';

const EXPORT_VERSION = 1;
const MAX_IMPORT_SIZE = 1 * 1024 * 1024; // 1 MB
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const ALLOWED_STAT_KEYS = new Set(['correct', 'incorrect', 'lastAttempt']);

/**
 * Gather all user progress data for export.
 * @returns {Object} Exportable data envelope with version and timestamp.
 */
export const gatherExportData = () => {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    stats: storage.getStats(),
    bookmarks: storage.getBookmarks(),
    streak: storage.getItem(storage.STORAGE_KEYS.STREAK),
  };
};

/**
 * Trigger a JSON file download in the browser.
 * @param {Object} data - Data to export
 */
export const downloadExport = (data) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const filename = `quiz-progress-${date}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Validate imported data structure.
 * @param {any} data - Parsed JSON data
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImportData = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'El archivo no contiene datos válidos' };
  }

  if (typeof data.version !== 'number') {
    return { valid: false, error: 'Formato de archivo no reconocido' };
  }

  if (data.version > EXPORT_VERSION) {
    return { valid: false, error: 'Este archivo fue exportado con una versión más reciente de la app' };
  }

  if (data.stats && typeof data.stats !== 'object') {
    return { valid: false, error: 'Las estadísticas del archivo son inválidas' };
  }

  if (data.bookmarks && !Array.isArray(data.bookmarks)) {
    return { valid: false, error: 'Los marcadores del archivo son inválidos' };
  }

  return { valid: true };
};

/**
 * Read and parse a JSON file from a File input.
 * @param {File} file
 * @returns {Promise<Object>} Parsed JSON data
 */
export const readJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_IMPORT_SIZE) {
      reject(new Error('El archivo es demasiado grande (máximo 1 MB)'));
      return;
    }
    // Check MIME type when available, and always check extension
    const validTypes = ['application/json', 'text/json', ''];
    if (!validTypes.includes(file.type) || !file.name.toLowerCase().endsWith('.json')) {
      reject(new Error('Solo se permiten archivos .json'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch {
        reject(new Error('El archivo no es un JSON válido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
};

/**
 * Check if a string is a valid ISO 8601 date that is not in the future.
 */
const isValidPastDate = (str) => {
  if (typeof str !== 'string') return false;
  const d = new Date(str);
  if (isNaN(d.getTime())) return false;
  return d.getTime() <= Date.now();
};

/**
 * Check if a value is a non-negative integer.
 */
const isNonNegInt = (v) => Number.isInteger(v) && v >= 0;

/**
 * Sanitize and harden imported data before applying.
 * - Strips prototype-pollution keys from stats
 * - Validates each stat entry shape (correct, incorrect, lastAttempt)
 * - Whitelists only allowed keys per stat entry
 * - Validates streak shape and rejects future dates
 * - Filters bookmarks to non-empty strings only
 * @param {Object} data - Validated import data envelope
 * @returns {Object} Sanitized { stats, bookmarks, streak }
 */
export const sanitizeImportData = (data) => {
  // Sanitize stats
  const rawStats = data.stats || {};
  const stats = {};
  for (const key of Object.keys(rawStats)) {
    if (DANGEROUS_KEYS.has(key)) continue;
    const entry = rawStats[key];
    if (!entry || typeof entry !== 'object') continue;
    const correct = isNonNegInt(entry.correct) ? entry.correct : 0;
    const incorrect = isNonNegInt(entry.incorrect) ? entry.incorrect : 0;
    // Skip entries with no data
    if (correct === 0 && incorrect === 0 && !entry.lastAttempt) continue;
    const sanitized = { correct, incorrect };
    if (entry.lastAttempt !== undefined && entry.lastAttempt !== null) {
      sanitized.lastAttempt = isValidPastDate(entry.lastAttempt)
        ? entry.lastAttempt
        : null;
    }
    // Only keep allowed keys
    for (const k of Object.keys(sanitized)) {
      if (!ALLOWED_STAT_KEYS.has(k)) delete sanitized[k];
    }
    stats[key] = sanitized;
  }

  // Sanitize bookmarks — non-empty strings only
  const rawBookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : [];
  const bookmarks = rawBookmarks.filter(
    (b) => typeof b === 'string' && b.length > 0
  );

  // Sanitize streak — construct a clean object from known fields only
  let streak = null;
  if (data.streak && typeof data.streak === 'object' && !Array.isArray(data.streak)) {
    const s = data.streak;
    streak = {
      currentStreak: isNonNegInt(s.currentStreak) ? s.currentStreak : 0,
      longestStreak: isNonNegInt(s.longestStreak) ? s.longestStreak : 0,
      lastPracticeDate: isValidPastDate(s.lastPracticeDate)
        ? s.lastPracticeDate
        : null,
    };
  }

  return { stats, bookmarks, streak };
};

/**
 * Apply imported data to storage.
 * Runs sanitization before writing to storage.
 * Returns the imported stats and bookmarks for in-memory state update.
 * @param {Object} data - Validated import data
 * @returns {{ stats: Object, bookmarks: Array, streak: Object|null }}
 */
export const applyImportData = (data) => {
  const { stats, bookmarks, streak } = sanitizeImportData(data);

  storage.saveStats(stats);
  storage.saveBookmarks(bookmarks);

  if (streak) {
    storage.setItem(storage.STORAGE_KEYS.STREAK, streak);
  } else {
    storage.removeItem(storage.STORAGE_KEYS.STREAK);
  }

  return { stats, bookmarks, streak };
};

export default {
  gatherExportData,
  downloadExport,
  validateImportData,
  readJsonFile,
  sanitizeImportData,
  applyImportData,
};
