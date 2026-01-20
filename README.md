# Sickass Artist Platform

A artist platform with built-in merch store and forum. Working on expanding features.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Key Features

- **Interactive Navigation**: Automotive-inspired gear shift interface (R, N, 1-5).
- **Pro Chatroom**: Discord-like real-time messaging with message stacking, reactions, and mute/deafen settings.
- **Theme**: High-performance dark aesthetic with scarlet/crimson red accents.
- **Real-time Backend**: Powered by Convex for instant syncing and optimistic updates.
- **Auth**: Secure user management with Auth0.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS.
- **Backend**: Convex.
- **Auth**: Auth0.
- **Icons**: Iconify (Solar set).

## Project Structure

- `src/components/Chat`: Real-time messaging components.
- `src/components/GearNavigation`: Core UI navigation system.
- `convex/`: Backend schema and API functions.
- `src/hooks/`: Custom state and logic hooks.

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs) folder:

- **[Documentation Index](./docs/README.md)** - Complete guide to all documentation
- **Features** - Analytics, offline support, performance monitoring, and more
- **Schema** - Database schema documentation for all tables
- **Implementation Guides** - Step-by-step guides for key features

---
License: MIT
