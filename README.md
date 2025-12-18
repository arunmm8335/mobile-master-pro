# MobileMaster Pro 📱

A modern, full-featured e-commerce platform for mobile phones with integrated repair services, seller marketplace, and delivery management.

## ✨ Features

- **🛒 E-Commerce Platform**: Browse and purchase premium smartphones
- **🔧 Repair Services**: Book appointments for screen replacement, battery replacement, and water damage repairs
- **👥 Multi-Role System**: Admin, Seller, Delivery, and Customer roles
- **💳 Payment Integration**: Razorpay payment gateway
- **📦 Order Management**: Complete order tracking and management
- **🚚 Delivery Dashboard**: Real-time delivery tracking and management
- **💬 AI Chat Support**: Gemini-powered customer support
- **❤️ Wishlist**: Save favorite products
- **👤 User Profiles**: Complete profile management with photo upload
- **📱 Responsive Design**: Modern UI with dark mode support

## 🚀 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB for database
- TypeScript
- Gemini AI for chat support

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Razorpay account (for payments)
- Gemini API key (for AI chat)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:arunmm8335/mobile-master-pro.git
   cd mobile-master-pro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Initialize the database:**
   ```bash
   npm run seed
   ```

## 🏃 Run Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👥 Default Login Credentials

### Admin
- Email: `admin@mobilemaster.com`
- Password: `admin123`

### Seller
- Email: `seller@example.com`
- Password: `seller123`

### Delivery
- Email: `delivery@example.com`
- Password: `delivery123`

## 📁 Project Structure

```
mobilemaster-pro/
├── components/          # React components
├── context/            # React context providers
├── server/             # Backend server code
│   ├── routes/        # API routes
│   └── models/        # Database models
├── services/          # Frontend services
└── uploads/           # File upload directory
```

## 🔑 Key Features Explained

### Admin Dashboard
- Manage products, orders, sellers, and deliveries
- View analytics and statistics
- Approve/reject seller registrations

### Seller Dashboard
- Add and manage products
- Track sales and revenue
- Manage inventory

### Repair Services
- Screen replacement
- Battery replacement
- Water damage repair
- Book appointments with time slots

### Payment Integration
- Secure Razorpay payment gateway
- Order confirmation and tracking
- Payment status updates

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any queries, reach out to the development team.
