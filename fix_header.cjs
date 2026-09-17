const fs = require('fs');
let c = fs.readFileSync('src/components/Header.tsx', 'utf8');

c = c.replace(
  'export default function Header({ title, showBack = false, hideControls = false, onBack }: { title: string, showBack?: boolean, hideControls?: boolean, onBack?: () => void }) {',
  'export default function Header({ title, showBack = false, hideControls = false, onBack, actions }: { title: string, showBack?: boolean, hideControls?: boolean, onBack?: () => void, actions?: React.ReactNode }) {'
);

c = c.replace(
  '      </div>\n      \n      {!hideControls && (',
  '      </div>\n      \n      {actions && <div className="flex items-center gap-2">{actions}</div>}\n      \n      {!hideControls && ('
);

fs.writeFileSync('src/components/Header.tsx', c);
console.log('Fixed header');
