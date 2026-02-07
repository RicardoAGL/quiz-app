import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useToast } from '../hooks/useToast';
import { useQuestionInteraction } from '../hooks/useQuestionInteraction';
import Toast from '../components/Toast';
import QuestionRenderer from '../components/QuestionRenderer';
import './ReviewScreen.css';

/**
 * Safely decode a URI component, returning the raw string on failure.
 * Prevents URIError crashes from malformed URL parameters.
 * @param {string} value - The URI-encoded string to decode
 * @returns {string} Decoded string or the original value if decoding fails
 */
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function ReviewScreen() {
  const navigate = useNavigate();
  const { mode, blockName } = useParams();
  const {
    questions,
    getIncorrectQuestions,
    getBookmarkedQuestions,
    getQuestionsByBlock,
    recordAnswer,
    toggleBookmark,
    bookmarks,
    stats,
  } = useQuiz();

  const { toast, showInfo, showWarning, showSuccess, hideToast } = useToast();

  const {
    showResult,
    shuffledOptions,
    handleAnswerSelect,
    handleSubmit: submitAnswer,
    resetInteraction,
    getOptionClass,
  } = useQuestionInteraction(recordAnswer);

  const isBookmarkedMode = mode === 'bookmarked';
  const isBlockMode = mode === 'block';
  const isSequentialMode = mode === 'sequential';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  /**
   * Snapshot the question list once during render using a ref.
   * This is computed once when questions are available and never changes,
   * preventing the list from shifting when stats/bookmarks update mid-review.
   */
  const questionsRef = useRef(null);
  if (questionsRef.current === null && questions.length > 0) {
    if (isSequentialMode) {
      questionsRef.current = [...questions];
    } else if (isBlockMode) {
      questionsRef.current = getQuestionsByBlock(safeDecode(blockName));
    } else if (isBookmarkedMode) {
      questionsRef.current = getBookmarkedQuestions();
    } else {
      questionsRef.current = getIncorrectQuestions();
    }
  }
  const questionsList = questionsRef.current || [];

  // Shuffle options for the first question once available
  const initialShuffleRef = useRef(false);
  useEffect(() => {
    if (!initialShuffleRef.current && questionsList.length > 0) {
      initialShuffleRef.current = true;
      resetInteraction(questionsList[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsList.length]);

  // Handle empty question list - redirect to home
  useEffect(() => {
    if (questions.length > 0 && questionsList.length === 0) {
      let message;
      if (isSequentialMode) {
        message = 'No hay preguntas disponibles';
      } else if (isBlockMode) {
        message = 'No se encontraron preguntas para este bloque';
      } else if (isBookmarkedMode) {
        message = 'No tienes preguntas marcadas';
      } else {
        message = 'No tienes preguntas falladas para repasar';
      }
      showInfo(`${message}. Volviendo al inicio...`, 3000);
      setTimeout(() => navigate('/home'), 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  const currentQuestion = questionsList[currentIndex];

  const handleSubmit = () => {
    const result = submitAnswer(currentQuestion, (isCorrect) => {
      setLastAnswerCorrect(isCorrect);
    });

    if (result === null) {
      showWarning('Por favor selecciona una respuesta');
    }
  };

  const handleNext = () => {
    if (currentIndex < questionsList.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      resetInteraction(questionsList[nextIndex]);
    } else {
      showSuccess(`¡Has completado la revisión de ${questionsList.length} preguntas!`, 3000);
      setTimeout(() => navigate('/home'), 1500);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      resetInteraction(questionsList[prevIndex]);
    }
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

  return (
    <div className="container review-container">
      {toast && <Toast {...toast} onClose={hideToast} />}
      <div className="content">
        {/* Header */}
        <div className="review-header">
          <div className="header-info">
            <p className="mode-text">
              {isSequentialMode
                ? '📋 Modo Secuencial'
                : isBlockMode
                ? `📘 ${safeDecode(blockName)}`
                : isBookmarkedMode
                ? '⭐ Marcadas'
                : '🔄 Repaso de Fallos'}
            </p>
            <p className="progress-text-review">
              {currentIndex + 1} / {questionsList.length}
            </p>
          </div>
          <button onClick={handleBookmark} className="bookmark-button">
            <span className="bookmark-icon">{isBookmarked ? '⭐' : '☆'}</span>
          </button>
        </div>

        {/* Block Tag */}
        <div className="block-tag-review">
          <span className="block-text">{currentQuestion.block}</span>
        </div>

        {/* Question Stats */}
        {(questionStats.correct > 0 || questionStats.incorrect > 0) && (
          <div className="question-stats">
            <p className="question-stats-text">
              Historial: ✅ {questionStats.correct} | ❌ {questionStats.incorrect}
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
        <div className="actions-container">
          {!showResult ? (
            <button className="submit-button" onClick={handleSubmit}>
              Validar Respuesta
            </button>
          ) : (
            <div className="navigation-buttons">
              <button
                className={`nav-button ${currentIndex === 0 ? 'disabled' : ''}`}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                ← Anterior
              </button>

              <button className="next-button-nav" onClick={handleNext}>
                {currentIndex < questionsList.length - 1 ? 'Siguiente →' : 'Finalizar'}
              </button>
            </div>
          )}
        </div>

        {/* Back button */}
        <button className="back-button" onClick={() => navigate('/home')}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}
