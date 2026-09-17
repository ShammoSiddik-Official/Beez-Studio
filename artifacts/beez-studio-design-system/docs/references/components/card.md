# Card

## Source evidence

- `artifacts/beez-studio/src/components/ui/card.tsx`
- Used for grouped content and the public site's not-found state.

## Extracted behavior

- Composes `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.
- Provides a bordered surface with a quiet background.
- Supports content hierarchy without heavy shadow.

## BeeZ treatment

- Prefer thin borders and warm neutral surfaces.
- Use cards to group information, not to create a dense grid of unrelated boxes.
- Let project imagery and editorial headings provide emphasis.