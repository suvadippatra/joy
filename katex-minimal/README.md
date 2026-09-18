# KaTeX Minimal Bundle - For Server-Side LaTeX Rendering

This is a minimal KaTeX bundle containing only essential files needed for rendering LaTeX expressions locally on your server.

## Contents

### Files Included:

1. **js/** - JavaScript files
   - `katex.min.js` - Minified KaTeX library (272 KB) - **Use this for production**
   - `katex.js` - Full unminified KaTeX library (620 KB) - For development/debugging

2. **css/** - Stylesheet files
   - `katex.min.css` - Minified stylesheet (24.8 KB) - **Use this for production**
   - `katex.css` - Full unminified stylesheet (33 KB) - For development

3. **fonts/** - Math fonts required for rendering
   - TTF, WOFF, and WOFF2 font formats for maximum compatibility
   - Includes all 14 KaTeX font families

## Setup Instructions

### For Web Server (Node.js/Express Example):

```javascript
const express = require('express');
const app = express();

// Serve static files (CSS, fonts)
app.use('/static', express.static('./path-to-this-folder'));

// Your route handler
app.get('/render-math', (req, res) => {
  const katex = require('./path-to-js/katex.min.js');
  const latex = req.query.latex || 'E=mc^2';
  
  try {
    const html = katex.renderToString(latex);
    res.json({ html });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### For HTML Page (Browser):

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Make sure to update the path to point to your hosted files -->
  <link rel="stylesheet" href="/static/css/katex.min.css">
</head>
<body>
  <div id="math"></div>

  <script src="/static/js/katex.min.js"></script>
  <script>
    // Render math to HTML
    const html = katex.renderToString("E=mc^2", {
      throwOnError: false
    });
    document.getElementById('math').innerHTML = html;
  </script>
</body>
</html>
```

## Font Configuration

The CSS file references fonts with relative paths. Make sure your server is configured to serve fonts from the `fonts/` directory. The recommended structure is:

```
your-project/
├── katex/
│   ├── css/
│   │   ├── katex.min.css
│   │   └── katex.css
│   ├── js/
│   │   ├── katex.min.js
│   │   └── katex.js
│   └── fonts/
│       ├── KaTeX_Main-Regular.woff2
│       ├── KaTeX_Main-Bold.woff2
│       └── ... (other font files)
```

Update the CSS @font-face paths if needed:

```css
@font-face {
  font-family: KaTeX_Main;
  src: url('/path/to/fonts/KaTeX_Main-Regular.woff2') format('woff2'),
       url('/path/to/fonts/KaTeX_Main-Regular.woff') format('woff'),
       url('/path/to/fonts/KaTeX_Main-Regular.ttf') format('truetype');
}
```

## Server-Side Rendering with Node.js

For full server-side rendering (SSR):

```bash
npm install katex
```

Then in your Node code:
```javascript
const katex = require('katex');

const html = katex.renderToString('E=mc^2', {
  throwOnError: false,
  displayMode: true
});
```

## Supported LaTeX

KaTeX supports most common LaTeX commands including:
- Equations and fractions: `\frac{a}{b}`
- Superscripts/subscripts: `x^2`, `x_i`
- Greek letters: `\alpha`, `\beta`, `\Omega`
- Math operators: `\sum`, `\int`, `\sqrt{x}`
- Matrices and arrays
- And much more!

## File Sizes

- **Production (minified):**
  - katex.min.js: 272 KB
  - katex.min.css: 24.8 KB
  - All fonts: ~1.2 MB
  - **Total: ~1.5 MB**

- **Development (unminified):**
  - katex.js: 620 KB
  - katex.css: 33 KB

## References

- [KaTeX Official Documentation](https://katex.org)
- [KaTeX GitHub Repository](https://github.com/KaTeX/KaTeX)

## Notes

- WOFF2 files are the most compact and should be used if browser support allows
- TTF files are included for broader compatibility
- The CSS file handles font-face declarations automatically
- No external dependencies required after build
- All content is self-contained for easy deployment
