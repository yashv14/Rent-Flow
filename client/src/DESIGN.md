# RentFlow — Stitch UI Design System

## Design Tokens

### Colors

| Token                | Value               | Usage                        |
|----------------------|---------------------|------------------------------|
| `--st-primary`       | `#4F46E5`           | Primary actions, nav active  |
| `--st-primary-hover` | `#4338CA`           | Primary hover states         |
| `--st-primary-light` | `rgba(79,70,229,.08)`| Primary tinted backgrounds  |
| `--st-surface`       | `#FFFFFF`           | Card / panel backgrounds     |
| `--st-surface-dim`   | `#F9FAFB`           | Page background              |
| `--st-surface-hover` | `#F3F4F6`           | Hover highlight rows/items   |
| `--st-border`        | `#E5E7EB`           | Dividers, card outlines      |
| `--st-text`          | `#111827`           | Primary text                 |
| `--st-text-secondary`| `#6B7280`           | Secondary / muted text       |
| `--st-text-tertiary` | `#9CA3AF`           | Placeholder, disabled        |
| `--st-danger`        | `#EF4444`           | Errors, destructive actions  |
| `--st-success`       | `#10B981`           | Success states               |
| `--st-warning`       | `#F59E0B`           | Warning states               |
| `--st-info`          | `#3B82F6`           | Informational highlights     |

### Typography

| Token                    | Value                                 |
|--------------------------|---------------------------------------|
| `--st-font-sans`         | `'Inter', system-ui, sans-serif`      |
| `--st-font-heading`      | `'Inter', system-ui, sans-serif`      |
| `--st-font-mono`         | `'JetBrains Mono', ui-monospace, monospace` |
| `--st-text-xs`           | `0.75rem`  (12px)                     |
| `--st-text-sm`           | `0.875rem` (14px)                     |
| `--st-text-base`         | `1rem`     (16px)                     |
| `--st-text-lg`           | `1.125rem` (18px)                     |
| `--st-text-xl`           | `1.25rem`  (20px)                     |
| `--st-text-2xl`          | `1.5rem`   (24px)                     |

### Spacing

Base unit: `4px`. Scale: 1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 5 = 20px, 6 = 24px, 8 = 32px.

### Elevation

| Level   | Box-shadow                                                                 |
|---------|----------------------------------------------------------------------------|
| `--st-shadow-sm`  | `0 1px 2px rgba(0,0,0,.05)`                                       |
| `--st-shadow`     | `0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)`            |
| `--st-shadow-md`  | `0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06)`           |
| `--st-shadow-lg`  | `0 10px 15px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.05)`          |

### Border Radius

| Token              | Value  |
|--------------------|--------|
| `--st-radius-sm`   | `6px`  |
| `--st-radius`      | `8px`  |
| `--st-radius-md`   | `12px` |
| `--st-radius-lg`   | `16px` |
| `--st-radius-full` | `9999px` |

## Components

### Navbar
- Height: 64px
- Background: `--st-surface`
- Border: 1px solid `--st-border` (bottom)
- Brand: `--st-text`, font-weight 700
- Links: font-size `--st-text-sm`, font-weight 500, color `--st-text-secondary`
- Active link: color `--st-primary`, underline offset with 2px bottom border
- Mobile: hamburger toggle, slide-down panel

### Cards
- Background: `--st-surface`
- Border: 1px solid `--st-border`
- Radius: `--st-radius-md`
- Shadow: `--st-shadow-sm`
- Padding: 24px

### Buttons
- Primary: `--st-primary` bg, white text, `--st-radius` border-radius
- Secondary: transparent bg, `--st-border` outline
- Danger: `--st-danger` bg, white text
- Height: 40px, padding 0 16px, font-weight 500

### Forms
- Input height: 40px
- Border: 1px solid `--st-border`
- Radius: `--st-radius`
- Focus ring: 2px `--st-primary-light` outline

### Layout Container
- Max-width: 1280px
- Padding: 0 24px
- Centered with margin auto
