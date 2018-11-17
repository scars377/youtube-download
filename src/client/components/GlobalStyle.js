import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    background: #121212;
    color: #fff;
    font-family: Roboto, Arial;
    font-size: 14px;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default GlobalStyle;
