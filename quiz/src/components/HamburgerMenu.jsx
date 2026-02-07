import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import './HamburgerMenu.css';

/**
 * Breadcrumb Navigation Bar with Dropdown Module Switcher
 * Shows "← Temas | M4: Renta Variable ▾" on module-scoped screens.
 * Dropdown lists all modules in current topic for quick switching.
 * Hidden on topic selection, module grid, quiz, review, and splash screens.
 */
export default function HamburgerMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    availableTopics,
    selectedTopic,
    availableModules,
    selectedModule,
    setSelectedModule,
  } = useQuiz();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Only show on module-scoped screens
  const visiblePaths = ['/home', '/statistics', '/sequential-mode'];
  const isVisible = visiblePaths.some((p) => location.pathname === p);

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  if (!isVisible) {
    return null;
  }

  const topic = availableTopics.find((t) => t.id === selectedTopic);
  const currentModule = availableModules.find((m) => m.id === selectedModule);
  const topicModules = topic ? topic.modules : [];

  // Build short label: "M4: Renta Variable"
  const getShortLabel = (mod) => {
    const num = mod.name.match(/\d+/);
    const shortName = mod.name.replace(/^Modulo \d+:\s*/, '');
    return `M${num ? num[0] : '?'}: ${shortName}`;
  };

  const currentLabel = currentModule ? getShortLabel(currentModule) : '';

  const handleModuleSwitch = (moduleId) => {
    setSelectedModule(moduleId);
    setDropdownOpen(false);
    navigate('/home');
  };

  return (
    <nav className="breadcrumb-nav" aria-label="Navegacion">
      <button
        className="breadcrumb-back"
        onClick={() => navigate('/topics')}
      >
        ← Temas
      </button>

      {currentLabel && (
        <>
          <span className="breadcrumb-divider">|</span>
          <div className="breadcrumb-dropdown-wrapper" ref={dropdownRef}>
            <button
              className="breadcrumb-module-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              {currentLabel} ▾
            </button>

            {dropdownOpen && (
              <div className="breadcrumb-dropdown" role="menu">
                {topicModules.map((mod) => {
                  const isActive = mod.id === selectedModule;
                  return (
                    <button
                      key={mod.id}
                      className={`breadcrumb-dropdown-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleModuleSwitch(mod.id)}
                      role="menuitem"
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {getShortLabel(mod)}
                    </button>
                  );
                })}
                <div className="breadcrumb-dropdown-divider" />
                <button
                  className="breadcrumb-dropdown-item breadcrumb-dropdown-footer"
                  role="menuitem"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/topics');
                  }}
                >
                  ← Cambiar tema
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
