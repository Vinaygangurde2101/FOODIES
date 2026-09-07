const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'], 
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    index: true 
  },
  description: { 
    type: String, 
    required: [true, 'Product description is required'] 
  },
  shortDescription: { 
    type: String, 
    required: [true, 'Short description is required'] 
  },
  price: { 
    type: Number, 
    required: [true, 'Product price is required'], 
    min: [0, 'Price must be non-negative'] 
  },
  originalPrice: { 
    type: Number 
  },
  weight: { 
    type: String, 
    required: [true, 'Weight/Quantity specification is required'] 
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'], 
    enum: ['Snacks', 'Pickles', 'Sweets', 'Bakery', 'Masala', 'Healthy', 'Traditional Specials']
  },
  region: { 
    type: String, 
    enum: ['Konkan', 'Vidarbha', 'Marathwada', 'Western Maharashtra', 'All Maharashtra', 'Pan-Indian'],
    default: 'All Maharashtra'
  },
  spiceLevel: { 
    type: String, 
    enum: ['Mild', 'Medium', 'Spicy', 'None'], 
    default: 'None'
  },
  dietaryTags: [{ 
    type: String 
  }],
  ingredients: [{ 
    type: String 
  }],
  nutrition: {
    calories: { type: String, default: '150 kcal per 50g' },
    protein: { type: String, default: '3g' },
    carbs: { type: String, default: '20g' },
    fat: { type: String, default: '6g' }
  },
  shelfLife: { 
    type: String, 
    default: '6 Months' 
  },
  storageInstructions: { 
    type: String, 
    default: 'Store in a cool, dry place away from direct sunlight.' 
  },
  images: [{ 
    type: String 
  }],
  rating: { 
    type: Number, 
    default: 4.5, 
    min: 0, 
    max: 5 
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  },
  tags: [{ 
    type: String 
  }],
  isPopular: { 
    type: Boolean, 
    default: false 
  },
  isBestSeller: { 
    type: Boolean, 
    default: false 
  },
  stock: { 
    type: Number, 
    required: true, 
    default: 50,
    min: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Text index for fast multi-field search
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  tags: 'text', 
  ingredients: 'text',
  category: 'text',
  region: 'text'
});

module.exports = mongoose.model('Product', productSchema);
