# Care App Admin Panel

A production-ready admin panel built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

## Features

- **Modern Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui component library with beautiful, accessible components
- **Dark Mode**: Full light/dark mode support with theme persistence
- **Authentication**: Protected routes with JWT token management
- **State Management**: React Query for efficient server state management
- **Error Handling**: Comprehensive error handling for 401, 404, and other errors
- **Type Safety**: Full TypeScript support with proper type definitions
- **Production Ready**: Optimized build configuration for production

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components (AppLayout)
│   └── protected-route.tsx
├── hooks/              # Custom React hooks
│   ├── use-auth.ts     # Authentication hooks
│   ├── use-theme.tsx   # Theme management hooks
│   └── use-users.ts    # Example API hooks
├── pages/              # Page components
│   ├── dashboard.tsx
│   ├── login.tsx
│   ├── users.tsx
│   ├── not-found.tsx
│   └── unauthorized.tsx
├── providers/          # Context providers
│   └── query-provider.tsx
├── services/           # API service layer
│   ├── api.ts          # Axios configuration
│   ├── auth.ts         # Authentication service
│   └── users.ts        # Example API service
├── types/              # TypeScript type definitions
│   └── index.ts
├── lib/                # Utility functions
│   └── utils.ts
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Configuration

### Environment Variables

Create a `.env` file with:

```
VITE_API_BASE_URL=your_backend_api_url
```

### API Configuration

The API base URL is configured in `src/services/api.ts`. All API requests are intercepted for:
- Adding authentication tokens
- Handling 401 unauthorized errors (redirects to `/unauthorized`)
- Handling 404 not found errors
- Error logging

### Adding New API Endpoints

1. **Add Types**: Define your types in `src/types/index.ts`

2. **Create Service**: Add API methods in `src/services/your-service.ts`:
```typescript
import apiClient from "./api"
import { ApiResponse } from "@/types"

export const yourService = {
  getItems: async () => {
    const response = await apiClient.get<ApiResponse<any>>("/items")
    return response.data
  },
}
```

3. **Create Hook**: Add React Query hook in `src/hooks/use-your-service.ts`:
```typescript
import { useQuery } from "@tanstack/react-query"
import { yourService } from "@/services/your-service"

export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: () => yourService.getItems(),
  })
}
```

4. **Use in Component**:
```typescript
import { useItems } from "@/hooks/use-your-service"

function MyComponent() {
  const { data, isLoading } = useItems()
  // ...
}
```

## Routing

Protected routes are automatically wrapped with authentication checks. Add new routes in `src/App.tsx`:

```typescript
<Route
  path="/your-route"
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  }
/>
```

## Dark Mode

Dark mode is implemented with a custom hook. Toggle it using the `ThemeToggle` component or programmatically:

```typescript
import { useTheme } from "@/hooks/use-theme"

const { theme, toggleTheme } = useTheme()
```

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Tech Stack

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **React Router**: Routing
- **React Query**: Server state management
- **Axios**: HTTP client
- **Lucide React**: Icons

## License

MIT
