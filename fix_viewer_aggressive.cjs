const fs = require('fs');
let c = fs.readFileSync('src/pages/CBTViewer.tsx', 'utf8');

c = c.replace(
  "||\\n\" +\n\"                                      (pageTextLower.includes('correct') && pageTextLower.includes('wrong') && pageTextLower.includes('score'))",
  ""
);

c = c.replace(
  "||\\n\" +\n\"                                      pageTextLower.includes('marks obtained')",
  ""
);

fs.writeFileSync('src/pages/CBTViewer.tsx', c);
console.log('Fixed CBTViewer aggressive detection');
