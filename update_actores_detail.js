const fs = require('fs');

const path = 'c:\\Proyectos\\admin-rutadeltelar\\app\\actores\\[id]\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Container shadow removal
content = content.replace(
  /className="bg-\[var\(--color-surface-container-lowest\)\] p-8 rounded-\[8px\] shadow-\[0_12px_32px_-4px_rgba\(23,28,31,0\.06\)\]"/g,
  'className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px]"'
);

// H3 headers
content = content.replace(
  /className="text-sm font-semibold text-\[var\(--color-secondary\)\] mb-[34] uppercase tracking-wider"/g,
  'className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]"'
);
content = content.replace(
  /className="text-sm font-semibold text-\[var\(--color-primary\)\] mb-4 uppercase tracking-wider"/g,
  'className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]"'
);

// Labels in info blocks
content = content.replace(
  /className="block text-sm text-\[var\(--color-secondary\)\]"/g,
  'className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1"'
);

// Labels in specific details (they use text-[var(--color-secondary)] without text-sm currently)
content = content.replace(
  /className="block text-\[var\(--color-secondary\)\] mb-1"/g,
  'className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1"'
);

// Labels in history
content = content.replace(
  /className="font-medium block mb-1"/g,
  'className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1"'
);

fs.writeFileSync(path, content, 'utf8');
