# Project Structure Overview

This document provides an overview of the Care App Admin Panel project structure.

## 📁 Directory Structure

```
care-app-front/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx   # Button component
│   │   │   ├── card.tsx     # Card components
│   │   │   ├── sidebar.tsx  # Sidebar navigation
│   │   │   └── theme-toggle.tsx # Dark mode toggle
│   │   ├── layout/
│   │   │   └── app-layout.tsx  # Main app layout with sidebar
│   │   └── protected-route.tsx # Authentication wrapper
│   ├── hooks/               # Custom React hooks
│   │   ├── use-auth.ts      # Authentication logic
│   │   ├── use-theme.tsx    # Theme management
│   │   └── use-users.ts     # Users API hooks (example)
│   ├── lib/                 # Utility functions
│   │   └── utils.ts         # Common utilities (cn function)
│   ├── pages/               # Page components
│   │   ├── dashboard.tsx    # Dashboard page
│   │   ├── login.tsx        # Login page
│   │   ├── users.tsx        # Users management page
│   │   ├── not-found.tsx    # 404 error page
│   │   └── unauthorized.tsx # 401 error page
│   ├── providers/           # React context providers
│   │   └── query-provider.tsx # React Query setup
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios configuration & interceptors
│   │   ├── auth.ts          # Authentication API
│   │   └── users.ts         # Users API (example)
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # All shared types
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── .env.example             # Environment variables template
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
├── README.md                # Project documentation
├── API_INTEGRATION.md       # API integration guide
└── PROJECT_STRUCTURE.md     # This file
```

## 🔧 Key Files Explained

### Configuration Files

- **`vite.config.ts`**: Vite build tool configuration with path aliases
- **`tailwind.config.js`**: Tailwind CSS theme and design tokens
- **`tsconfig.json`**: TypeScript compiler settings
- **`package.json`**: Project dependencies and scripts

### Core Application Files

- **`src/App.tsx`**: Main application with routing configuration
- **`src/main.tsx`**: Application entry point that renders the app
- **`src/index.css`**: Global styles with Tailwind directives and CSS variables

### Services (API Layer)

- **`src/services/api.ts`**: 
  - Axios instance configuration
  - Request interceptor (adds JWT token)
  - Response interceptor (handles 401, 404, etc.)

- **`src/services/auth.ts`**: Authentication-related API calls

- **`src/services/users.ts`**: Example service showing CRUD operations

### Hooks (Business Logic)

- **`src/hooks/use-auth.ts`**: Login, logout, authentication state
- **`src/hooks/use-theme.tsx`**: Dark/light mode switching
- **`src/hooks/use-users.ts`**: React Query hooks for users API

### Components

- **`src/components/ui/`**: Reusable UI components from shadcn/ui pattern
- **`src/components/layout/app-layout.tsx`**: Main layout with sidebar navigation
- **`src/components/protected-route.tsx`**: Route guard for authentication

### Pages

- **`src/pages/login.tsx`**: Login page
- **`src/pages/dashboard.tsx`**: Main dashboard
- **`src/pages/users.tsx`**: Users management page
- **`src/pages/not-found.tsx`**: 404 error page
- **`src/pages/unauthorized.tsx`**: 401 error page

## 🎨 Styling Approach

### Tailwind CSS
- Utility-first CSS framework
- Configured with custom color scheme
- Supports dark mode via CSS variables

### Design Tokens
Defined in `src/index.css`:
- Light mode colors
- Dark mode colors
- Spacing and sizing variables

### Component Styling
Using `cn()` utility function for conditional classes:
```typescript
import { cn } from "@/lib/utils"
className={cn("base-classes", condition && "conditional-classes")}
```

## 🔌 API Integration Pattern

1. **Types** → Define interfaces in `src/types/index.ts`
2. **Service** → Create API calls in `src/services/`
3. **Hooks** → Wrap with React Query in `src/hooks/`
4. **Component** → Use hooks in `src/pages/`

See `API_INTEGRATION.md` for detailed examples.

## 🛡️ Authentication Flow

1. User logs in via `src/pages/login.tsx`
2. Token stored in localStorage
3. Axios interceptor adds token to all requests
4. `ProtectedRoute` checks for token
5. 401 errors redirect to `/unauthorized`

## 🌙 Dark Mode

- Theme state managed in `src/hooks/use-theme.tsx`
- Persisted in localStorage
- System preference as fallback
- Toggle button in sidebar footer

## 📦 NPM Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔍 Key Technologies

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Router**: Routing
- **React Query**: Data fetching
- **Axios**: HTTP client
- **shadcn/ui**: UI components pattern
- **Lucide React**: Icons

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Create `.env` file with `VITE_API_BASE_URL`
3. Start dev server: `npm run dev`
4. Open http://localhost:5173

## 📝 Next Steps

1. Update `.env` with your backend API URL
2. Add your API types to `src/types/index.ts`
3. Create services in `src/services/`
4. Build hooks in `src/hooks/`
5. Create UI components using the patterns in `src/pages/`
6. Test and iterate

For detailed API integration, see `API_INTEGRATION.md`.

