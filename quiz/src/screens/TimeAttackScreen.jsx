import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useToast } from '../hooks/useToast';
import { useQuestionInteraction } from '../hooks/useQuestionInteraction';
import { calculateSessionAccuracy } from '../utils/calculations';
import Toast from '../components/Toast';
import QuestionRenderer from '../components/QuestionRenderer';
import './TimeAttackScreen.css';

const DURATION_OPTIONS = [
  { minutes: 3, label: '3 min' },
  { minutes: 5, label: '5 min' },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function TimeAttackScreen() {
  const navigate = useNavigate();
  const {
    getWeightedRandomQuestion,
    recordAnswer,
    toggleBookmark,
    bookmarks,
    stats,
  } = useQuiz();

  const { toast, showWarning, hideToast } = useToast();

  const {
    showResult,
    shuffledOptions,
    handleAnswerSelect,
    handleSubmit: submitAnswer,
    resetInteraction,
    getOptionClass,
  } = useQuestionInteraction(recordAnswer);

  // Phase: 'setup' | 'playing' | 'results'
  const [phase, setPhase] = useState('setup');
  const [duration, setDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const timerRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const loadNextQuestion = useCallback(() => {
    setAskedQuestions((prevAsked) => {
      const question = getWeightedRandomQuestion(prevAsked);
      if (!question) {
        // All questions exhausted — end early
        if (timerRef.current) clearInterval(timerRef.current);
        setPhase('results');
        return prevAsked;
      }
      setCurrentQuestion(question);
      resetInteraction(question);
      return [...prevAsked, question.id];
    });
  }, [getWeightedRandomQuestion, resetInteraction]);

  const handleStart = (minutes) => {
    setDuration(minutes);
    setTimeLeft(minutes * 60);
    setSessionStats({ correct: 0, incorrect: 0 });
    setAskedQuestions([]);
    setPhase('playing');
  };

  // Load first question when playing starts
  useEffect(() => {
    if (phase === 'playing' && !currentQuestion) {
      loadNextQuestion();
    }
  }, [phase, currentQuestion, loadNextQuestion]);

  const handleSubmit = () => {
    const result = submitAnswer(currentQuestion, (isCorrect) => {
      setLastAnswerCorrect(isCorrect);
      setSessionStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      }));
    });

    if (result === null) {
      showWarning('Por favor selecciona una respuesta');
    }
  };

  const handleNext = () => {
    loadNextQuestion();
  };

  const handlePlayAgain = () => {
    setPhase('setup');
    setCurrentQuestion(null);
    setAskedQuestions([]);
    setSessionStats({ correct: 0, incorrect: 0 });
    setTimeLeft(0);
    setDuration(null);
  };

  const handleBookmark = () => {
    if (currentQuestion) toggleBookmark(currentQuestion.id);
  };

  const timerUrgent = timeLeft <= 30;
  const timerWarning = timeLeft <= 60 && timeLeft > 30;

  // --- SETUP PHASE ---
  if (phase === 'setup') {
    return (
      <div className="ta-container">
        <div className="ta-content">
          <div className="ta-setup">
            <h1 className="ta-setup-title">Contrarreloj</h1>
            <p className="ta-setup-subtitle">
              Responde tantas preguntas como puedas antes de que se acabe el tiempo
            </p>
            <div className="ta-duration-grid">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  className="ta-duration-btn"
                  onClick={() => handleStart(opt.minutes)}
                >
                  <span className="ta-duration-time">{opt.label}</span>
                  <span className="ta-duration-desc">{opt.minutes * 60} segundos</span>
                </button>
              ))}
            </div>
            <button className="ta-back-btn" onClick={() => navigate('/home')}>
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULTS PHASE ---
  if (phase === 'results') {
    const total = sessionStats.correct + sessionStats.incorrect;
    const accuracy = calculateSessionAccuracy(sessionStats, 1);

    return (
      <div className="ta-container">
        <div className="ta-content">
          <div className="ta-results">
            <h1 className="ta-results-title">Tiempo agotado</h1>
            <p className="ta-results-duration">{duration} minutos</p>

            <div className="ta-results-stats">
              <div className="ta-results-stat ta-results-stat--total">
                <span className="ta-results-stat-value">{total}</span>
                <span className="ta-results-stat-label">Preguntas</span>
              </div>
              <div className="ta-results-stat ta-results-stat--correct">
                <span className="ta-results-stat-value">{sessionStats.correct}</span>
                <span className="ta-results-stat-label">Correctas</span>
              </div>
              <div className="ta-results-stat ta-results-stat--incorrect">
                <span className="ta-results-stat-value">{sessionStats.incorrect}</span>
                <span className="ta-results-stat-label">Incorrectas</span>
              </div>
              <div className="ta-results-stat ta-results-stat--accuracy">
                <span className="ta-results-stat-value">{accuracy}%</span>
                <span className="ta-results-stat-label">Precisión</span>
              </div>
            </div>

            <div className="ta-results-actions">
              <button className="ta-play-again-btn" onClick={handlePlayAgain}>
                Intentar de nuevo
              </button>
              <button className="ta-back-btn" onClick={() => navigate('/home')}>
                ← Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- PLAYING PHASE ---
  if (!currentQuestion) {
    return (
      <div className="ta-container">
        <p>Cargando...</p>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(currentQuestion.id);
  const displayOptions = shuffledOptions || currentQuestion.options;
  const questionStats = stats[currentQuestion.id] || { correct: 0, incorrect: 0 };

  return (
    <div className="ta-container ta-playing">
      {toast && <Toast {...toast} onClose={hideToast} />}
      <div className="ta-content">
        {/* Timer bar */}
        <div className={`ta-timer ${timerUrgent ? 'ta-timer--urgent' : timerWarning ? 'ta-timer--warning' : ''}`}>
          <span className="ta-timer-text">{formatTime(timeLeft)}</span>
          <div className="ta-timer-stats">
            ✅ {sessionStats.correct} | ❌ {sessionStats.incorrect}
          </div>
        </div>

        {/* Header */}
        <div className="header">
          <div className="block-tag">
            <span className="block-text">{currentQuestion.block}</span>
          </div>
          <button onClick={handleBookmark} className="bookmark-button">
            <span className="bookmark-icon">{isBookmarked ? '⭐' : '☆'}</span>
          </button>
        </div>

        {/* Question Stats */}
        {(questionStats.correct > 0 || questionStats.incorrect > 0) && (
          <div className="question-stats">
            <p className="question-stats-text">
              ✅ {questionStats.correct} | ❌ {questionStats.incorrect}
            </p>
          </div>
        )}

        {/* Question */}
        <div className="question-card">
          <QuestionRenderer question={currentQuestion} />
        </div>

        {/* Options */}
        <div className="options-container">
          {displayOptions.map((option, index) => (
            <button
              key={index}
              className={getOptionClass(index, currentQuestion.correctAnswer)}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
            >
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className={`explanation-card ${lastAnswerCorrect ? 'correct-card' : 'incorrect-card'}`}>
            <p className="result-title">
              {lastAnswerCorrect ? '✅ Correcto' : '❌ Incorrecto'}
            </p>
            <p className="explanation-text">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="actions-container">
          {!showResult ? (
            <button className="submit-button" onClick={handleSubmit}>
              Validar Respuesta
            </button>
          ) : (
            <button className="next-button" onClick={handleNext}>
              Siguiente Pregunta →
            </button>
          )}
        </div>

        {/* Session counter */}
        <div className="session-stats">
          <div className="session-stat-item">
            <span className="session-stat-label">Preguntas:</span>
            <span className="session-stat-value">{askedQuestions.length}</span>
          </div>
          <div className="session-stat-item">
            <span className="session-stat-icon">🎯</span>
            <span className="session-stat-value">
              {calculateSessionAccuracy(sessionStats)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
