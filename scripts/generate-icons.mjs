import { chromium } from '../../routine-sathy-web/node_modules/playwright/index.mjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.resolve(__dirname, '../assets/images');

const SVG_DEFS = `
<defs>
  <!-- Background gradient -->
  <linearGradient id="bgGrad" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0%" stop-color="#16734d" />
    <stop offset="45%" stop-color="#0e4933" />
    <stop offset="100%" stop-color="#052419" />
  </linearGradient>

  <!-- Inner top highlight -->
  <linearGradient id="topGlow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
    <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
  </linearGradient>

  <!-- Ambient sun glow -->
  <radialGradient id="sunGlow" cx="48%" cy="40%" r="50%">
    <stop offset="0%" stop-color="#FFD84D" stop-opacity="0.22" />
    <stop offset="100%" stop-color="#FFD84D" stop-opacity="0" />
  </radialGradient>

  <!-- Emblem Gradients -->
  <linearGradient id="bowlGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#FFFFFF" />
    <stop offset="100%" stop-color="#E2EBE5" />
  </linearGradient>

  <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFE066" />
    <stop offset="100%" stop-color="#F59E0B" />
  </linearGradient>

  <linearGradient id="stemGrad" x1="0" y1="1" x2="0.4" y2="0">
    <stop offset="0%" stop-color="#22C55E" />
    <stop offset="100%" stop-color="#86EFAC" />
  </linearGradient>

  <linearGradient id="legGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#FFFFFF" />
    <stop offset="100%" stop-color="#D1FAE5" />
  </linearGradient>

  <!-- Emblem Paths in 200x200 Coordinate Space -->
  <g id="emblem">
    <!-- Rising Sun -->
    <circle cx="92" cy="74" r="23" fill="url(#sunGrad)" />
    <!-- Bowl (Upper R Loop) -->
    <path
      d="M52 72C54 40 86 22 118 26C152 30 168 62 156 88C148 104 128 112 104 112"
      fill="none"
      stroke="url(#bowlGrad)"
      stroke-width="25"
      stroke-linecap="round"
    />
    <!-- Stem (Growth Leaf) -->
    <path
      d="M38 190C26 140 34 98 72 91C94 87 108 95 114 104C90 101 62 114 54 150C50 168 46 180 38 190Z"
      fill="url(#stemGrad)"
    />
    <!-- Leg (Advancing Path / Leaf) -->
    <path
      d="M92 126C124 120 162 140 178 190C140 190 98 172 92 126Z"
      fill="url(#legGrad)"
    />
  </g>

  <!-- Monochrome Emblem for Material You Themed Icons -->
  <g id="emblemMono">
    <circle cx="92" cy="74" r="23" fill="#FFFFFF" />
    <path
      d="M52 72C54 40 86 22 118 26C152 30 168 62 156 88C148 104 128 112 104 112"
      fill="none"
      stroke="#FFFFFF"
      stroke-width="25"
      stroke-linecap="round"
    />
    <path
      d="M38 190C26 140 34 98 72 91C94 87 108 95 114 104C90 101 62 114 54 150C50 168 46 180 38 190Z"
      fill="#FFFFFF"
    />
    <path
      d="M92 126C124 120 162 140 178 190C140 190 98 172 92 126Z"
      fill="#FFFFFF"
    />
  </g>
</defs>
`;

async function generate() {
  console.log('Launching browser to render high-resolution app icons...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const page = await browser.newPage();

  // 1. Master Icon (1024x1024) - For iOS and Google Play
  console.log('1. Generating icon.png (1024x1024)...');
  const iconHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 1024px; height: 1024px; overflow: hidden; background: transparent; }
      </style>
    </head>
    <body>
      <svg width="1024" height="1024" viewBox="0 0 1024 1024">
        ${SVG_DEFS}
        <!-- Background -->
        <rect width="1024" height="1024" fill="url(#bgGrad)" />
        <rect width="1024" height="1024" fill="url(#sunGlow)" />
        <rect width="1024" height="1024" fill="url(#topGlow)" />
        <!-- Centered Emblem scaled to ~580px (inside safe area) -->
        <g transform="translate(512, 512) scale(3.2) translate(-104, -108)">
          <use href="#emblem" />
        </g>
      </svg>
    </body>
    </html>
  `;
  await page.setViewportSize({ width: 1024, height: 1024 });
  await page.setContent(iconHtml);
  await page.screenshot({ path: path.join(assetsDir, 'icon.png'), omitBackground: false });

  // 2. Android Adaptive Icon Foreground (512x512) - Safe area is centered circle of diameter 340px (66%)
  console.log('2. Generating android-icon-foreground.png (512x512)...');
  const fgHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 512px; height: 512px; overflow: hidden; background: transparent; }
      </style>
    </head>
    <body>
      <svg width="512" height="512" viewBox="0 0 512 512">
        ${SVG_DEFS}
        <!-- Emblem scaled to ~270px inside 340px safe zone -->
        <g transform="translate(256, 256) scale(1.5) translate(-104, -108)">
          <use href="#emblem" />
        </g>
      </svg>
    </body>
    </html>
  `;
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(fgHtml);
  await page.screenshot({ path: path.join(assetsDir, 'android-icon-foreground.png'), omitBackground: true });

  // 3. Android Adaptive Icon Background (512x512)
  console.log('3. Generating android-icon-background.png (512x512)...');
  const bgHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 512px; height: 512px; overflow: hidden; }
      </style>
    </head>
    <body>
      <svg width="512" height="512" viewBox="0 0 512 512">
        ${SVG_DEFS}
        <rect width="512" height="512" fill="url(#bgGrad)" />
        <rect width="512" height="512" fill="url(#sunGlow)" />
      </svg>
    </body>
    </html>
  `;
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(bgHtml);
  await page.screenshot({ path: path.join(assetsDir, 'android-icon-background.png'), omitBackground: false });

  // 4. Android Monochrome Icon (432x432)
  console.log('4. Generating android-icon-monochrome.png (432x432)...');
  const monoHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 432px; height: 432px; overflow: hidden; background: transparent; }
      </style>
    </head>
    <body>
      <svg width="432" height="432" viewBox="0 0 432 432">
        ${SVG_DEFS}
        <g transform="translate(216, 216) scale(1.28) translate(-104, -108)">
          <use href="#emblemMono" />
        </g>
      </svg>
    </body>
    </html>
  `;
  await page.setViewportSize({ width: 432, height: 432 });
  await page.setContent(monoHtml);
  await page.screenshot({ path: path.join(assetsDir, 'android-icon-monochrome.png'), omitBackground: true });

  // 5. Splash Icon (512x512)
  console.log('5. Generating splash-icon.png (512x512)...');
  const splashHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 512px; height: 512px; overflow: hidden; background: transparent; }
      </style>
    </head>
    <body>
      <svg width="512" height="512" viewBox="0 0 512 512">
        ${SVG_DEFS}
        <!-- For splash screen with colored emblem on white/clean splash background -->
        <g transform="translate(256, 256) scale(1.7) translate(-104, -108)">
          <use href="#emblem" />
        </g>
      </svg>
    </body>
    </html>
  `;
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(splashHtml);
  await page.screenshot({ path: path.join(assetsDir, 'splash-icon.png'), omitBackground: true });

  // 6. Favicon (48x48)
  console.log('6. Generating favicon.png (48x48)...');
  await page.setViewportSize({ width: 48, height: 48 });
  const favHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 48px; height: 48px; overflow: hidden; background: transparent; }
      </style>
    </head>
    <body>
      <svg width="48" height="48" viewBox="0 0 48 48">
        ${SVG_DEFS}
        <rect width="48" height="48" rx="10" fill="url(#bgGrad)" />
        <g transform="translate(24, 24) scale(0.18) translate(-104, -108)">
          <use href="#emblem" />
        </g>
      </svg>
    </body>
    </html>
  `;
  await page.setContent(favHtml);
  await page.screenshot({ path: path.join(assetsDir, 'favicon.png'), omitBackground: true });

  await browser.close();
  console.log('✨ All mobile app icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
