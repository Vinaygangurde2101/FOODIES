# Naik Foods SmartShop

> **Tagline**: *Discover. Personalize. Shop Smarter.*  
> **Repository**: [GitHub Repository](https://github.com/Vinaygangurde2101/FOODIES.git)  
> **Live Demo**: [Naik Foods SmartShop Live](https://naik-foods-smartshop.vercel.app)

---

## 1. Overview

**Naik Foods SmartShop** is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce web application engineered to solve discovery friction in traditional Indian food shopping. Instead of blindly cloning standard flat-grid store layouts, SmartShop introduces **Smart Food Discovery**, a **Rule-Based Recommendation Engine**, **Personalized Taste Matching**, and an **Interactive Smart Cart** featuring dynamic free-delivery progress tracking (Threshold: ₹999) and gap-filling cross-selling.

---

## 2. The E-Commerce Problem & Solution

### Problem
In food e-commerce, customers face catalog overwhelm with hundreds of pickles, snacks, sweets, and masalas. Users cannot gauge spice heat levels, regional origins, or suitability for their budget, leading to decision fatigue and high cart abandonment when unexpected shipping fees appear at checkout.

### Solution
Naik Foods SmartShop introduces four high-impact solutions:
1. **Smart Food Finder (`/smart-finder`)**: A 4-step interactive preference questionnaire matching cravings (Spicy, Sweet, Snacks, Healthy, Traditional, Gift), budget windows, spice tolerance (Mild, Medium, Spicy), and regional origins.
2. **Explainable Rule-Based Recommendation Engine**: A transparent backend scoring service (`recommendationService.js`) returning ranked product matches with human-readable rationale (e.g., *"Matches your spicy preference"*, *"Within your ₹200–₹500 budget"*).
3. **Smart Cart with Dynamic Free-Delivery Progress**: Real-time progress tracking bar for ₹999 free delivery with exact delta feedback (*"₹279 away from FREE DELIVERY 🚚"* / *"🎉 You've unlocked FREE DELIVERY!"*).
4. **Contextual Cross-Selling**: Targeted recommendations for affordable products (₹100–₹300) specifically selected to help customers cross the ₹999 free-delivery threshold cleanly without forcing excess spending.

---

## 3. Technology Stack

- **Frontend**: React.js (v18), Vite, React Router v6, Tailwind CSS (v3), Axios, Context API (`AuthContext`, `CartContext`), Lucide React icons.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), MongoMemoryServer (Zero-config fallback), JWT authentication, bcryptjs password hashing, express-validator, CORS, Helmet.
- **Data & Seeding**: 40+ authentic Maharashtrian & Indian food products dataset with prices in Indian Rupees (₹ INR).
- **Deployment Ready**: Configured for Vercel/Netlify (Frontend) and Render/Railway (Backend).

---

## 4. System Architecture

```
client/ (React + Vite + Tailwind)
   ├── src/
   │   ├── components/       # Reusable ProductCard, Navbar, Footer, FreeDeliveryProgress
   │   ├── context/          # AuthContext & CartContext
   │   ├── pages/            # Home, Store, ProductDetail, SmartFinder, Cart, Checkout
   │   └── services/         # Axios API clients
   │
server/ (Node.js + Express + MongoDB)
   ├── config/               # Database connection (Auto-MongoMemoryServer fallback)
   ├── controllers/          # HTTP request handlers
   ├── middleware/           # JWT Auth & express-validator
   ├── models/               # Mongoose Schemas (Product, User, Cart, Review, Order)
   ├── routes/               # REST API endpoints
   ├── seed/                 # 40+ Products seed data JSON & runner
   └── services/             # Recommendation scoring & Analytics logger
```

---

## 5. API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Catalog listing with category, region, spice, price filters & sorting |
| `GET` | `/api/products/search?q=` | Multi-field search with typo suggestions |
| `GET` | `/api/products/slug/:slug` | Get single product by slug |
| `POST` | `/api/recommendations/smart-finder` | Accepts quiz answers; returns scored recommendations with reasons |
| `POST` | `/api/recommendations/cross-sell` | Accepts cart product IDs & subtotal; returns ideal gap-filler items |
| `GET` | `/api/cart` | Retrieve active cart with server-validated pricing |
| `POST` | `/api/cart/items` | Add item to cart |
| `PATCH` | `/api/cart/items/:productId` | Update item quantity |
| `DELETE` | `/api/cart/items/:productId` | Remove item from cart |
| `POST` | `/api/orders` | Checkout endpoint; verifies backend prices, generates unique Order ID |
| `POST` | `/api/auth/register` | Register user account with taste preferences |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |

---

## 6. Recommendation Engine Scoring Logic

Every product is evaluated by `recommendationService.js` using the rule formula:

$$S = S_{\text{category}} (+30) + S_{\text{preference}} (+25) + S_{\text{budget}} (+20) + S_{\text{region}} (+10) + S_{\text{spice}} (+10) + S_{\text{rating}} (+5) + S_{\text{bestseller}} (+5)$$

Matched products are returned with human-readable rationale tags explaining why each product was selected for the customer.

---

## 7. Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Step 1: Clone Repository
```bash
git clone https://github.com/placeholder/naik-foods-smartshop.git
cd naik-foods-smartshop
```

### Step 2: Install Server Dependencies & Start Backend
```bash
cd server
npm install
npm run seed     # Populates database with 40+ authentic food products
npm run dev      # Starts Express API server on http://localhost:5000
```

### Step 3: Install Client Dependencies & Start Frontend
```bash
cd ../client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 8. Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/naik_foods_smartshop
JWT_SECRET=naik_foods_smartshop_jwt_secret_key_2026_super_secure
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 9. Verification & Build Commands

To verify zero-error production build:
```bash
cd client
npm run build
```

---

## 10. Deployment Guide (Vercel)

### Step 1: Import Project to Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository: `Vinaygangurde2101/FOODIES`.

### Step 2: Configure Project Settings
- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Set Environment Variables
Add the following Environment Variable in Vercel:
- `VITE_API_BASE_URL` = `https://<your-backend-domain>/api` (or relative `/api` if deployed together)

---

## 11. Known Limitations & Future Roadmap

- **Known Limitations**: Payment processing uses simulated "Demo Payment" / Cash on Delivery for assessment safety.
- **Future Roadmap**: Sub-regional cooking kit bundles, automated monthly recurring staple subscriptions (ghee, chutneys), and AI recipe pairing.

---

## Author
**Vinay Gangurde** — Full Stack MERN Prototype Presentation.
