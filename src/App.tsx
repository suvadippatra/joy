/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Starfield } from './components/Starfield';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="cbt-theme">
        <div className="relative min-h-screen w-full flex flex-col">
          <Starfield />
          <HashRouter>
            <OfflineIndicator />
            <AnimatedRoutes />
          </HashRouter>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
