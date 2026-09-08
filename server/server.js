const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const path = require('path');

dotenv.config();
connectDB();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'OK',
    service: 'Naik Foods API',
    timestamp: new Date().toISOString()
  });
});

app.use(['/api/auth', '/auth'], require('./routes/authRoutes'));
app.use(['/api/products', '/products'], require('./routes/productRoutes'));
app.use(['/api/recommendations', '/recommendations'], require('./routes/recommendationRoutes'));
app.use(['/api/cart', '/cart'], require('./routes/cartRoutes'));
app.use(['/api/reviews', '/reviews'], require('./routes/reviewRoutes'));
app.use(['/api/orders', '/orders'], require('./routes/orderRoutes'));

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found - ${req.originalUrl}` });
});

app.use(errorHandler);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
