const fs = require('fs');
let c = fs.readFileSync('src/pages/SubjectView.tsx', 'utf8');

c = c.replace(
  "  useEffect(() => { const scrollKey = `scrollPos_${subjectParam}_${activeCategory}`; const savedScroll = sessionStorage.getItem(scrollKey); const timeout = setTimeout(() => { if (savedScroll) window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' }); }, 50); const handleScroll = () => sessionStorage.setItem(scrollKey, window.scrollY.toString()); window.addEventListener('scroll', handleScroll, { passive: true }); return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(timeout); }; }, [subjectParam, activeCategory, displayTests.length]);",
  ""
);

c = c.replace(
  "  const displayTests = subjectTests.filter(t => t.category === activeCategory);",
  "  const displayTests = subjectTests.filter(t => t.category === activeCategory);\n\n  useEffect(() => { const scrollKey = `scrollPos_${subjectParam}_${activeCategory}`; const savedScroll = sessionStorage.getItem(scrollKey); const timeout = setTimeout(() => { if (savedScroll) window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' }); }, 50); const handleScroll = () => sessionStorage.setItem(scrollKey, window.scrollY.toString()); window.addEventListener('scroll', handleScroll, { passive: true }); return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(timeout); }; }, [subjectParam, activeCategory, displayTests.length]);"
);

fs.writeFileSync('src/pages/SubjectView.tsx', c);
console.log('Fixed initialization');
