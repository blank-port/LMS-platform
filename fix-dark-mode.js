const fs = require('fs');
const path = require('path');

const adminDir = path.join('e:', 'lms-full-stack', 'lms-full-stack', 'client', 'src', 'pages', 'admin');

const replacements = [
  [/bg-white(?=[\s"'])/g, 'bg-[var(--surface)]'],
  [/bg-gray-50(?=[\s"\/'])/g, 'bg-[var(--background)]'],
  [/bg-gray-100(?=[\s"\/'])/g, 'bg-[var(--background)]'],
  [/text-gray-900(?=[\s"'])/g, 'text-[var(--text-main)]'],
  [/text-gray-800(?=[\s"'])/g, 'text-[var(--text-main)]'],
  [/text-gray-700(?=[\s"'])/g, 'text-[var(--text-muted)]'],
  [/text-gray-600(?=[\s"'])/g, 'text-[var(--text-muted)]'],
  [/border-gray-100(?=[\s"\/'])/g, 'border-[var(--border)]'],
  [/border-gray-200(?=[\s"\/'])/g, 'border-[var(--border)]'],
  [/border-gray-50(?=[\s"\/'])/g, 'border-[var(--border)]'],
  [/divide-gray-50(?=[\s"'])/g, 'divide-[var(--border)]'],
  [/divide-gray-100(?=[\s"'])/g, 'divide-[var(--border)]'],
  [/hover:bg-gray-50(?=[\s"'])/g, 'hover:bg-[var(--background)]'],
  [/hover:bg-slate-50(?=[\s"\/'])/g, 'hover:bg-[var(--background)]'],
  [/shadow-gray-100(?=[\s"\/'])/g, 'shadow-black/10'],
  [/shadow-gray-200(?=[\s"\/'])/g, 'shadow-black/10'],
  [/bg-purple-50(?=[\s"'])/g, 'bg-purple-900/20'],
  [/bg-green-50(?=[\s"'])/g, 'bg-green-900/20'],
  [/bg-red-50(?=[\s"'])/g, 'bg-red-900/20'],
  [/bg-amber-50(?=[\s"'])/g, 'bg-amber-900/20'],
  [/bg-blue-50(?=[\s"'])/g, 'bg-blue-900/20'],
  [/bg-indigo-50(?=[\s"'])/g, 'bg-indigo-900/20'],
  [/text-purple-600(?=[\s"'])/g, 'text-purple-400'],
  [/text-green-600(?=[\s"'])/g, 'text-green-400'],
  [/text-red-600(?=[\s"'])/g, 'text-red-400'],
  [/text-amber-600(?=[\s"'])/g, 'text-amber-400'],
  [/text-blue-600(?=[\s"'])/g, 'text-blue-400'],
  [/border-purple-100(?=[\s"\/'])/g, 'border-purple-800/30'],
  [/border-green-100(?=[\s"\/'])/g, 'border-green-800/30'],
  [/border-amber-100(?=[\s"\/'])/g, 'border-amber-800/30'],
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  
  for (const [pattern, replacement] of replacements) {
    const matches = content.match(pattern);
    if (matches) {
      changeCount += matches.length;
      content = content.replace(pattern, replacement);
    }
  }
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('+ ' + path.basename(filePath) + ': ' + changeCount + ' fixes');
  } else {
    console.log('= ' + path.basename(filePath) + ': already dark');
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let totalFiles = 0;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      totalFiles += walkDir(fullPath);
    } else if (file.endsWith('.jsx')) {
      processFile(fullPath);
      totalFiles++;
    }
  }
  return totalFiles;
}

console.log('Dark Mode Batch Fix Starting...');
const total = walkDir(adminDir);
console.log('Processed ' + total + ' files.');
