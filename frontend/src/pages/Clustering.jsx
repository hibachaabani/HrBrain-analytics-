import { useState } from "react";
import { PageHeader, FormCard, FormField, RatingButtons, SubmitButton, ResultBox, ErrorBox, EmptyState } from "../components/UI";

const DEFAULTS = {
  YearsAtCompany: 5, JobLevel: 2, MonthlyIncome: 6000,
  TotalWorkingYears: 10, Age: 35, JobSatisfaction: 3, PerformanceRating: 3
};

const LABELS = {
  YearsAtCompany:    { fr: "Années dans l'entreprise",      col: "YearsAtCompany" },
  JobLevel:          { fr: "Niveau de poste (1–5)",         col: "JobLevel" },
  MonthlyIncome:     { fr: "Salaire mensuel ($)",           col: "MonthlyIncome" },
  TotalWorkingYears: { fr: "Années d'expérience totale",    col: "TotalWorkingYears" },
  Age:               { fr: "Âge",                          col: "Age" },
  JobSatisfaction:   { fr: "Satisfaction au travail (1–4)", col: "JobSatisfaction" },
  PerformanceRating: { fr: "Note de performance (1–4)",     col: "PerformanceRating" },
};

const LWithCol = (key) => (
  <span>
    {LABELS[key].fr}
    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginLeft: 6 }}>
      [{LABELS[key].col}]
    </span>
  </span>
);

const CLUSTER_INFO = {
  0: { label: "Junior", emoji: "🌱", color: "#22c55e", range: "< 3 ans exp. / < 3 500$ /mois" },
  1: { label: "Mid-Level", emoji: "📈", color: "#0ea5e9", range: "3-8 ans exp. / 3 500-7 000$ /mois" },
  2: { label: "Senior", emoji: "⭐", color: "#f59e0b", range: "8-15 ans exp. / 7 000-12 000$ /mois" },
  3: { label: "Expert", emoji: "🏆", color: "#a855f7", range: "> 15 ans exp. / > 12 000$ /mois" },
};

export default function Clustering({ apiUrl }) {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/cluster`, {
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
        icon="🔵" title="DSO 2 — Clustering K-Means"
        subtitle="Identifier le profil RH d'un employé parmi 4 clusters"
        badge="K = 4" badgeColor="#0ea5e9"
      />

      {/* Algo info */}
      <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Algorithme retenu", value: "K-Means (K=4)",          color: "#38bdf8" },
          { label: "Comparé à",         value: "DBSCAN (eps auto=1.413)", color: "#818cf8" },
          { label: "Choix de K",        value: "Méthode du coude (Elbow)",color: "#fbbf24" },
          { label: "Normalisation",     value: "StandardScaler",          color: "#34d399" },
          { label: "Labels",            value: "Basés sur salaire moyen", color: "#a78bfa" },
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

      {/* Clusters overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "2rem" }}>
        {Object.entries(CLUSTER_INFO).map(([id, c]) => (
          <div key={id} style={{
            background: c.color + "11", border: `1px solid ${c.color}33`,
            borderRadius: 12, padding: "12px",
            ...(result?.cluster === parseInt(id) ? {
              background: c.color + "22", border: `2px solid ${c.color}88`
            } : {})
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{c.emoji}</div>
            <div style={{ color: c.color, fontWeight: 700, fontSize: 14 }}>{c.label}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 3 }}>{c.range}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <FormCard title="Caractéristiques de l'employé">
          {Object.keys(DEFAULTS).map(key => (
            key === "PerformanceRating" || key === "JobSatisfaction" ? (
              <RatingButtons
                key={key}
                label={LWithCol(key)}
                fieldKey={key}
                value={form[key]}
                onChange={set(key)}
                color="#0ea5e9"
              />
            ) : (
              <FormField
                key={key} label={LWithCol(key)} id={key}
                min={key === "MonthlyIncome" ? 1000 : key === "Age" ? 18 : 0}
                max={key === "MonthlyIncome" ? 20000 : key === "JobLevel" ? 5 : key === "Age" ? 65 : 40}
                step={key === "MonthlyIncome" ? 100 : 1}
                value={form[key]} onChange={set(key)}
              />
            )
          ))}
          <SubmitButton loading={loading} label="Identifier le cluster" color="#0ea5e9" onClick={handleSubmit} />

          {/* Métriques dynamiques après prédiction */}
          {result && !error && (
            <div style={{
              marginTop: "1rem",
              background: "rgba(56,189,248,0.06)",
              border: "1px solid rgba(56,189,248,0.15)",
              borderRadius: 12, padding: "1rem 1.25rem"
            }}>
              <div style={{
                color: "var(--text3)", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10
              }}>Résultat de cette analyse</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Cluster assigné",  value: result.label,                                    color: "#38bdf8" },
                  { label: "Cluster #",         value: `Cluster ${result.cluster}`,                    color: "#818cf8" },
                  { label: "Mode",              value: result.mode === "model" ? "Vrai modèle ✅" : "Simulation", color: result.mode === "model" ? "#34d399" : "#fbbf24" },
                  { label: "Algorithme",        value: "K-Means (K=4)",                                color: "#38bdf8" },
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
        </FormCard>

        <div>
          {error && <ErrorBox message={error} />}

          {result && !error && (() => {
            const info = CLUSTER_INFO[result.cluster];
            return (
              <ResultBox color={info.color}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>{info.emoji}</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: info.color }}>
                    {info.label}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 4 }}>
                    Cluster #{result.cluster}
                  </div>
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "1rem",
                  marginBottom: "1.25rem"
                }}>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    {result.description}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 8 }}>
                    FOURCHETTE TYPIQUE
                  </div>
                  <div style={{ color: info.color, fontSize: 14, fontWeight: 500 }}>
                    {info.range}
                  </div>
                </div>

                {/* Visual cluster bar */}
                <div style={{ marginTop: "1.5rem" }}>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 10 }}>
                    POSITION DANS LA HIÉRARCHIE
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {Object.entries(CLUSTER_INFO).map(([id]) => (
                      <div key={id} style={{
                        flex: 1, height: 6, borderRadius: 4,
                        background: parseInt(id) <= result.cluster ? info.color : "rgba(255,255,255,0.08)"
                      }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>Junior</span>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>Expert</span>
                  </div>
                </div>
              </ResultBox>
            );
          })()}

          {!result && !error && (
            <EmptyState icon="🔵" text={'Remplissez le formulaire et cliquez sur "Identifier le cluster"'} />
          )}
        </div>
      </div>
    </div>
  );
}
