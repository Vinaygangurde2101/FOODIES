const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/naik_foods_smartshop';

  try {
    console.log(`Attempting connection to MongoDB at ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`MongoDB Connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed (${error.message}).`);
    console.log(`⚡ Launching In-Memory MongoDB Server for seamless zero-config demonstration...`);
    
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const mongoUri = mongoMemoryServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Server running at ${mongoUri}`);

      // Auto seed in-memory DB if empty
      const Product = require('../models/Product');
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('Seeding In-Memory Database with 40+ authentic food products...');
        const seedProductsData = require('../seed/seedData.json');
        await Product.insertMany(seedProductsData);
        console.log('In-Memory Database populated with products.');
      }
    } catch (memErr) {
      console.error('Failed to launch In-Memory MongoDB:', memErr);
    }
  }
};

module.exports = connectDB;
