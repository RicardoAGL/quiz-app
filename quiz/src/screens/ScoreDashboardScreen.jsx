import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { getModuleProgress, getTopicProgress } from '../services/progressService';
import { getStreak, recordActivity, getAccuracyTier, TIER_COLORS } from '../services/gamificationService';
import { getModuleMastery } from '../services/masteryService';
import ProgressRing from '../components/ProgressRing';
import AccuracyBadge from '../components/AccuracyBadge';
import './ScoreDashboardScreen.css';

export default function ScoreDashboardScreen() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { availableTopics, setSelectedModule, stats } = useQuiz();

  const topic = availableTopics.find((t) => t.id === topicId);

  // Record activity on mount
  useEffect(() => {
    recordActivity();
  }, []);

  if (!topic) {
    return (
      <div className="dashboard-container">
        <p>Tema no encontrado.</p>
        <button className="back-button" onClick={() => navigate('/topics')}>
          ← Volver a temas
        </button>
      </div>
    );
  }

  const topicProgress = getTopicProgress(topic.modules, stats);
  const accuracy = parseFloat(topicProgress.accuracy);
  const tier = getAccuracyTier(accuracy);
  const streak = getStreak();

  const handleModuleClick = (moduleId) => {
    setSelectedModule(moduleId);
    navigate('/statistics');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <button
            className="dashboard-back"
            onClick={() => navigate(`/topics/${topicId}`)}
            aria-label="Volver a modulos"
          >
            ←
          </button>
          <h1 className="dashboard-title">Dashboard</h1>
        </div>

        <div className="dashboard-layout">
          {/* Hero stats panel */}
          <div className="dashboard-hero">
            <div className="hero-ring-section">
              <ProgressRing
                size={120}
                progress={accuracy}
                strokeWidth={8}
                color={TIER_COLORS[tier]}
              />
              <p className="hero-ring-label">Precision Global</p>
            </div>

            <div className="hero-stats-grid">
              <div className="hero-stat-box">
                <span className="hero-stat-value">{topicProgress.answered}</span>
                <span className="hero-stat-label">Respondidas</span>
              </div>
              <div className="hero-stat-box">
                <span className="hero-stat-value">{topicProgress.total}</span>
                <span className="hero-stat-label">Total</span>
              </div>
              <div className="hero-stat-box">
                <span className="hero-stat-value">{topicProgress.completion}%</span>
                <span className="hero-stat-label">Completado</span>
              </div>
              <div className="hero-stat-box">
                <span className="hero-stat-value">{streak.currentStreak}</span>
                <span className="hero-stat-label">
                  {streak.currentStreak === 1 ? 'dia de racha' : 'dias de racha'}
                </span>
              </div>
            </div>
          </div>

          {/* Per-module cards */}
          <div className="dashboard-modules">
            <h2 className="dashboard-modules-title">Por Modulo</h2>
            <div className="dashboard-module-grid">
              {topic.modules.map((mod) => {
                const progress = getModuleProgress(mod.data.questions, stats);
                const mastery = getModuleMastery(mod.data.questions, stats);
                const modAccuracy = parseFloat(progress.accuracy);
                const modTier = getAccuracyTier(modAccuracy);

                return (
                  <button
                    key={mod.id}
                    className="dashboard-module-card"
                    onClick={() => handleModuleClick(mod.id)}
                  >
                    <div className="dashboard-module-card-top">
                      <ProgressRing
                        size={40}
                        progress={modAccuracy}
                        strokeWidth={3}
                        color={TIER_COLORS[modTier]}
                      />
                      <AccuracyBadge accuracy={modAccuracy} />
                    </div>
                    <p className="dashboard-module-name">{mod.name}</p>
                    <p className="dashboard-module-progress">
                      {progress.answered}/{progress.total} preguntas
                    </p>
                    {mastery.level.key !== 'none' && (
                      <span
                        className="dashboard-mastery-badge"
                        style={{ backgroundColor: mastery.level.color }}
                      >
                        {mastery.level.icon} {mastery.level.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
