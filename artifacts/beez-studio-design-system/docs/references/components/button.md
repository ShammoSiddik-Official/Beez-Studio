# Button

## Source evidence

- `artifacts/beez-studio/src/components/ui/button.tsx`
- Used by shared UI and layout primitives in the public website.

## Extracted behavior

- `default`, `destructive`, `outline`, `secondary`, `ghost`, and `link` variants.
- `default`, `sm`, `lg`, and `icon` sizes.
- Keyboard-visible focus ring.
- Disabled state uses reduced opacity and prevents interaction.
- Icon children are compact and aligned with the label.

## BeeZ treatment

- Use `primary`/lime for the main action only.
- Use outline and ghost actions for secondary navigation or cancellation.
- Keep labels short and action-oriented.
- Avoid multiple competing lime buttons in the same region.