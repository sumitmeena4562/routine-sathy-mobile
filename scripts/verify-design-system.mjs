import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('ROUTINE SATHY MOBILE DESIGN SYSTEM CI VERIFICATION');
console.log('====================================================\n');

// 1. Check tokens.json exists and is valid JSON
const tokensPath = path.join(rootDir, 'design-tokens/tokens.json');
if (!fs.existsSync(tokensPath)) {
  console.error('✗ FAIL: design-tokens/tokens.json does not exist!');
  process.exit(1);
}

try {
  JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  console.log('✓ PASS: design-tokens/tokens.json is valid syntax.');
} catch (e) {
  console.error('✗ FAIL: design-tokens/tokens.json has invalid JSON syntax:', e.message);
  process.exit(1);
}

// 2. Check generated tokens file exists and has generation header
const genPath = path.join(rootDir, 'src/theme/tokens.generated.ts');
if (!fs.existsSync(genPath)) {
  console.error('✗ FAIL: src/theme/tokens.generated.ts does not exist! Run "npm run tokens:build" first.');
  process.exit(1);
}

const genContent = fs.readFileSync(genPath, 'utf8');
if (!genContent.includes('GENERATED, DO NOT EDIT DIRECTLY.')) {
  console.error('✗ FAIL: tokens.generated.ts is missing the GENERATED guard header.');
  process.exit(1);
}
console.log('✓ PASS: src/theme/tokens.generated.ts has GENERATED guard header.');

// 3. Run WCAG Contrast Check
function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function getLuminance(rgb) {
  const a = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(h1, h2) {
  const l1 = getLuminance(hexToRgb(h1));
  const l2 = getLuminance(hexToRgb(h2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const contrastPairs = [
  { name: 'Primary Text on Canvas (#0B3D2E on #F7F8F6)', fg: '#0B3D2E', bg: '#F7F8F6', min: 4.5 },
  { name: 'Primary Action Text on Amber Pill (#0B3D2E on #FBBF24)', fg: '#0B3D2E', bg: '#FBBF24', min: 4.5 },
  { name: 'Dark Mode Text on App Canvas (#FFFFFF on #052418)', fg: '#FFFFFF', bg: '#052418', min: 4.5 },
  { name: 'Dark Mode Muted on Surface (#CFE3D6 on #07261B)', fg: '#CFE3D6', bg: '#07261B', min: 4.5 },
];

let contrastPass = true;
contrastPairs.forEach(p => {
  const ratio = getContrast(p.fg, p.bg);
  if (ratio >= p.min) {
    console.log(`✓ PASS: ${p.name} ratio is ${ratio.toFixed(2)}:1 (>= ${p.min}:1)`);
  } else {
    console.error(`✗ FAIL: ${p.name} ratio ${ratio.toFixed(2)}:1 is below ${p.min}:1!`);
    contrastPass = false;
  }
});

if (!contrastPass) {
  process.exit(1);
}

console.log('\n====================================================');
console.log('>>> ALL DESIGN SYSTEM CI CHECKS PASSED WITH 100% SUCCESS <<<');
console.log('====================================================');
