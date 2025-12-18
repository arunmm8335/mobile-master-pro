# Deployment Instructions - Render + Vercel

## Step 1: Deploy Backend to Render

1. **Go to Render Dashboard**
   - Visit https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `mobilemaster-pro-api`
   - Build Command: `npm install && npx tsc`
   - Start Command: `node dist/server/index.js`

3. **Add Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://arunmyageri26_db_user:2tyaOEJjo5IVXh8m@cluster0.draxbf9.mongodb.net/?appName=Cluster0
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-app.vercel.app
   ```
   (JWT_SECRET will be auto-generated)

4. **Deploy & Copy URL**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy your backend URL (e.g., `https://mobilemaster-pro-api.onrender.com`)

---

## Step 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variable**
   - Click "Environment Variables"
   - Add variable:
     ```
     Name: VITE_API_URL
     Value: https://mobilemaster-pro-api.onrender.com
     ```
     (Replace with your actual Render backend URL)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

---

## Step 3: Update CORS (Important!)

After deploying to Vercel, update the backend:

1. **Go to Render Dashboard** → Your Service → Environment
2. **Update FRONTEND_URL** to your actual Vercel URL:
   ```
   FRONTEND_URL=https://your-actual-app.vercel.app
   ```
3. **Trigger Redeploy** in Render

---

## Step 4: Seed Database (One Time)

After backend is deployed, seed the database:

1. Go to Render Dashboard → Your Service → Shell
2. Run: `npm run seed`

Or locally:
```bash
MONGODB_URI=your_atlas_uri npm run seed
```

---

## ✅ Verification Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] VITE_API_URL set in Vercel
- [ ] FRONTEND_URL set in Render
- [ ] Database seeded
- [ ] Can login with default credentials
- [ ] Profile images upload successfully
- [ ] Products load correctly

---

## 🐛 Troubleshooting

### CORS Errors
- Make sure FRONTEND_URL in Render matches your Vercel URL exactly
- Include `https://` in the URL
- Redeploy backend after changing FRONTEND_URL

### API Not Found (404)
- Check VITE_API_URL in Vercel includes `/api` path
- Verify backend is running on Render

### Database Connection Failed
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check MONGODB_URI is correct in Render

---

## 📝 Default Login Credentials

**Admin:** admin@mobilemaster.com / admin123
**User:** alice@example.com / user123
**Seller:** seller@example.com / seller123

---

Your app should now be fully deployed and accessible! 🎉
