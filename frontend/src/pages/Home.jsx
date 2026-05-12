export default function Home({ onNavigate }) {

  const models = [
    {
      id: "classification",
      emoji: "🎯",
      title: "Classification",
      subtitle: "Prédiction de compatibilité",
      description: "Analysez le profil d'un employé et obtenez une prédiction Fit=0/1 avec probabilité, basée sur 11 variables RH clés.",
      algo: "K-Nearest Neighbors",
      badge: "Supervisé",
      color: "#818cf8",
      tag: "DSO 1",
      metrics: [
        { label: "Variables", value: "11" },
        { label: "Métrique",  value: "F1" },
        { label: "Cible",     value: "Fit" },
      ],
    },
    {
      id: "clustering",
      emoji: "🔵",
      title: "Clustering",
      subtitle: "Segmentation RH",
      description: "Identifiez automatiquement le profil RH d'un employé parmi 4 segments homogènes basés sur l'expérience et le salaire.",
      algo: "K-Means (K=4)",
      badge: "Non supervisé",
      color: "#38bdf8",
      tag: "DSO 2",
      metrics: [
        { label: "Clusters",  value: "4" },
        { label: "Métrique",  value: "Silhouette" },
        { label: "Profils",   value: "RH" },
      ],
    },
    {
      id: "recommandation",
      emoji: "⭐",
      title: "Recommandation",
      subtitle: "Matching par similarité",
      description: "Pour un profil d'activité cible, trouvez les employés les plus compatibles grâce à la similarité cosinus vectorielle.",
      algo: "Cosine Similarity",
      badge: "Recommandation",
      color: "#fbbf24",
      tag: "DSO 3",
      metrics: [
        { label: "Dataset",  value: "1 470" },
        { label: "Score",    value: "Cosinus" },
        { label: "Output",   value: "Top-N" },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div style={{
        textAlign: "center",
        padding: "6rem 0 4.5rem",
        position: "relative"
      }}>
        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: "5%", left: "50%",
          transform: "translateX(-50%)",
          width: 700, height: 350,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 65%)",
          pointerEvents: "none", zIndex: 0
        }} />
        <div style={{
          position: "absolute", top: "30%", left: "15%",
          width: 300, height: 300,
          background: "radial-gradient(ellipse, rgba(56,189,248,0.06) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "10%",
          width: 250, height: 250,
          background: "radial-gradient(ellipse, rgba(167,139,250,0.06) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Pill */}
          <div className="fade-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(129,140,248,0.1)",
            border: "1px solid rgba(129,140,248,0.22)",
            borderRadius: 100, padding: "6px 18px", marginBottom: "2rem"
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#34d399",
              animation: "pulse-dot 2s ease infinite"
            }} />
            <span style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 500 }}>
              IBM HR Analytics · 1 470 employés · Modèles actifs
            </span>
          </div>

          {/* Title */}
          <h1 className="fade-up" style={{
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontWeight: 900, lineHeight: 1.06,
            letterSpacing: "-0.045em",
            marginBottom: "1.5rem", color: "#e8edf5",
            animationDelay: "0.05s"
          }}>
            Intelligence RH<br />
            <span className="gradient-text">augmentée par l'IA</span>
          </h1>

          <p className="fade-up" style={{
            color: "rgba(232,237,245,0.5)", fontSize: "1.1rem",
            maxWidth: 540, margin: "0 auto 2.5rem",
            lineHeight: 1.75, fontWeight: 400,
            animationDelay: "0.1s"
          }}>
            Trois modèles Machine Learning pour classifier, segmenter
            et recommander des profils d'employés en temps réel.
          </p>

          {/* CTAs */}
          <div className="fade-up" style={{
            display: "flex", justifyContent: "center",
            gap: 12, flexWrap: "wrap",
            animationDelay: "0.15s"
          }}>
            <button onClick={() => onNavigate("dashboard")} style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none", borderRadius: 12,
              padding: "13px 30px", color: "#fff",
              fontWeight: 700, fontSize: 15, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(99,102,241,0.45)",
              transition: "all 0.2s", letterSpacing: "0.01em"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.6)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.45)";
            }}
            >Explorer le Dashboard →</button>

            <button onClick={() => onNavigate("classification")} style={{
              background: "rgba(232,237,245,0.06)",
              border: "1px solid rgba(232,237,245,0.14)",
              borderRadius: 12, padding: "13px 30px",
              color: "rgba(232,237,245,0.8)",
              fontWeight: 600, fontSize: 15, cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(232,237,245,0.1)";
              e.currentTarget.style.color = "#e8edf5";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(232,237,245,0.06)";
              e.currentTarget.style.color = "rgba(232,237,245,0.8)";
            }}
            >Tester un modèle</button>
          </div>

          {/* Stats */}
          <div className="fade-up" style={{
            display: "inline-flex", gap: 0,
            marginTop: "4rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, overflow: "hidden",
            animationDelay: "0.2s"
          }}>
            {[
              { value: "1 470", label: "Employés" },
              { value: "35",    label: "Variables" },
              { value: "3",     label: "Modèles ML" },
              { value: "26%",   label: "Taux Fit=1" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "1.25rem 2rem",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                textAlign: "center"
              }}>
                <div style={{
                  color: "#e8edf5", fontWeight: 800,
                  fontSize: "1.6rem", letterSpacing: "-0.03em"
                }}>{s.value}</div>
                <div style={{
                  color: "rgba(232,237,245,0.35)",
                  fontSize: 11.5, marginTop: 3, fontWeight: 500
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Model cards ──────────────────────────────────────────── */}
      <div style={{ marginBottom: "5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{
            color: "#e8edf5", fontWeight: 800, fontSize: "1.7rem",
            letterSpacing: "-0.03em", marginBottom: 8
          }}>Trois modèles, un pipeline complet</h2>
          <p style={{ color: "rgba(232,237,245,0.4)", fontSize: 14 }}>
            Chaque modèle répond à un besoin RH spécifique
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "1.25rem"
        }}>
          {models.map((m, idx) => (
            <div key={m.id} onClick={() => onNavigate(m.id)}
              className="card-hover"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: "2rem",
                cursor: "pointer", position: "relative", overflow: "hidden",
                animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${idx * 0.08}s both`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = m.color + "45";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent 0%, ${m.color}80 40%, ${m.color}80 60%, transparent 100%)`
              }} />

              {/* Corner glow */}
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 120, height: 120,
                background: `radial-gradient(circle, ${m.color}12 0%, transparent 70%)`,
                pointerEvents: "none"
              }} />

              {/* Header */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: "1.5rem"
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `linear-gradient(135deg, ${m.color}22, ${m.color}0c)`,
                  border: `1px solid ${m.color}30`,
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 26
                }}>{m.emoji}</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: m.color,
                    background: m.color + "18", border: `1px solid ${m.color}28`,
                    borderRadius: 100, padding: "3px 10px"
                  }}>{m.tag}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    color: "rgba(232,237,245,0.3)",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 100, padding: "3px 10px"
                  }}>{m.badge}</span>
                </div>
              </div>

              <h3 style={{
                color: "#e8edf5", fontWeight: 800, fontSize: "1.15rem",
                marginBottom: 4, letterSpacing: "-0.02em"
              }}>{m.title}</h3>
              <p style={{
                color: m.color, fontSize: 13, fontWeight: 600,
                marginBottom: 12
              }}>{m.subtitle}</p>
              <p style={{
                color: "rgba(232,237,245,0.42)", fontSize: 13.5,
                lineHeight: 1.65, marginBottom: "1.75rem"
              }}>{m.description}</p>

              {/* Metrics */}
              <div style={{
                display: "flex",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, overflow: "hidden",
                marginBottom: "1.5rem"
              }}>
                {m.metrics.map((mt, i) => (
                  <div key={i} style={{
                    flex: 1, padding: "11px 8px", textAlign: "center",
                    borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none"
                  }}>
                    <div style={{ color: "#e8edf5", fontWeight: 800, fontSize: 15 }}>{mt.value}</div>
                    <div style={{ color: "rgba(232,237,245,0.3)", fontSize: 10, marginTop: 3 }}>{mt.label}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(232,237,245,0.25)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color, display: "inline-block" }} />
                  {m.algo}
                </span>
                <span style={{ color: m.color, fontWeight: 700, fontSize: 13 }}>Accéder →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pipeline ─────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 24, padding: "3rem 2rem",
        marginBottom: "5rem", textAlign: "center",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.08) 0%, transparent 60%)",
          pointerEvents: "none"
        }} />

        <h2 style={{
          color: "#e8edf5", fontWeight: 800, fontSize: "1.4rem",
          letterSpacing: "-0.03em", marginBottom: 8
        }}>Pipeline ML intégré</h2>
        <p style={{ color: "rgba(232,237,245,0.35)", fontSize: 14, marginBottom: "2.5rem" }}>
          Les trois modèles forment un système cohérent de gestion des talents
        </p>

        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 0, flexWrap: "wrap"
        }}>
          {[
            { label: "Segmentation",   sub: "K-Means",  color: "#38bdf8", emoji: "🔵", desc: "Identifier le profil" },
            null,
            { label: "Classification", sub: "KNN",      color: "#818cf8", emoji: "🎯", desc: "Prédire la compatibilité" },
            null,
            { label: "Recommandation", sub: "Cosinus",  color: "#fbbf24", emoji: "⭐", desc: "Trouver les candidats" },
          ].map((s, i) => s ? (
            <div key={i} style={{
              background: `linear-gradient(135deg, ${s.color}14, ${s.color}07)`,
              border: `1px solid ${s.color}28`,
              borderRadius: 16, padding: "1.25rem 2rem", minWidth: 160
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 14 }}>{s.label}</div>
              <div style={{ color: "rgba(232,237,245,0.25)", fontSize: 11, marginTop: 2 }}>{s.sub}</div>
              <div style={{ color: "rgba(232,237,245,0.4)", fontSize: 12, marginTop: 6 }}>{s.desc}</div>
            </div>
          ) : (
            <div key={i} style={{ padding: "0 1.25rem", color: "rgba(232,237,245,0.15)", fontSize: 22 }}>→</div>
          ))}
        </div>
      </div>

    </div>
  );
}
