const fs = require('fs');

const path = 'src/pages/SubjectView.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace activeCategory state
content = content.replace(
  "const [activeCategory, setActiveCategory] = useState<Category>('Kattar Tests');",
  "const [activeCategory, setActiveCategory] = useState<Category>(() => { const saved = sessionStorage.getItem(`activeCategory_${subjectParam}`); return (saved as Category) || 'Kattar Tests'; });\n  useEffect(() => { sessionStorage.setItem(`activeCategory_${subjectParam}`, activeCategory); }, [activeCategory, subjectParam]);\n  useEffect(() => { const scrollKey = `scrollPos_${subjectParam}_${activeCategory}`; const savedScroll = sessionStorage.getItem(scrollKey); const timeout = setTimeout(() => { if (savedScroll) window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' }); }, 50); const handleScroll = () => sessionStorage.setItem(scrollKey, window.scrollY.toString()); window.addEventListener('scroll', handleScroll, { passive: true }); return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(timeout); }; }, [subjectParam, activeCategory, displayTests.length]);"
);

// remove Footer import
content = content.replace("import Footer from '../components/Footer';\n", "");

// remove Footer tag
content = content.replace("      <Footer />\n", "");

fs.writeFileSync(path, content);
console.log('SubjectView updated');
