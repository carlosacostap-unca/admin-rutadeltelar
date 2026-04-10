const fs = require('fs');

const path = 'c:\\Proyectos\\admin-rutadeltelar\\app\\estaciones\\[id]\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Container shadows
content = content.replace(
  /shadow-\[0_12px_32px_-4px_rgba\(23,28,31,0\.06\)\]/g,
  ''
);
content = content.replace(
  /shadow-\[0_4px_12px_-4px_rgba\(23,28,31,0\.06\)\]/g,
  ''
);

// H3 headers
content = content.replace(
  /className="text-sm font-semibold text-\[var\(--color-secondary\)\] mb-[23] uppercase tracking-wider"/g,
  'className="text-sm font-bold text-[var(--color-on-surface)] mb-3 uppercase tracking-[0.05em]"'
);

// Tab active state text color (optional, but keep it consistent)
content = content.replace(
  /className="pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors \$\{([^}]*)\}"/g,
  'className={`pb-3 text-sm font-bold uppercase tracking-[0.05em] whitespace-nowrap border-b-2 transition-colors ${$1}`}'
);

fs.writeFileSync(path, content, 'utf8');
