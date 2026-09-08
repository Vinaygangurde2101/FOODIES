const mongoose = require('mongoose');

const connectDB = async () => {
  const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI;

  if (!uri && isVercel) {
    console.log('⚡ Vercel Serverless Mode: MONGODB_URI not set. Operating in high-performance seed JSON fallback mode.');
    return;
  }

  const targetUri = uri || 'mongodb://127.0.0.1:27017/naik_foods_smartshop';

  try {
    console.log(`Connecting to MongoDB at ${targetUri}...`);
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 800 });
    console.log(`MongoDB Connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB connection unavailable (${error.message}). Serving seamless in-memory fallback.`);

    if (!isVercel) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoMemoryServer = await MongoMemoryServer.create();
        const mongoUri = mongoMemoryServer.getUri();
        await mongoose.connect(mongoUri);
        console.log(`In-Memory MongoDB Server running at ${mongoUri}`);

        const Product = require('../models/Product');
        const count = await Product.countDocuments();
        if (count === 0) {
          const seedProductsData = require('../seed/seedData.json');
          await Product.insertMany(seedProductsData);
          console.log('In-Memory Database populated with products.');
        }
      } catch (memErr) {
        console.warn('Skipped MongoMemoryServer binary launch:', memErr.message);
      }
    }
  }
};

module.exports = connectDB;
