import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { getModuleProgress } from '../services/progressService';
import ProgressRing from '../components/ProgressRing';
import './ModuleGridScreen.css';

/**
 * Extract the module number from module name (e.g., "Modulo 4: Renta Variable" -> "4")
 */
function getModuleNumber(name) {
  const match = name.match(/\d+/);
  return match ? match[0] : '?';
}

export default function ModuleGridScreen() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const {
    availableTopics,
    setSelectedModule,
    setSelectedTopic,
    stats,
  } = useQuiz();

  const topic = availableTopics.find((t) => t.id === topicId);

  // If topic not found, redirect to topics
  if (!topic) {
    return (
      <div className="module-grid-container">
        <div className="module-grid-content">
          <p>Tema no encontrado.</p>
          <button className="back-button" onClick={() => navigate('/topics')}>
            ← Volver a temas
          </button>
        </div>
      </div>
    );
  }

  const handleModuleSelect = (moduleId) => {
    setSelectedTopic(topicId);
    setSelectedModule(moduleId);
    navigate('/home');
  };

  return (
    <div className="module-grid-container">
      <div className="module-grid-content">
        {/* Header bar */}
        <div className="module-grid-header">
          <button
            className="module-grid-back"
            onClick={() => navigate('/topics')}
            aria-label="Volver a temas"
          >
            ←
          </button>
          <h1 className="module-grid-title">{topic.name}</h1>
          <button
            className="module-grid-dashboard"
            onClick={() => navigate(`/topics/${topicId}/dashboard`)}
            aria-label="Ver dashboard"
          >
            📊
          </button>
        </div>

        {/* Module grid */}
        <div className="module-cards-grid">
          {topic.modules.map((mod, index) => {
            const progress = getModuleProgress(mod.data.questions, stats);
            const number = getModuleNumber(mod.name);
            const accuracyNum = parseFloat(progress.accuracy);

            return (
              <button
                key={mod.id}
                className="module-card"
                onClick={() => handleModuleSelect(mod.id)}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div
                  className="module-card-number"
                  style={{ background: `linear-gradient(135deg, ${topic.color || '#667eea'}, color-mix(in srgb, ${topic.color || '#667eea'} 70%, #000))` }}
                >
                  {number}
                </div>
                <p className="module-card-name">{mod.name.replace(/^Modulo \d+:\s*/, '')}</p>
                <div className="module-card-footer">
                  <span className="module-card-count">
                    {mod.data.questions.length} preguntas
                  </span>
                  <ProgressRing
                    size={36}
                    progress={accuracyNum}
                    strokeWidth={3}
                    color={topic.color || '#667eea'}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
