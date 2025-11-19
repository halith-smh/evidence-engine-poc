# Docker Fix Applied ✅

## Issues Fixed:

1. **Backend Certificate Error** - Changed `NODE_ENV` from `production` to `development` in docker-compose.yml
2. **Frontend Not Accessible** - Updated frontend Dockerfile to bind Vite to `0.0.0.0` instead of `localhost`
3. **API Communication** - Simplified to use direct port 5000 access (no proxy needed)
   - Frontend now calls `http://localhost:5000/api` directly
   - Backend routes refactored to use `/api` prefix with Express Router
   - Works for both manual and Docker setups
   - No proxy configuration needed in Vite

## How It Works:

**Manual Setup:**
- Frontend (port 3000) → Backend (port 5000) ✅

**Docker Setup:**
- Browser → `localhost:3000` (frontend container)
- Browser → `localhost:5000` (backend container) ✅
- Docker maps container ports to host, so localhost works!

## How to Restart Docker:

**IMPORTANT: You MUST rebuild the containers for the fixes to take effect!**

```bash
# Stop all containers
docker-compose down

# Rebuild images with fixes (THIS IS REQUIRED!)
docker-compose build --no-cache

# Start containers
docker-compose up -d

# Or use npm scripts:
npm run docker:down
docker-compose build --no-cache
npm run docker:up
```

**Why `--no-cache`?** Ensures Docker uses the new configuration files instead of cached layers.

## View Logs:

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Or use npm script:
npm run docker:logs
```

## Expected Behavior:

After restart, you should see:

**Backend logs:**
```
============================================================
Initializing KTern Evidence Engine
============================================================
[SUCCESS] MongoDB connected
[SUCCESS] Server running on http://localhost:5000
```

**Frontend logs:**
```
VITE v5.x.x ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

## Access Points:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

## API Calls:

Frontend makes direct calls to backend:
```
GET http://localhost:5000/api/wallet-info
GET http://localhost:5000/api/requests/:email
POST http://localhost:5000/api/create-request
```

No proxy needed! 🎉

## Troubleshooting:

If issues persist:
```bash
# Complete cleanup and fresh start
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

---

**Note:** You can delete this file after successfully restarting Docker.
