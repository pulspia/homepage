# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bilingual (Korean/English) React homepage for JAHA LABS, an AI solutions company. The application features:

- **Dark/Light theme switching** with system-wide theme management
- **Internationalization (i18n)** supporting Korean and English
- **Single-page application** with section-based navigation
- **Responsive design** using Tailwind CSS
- **Component-based architecture** with reusable UI components
- **EmailJS integration** for contact form functionality

## Development Commands

```bash
# Start development server (runs on localhost:3000)
npm start

# Run tests in watch mode
npm test

# Build for production
npm run build

# Eject from Create React App (irreversible)
npm run eject
```

## Architecture

### Core Application State
- **Theme management**: Global dark/light mode state in `App.js`
- **Language switching**: Korean/English toggle with content objects
- **Document title**: Updates dynamically based on selected language

### Component Structure
```
src/
├── App.js                 # Main app with theme/lang state
├── components/
│   ├── Header/            # Navigation with theme/lang toggles
│   ├── Hero/              # Landing section with CTA
│   ├── Services/          # Services showcase
│   ├── About/             # Company information
│   ├── Contact/           # Contact form with EmailJS integration
│   ├── Footer/            # Site footer
│   └── ui/                # Reusable UI components
│       ├── Button.tsx     # Shadcn/ui button with variants
│       └── Card.tsx       # Card component
├── lib/
│   └── utils.ts           # Utility functions (cn for className merging)
└── index.css              # Global styles and Tailwind imports
```

### State Management Pattern
- **Props drilling** from App.js for theme and language state
- **Content objects** in each component for bilingual support
- **useEffect hooks** for DOM manipulation (theme classes, document title)

### Styling Architecture
- **Tailwind CSS** with dark mode support via `class` strategy
- **Korean font optimization** with Malgun Gothic as default
- **CSS custom properties** for consistent theming
- **Component variants** using `class-variance-authority` for UI components

### Key Dependencies
- **React 19**: Latest React version
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library (Sun, Moon, Globe icons)
- **@emailjs/browser**: Email service integration for contact form
- **class-variance-authority**: Component variant management
- **tailwind-merge + clsx**: Conditional className utilities

## Development Notes

### Theme Implementation
The app uses Tailwind's class-based dark mode. Theme switching:
1. Updates React state in App.js
2. Manipulates document root className via useEffect
3. CSS classes automatically apply based on `dark:` prefixes

### Internationalization Pattern
Each component contains a `content` object with language keys:
```javascript
const content = {
  ko: { title: '한국어 제목' },
  en: { title: 'English Title' }
};
```

### Component Variants
UI components use `cva` (class-variance-authority) for type-safe styling variants. The `cn()` utility function merges Tailwind classes intelligently.

### Mobile Responsiveness
The layout uses Tailwind's responsive prefixes (`md:`, `lg:`) with a mobile-first approach. Header navigation adapts to smaller screens.

## EmailJS Configuration

The contact form uses EmailJS for email sending functionality. Configuration is managed through environment variables:

- `REACT_APP_EMAILJS_SERVICE_ID`: EmailJS service identifier
- `REACT_APP_EMAILJS_TEMPLATE_ID`: Email template identifier
- `REACT_APP_EMAILJS_PUBLIC_KEY`: Public API key for EmailJS

**Implementation Details**:
- EmailJS is initialized in `Contact.js` using `useEffect` with the public key
- Form data is sent to `pulspia@gmail.com` with timestamp
- The form includes loading states, success/error messages, and form reset on success
- Template variables: `{{from_name}}`, `{{from_email}}`, `{{message}}`, `{{to_email}}`, `{{timestamp}}`

See [EMAILJS-SETUP.md](EMAILJS-SETUP.md) for detailed setup instructions.

## Environment Variables

Required environment variables in `.env`:
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `REACT_APP_EMAILJS_SERVICE_ID`: EmailJS service ID
- `REACT_APP_EMAILJS_TEMPLATE_ID`: EmailJS template ID
- `REACT_APP_EMAILJS_PUBLIC_KEY`: EmailJS public key

**Note**: The `.env` file is gitignored but contains working credentials for this project.
