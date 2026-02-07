/**
 * Export/Import Service
 * Handles backup and restore of user progress data as JSON files.
 */

import * as storage from './storage';

const EXPORT_VERSION = 1;

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
 * Apply imported data to storage.
 * Returns the imported stats and bookmarks for in-memory state update.
 * @param {Object} data - Validated import data
 * @returns {{ stats: Object, bookmarks: Array, streak: Object|null }}
 */
export const applyImportData = (data) => {
  const stats = data.stats || {};
  const bookmarks = data.bookmarks || [];
  const streak = data.streak || null;

  storage.saveStats(stats);
  storage.saveBookmarks(bookmarks);

  if (streak) {
    storage.setItem(storage.STORAGE_KEYS.STREAK, streak);
  }

  return { stats, bookmarks, streak };
};

export default {
  gatherExportData,
  downloadExport,
  validateImportData,
  readJsonFile,
  applyImportData,
};
