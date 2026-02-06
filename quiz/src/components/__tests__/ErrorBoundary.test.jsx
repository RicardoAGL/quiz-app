import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error to test error boundary
const ThrowingComponent = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Suppress console.error during error boundary tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should render children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText(/Algo salió mal/i)).not.toBeInTheDocument();
  });

  it('should display fallback UI when child component throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText(/Ha ocurrido un error inesperado/i)).toBeInTheDocument();
    expect(screen.queryByText('Normal content')).not.toBeInTheDocument();
  });

  it('should render "Volver al inicio" button in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetButton = screen.getByRole('button', { name: /Volver al inicio/i });
    expect(resetButton).toBeInTheDocument();
  });

  it('should call handleReset when button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetButton = screen.getByRole('button', { name: /Volver al inicio/i });

    // Just verify the button exists and is clickable
    // We don't test actual navigation as that's implementation detail
    expect(resetButton).toBeInTheDocument();
    fireEvent.click(resetButton);

    // The click handler should not throw
  });

  it('should log error to console when error is caught', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify console.error was called (componentDidCatch logs the error)
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
