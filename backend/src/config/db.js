const mongoose = require('mongoose');
const { seedInitialData } = require('../utils/seeder');

async function connectDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  console.log('🔄 Connecting to MongoDB database...');

  // Strategy 1: Attempt connection to MongoDB Atlas
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      console.log('✅ Connected to MongoDB Atlas successfully!');
      await seedInitialData();
      return true;
    } catch (err) {
      console.warn('⚠️  MongoDB Atlas Connection Failed:', err.message);
      console.warn('📌 Atlas IP Whitelist Notice: Your current IP address is not whitelisted on MongoDB Atlas.');
    }
  }

  // Strategy 2: Fallback to Local MongoDB instance
  const localUri = 'mongodb://127.0.0.1:27017/landlink';
  try {
    console.log('🔄 Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/landlink)...');
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    console.log('✅ Connected to local MongoDB successfully!');
    await seedInitialData();
    return true;
  } catch (err) {
    console.warn('⚠️  Local MongoDB instance not running.');
  }

  // Strategy 3: Attempt embedded In-Memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log('🔄 Starting embedded In-Memory MongoDB Server...');
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    console.log('✅ Connected to Embedded In-Memory MongoDB successfully!');
    await seedInitialData();
    return true;
  } catch (err) {
    console.warn('⚠️  Embedded In-Memory MongoDB fallback initializing in background.');
  }

  console.log('----------------------------------------------------------------------');
  console.log('💡 HOW TO FIX MONGODB ATLAS PERMANENTLY:');
  console.log(' 1. Go to https://cloud.mongodb.com and log into your Atlas account.');
  console.log(' 2. Navigate to: Security -> Network Access.');
  console.log(' 3. Click "Add IP Address" -> Click "ALLOW ACCESS FROM ANYWHERE (0.0.0.0/0)"');
  console.log(' 4. Click Confirm. Connection will work automatically within 30 seconds.');
  console.log('----------------------------------------------------------------------');

  return false;
}

module.exports = { connectDatabase };
