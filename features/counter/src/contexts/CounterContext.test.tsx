import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CounterProvider, useCounter } from './CounterContext';

describe('CounterContext', () => {
  describe('useCounter', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useCounter());
      }).toThrow('useCounter must be used within a CounterProvider');
    });

    it('should return initial count of 0', () => {
      const { result } = renderHook(() => useCounter(), {
        wrapper: CounterProvider,
      });

      expect(result.current.count).toBe(0);
    });

    it('should increment count', () => {
      const { result } = renderHook(() => useCounter(), {
        wrapper: CounterProvider,
      });

      act(() => {
        result.current.increment();
      });

      expect(result.current.count).toBe(1);
    });

    it('should increment count multiple times', () => {
      const { result } = renderHook(() => useCounter(), {
        wrapper: CounterProvider,
      });

      act(() => {
        result.current.increment();
        result.current.increment();
        result.current.increment();
      });

      expect(result.current.count).toBe(3);
    });

    it('should decrement count', () => {
      const { result } = renderHook(() => useCounter(), {
        wrapper: CounterProvider,
      });

      act(() => {
        result.current.increment();
        result.current.increment();
        result.current.decrement();
      });

      expect(result.current.count).toBe(1);
    });

    it('should decrement below zero', () => {
      const { result } = renderHook(() => useCounter(), {
        wrapper: CounterProvider,
      });

      act(() => {
        result.current.decrement();
        result.current.decrement();
      });

      expect(result.current.count).toBe(-2);
    });

    it('should set count to specific value', () => {
      const { result } = renderHook(() => useCounter(), {
        wrapper: CounterProvider,
      });

      act(() => {
        result.current.setCount(42);
      });

      expect(result.current.count).toBe(42);
    });

    it('should handle increment after setCount', () => {
      const { result } = renderHook(() => useCounter(), {
        wrapper: CounterProvider,
      });

      act(() => {
        result.current.setCount(10);
        result.current.increment();
      });

      expect(result.current.count).toBe(11);
    });

    it('should handle decrement after setCount', () => {
      const { result } = renderHook(() => useCounter(), {
        wrapper: CounterProvider,
      });

      act(() => {
        result.current.setCount(10);
        result.current.decrement();
      });

      expect(result.current.count).toBe(9);
    });

    it('should have all required methods', () => {
      const { result } = renderHook(() => useCounter(), {
        wrapper: CounterProvider,
      });

      expect(result.current).toHaveProperty('count');
      expect(result.current).toHaveProperty('increment');
      expect(result.current).toHaveProperty('decrement');
      expect(result.current).toHaveProperty('setCount');
      expect(typeof result.current.increment).toBe('function');
      expect(typeof result.current.decrement).toBe('function');
      expect(typeof result.current.setCount).toBe('function');
    });
  });
});
