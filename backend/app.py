from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ── Chargement des modèles ──────────────────────────────────────────
MODELS_DIR = "models"

def load_model(filename):
    path = os.path.join(MODELS_DIR, filename)
    if os.path.exists(path):
        return joblib.load(path)
    return None

model_clf    = load_model("model_classification.pkl")
scaler_clf   = load_model("scaler_clf.pkl")
model_kmeans = load_model("model_clustering.pkl")
scaler_clu   = load_model("scaler_clu.pkl")
scaler_rec   = load_model("scaler_rec.pkl")
X_rec_sc     = load_model("X_rec_scaled.pkl")
df_meta      = load_model("df_meta.pkl")

MODELS_LOADED = all([
    model_clf is not None,
    model_kmeans is not None,
    scaler_rec is not None,
    X_rec_sc is not None,
    df_meta is not None
])
print(f"{'✅ Modèles chargés' if MODELS_LOADED else '⚠️  Modèles non trouvés — mode simulation actif'}")
print(f"   scaler_clf : {'✅' if scaler_clf else '⚠️  absent'}")
print(f"   scaler_clu : {'✅' if scaler_clu else '⚠️  absent'}")

# ── Chargement du dataset CSV ───────────────────────────────────────
CSV_CANDIDATES = [
    "data/EmployeeAttrition (2).csv",
    "data/EmployeeAttrition.csv",
    "data/WA_Fn-UseC_-HR-Employee-Attrition.csv",
    "data/hr_data.csv",
    "data/dataset.csv",
]
df_csv = None
for path in CSV_CANDIDATES:
    if os.path.exists(path):
        df_csv = pd.read_csv(path)
        print(f"✅ Dataset CSV chargé ({path}) — {len(df_csv)} employés")
        break
if df_csv is None:
    print("ℹ️  CSV non trouvé dans backend/data/")

# ── Pré-calcul stats clustering ─────────────────────────────────────
FEATURES_KM_COLS = ['YearsAtCompany', 'JobLevel', 'MonthlyIncome',
                     'TotalWorkingYears', 'Age', 'JobSatisfaction', 'PerformanceRating']
cluster_stats = {}
if df_csv is not None and model_kmeans is not None:
    try:
        X_all    = df_csv[FEATURES_KM_COLS].dropna().values
        X_all_sc = scaler_clu.transform(X_all) if scaler_clu else X_all
        labels   = model_kmeans.predict(X_all_sc)
        df_csv["_cluster"] = labels

        cluster_income = {cid: df_csv[df_csv["_cluster"] == cid]["MonthlyIncome"].mean() for cid in range(4)}
        sorted_clusters = sorted(cluster_income, key=cluster_income.get)
        label_map = {sorted_clusters[i]: n for i, n in enumerate(["Junior", "Mid-Level", "Senior", "Expert"])}

        for cid in range(4):
            sub = df_csv[df_csv["_cluster"] == cid]
            cluster_stats[cid] = {
                "count":       int(len(sub)),
                "label":       label_map[cid],
                "avg_income":  round(float(sub["MonthlyIncome"].mean()), 0) if len(sub) else 0,
                "avg_years":   round(float(sub["TotalWorkingYears"].mean()), 1) if len(sub) else 0,
                "avg_age":     round(float(sub["Age"].mean()), 1) if len(sub) else 0,
                "departments": sub["Department"].value_counts().head(3).to_dict() if "Department" in sub.columns else {},
                "top_roles":   sub["JobRole"].value_counts().head(3).to_dict() if "JobRole" in sub.columns else {},
            }
        print(f"✅ Stats clustering calculées — Labels : {label_map}")
    except Exception as e:
        print(f"⚠️  Erreur stats clustering : {e}")


# ── DSO 1 — Classification ──────────────────────────────────────────
FEATURES_CLF = [
    'Age', 'JobLevel', 'MonthlyIncome', 'YearsAtCompany', 'YearsInCurrentRole',
    'TotalWorkingYears', 'TrainingTimesLastYear', 'JobSatisfaction',
    'EnvironmentSatisfaction', 'WorkLifeBalance', 'PerformanceRating'
]

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    try:
        X     = pd.DataFrame([{f: float(data[f]) for f in FEATURES_CLF}])
        X_arr = scaler_clf.transform(X) if scaler_clf else X.values

        if model_clf:
            prediction = int(model_clf.predict(X_arr)[0])
            proba      = float(model_clf.predict_proba(X_arr)[0][1])
        else:
            score = (
                float(data.get("JobSatisfaction", 3)) * 0.2 +
                float(data.get("WorkLifeBalance", 3)) * 0.15 +
                float(data.get("PerformanceRating", 3)) * 0.2 +
                float(data.get("JobLevel", 2)) * 0.1 +
                min(float(data.get("TotalWorkingYears", 5)) / 20, 1) * 0.15 +
                float(data.get("EnvironmentSatisfaction", 3)) * 0.2
            ) / 4 * 3.5
            proba      = min(max(score / 4.5, 0.1), 0.95)
            prediction = 1 if proba >= 0.5 else 0

        # Employés réels similaires — supprimé (non pertinent pour DSO1)
        similar_real = []

        return jsonify({
            "fit":          prediction,
            "probability":  round(proba, 3),
            "label":        "Compatible ✅" if prediction == 1 else "Non compatible ❌",
            "features":     {f: data[f] for f in FEATURES_CLF},
            "similar_real": similar_real,
            "mode":         "model" if model_clf else "simulation"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ── DSO 2 — Clustering ──────────────────────────────────────────────
FEATURES_KM = ['YearsAtCompany', 'JobLevel', 'MonthlyIncome',
                'TotalWorkingYears', 'Age', 'JobSatisfaction', 'PerformanceRating']
CLUSTER_COLORS = {0: "#9FE1CB", 1: "#85B7EB", 2: "#FAC775", 3: "#F0997B"}

@app.route("/api/cluster", methods=["POST"])
def cluster():
    data = request.get_json()
    try:
        X     = pd.DataFrame([{f: float(data[f]) for f in FEATURES_KM}])
        X_arr = scaler_clu.transform(X) if scaler_clu else X.values

        if model_kmeans:
            cluster_id = int(model_kmeans.predict(X_arr)[0])
            label      = cluster_stats.get(cluster_id, {}).get("label", f"Cluster {cluster_id}")
        else:
            income = float(data.get("MonthlyIncome", 5000))
            years  = float(data.get("TotalWorkingYears", 5))
            if   income < 3500 or years < 3:   cluster_id, label = 0, "Junior"
            elif income < 7000 or years < 8:   cluster_id, label = 1, "Mid-Level"
            elif income < 12000 or years < 15: cluster_id, label = 2, "Senior"
            else:                              cluster_id, label = 3, "Expert"

        return jsonify({
            "cluster":     cluster_id,
            "label":       label,
            "color":       CLUSTER_COLORS.get(cluster_id, "#aaa"),
            "description": {
                "Junior":    "Profil junior avec peu d'expérience, en début de carrière.",
                "Mid-Level": "Profil intermédiaire avec une expérience solide.",
                "Senior":    "Profil senior avec forte expérience et bon niveau de poste.",
                "Expert":    "Profil expert, haut niveau de responsabilité et d'ancienneté."
            }.get(label, ""),
            "real_stats":  cluster_stats.get(cluster_id, {}),
            "mode":        "model" if model_kmeans else "simulation"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ── DSO 3 — Recommandation ──────────────────────────────────────────
FEATURES_REC = [
    'JobLevel', 'YearsAtCompany', 'YearsInCurrentRole',
    'TotalWorkingYears', 'TrainingTimesLastYear',
    'JobSatisfaction', 'PerformanceRating'
]

@app.route("/api/recommend", methods=["POST"])
def recommend():
    data  = request.get_json()
    top_n = int(data.get("top_n", 5))
    try:
        if scaler_rec is not None and X_rec_sc is not None and df_meta is not None:
            X       = pd.DataFrame([{f: float(data[f]) for f in FEATURES_REC}])
            act_sc  = scaler_rec.transform(X)
            from sklearn.metrics.pairwise import cosine_similarity
            sims    = cosine_similarity(act_sc, X_rec_sc).flatten()
            top_idx = sims.argsort()[-top_n:][::-1]
            results = []
            for rank, idx in enumerate(top_idx, 1):
                emp_id  = int(df_meta.iloc[idx]["Employé #"]) if "Employé #" in df_meta.columns else int(idx)
                fit     = int(df_meta.iloc[idx]["Fit"])
                details = {}
                if df_csv is not None:
                    row = df_csv[df_csv.index == idx]
                    if not row.empty:
                        r = row.iloc[0]
                        details = {
                            "Age":               int(r.get("Age", 0)),
                            "Department":        str(r.get("Department", "—")),
                            "JobRole":           str(r.get("JobRole", "—")),
                            "JobLevel":          int(r.get("JobLevel", 0)),
                            "MonthlyIncome":     int(r.get("MonthlyIncome", 0)),
                            "YearsAtCompany":    int(r.get("YearsAtCompany", 0)),
                            "TotalWorkingYears": int(r.get("TotalWorkingYears", 0)),
                            "PerformanceRating": int(r.get("PerformanceRating", 0)),
                            "JobSatisfaction":   int(r.get("JobSatisfaction", 0)),
                        }
                results.append({
                    "rank": rank, "employee_id": emp_id,
                    "score": round(float(sims[idx]), 4),
                    "fit": fit, "details": details
                })
            mode = "model"
        else:
            import random; random.seed(42)
            results = [{"rank": i+1, "employee_id": random.randint(100, 1470),
                        "score": round(0.99 - i*0.015, 4),
                        "fit": 1 if i < 4 else 0, "details": {}}
                       for i in range(top_n)]
            mode = "simulation"

        return jsonify({
            "profile":   {f: data[f] for f in FEATURES_REC},
            "top_n":     top_n,
            "results":   results,
            "avg_score": round(sum(r["score"] for r in results) / len(results), 4),
            "fit_count": sum(1 for r in results if r["fit"] == 1),
            "mode":      mode
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/dataset/stats", methods=["GET"])
def dataset_stats():
    if df_csv is None:
        return jsonify({"error": "CSV non chargé"}), 404
    try:
        if "Fit" not in df_csv.columns:
            df_csv["Fit"] = (
                (df_csv["Attrition"] == "No") &
                (df_csv["PercentSalaryHike"] >= 15) &
                (df_csv["JobInvolvement"] >= 3)
            ).astype(int)
        return jsonify({
            "total_employees":    len(df_csv),
            "fit_distribution":   df_csv["Fit"].value_counts().to_dict(),
            "avg_age":            round(float(df_csv["Age"].mean()), 1),
            "avg_monthly_income": round(float(df_csv["MonthlyIncome"].mean()), 0),
            "avg_years_company":  round(float(df_csv["YearsAtCompany"].mean()), 1),
            "departments":        df_csv["Department"].value_counts().to_dict() if "Department" in df_csv.columns else {},
            "job_roles":          df_csv["JobRole"].value_counts().to_dict() if "JobRole" in df_csv.columns else {},
            "cluster_stats":      cluster_stats,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status":  "ok",
        "message": "HR Analytics API is running",
        "models": {
            "classification": model_clf is not None,
            "clustering":     model_kmeans is not None,
            "recommendation": scaler_rec is not None and X_rec_sc is not None,
        },
        "scalers": {
            "clf": scaler_clf is not None,
            "clu": scaler_clu is not None,
        },
        "dataset": {
            "loaded": df_csv is not None,
            "rows":   len(df_csv) if df_csv is not None else 0
        },
        "mode": "model" if MODELS_LOADED else "simulation"
    })


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
