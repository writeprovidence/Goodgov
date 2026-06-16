import fs from 'fs';
const content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');
let stack = [];
let lines = content.split('\n');
let inString = false;
let stringChar = '';
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let j = 0; j < line.length; j++) {
    let char = line[j];
    if ((char === "'" || char === '"' || char === '`') && line[j-1] !== '\\') {
        if (!inString) {
            inString = true;
            stringChar = char;
        } else if (stringChar === char) {
            inString = false;
        }
    }
    if (inString) continue;

    if (char === '{') stack.push({ char: '{', line: i + 1 });
    else if (char === '}') {
      if (stack.length === 0) {
        console.log('Extra } at line', i + 1);
      } else {
        stack.pop();
      }
    }
  }
}
if (stack.length > 0) {
  console.log('Unclosed { at lines:', stack.map(s => s.line).join(', '));
} else {
  console.log('Braces are balanced');
}
