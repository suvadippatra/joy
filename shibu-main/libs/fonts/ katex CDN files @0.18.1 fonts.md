
katex CDN files
jsDelivr monthly hits badge
katex@0.18.1 / dist / fonts
https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/fonts/

Must provide for full offline KaTeX math styling:

File	Where to put it	Get it from
libs/katex.min.css	libs/	https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css
libs/fonts/ (entire folder, ~50 woff2 files)	libs/fonts/	https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/fonts/ — download all files in that directory

Without the libs/fonts/ folder, KaTeX CSS loads but math symbols use CDN fonts. With it, math is fully offline. The CSS already points to fonts/ relative to itself, so as long as you put it at libs/fonts/, it works automatically.

What to change in code if you add these files:

index.html line 9: change back href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" → href="libs/katex.min.css" (only after you add the file + fonts folder)
index.html lines 16-21: the Google Fonts <link> tags can be removed (only after you add PlusJakartaSans-Variable.woff2)
