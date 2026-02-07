import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QuizProvider } from '../../context/QuizContext';
import MultiModuleSelectScreen from '../MultiModuleSelectScreen';

function renderSimple() {
  // Push the right URL first
  window.history.pushState({}, '', '/topics/economia/multi-quiz');

  return render(
    <QuizProvider>
      <MemoryRouter initialEntries={['/topics/economia/multi-quiz']}>
        <Routes>
          <Route path="/topics/:topicId/multi-quiz" element={<MultiModuleSelectScreen />} />
          <Route path="/topics/:topicId" element={<div>Module Grid</div>} />
          <Route path="/quiz" element={<div>Quiz Screen</div>} />
        </Routes>
      </MemoryRouter>
    </QuizProvider>
  );
}

describe('MultiModuleSelectScreen', () => {
  it('should render the screen title', () => {
    renderSimple();
    expect(screen.getByText('Practica Multi-Modulo')).toBeInTheDocument();
  });

  it('should render the subtitle instruction', () => {
    renderSimple();
    expect(screen.getByText(/Selecciona 2 o mas modulos/i)).toBeInTheDocument();
  });

  it('should render module cards for all modules', () => {
    renderSimple();
    // There are 9 modules in the config
    const cards = screen.getAllByRole('button').filter(
      (btn) => btn.classList.contains('multi-select-card')
    );
    expect(cards.length).toBe(9);
  });

  it('should render "Seleccionar todos" button', () => {
    renderSimple();
    expect(screen.getByText('Seleccionar todos')).toBeInTheDocument();
  });

  it('should start with the start button disabled', () => {
    renderSimple();
    const startBtn = screen.getByText(/Selecciona al menos 2 modulos/i);
    expect(startBtn.closest('button')).toBeDisabled();
  });

  it('should enable start button when 2+ modules are selected', () => {
    renderSimple();
    const cards = screen.getAllByRole('button').filter(
      (btn) => btn.classList.contains('multi-select-card')
    );

    // Click first two modules
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);

    const startBtn = screen.getByText('Comenzar Practica');
    expect(startBtn.closest('button')).not.toBeDisabled();
  });

  it('should toggle module selection on click', () => {
    renderSimple();
    const cards = screen.getAllByRole('button').filter(
      (btn) => btn.classList.contains('multi-select-card')
    );

    // Click to select
    fireEvent.click(cards[0]);
    expect(cards[0]).toHaveClass('multi-select-card--selected');

    // Click to deselect
    fireEvent.click(cards[0]);
    expect(cards[0]).not.toHaveClass('multi-select-card--selected');
  });

  it('should show question count summary when modules are selected', () => {
    renderSimple();
    const cards = screen.getAllByRole('button').filter(
      (btn) => btn.classList.contains('multi-select-card')
    );

    fireEvent.click(cards[0]);
    // Should show "1 modulo · X preguntas"
    expect(screen.getByText(/1 modulo/)).toBeInTheDocument();
  });

  it('should select all modules when "Seleccionar todos" is clicked', () => {
    renderSimple();
    const selectAllBtn = screen.getByText('Seleccionar todos');
    fireEvent.click(selectAllBtn);

    const cards = screen.getAllByRole('button').filter(
      (btn) => btn.classList.contains('multi-select-card')
    );

    // All cards should have the selected class
    cards.forEach((card) => {
      expect(card).toHaveClass('multi-select-card--selected');
    });

    // Button text should change to deselect
    expect(screen.getByText('Deseleccionar todos')).toBeInTheDocument();
  });

  it('should deselect all when "Deseleccionar todos" is clicked', () => {
    renderSimple();

    // First select all
    const selectAllBtn = screen.getByText('Seleccionar todos');
    fireEvent.click(selectAllBtn);

    // Then deselect all
    const deselectAllBtn = screen.getByText('Deseleccionar todos');
    fireEvent.click(deselectAllBtn);

    const cards = screen.getAllByRole('button').filter(
      (btn) => btn.classList.contains('multi-select-card')
    );
    cards.forEach((card) => {
      expect(card).not.toHaveClass('multi-select-card--selected');
    });
  });

  it('should render back button', () => {
    renderSimple();
    const backBtn = screen.getByLabelText('Volver');
    expect(backBtn).toBeInTheDocument();
  });
});
