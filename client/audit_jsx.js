import fs from 'node:fs';
import path from 'node:path';

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            scanDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            const lastNonEmptyLineIndex = lines.reduce((acc, line, idx) => line.trim() !== '' ? idx : acc, -1);
            
            if (lastNonEmptyLineIndex !== -1) {
                const lastLine = lines[lastNonEmptyLineIndex].trim();
                // If the last non-empty line isn't a closing brace, semicolon, or part of an export/comment/import
                if (lastLine.length <= 3 && /^[a-z];?$/i.test(lastLine)) {
                     console.log(`[STRAY] ${fullPath}:${lastNonEmptyLineIndex + 1} -> "${lastLine}"`);
                }
            }
        }
    }
}

const target = path.join(process.cwd(), 'src/pages');
console.log(`Scanning target: ${target}`);
scanDir(target);
