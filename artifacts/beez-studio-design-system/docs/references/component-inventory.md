# BeeZ Studio component inventory

This inventory is extracted from the existing BeeZ Studio frontend. The
design-system preview uses the same reusable UI families and themes them with
the extracted tokens.

The source app uses a shadcn/Radix-style component layer. The design-system
package keeps behavior and accessibility from those primitives while making
the BeeZ visual language the single styling source.

| Family | Reference | Status | Notes |
|---|---|---|---|
| Button | `components/button.md` | implemented | Core action family; lime primary role and quiet outline/ghost states |
| Card | `components/card.md` | implemented | Portfolio, content, and admin grouping surface |
| Badge | `components/badge.md` | implemented | Project/category/status labels |
| Input | `components/input.md` | implemented | Contact and Console form control |
| Navigation | `components/navigation.md` | implemented | Public navigation and application navigation primitives |
| Label and form field | source `src/components/ui/label.tsx`, `field.tsx`, `form.tsx` | implemented | Accessible form composition |
| Textarea and select | source `src/components/ui/textarea.tsx`, `select.tsx` | implemented | Contact, project, and admin forms |
| Dialog, sheet, drawer | source `src/components/ui/dialog.tsx`, `sheet.tsx`, `drawer.tsx` | implemented | Confirmations and mobile navigation |
| Tabs and accordion | source `src/components/ui/tabs.tsx`, `accordion.tsx` | implemented | Grouped project and content views |
| Table and pagination | source `src/components/ui/table.tsx`, `pagination.tsx` | implemented | Console data management |
| Alert, toast, sonner | source `src/components/ui/alert.tsx`, `toast.tsx`, `sonner.tsx` | implemented | Status and action feedback |
| Skeleton, spinner, progress | source `src/components/ui/skeleton.tsx`, `spinner.tsx`, `progress.tsx` | implemented | Loading and progress states |
| Avatar, item, empty state | source `src/components/ui/avatar.tsx`, `item.tsx`, `empty.tsx` | implemented | People, rows, and no-content states |
| Chart | source `src/components/ui/chart.tsx` | implemented | Dashboard data visualization using the on-brand chart scale |

The remaining scaffolded primitive demos are included because the existing
workspace already ships the matching reusable UI layer. Product-specific
compositions such as `Navbar`, `Footer`, `ChatBot`, project pages, and Console
pages remain in their consuming applications.