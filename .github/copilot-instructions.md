Rules:

- Add jsdoc for functions
- don't add any new comments besides jsdoc
- If you need to add commend, add "NOTE:" tag
- Use index.ts only for exporting
- use index.ts to propagate exports
- Use camelCase for variables and functions
- Use PascalCase for types and interfaces
- use kebab-case for file names
- if there is an abbreviation in the variable/type name, uppercase only the first letter
- strictly enforce single responsibility principle
- avoid using any type, use unknown if necessary and narrow it down as soon as possible
- before adding a new type check a shared package for existing types
- treat shared package as a source of truth
- reuse as much as possible from shared package
- be concise, don't add major changes, prefer gradual changes with my assistance. ask before implementing
- Use precise imports for types and components (e.g., `import { ReactNode } from "react"` instead of `React.ReactNode`).
- Don't use default exports, always use named exports.

Context:
- The project is a monorepo with 3 packages: `shared`, `client`, and `server`.
- The `shared` package contains shared types and utilities.
- The `client` package is a Next.js application.
- The `server` package is an Express.js application.
- Endpoints docs are located in `packages/server/docs/endpoints.md`.
