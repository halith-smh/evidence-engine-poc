# 🪟 Windows Setup Guide - Chain of Custody PoC

## Two Options to Run on Windows

Since you're on Windows and encountering Docker issues, you have two options:

---

## ✅ Option 1: Run Natively on Windows (RECOMMENDED)

This is easier and doesn't require Docker!

### Prerequisites

1. **Node.js 18+**
   - Download from: https://nodejs.org/
   - Install the LTS version
   - Verify: Open PowerShell and run `node --version`

2. **MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Choose "Windows x64" MSI installer
   - During installation, choose "Complete" setup
   - Check "Install MongoDB as a Service"
   - Verify: Open PowerShell and run `mongod --version`

### Step-by-Step Setup

#### **1. Open PowerShell as Administrator**
Right-click PowerShell → Run as Administrator

#### **2. Navigate to Project Directory**
```powershell
cd c:\Users\smohamedhalith\KTern\KTern_1_5\PoC\evidence\poc_191125_v2
```

#### **3. Install Backend Dependencies**
```powershell
npm install
```

#### **4. Install Frontend Dependencies**
```powershell
cd frontend
npm install
cd ..
```

#### **5. Ensure MongoDB is Running**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# If not running, start it
Start-Service MongoDB
```

#### **6. Start Backend (Terminal 1)**
```powershell
npm start
```

You should see:
```
✅ MongoDB connected
✅ Certificate generated successfully
✅ Solana initialized on devnet
📍 Wallet Address: [your-address]
💰 Current wallet balance: 0 SOL
⚠️  WARNING: Low balance! Use POST /request-airdrop
🌐 Server running on http://localhost:5000
```

#### **7. Start Frontend (New Terminal 2)**
Open a NEW PowerShell window:
```powershell
cd c:\Users\smohamedhalith\KTern\KTern_1_5\PoC\evidence\poc_191125_v2\frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

#### **8. Request Airdrop (New Terminal 3)**
Open a NEW PowerShell window:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/request-airdrop" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"amount": 2}'
```

Or if you have curl installed:
```powershell
curl -X POST http://localhost:5000/request-airdrop -H "Content-Type: application/json" -d "{\"amount\": 2}"
```

#### **9. Open Browser**
Navigate to: http://localhost:3000

---

## 🚀 Quick Start with Batch File

I've created a batch file that does everything automatically!

### **Just Double-Click:**
```
start-windows.bat
```

This will:
- ✅ Check MongoDB is running
- ✅ Install dependencies if needed
- ✅ Start backend in a new window
- ✅ Start frontend in a new window
- ✅ Open browser automatically

Then just request the airdrop using the command shown!

---

## 🐳 Option 2: Fix Docker on Windows

If you prefer to use Docker, try these fixes:

### Fix 1: Use WSL 2 Backend

1. Ensure Docker Desktop is using **WSL 2** backend:
   - Open Docker Desktop
   - Settings → General
   - Check "Use the WSL 2 based engine"
   - Click "Apply & Restart"

2. Clean and rebuild:
```powershell
docker-compose down -v
docker system prune -af
docker-compose build --no-cache
docker-compose up
```

### Fix 2: Check Docker Desktop Settings

1. Open Docker Desktop
2. Settings → Resources
3. Ensure at least:
   - **Memory**: 4 GB
   - **CPUs**: 2
   - **Disk**: 20 GB

### Fix 3: Line Endings Issue

The Dockerfile might have Windows line endings. I've already updated it to handle this, so try:

```powershell
# Clean everything
docker-compose down -v
docker system prune -af

# Rebuild with updated Dockerfile
docker-compose build --no-cache
docker-compose up
```

---

## 📋 Comparison: Native vs Docker

| Feature | Native Windows | Docker |
|---------|---------------|---------|
| Setup Time | 5-10 minutes | 2 minutes |
| Complexity | Medium (need MongoDB) | Easy |
| Performance | Better (no virtualization) | Good |
| Isolation | Less (uses system MongoDB) | Complete |
| Troubleshooting | Easier (direct access) | Harder (container logs) |
| **Recommended for Windows** | ✅ YES | If Docker works |

---

## 🔧 Troubleshooting Native Setup

### Issue: "npm: command not found"
**Solution:** Node.js not installed or not in PATH
```powershell
# Check if Node is installed
node --version

# If not found, download and install from nodejs.org
```

### Issue: "MongoDB connection failed"
**Solution:** MongoDB service not running
```powershell
# Check service status
Get-Service MongoDB

# Start service
Start-Service MongoDB

# If service doesn't exist, MongoDB wasn't installed as a service
# Start manually:
mongod --dbpath="C:\data\db"
```

### Issue: "Cannot find module"
**Solution:** Dependencies not installed
```powershell
# Backend
npm install

# Frontend
cd frontend
npm install
```

### Issue: "Port 5000 already in use"
**Solution:** Another service is using port 5000
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID [PID] /F

# Or change the port in .env file:
# PORT=5001
```

### Issue: "Port 3000 already in use"
**Solution:** Another app is using port 3000
```powershell
# Find and kill
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

---

## 🎯 Step-by-Step Video Guide Style

### **Terminal 1: Backend**
```powershell
# Open PowerShell
cd c:\Users\smohamedhalith\KTern\KTern_1_5\PoC\evidence\poc_191125_v2

# Install if needed
npm install

# Start backend
npm start

# Wait for this message:
# 🌐 Server running on http://localhost:5000
```

### **Terminal 2: Frontend**
```powershell
# Open NEW PowerShell
cd c:\Users\smohamedhalith\KTern\KTern_1_5\PoC\evidence\poc_191125_v2\frontend

# Install if needed
npm install

# Start frontend
npm run dev

# Wait for this message:
# ➜  Local:   http://localhost:3000/
```

### **Terminal 3: Airdrop**
```powershell
# Open NEW PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/request-airdrop" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"amount": 2}'

# You should see:
# success: True
# newBalance: 2 SOL
```

### **Browser**
```
Open: http://localhost:3000
Login as: Alice
Create a request!
```

---

## 📊 MongoDB Installation Details

If you don't have MongoDB installed:

### **Download:**
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0 (or latest)
   - Platform: Windows x64
   - Package: MSI

### **Install:**
1. Run the MSI installer
2. Choose "Complete" installation
3. **Important:** Check these boxes:
   - ✅ Install MongoDB as a Service
   - ✅ Run service as Network Service user
   - ✅ Service Name: MongoDB
4. Click Install

### **Verify:**
```powershell
# Check service
Get-Service MongoDB

# Test connection
mongosh
# Should connect successfully
```

---

## 🎉 Success Checklist

After starting everything, verify:

- [ ] Backend terminal shows: `🌐 Server running on http://localhost:5000`
- [ ] Frontend terminal shows: `➜  Local:   http://localhost:3000/`
- [ ] http://localhost:5000/health returns JSON
- [ ] http://localhost:3000 loads the app
- [ ] Airdrop request succeeded
- [ ] Wallet balance shows 2 SOL

---

## 🔄 How to Restart

### Stop Services:
- Press `Ctrl+C` in both Backend and Frontend terminals

### Start Again:
```powershell
# Terminal 1: Backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Or Use Batch File:
```
Double-click: start-windows.bat
```

---

## 💡 Pro Tips for Windows

1. **Use Windows Terminal** (better than PowerShell)
   - Download from Microsoft Store
   - Supports multiple tabs

2. **Keep terminals open** during testing
   - Don't close the Backend/Frontend windows

3. **Check MongoDB** is running before starting:
   ```powershell
   Get-Service MongoDB
   ```

4. **Use localhost** not 127.0.0.1
   - Some Windows configurations prefer localhost

5. **Firewall Warning**
   - Windows may ask to allow Node.js
   - Click "Allow access"

---

## 🆘 Still Having Issues?

### Check Logs:
```powershell
# Backend logs are in the terminal
# Look for errors starting with ❌ or [ERROR]

# MongoDB logs (if needed):
# C:\Program Files\MongoDB\Server\7.0\log\mongod.log
```

### Clean Start:
```powershell
# Stop everything
# Press Ctrl+C in all terminals

# Delete node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force frontend\node_modules

# Reinstall
npm install
cd frontend
npm install
cd ..

# Start again
npm start
# (in new terminal) cd frontend && npm run dev
```

---

## 📞 Quick Commands Reference

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB service
Get-Service MongoDB

# Start MongoDB
Start-Service MongoDB

# Stop MongoDB
Stop-Service MongoDB

# Install backend deps
npm install

# Install frontend deps
cd frontend && npm install

# Start backend
npm start

# Start frontend
cd frontend && npm run dev

# Request airdrop
Invoke-RestMethod -Uri "http://localhost:5000/request-airdrop" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"amount": 2}'

# Check health
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

---

## 🎯 Recommended Approach

**For Windows Office PC:**

1. ✅ **Use Native Setup** (Option 1)
   - More reliable
   - Better performance
   - Easier debugging
   - No Docker issues

2. ⏭️ **Skip Docker** unless required
   - Docker on Windows can be tricky
   - Native works perfectly fine

**Just run:**
```
start-windows.bat
```

Or manually in 3 terminals as described above!

---

**You're all set for Windows! 🪟🚀**
