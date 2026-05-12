# HR Analytics — ML Platform 🧠

Plateforme web complète pour déployer 3 modèles Machine Learning RH.

## Structure du projet

```
hr-analytics/
├── backend/              ← API Flask (Python)
│   ├── app.py           ← Routes API
│   ├── requirements.txt
│   ├── export_models.py ← À ajouter à ton notebook
│   └── models/          ← Dossier pour tes .pkl (à créer)
│
└── frontend/             ← Site React
    ├── src/
    │   ├── App.jsx       ← Navigation + layout
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Classification.jsx   ← DSO1
    │   │   ├── Clustering.jsx       ← DSO2
    │   │   └── Recommandation.jsx   ← DSO3
    │   └── components/
    │       └── UI.jsx    ← Composants réutilisables
    ├── index.html
    └── package.json
```

---

## Étape 1 — Exporter les modèles

Dans ton notebook Jupyter, ajoute et exécute le code de `backend/export_models.py`.
Tu obtiendras des fichiers `.pkl` dans un dossier `models/`.

---

## Étape 2 — Lancer le backend (local)

```bash
cd backend
pip install -r requirements.txt

# Copier les fichiers .pkl dans backend/models/
mkdir models
cp /chemin/vers/tes/models/*.pkl models/

# Dans app.py, décommenter les lignes de chargement des modèles
# (chercher "# Décommente les lignes suivantes")

python app.py
# → API disponible sur http://localhost:5000
```

Test rapide :
```bash
curl http://localhost:5000/api/health
```

---

## Étape 3 — Lancer le frontend (local)

```bash
cd frontend
npm install

# Créer le fichier .env
cp .env.example .env
# Vérifier que VITE_API_URL=http://localhost:5000

npm run dev
# → Site disponible sur http://localhost:3000
```

---

## Étape 4 — Déployer en production

### Backend → Render (gratuit)

1. Créer un compte sur https://render.com
2. "New Web Service" → connecter ton repo GitHub
3. Paramètres :
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `gunicorn app:app`
   - **Root Directory** : `backend`
4. Ajouter tes fichiers .pkl (via Git ou Render Disks)
5. Ton URL sera : `https://hr-analytics-api.onrender.com`

### Frontend → Vercel (gratuit)

1. Créer un compte sur https://vercel.com
2. Importer ton repo GitHub
3. **Root Directory** : `frontend`
4. Ajouter la variable d'environnement :
   - `VITE_API_URL` = URL de ton backend Render
5. Déployer → ton site sera en ligne en 2 minutes !

---

## Pages du site

| Page | Route | Description |
|------|-------|-------------|
| Accueil | `/` | Présentation + accès aux 3 modèles |
| DSO 1 | `/classification` | Prédire Fit=0 ou Fit=1 |
| DSO 2 | `/clustering` | Identifier le cluster RH |
| DSO 3 | `/recommandation` | Top-N employés similaires |

---

## Variables utilisées par modèle

**DSO 1 — Classification (11 variables)**
Age, JobLevel, MonthlyIncome, YearsAtCompany, YearsInCurrentRole,
TotalWorkingYears, TrainingTimesLastYear, JobSatisfaction,
EnvironmentSatisfaction, WorkLifeBalance, PerformanceRating

**DSO 2 — Clustering (6 variables)**
MonthlyIncome, JobLevel, YearsAtCompany, TotalWorkingYears,
PerformanceRating, JobSatisfaction

**DSO 3 — Recommandation (7 variables)**
JobLevel, YearsAtCompany, YearsInCurrentRole, TotalWorkingYears,
TrainingTimesLastYear, JobSatisfaction, PerformanceRating
