const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'app/productos/create/page.tsx'),
  path.join(__dirname, 'app/productos/[id]/edit/page.tsx'),
  path.join(__dirname, 'app/productos/[id]/page.tsx')
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove shadows
    content = content.split(' shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]').join('');
    content = content.split(' shadow-[0_4px_8px_rgba(0,0,0,0.1)]').join('');
    content = content.split(' shadow-sm').join('');

    // Update labels
    content = content.split('block text-sm font-medium text-[var(--color-on-surface)] mb-2').join('block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]');

    // Update inputs
    content = content.split('w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px] resize-y').join('input-field min-h-[100px] resize-y');
    content = content.split('w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]').join('input-field');

    // Update buttons
    content = content.split('px-6 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full hover:bg-[var(--color-primary-fixed-dim)] transition-colors font-medium text-sm').join('btn-primary');
    content = content.split('px-6 py-2 border border-[var(--color-primary)] rounded-full text-[var(--color-primary)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] transition-colors font-medium text-sm').join('btn-secondary');
    content = content.split('px-6 py-2 border border-[var(--color-outline)] rounded-full text-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] transition-colors font-medium text-sm').join('btn-secondary');

    // Update button containers
    content = content.split('pt-6 flex items-center justify-end gap-4 border-t border-[var(--color-outline-variant)]').join('pt-6 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-[var(--color-outline-variant)]');

    // Update detail page headers
    content = content.split('text-sm font-semibold text-[var(--color-on-surface)] mb-2').join('text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]');
    content = content.split('text-sm font-semibold text-[var(--color-secondary)] mb-3 uppercase tracking-wider').join('text-sm font-bold text-[var(--color-secondary)] mb-3 uppercase tracking-[0.05em]');
    content = content.split('text-sm font-semibold text-[var(--color-secondary)] mb-4 uppercase tracking-wider').join('text-sm font-bold text-[var(--color-secondary)] mb-4 uppercase tracking-[0.05em]');

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
