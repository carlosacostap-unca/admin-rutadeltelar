const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('page.tsx')) {
      if (fullPath.includes('node_modules') || fullPath.includes('.next')) {
        continue;
      }
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // Remove Header imports
      content = content.replace(/import Header from ['"]@\/components\/Header['"];?\n?/g, '');
      content = content.replace(/import Header from ['"]\.\.\/components\/Header['"];?\n?/g, '');
      
      // Remove <Header /> tags
      content = content.replace(/\s*<Header \/>\n?/g, '\n');
      
      // Change min-h-screen to h-full or just remove min-h-screen
      content = content.replace(/className="([^"]*)min-h-screen([^"]*)"/g, 'className="$1h-full$2"');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app'));

console.log('Finished updating layout files.');
