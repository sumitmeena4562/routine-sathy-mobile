import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tokensPath = path.join(rootDir, 'design-tokens/tokens.json');
const outputPath = path.join(rootDir, 'src/theme/tokens.generated.ts');

function resolveTokens(rawTokens) {
  function getValue(pathStr) {
    const clean = pathStr.replace(/^{|}$/g, '');
    const parts = clean.split('.');
    let cur = rawTokens;
    for (const p of parts) {
      if (cur === undefined || cur === null) return undefined;
      cur = cur[p];
    }
    if (cur && typeof cur === 'object' && 'value' in cur) {
      return cur.value;
    }
    return cur;
  }

  function resolveDeep(obj) {
    if (Array.isArray(obj)) {
      return obj.map(resolveDeep);
    }
    if (obj !== null && typeof obj === 'object') {
      if ('value' in obj && Object.keys(obj).length <= 2) {
        let val = obj.value;
        if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
          val = getValue(val);
        }
        return val;
      }
      const res = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && v.startsWith('{') && v.endsWith('}')) {
          res[k] = getValue(v);
        } else {
          res[k] = resolveDeep(v);
        }
      }
      return res;
    }
    return obj;
  }

  return resolveDeep(rawTokens);
}

function generate() {
  console.log('Reading tokens from:', tokensPath);
  const raw = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const resolved = resolveTokens(raw);

  const fileContent = `/**
 * ============================================================================
 * ROUTINE SATHY CENTRALIZED DESIGN SYSTEM TOKENS
 * ============================================================================
 * GENERATED, DO NOT EDIT DIRECTLY.
 * Source: design-tokens/tokens.json
 * Generated at: ${new Date().toISOString()}
 * ============================================================================
 */

export const PrimitiveTokens = ${JSON.stringify(resolved.primitive, null, 2)} as const;

export const SemanticLightTokens = ${JSON.stringify(resolved.semantic.light, null, 2)} as const;

export const SemanticDarkTokens = ${JSON.stringify(resolved.semantic.dark, null, 2)} as const;

export const LayoutTokens = ${JSON.stringify(resolved.semantic.layout, null, 2)} as const;

export const ComponentTokens = ${JSON.stringify(resolved.component, null, 2)} as const;

export const TypographyScale = {
  micro: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: PrimitiveTokens.font.size.micro,
    lineHeight: Math.round(PrimitiveTokens.font.size.micro * 1.3),
    fontWeight: PrimitiveTokens.font.weight.semibold,
  },
  captionSm: {
    fontFamily: PrimitiveTokens.font.family.medium,
    fontSize: PrimitiveTokens.font.size.captionSm,
    lineHeight: Math.round(PrimitiveTokens.font.size.captionSm * 1.35),
    fontWeight: PrimitiveTokens.font.weight.medium,
  },
  caption: {
    fontFamily: PrimitiveTokens.font.family.medium,
    fontSize: PrimitiveTokens.font.size.caption,
    lineHeight: Math.round(PrimitiveTokens.font.size.caption * 1.4),
    fontWeight: PrimitiveTokens.font.weight.medium,
  },
  bodySm: {
    fontFamily: PrimitiveTokens.font.family.regular,
    fontSize: PrimitiveTokens.font.size.bodySm,
    lineHeight: Math.round(PrimitiveTokens.font.size.bodySm * 1.45),
    fontWeight: PrimitiveTokens.font.weight.regular,
  },
  body: {
    fontFamily: PrimitiveTokens.font.family.regular,
    fontSize: PrimitiveTokens.font.size.body,
    lineHeight: Math.round(PrimitiveTokens.font.size.body * 1.5),
    fontWeight: PrimitiveTokens.font.weight.regular,
  },
  bodyStrong: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: PrimitiveTokens.font.size.body,
    lineHeight: Math.round(PrimitiveTokens.font.size.body * 1.5),
    fontWeight: PrimitiveTokens.font.weight.semibold,
  },
  bodyLg: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: PrimitiveTokens.font.size.bodyLg,
    lineHeight: Math.round(PrimitiveTokens.font.size.bodyLg * 1.5),
    fontWeight: PrimitiveTokens.font.weight.semibold,
  },
  h4: {
    fontFamily: PrimitiveTokens.font.family.bold,
    fontSize: PrimitiveTokens.font.size.h4,
    lineHeight: Math.round(PrimitiveTokens.font.size.h4 * 1.35),
    fontWeight: PrimitiveTokens.font.weight.bold,
  },
  h3: {
    fontFamily: PrimitiveTokens.font.family.bold,
    fontSize: PrimitiveTokens.font.size.h3,
    lineHeight: Math.round(PrimitiveTokens.font.size.h3 * 1.3),
    fontWeight: PrimitiveTokens.font.weight.bold,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: PrimitiveTokens.font.family.extrabold,
    fontSize: PrimitiveTokens.font.size.h2,
    lineHeight: Math.round(PrimitiveTokens.font.size.h2 * 1.25),
    fontWeight: PrimitiveTokens.font.weight.extrabold,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: PrimitiveTokens.font.family.extrabold,
    fontSize: PrimitiveTokens.font.size.h1,
    lineHeight: Math.round(PrimitiveTokens.font.size.h1 * 1.2),
    fontWeight: PrimitiveTokens.font.weight.extrabold,
    letterSpacing: -0.7,
  },
  scoreDisplay: {
    fontFamily: PrimitiveTokens.font.family.extrabold,
    fontSize: PrimitiveTokens.font.size.scoreDisplay,
    lineHeight: Math.round(PrimitiveTokens.font.size.scoreDisplay * 1.1),
    fontWeight: PrimitiveTokens.font.weight.extrabold,
    letterSpacing: -1,
  },
} as const;

export type TypographyVariant = keyof typeof TypographyScale;

export type ThemeColors = typeof SemanticLightTokens.color;

export interface DesignTheme {
  isDark: boolean;
  colors: ThemeColors;
  space: typeof PrimitiveTokens.space;
  radius: typeof PrimitiveTokens.radius;
  layout: typeof LayoutTokens;
  component: typeof ComponentTokens;
  typography: typeof TypographyScale;
  elevation: typeof PrimitiveTokens.elevation;
  motion: typeof PrimitiveTokens.motion;
}

export const LightTheme: DesignTheme = {
  isDark: false,
  colors: SemanticLightTokens.color,
  space: PrimitiveTokens.space,
  radius: PrimitiveTokens.radius,
  layout: LayoutTokens,
  component: ComponentTokens,
  typography: TypographyScale,
  elevation: PrimitiveTokens.elevation,
  motion: PrimitiveTokens.motion,
};

export const DarkTheme: DesignTheme = {
  isDark: true,
  colors: SemanticDarkTokens.color as unknown as ThemeColors,
  space: PrimitiveTokens.space,
  radius: PrimitiveTokens.radius,
  layout: LayoutTokens,
  component: ComponentTokens,
  typography: TypographyScale,
  elevation: PrimitiveTokens.elevation,
  motion: PrimitiveTokens.motion,
};
`;

  const themeDir = path.dirname(outputPath);
  if (!fs.existsSync(themeDir)) {
    fs.mkdirSync(themeDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log('✓ Successfully generated:', outputPath);
}

generate();
