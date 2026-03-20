# @automate-crud/mongoose

Generate Express CRUD routes directly from a Mongoose model.

This package is for the repetitive part of backend work:

- list
- get by id
- create
- update
- delete

You define the model, mount one router, and get working CRUD APIs with query support.

## Install

```bash
npm i @automate-crud/mongoose express mongoose
```

## Quick Start

```js
import express from "express";
import mongoose from "mongoose";
import { createCrudRouter, crudErrorHandler } from "@automate-crud/mongoose";

await mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: { type: String, required: true, index: true },
      email: { type: String, required: true, unique: true, index: true },
      archived: { type: Boolean, default: false }
    },
    { timestamps: true }
  )
);

const app = express();
app.use(express.json());

app.use(
  "/users",
  createCrudRouter({
    model: User,
    searchFields: ["name", "email"],
    allowedIncludes: []
  })
);

app.use(crudErrorHandler);
app.listen(4000);
```

## Generated Routes

Mounting on `/users` gives:

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

## What You Get

- Pagination with `page` and `limit`
- Sorting with `sort`
- Field selection with `select`
- Search with `q`
- Filtering with query params or `filter`
- Controlled populate with `include`
- Hooks for create, update, and delete
- Custom routes for model-specific actions

## Minimal Usage

```js
app.use(
  "/users",
  createCrudRouter({
    model: User
  })
);
```

## Query Examples

```http
GET /users?page=2&limit=10
GET /users?sort=-createdAt
GET /users?select=name,email
GET /users?q=shiv
GET /users?include=team
GET /users?name=Shiv
GET /users?filter={"archived":false}
```

## Options

### `model`

Required. The Mongoose model to use.

### `searchFields`

Fields searched when `q` is provided.

```js
createCrudRouter({
  model: User,
  searchFields: ["name", "email"]
});
```

### `allowedIncludes`

Allowed populate paths for `include`.

```js
createCrudRouter({
  model: User,
  allowedIncludes: ["team", "profile"]
});
```

### `idParam`

Change the route param name from `id`.

```js
createCrudRouter({
  model: User,
  idParam: "userId"
});
```

### `hooks`

Supported hooks:

- `beforeCreate(req, body)`
- `beforeUpdate(req, body)`
- `beforeDelete(req)`

Example:

```js
createCrudRouter({
  model: User,
  hooks: {
    beforeCreate(req, body) {
      return {
        ...body,
        name: body.name.trim()
      };
    },
    beforeUpdate(req, body) {
      return {
        ...body,
        name: body.name?.toUpperCase() ?? body.name
      };
    }
  }
});
```

### `customRoutes`

Use this for model-specific actions without writing full controller boilerplate.

```js
createCrudRouter({
  model: User,
  customRoutes: [
    {
      method: "post",
      path: "/:id/archive",
      handler: async ({ params, model }) => {
        return model.findByIdAndUpdate(
          params.id,
          { archived: true },
          { new: true }
        ).lean();
      }
    }
  ]
});
```

Handler input:

- `req`
- `params`
- `query`
- `body`
- `model`

Returned value becomes:

```json
{
  "data": {}
}
```

## Error Handling

Use the built-in middleware after your routes.

```js
app.use(crudErrorHandler);
```

Error response shape:

```json
{
  "error": {
    "message": "Internal server error"
  }
}
```

## Local Testing

```bash
npm test --workspace @automate-crud/mongoose
```

The test setup uses:

- `supertest`
- `mongodb-memory-server`

## Current Scope

This package currently focuses on:

- Express
- Mongoose
- repetitive CRUD removal
- hooks
- custom routes

It does not yet include:

- auth
- role/permission system
- soft delete
- Prisma or SQL support
- declarative action generation
