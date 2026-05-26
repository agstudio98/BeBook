const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';

let mongo;

/**
 * Setup hook: Starts an in-memory MongoDB instance before all tests.
 */
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

/**
 * Teardown hook: Cleans up the database between tests.
 */
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

/**
 * Final cleanup: Stops the in-memory MongoDB instance and closes the connection.
 */
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
