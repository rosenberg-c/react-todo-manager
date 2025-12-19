import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import { Counter } from '@repo-feat/counter';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Counter.Provider>
      <App />
    </Counter.Provider>
  </StrictMode>
);
