# 🚀 Render Deployment Guide

## Backend Deployment on Render

### **Step 1: Prepare Your Repository**

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Ready for Render deployment"
   git remote add origin https://github.com/yourusername/terminalx.git
   git push -u origin main
   ```

### **Step 2: Deploy Backend to Render**

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login with GitHub**
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure the service:**

   **Basic Settings:**
   - **Name**: `terminalx-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`

   **Build & Deploy:**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python run.py`

   **Environment Variables:**
   - `HOST` = `0.0.0.0`
   - `PORT` = `8000`
   - `DEBUG` = `false`

6. **Click "Create Web Service"**

### **Step 3: Configure CORS for Frontend**

1. **In your Render dashboard, go to your backend service**
2. **Go to Environment tab**
3. **Add environment variable:**
   - `FRONTEND_URL` = `https://your-frontend-domain.com`

4. **Update your backend code to use this variable:**
   ```python
   # In backend/main.py, update CORS origins
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:3000",
           "http://127.0.0.1:3000",
           os.getenv("FRONTEND_URL", "https://your-frontend-domain.com")
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### **Step 4: Deploy Frontend (Optional)**

#### **Option A: Deploy Frontend to Render (Static Site)**

1. **Create `render.yaml` in project root:**
   ```yaml
   services:
     - type: web
       name: terminalx-backend
       env: python
       plan: free
       buildCommand: pip install -r requirements.txt
       startCommand: python run.py
       envVars:
         - key: HOST
           value: 0.0.0.0
         - key: PORT
           value: 8000
         - key: DEBUG
           value: false
       healthCheckPath: /api/health
       autoDeploy: true
   
     - type: static
       name: terminalx-frontend
       buildCommand: npm install && npm run build
       staticPublishPath: .next
       envVars:
         - key: NEXT_PUBLIC_API_URL
           value: https://terminalx-backend.onrender.com
   ```

2. **Deploy both services:**
   - Connect repository
   - Render will detect both services from `render.yaml`

#### **Option B: Deploy Frontend to Vercel (Recommended)**

1. **Deploy frontend to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect GitHub repository
   - Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com`
   - Deploy

### **Step 5: Update Frontend Environment**

1. **Get your Render backend URL** (e.g., `https://terminalx-backend.onrender.com`)

2. **Update frontend environment:**
   ```bash
   # In .env.local or Vercel environment variables
   NEXT_PUBLIC_API_URL=https://terminalx-backend.onrender.com
   ```

3. **Redeploy frontend**

---

## 🔧 Render Configuration

### **Backend Service Settings**

**Basic:**
- **Name**: `terminalx-backend`
- **Environment**: `Python 3`
- **Region**: `Oregon (US West)` or closest to users
- **Branch**: `main`
- **Root Directory**: `backend`

**Build & Deploy:**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python run.py`
- **Health Check Path**: `/api/health`

**Environment Variables:**
```bash
HOST=0.0.0.0
PORT=8000
DEBUG=false
FRONTEND_URL=https://your-frontend-domain.com
```

### **Auto-Deploy Settings**
- **Auto-Deploy**: `Yes` (deploys on every push to main branch)
- **Pull Request Previews**: `Yes` (optional)

---

## 📊 Monitoring & Logs

### **View Logs:**
1. Go to your service dashboard
2. Click "Logs" tab
3. View real-time logs

### **Health Check:**
- **URL**: `https://your-backend-url.onrender.com/api/health`
- **Expected Response**: `{"status":"healthy","timestamp":"..."}`

### **API Documentation:**
- **URL**: `https://your-backend-url.onrender.com/docs`
- **Interactive API docs** with Swagger UI

---

## 🚀 Deployment Commands

### **Local Testing:**
```bash
# Test backend locally
cd backend
source venv/bin/activate
python run.py

# Test API
curl http://localhost:8000/api/health
```

### **Deploy to Render:**
```bash
# Push changes to trigger auto-deploy
git add .
git commit -m "Deploy to Render"
git push origin main
```

### **Check Deployment Status:**
```bash
# Check if backend is running
curl https://your-backend-url.onrender.com/api/health

# Test system monitoring
curl -X POST "https://your-backend-url.onrender.com/api/command" \
  -H "Content-Type: application/json" \
  -d '{"command": "free", "current_path": "home/user", "file_system": {}}'
```

---

## 🛠️ Troubleshooting

### **Common Issues:**

1. **Build Failures:**
   - Check `requirements.txt` has all dependencies
   - Verify Python version in `runtime.txt`
   - Check build logs in Render dashboard

2. **CORS Errors:**
   - Update CORS origins in backend
   - Add frontend URL to allowed origins
   - Check environment variables

3. **Service Not Starting:**
   - Verify start command: `python run.py`
   - Check if all dependencies are installed
   - Review logs for errors

4. **Health Check Failing:**
   - Ensure `/api/health` endpoint exists
   - Check if service is binding to `0.0.0.0:8000`
   - Verify environment variables

### **Debug Steps:**
1. Check Render logs
2. Test API endpoints directly
3. Verify environment variables
4. Check CORS configuration

---

## 💰 Render Pricing

### **Free Tier:**
- **Web Services**: 750 hours/month
- **Static Sites**: Unlimited
- **Bandwidth**: 100GB/month
- **Sleep after 15 minutes** of inactivity

### **Paid Plans:**
- **Starter**: $7/month per service
- **Standard**: $25/month per service
- **Pro**: $85/month per service

---

## 🎯 Next Steps

1. **Deploy backend to Render**
2. **Get backend URL**
3. **Deploy frontend to Vercel**
4. **Update frontend with backend URL**
5. **Test the full application**

Your TerminalX backend is now ready for Render deployment! 🚀
