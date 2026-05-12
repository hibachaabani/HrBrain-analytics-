import { useState } from "react";
import { PageHeader, FormCard, FormField, RatingButtons, SubmitButton, ErrorBox, EmptyState } from "../components/UI";

const DEFAULTS = {
  JobLevel: 3, YearsAtCompany: 6, YearsInCurrentRole: 4,
  TotalWorkingYears: 10, TrainingTimesLastYear: 3,
  JobSatisfaction: 4, PerformanceRating: 4, top_n: 5
};

const LABELS = {
  JobLevel:              { fr: "Niveau de poste cible (1–5)",      col: "JobLevel" },
  YearsAtCompany:        { fr: "Années en entreprise",             col: "YearsAtCompany" },
  YearsInCurrentRole:    { fr: "Années dans le rôle actuel",       col: "YearsInCurrentRole" },
  TotalWorkingYears:     { fr: "Expérience totale",                col: "TotalWorkingYears" },
  TrainingTimesLastYear: { fr: "Formations (dernière année)",      col: "TrainingTimesLastYear" },
  JobSatisfaction:       { fr: "Satisfaction au travail (1–4)",    col: "JobSatisfaction" },
  PerformanceRating:     { fr: "Note de performance (1–4)",        col: "PerformanceRating" },
};

const LWithCol = (key) => (
  <span>
    {LABELS[key].fr}
    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginLeft: 6 }}>
      [{LABELS[key].col}]
    </span>
  </span>
);

export default function Recommandation({ apiUrl }) {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/recommend`, {
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
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 2rem" }}>
      <PageHeader
        icon="⭐" title="DSO 3 — Recommandation par similarité"
        subtitle="Trouver les employés les plus compatibles avec un profil cible"
        badge="Cosine Similarity" badgeColor="#f59e0b"
      />

      {/* Algo info */}
      <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Algorithme",    value: "Cosine Similarity",       color: "#fbbf24" },
          { label: "Espace",        value: "Vecteurs normalisés (7D)", color: "#f59e0b" },
          { label: "Normalisation", value: "StandardScaler",          color: "#34d399" },
          { label: "Dataset",       value: "1 470 vecteurs employés", color: "#38bdf8" },
          { label: "Score",         value: "∈ [0, 1] · 1 = identique",color: "#818cf8" },
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

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "1.5rem" }}>
        <div>
          <FormCard title="Profil d'activité cible">
            {Object.keys(DEFAULTS).filter(k => k !== "top_n").map(key => (
              key === "JobSatisfaction" || key === "PerformanceRating" ? (
                <RatingButtons
                  key={key}
                  label={LWithCol(key)}
                  fieldKey={key}
                  value={form[key]}
                  onChange={set(key)}
                  color="#f59e0b"
                />
              ) : (
                <FormField
                  key={key} label={LWithCol(key)} id={key}
                  min={0} max={key === "JobLevel" ? 5 : 40}
                  value={form[key]} onChange={set(key)}
                />
              )
            ))}

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 500 }}>
                Nombre de recommandations (Top-N)
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                {[3, 5, 10].map(v => (
                  <button
                    key={v} onClick={() => set("top_n")(v)}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 8,
                      background: form.top_n === v ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.04)",
                      border: form.top_n === v ? "1px solid rgba(245,158,11,0.6)" : "1px solid rgba(255,255,255,0.08)",
                      color: form.top_n === v ? "#fcd34d" : "rgba(255,255,255,0.4)",
                      fontWeight: form.top_n === v ? 600 : 400, cursor: "pointer", fontSize: 14
                    }}
                  >Top-{v}</button>
                ))}
              </div>
            </div>

            <SubmitButton loading={loading} label="Trouver les candidats" color="#f59e0b" onClick={handleSubmit} />
          </FormCard>
        </div>

        <div>
          {error && <ErrorBox message={error} />}

          {result && !error && (
            <div>
              {/* Summary stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.25rem" }}>
                {[
                  { label: "Score Top-1", value: result.results[0]?.score.toFixed(4) },
                  { label: "Score moyen", value: result.avg_score.toFixed(4) },
                  { label: "Employés Fit=1", value: `${result.fit_count}/${result.top_n}` },
                ].map(s => (
                  <div key={s.label} style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 12, padding: "1rem", textAlign: "center"
                  }}>
                    <div style={{ color: "#fcd34d", fontWeight: 800, fontSize: "1.3rem" }}>{s.value}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Results list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.results.map((r, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${r.fit === 1 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12, padding: "1rem 1.25rem",
                  }}>
                    {/* Ligne principale */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: i === 0 ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${i === 0 ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.1)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, color: i === 0 ? "#fcd34d" : "rgba(255,255,255,0.4)",
                        fontSize: 15, flexShrink: 0
                      }}>#{r.rank}</div>

                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
                          Employé #{r.employee_id}
                          {r.details?.JobRole && (
                            <span style={{ color: "#f59e0b", fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                              {r.details.JobRole}
                            </span>
                          )}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>
                          {r.details?.Department || "Similarité cosinus"}
                        </div>
                      </div>

                      {/* Score bar */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Score</span>
                          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{r.score.toFixed(4)}</span>
                        </div>
                        <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                          <div style={{
                            height: "100%", borderRadius: 10,
                            width: `${Math.min(Math.max((r.score - 0.5) / 0.5, 0), 1) * 100}%`,
                            background: i === 0
                              ? "linear-gradient(90deg, #f59e0b, #fcd34d)"
                              : "linear-gradient(90deg, #6366f1, #818cf8)"
                          }} />
                        </div>
                      </div>

                      <div style={{
                        padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: r.fit === 1 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${r.fit === 1 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.2)"}`,
                        color: r.fit === 1 ? "#4ade80" : "#f87171",
                        flexShrink: 0
                      }}>
                        {r.fit === 1 ? "✅ Fit=1" : "❌ Fit=0"}
                      </div>
                    </div>

                    {/* Détails réels du CSV */}
                    {r.details && Object.keys(r.details).length > 0 && (
                      <div style={{
                        marginTop: "0.75rem",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex", gap: 16, flexWrap: "wrap"
                      }}>
                        {[
                          { label: "Âge",        value: r.details.Age },
                          { label: "Niveau",      value: `L${r.details.JobLevel}` },
                          { label: "Salaire",     value: r.details.MonthlyIncome ? `$${r.details.MonthlyIncome.toLocaleString()}` : null },
                          { label: "Ancienneté",  value: r.details.YearsAtCompany ? `${r.details.YearsAtCompany} ans` : null },
                          { label: "Expérience",  value: r.details.TotalWorkingYears ? `${r.details.TotalWorkingYears} ans` : null },
                          { label: "Performance", value: r.details.PerformanceRating ? `⭐ ${r.details.PerformanceRating}/4` : null },
                        ].filter(d => d.value).map(d => (
                          <div key={d.label}>
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{d.label} </span>
                            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }}>{d.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!result && !error && (
            <EmptyState icon="⭐" text={"Définissez le profil d'activité cible et lancez la recherche de candidats similaires"} />
          )}
        </div>
      </div>
    </div>
  );
}
