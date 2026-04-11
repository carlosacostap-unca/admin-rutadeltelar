const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      filelist.push(dirFile);
    }
  }
  return filelist;
}

const allFiles = walkSync(path.join(__dirname, 'app'));
const tsxFiles = allFiles.filter(f => f.endsWith('.tsx') && (f.includes('create') || f.includes('edit')));

for (const file of tsxFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('WithAudit')) {
    // Replace user?.id || '' with user
    const regex = /(createRecordWithAudit|updateRecordWithAudit|deleteRecordWithAudit)\(([^)]+),\s*(user\?\.id\s*\|\|\s*['"]['"])\)/g;
    if (regex.test(content)) {
      content = content.replace(regex, "$1($2, user)");
      changed = true;
    }
    
    // Also, handle cases where user?.id is passed directly without || ''
    const regex2 = /(createRecordWithAudit|updateRecordWithAudit|deleteRecordWithAudit)\(([^)]+),\s*user\?\.id\)/g;
    if (regex2.test(content)) {
      content = content.replace(regex2, "$1($2, user)");
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
}
