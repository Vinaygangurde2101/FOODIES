const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6 
  },
  preferences: {
    foodType: { type: String, default: 'Snacks' },
    budget: { type: String, default: '200-500' },
    spiceLevel: { type: String, default: 'Medium' },
    region: { type: String, default: 'All Maharashtra' }
  },
  recentlyViewed: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Password Hash Pre-save middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
