# 📱 QuizMaster - Full-Stack Quiz Application

Egy modern, interaktív kvíz alkalmazás FastAPI backend és React frontend-ből. Támogat felhasználókezelést, kvízek készítését, megosztást, AI-powered tartalom generálást és valós idejű multiplayer játékot.

---

## 📋 Tartalomjegyzék

- [Features](#features)
- [Technológiák](#technológiák)
- [Kezdés](#kezdés)
- [Struktúra](#struktúra)
- [Deployment](#deployment)
- [API Dokumentáció](#api-dokumentáció)
- [Közreműködés](#közreműködés)

---

## ✨ Features

### 👤 Felhasználókezelés
- Regisztráció és bejelentkezés
- JWT token alapú autentikáció
- Token refresh mechanizmus
- Jelszó módosítás
- Profil kezelés

### 📚 Kvízek Kezelése
- Kvízek készítése, szerkesztése, törlése
- Különböző kérdéstípusok:
  - Szöveg választás
  - Számok
  - Rendezés
  - Igaz/Hamis
- Közzététel és megosztás
- Besorolások és értékelések

### 🎮 Multiplayer Játék
- Valós idejű WebSocket kapcsolat
- Játékszoba kezelés
- Állóhelyzet frissítések
- Eredmény tabella
- Szerzetes mechanizmus

### 🤖 AI Funkciók
- Google Generative AI integráció
- Automatikus kérdés generálás
- Intelligens tippek és leírások

### 📊 Admin Panel
- Felhasználó kezelés
- Kvíz moderálás
- Értékelések megtekintése
- Rendszer monitorozás

### 💳 Felhasználás Korlát
- Előfizetési szintek
- API hívások limitálása
- Prémium funkciókon

---

## 🛠️ Technológiák

### Backend
```
FastAPI           - Modern Python web framework
SQLAlchemy        - ORM library
PostgreSQL/SQLite - Database
Uvicorn           - ASGI server
Python-Jose       - JWT tokens
Argon2            - Password hashing
Google Gen AI      - AI integration
WebSockets        - Real-time communication
```

### Frontend
```
React          - UI library
Vite           - Build tool
React Router   - Routing
CSS            - Styling
Axios          - HTTP client
WebSocket API  - Real-time
```

### DevOps
```
Docker         - Containerization
GitHub Actions - CI/CD
Render.com     - Backend deployment
Netlify        - Frontend deployment
PostgreSQL     - Production database
```

---

## 🚀 Kezdés

### Előfeltételek
- Python 3.11+
- Node.js 18+
- Git
- npm vagy yarn

### 1. Repository klónozása
```bash
git clone https://github.com/YOUR_USERNAME/quizmaster.git
cd quizmaster
```

### 2. Automatikus setup (macOS/Linux)
```bash
./setup.sh
```

Vagy manuálisan:

### 3. Backend beállítása
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### 4. Frontend beállítása
```bash
cd ../frontend
npm install
cp .env.example .env
```

### 5. Futtatás
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Hozzáférés
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📁 Struktúra

```
quizmaster/
├── backend/
│   ├── database/              # Database configuration
│   │   └── database.py
│   ├── models/                # SQLAlchemy models
│   │   ├── user.py
│   │   └── quiz.py
│   ├── routes/                # API endpoints
│   │   ├── auth.py
│   │   ├── quiz.py
│   │   ├── game.py
│   │   ├── admin.py
│   │   ├── ai.py
│   │   └── subscription.py
│   ├── schemas/               # Pydantic schemas
│   │   ├── user.py
│   │   └── quiz.py
│   ├── services/              # Business logic
│   │   ├── game_manager.py
│   │   ├── websocket_manager.py
│   │   └── export_service.py
│   ├── utils/                 # Helpers
│   │   ├── auth.py
│   │   └── dependencies.py
│   ├── middleware/            # Custom middleware
│   │   └── token_refresh.py
│   ├── tests/                 # Unit tests
│   ├── main.py                # FastAPI app entry
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── game/
│   │   │   ├── host/
│   │   │   └── quiz/
│   │   ├── pages/             # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── QuizDetailPage.jsx
│   │   │   └── GamePage.jsx
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/          # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── quizService.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── .github/
│   └── workflows/
│       └── tests.yml           # CI/CD pipeline
│
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
├── QUICKSTART.md              # Quick start guide
├── DEPLOYMENT_GUIDE.md        # Deployment instructions
├── netlify.toml               # Netlify config
├── render.yaml                # Render config
└── setup.sh                   # Setup script
```

---

## 🌐 Deployment

### Development
```bash
# Backend
cd backend && uvicorn main:app --reload

# Frontend
cd frontend && npm run dev
```

### Production - Render.com (Backend)

1. **PostgreSQL Database**
   - New Service > PostgreSQL
   - Database: `quizmaster`
   - Copy Internal Database URL

2. **Web Service**
   - New > Web Service
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`
   - Environment variables: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Production - Netlify (Frontend)

1. **Connect Repository**
   - GitHub authorization
   - Select `quizmaster` repo

2. **Build Settings**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`

3. **Domain Setup**
   - Add custom domain: `quizmaster.taksimon.hu`
   - Configure DNS in registrar

### DNS Konfigurálás

**Frontend (quizmaster.taksimon.hu) - Netlify:**
```
Type: CNAME
Host: quizmaster
Value: [your-netlify-site].netlify.app
TTL: 3600
```

**Backend (Optional - api.quizmaster.taksimon.hu) - Render:**
```
Type: CNAME
Host: api
Value: [your-render-service].onrender.com
TTL: 3600
```

További részletekért lásd: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📚 API Dokumentáció

### Autentikáció
```
POST   /auth/register          - Regisztráció
POST   /auth/login             - Bejelentkezés
POST   /auth/refresh-token     - Token refresh
POST   /auth/logout            - Kijelentkezés
```

### Kvízek
```
GET    /quiz/                  - Összes kvíz listázása
POST   /quiz/                  - Új kvíz létrehozása
GET    /quiz/{id}              - Kvíz részletei
PUT    /quiz/{id}              - Kvíz módosítása
DELETE /quiz/{id}              - Kvíz törlése
POST   /quiz/{id}/publish      - Kvíz közzététele
```

### Játék
```
POST   /game/create            - Szoba létrehozása
POST   /game/{room_id}/join    - Csatlakozás szobához
WS     /ws/{room_id}/{player}  - WebSocket adat
```

### Admin
```
GET    /admin/users            - Felhasználók listája
GET    /admin/quizzes          - Kvízek moderálása
POST   /admin/ratings          - Értékelések
```

### AI
```
POST   /ai/generate-questions  - Kérdés generálás
```

Teljes dokumentáció: [Swagger UI](http://localhost:8000/docs)

---

## 🧪 Tesztelés

### Backend
```bash
cd backend
pytest                    # Összes test futtatása
pytest --cov             # Coverage report
pytest -v                # Verbose output
pytest tests/test_auth.py # Specifikus test fájl
```

### Frontend
```bash
cd frontend
npm test                  # Jest tests
npm run test:watch       # Watch mode
```

### CI/CD
GitHub Actions automatikusan futtatja a testeket a push után.
Lásd: [.github/workflows/tests.yml](./.github/workflows/tests.yml)

---

## 🔒 Biztonság

### Jó Gyakorlatok
- [ ] `.env` fájl `.gitignore`-ban
- [ ] Erős SECRET_KEY (environment variable)
- [ ] HTTPS csak (production)
- [ ] CORS origins restrictive
- [ ] SQL injection prevention (SQLAlchemy)
- [ ] Jelszó hashing (Argon2)
- [ ] JWT token expiration
- [ ] Regular security updates

### Environment Variables
```env
DATABASE_URL              # Adatbázis kapcsolat
SECRET_KEY                # JWT titkos kulcs
ALGORITHM                 # JWT algorithm (HS256)
ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS
GOOGLE_API_KEY            # Google Generative AI
ENVIRONMENT               # development/production
FRONTEND_URL              # CORS allowed origin
```

---

## 🤝 Közreműködés

### Development Branch
```bash
git checkout -b feature/your-feature
# Fejlesztés...
git push origin feature/your-feature
# Pull Request a main-hez
```

### Code Style
- Python: PEP 8 (black formatter ajánlott)
- JavaScript: Prettier konfigurált
- Docstrings és Comments kötelezőek

### Commit Konvenció
```
type(scope): description

[optional body]
[optional footer]
```

Típusok: feat, fix, docs, style, refactor, test, chore

---

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Leaderboard system
- [ ] Analytics dashboard
- [ ] Quiz categories
- [ ] Team/Group features
- [ ] Social sharing
- [ ] Notifications
- [ ] Dark mode

---

## 🐛 Bug Report & Feature Request

[GitHub Issues](https://github.com/YOUR_USERNAME/quizmaster/issues)

---

## 📞 Support

- 📧 Email: your.email@example.com
- 💬 Discussions: [GitHub Discussions](https://github.com/YOUR_USERNAME/quizmaster/discussions)

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 👨‍💻 Szerző

**TAKÁCS-SIMON F8BTO8**

---

## 🙏 Acknowledgments

- FastAPI documentation
- React community
- Render.com & Netlify
- Google Generative AI

---

**Köszönöm, hogy használod a QuizMaster-t!** ⭐

Csillag a GitHub repo-n nagyra értékeltetne! 🌟
