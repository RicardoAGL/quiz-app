import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  describe('initial state', () => {
    it('should initialize with null toast', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toast).toBeNull();
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.showToast).toBe('function');
      expect(typeof result.current.showInfo).toBe('function');
      expect(typeof result.current.showSuccess).toBe('function');
      expect(typeof result.current.showWarning).toBe('function');
      expect(typeof result.current.showError).toBe('function');
      expect(typeof result.current.hideToast).toBe('function');
    });
  });

  describe('showToast', () => {
    it('should set toast with message and default type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.toast).toEqual({
        message: 'Test message',
        type: 'info',
        duration: 3000,
      });
    });

    it('should set toast with custom type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Success message', 'success');
      });

      expect(result.current.toast).toEqual({
        message: 'Success message',
        type: 'success',
        duration: 3000,
      });
    });

    it('should set toast with custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Custom duration', 'warning', 5000);
      });

      expect(result.current.toast).toEqual({
        message: 'Custom duration',
        type: 'warning',
        duration: 5000,
      });
    });

    it('should override previous toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('First toast');
      });

      expect(result.current.toast.message).toBe('First toast');

      act(() => {
        result.current.showToast('Second toast', 'error');
      });

      expect(result.current.toast).toEqual({
        message: 'Second toast',
        type: 'error',
        duration: 3000,
      });
    });

    it('should use default duration of 3000ms when not specified', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Message', 'info');
      });

      expect(result.current.toast.duration).toBe(3000);
    });
  });

  describe('showInfo', () => {
    it('should show info toast with default duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showInfo('Info message');
      });

      expect(result.current.toast).toEqual({
        message: 'Info message',
        type: 'info',
        duration: 3000,
      });
    });

    it('should show info toast with custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showInfo('Info message', 2000);
      });

      expect(result.current.toast).toEqual({
        message: 'Info message',
        type: 'info',
        duration: 2000,
      });
    });
  });

  describe('showSuccess', () => {
    it('should show success toast with default duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Success message');
      });

      expect(result.current.toast).toEqual({
        message: 'Success message',
        type: 'success',
        duration: 3000,
      });
    });

    it('should show success toast with custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Success message', 4000);
      });

      expect(result.current.toast).toEqual({
        message: 'Success message',
        type: 'success',
        duration: 4000,
      });
    });
  });

  describe('showWarning', () => {
    it('should show warning toast with default duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showWarning('Warning message');
      });

      expect(result.current.toast).toEqual({
        message: 'Warning message',
        type: 'warning',
        duration: 3000,
      });
    });

    it('should show warning toast with custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showWarning('Warning message', 6000);
      });

      expect(result.current.toast).toEqual({
        message: 'Warning message',
        type: 'warning',
        duration: 6000,
      });
    });
  });

  describe('showError', () => {
    it('should show error toast with default duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showError('Error message');
      });

      expect(result.current.toast).toEqual({
        message: 'Error message',
        type: 'error',
        duration: 3000,
      });
    });

    it('should show error toast with custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showError('Error message', 10000);
      });

      expect(result.current.toast).toEqual({
        message: 'Error message',
        type: 'error',
        duration: 10000,
      });
    });
  });

  describe('hideToast', () => {
    it('should clear toast state', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.toast).not.toBeNull();

      act(() => {
        result.current.hideToast();
      });

      expect(result.current.toast).toBeNull();
    });

    it('should be safe to call when toast is already null', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toast).toBeNull();

      act(() => {
        result.current.hideToast();
      });

      expect(result.current.toast).toBeNull();
    });

    it('should clear toast after showing multiple types', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Success');
      });
      act(() => {
        result.current.showError('Error');
      });
      act(() => {
        result.current.hideToast();
      });

      expect(result.current.toast).toBeNull();
    });
  });

  describe('toast type variants', () => {
    it('should correctly set all toast types', () => {
      const { result } = renderHook(() => useToast());

      const types = [
        { fn: 'showInfo', expectedType: 'info' },
        { fn: 'showSuccess', expectedType: 'success' },
        { fn: 'showWarning', expectedType: 'warning' },
        { fn: 'showError', expectedType: 'error' },
      ];

      types.forEach(({ fn, expectedType }) => {
        act(() => {
          result.current[fn]('Test message');
        });

        expect(result.current.toast.type).toBe(expectedType);
      });
    });
  });

  describe('function stability', () => {
    it('should maintain function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useToast());

      const initialFunctions = {
        showToast: result.current.showToast,
        showInfo: result.current.showInfo,
        showSuccess: result.current.showSuccess,
        showWarning: result.current.showWarning,
        showError: result.current.showError,
        hideToast: result.current.hideToast,
      };

      // Trigger re-render by showing a toast
      act(() => {
        result.current.showToast('Test');
      });

      rerender();

      // Functions should maintain their references (useCallback)
      expect(result.current.showToast).toBe(initialFunctions.showToast);
      expect(result.current.showInfo).toBe(initialFunctions.showInfo);
      expect(result.current.showSuccess).toBe(initialFunctions.showSuccess);
      expect(result.current.showWarning).toBe(initialFunctions.showWarning);
      expect(result.current.showError).toBe(initialFunctions.showError);
      expect(result.current.hideToast).toBe(initialFunctions.hideToast);
    });
  });

  describe('edge cases', () => {
    it('should handle empty message string', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('');
      });

      expect(result.current.toast.message).toBe('');
    });

    it('should handle very long messages', () => {
      const { result } = renderHook(() => useToast());
      const longMessage = 'A'.repeat(1000);

      act(() => {
        result.current.showToast(longMessage);
      });

      expect(result.current.toast.message).toBe(longMessage);
    });

    it('should handle duration of 0', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Message', 'info', 0);
      });

      expect(result.current.toast.duration).toBe(0);
    });

    it('should handle negative duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Message', 'info', -100);
      });

      expect(result.current.toast.duration).toBe(-100);
    });

    it('should handle undefined duration in convenience methods', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showInfo('Message', undefined);
      });

      expect(result.current.toast.duration).toBe(3000);
    });
  });
});
