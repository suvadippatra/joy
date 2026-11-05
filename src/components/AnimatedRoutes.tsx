import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import { PageTransition } from './PageTransition';

const SubjectView = lazy(() => import('../pages/SubjectView'));
const CBTViewer = lazy(() => import('../pages/CBTViewer'));
const CBTMaker = lazy(() => import('../pages/CBTMaker'));
const DocStudio = lazy(() => import('../pages/DocStudio'));
const QPMaker = lazy(() => import('../pages/QPMaker'));
const WeatherPage = lazy(() => import('../pages/WeatherPage'));
const Settings = lazy(() => import('../pages/Settings'));
const ReportsView = lazy(() => import('../pages/ReportsView'));
const RecentTestsView = lazy(() => import('../pages/RecentTestsView'));

function RouteLoader() {
  return (
    <div className="flex-1 min-h-[60vh] flex items-center justify-center p-6">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
        <span>Loading workspace...</span>
      </div>
    </div>
  );
}

export function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes location={location}>
        <Route path="/" element={<PageTransition key="home"><Home /></PageTransition>} />
        <Route path="/recent" element={<PageTransition key="recent"><RecentTestsView /></PageTransition>} />
        <Route path="/settings" element={<PageTransition key="settings"><Settings /></PageTransition>} />
        <Route path="/reports" element={<PageTransition key="reports"><ReportsView /></PageTransition>} />
        <Route path="/subject/:subject" element={<PageTransition key={location.pathname}><SubjectView /></PageTransition>} />
        <Route path="/test/:id" element={<PageTransition key={location.pathname}><CBTViewer /></PageTransition>} />
        <Route path="/maker" element={<PageTransition key="maker"><CBTMaker /></PageTransition>} />
        <Route path="/create" element={<PageTransition key="create"><CBTMaker /></PageTransition>} />
        <Route path="/qp-maker" element={<QPMaker />} />
        <Route path="/doc-studio" element={<DocStudio />} />
        <Route path="/notebook" element={<DocStudio />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/aakash" element={<WeatherPage />} />
        <Route path="*" element={<PageTransition key="fallback"><Home /></PageTransition>} />
      </Routes>
    </Suspense>
  );
}

