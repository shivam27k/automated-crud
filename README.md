# Automate CRUD

Automate CRUD is a package family for removing repetitive backend CRUD code.

The idea is simple:

- define your model
- register one router
- stop rewriting the same list, get, create, update, and delete logic

This repository is the monorepo for current and future `@automate-crud/*` packages.

## Current Package

### `@automate-crud/mongoose`

The first released package supports:

- Express
- Mongoose
- auto-generated CRUD routes
- query features like search, filter, sort, select, pagination, and include
- hooks
- custom routes

Package path:

- `packages/mongoose`

## Current Direction

The product is being built in layers:

1. Zero-code CRUD
2. Declarative actions
3. Hooks
4. Custom routes

Right now, the Mongoose package already supports:

- zero-code CRUD
- hooks
- custom routes

## Monorepo Structure

```text
automate-crud/
  packages/
    mongoose/
```

## Local Setup

```bash
npm install
npm test
```

## Publishable Package

Current published package:

- `@automate-crud/mongoose`

## Long-Term Plan

After the Mongoose package is hardened, the same approach will be expanded to more adapters such as:

- Prisma
- Sequelize
- other database-specific packages

The goal is not one giant package.
The goal is separate installable packages so users only install the adapter they need.

## Repository Goal

This repo is building toward a family of packages where developers can avoid repetitive CRUD setup while still keeping escape hatches for real-world business logic.
