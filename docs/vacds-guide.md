# VA Clinical Design System (VACDS) Implementation Guide

This guide covers the implementation of the VA Clinical Design System in the AI Assist application.

## VACDS Design Principles

**8 Clinical Design Principles** (must follow):

1. Complement & supplement EHR, don't replace it
2. Maximize clarity; minimize noise
3. Provide guidance with non-obtrusive feedback loops
4. Facilitate insights over raw information
5. Bridge clinical decisions & clinical actions
6. Support clinicians' sense of control
7. Configuration, not customization
8. Deliver consistency through total system approach

**Implementation Guidelines**:

- Ease cognitive burden
- Reduce noise
- Make interfaces actionable
- Provide useful context
- Train the user
- Empower clinicians

## VACDS Component-First Approach

**CRITICAL: Use VACDS React components and utility classes - NO custom CSS!**

### Import VACDS styles in main.css:

```css
@import "@department-of-veterans-affairs/clinical-design-system/dist/core/css/utility-classes.css";
@import "@department-of-veterans-affairs/clinical-design-system/dist/core/css/typography.css";
```

### Utility Class Reference

VACDS utilities are based on USWDS (U.S. Web Design System). When looking for utility classes:

- **Primary Reference**: <https://designsystem.digital.gov/utilities/>
- The VACDS CSS includes most USWDS utilities but not all
- Some utilities like `overflow-*`, `cursor-*`, and hover states may need custom CSS

**Common USWDS/VACDS Utility Classes:**

- **Display**: `display-block`, `display-flex`, `display-none`, `display-inline`
- **Flex**: `flex-1` through `flex-12`, `flex-column`, `flex-row`, `flex-align-center`, `flex-justify-center`
- **Spacing**: `padding-[0-5]`, `margin-[0-5]`, `margin-bottom-[1-5]`, `margin-x-auto`
- **Typography**: `font-heading-[1-5]`, `font-body-[xs|sm|md|lg]`, `text-bold`, `text-underline`
- **Colors**: `text-[color]`, `bg-[color]`, `border-[color]` (e.g., `text-primary`, `bg-base-lightest`)
- **Borders**: `border`, `border-1px`, `border-2px`, `border-[side]-[width]`, `radius-[sm|md|lg]`
- **Height/Width**: `height-full`, `width-full`, `height-[1-15]`, `width-[1-15]`
- **Font families**: `font-family-sans`, `font-family-serif`, `font-family-mono`

### Custom CSS Requirements

Some utilities not available in VACDS/USWDS are defined in `main.css`:

- `overflow-hidden`, `overflow-y-auto` - For scrollable regions
- `cursor-pointer` - For interactive elements
- `outline-0` - For form focus states
- `hover:bg-base-lighter`, `hover:text-primary` - For hover states

### Usage Pattern

```tsx
// Always prefer VACDS components
<Alert status="info" className="margin-bottom-3">
  Important information
</Alert>

// Use utilities for layout only
<div className="padding-4 max-width-tablet margin-x-auto">
  <Card>...</Card>
</div>
```

## VACDS Setup

### GitHub Package Registry Authentication

```bash
# ~/.npmrc
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN

# ./.npmrc (project root)
@department-of-veterans-affairs:registry=https://npm.pkg.github.com/
```

### Available VACDS Components

- Accordion, Alert, Button, Card, Chart
- Clinician Initials Button, Data Grid
- Form Controls, Modal, Toast, Tooltip
- 40+ clinical-specific components

### VACDS Resources

- **[Storybook](https://crispy-succotash-9k23jen.pages.github.io/) - PRIMARY REFERENCE for React components**
- [Developer Guide](https://department-of-veterans-affairs.github.io/clinical-design/how-to-use/getting-started-for-developers)
- [Design Principles](https://department-of-veterans-affairs.github.io/clinical-design/design-principles/)
- [Component Library](https://department-of-veterans-affairs.github.io/clinical-design/components/)

## Implementation Best Practices

### Component Usage

- VACDS components are imported directly from `@department-of-veterans-affairs/clinical-design-system`
- Styling uses VACDS utility classes ONLY - NO CSS Modules, NO SCSS
- NO arbitrary values - only VACDS components and utilities

Example:
```typescript
import { Card, Button } from '@department-of-veterans-affairs/clinical-design-system';

// Use only utility classes for spacing/layout
<Card className="margin-bottom-3">
  <CardBody className="padding-3">
    <Button primary>Action</Button>
  </CardBody>
</Card>
```

### Key Rules

1. **Use VACDS design tokens only** - no custom colors or spacing
2. **NO CSS Modules, NO SCSS, NO custom styles**
3. **Always use clsx for conditional classes** - Never use template literals or string concatenation

### Common Tasks

#### Add a new VACDS component

```typescript
import { Button, Alert } from '@department-of-veterans-affairs/clinical-design-system';
```

#### Conditional Classes

```typescript
import clsx from 'clsx';

// ✅ Correct
<div className={clsx('base-class', isActive && 'active-class')} />

// ❌ Wrong - don't use template literals
<div className={`base-class ${isActive ? 'active-class' : ''}`} />
```