const fs = require('fs');
const file = 'c:/Proyectos/admin-rutadeltelar/app/imperdibles/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace h3 styles
content = content.replace(/text-sm font-semibold text-\[var\(--color-secondary\)\] mb-[234] uppercase tracking-wider/g, 'text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]');

// Replace span styles in Historial
content = content.replace(/<span className="font-medium block mb-1">Creado el<\/span>/g, '<span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Creado el</span>');
content = content.replace(/<span className="font-medium block mb-1">Última actualización<\/span>/g, '<span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Última actualización</span>');

// For "Detalles Operativos y Ubicación" items, align to actores style (which is stack of divs with block span, but the current is flex justify-between)
// Actually, leaving flex justify-between is fine, but maybe change text colors.
content = content.replace(/text-\[var\(--color-on-surface-variant\)\]/g, 'text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]');

fs.writeFileSync(file, content);
