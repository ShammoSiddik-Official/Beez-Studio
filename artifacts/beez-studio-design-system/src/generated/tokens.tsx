/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#f8f8f6",
      "foreground": "#141414",
      "border": "#e0e0e0",
      "card": "#ffffff",
      "cardForeground": "#141414",
      "popover": "#ffffff",
      "popoverForeground": "#141414",
      "primary": "#6f962c",
      "primaryForeground": "#ffffff",
      "secondary": "#f0f0f0",
      "secondaryForeground": "#141414",
      "muted": "#f0f0f0",
      "mutedForeground": "#6b6b6b",
      "accent": "#6f962c",
      "accentForeground": "#ffffff",
      "destructive": "#ef4444",
      "destructiveForeground": "#fafafa",
      "input": "#e0e0e0",
      "ring": "#6f962c",
      "chart1": "#6f962c",
      "chart2": "#141414",
      "chart3": "#4d91b3",
      "chart4": "#70c299",
      "chart5": "#b34d4d",
      "sidebar": "#fafafa",
      "sidebarForeground": "#404040",
      "sidebarBorder": "#e5e5e5",
      "sidebarPrimary": "#6f962c",
      "sidebarPrimaryForeground": "#ffffff",
      "sidebarAccent": "#f0f0f0",
      "sidebarAccentForeground": "#141414",
      "sidebarRing": "#6f962c"
    },
    "dark": {
      "background": "#0f0f0f",
      "foreground": "#f1efea",
      "border": "#292929",
      "card": "#1a1a1a",
      "cardForeground": "#f1efea",
      "popover": "#1a1a1a",
      "popoverForeground": "#f1efea",
      "primary": "#8ec431",
      "primaryForeground": "#0f0f0f",
      "secondary": "#242424",
      "secondaryForeground": "#f1efea",
      "muted": "#242424",
      "mutedForeground": "#8c8c8c",
      "accent": "#8ec431",
      "accentForeground": "#0f0f0f",
      "destructive": "#7f1d1d",
      "destructiveForeground": "#f1efea",
      "input": "#383838",
      "ring": "#8ec431",
      "chart1": "#8ec431",
      "chart2": "#f1efea",
      "chart3": "#f08c3c",
      "chart4": "#a855d6",
      "chart5": "#e0497a",
      "sidebar": "#141414",
      "sidebarForeground": "#f5f5f5",
      "sidebarBorder": "#262626",
      "sidebarPrimary": "#8ec431",
      "sidebarPrimaryForeground": "#0f0f0f",
      "sidebarAccent": "#242424",
      "sidebarAccentForeground": "#f1efea",
      "sidebarRing": "#8ec431"
    }
  },
  "fontFamily": {
    "sans": [
      "Inter",
      "sans-serif"
    ],
    "serif": [
      "Playfair Display",
      "Georgia",
      "serif"
    ],
    "mono": [
      "Menlo",
      "monospace"
    ]
  },
  "radius": "0.25rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
