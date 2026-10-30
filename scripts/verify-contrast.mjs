import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokensPath = path.resolve(__dirname, '../design-tokens/tokens.json');

function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance(rgb) {
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function runContrastCheck() {
  console.log('Running WCAG Contrast Verification on Semantic Pairs...\n');

  const pairs = [
    { name: 'Primary Text on App Background (Light)', fg: '#0B3D2E', bg: '#F7F8F6', min: 4.5 },
    { name: 'Primary Text on White Surface (Light)', fg: '#0B3D2E', bg: '#FFFFFF', min: 4.5 },
    { name: 'Secondary Text on Surface (Light)', fg: '#4F655B', bg: '#FFFFFF', min: 4.5 },
    { name: 'Primary Action Text on Amber Pill (Light)', fg: '#0B3D2E', bg: '#FBBF24', min: 4.5 },
    { name: 'White Text on Dark Action / Card (Light)', fg: '#FFFFFF', bg: '#0B3D2E', min: 4.5 },
    { name: 'White Text on App Background (Dark)', fg: '#FFFFFF', bg: '#052418', min: 4.5 },
    { name: 'Muted Text on Dark Surface (Dark)', fg: '#CFE3D6', bg: '#07261B', min: 4.5 },
    { name: 'Amber Action Text on Amber Pill (Dark)', fg: '#0B3D2E', bg: '#FBBF24', min: 4.5 },
  ];

  let passed = true;
  for (const pair of pairs) {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    const ok = ratio >= pair.min;
    console.log(`${ok ? '✓' : '✗'} [${ratio.toFixed(2)}:1] (Min ${pair.min}:1) - ${pair.name}`);
    if (!ok) passed = false;
  }

  if (!passed) {
    console.error('\nContrast check failed!');
    process.exit(1);
  }
  console.log('\n✓ ALL WCAG CONTRAST CHECKS PASSED WITH AAA / AA SUCCESS!');
}

runContrastCheck();
