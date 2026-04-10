const fs = require('fs');

const path = 'c:\\Proyectos\\admin-rutadeltelar\\app\\actores\\create\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Labels
content = content.replace(
  /<label className="block text-sm font-medium text-\[var\(--color-on-surface\)\] mb-[123]"/g,
  '<label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]"'
);

// Specific detail title
content = content.replace(
  /className="text-lg font-semibold text-\[var\(--color-primary\)\] mb-4 border-b border-\[var\(--color-outline-variant\)\] pb-2"/,
  'className="text-lg font-bold text-[var(--color-on-surface)] mb-4 border-b border-[var(--color-surface-variant)] pb-2 uppercase tracking-[0.05em]"'
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
content = content.replace(
  /className="w-full px-3 py-2 border rounded-md([^"]*)"/g,
  'className="input-field w-full$1"'
);

// Buttons
const buttonsRegex = /<div className="pt-4 flex justify-end gap-4 border-t border-\[var\(--color-surface-variant\)\]">[\s\S]*?<\/div>\s*<\/form>/;
const newButtons = `<div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-[var(--color-surface-variant)] mt-8">
              <Link
                href="/actores"
                className="btn-secondary text-center"
              >
                Cancelar
              </Link>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'borrador')}
                disabled={isSubmitting}
                className="btn-secondary"
              >
                Guardar Borrador
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'continuar')}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Guardando...' : 'Crear y Continuar Editando'}
              </button>
            </div>
          </form>`;

content = content.replace(buttonsRegex, newButtons);

fs.writeFileSync(path, content, 'utf8');
