import type { PropsWithChildren } from 'react';
import { createContext, useContext, useState } from 'react';

export interface CounterContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  setCount: (count: number) => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const useCounter = () => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useCounter must be used within a CounterProvider');
  }
  return context;
};

export interface CounterProviderProps {}

export const CounterProvider = ({
  children,
}: PropsWithChildren<CounterProviderProps>) => {
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  return (
    <CounterContext.Provider value={{ count, increment, decrement, setCount }}>
      {children}
    </CounterContext.Provider>
  );
};
