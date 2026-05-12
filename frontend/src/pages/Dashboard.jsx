import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from "recharts";

const COLORS = {
  purple: "#6366f1",
  blue:   "#0ea5e9",
  green:  "#22c55e",
  amber:  "#f59e0b",
  red:    "#ef4444",
  violet: "#a855f7",
};

const CLUSTER_COLORS = ["#22c55e", "#0ea5e9", "#f59e0b", "#a855f7"];
const CLUSTER_NAMES  = ["Junior", "Mid-Level", "Senior", "Expert"];
const CLUSTER_EMOJI  = ["🌱", "📈", "⭐", "🏆"];

// ── Tooltip personnalisé ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e2130", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10, padding: "10px 14px", fontSize: 13
    }}>
      <p style={{ color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#fff", fontWeight: 700, margin: 0 }}>
          {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ── Carte stat ────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = COLORS.purple }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${color}33`,
    borderRadius: 14, padding: "1.25rem 1.5rem",
    display: "flex", alignItems: "center", gap: 16
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
      background: color + "22", border: `1px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
    }}>{icon}</div>
    <div>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", lineHeight: 1 }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 3 }}>{label}</div>
      {sub && <div style={{ color: color, fontSize: 12, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

// ── Titre de section ──────────────────────────────────────────────
const SectionTitle = ({ title, sub }) => (
  <div style={{ marginBottom: "1.25rem" }}>
    <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", margin: 0 }}>{title}</h2>
    {sub && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

// ── Carte graphique ───────────────────────────────────────────────
const ChartCard = ({ children, title, sub, style = {} }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: "1.5rem", ...style
  }}>
    {title && (
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{title}</div>
        {sub && <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 3 }}>{sub}</div>}
      </div>
    )}
    {children}
  </div>
);

export default function Dashboard({ apiUrl }) {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/dataset/stats`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => { setError("Impossible de charger les données"); setLoading(false); });
  }, [apiUrl]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      height: "60vh", color: "rgba(255,255,255,0.4)", fontSize: 15 }}>
      <span style={{ marginRight: 10 }}>⏳</span> Chargement des données…
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      height: "60vh", color: "#f87171", fontSize: 15 }}>
      ⚠️ {error}
    </div>
  );

  // ── Données pour les graphiques ───────────────────────────────

  // Fit distribution
  const fitData = [
    { name: "Compatible (Fit=1)", value: stats.fit_distribution["1"] || stats.fit_distribution[1] || 0, color: COLORS.green },
    { name: "Non compatible (Fit=0)", value: stats.fit_distribution["0"] || stats.fit_distribution[0] || 0, color: COLORS.red },
  ];
  const fitTotal = fitData.reduce((s, d) => s + d.value, 0);

  // Clusters
  const clusterData = Object.entries(stats.cluster_stats || {}).map(([id, c]) => ({
    name:   c.label || CLUSTER_NAMES[id],
    emoji:  CLUSTER_EMOJI[id] || "●",
    count:  c.count,
    income: c.avg_income,
    years:  c.avg_years,
    age:    c.avg_age,
    color:  CLUSTER_COLORS[id],
  })).sort((a, b) => a.income - b.income);

  // Départements
  const deptData = Object.entries(stats.departments || {}).map(([name, count]) => ({
    name: name.replace("Research & Development", "R&D"),
    count,
    pct: Math.round(count / stats.total_employees * 100),
  })).sort((a, b) => b.count - a.count);

  // Top postes
  const roleData = Object.entries(stats.job_roles || {}).slice(0, 6).map(([name, count]) => ({
    name: name.length > 22 ? name.slice(0, 20) + "…" : name,
    count,
  })).sort((a, b) => b.count - a.count);

  // Distribution âge (données réelles du notebook)
  const ageData = [
    { range: "18–25", count: 115 },
    { range: "26–30", count: 263 },
    { range: "31–35", count: 343 },
    { range: "36–40", count: 276 },
    { range: "41–45", count: 192 },
    { range: "46–50", count: 130 },
    { range: "51–60", count: 143 },
  ];

  // Satisfaction (données réelles)
  const satisfactionData = [
    { level: "1 — Faible",  JobSat: 289, WorkLife: 80,  EnvSat: 284 },
    { level: "2 — Moyen",   JobSat: 280, WorkLife: 344, EnvSat: 287 },
    { level: "3 — Bon",     JobSat: 442, WorkLife: 893, EnvSat: 453 },
    { level: "4 — Excellent",JobSat: 459, WorkLife: 153, EnvSat: 446 },
  ];

  // Radar profil moyen par cluster
  const radarData = clusterData.map(c => ({
    cluster: `${c.emoji} ${c.name}`,
    Salaire:  Math.round(c.income / 1000 * 10) / 10,
    Ancienneté: c.years,
    Âge:      c.age,
  }));

  const attritionRate = Math.round(237 / stats.total_employees * 100 * 10) / 10;
  const fitRate       = Math.round((fitData[0].value / fitTotal) * 100 * 10) / 10;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 2rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
          }}>📊</div>
          <div>
            <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", margin: 0 }}>
              Dashboard — Analyse RH
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
              IBM HR Analytics · {stats.total_employees.toLocaleString()} employés · données réelles
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: "2.5rem" }}>
        <StatCard icon="👥" label="Employés total" value={stats.total_employees.toLocaleString()} color={COLORS.purple} />
        <StatCard icon="✅" label="Taux de compatibilité" value={`${fitRate}%`} sub={`${fitData[0].value} employés Fit=1`} color={COLORS.green} />
        <StatCard icon="📉" label="Taux d'attrition" value={`${attritionRate}%`} sub="237 départs" color={COLORS.red} />
        <StatCard icon="💰" label="Salaire moyen" value={`$${stats.avg_monthly_income.toLocaleString()}`} sub={`Ancienneté moy. ${stats.avg_years_company} ans`} color={COLORS.amber} />
      </div>

      {/* Ligne 1 : Fit + Attrition + Départements */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 16, marginBottom: 16 }}>

        {/* Pie Fit */}
        <ChartCard title="Distribution Fit" sub="Variable cible DSO1">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={fitData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}>
                {fitData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip suffix=" emp." />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {fitData.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{d.name}</span>
                </div>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                  {d.value} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
                    ({Math.round(d.value / fitTotal * 100)}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Pie Overtime */}
        <ChartCard title="Heures supplémentaires" sub="OverTime — impact sur l'attrition">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: "Sans heures sup.", value: 1054, color: COLORS.blue },
                  { name: "Avec heures sup.", value: 416,  color: COLORS.amber },
                ]}
                cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}
              >
                {[COLORS.blue, COLORS.amber].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip content={<CustomTooltip suffix=" emp." />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {[
              { name: "Sans heures sup.", value: 1054, color: COLORS.blue },
              { name: "Avec heures sup.", value: 416,  color: COLORS.amber },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{d.name}</span>
                </div>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                  {d.value} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
                    ({Math.round(d.value / 1470 * 100)}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Barres départements */}
        <ChartCard title="Répartition par département" sub="Effectifs et taux d'attrition">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
            {[
              { name: "R&D",            count: 961, attrition: 13.8, color: COLORS.blue },
              { name: "Sales",          count: 446, attrition: 20.6, color: COLORS.amber },
              { name: "Human Resources",count: 63,  attrition: 19.0, color: COLORS.violet },
            ].map(d => (
              <div key={d.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500 }}>{d.name}</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{d.count} emp.</span>
                    <span style={{ color: COLORS.red, fontSize: 12 }}>⚠️ {d.attrition}% attrition</span>
                  </div>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                  <div style={{
                    height: "100%", borderRadius: 10,
                    width: `${Math.round(d.count / 961 * 100)}%`,
                    background: `linear-gradient(90deg, ${d.color}, ${d.color}99)`
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Performance Rating */}
          <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Performance Rating
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Rating 3", value: 1244, pct: 85, color: COLORS.blue },
                { label: "Rating 4", value: 226,  pct: 15, color: COLORS.green },
              ].map(d => (
                <div key={d.label} style={{
                  flex: 1, background: d.color + "15", border: `1px solid ${d.color}33`,
                  borderRadius: 10, padding: "10px 12px", textAlign: "center"
                }}>
                  <div style={{ color: d.color, fontWeight: 800, fontSize: 18 }}>{d.pct}%</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{d.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{d.value} emp.</div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Ligne 2 : Distribution âge + Top postes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Histogramme âge */}
        <ChartCard title="Distribution de l'âge" sub={`Âge moyen : ${stats.avg_age} ans · min 18 · max 60`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ageData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip suffix=" emp." />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {ageData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${230 + i * 8}, 70%, ${50 + i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top postes */}
        <ChartCard title="Top 6 postes" sub="Effectifs par rôle">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roleData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={140}
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip suffix=" emp." />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {roleData.map((_, i) => (
                  <Cell key={i} fill={Object.values(COLORS)[i % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Ligne 3 : Clusters */}
      <SectionTitle title="DSO 2 — Profils RH (K-Means K=4)" sub="Caractéristiques moyennes réelles par cluster" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
        {clusterData.map((c, i) => (
          <div key={i} style={{
            background: c.color + "11", border: `1px solid ${c.color}33`,
            borderRadius: 14, padding: "1.25rem"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{c.emoji}</div>
            <div style={{ color: c.color, fontWeight: 800, fontSize: "1.1rem", marginBottom: 12 }}>{c.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Employés",    value: `${c.count}` },
                { label: "Salaire moy.", value: `$${c.income?.toLocaleString()}` },
                { label: "Expérience",  value: `${c.years} ans` },
                { label: "Âge moyen",   value: `${c.age} ans` },
              ].map(d => (
                <div key={d.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{d.label}</span>
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>{d.value}</span>
                </div>
              ))}
            </div>
            {/* Mini barre proportion */}
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                <div style={{
                  height: "100%", borderRadius: 10,
                  width: `${Math.round(c.count / stats.total_employees * 100)}%`,
                  background: c.color
                }} />
              </div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 4, textAlign: "right" }}>
                {Math.round(c.count / stats.total_employees * 100)}% du dataset
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ligne 4 : Salaire par cluster + Satisfaction */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Salaire par cluster */}
        <ChartCard title="Salaire moyen par cluster" sub="En dollars / mois">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clusterData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip prefix="$" suffix=" /mois" />} />
              <Bar dataKey="income" radius={[6, 6, 0, 0]}>
                {clusterData.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Satisfaction */}
        <ChartCard title="Niveaux de satisfaction" sub="JobSatisfaction · WorkLifeBalance · EnvironmentSatisfaction">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={satisfactionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="level" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip suffix=" emp." />} />
              <Bar dataKey="JobSat"   name="Satisfaction travail"  fill={COLORS.purple} radius={[3,3,0,0]} />
              <Bar dataKey="WorkLife" name="Équilibre vie/travail" fill={COLORS.blue}   radius={[3,3,0,0]} />
              <Bar dataKey="EnvSat"   name="Satisfaction env."     fill={COLORS.green}  radius={[3,3,0,0]} />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Ligne 5 : Area chart expérience par cluster */}
      <ChartCard
        title="Expérience & âge moyen par profil RH"
        sub="Comparaison des 4 clusters sur les dimensions clés"
        style={{ marginBottom: 16 }}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={[
              ...clusterData.map(c => ({ name: `${c.emoji} ${c.name}`, Expérience: c.years, Âge: c.age, color: c.color }))
            ]}
            margin={{ top: 5, right: 30, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} unit=" ans" />
            <Tooltip content={<CustomTooltip suffix=" ans" />} />
            <Bar dataKey="Expérience" fill={COLORS.blue}   radius={[4,4,0,0]} />
            <Bar dataKey="Âge"        fill={COLORS.amber}  radius={[4,4,0,0]} />
            <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Footer note */}
      <div style={{
        textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: "2rem"
      }}>
        Données : IBM HR Analytics Dataset · {stats.total_employees} employés · 35 variables
      </div>
    </div>
  );
}
