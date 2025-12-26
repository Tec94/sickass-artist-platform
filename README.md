# Sickass Artist Platform

A cyberpunk-themed artist platform with a unique gear-based navigation system.

## Features

- **Gear Navigation**: Interactive gear shift interface (R, N, 1-5) for navigating between sections
- **Gear Stick**: Draggable vertical gear shift control with snap animation
- **Windshield Frame**: Automotive-style content display with bezel/border effects
- **Parallax Background**: Canvas-based animated background with multiple depth layers
- **Keyboard Controls**: Full keyboard navigation (Arrow Up/Down, R/N/1-5 keys)
- **Touch Support**: Swipe gestures for mobile navigation
- **Responsive Design**: Optimized for mobile (<768px), tablet (768px-1024px), and desktop (1024px+)
- **Accessibility**: WCAG AA compliant with ARIA labels and keyboard navigation

## Tech Stack

- **React 18+** with TypeScript in strict mode
- **Vite** as build tool
- **Tailwind CSS** with custom cyberpunk theme
- **React Router v6** for routing
- **Canvas API** for parallax background (no external animation libraries)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── GearNavigation/
│   │   ├── GearDisplay.tsx       # Mobile gear button display
│   │   ├── GearStick.tsx         # Desktop draggable gear stick
│   │   ├── WindshieldFrame.tsx   # Main content frame wrapper
│   │   └── *.css                 # Component-specific styles
│   ├── NavbarFallback.tsx        # Traditional navbar for mobile/accessibility
│   └── ParallaxBackground.tsx    # Canvas parallax background
├── hooks/
│   └── useGearNavigation.ts      # Gear navigation logic hook
├── contexts/
│   └── GearContext.tsx            # React context for gear state
├── pages/
│   ├── GearPage.tsx               # Layout wrapper with gear navigation
│   └── ContentPage.tsx            # Route content placeholder
├── styles/
│   ├── theme.css                  # CSS variables and base styles
│   ├── animations.css             # Keyframe animations
│   └── responsive.css             # Media queries and breakpoints
├── App.tsx                        # Root component with router
└── main.tsx                       # Application entry point
```

## Navigation

### Desktop
- Use the gear stick on the left to shift gears
- Click directly on gear markers or drag the stick
- Keyboard: Arrow Up/Down to shift, R/N/1-5 to jump to specific gear

### Mobile
- Tap gear buttons at the top
- Swipe up/down anywhere on the page to shift gears
- Use the navbar hamburger menu for navigation

### Keyboard Shortcuts
- `Arrow Up` - Shift to previous gear
- `Arrow Down` - Shift to next gear
- `R`, `N`, `1`, `2`, `3`, `4`, `5` - Jump to specific gear
- `Escape` - Close mobile menu

## Customization

### Theme Colors
Edit `src/styles/theme.css` or `tailwind.config.ts` to customize the color palette.

### Gear Configuration
Modify `GEAR_ORDER` arrays in `src/hooks/useGearNavigation.ts` and related files to change gear names or order.

### Animations
Adjust animations in `src/styles/animations.css` or `tailwind.config.ts`.

## Accessibility

- All interactive elements are keyboard accessible
- ARIA labels provided for screen readers
- Respects `prefers-reduced-motion` setting
- Touch targets meet minimum 44x44px requirement
- Color contrast >= 4.5:1 (WCAG AA)

## Performance

- Canvas parallax uses `requestAnimationFrame` for 60fps rendering
- Scroll listeners are throttled
- Animations respect `prefers-reduced-motion`
- Target Lighthouse performance score >= 90

## Development Workflow

1. Create feature branches from `main`
2. Follow existing code conventions and patterns
3. Use TypeScript strict mode (no `any` types)
4. Ensure all tests pass and linting succeeds
5. Update documentation for significant changes

## Future Development

- Chat 2: Clerk authentication integration
- Chat 3-7: Content pages for each gear section
- User profile management
- Content creation and editing tools
- Social features and community integration

## License

MIT
