import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Home from '../pages/Home';
import SubjectView from '../pages/SubjectView';
import CBTViewer from '../pages/CBTViewer';
import CBTMaker from '../pages/CBTMaker';
import DocStudio from '../pages/DocStudio';
import Settings from '../pages/Settings';
import ReportsView from '../pages/ReportsView';
import RecentTestsView from '../pages/RecentTestsView';
import { PageTransition } from './PageTransition';

export function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location}>
        <Route path="/" element={<PageTransition key="home"><Home /></PageTransition>} />
        <Route path="/recent" element={<PageTransition key="recent"><RecentTestsView /></PageTransition>} />
        <Route path="/settings" element={<PageTransition key="settings"><Settings /></PageTransition>} />
        <Route path="/reports" element={<PageTransition key="reports"><ReportsView /></PageTransition>} />
        <Route path="/subject/:subject" element={<PageTransition key={location.pathname}><SubjectView /></PageTransition>} />
        <Route path="/test/:id" element={<PageTransition key={location.pathname}><CBTViewer /></PageTransition>} />
        <Route path="/maker" element={<PageTransition key="maker"><CBTMaker /></PageTransition>} />
        <Route path="/create" element={<PageTransition key="create"><CBTMaker /></PageTransition>} />
        <Route path="/doc-studio" element={<DocStudio />} />
        <Route path="/notebook" element={<DocStudio />} />
        <Route path="*" element={<PageTransition key="fallback"><Home /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
