const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'app/usuarios/create/page.tsx'),
  path.join(__dirname, 'app/usuarios/[id]/edit/page.tsx'),
  path.join(__dirname, 'app/usuarios/[id]/page.tsx'),
  path.join(__dirname, 'app/usuarios/page.tsx')
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove shadows
    content = content.split(' shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]').join('');
    content = content.split(' shadow-[0_4px_8px_rgba(0,0,0,0.1)]').join('');
    content = content.split(' shadow-sm').join('');
    content = content.split(' shadow-md').join('');

    // Update labels
    content = content.split('block text-sm font-medium text-[var(--color-on-surface)] mb-2').join('block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]');
    content = content.split('block text-sm font-medium text-[var(--color-on-surface)] mb-3').join('block text-sm font-bold text-[var(--color-on-surface)] mb-3 uppercase tracking-[0.05em]');

    // Update headers in detail page
    content = content.split('text-sm font-semibold text-[var(--color-secondary)] uppercase tracking-wider').join('text-sm font-bold text-[var(--color-secondary)] uppercase tracking-[0.05em]');

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
