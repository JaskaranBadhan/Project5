# HTTPS Setup Guide for StudyCircle

This guide will help you set up HTTPS for local development to enable geolocation features on network devices.

## Why HTTPS?

Browsers require HTTPS (secure connection) for geolocation API. When accessing your app from another device via HTTP (`http://192.168.x.x:5173`), location sharing won't work.

## Step 1: Install mkcert

### Windows

**Option A: Download Executable (Recommended)**
1. Go to: https://github.com/FiloSottile/mkcert/releases
2. Download `mkcert-v1.4.4-windows-amd64.exe`
3. Rename it to `mkcert.exe`
4. Move it to a folder in your PATH, or:
   - Create folder: `C:\mkcert`
   - Move `mkcert.exe` there
   - Add `C:\mkcert` to your System PATH:
     - Search "Environment Variables" in Windows
     - Edit "Path" under System variables
     - Add new entry: `C:\mkcert`
     - Click OK and restart PowerShell

**Option B: Using Chocolatey** (if you have it installed)
```powershell
choco install mkcert
```

**Option C: Using Scoop** (if you have it installed)
```powershell
scoop bucket add extras
scoop install mkcert
```

### Verify Installation

Open a new PowerShell window and run:
```powershell
mkcert -version
```

You should see the version number (e.g., `v1.4.4`).

## Step 2: Install Local Certificate Authority

Run this command to install mkcert's root certificate:
```powershell
mkcert -install
```

This will:
- Create a local Certificate Authority (CA)
- Install it in your system's trust store
- You may see a Windows security prompt - click "Yes"

## Step 3: Find Your IP Address

Run:
```powershell
ipconfig
```

Look for "IPv4 Address" under your active network adapter (WiFi or Ethernet).
Example: `192.168.1.100`

**Write down your IP address - you'll need it!**

## Step 4: Generate SSL Certificates

Navigate to your project's client directory:
```powershell
cd client
```

Generate certificates for localhost AND your IP address:
```powershell
mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem localhost 127.0.0.1 ::1 YOUR_IP_ADDRESS
```

**Replace `YOUR_IP_ADDRESS` with your actual IP!**

Example:
```powershell
mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem localhost 127.0.0.1 ::1 192.168.1.100
```

You should see:
```
Created a new certificate valid for the following names:
 - "localhost"
 - "127.0.0.1"
 - "::1"
 - "192.168.1.100"

The certificate is at ".cert/cert.pem" and the key at ".cert/key.pem"
```

## Step 5: Configure Environment Variables

1. Navigate to the `client` folder
2. Copy `.env.example` to `.env`:
   ```powershell
   cp .env.example .env
   ```

3. Edit `.env` and update the API URL to use HTTPS and your IP:
   ```
   VITE_API_URL=https://YOUR_IP_ADDRESS:5000
   ```
   
   Example:
   ```
   VITE_API_URL=https://192.168.1.100:5000
   ```

## Step 6: Start the Servers

**Terminal 1 - Backend:**
```powershell
cd server
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```

You should see:
```
  ➜  Local:   https://localhost:5173/
  ➜  Network: https://192.168.1.100:5173/
```

Notice the **https://** instead of http://!

## Step 7: Access from Other Devices

### On Your Computer
Open browser and go to: `https://localhost:5173`

You should see a secure connection (🔒 padlock icon).

### On Another Device (Phone/Tablet)

1. **Connect to the same WiFi** as your computer
2. Open browser and go to: `https://YOUR_IP:5173`
   
   Example: `https://192.168.1.100:5173`

3. **First time only:** You'll see a security warning because the device doesn't trust the certificate yet.
   
   **On Mobile:**
   - **Android Chrome:** Click "Advanced" → "Proceed to [IP] (unsafe)"
   - **iOS Safari:** Click "Show Details" → "visit this website"
   
   This is safe because it's YOUR certificate on YOUR local network.

4. **Test geolocation:**
   - Go to a chat
   - Click the location share button (📍)
   - You should now be able to share your location!

## Troubleshooting

### "mkcert: command not found"
- Make sure you added mkcert to your PATH
- Restart PowerShell after adding to PATH
- Try running with full path: `C:\mkcert\mkcert.exe -version`

### "Cannot find .cert directory"
- Make sure you're in the `client` folder when running mkcert
- The directory should be created automatically

### Vite still shows HTTP
- Check that `.cert/cert.pem` and `.cert/key.pem` exist
- Restart the Vite dev server
- Check vite.config.js has the HTTPS configuration

### Certificate error on mobile
- This is expected for self-signed certificates
- Click "Advanced" or "Show Details" and proceed
- The connection is still encrypted and safe for local development

### Geolocation still doesn't work
- Verify you're accessing via HTTPS (check for 🔒 in address bar)
- Check browser console for errors
- Make sure you clicked "Allow" when browser asks for location permission

## Security Notes

> [!WARNING]
> - These certificates are for **local development only**
> - Do not use in production
> - Do not share your certificates with others
> - The `.cert` folder is in `.gitignore` and won't be committed

## Reverting to HTTP

If you want to go back to HTTP:

1. Delete or rename the `.cert` folder
2. Restart Vite dev server
3. Update `.env` to use `http://` instead of `https://`

The Vite config will automatically detect the missing certificates and use HTTP.

## For Production

When deploying to production (Render, Vercel, etc.), you don't need any of this! Production platforms automatically provide HTTPS certificates. Just deploy normally.
