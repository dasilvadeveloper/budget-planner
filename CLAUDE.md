# Budget Planner

Personal budgeting application.

## Commands

- `npm start` or `ng serve` — start the development server
- `ng build` — production build
- `ng build --watch --configuration development` — development build
- `npm test` or `ng test` — run unit tests

There is currently no configured lint command or e2e test setup.

---

# Architecture

This project follows a **feature-based architecture**.

Organize application code primarily by business/domain feature rather than by technical type.

Preferred high-level structure:

```text
src/app/
├── core/
├── shared/
├── features/
├── layout/
├── app.config.ts
└── app.routes.ts
```

## Features

`features/` contains the application's business and domain functionality.

Keep feature-related code together. A feature may contain:

- pages
- feature-specific components
- models
- services or data-access code
- state
- routes

Example:

```text
features/
└── expenses/
    ├── pages/
    ├── components/
    ├── models/
    ├── services/
    ├── store/
    └── expenses.routes.ts
```

Prefer keeping code inside the feature that owns it.

Do not move feature-specific code into global folders prematurely.

Do not create empty folder structures in advance. Create folders only when they are needed.

## Core

`core/` contains application-wide infrastructure and functionality.

Examples:

- authentication infrastructure
- route guards
- HTTP interceptors
- application-wide services
- global configuration

## Shared

`shared/` contains code genuinely reused across multiple features.

Examples:

- reusable UI components
- pipes
- directives
- utilities
- common types

Do not place code in `shared/` preemptively. Keep it inside a feature until there is a genuine reuse case.

## Layout

`layout/` contains application shell and layout components responsible for structuring the application.

---

# Angular

The application uses:

- Angular standalone components
- Signals
- NgRx SignalStore
- lazy-loaded feature routes

Use the `angular-developer` skill when relevant to Angular work.

Use Angular MCP tools when relevant to the task, especially when verifying Angular-specific APIs, recommended patterns, migrations, or framework-specific implementation details.

Do not use MCP tools unnecessarily for simple changes.

Follow modern Angular best practices and prefer modern Angular APIs where appropriate.

Inspect existing project patterns before introducing new ones.

Reuse established patterns when they are appropriate, but do not preserve poor patterns simply for consistency.

---

# State Management

Use the simplest appropriate state management solution.

Use component-local state for state owned by a single component.

Use Signals for reactive local state where appropriate.

Use SignalStore when state is meaningfully shared between multiple components, pages, or routes.

Do not create stores for trivial state.

Avoid unnecessary global state.

---

# Data Access

Services represent the boundary between application logic and data sources.

Keep UI components independent from the underlying data source implementation whenever practical.

When a real backend is introduced, prefer changing the implementation inside the data-access layer while minimizing changes to components and state management.

Do not introduce unnecessary repository or abstraction layers without a clear benefit.

---

# Routing

Prefer feature-level routes.

Features should own their routes when practical.

Use lazy loading for feature areas where appropriate.

Keep routing concerns separate from feature implementation details.

---

# Naming

For new files, use consistent naming:

- kebab-case filenames
- `*.model.ts` for domain models
- no type suffix for components, directives and services (Angular style guide): `expenses-list.ts` → `ExpensesList`, `expenses-api.ts` → `ExpensesApi`
- name services after what they do, not with a generic `Service` suffix
- hyphenated suffix for guards, interceptors and pipes: `auth-guard.ts`, `auth-interceptor.ts`, `currency-pt-pipe.ts`
- `*.store.ts` for SignalStore state
- `*.routes.ts` for feature routes

Avoid unnecessary renaming of existing files unless the current task includes a migration.

---

# Localization and Styling

The application is Portuguese-first.

Use `pt-PT` conventions for user-facing formatting where appropriate.

The project uses:

- prefer Tailwind CSS instead of custom css 
- Angular Material
- component-level styles

Follow existing styling patterns unless there is a clear reason to improve them.

Avoid introducing another styling system unnecessarily.

---

# Development Workflow

Prefer incremental development.

For significant features or changes:

1. Analyze the requirement and relevant existing code.
2. Inspect existing patterns before introducing new ones.
3. Propose a small implementation plan.
4. Do not make any changes before approval.
5. Implement incrementally and keep changes small and focused.
6. Keep changes scoped to the current feature or task.
7. Run relevant tests or build checks.
8. Review the changes before considering the task complete.

Do not autonomously implement multiple large features at once.

Do not modify unrelated code unless necessary.

Before making changes, clarify ambiguity when it would materially affect the implementation.

---

# Code Quality

Prefer:

- simple solutions
- readable code
- maintainable code
- clear separation of responsibilities
- small, focused changes
- consistency where it provides value

Avoid:

- unnecessary abstractions
- premature generalization
- speculative architecture
- unnecessary dependencies
- large refactors without a clear benefit
- overengineering

Before introducing a significant dependency or architectural pattern, inspect the existing project and justify the change when requested.

---

# Testing

Add or update tests when they provide meaningful coverage for the change.

Prioritize testing:

- business logic
- state management
- important transformations
- critical user flows

Do not add superficial tests solely to increase test count.

Run relevant tests or build checks after meaningful changes.

---

# Git

Keep changes logically focused.

Prefer small, meaningful commits.

Do not automatically commit changes unless explicitly requested.

Do not perform destructive Git operations without explicit confirmation.

Do not stage unrelated files automatically.

---

# AI-Assisted Development

Use AI assistance to improve development quality and efficiency.

Keep responses concise and focused by default.

Explain technical decisions, implementation details, and trade-offs when explicitly requested or when they are important to understanding a significant architectural decision.

Prefer implementations that are easy to understand, review, and maintain.

For significant implementations, prefer this workflow:

requirement → analysis → plan → approval → implementation → tests → review

Do not skip directly from a broad requirement to a large autonomous implementation.

## UI Language

All user-facing text must be written in **European Portuguese (pt-PT)**.

This applies to:

- Labels
- Buttons
- Page titles
- Form fields
- Validation messages
- Error messages
- Empty states
- Notifications
- Status labels
- Dropdown options
- Tooltips
- Confirmation dialogs

Use natural European Portuguese, not Brazilian Portuguese.

Examples:

- `Guardar` not `Salvar`
- `Cancelar` not `Cancel`
- `Eliminar` not `Deletar`
- `Utilizador` not `Usuário`
- `Ficheiro` not `Arquivo`
- `Palavra-passe` not `Senha`
- `Contacto` not `Contato`

All internal code identifiers must remain in English, including:

- Variables
- Functions
- Classes
- CSS classes
- CSS IDs
- Types
- Interfaces
- Enum keys
- API contracts

User-facing enum values and labels must be translated to pt-PT.

## Date Handling

Use **Luxon** for date and time manipulation.

Do not use native JavaScript `Date` for application-level date calculations, formatting, parsing, or date-range logic when Luxon provides the required functionality.

Store expense dates as ISO date strings (`YYYY-MM-DD`).
 