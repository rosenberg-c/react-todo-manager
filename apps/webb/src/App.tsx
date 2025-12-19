import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

import { Button } from '@repo-pak/components';
import { Counter } from '@repo-feat/counter';

import './App.css';

function App() {
  const { count, increment } = Counter.useCounter();

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Button.Primary onClick={increment}>count is {count}</Button.Primary>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

// eslint-disable-next-line import/no-default-export
export default App;
