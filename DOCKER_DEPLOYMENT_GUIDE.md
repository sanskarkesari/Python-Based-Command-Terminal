# 🐳 Docker Deployment Guide

## Quick Start

### **1. Local Development with Docker**
```bash
# Build and start all services
./docker-deploy.sh

# Or manually:
docker-compose up --build
```

### **2. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Nginx Proxy**: http://localhost:80 (optional)

---

## 🚀 Production Deployment

### **Option 1: Docker Hub + Any Cloud Provider**

#### **1. Build and Push Images**
```bash
# Build backend image
cd backend
docker build -t yourusername/terminalx-backend:latest .
docker push yourusername/terminalx-backend:latest

# Build frontend image
cd ..
docker build -f Dockerfile.frontend -t yourusername/terminalx-frontend:latest .
docker push yourusername/terminalx-frontend:latest
```

#### **2. Deploy to Cloud Provider**
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Railway**
- **Render**

---

### **Option 2: Docker Compose on VPS**

#### **1. Deploy to VPS (DigitalOcean, Linode, etc.)**
```bash
# On your VPS
git clone https://github.com/yourusername/terminalx.git
cd terminalx
docker-compose up -d
```

#### **2. Configure Domain and SSL**
```bash
# Add domain to nginx.conf
# Use Let's Encrypt for SSL
```

---

### **Option 3: Kubernetes**

#### **1. Create Kubernetes Manifests**
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: terminalx-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: terminalx-backend
  template:
    metadata:
      labels:
        app: terminalx-backend
    spec:
      containers:
      - name: backend
        image: yourusername/terminalx-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: HOST
          value: "0.0.0.0"
        - name: PORT
          value: "8000"
```

---

## 🔧 Configuration

### **Environment Variables**

#### **Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://backend:8000
NEXT_PUBLIC_DEV_MODE=false
```

#### **Backend (docker-compose.yml)**
```yaml
environment:
  - DEBUG=false
  - HOST=0.0.0.0
  - PORT=8000
```

---

## 📊 Docker Commands

### **Development**
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Production**
```bash
# Start with production profile
docker-compose --profile production up -d

# Scale services
docker-compose up --scale backend=3

# Update services
docker-compose pull
docker-compose up -d
```

---

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8000

# Kill the process or change ports in docker-compose.yml
```

#### **2. Build Failures**
```bash
# Clean build
docker-compose down
docker system prune -a
docker-compose up --build
```

#### **3. Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x docker-deploy.sh
```

#### **4. Memory Issues**
```bash
# Increase Docker memory limit
# In Docker Desktop: Settings → Resources → Memory
```

---

## 📈 Performance Optimization

### **1. Multi-stage Builds**
```dockerfile
# Use multi-stage builds for smaller images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

### **2. Health Checks**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### **3. Resource Limits**
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

---

## 🔒 Security

### **1. Use Non-root User**
```dockerfile
# Add to Dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

### **2. Scan for Vulnerabilities**
```bash
# Scan images for vulnerabilities
docker scan yourusername/terminalx-backend:latest
docker scan yourusername/terminalx-frontend:latest
```

### **3. Use Secrets**
```yaml
# In docker-compose.yml
secrets:
  - db_password
  - api_key
```

---

## 🚀 Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] Images built and tested locally
- [ ] Environment variables configured
- [ ] Health checks working
- [ ] Logs accessible
- [ ] SSL certificates configured
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 🎯 Cloud Provider Specific Guides

### **AWS ECS**
1. Create ECS cluster
2. Create task definition
3. Create service
4. Configure load balancer

### **Google Cloud Run**
1. Build and push to Google Container Registry
2. Deploy to Cloud Run
3. Configure custom domain

### **DigitalOcean App Platform**
1. Connect GitHub repository
2. Configure app spec
3. Deploy automatically

### **Railway**
1. Connect GitHub repository
2. Add docker-compose.yml
3. Deploy automatically

Your TerminalX application is now ready for Docker deployment! 🐳
