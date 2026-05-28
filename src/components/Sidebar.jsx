import React, { useState, useEffect } from "react";
import { 
  Activity, 
  BookOpen, 
  Compass, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  Settings,
  BookMarked,
  LayoutDashboard,
  Presentation,
  Flame
} from "lucide-react";
import { getStreak } from "../utils/gamification";
import { openNetlifyLogin, logoutNetlify } from "../utils/netlifySync";

export default function Sidebar({ activeTab, setActiveTab, onOpenSettings, user }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(getStreak());
    const handleStreakChanged = () => setStreak(getStreak());
    window.addEventListener("speakflow_streak_changed", handleStreakChanged);
    return () => window.removeEventListener("speakflow_streak_changed", handleStreakChanged);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Gelişim Paneli", icon: LayoutDashboard, desc: "XP, Görevler & Streak" },
    { id: "diagnostics", label: "Gerçek Teşhis", icon: Activity, desc: "Zihinsel blok & seviye analizi" },
    { id: "grammar", label: "Pratik Gramer", icon: BookOpen, desc: "Görsel cümle kurucu şablonları" },
    { id: "presentation", label: "Sunum Hazırlığı", icon: Presentation, desc: "HTTPS Header Enrichment" },
    { id: "patterns", label: "Konuşma Kalıpları", icon: Compass, desc: "Günlük pratik şablonlar (Chunks)" },
    { id: "expressions", label: "Doğal İfadeler", icon: BookMarked, desc: "Deyimler ve günlük tabirler" },
    { id: "simulation", label: "Konuşma Simülasyonu", icon: MessageSquare, desc: "Gerçek hayat canlandırmaları" },
    { id: "routine", label: "15 Dk Günlük Rutin", icon: Clock, desc: "Hızlı günlük çalışma programı" },
    { id: "chat", label: "Sürekli Eğitim / AI", icon: Sparkles, desc: "Ucu açık AI sohbet arkadaşı" }
  ];

  return (
    <aside className="glass-panel" style={{ width: "300px", display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", margin: "30px 0 30px 30px", padding: "20px" }}>
      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px", padding: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.2rem",
            boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)"
          }}>
            S
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", background: "linear-gradient(135deg, #fff 0%, var(--text-muted) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              SpeakFlow
            </h2>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>AI KONUŞMA KOÇU</span>
          </div>
        </div>

        {/* Mini streak display */}
        {streak > 0 && (
          <div 
            style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(251, 191, 36, 0.1)", padding: "4px 8px", borderRadius: "8px", border: "1px solid rgba(251, 191, 36, 0.2)" }}
            title={`${streak} gün seri pratik yapıldı!`}
          >
            <Flame size={14} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
            <span style={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: "bold" }}>{streak}</span>
          </div>
        )}
      </div>

      {/* User Login/Sync Status */}
      <div className="user-status-container" style={{
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--border-glass)",
        borderRadius: "10px",
        padding: "10px 14px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.8rem",
        gap: "10px"
      }}>
        {user ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", alignItems: "flex-start" }}>
              <span style={{ color: "#34d399", fontWeight: "700" }}>☁️ Eşitleme Aktif</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "130px" }} title={user.email}>
                {user.email}
              </span>
            </div>
            <button
              onClick={logoutNetlify}
              className="btn btn-danger"
              style={{ padding: "4px 8px", fontSize: "0.7rem", border: "none", borderRadius: "6px" }}
            >
              Çıkış
            </button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Misafir Modu</span>
              <span style={{ fontSize: "0.65rem", color: "var(--text-dark)" }}>Eşitleme kapalı</span>
            </div>
            <button
              onClick={openNetlifyLogin}
              className="btn btn-primary"
              style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "6px", boxShadow: "none" }}
            >
              Giriş Yap
            </button>
          </>
        )}
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto", paddingRight: "5px" }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="btn"
              style={{
                justifyContent: "flex-start",
                padding: "10px 14px",
                background: isActive ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)" : "transparent",
                border: "1px solid",
                borderColor: isActive ? "rgba(139, 92, 246, 0.3)" : "transparent",
                color: isActive ? "#c084fc" : "var(--text-muted)",
                textAlign: "left",
                borderRadius: "10px"
              }}
            >
              <Icon size={16} style={{ color: isActive ? "var(--color-primary)" : "var(--text-muted)", flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: isActive ? "600" : "500" }}>{item.label}</span>
                <span style={{ fontSize: "0.65rem", opacity: 0.7, fontWeight: "400" }}>{item.desc}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Settings Footer */}
      <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "15px", marginTop: "15px" }}>
        <button
          onClick={onOpenSettings}
          className="btn btn-secondary"
          style={{ width: "100%", justifyContent: "center", gap: "10px", borderRadius: "10px" }}
        >
          <Settings size={18} />
          <span>Ayarlar & API Anahtarı</span>
        </button>
      </div>
    </aside>
  );
}
