const fs = require('fs');
const path = require('path');

const files = [
  'app/estaciones/page.tsx',
  'app/actores/page.tsx',
  'app/productos/page.tsx',
  'app/experiencias/page.tsx',
  'app/imperdibles/page.tsx',
  'app/usuarios/page.tsx',
];

files.forEach(file => {
  const filePath = path.join('c:/Proyectos/admin-rutadeltelar', file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Remove the header column "Acciones"
  content = content.replace(/<div className="flex-1 text-right">Acciones<\/div>\s*/g, '');

  // 2. Identify the variable name in the map, e.g., filteredEstaciones.map((e) => (
  // We can look for `{filtered.*\.map\((.*?)\) => \(` or similar.
  const mapRegex = /\{filtered(\w+)\.map\(\((.*?)\) => \(\s*(<div[\s\S]*?)key=\{.*?\.id\}[\s\S]*?className="(.*?)"\s*>\s*([\s\S]*?)<div className="flex-1 flex justify-end gap-4 text-sm">[\s\S]*?<\/div>\s*<\/div>\s*\)\)}/g;

  // Let's use a simpler approach. I'll read the file, split by lines, and process it.
});
