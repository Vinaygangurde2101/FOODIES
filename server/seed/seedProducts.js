const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../models/Product');
const Review = require('../models/Review');
const seedProductsData = require('./seedData.json');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleReviews = [
  {
    userName: "Aniket Deshmukh",
    rating: 5,
    comment: "Authentic flavor just like my grandmother used to prepare in Kolhapur! Extremely fresh and aromatic.",
    verifiedPurchase: true
  },
  {
    userName: "Pooja Kulkarni",
    rating: 5,
    comment: "The spice level is perfect and the packaging was completely leak-proof. Highly recommended!",
    verifiedPurchase: true
  },
  {
    userName: "Rohan Patil",
    rating: 4,
    comment: "Great quality traditional product. Will definitely reorder again soon.",
    verifiedPurchase: true
  },
  {
    userName: "Sneha Joshi",
    rating: 5,
    comment: "The Smart Finder recommended this item based on my mild spice preference and it was spot on!",
    verifiedPurchase: true
  }
];

const seedDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/naik_foods_smartshop';
  let memoryServer = null;

  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to MongoDB successfully.');
  } catch (err) {
    console.log('Local MongoDB not responding. Using MongoMemoryServer for seed test...');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log('Connected to MongoMemoryServer:', uri);
  }

  try {
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing Product and Review collections.');

    const insertedProducts = await Product.insertMany(seedProductsData);
    console.log(`Successfully seeded ${insertedProducts.length} food products!`);

    let reviewCountTotal = 0;
    for (const product of insertedProducts.slice(0, 10)) {
      const review1 = { ...sampleReviews[0], productId: product._id, userId: new mongoose.Types.ObjectId() };
      const review2 = { ...sampleReviews[1], productId: product._id, userId: new mongoose.Types.ObjectId() };
      await Review.create([review1, review2]);
      reviewCountTotal += 2;
      
      product.reviewCount = (product.reviewCount || 0) + 2;
      await product.save();
    }
    console.log(`Successfully created ${reviewCountTotal} sample reviews.`);

    console.log('--- SEEDING COMPLETE ---');
    if (memoryServer) await memoryServer.stop();
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    if (memoryServer) await memoryServer.stop();
    process.exit(1);
  }
};

seedDB();
