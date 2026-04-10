const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js'))) {
      if (fullPath.includes('node_modules') || fullPath.includes('.next')) {
        continue;
      }
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // Replace bg-[var(--color-surface-container-lowest)] with bg-[var(--color-surface-container)]
      content = content.split('bg-[var(--color-surface-container-lowest)]').join('bg-[var(--color-surface-container)]');
      
      // Also check for bg-white in specific files where cards are using it instead
      if (fullPath.includes('app\\usuarios') || fullPath.includes('app/usuarios') || fullPath.includes('components')) {
        content = content.split('bg-white').join('bg-[var(--color-surface-container)]');
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));

console.log('Finished updating card backgrounds.');
