// Generates crisp Capacitor/PWA source assets from vector art (no AI raster).
// Outputs into assets/: icon-foreground.png, icon-background.png,
// splash.png, splash-dark.png. Run `npm run cap:assets` afterwards.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('assets', { recursive: true });

// Volleyball drawn centred on (0,0) in a 64-unit space (radius 18).
function ball(cx, cy, scale, stroke) {
  return `
    <g transform="translate(${cx},${cy}) scale(${scale})" fill="none" stroke="#ffffff"
       stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="0" cy="0" r="18" />
      <path d="M0 -18 C -6 -8, -6 8, 0 18" />
      <path d="M-16 -6 C -4 -2, 10 -4, 18 -10" />
      <path d="M-16 8 C -6 4, 10 6, 18 12" />
    </g>`;
}

function rotationArrows(cx, cy, scale, stroke) {
  // two subtle arcs hinting at rotation, drawn around the ball
  return `
    <g transform="translate(${cx},${cy}) scale(${scale})" fill="none" stroke="#ffffff"
       stroke-width="${stroke}" stroke-linecap="round" opacity="0.55">
      <path d="M 22 -10 A 24 24 0 0 1 10 22" />
      <path d="M 10 22 l -1 -7 m 1 7 l 7 -2" />
      <path d="M -22 10 A 24 24 0 0 1 -10 -22" />
      <path d="M -10 -22 l 1 7 m -1 -7 l -7 2" />
    </g>`;
}

const purpleBg = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8b5cf6"/>
      <stop offset="1" stop-color="#6366f1"/>
    </linearGradient>
  </defs>`;

const navyBg = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e293b"/>
      <stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
  </defs>`;

async function svgToPng(svg, file) {
  await sharp(Buffer.from(svg)).png().toFile(`assets/${file}`);
  console.log('wrote', file);
}

// Adaptive icon foreground (transparent; ball sits inside the safe zone).
const fg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${ball(512, 512, 13, 3.2)}
  ${rotationArrows(512, 512, 13, 2.4)}
</svg>`;

// Adaptive icon background (solid brand gradient).
const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${purpleBg}<rect width="1024" height="1024" fill="url(#g)"/>
</svg>`;

// Full-bleed square icon (used by iOS, legacy Android and PWA).
const iconOnly = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${purpleBg}<rect width="1024" height="1024" fill="url(#g)"/>
  ${ball(512, 512, 16, 3)}
  ${rotationArrows(512, 512, 16, 2.2)}
</svg>`;

// Splash screens (centred ball on brand background).
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  ${purpleBg}<rect width="2732" height="2732" fill="url(#g)"/>
  ${ball(1366, 1366, 22, 2.4)}
  ${rotationArrows(1366, 1366, 22, 1.8)}
</svg>`;

const splashDark = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  ${navyBg}<rect width="2732" height="2732" fill="url(#g)"/>
  ${ball(1366, 1366, 22, 2.4)}
  ${rotationArrows(1366, 1366, 22, 1.8)}
</svg>`;

await svgToPng(iconOnly, 'icon-only.png');
await svgToPng(fg, 'icon-foreground.png');
await svgToPng(bg, 'icon-background.png');
await svgToPng(splash, 'splash.png');
await svgToPng(splashDark, 'splash-dark.png');
console.log('done');
