const fs = require('fs');
const path = require('path');

const scriptPath = path.resolve(__dirname, '../script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

const match = scriptContent.match(/function\s+capitalizeFirstLetter\s*\(\s*string\s*\)\s*{[^}]*}/);
if (!match) {
  throw new Error('capitalizeFirstLetter function not found');
}
const capitalizeFirstLetter = eval('(' + match[0] + ')');

test('capitalizes the first character', () => {
  expect(capitalizeFirstLetter('hello')).toBe('Hello');
});
