# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bilingual (Korean/English) React homepage for Pulspia, an AI solutions company. The application features:

- **Multi-page routing** with React Router (Home, News pages)
- **Dark/Light theme switching** with system-wide theme management
- **Internationalization (i18n)** supporting Korean and English
- **News management system** with Supabase authentication
- **EmailJS integration** for contact form functionality
- **Responsive design** using Tailwind CSS
- **Component-based architecture** with reusable UI components

## Development Commands

```bash
# Start development server (runs on localhost:3000)
npm start

# Run tests in watch mode
npm test

# Run specific test file
npm test -- Contact.test.js

# Build for production
npm run build

# Deploy to GitHub Pages (includes build)
npm run deploy
```

## Architecture

### Application State Management
- **Global state in App.js**: `theme` and `lang` state managed at root level
- **Props drilling pattern**: Theme and language passed down through component tree
- **Supabase session management**: Auth state managed in News page with real-time listeners
- **Router-based navigation**: React Router v7 for client-side routing

### Routing Structure
```
/              → Home page (Hero, Services, About, Contact, Location)
/news          → News page (News list, admin auth, news creation form)
```

### Component Structure
```
src/
├── App.js                 # Root component with Router, theme/lang state
├── pages/
│   ├── Home.js            # Home page composition
│   └── News.js            # News management with Supabase auth
├── components/
│   ├── Header/            # Navigation with theme/lang toggles
│   ├── Hero/              # Landing section with CTA
│   ├── Services/          # Services showcase
│   ├── About/             # Company information
│   ├── Contact/           # Contact form with EmailJS
│   ├── Location/          # Location information
│   ├── Footer/            # Site footer
│   ├── News/              # News components
│   │   ├── NewsList.js    # Display news posts
│   │   └── NewsForm.js    # Create/edit news posts
│   ├── Auth/              # Authentication
│   │   └── AdminLogin.js  # Supabase admin login
│   └── ui/                # Reusable UI components
│       ├── Button.tsx     # Shadcn/ui button with variants
│       └── Card.tsx       # Card component
├── lib/
│   └── supabaseClient.js  # Supabase client initialization
├── utils/
│   └── newsStorage.js     # News data storage utilities
├── config.js              # EmailJS configuration
└── index.css              # Global styles and Tailwind imports
```

### State Management Patterns

**Theme & Language (App.js)**:
- State managed in App.js and passed via props
- `useEffect` hooks manipulate DOM classes for theme switching
- Document title updates based on selected language

**Authentication (News.js)**:
- Supabase session state with real-time auth listeners
- `supabase.auth.onAuthStateChange()` for automatic session updates
- Session persistence enabled in Supabase client configuration

**News Data**:
- Posts loaded from `newsStorage.js` utility (localStorage fallback)
- Real-time data synchronization after create/delete operations

### Styling Architecture
- **Tailwind CSS** with dark mode support via `class` strategy
- **Korean font optimization**: Malgun Gothic as default sans-serif
- **CSS custom properties** for consistent theming
- **Component variants**: Using `class-variance-authority` (cva) for UI components
- **Utility functions**: `cn()` helper for intelligent className merging

### Key Dependencies
- **React 19**: Latest React version
- **React Router DOM 7**: Client-side routing
- **@supabase/supabase-js**: Backend and authentication
- **@emailjs/browser**: Email service integration
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **tailwind-merge + clsx**: Conditional className utilities

## Configuration Architecture

**IMPORTANT**: This project uses a **dual configuration pattern**:

### Pattern 1: Direct Import (EmailJS)
Configuration in `src/config.js`:
```javascript
const config = {
  emailjs: {
    serviceId: 'service_lz6ciiq',
    templateId: 'template_gl8ndns',
    publicKey: 'GS3Jau05r6XdU9n5a'
  }
};
```
Import: `import config from '../../config'`

**Rationale**: EmailJS public keys are designed to be client-facing and rate-limited by the service.

### Pattern 2: Environment Variables (Supabase)
Configuration in `.env` file (not tracked in git):
```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
```
Access: `process.env.REACT_APP_SUPABASE_URL`

**Rationale**: Supabase credentials are project-specific and should not be committed to version control.

**IMPORTANT**: After changing `.env` values, restart the development server (`npm start`).

## Integration Details

### EmailJS (Contact Form)
**File**: `src/components/Contact/Contact.js`

**Implementation**:
- Initialized in `useEffect` with `emailjs.init(config.emailjs.publicKey)`
- Sends to `pulspia@gmail.com` with Korean timezone timestamp
- Template variables: `{{from_name}}`, `{{from_email}}`, `{{message}}`, `{{to_email}}`, `{{timestamp}}`
- Loading states, success/error messages, auto-reset on success

See [EMAILJS-SETUP.md](EMAILJS-SETUP.md) for template setup instructions.

### Supabase (News Management)
**Files**:
- `src/lib/supabaseClient.js` - Client initialization
- `src/pages/News.js` - Main integration point
- `src/components/Auth/AdminLogin.js` - Authentication UI
- `src/components/News/NewsForm.js` - CRUD operations

**Key Features**:
- **Authentication**: Email/password with session persistence
- **Real-time listeners**: `supabase.auth.onAuthStateChange()` for automatic UI updates
- **Database**: `news_posts` table with RLS (Row Level Security) policies
- **Storage**: `news-images` bucket for image uploads

**Database Schema** (`news_posts` table):
- `id` (UUID, Primary Key)
- `title` (text)
- `content` (text)
- `lang` (text: 'ko' or 'en')
- `image_url` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `author_id` (UUID, foreign key to auth.users)

See [SUPABASE-SETUP.md](SUPABASE-SETUP.md) for detailed setup instructions.

**Keep-Alive Automation**:
- GitHub users: [SUPABASE-KEEPALIVE.md](SUPABASE-KEEPALIVE.md) - GitHub Actions workflow
- Direct hosting: [SUPABASE-KEEPALIVE-SERVER.md](SUPABASE-KEEPALIVE-SERVER.md) - Cron/Task Scheduler/PM2

## Development Patterns

### Internationalization
Each component contains a `content` object with language keys:
```javascript
const content = {
  ko: { title: '한국어 제목', description: '설명' },
  en: { title: 'English Title', description: 'Description' }
};

// Usage in component
const c = content[lang];
return <h1>{c.title}</h1>;
```

### Theme Implementation
1. User clicks theme toggle in Header
2. `toggleTheme()` updates state in App.js
3. `useEffect` adds/removes `dark` class on document root
4. Tailwind applies `dark:` variant styles automatically

### Component Variants (UI Components)
TypeScript components in `src/components/ui/` use `cva` for type-safe styling:
```typescript
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "...", lg: "..." }
  }
});
```

### Authentication Flow
1. User navigates to `/news`
2. Page checks session with `supabase.auth.getSession()`
3. Sets up auth state listener with `onAuthStateChange()`
4. Login updates session → listener fires → UI updates automatically
5. Logout clears session → listener fires → UI reverts to logged-out state

### News CRUD Operations
**Read**: `getPosts()` from `newsStorage.js`
**Create**: Form submission in `NewsForm.js` → `addPost()` utility → reload posts
**Delete**: Delete button in `NewsList.js` → `deletePost()` utility → reload posts

## Testing Notes

### Contact Form Testing
- Test both success and error states
- Verify form reset after successful submission
- Check Korean timezone formatting in email timestamps
- Test in both light/dark themes

### News System Testing
- Test authentication flow (login/logout)
- Verify RLS policies (unauthenticated users can read, only authenticated can write)
- Test image upload to Supabase Storage
- Verify real-time auth state updates

### Theme & Language Testing
- Test theme persistence across page navigation
- Verify all components respond to language toggle
- Check Korean font rendering in both themes
- Test responsive breakpoints (mobile, tablet, desktop)

## Mobile Responsiveness
Layout uses Tailwind's responsive prefixes with mobile-first approach:
- Base styles: Mobile (< 768px)
- `md:` prefix: Tablet (≥ 768px)
- `lg:` prefix: Desktop (≥ 1024px)

Header navigation adapts for smaller screens, and all sections maintain proper spacing and readability across devices.
