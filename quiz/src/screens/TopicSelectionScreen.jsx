import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { getTopicProgress } from '../services/progressService';
import ProgressRing from '../components/ProgressRing';
import './TopicSelectionScreen.css';

export default function TopicSelectionScreen() {
  const navigate = useNavigate();
  const { availableTopics, setSelectedTopic, stats } = useQuiz();

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId);
    navigate(`/topics/${topicId}`);
  };

  return (
    <div className="topic-selection-container">
      <div className="topic-selection-content">
        <div className="topic-header">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Visual Quiz Logo"
            className="topic-logo"
          />
          <h1 className="topic-title">Visual Quiz</h1>
          <p className="topic-subtitle">Elige tu tema de estudio</p>
        </div>

        <div className={`topic-grid ${availableTopics.length === 1 ? 'single-topic' : ''}`}>
          {availableTopics.map((topic) => {
            const progress = getTopicProgress(topic.modules, stats);
            return (
              <button
                key={topic.id}
                className="topic-card"
                onClick={() => handleTopicSelect(topic.id)}
                style={{ '--topic-color': topic.color || '#667eea' }}
              >
                <div className="topic-card-gradient">
                  <span className="topic-card-icon">
                    {topic.icon === 'chart-line' ? '📈' : '📚'}
                  </span>
                </div>
                <div className="topic-card-body">
                  <h2 className="topic-card-name">{topic.name}</h2>
                  {topic.description && (
                    <p className="topic-card-description">{topic.description}</p>
                  )}
                  <div className="topic-card-meta">
                    <span className="topic-card-modules">
                      {topic.modules.length} {topic.modules.length === 1 ? 'modulo' : 'modulos'}
                    </span>
                    <ProgressRing
                      size={40}
                      progress={parseFloat(progress.accuracy)}
                      strokeWidth={3}
                      color={topic.color || '#667eea'}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {availableTopics.length === 1 && (
          <p className="coming-soon-note">Mas temas proximamente</p>
        )}
      </div>
    </div>
  );
}
