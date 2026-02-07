import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useToast } from '../hooks/useToast';
import { useQuestionInteraction } from '../hooks/useQuestionInteraction';
import { calculateSessionAccuracy } from '../utils/calculations';
import Toast from '../components/Toast';
import QuestionRenderer from '../components/QuestionRenderer';
import './QuizScreen.css';

export default function QuizScreen() {
  const navigate = useNavigate();
  const {
    getWeightedRandomQuestion,
    recordAnswer,
    toggleBookmark,
    bookmarks,
    stats,
    multiModuleIds,
    stopMultiModuleQuiz,
    availableModules,
    selectedTopic,
  } = useQuiz();

  const isMultiModule = multiModuleIds && multiModuleIds.length > 0;

  const { toast, showInfo, showWarning, hideToast } = useToast();

  const {
    showResult,
    shuffledOptions,
    handleAnswerSelect,
    handleSubmit: submitAnswer,
    resetInteraction,
    getOptionClass,
  } = useQuestionInteraction(recordAnswer);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const actionsRef = useRef(null);

  // Auto-scroll to actions button after explanation appears
  useEffect(() => {
    if (showResult && actionsRef.current) {
      actionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showResult]);

  /**
   * Load next weighted random question
   * Uses functional state updates to avoid dependency on askedQuestions
   */
  const handleGoBack = useCallback(() => {
    if (isMultiModule) {
      stopMultiModuleQuiz();
      navigate(`/topics/${selectedTopic}`);
    } else {
      navigate('/home');
    }
  }, [isMultiModule, stopMultiModuleQuiz, navigate, selectedTopic]);

  const loadNextQuestion = useCallback(() => {
    setAskedQuestions(prevAsked => {
      const question = getWeightedRandomQuestion(prevAsked);
      if (!question) {
        showInfo('¡Has practicado todas las preguntas disponibles! Volviendo al inicio...', 4000);
        setTimeout(() => handleGoBack(), 1000);
        return prevAsked;
      }
      setCurrentQuestion(question);
      resetInteraction(question);
      return [...prevAsked, question.id];
    });
  }, [getWeightedRandomQuestion, handleGoBack, showInfo, resetInteraction]);

  // Load first question on mount only
  useEffect(() => {
    loadNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up multi-module state when leaving QuizScreen
  useEffect(() => {
    return () => {
      stopMultiModuleQuiz();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    const result = submitAnswer(currentQuestion, (isCorrect) => {
      setLastAnswerCorrect(isCorrect);
      setSessionStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1)
      }));
    });

    if (result === null) {
      showWarning('Por favor selecciona una respuesta');
    }
  };

  const handleNext = () => {
    loadNextQuestion();
  };

  const handleBookmark = () => {
    toggleBookmark(currentQuestion.id);
  };

  if (!currentQuestion) {
    return (
      <div className="container">
        <p>Cargando...</p>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(currentQuestion.id);
  const displayOptions = shuffledOptions || currentQuestion.options;
  const questionStats = stats[currentQuestion.id] || { correct: 0, incorrect: 0 };

  const multiModuleLabel = isMultiModule
    ? multiModuleIds
        .map((id) => {
          const mod = availableModules.find((m) => m.id === id);
          const match = mod?.name.match(/\d+/);
          return match ? match[0] : id;
        })
        .join(', ')
    : null;

  return (
    <div className="container quiz-container">
      {toast && <Toast {...toast} onClose={hideToast} />}
      <div className="content">
        {/* Multi-module indicator */}
        {isMultiModule && (
          <div className="multi-module-indicator">
            Modulos {multiModuleLabel}
          </div>
        )}

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
              {lastAnswerCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}
            </p>
            <p className="explanation-text">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="actions-container" ref={actionsRef}>
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

        {/* Session Stats */}
        <div className="session-stats">
          <div className="session-stat-item">
            <span className="session-stat-label">Sesión:</span>
            <span className="session-stat-value">
              {askedQuestions.length} preguntas
            </span>
          </div>
          {(sessionStats.correct > 0 || sessionStats.incorrect > 0) && (
            <>
              <div className="session-stat-item">
                <span className="session-stat-icon">✅</span>
                <span className="session-stat-value">{sessionStats.correct}</span>
              </div>
              <div className="session-stat-item">
                <span className="session-stat-icon">❌</span>
                <span className="session-stat-value">{sessionStats.incorrect}</span>
              </div>
              <div className="session-stat-item">
                <span className="session-stat-icon">🎯</span>
                <span className="session-stat-value">
                  {calculateSessionAccuracy(sessionStats)}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Back button */}
        <button className="back-button" onClick={handleGoBack}>
          ← {isMultiModule ? 'Volver a modulos' : 'Volver al inicio'}
        </button>
      </div>
    </div>
  );
}
