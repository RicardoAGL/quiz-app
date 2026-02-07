import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { getModuleProgress } from '../services/progressService';
import ProgressRing from '../components/ProgressRing';
import './MultiModuleSelectScreen.css';

function getModuleNumber(name) {
  const match = name.match(/\d+/);
  return match ? match[0] : '?';
}

export default function MultiModuleSelectScreen() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const {
    availableTopics,
    startMultiModuleQuiz,
    stats,
  } = useQuiz();

  const [selectedIds, setSelectedIds] = useState([]);

  const topic = availableTopics.find((t) => t.id === topicId);

  if (!topic) {
    return (
      <div className="multi-select-container">
        <div className="multi-select-content">
          <p>Tema no encontrado.</p>
          <button className="multi-select-back-btn" onClick={() => navigate('/topics')}>
            ← Volver a temas
          </button>
        </div>
      </div>
    );
  }

  const toggleModule = (moduleId) => {
    setSelectedIds((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === topic.modules.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(topic.modules.map((m) => m.id));
    }
  };

  const handleStart = () => {
    if (selectedIds.length < 2) return;
    startMultiModuleQuiz(selectedIds);
    navigate('/quiz');
  };

  const totalQuestions = topic.modules
    .filter((m) => selectedIds.includes(m.id))
    .reduce((sum, m) => sum + m.data.questions.length, 0);

  const allSelected = selectedIds.length === topic.modules.length;

  return (
    <div className="multi-select-container">
      <div className="multi-select-content">
        {/* Header */}
        <div className="multi-select-header">
          <button
            className="multi-select-back"
            onClick={() => navigate(`/topics/${topicId}`)}
            aria-label="Volver"
          >
            ←
          </button>
          <h1 className="multi-select-title">Practica Multi-Modulo</h1>
        </div>

        <p className="multi-select-subtitle">
          Selecciona 2 o mas modulos para practicar con preguntas combinadas
        </p>

        {/* Select all toggle */}
        <button className="multi-select-all-btn" onClick={selectAll}>
          {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>

        {/* Module cards grid */}
        <div className="multi-select-grid">
          {topic.modules.map((mod, index) => {
            const isSelected = selectedIds.includes(mod.id);
            const progress = getModuleProgress(mod.data.questions, stats);
            const number = getModuleNumber(mod.name);
            const accuracyNum = parseFloat(progress.accuracy);

            return (
              <button
                key={mod.id}
                className={`multi-select-card ${isSelected ? 'multi-select-card--selected' : ''}`}
                onClick={() => toggleModule(mod.id)}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="multi-select-card-check">
                  {isSelected ? '✓' : ''}
                </div>
                <div
                  className="multi-select-card-number"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${topic.color || '#667eea'}, color-mix(in srgb, ${topic.color || '#667eea'} 70%, #000))`
                      : '#bdc3c7',
                  }}
                >
                  {number}
                </div>
                <p className="multi-select-card-name">
                  {mod.name.replace(/^Modulo \d+:\s*/, '')}
                </p>
                <div className="multi-select-card-footer">
                  <span className="multi-select-card-count">
                    {mod.data.questions.length} preg.
                  </span>
                  <ProgressRing
                    size={32}
                    progress={accuracyNum}
                    strokeWidth={3}
                    color={isSelected ? (topic.color || '#667eea') : '#bdc3c7'}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary + Start button */}
        <div className="multi-select-footer">
          {selectedIds.length > 0 && (
            <p className="multi-select-summary">
              {selectedIds.length} {selectedIds.length === 1 ? 'modulo' : 'modulos'} · {totalQuestions} preguntas
            </p>
          )}
          <button
            className="multi-select-start-btn"
            onClick={handleStart}
            disabled={selectedIds.length < 2}
          >
            {selectedIds.length < 2
              ? `Selecciona al menos 2 modulos`
              : `Comenzar Practica`}
          </button>
        </div>
      </div>
    </div>
  );
}
