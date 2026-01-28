# 🐳 Docker Setup Guide - Crypto Portfolio Dashboard

Run the complete Crypto Portfolio Dashboard using Docker on any system.

## Prerequisites

On your target system, make sure you have:
- ✅ Docker & Docker Compose installed
- ✅ MongoDB running locally (port 27017)
- ✅ Ollama running locally (port 11434) - for AI chatbot

---

## 🚀 Quick Start

### Step 1: Clone the Repository
```bash
git clone https://github.com/sujithreddy0007/Crypto-Portfolio-Dashboard.git
cd Crypto-Portfolio-Dashboard
```

### Step 2: Start All Services
```bash
docker-compose up --build
```

### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## ⚙️ Configuration

### Environment Variables

Edit `docker-compose.yml` to customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://host.docker.internal:27017/crypto_portfolio` | MongoDB connection |
| `JWT_SECRET` | (placeholder) | **Change this!** Use a secure random string |
| `OLLAMA_URL` | `http://host.docker.internal:11434` | Ollama AI server |
| `COINGECKO_API_KEY` | (optional) | For higher API rate limits |
| `GEMINI_API_KEY` | (optional) | Alternative AI for chatbot |

### For Linux Systems

Replace `host.docker.internal` with your machine's IP or Docker bridge IP:

```yaml
# In docker-compose.yml, change:
- MONGO_URI=mongodb://172.17.0.1:27017/crypto_portfolio
- OLLAMA_URL=http://172.17.0.1:11434
```

Or find your IP using:
```bash
ip addr show docker0 | grep inet
# OR
hostname -I
```

---

## 📋 Common Commands

### Start in Background
```bash
docker-compose up -d --build
```

### View Logs
```bash
docker-compose logs -f
# Or for specific service:
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

### Remove Everything (including volumes)
```bash
docker-compose down -v --rmi all
```

---

## 🔧 Troubleshooting

### Backend can't connect to MongoDB?

1. **Check MongoDB is running**:
   ```bash
   # On host machine
   mongosh --eval "db.stats()"
   ```

2. **MongoDB needs to allow external connections**:
   - Edit `/etc/mongod.conf` (Linux) or MongoDB config
   - Set `bindIp: 0.0.0.0` or `bindIp: 127.0.0.1,172.17.0.1`
   - Restart MongoDB

3. **Try using host IP directly**:
   ```yaml
   - MONGO_URI=mongodb://YOUR_HOST_IP:27017/crypto_portfolio
   ```

### Ollama chatbot not working?

1. **Verify Ollama is running**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Check if model is pulled**:
   ```bash
   ollama list
   # If empty, pull a model:
   ollama pull llama2
   ```

### Frontend can't reach backend?

1. Wait for backend to be healthy (check logs)
2. Verify backend is running: http://localhost:5000/api/health
3. Check Docker network:
   ```bash
   docker network inspect crypto-network
   ```

---

## 🖥️ System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 8 GB |
| CPU | 2 cores | 4 cores |
| Disk | 5 GB | 10 GB |
| Docker | 20.10+ | Latest |

---

## 📁 Project Structure

```
Crypto-Portfolio-Dashboard/
├── docker-compose.yml      # Main orchestration file
├── client/
│   ├── Dockerfile          # Frontend Docker build
│   └── .dockerignore
├── server/
│   ├── Dockerfile          # Backend Docker build
│   └── .dockerignore
└── DOCKER.md               # This file
```

---

## ✅ Verification Checklist

After starting Docker:

- [ ] Backend health: http://localhost:5000/api/health returns `{"status":"ok"}`
- [ ] Frontend loads: http://localhost:3000 shows the dashboard
- [ ] Market data loads on homepage
- [ ] Can create account/login
- [ ] Portfolio page works (after login)
- [ ] AI chatbot responds (if Ollama is running)
