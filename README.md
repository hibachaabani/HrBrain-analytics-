# TalentIQ — HR Analytics Platform 🧠

Plateforme web de **HR Analytics** basée sur 3 modèles Machine Learning déployés via une API Flask et une interface React.

> Projet académique — ESPRIT 2025–2026 · IBM HR Analytics Dataset · 1 470 employés · 35 variables

---

## Aperçu

| DSO | Modèle | Objectif |
|-----|--------|----------|
| DSO 1 | KNN (k=3) | Prédire la compatibilité d'un employé (Fit = 0 / 1) |
| DSO 2 | K-Means (K=4) | Segmenter un employé en 4 profils RH |
| DSO 3 | Cosine Similarity | Recommander les Top-N employés similaires |

---

## Structure du projet

```
hr-analytics/
├── backend/
│   ├── app.py                  ← API Flask (5 endpoints REST)
│   ├── requirements.txt
│   ├── data/
│   │   └── EmployeeAttrition.csv
│   └── models/
│       ├── model_classification.pkl
│       ├── model_clustering.pkl
│       ├── scaler_clf.pkl
│       ├── scaler_clu.pkl
│       ├── scaler_rec.pkl
│       ├── X_rec_scaled.pkl
│       └── df_meta.pkl
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   │   ├── Home.jsx           ← Accueil
    │   │   ├── Dashboard.jsx      ← KPIs + graphiques Recharts
    │   │   ├── Classification.jsx ← DSO 1
    │   │   ├── Clustering.jsx     ← DSO 2
    │   │   └── Recommandation.jsx ← DSO 3
    │   └── components/
    │       └── UI.jsx
    └── package.json
```

---

## Lancer le projet en local

### Backend Flask

```bash
cd backend
pip install -r requirements.txt
python3 app.py
# API disponible sur http://localhost:5001
```

### Frontend React

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5001
npm run dev
# Interface disponible sur http://localhost:3000
```

---

## Endpoints API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/health` | GET | État du serveur et des modèles |
| `/api/predict` | POST | DSO 1 — Prédiction Fit=0/1 + probabilité |
| `/api/cluster` | POST | DSO 2 — Identification du cluster RH |
| `/api/recommend` | POST | DSO 3 — Top-N employés similaires |
| `/api/dataset/stats` | GET | Statistiques globales du dataset |

---

## Stack technique

**Backend** : Python · Flask 3.0 · scikit-learn 1.6 · pandas · joblib · Gunicorn

**Frontend** : React 18 · Vite 5 · Recharts 3.8 · CSS-in-JS
