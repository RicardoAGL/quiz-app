import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as storage from '../services/storage';
import './SplashScreen.css';

const AUTO_DISMISS_MS = 2000;

export default function SplashScreen() {
  const navigate = useNavigate();

  const dismiss = useCallback(() => {
    storage.setHasSeenSplash();
    navigate('/topics', { replace: true });
  }, [navigate]);

  // Auto-dismiss after timeout
  useEffect(() => {
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [dismiss]);

  // Tap or keypress to skip
  useEffect(() => {
    const handleKey = () => dismiss();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [dismiss]);

  return (
    <div className="splash-screen" onClick={dismiss} role="button" tabIndex={0}>
      <div className="splash-content">
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="Visual Quiz Logo"
          className="splash-logo"
        />
        <h1 className="splash-title">Visual Quiz</h1>
        <p className="splash-subtitle">Tu plataforma de aprendizaje</p>
      </div>
      <p className="splash-skip">Toca para continuar</p>
    </div>
  );
}
