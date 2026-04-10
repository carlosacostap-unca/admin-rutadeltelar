const fs = require('fs');

const files = [
  'c:/Proyectos/admin-rutadeltelar/app/imperdibles/create/page.tsx',
  'c:/Proyectos/admin-rutadeltelar/app/imperdibles/[id]/edit/page.tsx',
  'c:/Proyectos/admin-rutadeltelar/app/imperdibles/[id]/page.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove shadows
    content = content.split(' shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]').join('');
    content = content.split(' shadow-[0_4px_8px_rgba(0,0,0,0.1)]').join('');
    
    // 2. Labels
    content = content.split('className="block text-sm font-medium text-[var(--color-on-surface)] mb-2"')
      .join('className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]"');

    // 3. Inputs
    content = content.split('className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"')
      .join('className="input-field"');
    content = content.split('className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px] resize-y"')
      .join('className="input-field min-h-[100px] resize-y"');
    content = content.split('className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[80px] resize-y"')
      .join('className="input-field min-h-[80px] resize-y"');
    // Also handling the case with min-h-[100px] without resize-y if any
    content = content.split('className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px]"')
      .join('className="input-field min-h-[100px]"');

    // 4. Buttons layout
    content = content.split('className="pt-6 flex items-center justify-end gap-4 border-t border-[var(--color-outline-variant)]"')
      .join('className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-[var(--color-outline-variant)]"');

    // 5. Cancel Button
    content = content.split('className="px-6 py-2 border border-[var(--color-outline)] rounded-full text-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] transition-colors font-medium text-sm"')
      .join('className="btn-secondary w-full sm:w-auto"');

    // 6. Draft Button
    content = content.split('className="px-6 py-2 border border-[var(--color-primary)] rounded-full text-[var(--color-primary)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] transition-colors font-medium text-sm"')
      .join('className="btn-secondary w-full sm:w-auto"');

    // 7. Save/Continue Button
    content = content.split('className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full hover:bg-[var(--color-primary-fixed-dim)] transition-colors font-medium text-sm"')
      .join('className="btn-primary w-full sm:w-auto"');

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
}
