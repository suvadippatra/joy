import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Home from '../pages/Home';
import SubjectView from '../pages/SubjectView';
import CBTViewer from '../pages/CBTViewer';
import CBTMaker from '../pages/CBTMaker';
import Settings from '../pages/Settings';
import ReportsView from '../pages/ReportsView';
import RecentTestsView from '../pages/RecentTestsView';
import { PageTransition } from './PageTransition';

export function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname} className="w-full flex-1 flex flex-col">
        <Routes location={location}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/recent" element={<PageTransition><RecentTestsView /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/reports" element={<PageTransition><ReportsView /></PageTransition>} />
          <Route path="/subject/:subject" element={<PageTransition><SubjectView /></PageTransition>} />
          <Route path="/test/:id" element={<PageTransition><CBTViewer /></PageTransition>} />
          <Route path="/maker" element={<PageTransition><CBTMaker /></PageTransition>} />
          <Route path="/create" element={<PageTransition><CBTMaker /></PageTransition>} />
        </Routes>
      </div>
    </AnimatePresence>
  );
}
