const fs = require('fs');

const path = 'c:\\Proyectos\\admin-rutadeltelar\\app\\estaciones\\[id]\\edit\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Container shadow removal
content = content.replace(
  /className="bg-\[var\(--color-surface-container-lowest\)\] p-8 rounded-\[8px\] shadow-\[0_12px_32px_-4px_rgba\(23,28,31,0\.06\)\]"/,
  'className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px]"'
);

// Labels
content = content.replace(
  /<label className="block text-sm font-medium text-\[var\(--color-on-surface\)\] mb-[123]"/g,
  '<label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]"'
);

// Input classes
content = content.replace(
  /className="w-full px-4 py-2 border border-\[var\(--color-outline\)\] rounded-md focus:outline-none focus:ring-2 focus:ring-\[var\(--color-primary\)\] bg-\[var\(--color-surface\)\]([^"]*)"/g,
  'className="input-field w-full$1"'
);
content = content.replace(
  /className="w-full md:w-1\/2 px-4 py-2 border border-\[var\(--color-outline\)\] rounded-md focus:outline-none focus:ring-2 focus:ring-\[var\(--color-primary\)\] bg-\[var\(--color-surface\)\]([^"]*)"/g,
  'className="input-field w-full md:w-1/2$1"'
);

// Buttons
const buttonsRegex = /<div className="pt-4 flex justify-end gap-4 border-t border-\[var\(--color-surface-variant\)\]">[\s\S]*?<\/div>\s*<\/form>/;
const newButtons = `<div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-[var(--color-surface-variant)] mt-8">
                <Link
                  href="/estaciones"
                  className="btn-secondary text-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>`;

content = content.replace(buttonsRegex, newButtons);

fs.writeFileSync(path, content, 'utf8');
