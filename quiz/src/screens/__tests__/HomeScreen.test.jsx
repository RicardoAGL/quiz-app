import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
  it('should render without crashing', () => {
    renderWithProviders(<HomeScreen />);

    // Verify the app renders by checking for the title
    expect(screen.getByText('Visual Quiz')).toBeInTheDocument();
  });

  it('should display main navigation buttons', () => {
    renderWithProviders(<HomeScreen />);

    // Check for all primary navigation buttons
    expect(screen.getByText(/Práctica Aleatoria/i)).toBeInTheDocument();
    expect(screen.getByText(/Práctica en Orden/i)).toBeInTheDocument();
    expect(screen.getByText(/Repasar Fallos/i)).toBeInTheDocument();
    expect(screen.getByText(/Marcadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Estadísticas/i)).toBeInTheDocument();
  });

  it('should display progress section with "Tu Progreso" title', () => {
    renderWithProviders(<HomeScreen />);

    expect(screen.getByText('Tu Progreso')).toBeInTheDocument();
  });

  it('should display progress statistics labels', () => {
    renderWithProviders(<HomeScreen />);

    // Check for statistics labels
    expect(screen.getByText('Respondidas')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Precisión')).toBeInTheDocument();
  });

  it('should display info card with intelligent question prioritization message', () => {
    renderWithProviders(<HomeScreen />);

    expect(screen.getByText(/El sistema prioriza automáticamente/i)).toBeInTheDocument();
  });

  it('should display app logo', () => {
    renderWithProviders(<HomeScreen />);

    const logo = screen.getByAltText('Visual Quiz Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo.svg'));
  });

  it('should display button subtexts', () => {
    renderWithProviders(<HomeScreen />);

    // Check for descriptive subtexts
    expect(screen.getByText(/Preguntas aleatorias inteligentes/i)).toBeInTheDocument();
    expect(screen.getByText(/Todas o por bloque, tú eliges/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver tu rendimiento detallado/i)).toBeInTheDocument();
  });
});
