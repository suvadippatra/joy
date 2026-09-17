const fs = require('fs');
let c = fs.readFileSync('src/pages/CBTViewer.tsx', 'utf8');

const regex = /const isResultPage = force \|\|[\s\S]*?;/;
const newCode = `const isResultPage = force || 
                                      (gateway && !gateway.classList.contains('hidden')) || 
                                      pageTextLower.includes('total score') || 
                                      pageTextLower.includes('test summary') ||
                                      pageTextLower.includes('test result');`;

c = c.replace(regex, newCode);
fs.writeFileSync('src/pages/CBTViewer.tsx', c);
console.log('Fixed CBTViewer aggressive detection');
