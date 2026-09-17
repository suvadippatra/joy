import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Home from '../pages/Home';
import SubjectView from '../pages/SubjectView';
import CBTViewer from '../pages/CBTViewer';
import Settings from '../pages/Settings';
import { PageTransition } from './PageTransition';

export function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/subject/:subject" element={<PageTransition><SubjectView /></PageTransition>} />
        <Route path="/test/:id" element={<PageTransition><CBTViewer /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
