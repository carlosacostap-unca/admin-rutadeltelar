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

  if (content.includes('pb.collection(')) {
    // Add imports
    if (!content.includes('createRecordWithAudit') && content.match(/pb\.collection\(['"][^'"]+['"]\)\.(create|update)\(/)) {
      content = content.replace(
        "import pb from '@/lib/pocketbase';",
        "import pb from '@/lib/pocketbase';\nimport { createRecordWithAudit, updateRecordWithAudit } from '@/lib/audit';"
      );
      changed = true;
    }

    // createRecordWithAudit
    const createRegex = /pb\.collection\((['"][^'"]+['"])\)\.create\(([^)]+)\)/g;
    if (createRegex.test(content)) {
      content = content.replace(createRegex, "createRecordWithAudit($1, $2, user?.id || '')");
      changed = true;
    }

    // updateRecordWithAudit
    // Note: This regex assumes pb.collection('X').update(id, data)
    // We match: pb.collection('X').update(  arg1 , arg2 )
    // We capture $1 as 'X', $2 as arg1, $3 as arg2
    const updateRegex = /pb\.collection\((['"][^'"]+['"])\)\.update\(([^,]+),\s*([^)]+)\)/g;
    if (updateRegex.test(content)) {
      content = content.replace(updateRegex, "updateRecordWithAudit($1, $2, $3, user?.id || '')");
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
}
