# 🤖 GitHub Copilot Instructions

This file provides context and guidelines for GitHub Copilot when assisting with the Person 5 Orchestrator project.

## Project Context

**Project Name:** Person 5 Orchestrator  
**Framework:** Next.js 14 with App Router  
**Language:** TypeScript  
**Styling:** Tailwind CSS  
**Purpose:** Campaign orchestration and management platform  

## Code Style Preferences

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Always define return types for functions
- Use proper type imports: `import type { Type } from '...'`

### React Components
- Use functional components with TypeScript
- Prefer named exports for components
- Use proper typing for props and state
- Follow composition over inheritance

### File Naming
- Components: PascalCase (e.g., `CampaignBuilder.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase with descriptive names
- API routes: lowercase with hyphens (e.g., `create-campaign.ts`)

### Code Organization
```typescript
// 1. Imports (external, then internal)
import React from 'react';
import { Campaign } from '@/types';

// 2. Types/Interfaces
interface ComponentProps {
  campaign: Campaign;
}

// 3. Component/Function
export function Component({ campaign }: ComponentProps) {
  // 4. Hooks
  // 5. Handlers
  // 6. Render
}
```

## Project-Specific Patterns

### API Routes (App Router)
```typescript
// src/app/api/[route]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Logic here
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 });
  }
}
```

### Server Components
```typescript
// Default to server components
export default async function Page() {
  const data = await fetchData();
  return <div>{/* content */}</div>;
}
```

### Client Components
```typescript
'use client';

import { useState } from 'react';

export function ClientComponent() {
  const [state, setState] = useState();
  return <div>{/* interactive content */}</div>;
}
```

### Using the Orchestrator
```typescript
import { Orchestrator } from '@/lib/orchestrator';

const orchestrator = new Orchestrator();
const result = await orchestrator.executeCampaign(config);
```

### API Client Usage
```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const campaigns = await apiClient.get<Campaign[]>('/campaigns');

// POST request
const newCampaign = await apiClient.post<Campaign>('/campaigns', data);
```

## Component Patterns

### Dashboard Components
- Use real-time data fetching
- Implement loading states
- Handle errors gracefully
- Include metric visualizations

### Campaign Builder
- Multi-step forms
- Form validation with proper TypeScript types
- Preview functionality
- Save draft capability

### UI Components
- Reusable and composable
- Accessible (ARIA labels, keyboard navigation)
- Responsive design
- Consistent with design system

## Tailwind CSS Guidelines

### Class Organization
```tsx
// Order: Layout -> Spacing -> Typography -> Visual -> Interactive
<div className="flex flex-col gap-4 p-6 text-lg font-semibold bg-white rounded-lg hover:shadow-lg">
```

### Responsive Design
```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
```

### Custom Utilities
Check `tailwind.config.js` for custom colors, spacing, and utilities.

## Testing Patterns

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
```

### API Route Tests
```typescript
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/route', () => {
  it('returns data', async () => {
    const request = new NextRequest('http://localhost/api/route');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
```

## Common Tasks

### Creating a New Page
1. Create file in `src/app/[route]/page.tsx`
2. Define metadata export
3. Implement page component
4. Add to navigation if needed

### Adding an API Route
1. Create file in `src/app/api/[route]/route.ts`
2. Implement HTTP methods (GET, POST, etc.)
3. Add proper error handling
4. Update API client if needed

### Creating a Component
1. Create file in appropriate `src/components/` subdirectory
2. Define prop interface
3. Implement component with proper typing
4. Export as named export
5. Add tests

## Error Handling

### API Errors
```typescript
try {
  const data = await apiClient.get('/endpoint');
  return data;
} catch (error) {
  console.error('Failed to fetch:', error);
  throw new Error('User-friendly message');
}
```

### Component Errors
```typescript
'use client';

import { useEffect } from 'react';

export function ErrorBoundary({ error }: { error: Error }) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return <div>Something went wrong!</div>;
}
```

## Performance Optimization

- Use `React.memo()` for expensive components
- Implement proper loading states
- Use Next.js Image component for images
- Lazy load components when appropriate
- Optimize bundle size

## Accessibility

- Include semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers
- Maintain color contrast ratios

## Environment Variables

- Prefix client-side variables with `NEXT_PUBLIC_`
- Never commit sensitive keys
- Use `.env.local` for local development
- Document all required variables in `.env.example`

---

**For Copilot:** When generating code, follow these patterns and preferences. Prioritize type safety, clean code, and maintainability.
