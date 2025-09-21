# 🚀 TerminalX Deployment Guide

## Free Deployment Options

### **Option 1: Vercel + Railway (RECOMMENDED)**

#### **Frontend on Vercel (Free)**
1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/terminalx.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Deploy (automatic!)

#### **Backend on Railway (Free)**
1. **Create Railway account:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy backend:**
   - Create new project
   - Connect your GitHub repo
   - Select the `backend` folder
   - Railway will auto-detect Python and deploy

3. **Set Environment Variables:**
   - `HOST=0.0.0.0`
   - `PORT=8000`

4. **Update Frontend Environment:**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL=https://your-railway-backend-url.com`

---

### **Option 2: Netlify + Render**

#### **Frontend on Netlify:**
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repo
3. Build command: `npm run build`
4. Publish directory: `.next`

#### **Backend on Render:**
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Select `backend` folder
5. Build command: `pip install -r requirements.txt`
6. Start command: `python run.py`

---

### **Option 3: All-in-One on Railway**

#### **Deploy Both Frontend & Backend:**
1. Create `railway.json` in project root:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "cd backend && python run.py",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. Deploy on Railway:
   - Connect GitHub repo
   - Railway will handle both frontend and backend

---

### **Option 4: Render (Both Services)**

#### **Frontend on Render:**
1. Create `render.yaml`:
   ```yaml
   services:
     - type: web
       name: terminalx-frontend
       env: static
       buildCommand: npm install && npm run build
       staticPublishPath: .next
   ```

2. Deploy both services on Render

---

## 🐳 Docker Deployment

### **Local Docker:**
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### **Docker Hub + Cloud:**
1. **Build and push to Docker Hub:**
   ```bash
   # Build backend image
   cd backend
   docker build -t yourusername/terminalx-backend .
   docker push yourusername/terminalx-backend
   
   # Build frontend image
   cd ..
   docker build -t yourusername/terminalx-frontend .
   docker push yourusername/terminalx-frontend
   ```

2. **Deploy to any cloud provider** (AWS, Google Cloud, Azure)

---

## 🔧 Environment Configuration

### **Frontend Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_DEV_MODE=false
```

### **Backend Environment Variables:**
```bash
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

---

## 📋 Step-by-Step Deployment Process

### **Method 1: Vercel + Railway (Easiest)**

1. **Prepare your code:**
   ```bash
   # Create the files I mentioned above
   # Commit and push to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy Frontend (Vercel):**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

3. **Deploy Backend (Railway):**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project"
   - Connect your repository
   - Select the `backend` folder
   - Click "Deploy"

4. **Update Frontend to use Backend:**
   - Get your Railway backend URL
   - Update environment variable in Vercel
   - Redeploy frontend

---

## 🎯 Which Method Should You Choose?

- **Vercel + Railway**: Best performance, easiest setup
- **All on Railway**: Simpler, one platform
- **Netlify + Render**: Good alternative
- **Render (both)**: All-in-one solution
- **Docker**: Most flexible, works anywhere

---

## 💡 Pro Tips

1. **Start with Vercel + Railway** - it's the most reliable
2. **Use environment variables** for API URLs
3. **Enable auto-deploy** from GitHub
4. **Check logs** if deployment fails
5. **Test locally first** before deploying

---

## 🆘 Troubleshooting

### **Common Issues:**
1. **CORS errors**: Check backend CORS settings
2. **Environment variables**: Make sure they're set correctly
3. **Build failures**: Check logs for specific errors
4. **API not working**: Verify backend URL in frontend

### **Debug Steps:**
1. Check deployment logs
2. Test API endpoints directly
3. Verify environment variables
4. Check CORS configuration

---

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] CORS settings updated for production domain
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Health checks working
- [ ] API documentation accessible
- [ ] Frontend and backend communicating
- [ ] System monitoring working

Your TerminalX application is now ready for production deployment! 🎉
