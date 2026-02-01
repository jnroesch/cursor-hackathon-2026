# Profile Dashboard - Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                             │
│  ┌──┐  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━┓ │
│  │ I│  ┃                      HEADER AREA                             ┃  ┃  PROFILE     ┃ │
│  └──┘  ┃  OVERVIEW                                                    ┃  ┃  SETTINGS    ┃ │
│        ┃  Your Publishing Dashboard                                   ┃  ┃              ┃ │
│  ┌──┐  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ┃  [Dark]      ┃ │
│  │🏠│  ┌──────────────────────┬──────────────────────┬──────────────────┐  ┃  #0D0D0D     ┃ │
│  └──┘  │ PROJECTS PUBLISHED   │ PROJECTS IN PROGRESS │ TOTAL REVENUE    │  ┃              ┃ │
│        │                      │                      │                  │  ┃  ┌────────┐  ┃ │
│  ┌──┐  │        3             │         2            │    $12,450       │  ┃  │ Name   │  ┃ │
│  │📊│  │                      │                      │                  │  ┃  └────────┘  ┃ │
│  └──┘  │ ✓ Live on platform   │ ✏ Currently drafting │ $ Copies: 847    │  ┃              ┃ │
│        └──────────────────────┴──────────────────────┴──────────────────┘  ┃  Roles       ┃ │
│  ┌──┐  ┌────────────────────────────────┬────────────────────────────────┐  ┃  [Pills]     ┃ │
│  │  │  │ THIS MONTH'S REVENUE           │ RECENT ACTIVITY                │  ┃              ┃ │
│  └──┘  │                                │                                │  ┃  Favorite    ┃ │
│        │        $1,280          ↑15.3%  │  ◉ New project started         │  ┃  Media       ┃ │
│  ┌──┐  │                                │     2 days ago                 │  ┃  [Textarea]  ┃ │
│  │🚪│  │                                │                                │  ┃              ┃ │
│  └──┘  │ Deposit schedule: Monthly      │  ◉ Project published           │  ┃  About       ┃ │
│        │                                │     1 week ago                 │  ┃  [Textarea]  ┃ │
│   Nav  │                                │                                │  ┃              ┃ │
│   Rail │                                │  ◉ Revenue deposited           │  ┃              ┃ │
│   60px │                                │     2 weeks ago                │  ┃  [Save Btn]  ┃ │
│        └────────────────────────────────┴────────────────────────────────┘  ┗━━━━━━━━━━━━━━┛ │
│                                                                                  320px       │
│                                  Light Grey (#F4F4F4)                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Main Content Area (Light)
- Background: `#F4F4F4` (brand-canvas)
- Text: `#1A1A1A` (text-primary)
- Cards: `#FFFFFF` (brand-white)
- Borders: `#D1D1D1` (brand-border)

### Right Sidebar (Dark)
- Background: `#0D0D0D` (brand-panel)
- Text: `#FFFFFF` with opacity variations
- Inputs: `rgba(255, 255, 255, 0.05)` background
- Borders: `rgba(255, 255, 255, 0.15)`

## Typography

### Dashboard Numbers
- Font: Playfair Display (serif)
- Size: 5xl (3rem - 3.5rem)
- Color: `#1A1A1A`

### Labels
- Font: Inter (sans-serif)
- Size: 0.75rem
- Style: UPPERCASE
- Letter Spacing: 0.1em
- Color: `#666666`

### Body Text
- Font: Inter (sans-serif)
- Size: 14px
- Color: Varies by context

## Responsive Breakpoints

### Desktop (> 1024px)
```
[Nav] [Main Content - 3 columns] [Sidebar]
```

### Tablet (768px - 1024px)
```
[Nav] [Main Content - 2 columns]
      [Sidebar Below]
```

### Mobile (< 768px)
```
[Nav]
[Main Content - 1 column]
[Sidebar Below]
```

## Interactive States

### KPI Cards
- Default: White background, 1px border
- Hover: Subtle border color shift (future enhancement)

### Profile Sidebar Save Button
- Disabled: Transparent, 50% opacity
- Active (has changes): White background, black text
- Hover: 90% opacity

### Role Pills (Dark Mode)
- Background: `rgba(255, 255, 255, 0.1)`
- Border: `rgba(255, 255, 255, 0.2)`
- Hover X button: 70% opacity

### Form Inputs (Dark Mode)
- Default: `rgba(255, 255, 255, 0.05)` background
- Focus: `rgba(255, 255, 255, 0.08)` background
- Border shifts from 0.15 to 0.4 opacity

## Icons Used

### Navigation
- Dashboard: Bar chart icon (new)
- Home: House icon
- Logout: Arrow icon

### KPI Cards
- Published: Checkmark circle
- In Progress: Edit/pen icon
- Revenue: Dollar sign

### Activity Items
- New project: Plus sign
- Published: Checkmark circle
- Revenue: Dollar sign

## Animation/Transitions
- All transitions: 200ms ease
- No heavy animations to maintain minimalist feel
- Subtle opacity changes on hover
