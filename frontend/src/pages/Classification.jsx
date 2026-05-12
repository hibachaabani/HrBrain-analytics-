import { useState } from "react";
import { PageHeader, FormCard, FormField, RatingButtons, SubmitButton, ResultBox, ErrorBox } from "../components/UI";

const DEFAULTS = {
  Age: 35, JobLevel: 2, MonthlyIncome: 6000, YearsAtCompany: 5,
  YearsInCurrentRole: 3, TotalWorkingYears: 10, TrainingTimesLastYear: 2,
  JobSatisfaction: 3, EnvironmentSatisfaction: 3, WorkLifeBalance: 3, PerformanceRating: 3
};

const LABELS = {
  Age:                     { fr: "Âge",                          col: "Age" },
  JobLevel:                { fr: "Niveau de poste (1–5)",         col: "JobLevel" },
  MonthlyIncome:           { fr: "Salaire mensuel ($)",           col: "MonthlyIncome" },
  YearsAtCompany:          { fr: "Années dans l'entreprise",      col: "YearsAtCompany" },
  YearsInCurrentRole:      { fr: "Années dans le poste actuel",   col: "YearsInCurrentRole" },
  TotalWorkingYears:       { fr: "Années d'expérience totale",    col: "TotalWorkingYears" },
  TrainingTimesLastYear:   { fr: "Formations cette année",        col: "TrainingTimesLastYear" },
  JobSatisfaction:         { fr: "Satisfaction au travail (1–4)", col: "JobSatisfaction" },
  EnvironmentSatisfaction: { fr: "Satisfaction environnement (1–4)", col: "EnvironmentSatisfaction" },
  WorkLifeBalance:         { fr: "Équilibre vie perso/pro (1–4)", col: "WorkLifeBalance" },
  PerformanceRating:       { fr: "Note de performance (1–4)",     col: "PerformanceRating" },
};

// Helper : label complet avec colonne CSV
const LWithCol = (key) => (
  <span>
    {LABELS[key].fr}
    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginLeft: 6 }}>
      [{LABELS[key].col}]
    </span>
  </span>
);

export default function Classification({ apiUrl }) {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 2rem" }}>
      <PageHeader
        icon="🎯" title="DSO 1 — Classification supervisée"
        subtitle="Prédire la compatibilité d'un employé avec une activité"
        badge="Fit = 0 / 1" badgeColor="#818cf8"
      />

      {/* Algo info */}
      <div style={{
        display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap"
      }}>
        {[
          { label: "Algorithme",   value: "K-Nearest Neighbors (KNN)",     color: "#818cf8" },
          { label: "k optimal",    value: "k = 3 (GridSearchCV)",           color: "#818cf8" },
          { label: "Normalisation",value: "StandardScaler",                 color: "#38bdf8" },
          { label: "Rééquilibrage",value: "SMOTE",                          color: "#34d399" },
          { label: "Validation",   value: "StratifiedKFold (5 folds)",      color: "#fbbf24" },
        ].map(t => (
          <div key={t.label} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "7px 14px",
            display: "flex", gap: 8, alignItems: "center"
          }}>
            <span style={{ color: "rgba(232,237,245,0.35)", fontSize: 11 }}>{t.label}</span>
            <span style={{ color: t.color, fontWeight: 600, fontSize: 12 }}>{t.value}</span>
          </div>
        ))}
      </div>

      {/* Règle métier Fit */}
      <div style={{
        background: "rgba(52,211,153,0.06)",
        border: "1px solid rgba(52,211,153,0.18)",
        borderRadius: 12, padding: "0.9rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: 12
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>📐</span>
        <div>
          <div style={{ color: "rgba(232,237,245,0.5)", fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            Variable cible Fit
          </div>
          <code style={{
            color: "#6ee7b7", fontSize: 12, fontFamily: "monospace",
            background: "rgba(52,211,153,0.08)", padding: "3px 8px", borderRadius: 6
          }}>
            Fit = (Attrition = No) AND (PercentSalaryHike ≥ 15) AND (JobInvolvement ≥ 3)
          </code>
          <div style={{ color: "rgba(232,237,245,0.3)", fontSize: 11, marginTop: 4 }}>
            Fit=1 : 384 employés (26.1%) · Fit=0 : 1 086 (73.9%) · SMOTE pour rééquilibrer
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <FormCard title="Informations personnelles & poste">
          <FormField label={LWithCol("Age")} id="Age" min={18} max={65} value={form.Age} onChange={set("Age")} />
          <FormField label={LWithCol("JobLevel")} id="JobLevel" min={1} max={5} value={form.JobLevel} onChange={set("JobLevel")} />
          <FormField label={LWithCol("MonthlyIncome")} id="MonthlyIncome" min={1000} max={20000} step={100} value={form.MonthlyIncome} onChange={set("MonthlyIncome")} />
          <FormField label={LWithCol("YearsAtCompany")} id="YearsAtCompany" min={0} max={40} value={form.YearsAtCompany} onChange={set("YearsAtCompany")} />
          <FormField label={LWithCol("YearsInCurrentRole")} id="YearsInCurrentRole" min={0} max={18} value={form.YearsInCurrentRole} onChange={set("YearsInCurrentRole")} />
          <FormField label={LWithCol("TotalWorkingYears")} id="TotalWorkingYears" min={0} max={40} value={form.TotalWorkingYears} onChange={set("TotalWorkingYears")} />
          <FormField label={LWithCol("TrainingTimesLastYear")} id="TrainingTimesLastYear" min={0} max={6} value={form.TrainingTimesLastYear} onChange={set("TrainingTimesLastYear")} />
        </FormCard>

        <div>
          <FormCard title="Indicateurs de satisfaction" accent="#6366f1">
            {["JobSatisfaction", "EnvironmentSatisfaction", "WorkLifeBalance", "PerformanceRating"].map(key => (
              <RatingButtons
                key={key}
                label={LWithCol(key)}
                fieldKey={key}
                value={form[key]}
                onChange={set(key)}
                color="#6366f1"
              />
            ))}
          </FormCard>

      <SubmitButton loading={loading} label="Prédire la compatibilité" onClick={handleSubmit} />

          {/* Métriques dynamiques après prédiction */}
          {result && !error && (
            <div style={{
              marginTop: "1rem",
              background: "rgba(129,140,248,0.06)",
              border: "1px solid rgba(129,140,248,0.15)",
              borderRadius: 12, padding: "1rem 1.25rem"
            }}>
              <div style={{
                color: "var(--text3)", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10
              }}>Résultat de cette prédiction</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Probabilité Fit=1", value: `${(result.probability * 100).toFixed(1)}%`, color: result.fit === 1 ? "#34d399" : "#fb7185" },
                  { label: "Décision",          value: result.fit === 1 ? "Compatible" : "Non compatible", color: result.fit === 1 ? "#34d399" : "#fb7185" },
                  { label: "Algorithme",        value: "KNN (k=3)",    color: "#818cf8" },
                  { label: "Mode",              value: result.mode === "model" ? "Vrai modèle ✅" : "Simulation", color: result.mode === "model" ? "#34d399" : "#fbbf24" },
                ].map(m => (
                  <div key={m.label} style={{
                    background: "var(--card-bg)",
                    borderRadius: 8, padding: "7px 10px",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <span style={{ color: "var(--text3)", fontSize: 11 }}>{m.label}</span>
                    <span style={{ color: m.color, fontWeight: 700, fontSize: 12 }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <ErrorBox message={error} />}

          {result && !error && (
            <ResultBox color={result.fit === 1 ? "#22c55e" : "#ef4444"}>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>
                  {result.fit === 1 ? "✅" : "❌"}
                </div>
                <div style={{
                  fontSize: "1.5rem", fontWeight: 800,
                  color: result.fit === 1 ? "#4ade80" : "#f87171"
                }}>
                  {result.fit === 1 ? "Compatible" : "Non compatible"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 4 }}>
                  Fit = {result.fit}
                </div>
              </div>

              {/* Probability bar */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Probabilité de compatibilité</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{(result.probability * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 10 }}>
                  <div style={{
                    height: "100%", borderRadius: 10,
                    width: `${result.probability * 100}%`,
                    background: result.fit === 1
                      ? "linear-gradient(90deg, #22c55e, #4ade80)"
                      : "linear-gradient(90deg, #ef4444, #f87171)",
                    transition: "width 0.6s ease"
                  }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {Object.entries(result.features).slice(0, 6).map(([k, v]) => (
                  <div key={k} style={{
                    background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 12px"
                  }}>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{LABELS[k]?.fr || k}</div>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{v}</div>
                  </div>
                ))}
              </div>
            </ResultBox>
          )}
        </div>
      </div>
    </div>
  );
}
