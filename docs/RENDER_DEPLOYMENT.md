# Deploying StudyCircle to Render

This guide will walk you through deploying your StudyCircle application to Render, a cloud platform that makes it easy to deploy full-stack applications.

## Overview

Your StudyCircle application consists of:
- **Backend**: Node.js/Express server (in `server/` folder)
- **Frontend**: React/Vite application (in `client/` folder)
- **Database**: MongoDB (we'll use MongoDB Atlas for cloud hosting)

We'll deploy these as separate services on Render:
1. MongoDB Atlas (free cloud database)
2. Backend API (Render Web Service)
3. Frontend (Render Static Site)

---

## Prerequisites

- [ ] GitHub account
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] MongoDB Atlas account (sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- [ ] Your code pushed to a GitHub repository

---

## Step 1: Push Your Code to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

> **Important**: Make sure your `.gitignore` is properly configured (it already is!) so that `node_modules/`, `.env`, and `uploads/` are not pushed.

---

## Step 2: Set Up MongoDB Atlas (Free Cloud Database)

1. **Sign up** at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)

2. **Create a Free Cluster**:
   - Click "Build a Database"
   - Choose **FREE** tier (M0 Sandbox)
   - Select a cloud provider and region (choose one closest to you)
   - Click "Create Cluster"

3. **Create Database User**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `studycircle` (or your choice)
   - Password: Generate a secure password (save this!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Addresses**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://studycircle:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name before the `?`: 
     ```
     mongodb+srv://studycircle:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/studycircle?retryWrites=true&w=majority
     ```
   - **Save this connection string** - you'll need it for Render!

---

## Step 3: Deploy Backend to Render

### 3.1 Create Web Service

1. **Log in to Render** at [dashboard.render.com](https://dashboard.render.com)

2. **Click "New +"** → **"Web Service"**

3. **Connect GitHub Repository**:
   - Click "Connect account" if needed
   - Select your repository
   - Click "Connect"

4. **Configure Service**:
   - **Name**: `studycircle-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3.2 Set Environment Variables

Click "Advanced" → "Add Environment Variable" and add these:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string from Step 2 |
| `JWT_SECRET` | A random secure string (e.g., `your-super-secret-jwt-key-12345`) |
| `JWT_REFRESH_SECRET` | Another random secure string (e.g., `your-refresh-secret-67890`) |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |

> **Tip**: Generate secure secrets using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3.3 Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Once deployed, you'll see a URL like: `https://studycircle-backend.onrender.com`
4. **Save this URL** - you'll need it for the frontend!

### 3.4 Seed the Database

After deployment, you need to create the admin user:

1. Go to your service dashboard
2. Click "Shell" tab
3. Run:
   ```bash
   npm run seed
   ```

---

## Step 4: Deploy Frontend to Render

### 4.1 Update Frontend API URL

Before deploying the frontend, you need to update it to use your deployed backend URL.

**Option A: Using Environment Variables (Recommended)**

1. Create a file `client/.env.production`:
   ```env
   VITE_API_URL=https://studycircle-backend.onrender.com
   ```

2. Update your API configuration file (likely in `client/src/` - check for `axios` config or API constants) to use:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   ```

**Option B: Direct Update**

Find where your frontend makes API calls (usually in a config file or axios instance) and update the base URL to your Render backend URL.

### 4.2 Create Static Site

1. **In Render Dashboard**, click "New +" → **"Static Site"**

2. **Connect Repository** (same as before)

3. **Configure Site**:
   - **Name**: `studycircle-frontend`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory**: `dist`

### 4.3 Add Environment Variable

Click "Advanced" → "Add Environment Variable":

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend URL (e.g., `https://studycircle-backend.onrender.com`) |

### 4.4 Deploy

1. Click **"Create Static Site"**
2. Wait for build to complete
3. Your app will be live at: `https://studycircle-frontend.onrender.com`

---

## Step 5: Configure CORS on Backend

Your backend needs to allow requests from your frontend domain.

1. **Update `server/server.js`** (or wherever CORS is configured):

```javascript
const cors = require('cors');

// Update CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', // Local development
    'https://studycircle-frontend.onrender.com' // Production frontend
  ],
  credentials: true
}));
```

2. **Commit and push**:
```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

3. Render will automatically redeploy your backend

---

## Step 6: Test Your Deployment

1. Visit your frontend URL: `https://studycircle-frontend.onrender.com`
2. Try logging in with:
   - **Email**: `admin@example.com`
   - **Password**: `password123`
3. Test creating groups, chatting, etc.

---

## Important Notes

### Free Tier Limitations

- **Backend**: Render free tier spins down after 15 minutes of inactivity. First request after inactivity may take 30-60 seconds.
- **Database**: MongoDB Atlas free tier has 512MB storage limit
- **Frontend**: Static sites don't spin down

### File Uploads

The current setup stores uploads in `server/uploads/` which is **ephemeral** on Render (files are lost on redeploy). For production, you should:

1. Use a cloud storage service like:
   - **Cloudinary** (images/videos)
   - **AWS S3** (any files)
   - **Render Disks** (paid feature)

2. Update your multer configuration to use cloud storage

### Environment Variables

Never commit `.env` files! Always set them in Render's dashboard.

### Custom Domain (Optional)

You can add a custom domain in Render:
1. Go to your service settings
2. Click "Custom Domain"
3. Follow instructions to add your domain

---

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

### Frontend can't connect to backend
- Check CORS configuration
- Verify `VITE_API_URL` is set correctly
- Check browser console for errors

### Database connection failed
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure database user has correct permissions

### Build fails
- Check build logs in Render
- Verify `package.json` scripts are correct
- For frontend, ensure `--legacy-peer-deps` is in build command

---

## Updating Your App

Whenever you push changes to GitHub, Render will automatically redeploy:

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main
```

Both frontend and backend will rebuild automatically!

---

## Next Steps

- [ ] Set up custom domain
- [ ] Configure cloud storage for file uploads
- [ ] Set up monitoring and alerts
- [ ] Consider upgrading to paid tier for better performance
- [ ] Set up staging environment for testing

---

## Useful Links

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Congratulations! Your StudyCircle app is now live! 🎉**
