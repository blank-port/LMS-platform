import fs from 'node:fs';
import path from 'node:path';

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.vite') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            scanDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            let exportFound = false;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.includes('export default')) {
                    exportFound = true;
                    continue;
                }
                if (exportFound && line !== '') {
                    // Ignore comments and braces (common at end of file if formatted weirdly)
                    if (!line.startsWith('//') && !line.startsWith('/*') && line !== '}' && line !== '};') {
                         console.log(`[ALERT] ${fullPath}:${i + 1} -> "${line}"`);
                    }
                }
            }
        }
    }
}

const target = path.join(process.cwd(), 'src');
console.log(`Global Scan of: ${target}`);
scanDir(target);
