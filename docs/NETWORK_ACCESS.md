# Network Access Guide for StudyCircle

This guide explains how to access your StudyCircle application from other devices on your local network (phones, tablets, other computers).

## Quick Setup

### 1. Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with `192.168.x.x` or `10.0.x.x`)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```
Look for "inet" address under your active network interface

### 2. Configure the Client

1. Navigate to the `client` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and replace `localhost` with your IP address:
   ```
   VITE_API_URL=http://192.168.1.100:5000
   ```
   (Replace `192.168.1.100` with your actual IP address)

### 3. Configure Firewall

**Windows:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter ports: `5000,5173`
6. Allow the connection
7. Apply to all profiles
8. Name it "StudyCircle Dev Server"

**Mac:**
1. Go to System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Add Node.js and allow incoming connections

**Linux:**
```bash
sudo ufw allow 5000
sudo ufw allow 5173
```

### 4. Start the Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access from Other Devices

On your phone/tablet/other computer, open a browser and navigate to:
```
http://YOUR_IP:5173
```

For example: `http://192.168.1.100:5173`

## Troubleshooting

### Connection Refused Error

**Problem:** `ERR_CONNECTION_REFUSED` when accessing from another device

**Solutions:**
1. ✅ Verify your IP address is correct
2. ✅ Check that both servers are running
3. ✅ Ensure firewall allows ports 5000 and 5173
4. ✅ Make sure both devices are on the same WiFi network
5. ✅ Try disabling firewall temporarily to test

### Socket.IO Connection Failed

**Problem:** Socket.IO shows connection errors in browser console

**Solutions:**
1. ✅ Verify `.env` file has correct IP address
2. ✅ Restart the Vite dev server after changing `.env`
3. ✅ Clear browser cache and hard reload (Ctrl+Shift+R)

### Can't Find IP Address

**Problem:** Not sure which IP address to use

**Solution:**
- Use the IP that starts with `192.168.x.x` or `10.0.x.x`
- Avoid `127.0.0.1` (that's localhost)
- Avoid addresses starting with `169.254.x.x` (those are auto-assigned)

### Different Network

**Problem:** Devices are on different WiFi networks

**Solution:**
- Both devices MUST be on the same local network
- Connect your phone to the same WiFi as your computer

## Production Deployment

For production deployment (not local development), see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

In production, the environment variables are set differently:
- Backend: Set `PORT` and `MONGO_URI` in Render dashboard
- Frontend: Set `VITE_API_URL` to your deployed backend URL

## Security Notes

> [!WARNING]
> This setup is for **local development only**. Do not expose your development server to the public internet.

- The server listens on `0.0.0.0` which accepts connections from any network interface
- Only devices on your local network can access the server
- For production, use proper HTTPS and authentication
