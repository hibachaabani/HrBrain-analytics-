import { useState, useEffect } from "react";
import Home           from "./pages/Home";
import Classification from "./pages/Classification";
import Clustering     from "./pages/Clustering";
import Recommandation from "./pages/Recommandation";
import Dashboard      from "./pages/Dashboard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const NAV = [
  { id: "home",           label: "Accueil"        },
  { id: "dashboard",      label: "Dashboard"      },
  { id: "classification", label: "Classification" },
  { id: "clustering",     label: "Clustering"     },
  { id: "recommandation", label: "Recommandation" },
];

export default function App() {
  const [page,      setPage]      = useState("home");
  const [apiStatus, setApiStatus] = useState(null);
  const [scrolled,  setScrolled]  = useState(false);
  const [dark,      setDark]      = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then(r => r.json())
      .then(() => setApiStatus(true))
      .catch(() => setApiStatus(false));
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navigate = (id) => {
    setPage(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navBg = dark
    ? (scrolled ? "rgba(14,17,23,0.92)" : "rgba(14,17,23,0.5)")
    : (scrolled ? "rgba(244,246,251,0.95)" : "rgba(244,246,251,0.7)");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", transition: "background 0.3s" }}>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 300,
        background: navBg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 2rem",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", height: 66
        }}>

          {/* Logo */}
          <div onClick={() => navigate("home")} style={{
            cursor: "pointer", display: "flex", alignItems: "center", gap: 11, userSelect: "none"
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 19, flexShrink: 0,
              boxShadow: "0 4px 20px rgba(99,102,241,0.45)"
            }}>🧠</div>
            <div>
              <div style={{ color: "var(--text)", fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                TalentIQ
              </div>
              <div style={{ color: "var(--text3)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                HR Analytics
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
            {NAV.map(n => {
              const active = page === n.id;
              return (
                <button key={n.id} onClick={() => navigate(n.id)} style={{
                  background: active ? "rgba(99,102,241,0.12)" : "transparent",
                  border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                  borderRadius: 9, padding: "7px 15px",
                  color: active ? "#818cf8" : "var(--text2)",
                  cursor: "pointer", fontSize: 13.5,
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s", letterSpacing: "0.01em"
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--text2)"; }}
                >{n.label}</button>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* API status */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "var(--card-bg)", border: "1px solid var(--border)",
              borderRadius: 100, padding: "5px 14px"
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: apiStatus === true ? "#10b981" : apiStatus === false ? "#f43f5e" : "#6b7280",
                animation: apiStatus === true ? "pulse-dot 2s ease infinite" : "none"
              }} />
              <span style={{
                fontSize: 11.5, fontWeight: 500,
                color: apiStatus === true ? "#10b981" : apiStatus === false ? "#f43f5e" : "var(--text3)"
              }}>
                {apiStatus === true ? "Système actif" : apiStatus === false ? "API hors ligne" : "Connexion…"}
              </span>
            </div>

            {/* Toggle Dark / Light */}
            <button
              onClick={() => setDark(d => !d)}
              title={dark ? "Mode clair" : "Mode sombre"}
              style={{
                width: 44, height: 26, borderRadius: 100,
                background: dark ? "rgba(99,102,241,0.25)" : "rgba(251,191,36,0.2)",
                border: dark ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(251,191,36,0.4)",
                cursor: "pointer", position: "relative",
                transition: "all 0.25s ease", flexShrink: 0, padding: 0
              }}
            >
              <span style={{
                position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)",
                fontSize: 11, opacity: dark ? 0 : 1, transition: "opacity 0.2s"
              }}>☀️</span>
              <span style={{
                position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                fontSize: 11, opacity: dark ? 1 : 0, transition: "opacity 0.2s"
              }}>🌙</span>
              <div style={{
                position: "absolute", top: 4,
                left: dark ? 4 : 22,
                width: 16, height: 16, borderRadius: "50%",
                background: dark
                  ? "linear-gradient(135deg, #818cf8, #6366f1)"
                  : "linear-gradient(135deg, #fbbf24, #f59e0b)",
                boxShadow: dark ? "0 2px 6px rgba(99,102,241,0.5)" : "0 2px 6px rgba(251,191,36,0.5)",
                transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.25s"
              }} />
            </button>

            {/* CTA */}
            <button onClick={() => navigate("dashboard")} style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none", borderRadius: 10, padding: "8px 20px",
              color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
              boxShadow: "0 4px 18px rgba(99,102,241,0.4)",
              transition: "all 0.2s", letterSpacing: "0.01em"
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(99,102,241,0.6)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(99,102,241,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >Dashboard →</button>
          </div>
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────────────── */}
      <main>
        {page === "home"           && <Home onNavigate={navigate} />}
        {page === "dashboard"      && <Dashboard apiUrl={API_URL} />}
        {page === "classification" && <Classification apiUrl={API_URL} />}
        {page === "clustering"     && <Clustering apiUrl={API_URL} />}
        {page === "recommandation" && <Recommandation apiUrl={API_URL} />}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "2.5rem 2rem", marginTop: "5rem" }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
            }}>🧠</div>
            <span style={{ color: "var(--text3)", fontSize: 13 }}>TalentIQ — HR Analytics Platform</span>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {["IBM HR Dataset", "1 470 employés", "3 modèles ML", "ESPRIT 2025–2026"].map(item => (
              <span key={item} style={{ color: "var(--text4)", fontSize: 12 }}>{item}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
