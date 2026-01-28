# Crypto Portfolio Dashboard - Deployment Guide

Deploy your Crypto Portfolio Dashboard to Render using this guide.

## 🚀 Quick Deploy with Render Blueprint

### Step 1: Push to GitHub
Make sure all your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository: `sujithreddy0007/Crypto-Portfolio-Dashboard`
4. Render will detect the `render.yaml` and set up both services

### Step 3: Configure Environment Variables

After the blueprint creates your services, set these environment variables:

#### Backend (crypto-portfolio-api):

| Variable | Value | Required |
|----------|-------|----------|
| `MONGO_URI` | Your MongoDB connection string | ✅ Yes |
| `JWT_SECRET` | A random secure string (32+ chars) | ✅ Yes |
| `COINGECKO_API_KEY` | Your CoinGecko API key | Optional |
| `GEMINI_API_KEY` | Your Gemini AI API key | Optional |

#### Frontend (crypto-portfolio-frontend):

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_API_URL` | Your backend URL (e.g., `https://crypto-portfolio-api.onrender.com`) | ✅ Yes |

---

## 📋 Manual Deployment (Alternative)

If you prefer to deploy services manually:

### Deploy Backend API

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `crypto-portfolio-api`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (see table above)
5. Click **Create Web Service**

### Deploy Frontend

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `crypto-portfolio-frontend`
   - **Root Directory**: `client`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = Your backend URL
5. Click **Create Web Service**

---

## 🔐 Getting Required Keys

### MongoDB Atlas (Free)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string (replace `<password>` with your password)
5. Add `0.0.0.0/0` to IP Access List for Render

### JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CoinGecko API Key (Optional)
- Free tier works without a key
- For higher rate limits: [coingecko.com/api](https://www.coingecko.com/api)

### Gemini AI Key (Optional)
- Get from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

---

## ⚠️ Important Notes

1. **Free Tier Spin-down**: Render's free tier spins down after 15 min of inactivity. First request after spin-down takes ~30 seconds.

2. **MongoDB Whitelist**: Make sure to allow access from `0.0.0.0/0` in MongoDB Atlas Network Access settings.

3. **CORS**: The backend is configured to accept requests from the frontend URL.

4. **Build Time**: Initial deployment may take 5-10 minutes.

---

## 🔗 Your URLs (after deployment)

- **Frontend**: `https://crypto-portfolio-frontend.onrender.com`
- **Backend API**: `https://crypto-portfolio-api.onrender.com`
- **Health Check**: `https://crypto-portfolio-api.onrender.com/api/health`

---

## 🐛 Troubleshooting

### Backend not starting?
- Check Render logs for errors
- Verify `MONGO_URI` is correct and MongoDB Atlas allows access

### Frontend can't reach API?
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check if backend is running (visit `/api/health`)

### 502 errors?
- Check if services have finished deploying
- Review logs in Render dashboard

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Created Render account
- [ ] Deployed backend service
- [ ] Set `MONGO_URI` and `JWT_SECRET`
- [ ] Deployed frontend service
- [ ] Set `NEXT_PUBLIC_API_URL` to backend URL
- [ ] Tested the application
