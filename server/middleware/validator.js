const { body, validationResult } = require('express-validator');

// Validation check execution middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email address is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email address is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const orderValidation = [
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.address').notEmpty().withMessage('Delivery address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').notEmpty().withMessage('Pincode is required'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  orderValidation
};
