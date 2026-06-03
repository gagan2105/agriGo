# 🌾 AntiGravity AgriMarket

**AI-Powered Direct Farmer-to-Market Platform Eliminating Brokers**

AntiGravity AgriMarket is a state-of-the-art AgriTech platform designed to connect farmers directly with buyers (supermarkets, restaurants, wholesalers, and consumers). By cutting out middleman commission agents (brokers) and providing transparent pricing models, the platform maximizes farmer profits and guarantees quality sourcing for customers.

---

## 🛠️ Technology Stack

Our modern enterprise AgriTech ecosystem leverages the following technologies:

*   **Frontend Web**: React.js, Tailwind CSS v4, React Router, Axios, Redux Toolkit, React Query, Framer Motion
*   **Mobile App (Planned)**: React Native
*   **Backend Services**: FastAPI, SQLAlchemy ORM, Pydantic, Python 3.13
*   **Authentication & Access Control**: JWT Tokens, direct `bcrypt` Role-Based Access Control (RBAC) guards
*   **Database & Cache**: SQLite (local development), PostgreSQL (production ready), Redis caching
*   **Storage Services**: Cloudinary (simulated cloud asset media manager)
*   **AI/ML Engines**: 
    *   *Random Forest Regressor* (for dynamic crop price estimations)
    *   *Convolutional Visual Neural Simulator* (for crop leaf disease diagnostics)
    *   *Collaborative Filtering recommendations*
    *   *AI Chatbot Agroadvisor*
*   **Maps & Navigation**: Haversine formula coordinates & Google Maps API
*   **Payments Gateway**: UPI (Unified Payments Interface) Simulator
*   **Notifications**: Firebase Cloud Messaging, Twilio SMS API, Email SMTP services
*   **DevOps & Deployment**: Docker containers, Docker Compose, GitHub Actions (CI/CD pipeline automated checking), Render, Vercel

---

## 🏗️ System Architecture

```
                    +-----------------------------+
                    |        React Client         |
                    | (Redux + Tailwind + Router) |
                    +--------------+--------------+
                                   |
                         REST APIs / JWT Tokens
                                   |
                                   v
                    +-----------------------------+
                    |       FastAPI Server        |
                    |    (Auth + RBAC Guards)     |
                    +--------+-----+--------+-----+
                             |     |        |
           +-----------------+     |        +-----------------+
           |                       |                          |
           v                       v                          v
+------------------+    +--------------------+    +-----------------------+
|  SQLAlchemy ORM  |    |     AI Engines     |    | Simulated Gateways    |
| (Postgres/SQLite)|    | Price prediction   |    | Stripe Pay Simulator  |
|                  |    | Disease detector   |    | Haversine GPS Map     |
+------------------+    +--------------------+    +-----------------------+
```

---

## 📊 Entity Relationship (ER) Diagram

```
+-------------------+       1        1..* +-------------------+
|       USERS       | <-----------------> |      FARMERS      |
| id (PK)           |                     | id (PK)           |
| name, email, role |                     | user_id (FK)      |
| phone, address    |                     | farm_name, size   |
| password_hash     |                     +---------+---------+
+---------+---------+                               |
          | 1                                       | 1
          |                                         |
          | 1..*                                    | 1..*
          v                                         v
+-------------------+                     +-------------------+
|      ORDERS       |                     |       CROPS       |
| id (PK)           |                     | id (PK)           |
| buyer_id (FK)     |                     | farmer_id (FK)    |
| total_amount      |                     | crop_name, status |
| order_status      |                     | price_per_unit    |
+---------+---------+                     +---------+---------+
          | 1                                       | 1
          |                                         |
          | 1..*                                    | 1..*
          v                                         v
+-------------------+                     +-------------------+
|    ORDER_ITEMS    | <-----------------> | PRICE_PREDICTIONS |
| id (PK)           |                     | id (PK)           |
| order_id (FK)     |                     | crop_id (FK)      |
| crop_id (FK)      |                     | predicted_price   |
| quantity, price   |                     +-------------------+
+-------------------+
```

---

## 📂 Project Directory Structure

```
.
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy ORM schemas
│   │   ├── schemas/       # Pydantic validation structures
│   │   ├── routes/        # Route logic controllers
│   │   ├── utils/         # Authentication/JWT, AI Regressors
│   │   ├── config.py      # Env configurations
│   │   ├── database.py    # Database connection engine
│   │   └── main.py        # FastAPI entrypoint
│   ├── tests/             # Unit tests using pytest
│   ├── Dockerfile
│   └── requirements.txt
├── client/
│   ├── src/
│   │   ├── components/    # Reusable layouts (Navbar, cards)
│   │   ├── pages/         # View dashboards (Farmer, Buyer, Admin)
│   │   ├── services/      # Axios calls, Redux state slices
│   │   ├── App.jsx        # Routing master
│   │   └── index.css      # Core styles & Tailwind v4
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## 🚀 Startup Instructions

### Local Development (Quick Boot)

#### 1. FastAPI Backend setup
```bash
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
The server will boot at `http://localhost:8000`. The API interactive documentation is available at `http://localhost:8000/docs`.

#### 2. React Vite Frontend setup
```bash
cd client
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

### Docker Multi-Container Boot
Deploy both frontend and backend instantly in isolated containers:
```bash
docker-compose up --build
```
Access the application portal at `http://localhost:5173` (or `http://localhost:3000` depending on container ports).

---

## 🧪 Testing
Run Pytest suites in the backend folder:
```bash
cd backend
# With venv active
python -m pytest
```
This tests registration routes, crop listing creations, and buyer shopping cart validations.
