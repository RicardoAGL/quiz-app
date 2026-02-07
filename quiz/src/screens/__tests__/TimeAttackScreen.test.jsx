import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QuizProvider } from '../../context/QuizContext';
import TimeAttackScreen from '../TimeAttackScreen';

function renderTimeAttack() {
  return render(
    <QuizProvider>
      <MemoryRouter initialEntries={['/time-attack']}>
        <Routes>
          <Route path="/time-attack" element={<TimeAttackScreen />} />
          <Route path="/home" element={<div>Home Screen</div>} />
        </Routes>
      </MemoryRouter>
    </QuizProvider>
  );
}

describe('TimeAttackScreen', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Setup Phase', () => {
    it('should render the setup screen title', () => {
      renderTimeAttack();
      expect(screen.getByText('Contrarreloj')).toBeInTheDocument();
    });

    it('should render duration description', () => {
      renderTimeAttack();
      expect(screen.getByText(/Responde tantas preguntas/i)).toBeInTheDocument();
    });

    it('should render 3 min and 5 min duration buttons', () => {
      renderTimeAttack();
      expect(screen.getByText('3 min')).toBeInTheDocument();
      expect(screen.getByText('5 min')).toBeInTheDocument();
    });

    it('should render back button', () => {
      renderTimeAttack();
      expect(screen.getByText(/Volver al inicio/i)).toBeInTheDocument();
    });
  });

  describe('Playing Phase', () => {
    it('should start quiz when 3 min is selected', () => {
      vi.useFakeTimers();
      renderTimeAttack();

      const btn3 = screen.getByText('3 min');
      act(() => {
        fireEvent.click(btn3);
      });

      // Timer should show 3:00
      expect(screen.getByText('3:00')).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('should start quiz when 5 min is selected', () => {
      vi.useFakeTimers();
      renderTimeAttack();

      const btn5 = screen.getByText('5 min');
      act(() => {
        fireEvent.click(btn5);
      });

      // Timer should show 5:00
      expect(screen.getByText('5:00')).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('should show a question after starting', () => {
      vi.useFakeTimers();
      renderTimeAttack();

      act(() => {
        fireEvent.click(screen.getByText('3 min'));
      });

      // Should render Validar Respuesta button (quiz is active)
      expect(screen.getByText('Validar Respuesta')).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('should decrement timer each second', () => {
      vi.useFakeTimers();
      renderTimeAttack();

      act(() => {
        fireEvent.click(screen.getByText('3 min'));
      });

      expect(screen.getByText('3:00')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('2:59')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('2:58')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should show results when timer reaches zero', () => {
      vi.useFakeTimers();
      renderTimeAttack();

      act(() => {
        fireEvent.click(screen.getByText('3 min'));
      });

      // Advance 3 full minutes
      act(() => {
        vi.advanceTimersByTime(180000);
      });

      // Should show results
      expect(screen.getByText('Tiempo agotado')).toBeInTheDocument();
      expect(screen.getByText('3 minutos')).toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('Results Phase', () => {
    it('should show play again button after time expires', () => {
      vi.useFakeTimers();
      renderTimeAttack();

      act(() => {
        fireEvent.click(screen.getByText('3 min'));
      });

      act(() => {
        vi.advanceTimersByTime(180000);
      });

      expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('should show accuracy in results', () => {
      vi.useFakeTimers();
      renderTimeAttack();

      act(() => {
        fireEvent.click(screen.getByText('3 min'));
      });

      act(() => {
        vi.advanceTimersByTime(180000);
      });

      expect(screen.getByText('Precisión')).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('should return to setup when play again is clicked', () => {
      vi.useFakeTimers();
      renderTimeAttack();

      act(() => {
        fireEvent.click(screen.getByText('3 min'));
      });

      act(() => {
        vi.advanceTimersByTime(180000);
      });

      act(() => {
        fireEvent.click(screen.getByText('Intentar de nuevo'));
      });

      // Should be back in setup
      expect(screen.getByText('Contrarreloj')).toBeInTheDocument();
      expect(screen.getByText('3 min')).toBeInTheDocument();
      vi.useRealTimers();
    });
  });
});
