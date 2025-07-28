# VA Clinical Design System (VACDS) Implementation Guide

## Overview

The VA Clinical Design System (VACDS) is a comprehensive design system for creating trustworthy, accessible, and consistent digital services for VA clinician experiences.

## Key Design Principles

### Clinical Design Principles

1. **Complement & supplement EHR, not replace it** - Enhance existing systems
2. **Maximize clarity; minimize noise** - Clean, focused interfaces
3. **Provide non-obtrusive guidance with feedback loops** - Help without interrupting
4. **Facilitate insights over raw information** - Process data for clinicians
5. **Bridge clinical decisions and actions** - Connect thinking to doing
6. **Support clinicians' sense of control** - Empower users
7. **Prioritize configuration over customization** - Standardized but flexible
8. **Deliver consistency through a total system approach** - Unified experience

### Core Implementation Guidelines

- **Ease cognitive burden** - Reduce mental load
- **Make interfaces actionable** - Enable quick decisions
- **Provide useful context** - Show relevant information
- **Empower clinicians** - Give control to users

## Design Tokens

### Token Categories

- **Theme color tokens** - Primary brand colors
- **State color tokens** - Interactive states (hover, active, etc.)
- **Spacing units** - Consistent spacing system
- **Font tokens** - Typography settings
- **Breakpoint tokens** - Responsive design points

### Implementation

- Install VACDS core package: `@department-of-veterans-affairs/component-library`
- Use CSS variables provided by the system
- Never use color as the sole method of communication
- Ensure accessibility compliance (508 standards)

## Utilities

- Simple HTML classes scoped to single CSS properties
- Can override existing component styles
- Use for rapid prototyping or edge cases

## Components

- 40+ reusable UI components
- Available through React component library
- Explore in Storybook for implementation details
- Components range from Accordion to Tooltip

## Best Practices

1. **Always use VACDS tokens** instead of custom values
2. **Prioritize accessibility** - Support all users including those with visual impairments
3. **Follow the design principles** - Don't deviate from established patterns
4. **Use semantic HTML** - Proper structure for screen readers
5. **Test with assistive technologies** - Ensure full accessibility

## CSS Implementation

- Use CSS modules for component-specific styles
- Import VACDS CSS variables and utilities
- Avoid inline styles or Tailwind classes
- Follow BEM naming convention when creating custom classes

## React Integration

```tsx
import { Button, Card, Alert } from '@department-of-veterans-affairs/clinical-design-system';
import '@department-of-veterans-affairs/clinical-design-system/dist/main.css';
import styles from './Component.module.css';
```

## Package Setup

- VACDS is published to GitHub Package Registry (not npm)
- Requires GitHub Personal Access Token with `read:packages` scope
- Package name: `@department-of-veterans-affairs/clinical-design-system`

## React Router v7 Setup

- Use `createBrowserRouter` and `RouterProvider` (not BrowserRouter)
- Import from 'react-router' (not 'react-router-dom')
- Enable data APIs with loaders and actions
- Use proper route configuration with children

## Remember

- VACDS is specifically for clinical interfaces, not general VA.gov
- Focus on reducing cognitive load for busy clinicians
- Consistency across all clinical applications is critical
- Always consider accessibility from the start

## IMPORTANT: Before Committing Code

**ALWAYS run these commands after making changes:**

```bash
# Using mise (preferred)
mise run format    # Format all code
mise run lint      # Check for linting issues
mise run typecheck # Check types
mise run check     # Or just run all checks

# Without mise
pnpm format
pnpm lint
pnpm typecheck
pnpm check
```

**This is MANDATORY before suggesting any commits!**
