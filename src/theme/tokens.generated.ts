/**
 * ============================================================================
 * ROUTINE SATHY CENTRALIZED DESIGN SYSTEM TOKENS
 * ============================================================================
 * GENERATED, DO NOT EDIT DIRECTLY.
 * Source: design-tokens/tokens.json
 * Generated at: 2026-10-30T14:38:02.555Z
 * ============================================================================
 */

export const PrimitiveTokens = {
  "color": {
    "forest": {
      "600": "#136B47",
      "700": "#0E4933",
      "800": "#0B3D2E",
      "900": "#07261B",
      "950": "#052418"
    },
    "fern": {
      "50": "#E3F3E9",
      "100": "#D1FAE5",
      "200": "#86EFAC",
      "300": "#5BDB8B",
      "400": "#16A34A",
      "500": "#1E9E5A",
      "600": "#12803F"
    },
    "amber": {
      "50": "#FFFBEB",
      "100": "#FEF3C7",
      "200": "#FDE68A",
      "300": "#FCD34D",
      "400": "#FBBF24",
      "500": "#F59E0B",
      "600": "#D97706",
      "700": "#B45309",
      "800": "#92400E",
      "900": "#78350F",
      "950": "#451A03"
    },
    "sky": {
      "50": "#F0F9FF",
      "100": "#E0F2FE",
      "200": "#BAE6FD",
      "400": "#38BDF8",
      "500": "#0EA5E9",
      "600": "#0284C7",
      "700": "#0369A1",
      "800": "#075985",
      "900": "#0C4A6E"
    },
    "indigo": {
      "100": "#EEF2FF",
      "200": "#C7D2FE",
      "400": "#818CF8",
      "500": "#6366F1",
      "600": "#4F46E5",
      "700": "#4338CA",
      "800": "#3730A3",
      "900": "#312E81"
    },
    "rose": {
      "50": "#FEF2F2",
      "100": "#FEE2E2",
      "200": "#FECACA",
      "400": "#F87171",
      "500": "#EF4444",
      "600": "#DC2626",
      "700": "#B91C1C"
    },
    "neutral": {
      "0": "#FFFFFF",
      "50": "#FBFBF9",
      "100": "#F7F8F6",
      "200": "#F0F4F1",
      "300": "#DFE7E1",
      "400": "#98B0A3",
      "500": "#52665C",
      "600": "#4F655B",
      "700": "#384A41",
      "800": "#1C3528",
      "900": "#0B3D2E",
      "950": "#07140E"
    }
  },
  "space": {
    "0": 0,
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "7": 28,
    "8": 32,
    "9": 36,
    "10": 40,
    "12": 48,
    "14": 56,
    "16": 64,
    "0_5": 2,
    "1_5": 6,
    "2_5": 10,
    "3_5": 14
  },
  "radius": {
    "none": 0,
    "xs": 4,
    "sm": 8,
    "md": 12,
    "lg": 16,
    "xl": 22,
    "2xl": 28,
    "3xl": 34,
    "full": 9999
  },
  "font": {
    "family": {
      "sans": "Plus Jakarta Sans, system-ui, sans-serif",
      "serif": "serif"
    },
    "size": {
      "micro": 10,
      "captionSm": 11,
      "caption": 12,
      "bodySm": 13,
      "body": 15,
      "bodyLg": 17,
      "h4": 18,
      "h3": 21,
      "h2": 26,
      "h1": 32,
      "scoreDisplay": 44
    },
    "weight": {
      "regular": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700",
      "extrabold": "800"
    },
    "lineHeight": {
      "tight": 1.15,
      "snug": 1.3,
      "normal": 1.5,
      "relaxed": 1.65
    }
  },
  "elevation": {
    "none": {
      "elevation": 0,
      "shadowOpacity": 0
    },
    "low": {
      "elevation": 2,
      "shadowOpacity": 0.05,
      "shadowRadius": 6,
      "shadowOffset": {
        "width": 0,
        "height": 2
      }
    },
    "card": {
      "elevation": 3,
      "shadowOpacity": 0.07,
      "shadowRadius": 12,
      "shadowOffset": {
        "width": 0,
        "height": 4
      }
    },
    "high": {
      "elevation": 6,
      "shadowOpacity": 0.12,
      "shadowRadius": 20,
      "shadowOffset": {
        "width": 0,
        "height": 8
      }
    },
    "sunGlow": {
      "elevation": 4,
      "shadowOpacity": 0.35,
      "shadowRadius": 14,
      "shadowOffset": {
        "width": 0,
        "height": 4
      }
    }
  },
  "motion": {
    "duration": {
      "fast": 150,
      "base": 250,
      "slow": 400,
      "ambient": 2200
    }
  },
  "size": {
    "touchMin": 48,
    "iconSm": 16,
    "iconMd": 20,
    "iconLg": 24,
    "iconXl": 32,
    "tileSm": 36,
    "tileMd": 44,
    "tileLg": 52
  }
} as const;

export const SemanticLightTokens = {
  "color": {
    "bg": {
      "app": "#F7F8F6",
      "surface": "#FFFFFF",
      "surfaceAlt": "#F0F4F1",
      "surfaceInverse": "#07261B",
      "tileMint": "#E3F3E9",
      "tileSky": "#E0F2FE",
      "tileIndigo": "#EEF2FF",
      "tileAmber": "#FEF3C7"
    },
    "text": {
      "primary": "#0B3D2E",
      "secondary": "#4F655B",
      "muted": "#52665C",
      "inverse": "#FFFFFF",
      "inverseMuted": "#CFE3D6",
      "link": "#136B47",
      "accent": "#16A34A"
    },
    "action": {
      "primary": {
        "bg": "#FBBF24",
        "fg": "#0B3D2E",
        "pressed": "#F59E0B",
        "disabled": "#DFE7E1",
        "disabledFg": "#52665C"
      },
      "secondary": {
        "bg": "#E3F3E9",
        "fg": "#0B3D2E",
        "pressed": "#D1FAE5",
        "disabled": "#F0F4F1",
        "disabledFg": "#52665C"
      },
      "dark": {
        "bg": "#0B3D2E",
        "fg": "#FFFFFF",
        "pressed": "#07261B",
        "disabled": "#DFE7E1",
        "disabledFg": "#52665C"
      },
      "ghost": {
        "bg": "transparent",
        "fg": "#0B3D2E",
        "pressed": "rgba(11, 61, 46, 0.08)",
        "disabled": "transparent",
        "disabledFg": "#98B0A3"
      },
      "danger": {
        "bg": "#FEE2E2",
        "fg": "#B91C1C",
        "pressed": "#FECACA",
        "disabled": "#F0F4F1",
        "disabledFg": "#98B0A3"
      }
    },
    "border": {
      "default": "#DFE7E1",
      "focus": "#1E9E5A",
      "subtle": "#F0F4F1",
      "inverse": "rgba(207, 227, 214, 0.15)"
    },
    "state": {
      "success": "#1E9E5A",
      "successBg": "#E3F3E9",
      "warning": "#F59E0B",
      "warningBg": "#FEF3C7",
      "error": "#DC2626",
      "errorBg": "#FEE2E2",
      "info": "#0284C7",
      "infoBg": "#E0F2FE"
    },
    "score": {
      "wake": {
        "fg": "#1E9E5A",
        "bg": "#E3F3E9"
      },
      "water": {
        "fg": "#0284C7",
        "bg": "#E0F2FE"
      },
      "study": {
        "fg": "#4F46E5",
        "bg": "#EEF2FF"
      }
    },
    "streak": {
      "done": "#1E9E5A",
      "today": "#FBBF24",
      "empty": "#DFE7E1"
    }
  }
} as const;

export const SemanticDarkTokens = {
  "color": {
    "bg": {
      "app": "#052418",
      "surface": "#07261B",
      "surfaceAlt": "#0B3D2E",
      "surfaceInverse": "#F7F8F6",
      "tileMint": "rgba(30, 158, 90, 0.18)",
      "tileSky": "rgba(2, 132, 199, 0.18)",
      "tileIndigo": "rgba(79, 70, 229, 0.18)",
      "tileAmber": "rgba(251, 191, 36, 0.18)"
    },
    "text": {
      "primary": "#FFFFFF",
      "secondary": "#CFE3D6",
      "muted": "rgba(207, 227, 214, 0.65)",
      "inverse": "#0B3D2E",
      "inverseMuted": "#4F655B",
      "link": "#5BDB8B",
      "accent": "#5BDB8B"
    },
    "action": {
      "primary": {
        "bg": "#FBBF24",
        "fg": "#0B3D2E",
        "pressed": "#F59E0B",
        "disabled": "rgba(255, 255, 255, 0.2)",
        "disabledFg": "rgba(255, 255, 255, 0.45)"
      },
      "secondary": {
        "bg": "rgba(255, 255, 255, 0.10)",
        "fg": "#FFFFFF",
        "pressed": "rgba(255, 255, 255, 0.18)",
        "disabled": "rgba(255, 255, 255, 0.05)",
        "disabledFg": "rgba(255, 255, 255, 0.3)"
      },
      "dark": {
        "bg": "#1E9E5A",
        "fg": "#FFFFFF",
        "pressed": "#12803F",
        "disabled": "rgba(255, 255, 255, 0.2)",
        "disabledFg": "rgba(255, 255, 255, 0.45)"
      },
      "ghost": {
        "bg": "transparent",
        "fg": "#FFFFFF",
        "pressed": "rgba(255, 255, 255, 0.10)",
        "disabled": "transparent",
        "disabledFg": "rgba(255, 255, 255, 0.3)"
      },
      "danger": {
        "bg": "rgba(239, 68, 68, 0.2)",
        "fg": "#F87171",
        "pressed": "rgba(239, 68, 68, 0.3)",
        "disabled": "rgba(255, 255, 255, 0.05)",
        "disabledFg": "rgba(255, 255, 255, 0.3)"
      }
    },
    "border": {
      "default": "rgba(207, 227, 214, 0.15)",
      "focus": "#16A34A",
      "subtle": "rgba(255, 255, 255, 0.08)",
      "inverse": "#DFE7E1"
    },
    "state": {
      "success": "#5BDB8B",
      "successBg": "rgba(30, 158, 90, 0.2)",
      "warning": "#FBBF24",
      "warningBg": "rgba(251, 191, 36, 0.2)",
      "error": "#F87171",
      "errorBg": "rgba(239, 68, 68, 0.2)",
      "info": "#38BDF8",
      "infoBg": "rgba(14, 165, 233, 0.2)"
    },
    "score": {
      "wake": {
        "fg": "#5BDB8B",
        "bg": "rgba(30, 158, 90, 0.2)"
      },
      "water": {
        "fg": "#38BDF8",
        "bg": "rgba(2, 132, 199, 0.2)"
      },
      "study": {
        "fg": "#818CF8",
        "bg": "rgba(79, 70, 229, 0.2)"
      }
    },
    "streak": {
      "done": "#5BDB8B",
      "today": "#FBBF24",
      "empty": "rgba(207, 227, 214, 0.25)"
    }
  }
} as const;

export const LayoutTokens = {
  "space": {
    "screenPadding": 16,
    "screenPaddingX": 20,
    "cardPadding": 20,
    "cardPaddingCompact": 16,
    "cardGap": 12,
    "rowGap": 10,
    "sectionGap": 24
  },
  "radius": {
    "button": 9999,
    "card": 22,
    "cardSm": 12,
    "cardLg": 28,
    "chip": 9999,
    "input": 12,
    "tile": 12,
    "badge": 8
  }
} as const;

export const ComponentTokens = {
  "button": {
    "heightSm": 36,
    "heightMd": 48,
    "heightLg": 54,
    "minTouch": 48
  },
  "tabBar": {
    "height": 64
  },
  "habitRow": {
    "minHeight": 64
  },
  "brandLandscape": {
    "skyTop": "#0A3326",
    "skyMid": "#14503A",
    "skyBottom": "#2D6B48",
    "sunGlow": "#FFC94D",
    "sunTop": "#FFD84D",
    "sunBottom": "#F5A800",
    "hillBack": "#1C5C3D",
    "hillFront": "#0D3A29",
    "trail": "#E8F5EC",
    "brandMint": "#5BD28F"
  }
} as const;

export const TypographyScale = {
  micro: {
    fontSize: PrimitiveTokens.font.size.micro,
    lineHeight: Math.round(PrimitiveTokens.font.size.micro * 1.3),
    fontWeight: PrimitiveTokens.font.weight.semibold,
  },
  captionSm: {
    fontSize: PrimitiveTokens.font.size.captionSm,
    lineHeight: Math.round(PrimitiveTokens.font.size.captionSm * 1.35),
    fontWeight: PrimitiveTokens.font.weight.medium,
  },
  caption: {
    fontSize: PrimitiveTokens.font.size.caption,
    lineHeight: Math.round(PrimitiveTokens.font.size.caption * 1.4),
    fontWeight: PrimitiveTokens.font.weight.medium,
  },
  bodySm: {
    fontSize: PrimitiveTokens.font.size.bodySm,
    lineHeight: Math.round(PrimitiveTokens.font.size.bodySm * 1.45),
    fontWeight: PrimitiveTokens.font.weight.regular,
  },
  body: {
    fontSize: PrimitiveTokens.font.size.body,
    lineHeight: Math.round(PrimitiveTokens.font.size.body * 1.5),
    fontWeight: PrimitiveTokens.font.weight.regular,
  },
  bodyStrong: {
    fontSize: PrimitiveTokens.font.size.body,
    lineHeight: Math.round(PrimitiveTokens.font.size.body * 1.5),
    fontWeight: PrimitiveTokens.font.weight.semibold,
  },
  bodyLg: {
    fontSize: PrimitiveTokens.font.size.bodyLg,
    lineHeight: Math.round(PrimitiveTokens.font.size.bodyLg * 1.5),
    fontWeight: PrimitiveTokens.font.weight.semibold,
  },
  h4: {
    fontSize: PrimitiveTokens.font.size.h4,
    lineHeight: Math.round(PrimitiveTokens.font.size.h4 * 1.35),
    fontWeight: PrimitiveTokens.font.weight.bold,
  },
  h3: {
    fontSize: PrimitiveTokens.font.size.h3,
    lineHeight: Math.round(PrimitiveTokens.font.size.h3 * 1.3),
    fontWeight: PrimitiveTokens.font.weight.bold,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: PrimitiveTokens.font.size.h2,
    lineHeight: Math.round(PrimitiveTokens.font.size.h2 * 1.25),
    fontWeight: PrimitiveTokens.font.weight.extrabold,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: PrimitiveTokens.font.size.h1,
    lineHeight: Math.round(PrimitiveTokens.font.size.h1 * 1.2),
    fontWeight: PrimitiveTokens.font.weight.extrabold,
    letterSpacing: -0.7,
  },
  scoreDisplay: {
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
