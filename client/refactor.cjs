const fs = require('fs');
const path = 'e:/lms-full-stack/lms-full-stack/client/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add lazy and Suspense to react import
content = content.replace(/import \{ useContext, useEffect \} from 'react'/, "import { useContext, useEffect, lazy, Suspense } from 'react'");

// Replace all imports from './pages...' and './components...'
const importRegex = /^import\s+([A-Za-z0-9_]+)\s+from\s+'(\.\/(?:pages|components)\/[^']+)'/gm;

content = content.replace(importRegex, (match, component, importPath) => {
    if (component === 'Loading') return match;
    return `const ${component} = lazy(() => import('${importPath}'));`;
});

// Wrap <Routes> in <Suspense>
content = content.replace(/<Routes>/g, '<Suspense fallback={<Loading />}><Routes>');
content = content.replace(/<\/Routes>/g, '</Routes></Suspense>');

fs.writeFileSync(path, content, 'utf8');
console.log('App.jsx converted to lazy loading');
