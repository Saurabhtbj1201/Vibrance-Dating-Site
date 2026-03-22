# Match-Maker Project — Copilot Instructions

## Quick Start

**Tech Stack:** React 19 + Vite + TypeScript | Express.js + Drizzle ORM | PostgreSQL (Supabase)  
**Package Manager:** pnpm (monorepo workspace)  
**Build:** `pnpm build` | Dev: `pnpm run dev` | Typecheck: `pnpm run typecheck`

---

## Project Structure

### Workspace Layout
```
artifacts/              # Deployable packages
├── api-server/         # Express backend
├── dating-app/         # React Vite frontend
└── mockup-sandbox/     # Storybook/UI testing

lib/                    # Shared libraries
├── api-client-react/   # React Query wrapper for API
├── api-zod/            # Zod schemas (SSoT for API types)
├── db/                 # Drizzle config & migrations
└── object-storage-web/ # File upload/download logic

scripts/                # Database seeders & utilities
```

### Key Files
- **Monorepo config:** `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- **Frontend:** `artifacts/dating-app/` (pages, components, hooks, styles)
- **Backend:** `artifacts/api-server/` (routes, middlewares, services)
- **Shared schemas:** `lib/api-zod/` (source of truth for API contracts)
- **Database:** `lib/db/` (Drizzle schema, migrations)

---

## Development Workflows

### Setup & Prerequisites
```bash
# Install dependencies (pnpm required)
pnpm install

# Start development environment
pnpm run dev        # Starts both backend (port 3000) + frontend (Vite dev server)

# Type checking
pnpm run typecheck  # Validates TypeScript across all packages
```

### Building
```bash
pnpm build          # Typecheck + compile artifacts (dist/)
pnpm run start      # Production backend (requires pnpm build first)
```

### Code Organization Patterns

#### Frontend (React + Vite)
- **Pages:** Tab-based navigation (Home, Discover, Matches, Liked, Profile) in `pages/`
- **Components:** Radix UI + Tailwind CSS; prefer compound component patterns
- **Hooks:** Custom hooks in `hooks/` for business logic, reusable state
- **Forms:** React Hook Form + Zod for validation; schemas defined in `@workspace/api-zod`
- **Data:** TanStack React Query for server state; useQuery/useMutation patterns

#### Backend (Express + TypeScript)
- **Routes:** RESTful endpoints in `routes/` organized by resource
- **Middleware:** Express middleware in `middlewares/` (auth, logging, error handling)
- **Services:** Business logic in `services/`
- **Logging:** Pino logger configured; use structured logging for observability
- **API contracts:** Always define Zod schemas in `@workspace/api-zod` BEFORE implementing routes

#### Database (Drizzle ORM)
- Schema definitions in `lib/db/schema.ts`
- Run migrations via Drizzle Kit
- Keep queries in typed service files, not in route handlers

### File Naming Conventions
- **Components:** PascalCase (`UserCard.tsx`, `AuthLayout.tsx`)
- **Hooks:** camelCase with `use` prefix (`useAuthContext.ts`, `useUserProfile.ts`)
- **Types/Schemas:** PascalCase for types (`User`, `DateProfile`), lowercase for Zod schemas (`userSchema`, `dateProfileSchema`)
- **Utilities:** camelCase (`formatDate.ts`, `apiClient.ts`)
- **Test files:** `*.test.ts` or `*.spec.ts` alongside source

---

## Code Quality Standards

### TypeScript
- **Strict mode enabled** in `tsconfig.json`
- Always specify return types for functions and async operations
- Use `const` by default; prefer immutable data structures
- Leverage union types over boolean flags: `type Status = "idle" | "loading" | "success" | "error"`
- No `any` types; use `unknown` with type guards when necessary

### API Type Safety
- **Single source of truth:** Zod schemas in `@workspace/api-zod` define request/response types
- Generate TypeScript types from Zod: `z.infer<typeof schmea>`
- Backend validates incoming requests against Zod schemas
- Frontend uses TanStack React Query with inferred types from API client

### Performance & Security
- **Code splitting:** Use React's `lazy()` for route-based splits (Vite handles this)
- **Bundle:** Minimize dependencies in `artifacts/` packages; prefer monorepo lib deps
- **Authentication:** Supabase session management; validate tokens on backend routes
- **Data:** Drizzle parameterized queries prevent SQL injection
- **CORS:** Whitelist frontend origins in Express (`.env` config)
- **Secrets:** Never commit `.env.local`; use `.env.example` as template

### Testing
- **Unit:** Jest for utilities/services
- **Integration:** Test API routes with mock data
- **UI:** Mockup Sandbox for component testing; use visual regression when applicable
- **Coverage target:** 70%+ for business logic; 100% for critical paths (auth, payments)

---

## Common Tasks & Commands

| Task | Command |
|------|---------|
| Lint & format | `pnpm lint` or `pnpm format` (if configured) |
| Type-check all packages | `pnpm run typecheck` |
| Build production | `pnpm build` |
| Run backend only | `cd artifacts/api-server && pnpm run dev` |
| Run frontend only | `cd artifacts/dating-app && pnpm run dev` |
| Database migrations | `pnpm run db:migrate` (check `lib/db/scripts`) |
| Add dependency to package | `pnpm add <pkg> -w --filter <package-name>` |
| Run specific package script | `pnpm run --filter @workspace/<pkg> <script>` |

---

## When to Reach Out to Me

- **Architecture changes:** Before refactoring shared lib structure or API contracts
- **New database migrations:** Ensure schema aligns with ORM types
- **Dependency upgrades:** Breaking changes to React, Express, or Drizzle
- **API design:** New endpoints should map to Zod schemas in `@workspace/api-zod` first

---

## Helpful Links & Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React 19 Docs](https://react.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [TanStack React Query](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Express.js Guide](https://expressjs.com/)
