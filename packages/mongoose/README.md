# @automate-crud/mongoose

Auto-generate CRUD APIs for Express using a Mongoose model.

## Install

```bash
npm i @automate-crud/mongoose express mongoose
```

## Usage

```js
import express from "express";
import mongoose from "mongoose";
import { createCrudRouter, crudErrorHandler } from "@automate-crud/mongoose";

await mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model(
  "User",
  new mongoose.Schema({ name: String, email: String }, { timestamps: true })
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

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

## List Query Params

- `page`, `limit`
- `sort`
- `select`
- `q` (search)
- `include`
- `filter` (JSON string)
