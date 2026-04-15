const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'DatesListPage.jsx');
const lines = fs.readFileSync(file, 'utf8').split('\n');
let cutAt = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  // Find last top-level "}" that closes the export default function
  // The correct end is: lines[i] === '}' and lines[i-1].trim() === ');'
  if (lines[i] === '}' && i > 0 && lines[i-1] === '  );') {
    // But only if this is BEFORE any orphan code (orphan uses D.cream)
    // Check if this is the FIRST such pair from the start
    cutAt = i;
    break;
  }
}
// Walk forward from start to find the FIRST  );  + } pair
cutAt = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === '  );' && i+1 < lines.length && lines[i+1] === '}') {
    cutAt = i + 1;
    break;
  }
}
console.log('cutAt (0-indexed):', cutAt, '  = line', cutAt+1);
console.log('line[cutAt]:', JSON.stringify(lines[cutAt]));
console.log('total lines before:', lines.length);
const clean = lines.slice(0, cutAt + 1).join('\n');
fs.writeFileSync(file, clean, 'utf8');
console.log('total lines after:', clean.split('\n').length);
