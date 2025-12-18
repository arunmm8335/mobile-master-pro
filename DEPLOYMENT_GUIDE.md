# 🚀 Deployment Guide - MobileMaster Pro

This guide will help you deploy your application to production.

## 📋 Overview

Your app has 3 components to deploy:
1. **Database** - MongoDB
2. **Backend API** - Node.js/Express server
3. **Frontend** - React/Vite app

## 🗄️ Step 1: Database - MongoDB Atlas (Free)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Create a new cluster (Free M0 tier)

2. **Configure Database**
   - Click "Connect" on your cluster
   - Add IP Address: `0.0.0.0/0` (allow all IPs)
   - Create database user with username/password
   - Copy connection string

3. **Connection String Format**
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mobilemaster?retryWrites=true&w=majority
   ```

## 🔧 Step 2: Backend - Render (Free)

1. **Prepare Backend for Deployment**
   
   Update `server/index.ts` to use environment port:
   ```typescript
   const PORT = process.env.PORT || 5000;
   ```

2. **Create `render.yaml` in root**
   ```yaml
   services:
     - type: web
       name: mobilemaster-api
       env: node
       buildCommand: npm install && npm run build
       startCommand: node dist/server/index.js
       envVars:
         - key: NODE_ENV
           value: production
         - key: MONGODB_URI
           sync: false
         - key: RAZORPAY_KEY_ID
           sync: false
         - key: RAZORPAY_KEY_SECRET
           sync: false
         - key: GEMINI_API_KEY
           sync: false
   ```

3. **Deploy to Render**
   - Go to https://render.com
   - Sign up and connect GitHub
   - Click "New +" → "Web Service"
   - Select your repository
   - Configure:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `node dist/server/index.js`
     - **Environment Variables**: Add all your .env variables

4. **Copy Backend URL**
   - After deployment, copy your API URL (e.g., `https://mobilemaster-api.onrender.com`)

## 🎨 Step 3: Frontend - Vercel (Free & Fast)

1. **Update API URL in Frontend**
   
   Create `services/config.ts`:
   ```typescript
   export const API_URL = import.meta.env.PROD 
     ? 'https://your-backend-url.onrender.com'
     : 'http://localhost:5000';
   ```

2. **Update all API calls in `services/db.ts`**
   ```typescript
   import { API_URL } from './config';
   
   // Replace all fetch URLs from '/api/...' to:
   fetch(`${API_URL}/api/...`)
   ```

3. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign up and import your GitHub repo
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Click "Deploy"

4. **Your app is live!** 🎉

---

## ⚡ Alternative: Full Stack on Render

Deploy both frontend and backend on Render:

### Option A: Single Service (Simpler)

1. **Update `server/index.ts`** to serve frontend:
   ```typescript
   import path from 'path';
   
   // Serve static files from React build
   app.use(express.static(path.join(__dirname, '../../dist')));
   
   // All other routes return index.html
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../../dist/index.html'));
   });
   ```

2. **Create `render.yaml`**:
   ```yaml
   services:
     - type: web
       name: mobilemaster-pro
       env: node
       buildCommand: npm install && npm run build
       startCommand: node dist/server/index.js
   ```

3. Deploy on Render - both frontend and backend together!

---

## 🐳 Alternative: Docker + Railway

1. **Create `Dockerfile`**:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   EXPOSE 5000
   
   CMD ["node", "dist/server/index.js"]
   ```

2. **Deploy to Railway**:
   - Go to https://railway.app
   - Connect GitHub repo
   - Add MongoDB plugin
   - Deploy automatically

---

## 🔐 Environment Variables Checklist

Make sure to set these in your hosting platform:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

---

## ✅ Post-Deployment Checklist

- [ ] Database connected successfully
- [ ] Backend API responding
- [ ] Frontend loading correctly
- [ ] Login/Register working
- [ ] Product images displaying
- [ ] Payment gateway functional
- [ ] AI chat working
- [ ] Profile image upload working

---

## 🐛 Troubleshooting

### CORS Errors
Add to `server/index.ts`:
```typescript
app.use(cors({
  origin: ['https://your-frontend-domain.vercel.app'],
  credentials: true
}));
```

### Build Errors
- Check Node version (use v18+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check build logs in hosting dashboard

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has read/write permissions

---

## 💰 Cost Estimation

**Free Tier (Recommended for starting)**
- MongoDB Atlas: Free (M0 cluster)
- Render: Free (with some limitations)
- Vercel: Free (hobby plan)
- **Total: $0/month** ✨

**Paid Tier (For production)**
- MongoDB Atlas: $9/month (M10 cluster)
- Render: $7/month (starter)
- Vercel: Free or $20/month (pro)
- **Total: ~$16-36/month**

---

## 🎯 Recommended Approach

For beginners:
1. **Database**: MongoDB Atlas (Free)
2. **Backend**: Render (Free)
3. **Frontend**: Vercel (Free)

This gives you:
- ✅ Separate services (easier to debug)
- ✅ Auto-deploy on git push
- ✅ HTTPS by default
- ✅ Good performance
- ✅ Free to start

---

Need help? Check the hosting platform docs or reach out to the community!
