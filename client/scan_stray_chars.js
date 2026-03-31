import fs from 'node:fs';
import path from 'node:path';

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            let foundExport = false;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.includes('export default')) {
                    foundExport = true;
                    continue;
                }
                if (foundExport && /^[a-z];?$/.test(line)) {
                    console.log(`STRAY: ${fullPath} | LINE: ${i + 1} | CHAR: "${line}"`);
                }
            }
        }
    });
}

const targetDir = path.join(process.cwd(), 'src/pages');
console.log(`Heavy scanning ${targetDir}...`);
scanDir(targetDir);
