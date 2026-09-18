# CBT Hub

Computer Based Tests portal designed for uninterrupted offline practice.

## GitHub Pages Deployment
To deploy this project to GitHub Pages, a workflow file must be placed at `.github/workflows/deploy.yml`. 

If the exporter did not include this hidden folder automatically, please open the `GITHUB_PAGES_WORKFLOW.md` file in this repository for the exact code to paste into GitHub!

> Note: To trigger a fresh export in AI Studio, simply make any tiny edit to a file and press "Export to GitHub" again.
> 
> *Fixes applied: HashRouter implementation and PWA manifest relative paths.*
> EOF> 
> *Fixes applied: Rearranged botany exams, added duration text, added triple dot menu for local tests.*
> EOF> 
> *Added Reports View, localforage tracking, and ErrorBoundary.*
> EOF> 
> *Fixed 404 error during GitHub Pages deployment due to hardcoded absolute paths.*
> EOF
*Fixed static test durations by parsing the exact `EXAM_DURATION_MINS` from each individual HTML file.*

*Fixed premature iframe blanking caused by React Strict Mode rendering cycles.*

*Added subject graphics, reversed header controls, and connected Recent Tests directly to database stats.*

*Fixed list view position and category preservation upon returning from tests. Restricted ads/footer to Home page only.*

*Fixed initialization order crash in SubjectView.*

*Disabled faulty 180 min Botany exams per instructions. Unclickable state added.*

*Fixed massive spacing gap on Home.tsx and added light-mode visibility for background texture dots.*

*Fixed GitHub Pages SPA routing bug where refreshing a page caused HashRouter to load the Homepage while leaving the route in the pathname.*

*Updated `main.tsx` to explicitly wipe active routes on page refresh, forcing the application to always resume from the Home page.*

*Fixed visual issues on Home page: Replaced truncated Subject card titles with wrapped titles, increased Subject card background icon opacity, and added an empty state placeholder for Recent Exams.*
*Re-engineered CBT test analytics capture engine to robustly extract exam data (Score, Accuracy, Time) using fallback regex parsing and multiple standard NTA DOM selectors.*

*Upgraded CBT test analytics engine with aggressive keyword detection to better support non-standard prebuilt HTML files.*
*Added a manual "Save Result" fallback button to the test viewer header to guarantee stats capture.*

*Fixed analytics duplication issue by intelligently updating existing test reports within a 12-hour window instead of spawning duplicate entries for every response.*
*Fine-tuned the auto-capture keywords to prevent false-positives from active question sidebars.*

*Implemented robust Offline Caching for prebuilt tests via a new Triple-Dot menu on subject test cards, explicitly saving HTML to local storage for offline use.*
*Announced offline availability with a custom hero ad banner on the Home dashboard.*
*Refactored Recent Exams responsive grid to display a visually balanced 2-column layout on tablet/landscape configurations.*
