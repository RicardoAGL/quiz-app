import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import './HamburgerMenu.css';

/**
 * Breadcrumb Navigation Bar
 * Shows "Topic > Module" on module-scoped screens (home, statistics, sequential-mode).
 * Hidden on topic selection, module grid, quiz, review, and splash screens.
 */
export default function HamburgerMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { availableTopics, selectedTopic, availableModules, selectedModule } = useQuiz();

  // Only show on module-scoped screens
  const visiblePaths = ['/home', '/statistics', '/sequential-mode'];
  const isVisible = visiblePaths.some((p) => location.pathname === p);

  if (!isVisible) {
    return null;
  }

  const topic = availableTopics.find((t) => t.id === selectedTopic);
  const module = availableModules.find((m) => m.id === selectedModule);

  const topicName = topic ? topic.name : 'Temas';
  const moduleName = module ? module.name : '';

  return (
    <nav className="breadcrumb-nav" aria-label="Navegacion">
      <button
        className="breadcrumb-link"
        onClick={() => navigate('/topics')}
      >
        {topicName}
      </button>
      {moduleName && (
        <>
          <span className="breadcrumb-separator">›</span>
          <button
            className="breadcrumb-link"
            onClick={() => navigate(`/topics/${selectedTopic}`)}
          >
            {moduleName.replace(/^Modulo \d+:\s*/, 'M' + (moduleName.match(/\d+/) || [''])[0] + ': ')}
          </button>
        </>
      )}
    </nav>
  );
}
