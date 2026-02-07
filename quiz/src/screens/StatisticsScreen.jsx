import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useToast } from '../hooks/useToast';
import { calculateAccuracyString } from '../utils/calculations';
import Toast from '../components/Toast';
import './StatisticsScreen.css';

export default function StatisticsScreen() {
  const navigate = useNavigate();
  const { questions, stats, resetStats, getGlobalStats, exportProgress, importProgress } = useQuiz();
  const { toast, showWarning, showInfo, hideToast } = useToast();
  const fileInputRef = useRef(null);

  const globalStats = getGlobalStats();

  // Calcular estadísticas por bloque
  const blockStats = {};
  questions.forEach(q => {
    if (!blockStats[q.block]) {
      blockStats[q.block] = {
        total: 0,
        answered: 0,
        correct: 0,
        incorrect: 0,
      };
    }

    blockStats[q.block].total += 1;

    const questionStats = stats[q.id];
    if (questionStats) {
      blockStats[q.block].answered += 1;
      blockStats[q.block].correct += questionStats.correct;
      blockStats[q.block].incorrect += questionStats.incorrect;
    }
  });

  const handleExport = () => {
    exportProgress();
    showInfo('Progreso exportado correctamente', 2000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const confirmed = window.confirm(
      'Importar reemplazará todo tu progreso actual. ¿Deseas continuar?'
    );
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    try {
      await importProgress(file);
      showInfo('Progreso importado correctamente', 2000);
    } catch (err) {
      showWarning(err.message || 'Error al importar el archivo', 3000);
    }
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    showWarning(
      '¿Estás seguro de que quieres resetear todas las estadísticas? Haz clic de nuevo en 3 segundos para confirmar.',
      3000
    );
    setTimeout(() => {
      const confirmReset = window.confirm('¿Confirmas el reseteo de todas las estadísticas?');
      if (confirmReset) {
        resetStats();
      }
    }, 100);
  };

  return (
    <div className="container stats-container">
      {toast && <Toast {...toast} onClose={hideToast} />}
      <div className="content">
        <h1 className="stats-title">Estadísticas</h1>

        {/* Dashboard Layout */}
        <div className="stats-dashboard">
          {/* Left Panel - Global Stats */}
          <div className="stats-left-panel">
            <div className="card global-stats-card">
              <h2 className="card-title">Resumen Global</h2>

              <div className="global-stat-item">
                <span className="stat-icon-large">📊</span>
                <div className="stat-details">
                  <p className="stat-value-large">{globalStats.answeredQuestions}/{globalStats.totalQuestions}</p>
                  <p className="stat-label-small">Respondidas</p>
                </div>
              </div>

              <div className="global-stat-item">
                <span className="stat-icon-large">✅</span>
                <div className="stat-details">
                  <p className="stat-value-large success">{globalStats.totalCorrect}</p>
                  <p className="stat-label-small">Correctas</p>
                </div>
              </div>

              <div className="global-stat-item">
                <span className="stat-icon-large">❌</span>
                <div className="stat-details">
                  <p className="stat-value-large error">{globalStats.totalIncorrect}</p>
                  <p className="stat-label-small">Incorrectas</p>
                </div>
              </div>

              <div className="global-stat-item highlight">
                <span className="stat-icon-large">🎯</span>
                <div className="stat-details">
                  <p className="stat-value-large accuracy">{globalStats.accuracy}%</p>
                  <p className="stat-label-small">Precisión</p>
                </div>
              </div>

              <div className="global-stat-item">
                <span className="stat-icon-large">🔢</span>
                <div className="stat-details">
                  <p className="stat-value-large">{globalStats.totalAttempts}</p>
                  <p className="stat-label-small">Total Intentos</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="export-import-row">
              <button className="export-btn" onClick={handleExport}>
                Exportar progreso
              </button>
              <button className="import-btn" onClick={() => fileInputRef.current?.click()}>
                Importar progreso
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </div>
            <button className="reset-button" onClick={handleReset}>
              🔄 Resetear Estadísticas
            </button>
            <button className="back-button" onClick={() => navigate('/home')}>
              ← Volver al inicio
            </button>
          </div>

          {/* Right Panel - Block Stats */}
          <div className="stats-right-panel">
            <h2 className="panel-title">Bloques</h2>
            <div className="blocks-grid">
              {Object.entries(blockStats).map(([block, blockData]) => {
                const totalAttempts = blockData.correct + blockData.incorrect;
                const accuracy = calculateAccuracyString(blockData.correct, blockData.incorrect, 1);

                return (
                  <div
                    key={block}
                    className="block-card clickable"
                    onClick={() => navigate(`/review/block/${encodeURIComponent(block)}`)}
                  >
                    <h3 className="block-card-name">📘 {block}</h3>
                    <div className="block-card-progress">
                      <div className="progress-bar-large">
                        <div
                          className="progress-fill-large"
                          style={{ width: accuracy }}
                        ></div>
                      </div>
                      <p className="block-percentage">{accuracy}</p>
                    </div>
                    <div className="block-card-stats">
                      <span>{blockData.answered}/{blockData.total} respondidas</span>
                      <span>•</span>
                      <span>{totalAttempts} intentos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
