import assert from "node:assert/strict";
import express from "express";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createCrudRouter, crudErrorHandler } from "../src/index.js";

const mongoServer = await MongoMemoryServer.create();
await mongoose.connect(mongoServer.getUri(), {
    dbName: "automate_crud_test"
})

const User = mongoose.model(
    "User",
    new mongoose.Schema(
        {
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true }
        },
        { timestamps: true }
    )
);

function makeApp() {
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
    return app;
}

function makeAppWithHooks(hooks) {
    const app = express();
    app.use(express.json());

    app.use(
        "/users",
        createCrudRouter({
            model: User,
            searchFields: ["name", "email"],
            allowedIncludes: [],
            hooks
        })
    )

    app.use(crudErrorHandler);
    return app;
}

async function resetDb() {
    await User.deleteMany({});
}

async function initApp() {
    await resetDb();
    const app = makeApp();

    const user = await User.create({
        name: "A",
        email: "a@test.com"
    });

    return { user, app };
}

async function testCreateAndList() {
    await resetDb();
    const app = makeApp();

    const createRes = await request(app).post("/users").send({
        name: "Shiv",
        email: "shiv@test.com"
    });

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.data.name, "Shiv")

    const listRes = await request(app).get("/users");

    assert.equal(listRes.status, 200);
    assert.equal(Array.isArray(listRes.body.data), true);
    assert.equal(listRes.body.meta.total, 1);
}

async function testGetOne() {
    const { user, app } = await initApp();

    const res = await request(app).get(`/users/${user._id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, "a@test.com");
}

async function testUpdate() {
    const { user, app } = await initApp();

    const res = await request(app).patch(`/users/${user._id}`).send({ name: "B" });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.name, "B");
}

async function testDelete() {
    const { user, app } = await initApp();

    const res = await request(app).delete(`/users/${user._id}`)

    assert.equal(res.status, 200);

    const found = await User.findById(user._id);
    assert.equal(found, null);
}

async function test404() {
    await resetDb();
    const app = makeApp();

    const res = await request(app).get(
        "/users/507f1f77bcf86cd799439011"
    );

    assert.equal(res.status, 404);
}


async function testBeforeCreateHook() {
    await resetDb();
    const app = makeAppWithHooks({
        beforeCreate(req, body) {
            return {
                ...body,
                name: body.name.toUpperCase()
            };
        }
    });

    const res = await request(app).post("/users").send({
        name: "shiv",
        email: "shiv@test.com"
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, "SHIV");
}

async function testBeforeUpdateHook() {
    await resetDb();
    const user = await User.create({
        name: "A",
        email: "a@test.com"
    });

    const app = makeAppWithHooks({
        beforeUpdate(req, body) {
            return {
                ...body,
                name: "HOOKED"
            };
        }
    });

    const res = await request(app).patch(`/users/${user._id}`).send({
        name: "B"
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.name, "HOOKED");
}

async function testBeforeDeleteHook() {
    await resetDb();
    const user = await User.create({
        name: "A",
        email: "a@test.com"
    });

    const app = makeAppWithHooks({
        async beforeDelete() {
            throw new Error("Delete blocked");
        }
    });

    const res = await request(app).delete(`/users/${user._id}`);

    assert.equal(res.status, 500);

    const found = await User.findById(user._id);
    assert.notEqual(found, null);
}



try {
    await testCreateAndList();
    await testGetOne();
    await testUpdate();
    await testDelete();
    await test404();
    await testBeforeCreateHook();
    await testBeforeDeleteHook();
    await testBeforeDeleteHook();
    console.log("all tests passed");
} finally {
    await mongoose.disconnect();
    await mongoServer.stop();
}