const fs = require('fs');

const filePaths = [
  'c:/Proyectos/admin-rutadeltelar/app/imperdibles/create/page.tsx',
  'c:/Proyectos/admin-rutadeltelar/app/imperdibles/[id]/edit/page.tsx'
];

filePaths.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace w-full w-full with w-full
  content = content.replace(/w-full w-full/g, 'w-full');

  // Remove section comments
  content = content.replace(/[ \t]*\{\/\*.*?\*\/\}\r?\n/g, '');

  // Find all `<div className="border-b border-[var(--color-outline-variant)] pb-4">`
  const targetPattern = /([ \t]*)<div className="border-b border-\[var\(--color-outline-variant\)\] pb-4">\r?\n[ \t]*<h3 className="text-lg font-semibold text-\[var\(--color-on-surface\)\] mb-4">.*?<\/h3>\r?\n/g;
  
  let match;
  while ((match = targetPattern.exec(content)) !== null) {
    const startIdx = match.index;
    const endIdx = startIdx + match[0].length;
    
    // We need to find the matching closing `</div>` for this div.
    let depth = 1;
    let i = endIdx;
    while (i < content.length && depth > 0) {
      if (content.substring(i, i + 4) === '<div') {
        depth++;
        i += 4;
      } else if (content.substring(i, i + 6) === '</div>') {
        depth--;
        if (depth === 0) {
          // Remove the closing div and any trailing newline/spaces
          let closeEnd = i + 6;
          while (content[closeEnd] === ' ' || content[closeEnd] === '\t' || content[closeEnd] === '\r' || content[closeEnd] === '\n') {
             // Just remove the immediate newline after </div> if we want, but let's be safe and just remove </div>
             break;
          }
          
          content = content.substring(0, i) + content.substring(i + 6);
          // Remove the opening div and h3
          content = content.substring(0, startIdx) + content.substring(endIdx);
          
          // Restart matching from start since string changed
          targetPattern.lastIndex = 0;
          break;
        }
        i += 6;
      } else {
        i++;
      }
    }
  }

  // Optional: remove mb-4 classes from direct children of the form to rely on space-y-6
  content = content.replace(/<div className="mb-4">/g, '<div>');
  content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">/g, '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">');
  content = content.replace(/<div className="grid grid-cols-1 gap-6 mb-4">/g, '<div className="grid grid-cols-1 gap-6">');

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Done!');