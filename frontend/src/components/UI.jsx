// ── TalentIQ Design System ────────────────────────────────────────

export function PageHeader({ icon, title, subtitle, badge, badgeColor = "#818cf8" }) {
  return (
    <div style={{ marginBottom: "2.5rem" }} className="fade-up">
      <div style={{ marginBottom: "1.25rem" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: badgeColor,
          background: badgeColor + "1a", border: `1px solid ${badgeColor}40`,
          borderRadius: 100, padding: "4px 14px"
        }}>{badge}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 15, flexShrink: 0,
          background: `linear-gradient(135deg, ${badgeColor}28, ${badgeColor}0e)`,
          border: `1px solid ${badgeColor}38`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, boxShadow: `0 8px 28px ${badgeColor}1a`
        }}>{icon}</div>
        <div>
          <h1 style={{
            color: "var(--text)", fontWeight: 800, fontSize: "1.55rem",
            margin: 0, letterSpacing: "-0.025em", lineHeight: 1.2
          }}>{title}</h1>
          <p style={{
            color: "var(--text2)", fontSize: 14,
            margin: "7px 0 0", lineHeight: 1.55, fontWeight: 400
          }}>{subtitle}</p>
        </div>
      </div>
      <div style={{
        height: 1, marginTop: "1.75rem",
        background: `linear-gradient(90deg, ${badgeColor}50, var(--border), transparent)`
      }} />
    </div>
  );
}

export function FormCard({ children, title, accent = "#818cf8" }) {
  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border)",
      borderRadius: 18, padding: "1.75rem",
      marginBottom: "1.25rem",
      boxShadow: "0 2px 20px var(--shadow)",
      transition: "background 0.3s, border-color 0.3s"
    }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: "1.5rem" }}>
          <div style={{
            width: 3, height: 14, borderRadius: 2,
            background: `linear-gradient(180deg, ${accent}, ${accent}80)`
          }} />
          <h3 style={{
            color: "var(--text3)", fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em", margin: 0
          }}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

// ── Champ numérique avec boutons intégrés ───────────────────────
export function FormField({ label, id, min, max, value, onChange, step = 1 }) {
  const dec = () => onChange(Math.max(min ?? -Infinity, value - step));
  const inc = () => onChange(Math.min(max ??  Infinity, value + step));

  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label htmlFor={id} style={{
        display: "block",
        color: "var(--text2)", fontSize: 12.5, fontWeight: 500,
        letterSpacing: "0.01em", marginBottom: 7
      }}>{label}</label>

      <div style={{
        display: "flex", alignItems: "stretch",
        background: "var(--input-bg)",
        border: "1px solid var(--border)",
        borderRadius: 11, overflow: "hidden",
        transition: "border-color 0.2s"
      }}>
        <button
          type="button" onClick={dec}
          disabled={min !== undefined && value <= min}
          style={{
            width: 38, border: "none",
            borderRight: "1px solid var(--border)",
            background: "transparent",
            color: min !== undefined && value <= min ? "var(--text4)" : "var(--text3)",
            fontSize: 16, fontWeight: 400,
            cursor: min !== undefined && value <= min ? "not-allowed" : "pointer",
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >−</button>

        <input
          id={id} type="number" min={min} max={max} value={value} step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{
            flex: 1, border: "none", background: "transparent",
            color: "var(--text)", fontSize: 14, fontWeight: 600,
            textAlign: "center", outline: "none",
            padding: "10px 4px"
          }}
        />

        <button
          type="button" onClick={inc}
          disabled={max !== undefined && value >= max}
          style={{
            width: 38, border: "none",
            borderLeft: "1px solid var(--border)",
            background: "transparent",
            color: max !== undefined && value >= max ? "var(--text4)" : "var(--text3)",
            fontSize: 16, fontWeight: 400,
            cursor: max !== undefined && value >= max ? "not-allowed" : "pointer",
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >+</button>
      </div>
    </div>
  );
}

// ── Select field ─────────────────────────────────────────────────
export function SelectField({ label, id, value, onChange, options }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label htmlFor={id} style={{
        display: "block",
        color: "var(--text2)", fontSize: 12.5, fontWeight: 500,
        letterSpacing: "0.01em", marginBottom: 7
      }}>{label}</label>
      <select
        id={id} value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "10px 14px",
          background: "var(--input-bg)",
          border: "1px solid var(--border)",
          borderRadius: 11, color: "var(--text)",
          fontSize: 14, fontWeight: 500,
          outline: "none", cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center"
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Boutons de notation 1–4 ──────────────────────────────────────
export function RatingButtons({ label, value, onChange, color = "#818cf8" }) {
  const labels4 = ["Faible", "Moyen", "Bon", "Excellent"];

  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: 8
      }}>
        <label style={{
          color: "var(--text2)", fontSize: 12.5, fontWeight: 500,
          letterSpacing: "0.01em"
        }}>{label}</label>
        <span style={{
          color: color, fontSize: 12, fontWeight: 600,
          background: color + "18", border: `1px solid ${color}30`,
          borderRadius: 6, padding: "2px 10px"
        }}>{labels4[value - 1]}</span>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 6
      }}>
        {[1, 2, 3, 4].map(v => (
          <button
            key={v} type="button" onClick={() => onChange(v)}
            style={{
              padding: "9px 0", borderRadius: 9,
              background: value === v
                ? `linear-gradient(135deg, ${color}30, ${color}18)`
                : "var(--input-bg)",
              border: value === v
                ? `1.5px solid ${color}70`
                : "1px solid var(--border)",
              color: value === v ? color : "var(--text3)",
              fontWeight: value === v ? 700 : 400,
              fontSize: 14, cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: value === v ? `0 2px 10px ${color}25` : "none"
            }}
          >{v}</button>
        ))}
      </div>
    </div>
  );
}

// ── Bouton principal ─────────────────────────────────────────────
export function SubmitButton({ loading, label = "Analyser", color = "#6366f1", onClick }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: "100%", padding: "13px",
      background: loading
        ? "var(--card-bg)"
        : `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      border: loading ? "1px solid var(--border)" : "none",
      borderRadius: 12, color: loading ? "var(--text3)" : "#fff",
      fontWeight: 700, fontSize: 14,
      cursor: loading ? "not-allowed" : "pointer",
      transition: "all 0.2s", letterSpacing: "0.02em",
      boxShadow: loading ? "none" : `0 6px 22px ${color}40`,
    }}
    onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = `0 8px 30px ${color}60`; e.currentTarget.style.transform = "translateY(-1px)"; }}}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? "none" : `0 6px 22px ${color}40`; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          <span style={{
            width: 14, height: 14,
            border: "2px solid var(--border)", borderTopColor: "var(--text2)",
            borderRadius: "50%", display: "inline-block",
            animation: "spin 0.75s linear infinite"
          }} />
          Analyse en cours…
        </span>
      ) : label}
    </button>
  );
}

// ── Boîte résultat ───────────────────────────────────────────────
export function ResultBox({ children, color = "#818cf8" }) {
  return (
    <div className="fade-up" style={{
      background: `linear-gradient(135deg, ${color}0f, ${color}07)`,
      border: `1px solid ${color}30`,
      borderRadius: 18, padding: "1.75rem",
      marginTop: "1.25rem",
      boxShadow: `0 8px 36px ${color}12`
    }}>
      {children}
    </div>
  );
}

// ── Erreur ───────────────────────────────────────────────────────
export function ErrorBox({ message }) {
  return (
    <div className="fade-in" style={{
      marginTop: 14, padding: "13px 18px",
      background: "rgba(244,63,94,0.07)",
      border: "1px solid rgba(244,63,94,0.2)",
      borderRadius: 12, color: "#fda4af",
      fontSize: 13, display: "flex", alignItems: "center", gap: 10
    }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

// ── État vide ────────────────────────────────────────────────────
export function EmptyState({ icon, text }) {
  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px dashed var(--border)",
      borderRadius: 18, padding: "3.5rem 2rem",
      textAlign: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 220
    }}>
      <div style={{ fontSize: 44, marginBottom: 16, opacity: 0.2 }}>{icon}</div>
      <p style={{ color: "var(--text3)", fontSize: 14, lineHeight: 1.7, maxWidth: 260, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

// ── Badge inline ─────────────────────────────────────────────────
export function Badge({ label, color = "#818cf8" }) {
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: color,
      background: color + "18", border: `1px solid ${color}30`,
      borderRadius: 6, padding: "2px 9px", display: "inline-block"
    }}>{label}</span>
  );
}

// ── Stat mini card ────────────────────────────────────────────────
export function MiniStat({ label, value, color = "#818cf8", icon }) {
  return (
    <div style={{
      background: "var(--card-bg)",
      border: `1px solid ${color}25`,
      borderRadius: 12, padding: "0.9rem 1.1rem",
      display: "flex", alignItems: "center", gap: 12
    }}>
      {icon && (
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: color + "18", border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17
        }}>{icon}</div>
      )}
      <div>
        <div style={{ color: "var(--text)", fontWeight: 800, fontSize: "1.15rem", lineHeight: 1 }}>{value}</div>
        <div style={{ color: "var(--text3)", fontSize: 11.5, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Info banner ───────────────────────────────────────────────────
export function InfoBanner({ icon, title, desc, code, color = "#34d399" }) {
  return (
    <div style={{
      background: color + "08",
      border: `1px solid ${color}20`,
      borderRadius: 12, padding: "0.9rem 1.25rem",
      marginBottom: "1.5rem",
      display: "flex", alignItems: "flex-start", gap: 12
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        {title && (
          <div style={{ color: "var(--text3)", fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            {title}
          </div>
        )}
        {code && (
          <code style={{
            color: color === "#34d399" ? "#6ee7b7" : color,
            fontSize: 12, fontFamily: "monospace",
            background: color + "10", padding: "3px 8px", borderRadius: 6,
            display: "block", marginBottom: desc ? 4 : 0
          }}>{code}</code>
        )}
        {desc && (
          <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 2 }}>{desc}</div>
        )}
      </div>
    </div>
  );
}

// ── Algo tag strip ────────────────────────────────────────────────
export function AlgoTags({ tags }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
      {tags.map(t => (
        <div key={t.label} style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 10, padding: "7px 14px",
          display: "flex", gap: 8, alignItems: "center"
        }}>
          <span style={{ color: "var(--text3)", fontSize: 11 }}>{t.label}</span>
          <span style={{ color: t.color, fontWeight: 600, fontSize: 12 }}>{t.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = "#818cf8", height = 6, label, showPct = true }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div>
      {(label || showPct) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          {label && <span style={{ color: "var(--text2)", fontSize: 12.5 }}>{label}</span>}
          {showPct && <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 12 }}>{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div style={{ height, background: "var(--border)", borderRadius: 10 }}>
        <div style={{
          height: "100%", borderRadius: 10,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)"
        }} />
      </div>
    </div>
  );
}
