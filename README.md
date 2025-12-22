# StudyCircle - Full Stack Group Study Application
## Prerequisites
- **Node.js**: Installed on your machine.
- **MongoDB**: Installed locally OR Docker Desktop.
---
## Step 1: Start the Database (MongoDB)
You need a running MongoDB database. Choose **ONE** option:
### Option A: Using Docker (Recommended)
If you have Docker installed, open a terminal in this folder and run:
```bash
docker-compose up -d mongo
```
### Option B: Local Installation
If you have installed MongoDB Community Server, just ensure the service is running.
---
## Step 2: Start the Backend (Node.js API)
1. Open a **new terminal**.
2. Navigate to the server folder:
   ```bash
   cd server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Setup Environment Variables:
   - Create a file named `.env` in the `server` folder.
   - Copy the following text into it:
     ```env
     MONGO_URI=mongodb://localhost:27017/studycircle
     JWT_SECRET=mysecretkey
     JWT_REFRESH_SECRET=myrefreshsecret
     PORT=5000
     ```
5. Seed the Database (Create Admin User):
   ```bash
   npm run seed
   ```
6. Start the Server:
   ```bash
   npm run dev
   ```
   > You should see: `Server running on port 5000` and `MongoDB Connected`.
---
## Step 3: Start the Frontend (React + Tailwind)
1. Open another **new terminal**.
2. Navigate to the client folder:
   ```bash
   cd client
   ```
3. Install dependencies (using legacy flags for compatibility):
   ```bash
   npm install --legacy-peer-deps
   ```
4. Start the Application:
   ```bash
   npm run dev
   ```
   > You should see: `Local: http://localhost:5173/`
---
## Step 4: Login
1. Open your browser and go to [http://localhost:5173](http://localhost:5173).
2. Login with the Admin credentials:
   - **Email**: `admin@example.com`
   - **Password**: `password123`
---
## Accessing from Other Devices (Phones, Tablets, Other Computers)
To access StudyCircle from other devices on your network:
1. **Configure Client Environment**:
   ```bash
   cd client
   cp .env.example .env
   ```
   Edit `.env` and replace `localhost` with your computer's IP address
2. **Find Your IP Address**:
   - Windows: Run `ipconfig` (look for IPv4 Address)
   - Mac/Linux: Run `ifconfig` or `ip addr`
3. **Configure Firewall**: Allow ports 5000 and 5173
4. **Access from Device**: Open `http://YOUR_IP:5173` on your phone/tablet
📖 **For detailed instructions**, see [docs/NETWORK_ACCESS.md](docs/NETWORK_ACCESS.md)
---
## Troubleshooting
### "Access is denied" when starting MongoDB
If you see `System error 5 has occurred. Access is denied.` when running `net start MongoDB`, it means you need **Administrator privileges**.
**Fix:**
1. Search for **PowerShell** in your Start Menu.
2. Right-click it and choose **Run as Administrator**.
3. Run `net start MongoDB` in that new window.
---
## Working Across Multiple Laptops (Git & GitHub)
This project uses Git for version control, allowing you to work on it from any laptop.
### First Time Setup (Current Laptop)
1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. **Create a GitHub Repository**:
   - Go to [github.com](https://github.com) and login
   - Click the **+** icon → **New repository**
   - Name it (e.g., "studycircle" or "HIRALAL")
   - Keep it **Private** (recommended)
   - **DO NOT** initialize with README
   - Click **Create repository**
3. **Connect and Push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
### Setting Up on Another Laptop
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```
2. **Install Dependencies**:
   ```bash
   # Backend
   cd server
   npm install
   # Frontend
   cd ../client
   npm install --legacy-peer-deps
   ```
3. **Create `.env` File**:
   - In the `server` folder, create a `.env` file
   - Copy the contents from `server/.env.example`
   - Update values if needed (MongoDB URI, JWT secrets, etc.)
4. **Start the Application** (follow Steps 1-4 from above)
### Daily Workflow
**Before starting work** (get latest changes):
```bash
git pull origin main
```
**After making changes** (save your work):
```bash
git add .
git commit -m "Describe what you changed"
git push origin main
```
### Important Notes
- ⚠️ The `.env` file is **NOT** synced (for security)
- ⚠️ `node_modules` folders are **NOT** synced (run `npm install` on each laptop)
- ✅ All your code, components, and configurations **ARE** synced