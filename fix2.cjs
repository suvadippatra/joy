const fs = require('fs');
let c = fs.readFileSync('src/pages/ReportsView.tsx', 'utf8');

c = c.replace("import Footer from '../components/Footer';\n", "");
c = c.replace("      <Footer />\n", "");

fs.writeFileSync('src/pages/ReportsView.tsx', c);
console.log('Fixed reports');
