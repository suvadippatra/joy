/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Starfield } from './components/Starfield';
import { AnimatedRoutes } from './components/AnimatedRoutes';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="cbt-theme">
      <div className="relative min-h-screen w-full flex flex-col">
        <Starfield />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <OfflineIndicator />
          <AnimatedRoutes />
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}
