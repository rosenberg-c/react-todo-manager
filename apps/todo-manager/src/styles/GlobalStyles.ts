import { createGlobalStyle } from 'styled-components';

const colors = {
  textLight: 'rgba(255, 255, 255, 0.87)',
  backgroundDark: '#242424',
};

export const GlobalStyles = createGlobalStyle`
  :root {
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
    color: ${colors.textLight};
    background-color: ${colors.backgroundDark};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
  }

  #root {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
  }
`;
