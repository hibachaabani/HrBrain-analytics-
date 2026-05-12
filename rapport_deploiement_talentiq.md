# Chapitre 6 — Déploiement de la plateforme TalentIQ

---

## 6.1 Architecture générale

La plateforme TalentIQ repose sur une architecture **client-serveur en deux tiers** découplés :

- Un **backend Flask** exposant une API REST, responsable du chargement des modèles ML, du traitement des données et du calcul des prédictions.
- Un **frontend React (SPA)** consommant cette API via des appels HTTP, responsable de l'affichage, de la navigation et de l'interaction utilisateur.

Les deux composants sont développés et déployés **indépendamment**, ce qui permet de les faire évoluer séparément et de les héberger sur des plateformes distinctes.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Navigateur Web                           │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │           Frontend React (SPA — Vite + React 18)        │   │
│   │   Home · Dashboard · Classification · Clustering ·      │   │
│   │   Recommandation                                         │   │
│   └──────────────────────┬──────────────────────────────────┘   │
│                          │  HTTP / JSON (fetch API)             │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend Flask — API REST (port 5001)               │
│                                                                 │
│   /api/health · /api/predict · /api/cluster                     │
│   /api/recommend · /api/dataset/stats                           │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │  model_clf   │  │ model_kmeans │  │  X_rec_sc + df_meta  │  │
│   │  (KNN)       │  │  (K-Means)   │  │  (Cosine Similarity) │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │         IBM HR Dataset — 1 470 employés (CSV)           │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6.2 Backend Flask — API REST

### 6.2.1 Stack technique

| Composant       | Technologie              | Version  |
|-----------------|--------------------------|----------|
| Framework web   | Flask                    | 3.0.0    |
| CORS            | Flask-CORS               | 4.0.0    |
| ML              | scikit-learn             | 1.6.1    |
| Données         | pandas                   | 2.1.4    |
| Calcul          | numpy                    | 1.26.2   |
| Sérialisation   | joblib                   | 1.3.2    |
| Serveur prod.   | Gunicorn                 | 21.2.0   |

### 6.2.2 Modèles chargés au démarrage

Au lancement du serveur, Flask charge en mémoire l'ensemble des artefacts ML depuis le dossier `models/` :

| Fichier `.pkl`           | Rôle                                              |
|--------------------------|---------------------------------------------------|
| `model_classification.pkl` | Modèle KNN entraîné — DSO 1 (prédiction Fit)    |
| `scaler_clf.pkl`           | StandardScaler pour la classification           |
| `model_clustering.pkl`     | Modèle K-Means (K=4) — DSO 2                    |
| `scaler_clu.pkl`           | StandardScaler pour le clustering               |
| `scaler_rec.pkl`           | StandardScaler pour la recommandation           |
| `X_rec_scaled.pkl`         | Matrice des 1 470 vecteurs employés normalisés  |
| `df_meta.pkl`              | Métadonnées employés (ID, Fit) pour DSO 3       |

Un flag `MODELS_LOADED` est calculé au démarrage. Si un modèle est absent, le serveur bascule automatiquement en **mode simulation** (règles métier déterministes) sans lever d'erreur fatale.

Le dataset CSV (`EmployeeAttrition.csv`, 1 470 lignes) est également chargé au démarrage. Les statistiques de clustering sont **pré-calculées une seule fois** à l'initialisation pour éviter de les recalculer à chaque requête.

### 6.2.3 Endpoints de l'API

**TABLE 6.1 — Endpoints de l'API Flask**

| Endpoint             | Méthode | Description                                      | Corps de la requête                  | Réponse principale                                          |
|----------------------|---------|--------------------------------------------------|--------------------------------------|-------------------------------------------------------------|
| `/api/health`        | GET     | État du serveur, modèles et dataset              | —                                    | `{status, models, scalers, dataset, mode}`                  |
| `/api/predict`       | POST    | DSO 1 — Prédiction de compatibilité (Fit=0/1)   | 11 variables RH (JSON)               | `{fit, probability, label, features, mode}`                 |
| `/api/cluster`       | POST    | DSO 2 — Identification du cluster RH            | 7 variables RH (JSON)                | `{cluster, label, color, description, real_stats, mode}`    |
| `/api/recommend`     | POST    | DSO 3 — Top-N employés similaires               | 7 variables + `top_n` (JSON)         | `{results:[...], avg_score, fit_count, top_n, mode}`        |
| `/api/dataset/stats` | GET     | Statistiques globales du dataset IBM HR          | —                                    | `{total_employees, fit_distribution, avg_age, avg_monthly_income, avg_years_company, departments, job_roles, cluster_stats}` |

---

### 6.2.4 Détail des endpoints

#### `GET /api/health`

Endpoint de supervision. Retourne l'état de chaque composant du système.

```json
{
  "status": "ok",
  "message": "HR Analytics API is running",
  "models": {
    "classification": true,
    "clustering": true,
    "recommendation": true
  },
  "scalers": {
    "clf": true,
    "clu": true
  },
  "dataset": {
    "loaded": true,
    "rows": 1470
  },
  "mode": "model"
}
```

---

#### `POST /api/predict` — DSO 1 : Classification supervisée (KNN)

**Variables d'entrée (11 features) :**

| Variable                  | Type    | Plage       | Description                          |
|---------------------------|---------|-------------|--------------------------------------|
| `Age`                     | float   | 18 – 65     | Âge de l'employé                     |
| `JobLevel`                | float   | 1 – 5       | Niveau hiérarchique                  |
| `MonthlyIncome`           | float   | 1 000 – 20 000 | Salaire mensuel ($)               |
| `YearsAtCompany`          | float   | 0 – 40      | Ancienneté dans l'entreprise         |
| `YearsInCurrentRole`      | float   | 0 – 18      | Années dans le poste actuel          |
| `TotalWorkingYears`       | float   | 0 – 40      | Expérience professionnelle totale    |
| `TrainingTimesLastYear`   | float   | 0 – 6       | Nombre de formations cette année     |
| `JobSatisfaction`         | float   | 1 – 4       | Satisfaction au travail              |
| `EnvironmentSatisfaction` | float   | 1 – 4       | Satisfaction de l'environnement      |
| `WorkLifeBalance`         | float   | 1 – 4       | Équilibre vie personnelle/pro        |
| `PerformanceRating`       | float   | 1 – 4       | Note de performance                  |

**Exemple de requête :**

```json
POST /api/predict
Content-Type: application/json

{
  "Age": 35,
  "JobLevel": 2,
  "MonthlyIncome": 6000,
  "YearsAtCompany": 5,
  "YearsInCurrentRole": 3,
  "TotalWorkingYears": 10,
  "TrainingTimesLastYear": 2,
  "JobSatisfaction": 3,
  "EnvironmentSatisfaction": 3,
  "WorkLifeBalance": 3,
  "PerformanceRating": 3
}
```

**Exemple de réponse :**

```json
{
  "fit": 1,
  "probability": 0.823,
  "label": "Compatible ✅",
  "features": {
    "Age": 35,
    "JobLevel": 2,
    "MonthlyIncome": 6000,
    "..."
  },
  "mode": "model"
}
```

La variable cible `Fit` est définie par la règle métier suivante :

```
Fit = 1  si  (Attrition = "No")  ET  (PercentSalaryHike ≥ 15)  ET  (JobInvolvement ≥ 3)
Fit = 0  sinon
```

Distribution dans le dataset : **Fit=1 → 384 employés (26,1%)** · **Fit=0 → 1 086 (73,9%)**. Le déséquilibre est corrigé par **SMOTE** lors de l'entraînement.

---

#### `POST /api/cluster` — DSO 2 : Clustering K-Means

**Variables d'entrée (7 features) :**

| Variable            | Description                       |
|---------------------|-----------------------------------|
| `YearsAtCompany`    | Ancienneté dans l'entreprise      |
| `JobLevel`          | Niveau hiérarchique (1–5)         |
| `MonthlyIncome`     | Salaire mensuel ($)               |
| `TotalWorkingYears` | Expérience totale                 |
| `Age`               | Âge                               |
| `JobSatisfaction`   | Satisfaction au travail (1–4)     |
| `PerformanceRating` | Note de performance (1–4)         |

**Exemple de réponse :**

```json
{
  "cluster": 2,
  "label": "Senior",
  "color": "#FAC775",
  "description": "Profil senior avec forte expérience et bon niveau de poste.",
  "real_stats": {
    "count": 312,
    "label": "Senior",
    "avg_income": 9850.0,
    "avg_years": 12.4,
    "avg_age": 43.2,
    "departments": {"Research & Development": 198, "Sales": 87, "Human Resources": 27},
    "top_roles": {"Manager": 95, "Research Scientist": 78, "Sales Executive": 65}
  },
  "mode": "model"
}
```

**Les 4 clusters et leurs profils typiques :**

| Cluster | Label      | Emoji | Salaire moyen    | Expérience typique |
|---------|------------|-------|------------------|--------------------|
| 0       | Junior     | 🌱    | < 3 500 $/mois   | < 3 ans            |
| 1       | Mid-Level  | 📈    | 3 500–7 000 $/mois | 3–8 ans           |
| 2       | Senior     | ⭐    | 7 000–12 000 $/mois | 8–15 ans         |
| 3       | Expert     | 🏆    | > 12 000 $/mois  | > 15 ans           |

Les labels sont attribués dynamiquement en triant les clusters par salaire moyen croissant, ce qui garantit une cohérence sémantique indépendante de l'ordre interne de K-Means.

---

#### `POST /api/recommend` — DSO 3 : Recommandation par similarité cosinus

**Variables d'entrée (7 features + paramètre) :**

| Variable                | Description                          |
|-------------------------|--------------------------------------|
| `JobLevel`              | Niveau de poste cible (1–5)          |
| `YearsAtCompany`        | Années en entreprise                 |
| `YearsInCurrentRole`    | Années dans le rôle actuel           |
| `TotalWorkingYears`     | Expérience totale                    |
| `TrainingTimesLastYear` | Formations (dernière année)          |
| `JobSatisfaction`       | Satisfaction au travail (1–4)        |
| `PerformanceRating`     | Note de performance (1–4)            |
| `top_n`                 | Nombre de résultats souhaités (3/5/10) |

**Mécanisme :** Le vecteur du profil cible est normalisé avec `scaler_rec`, puis la similarité cosinus est calculée contre les 1 470 vecteurs pré-normalisés (`X_rec_scaled.pkl`). Les `top_n` indices avec les scores les plus élevés sont retournés avec leurs métadonnées réelles issues du CSV.

**Exemple de réponse :**

```json
{
  "profile": {"JobLevel": 3, "YearsAtCompany": 6, "...": "..."},
  "top_n": 5,
  "avg_score": 0.9821,
  "fit_count": 4,
  "results": [
    {
      "rank": 1,
      "employee_id": 742,
      "score": 0.9987,
      "fit": 1,
      "details": {
        "Age": 38,
        "Department": "Research & Development",
        "JobRole": "Research Scientist",
        "JobLevel": 3,
        "MonthlyIncome": 7200,
        "YearsAtCompany": 6,
        "TotalWorkingYears": 11,
        "PerformanceRating": 4,
        "JobSatisfaction": 4
      }
    }
  ],
  "mode": "model"
}
```

---

#### `GET /api/dataset/stats`

Retourne les statistiques globales du dataset IBM HR pour alimenter le Dashboard.

```json
{
  "total_employees": 1470,
  "fit_distribution": {"0": 1086, "1": 384},
  "avg_age": 36.9,
  "avg_monthly_income": 6502.0,
  "avg_years_company": 7.0,
  "departments": {
    "Research & Development": 961,
    "Sales": 446,
    "Human Resources": 63
  },
  "job_roles": {
    "Sales Executive": 326,
    "Research Scientist": 292,
    "Laboratory Technician": 259,
    "..."
  },
  "cluster_stats": {
    "0": {"count": 312, "label": "Junior", "avg_income": 2850.0, "avg_years": 2.1, "avg_age": 28.4, "...": "..."},
    "1": {"count": 489, "label": "Mid-Level", "...": "..."},
    "2": {"count": 401, "label": "Senior", "...": "..."},
    "3": {"count": 268, "label": "Expert", "...": "..."}
  }
}
```

---

### 6.2.5 Mode simulation (fallback)

Si les fichiers `.pkl` sont absents (environnement de développement sans modèles), le backend bascule automatiquement en **mode simulation**. Chaque endpoint retourne un champ `"mode": "simulation"` pour l'indiquer. Les prédictions sont alors calculées par des règles métier déterministes (seuils sur les variables d'entrée), ce qui permet de tester l'interface sans les modèles entraînés.

---

## 6.3 Frontend React — Interface utilisateur

### 6.3.1 Stack technique

| Composant       | Technologie              | Version  |
|-----------------|--------------------------|----------|
| Framework UI    | React                    | 18.2.0   |
| Build tool      | Vite                     | 5.0.8    |
| Graphiques      | Recharts                 | 3.8.1    |
| Routing         | Navigation par état (SPA)| —        |
| Styles          | CSS-in-JS (inline styles)| —        |

### 6.3.2 Architecture SPA

L'application est une **Single Page Application (SPA)** sans routeur URL. La navigation entre les vues est gérée par un état React (`useState`) dans `App.jsx`. L'URL reste `/` en permanence ; seul l'état interne `page` détermine la vue affichée.

```jsx
// App.jsx — navigation par état
const [page, setPage] = useState("home");

const navigate = (id) => {
  setPage(id);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Rendu conditionnel
{page === "home"           && <Home onNavigate={navigate} />}
{page === "dashboard"      && <Dashboard apiUrl={API_URL} />}
{page === "classification" && <Classification apiUrl={API_URL} />}
{page === "clustering"     && <Clustering apiUrl={API_URL} />}
{page === "recommandation" && <Recommandation apiUrl={API_URL} />}
```

L'URL de l'API est injectée via la variable d'environnement `VITE_API_URL` (fichier `.env`), ce qui permet de pointer vers le backend local ou déployé sans modifier le code.

### 6.3.3 Pages de l'application

**TABLE 6.2 — Pages de l'application React TalentIQ**

| Page             | ID de vue        | Contenu principal                                                                                                   |
|------------------|------------------|---------------------------------------------------------------------------------------------------------------------|
| Accueil          | `home`           | Hero section avec titre animé, statistiques globales (1 470 emp., 35 variables, 3 modèles, 26% Fit=1), 3 cartes modèles cliquables, pipeline ML visuel |
| Dashboard        | `dashboard`      | 4 KPIs (total, taux Fit, attrition, salaire moyen), graphiques Recharts : distribution Fit (PieChart), heures sup., répartition départements, histogramme âge, top 6 postes, 4 cartes clusters K-Means, salaire par cluster, niveaux de satisfaction |
| Classification   | `classification` | Informations algo (KNN, k=3, SMOTE, StratifiedKFold), règle métier Fit, formulaire 11 variables (7 numériques + 4 ratings), résultat Fit=0/1 avec barre de probabilité |
| Clustering       | `clustering`     | Présentation des 4 clusters (Junior/Mid-Level/Senior/Expert), formulaire 7 variables, résultat avec description, fourchette typique et barre de position hiérarchique |
| Recommandation   | `recommandation` | Informations algo (Cosine Similarity, espace 7D), formulaire 7 variables + sélecteur Top-N (3/5/10), liste des résultats avec score, statut Fit et détails réels CSV |

### 6.3.4 Composants partagés (UI.jsx)

Un fichier `UI.jsx` centralise les composants réutilisables entre les pages :

| Composant       | Rôle                                                        |
|-----------------|-------------------------------------------------------------|
| `PageHeader`    | En-tête de page avec icône, titre, sous-titre et badge      |
| `FormCard`      | Carte conteneur pour les formulaires                        |
| `FormField`     | Champ numérique avec slider et input synchronisés           |
| `RatingButtons` | Sélecteur de note 1–4 par boutons                           |
| `SubmitButton`  | Bouton de soumission avec état de chargement                |
| `ResultBox`     | Carte de résultat colorée selon le résultat                 |
| `ErrorBox`      | Affichage d'erreur API                                      |
| `EmptyState`    | État vide avant première soumission                         |

### 6.3.5 Navbar et fonctionnalités transversales

La navbar est **sticky** avec effet de flou (`backdrop-filter: blur(24px)`) et change d'opacité au scroll. Elle intègre :

- **Indicateur de statut API** : point vert animé (système actif) ou rouge (API hors ligne), mis à jour au chargement via `GET /api/health`.
- **Toggle Dark/Light mode** : bascule entre deux thèmes via l'attribut `data-theme` sur `<html>`, avec transition CSS.
- **Bouton Dashboard** : accès rapide depuis toutes les pages.

---

## 6.4 Communication Frontend ↔ Backend

### 6.4.1 Configuration CORS

Flask-CORS est activé globalement (`CORS(app)`), autorisant les requêtes cross-origin depuis le frontend React, qu'il soit servi en local (port 3000) ou depuis un domaine de production différent.

### 6.4.2 Format des échanges

Tous les échanges utilisent le format **JSON** avec l'en-tête `Content-Type: application/json`. Le frontend utilise l'API native `fetch` de JavaScript (pas de bibliothèque HTTP tierce).

### 6.4.3 Gestion des erreurs

Chaque endpoint Flask retourne un objet `{"error": "message"}` avec un code HTTP 400 en cas d'entrée invalide. Le frontend détecte ce champ et affiche un `ErrorBox` à l'utilisateur sans crash de l'interface.

### 6.4.4 Variable d'environnement

```bash
# frontend/.env
VITE_API_URL=http://localhost:5001
```

En production, cette variable est mise à jour avec l'URL du backend déployé, sans aucune modification du code source.

---

## 6.5 Lancement local

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# Serveur disponible sur http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Interface disponible sur http://localhost:3000
```

Le proxy Vite (`vite.config.js`) redirige les appels `/api/*` vers `http://localhost:5000` en développement. En production, la variable `VITE_API_URL` prend le relais.

> **Note :** Le backend écoute sur le port **5001** (`app.run(port=5001)`). Vérifier la cohérence entre le port Flask et la variable `VITE_API_URL` lors du déploiement.

---

## 6.6 Synthèse du déploiement

| Composant   | Technologie       | Port local | Déploiement cloud  |
|-------------|-------------------|------------|--------------------|
| Backend     | Flask + Gunicorn  | 5001       | Render / Railway   |
| Frontend    | React + Vite      | 3000       | Vercel / Netlify   |
| Dataset     | CSV (1 470 lignes)| —          | Embarqué dans le backend |
| Modèles ML  | Fichiers `.pkl`   | —          | Embarqués dans le backend |

Les deux composants sont **stateless** côté frontend (pas de session, pas de cookie) et **stateful** côté backend uniquement pour les modèles chargés en mémoire au démarrage. Cette architecture garantit une scalabilité horizontale simple du backend si nécessaire.
