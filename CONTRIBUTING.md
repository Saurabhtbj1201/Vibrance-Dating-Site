# Contributing to Vibrance

First off, thank you for considering contributing to Vibrance! It's people like you that make open source such a great community.

## 🛠 Development Workflow

This is a monorepo managed with `pnpm`.

### Prerequisites
- Node.js
- `pnpm` workspace enabled

### Getting Started

1. **Fork & Clone**
   Fork the repository on GitHub and clone your fork locally.

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Development Server**
   To run both the React Vite frontend and the Express backend concurrently:
   ```bash
   pnpm run dev
   ```

4. **Type Checking**
   Before submitting your PR, ensure all TypeScript checks pass:
   ```bash
   pnpm run typecheck
   ```

## 📝 Pull Request Process

1. Create a new branch for your feature or bugfix (`git checkout -b feature/amazing-feature`)
2. Make your changes following the existing code style.
3. Commit your changes with descriptive messages.
4. Push your branch to your fork.
5. Open a Pull Request targeting the `main` branch.

## 💻 Tech Stack Guidelines

- **Frontend:** React 19 + Radix UI + Tailwind CSS. Use compound component patterns where appropriate.
- **Backend:** Express.js + Drizzle ORM.
- **API Types:** All Zod schemas serve as the single source of truth and belong in `@workspace/api-zod`. Define them before implementing routes.

Once again, thank you for contributing!
