# Automate CRUD

Monorepo for CRUD automation packages.

## Packages

- `packages/mongoose`
  - Auto-generates CRUD routes for Express + Mongoose
  - Supports list query params: `page`, `limit`, `sort`, `select`, `q`, `include`, `filter`

## Repo Structure

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

## Publishing

Publishing can be done from GitHub Actions using:

- `.github/workflows/publish-mongoose.yml`

Before publishing, ensure `packages/mongoose/package.json` has an npm package name under a scope you own.
