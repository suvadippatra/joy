const fs = require('fs');
let c = fs.readFileSync('src/pages/CBTViewer.tsx', 'utf8');

c = c.replace(
  '<Header \n        title={test.title} \n        showBack \n        hideControls \n      />',
  `<Header 
        title={test.title} 
        showBack 
        hideControls 
        actions={
          <button 
            onClick={() => {
              if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'FORCE_CAPTURE' }, '*');
                alert('Capture signal sent! If results are on screen, they will be saved to your Reports.');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-semibold transition-colors border border-emerald-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Save Result
          </button>
        }
      />`
);

fs.writeFileSync('src/pages/CBTViewer.tsx', c);
console.log('Fixed CBTViewer header');
