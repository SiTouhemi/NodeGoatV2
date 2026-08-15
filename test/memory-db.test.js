const test = require("node:test");
const assert = require("node:assert/strict");

const { startMongoMemoryIfNeeded } = require("../lib/mongo-bootstrap");

test("starts an in-memory MongoDB instance when no MongoDB server is available", async () => {
  const result = await startMongoMemoryIfNeeded({
    uri: "mongodb://localhost:27017/nodegoat"
  });

  assert.ok(result.uri.startsWith("mongodb://"));
  assert.ok(result.server);

  if (result.server) {
    await result.server.stop();
  }
});
