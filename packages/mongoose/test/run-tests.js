import assert from "node:assert/strict";
import { createCrudRouter } from "../src/index.js";

function makeFindChain(result = []) {
  const chain = {
    select: () => chain,
    sort: () => chain,
    populate: () => chain,
    skip: () => chain,
    limit: () => chain,
    lean: () => chain,
    exec: async () => result
  };
  return chain;
}

function makeFindOneChain(result = null) {
  const chain = {
    select: () => chain,
    populate: () => chain,
    lean: () => chain,
    exec: async () => result
  };
  return chain;
}

function makeUpdateDeleteChain(result = null) {
  const chain = {
    lean: () => chain,
    exec: async () => result
  };
  return chain;
}

function testThrowsWithoutModel() {
  assert.throws(() => createCrudRouter({}), /requires a Mongoose model/);
}

function testReturnsRouter() {
  const fakeModel = {
    find: () => makeFindChain([]),
    findById: () => makeFindOneChain(null),
    create: async (body) => ({ toObject: () => body }),
    findByIdAndUpdate: () => makeUpdateDeleteChain(null),
    findByIdAndDelete: () => makeUpdateDeleteChain(null),
    countDocuments: async () => 0
  };

  const router = createCrudRouter({ model: fakeModel });
  assert.equal(typeof router, "function");
  assert.equal(typeof router.handle, "function");
}

testThrowsWithoutModel();
testReturnsRouter();
console.log("mongoose tests: ok");
