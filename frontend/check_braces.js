const fs = require('fs');
const src = fs.readFileSync('src/components/Building3DModel.jsx', 'utf8');
const lines = src.split('\n');

// Find all lines where depth goes from 0 to 1 (function/block starts at top level)
let depth = 0;
let topLevelOpens = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let inStr = false;
  let strChar = '';
  const prevDepth = depth;
  
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (inStr) {
      if (c === '\\') { j++; continue; }
      if (c === strChar) inStr = false;
      continue;
    }
    if (c === '/' && line[j+1] === '/') break;
    if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
    if (c === '{') depth++;
    if (c === '}') depth--;
  }
  
  // Track when depth changes at "low" levels
  if (prevDepth <= 2 || depth <= 2) {
    topLevelOpens.push({ line: i+1, prevDepth, depth, content: line.substring(0, 100) });
  }
}

console.log('Final depth:', depth);
console.log('\nAll lines where depth is 0, 1, or 2 (top-level structure):');
topLevelOpens.slice(-60).forEach(l => {
  const marker = l.depth > l.prevDepth ? '>>OPEN' : l.depth < l.prevDepth ? '<<CLOSE' : '      ';
  console.log(`L${String(l.line).padStart(4)}: d=${l.depth} ${marker} | ${l.content}`);
});
