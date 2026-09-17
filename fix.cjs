const fs = require('fs');
let c = fs.readFileSync('src/pages/SubjectView.tsx', 'utf8');

c = c.replace(
  "  const displayTests = subjectTests.filter(t => t.category === activeCategory);",
  ""
);

c = c.replace(
  "  const practiceCount = subjectTests.filter(t => t.category === 'Practice Sets').length;",
  "  const practiceCount = subjectTests.filter(t => t.category === 'Practice Sets').length;\n  const displayTests = subjectTests.filter(t => t.category === activeCategory);"
);

fs.writeFileSync('src/pages/SubjectView.tsx', c);
console.log('Fixed');
