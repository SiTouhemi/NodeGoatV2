"use strict";

const { MongoClient } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");

async function startMongoMemoryIfNeeded({
  uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nodegoat"
} = {}) {
  try {
    const client = await MongoClient.connect(uri, {
      serverSelectionTimeoutMS: 1500
    });
    await client.close();
    return { uri, server: null };
  } catch (error) {
    const memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: "nodegoat"
      }
    });

    const memoryUri = memoryServer.getUri();
    process.env.MONGODB_URI = memoryUri;

    return { uri: memoryUri, server: memoryServer };
  }
}

module.exports = {
  startMongoMemoryIfNeeded
};
