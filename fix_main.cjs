const fs = require('fs');

const code = `import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Always force the application to start on the Home page (main landing page) upon refresh/load.
// This also cleans up any malformed GitHub Pages URLs.
(function() {
  const path = window.location.pathname;
  const match = path.match(/(\\/subject\\/.*|\\/test\\/.*|\\/reports|\\/recent|\\/settings)$/);
  let base = path;
  if (match) {
    base = path.slice(0, path.length - match[1].length);
  }
  
  // Clean the URL bar to remove trailing garbage from GitHub Pages 404 redirects
  if (base !== path) {
    window.history.replaceState(null, '', base + window.location.search);
  }
  
  // Force hash to empty so HashRouter defaults to '/' (Home page)
  if (window.location.hash) {
    window.location.hash = '';
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

fs.writeFileSync('src/main.tsx', code);
console.log('Fixed main.tsx');
