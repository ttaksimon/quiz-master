# Deployment Útmutató - QuizMaster

## 1. Git Repository beállítása

### 1.1 Repo inicializálása (ha még nincs)
```bash
cd /Users/taksimon/Desktop/TAKÁCS-SIMON_F8BTO8_SZAKDOLGOZAT
git init
git add .
git commit -m "Initial commit: Setup production environment"
```

### 1.2 GitHub repo létrehozása
1. Menj a [github.com](https://github.com)-ra
2. Klikk "New repository"
3. Nevezd el: `quizmaster` (vagy tetszés szerint)
4. FONTOS: Legyen PUBLIC vagy Private (ha private, add meg a GitHubot a Render/Netlify-nak)

### 1.3 Remote hozzáadása és push
```bash
git remote add origin https://github.com/YOUR_USERNAME/quizmaster.git
git branch -M main
git push -u origin main
```

---

## 2. Backend - Render.com Deployment

### 2.1 Render.com Regisztráció
1. Menj a [render.com](https://render.com)-ra
2. Regisztrálj be (GitHub-bal a legkönnyebb)
3. Hozz létre egy új account

### 2.2 PostgreSQL Adatbázis létrehozása
1. A Render dashboard-ban válaszd "New" > "PostgreSQL"
2. Beállítások:
   - **Name**: `quizmaster-db`
   - **Database**: `quizmaster`
   - **Region**: Az intézményed közeléhez (pl. Frankfurt, London)
   - **Plan**: `Starter` (free tier)
3. Klikk "Create Database"
4. Várd meg az inicializálást (2-5 perc)
5. Másolj le az **Internal Database URL** (DATABASE_URL)

### 2.3 Backend Web Service
1. A dashboard-ban válaszd "New" > "Web Service"
2. Csatlakozd a GitHub repod:
   - Válaszd "Connect account" > "GitHub"
   - Engedélyezd a Render-t
   - Válaszd az `quizmaster` repot
3. Beállítások:
   - **Name**: `quizmaster-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`
   - **Region**: Azonos, mint az adatbázissal
   - **Plan**: `Free`
4. Klikk "Create Web Service"

### 2.4 Environment Variables Render-ben
A Web Service beállítások között, "Environment" fülön add meg:

| Kulcs | Érték |
|-------|-------|
| `DATABASE_URL` | Paste az adatbázisból (már bevan szoktál) |
| `SECRET_KEY` | Generálj egy erős titkos kulcsot (python: `import secrets; print(secrets.token_urlsafe(32))`) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |
| `GOOGLE_API_KEY` | Az API kulcsod a Google Cloud Console-ból |
| `ENVIRONMENT` | `production` |
| `FRONTEND_URL` | `https://quizmaster.taksimon.hu` |

### 2.5 Deployment indítása
1. A Web Service oldalon klikk "Deploy latest commit"
2. Várd meg a telepítést (2-5 perc)
3. Ha "Live" státusza van, jó!
4. Kattints az **URL-re** (pl. `https://quizmaster-api.onrender.com`) - akkor működik a backend

---

## 3. Frontend - Netlify Deployment

### 3.1 Netlify Regisztráció
1. Menj a [netlify.com](https://netlify.com)-ra
2. Regisztrálj be GitHub-bal

### 3.2 Frontend Site létrehozása
1. A Netlify dashboard-ban: "New site from Git"
2. Csatlakozd a GitHub repod (ugyanaz, mint Render-ben)
3. Beállítások:
   - **Repository**: Az `quizmaster` repo
   - **Branch**: `main`
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
4. Klikk "Deploy site"

### 3.3 Frontend Environment Variables
1. Site settings > "Build & deploy" > "Environment"
2. Add meg az alábbi env vars-okat:

| Kulcs | Érték |
|-------|-------|
| `VITE_API_BASE_URL` | `https://quizmaster-api.onrender.com` |
| `VITE_APP_NAME` | `QuizMaster` |

### 3.4 Redeploy a frissített env vars-al
1. Go back to "Deploys"
2. Klikk a legfrissebb deploy-on
3. Select "Trigger deploy" > "Deploy site"

---

## 4. Domain Setup - quizmaster.taksimon.hu

### 4.1 DNS Konfigurálás (Netlify frontend számára)

**Módszer 1: Netlify DNS (ajánlott)**
1. Netlify Site Settings > "Domain management"
2. Klikk "Add domain"
3. Add meg: `quizmaster.taksimon.hu`
4. Netlify adja meg az NS rekordokat
5. A domain registrárban (ahol taksimon.hu van) módosítsd az NS rekordokat Netlify-éra

**Módszer 2: CNAME Record (ha az NS nem működik)**
1. Domain Registrárban add meg az alábbi CNAME rekordot:
   - **Host**: `quizmaster`
   - **Type**: `CNAME`
   - **Value**: `[your-netlify-site].netlify.app`
   - **TTL**: `3600`

2. Várd meg a propagálást (5-30 perc)

### 4.2 API Domain (Render backend)
Az API meghívásokban a frontend-ben vagy az API URL-ében add meg:
```
https://quizmaster-api.onrender.com
```

Opcionális: Saját domain az API-hoz (pl. `api.quizmaster.taksimon.hu`)
1. Render Service Settings > "Custom Domain"
2. Add meg: `api.quizmaster.taksimon.hu`
3. Render adja meg a CNAME rekordot
4. Domain Registrárban add meg ezt a CNAME rekordot is

---

## 5. Frontend API URL frissítése

A frontend-ben az API hívások az alábbi URL-t kell hogy használják:

**Development:**
```javascript
// src/services/api.js
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

**Production (Render):**
```javascript
https://quizmaster-api.onrender.com
```

Vagy ha saját domain van:
```javascript
https://api.quizmaster.taksimon.hu
```

---

## 6. SSL/TLS Certificat

**Netlify**: Automatikusan beállít ingyen SSL certificatot
**Render**: Szintén automatikus SSL certificate

Nem kell tenni érte semmit!

---

## 7. Production Environment Variables Összefoglalása

### Backend (.env az Render-ben):
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/quizmaster
SECRET_KEY=[generált_erős_kulcs]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GOOGLE_API_KEY=[google_generative_ai_kulcs]
ENVIRONMENT=production
FRONTEND_URL=https://quizmaster.taksimon.hu
```

### Frontend (.env a Netlify-ban):
```
VITE_API_BASE_URL=https://quizmaster-api.onrender.com
VITE_APP_NAME=QuizMaster
```

---

## 8. Tesztelés Production Után

1. **Backend Health Check**: 
   ```
   https://quizmaster-api.onrender.com/health
   ```

2. **Frontend Access**:
   ```
   https://quizmaster.taksimon.hu
   ```

3. **Login Test**: Bejelentkezés és az API hívások működésének ellenőrzése

4. **CORS Check**: Nyiss meg a DevTools-ban, nézd a Network fülön, hogy van-e CORS hiba

---

## 9. Hibaelhárítás

### CORS Hiba
**Probléma**: `Access to XMLHttpRequest blocked by CORS`
**Megoldás**: 
1. Ellenőrizd a `main.py`-ban az `allow_origins` listát
2. Biztos legyen benne a `https://quizmaster.taksimon.hu`
3. Redeploy a Render-ben

### PostgreSQL Kapcsolat Hiba
**Probléma**: `operational error (psycopg2.OperationalError)`
**Megoldás**:
1. Render dashboard > quizmaster-db > Copy "Internal Database URL"
2. Paste-eld az env var-ba pontosan
3. Ellenőrizd, hogy az `Internal URL` van-e (nem az `External`)

### Frontend nem frissül
**Probléma**: Régi verziót lát az oldal
**Megoldás**:
1. Hard refresh: `Ctrl+Shift+R` vagy `Cmd+Shift+R`
2. DevTools > Application > Storage > Clear all
3. Netlify-ban manual redeploy

### API nem elérhető
**Probléma**: 504 Gateway Timeout vagy Service Unavailable
**Megoldás**:
1. Render dashboard > quizmaster-api > "Logs" fülön nézd meg a hibákat
2. Build command helyes-e?
3. Start command helyes-e?
4. Environment variables pontosak-e?

---

## 10. Későbbi Fejlesztések

### Adatbázis Migrációk
Ha módosítasz az adatbázis modelleken:
1. Lokálisan tesztelj az SQLite-tal
2. Commit az adatbázis minta-verzióval
3. Render-en automatikus redeploy után az új táblákat létrehozza

### Új Features Deploy-ása
1. Feature branch létrehozása: `git checkout -b feature/xyz`
2. Fejlesztés és commit
3. Push: `git push origin feature/xyz`
4. Pull Request a `main` branchre
5. Merge után Render/Netlify automatikusan redeploy-ol

### Monitoring
1. Render: Service Logs fülön nézd az errорokat
2. Netlify: Logs fülön látod a build hibákat
3. Készíts egy monitoring solution (pl. Sentry) a production errorokra

---

## 11. Biztonsági Tippek

- [ ] SECRET_KEY módosítva és erős
- [ ] GOOGLE_API_KEY biztonságosan van (nem GitHub-ban!)
- [ ] CORS origins restrictive (csak szükséges domainok)
- [ ] Database password erős (Render generálja)
- [ ] GitHub repo private (ha szükséges)
- [ ] `.env` fájl a `.gitignore`-ban van
- [ ] Regular security updates (pip update, npm update)

---

Kész! Az alkalmazásod elérhető lesz itt: **https://quizmaster.taksimon.hu**

Ha bármi nem működik, nézd meg az error logokat Render/Netlify-ban!
