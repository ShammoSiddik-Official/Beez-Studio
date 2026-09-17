# BeeZ Studio source references

This design system was extracted from the existing BeeZ Studio workspace rather
than from a generic style picker.

| File | Subject | Kind | Source | Extracted |
|---|---|---|---|---|
| `logos/beez-studio-logo.png` | brand logo | brand-asset | `artifacts/beez-studio/public/beez-studio-logo.png` | Primary BeeZ Studio mark |
| `components/button.md` | primary actions | app-ui | `artifacts/beez-studio/src/components/ui/button.tsx` | Variants, compact sizing, lime action color |
| `components/card.md` | grouped content | app-ui | `artifacts/beez-studio/src/components/ui/card.tsx` | Quiet surfaces, thin borders, restrained radius |
| `components/badge.md` | status/category labels | app-ui | `artifacts/beez-studio/src/components/ui/badge.tsx` | Compact labels and secondary/outline states |
| `components/input.md` | text entry | app-ui | `artifacts/beez-studio/src/components/ui/input.tsx` | Border, focus ring, readable control height |
| `components/navigation.md` | navigation primitives | app-ui | `artifacts/beez-studio/src/components/layout/Navbar.tsx` and `src/components/ui/navigation-menu.tsx` | Spacious navigation, clear active state |

The original BeeZ Studio site uses `Inter` for UI/body text and `Playfair
Display` for editorial display text. Its source theme provides light and dark
neutral surfaces with an HSL 82 lime-green brand role, a compact `0.25rem`
radius, and a `0.25rem` spacing step.