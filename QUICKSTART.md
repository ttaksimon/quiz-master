# QuickStart Útmutató

## 1️⃣ Első Lépések - Local Development

### 1.1 Repository klónozása
```bash
git clone https://github.com/YOUR_USERNAME/quizmaster.git
cd quizmaster
```

### 1.2 Backend beállítása
```bash
cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# vagy: venv\Scripts\activate  # Windows

# Dependenciák
pip install -r requirements.txt

# Environment variables
cp .env.example .env
# Szerkeszd a .env fájlt szükség szerint
```

### 1.3 Backend futtatása
```bash
uvicorn main:app --reload
```
✅ Elérhető: `http://localhost:8000`

### 1.4 Frontend beállítása
```bash
cd ../frontend

# Dependenciák
npm install

# Environment variables
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8000 (már be van szoktál)
```

### 1.5 Frontend futtatása
```bash
npm run dev
```
✅ Elérhető: `http://localhost:5173`

---

## 2️⃣ Git Setup & GitHub

### 2.1 Git Config (első alkalommal)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2.2 Repository az elkészült kóddal
```bash
cd /Users/taksimon/Desktop/TAKÁCS-SIMON_F8BTO8_SZAKDOLGOZAT

git init
git add .
git commit -m "Initial commit: Full-stack quiz application"

# GitHub repo URL betöltése
git remote add origin https://github.com/YOUR_USERNAME/quizmaster.git
git branch -M main
git push -u origin main
```

---

## 3️⃣ Production Deploy - Render.com

### 3.1 Adatbázis (PostgreSQL)
1. [render.com](https://render.com) > Dashboard
2. "New" > "PostgreSQL"
3. Név: `quizmaster-db`
4. Database: `quizmaster`
5. **Másolj: Internal Database URL** (DATABASE_URL)

### 3.2 Backend (Web Service)
1. "New" > "Web Service"
2. GitHub repo: `quizmaster`
3. Beállítások:
   - **Build**: `pip install -r backend/requirements.txt`
   - **Start**: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`

### 3.3 Environment Variables (Render)
```
DATABASE_URL = [Paste PostgreSQL URL]
SECRET_KEY = [Generate: python -c "import secrets; print(secrets.token_urlsafe(32))"]
GOOGLE_API_KEY = [Your Google API Key]
ENVIRONMENT = production
FRONTEND_URL = https://quizmaster.taksimon.hu
```

✅ Backend elérhető lesz: `https://quizmaster-api.onrender.com`

---

## 4️⃣ Production Deploy - Netlify

### 4.1 Frontend Site
1. [netlify.com](https://netlify.com) > "New site from Git"
2. GitHub repo: `quizmaster`
3. Beállítások:
   - **Build**: `cd frontend && npm run build`
   - **Directory**: `frontend/dist`

### 4.2 Environment Variables (Netlify)
```
VITE_API_BASE_URL = https://quizmaster-api.onrender.com
```

✅ Frontend elérhető lesz: `https://[your-netlify-site].netlify.app`

---

## 5️⃣ Domain Setup - quizmaster.taksimon.hu

### 5.1 Netlify Domain
1. Site Settings > Domain management
2. "Add domain" > `quizmaster.taksimon.hu`
3. Netlify NS records -> Domain Registrar-ba
4. Várd meg a propagálást (5-30 perc)

### 5.2 API Domain (Optional)
1. Render Service > Custom Domain
2. `api.quizmaster.taksimon.hu`
3. CNAME record a domain registrárba
4. Frontend `.env`: `VITE_API_BASE_URL=https://api.quizmaster.taksimon.hu`

---

## 6️⃣ Tesztelés

### Backend Health
```bash
curl https://quizmaster-api.onrender.com/health
```

### Frontend Access
```
https://quizmaster.taksimon.hu
```

### Login & Funkcionalitás
- Regisztráció, bejelentkezés, kvíz játék tesztelése

---

## 7️⃣ Fejlesztés & Frissítések

### Új feature
```bash
git checkout -b feature/new-feature
# Fejlesztés...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# GitHub: Pull Request > Merge -> Render/Netlify automatikus redeploy
```

### Hotfix
```bash
git checkout main
git pull origin main
# Fix...
git add .
git commit -m "Fix bug"
git push origin main
# Automatikus redeploy!
```

---

## 📋 Checklist - Mielőtt Deploy-olnál

- [ ] `.env` fájl `.gitignore`-ban van
- [ ] `requirements.txt` frissítve
- [ ] Backend lokálisan működik (`http://localhost:8000`)
- [ ] Frontend lokálisan működik (`http://localhost:5173`)
- [ ] Összes test átmegy (`pytest` a backend-ben)
- [ ] Git repo GitHub-on (public vagy private)
- [ ] Render PostgreSQL DB létrehozva
- [ ] Render Web Service létrehozva
- [ ] Netlify site csatlakozva
- [ ] Environment variables beállítva (Render + Netlify)
- [ ] Domain registrár DNS/CNAME beállítva

---

## ⚠️ Gyakori Hibák

| Hiba | Megoldás |
|------|----------|
| CORS error | Ellenőrizd `main.py` `allow_origins` |
| 404 API | Netlify dist folder `frontend/dist` |
| Blank page | Hard refresh (Cmd+Shift+R) + clear cache |
| DB connection error | Render `Internal URL` copy-paste |
| ENV not found | Netlify/Render redeploy a new env vars után |

---

## 🔗 Linkek

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)
- [Render Docs](https://render.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [PostgreSQL Guide](https://www.postgresql.org/docs)

---

## 💡 Tippek

1. **Lokálisan mindig tesztelj**, mielőtt push-olnál
2. **Render/Netlify logs** - nézd meg, ha hiba van
3. **Secret Key** - soha ne hardcode-old!
4. **CORS** - production-ban only szükséges origins
5. **Database backup** - rendszeres mentések Render-ben

---

Kész! Az alkalmazásod élő lesz 🚀

Bármilyen kérdés: [GitHub Issues](https://github.com/YOUR_USERNAME/quizmaster/issues)
