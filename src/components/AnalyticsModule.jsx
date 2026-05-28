import React, { useState, useEffect } from "react";
import { 
  BarChart2, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Volume2, 
  BookMarked, 
  Award, 
  Calendar, 
  Clock, 
  Flame,
  Info,
  Trash2
} from "lucide-react";
import { getXP, getLevel, getStreak, getVocabulary, getRecentMistakes } from "../utils/gamification";
import { speakText } from "../utils/speech";

export default function AnalyticsModule() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [vocabCount, setVocabCount] = useState(0);
  const [recentMistakes, setRecentMistakes] = useState([]);
  
  // Hover Tooltip States for SVG Charts
  const [lineTooltip, setLineTooltip] = useState(null); // { x, y, label, value }
  const [barTooltip, setBarTooltip] = useState(null); // { x, y, label, value }

  useEffect(() => {
    setXp(getXP());
    setLevel(getLevel());
    setStreak(getStreak());
    setVocabCount(getVocabulary().length);
    setRecentMistakes(getRecentMistakes());

    const handleMistakesChanged = () => {
      setRecentMistakes(getRecentMistakes());
    };
    window.addEventListener("speakflow_mistakes_changed", handleMistakesChanged);
    return () => window.removeEventListener("speakflow_mistakes_changed", handleMistakesChanged);
  }, []);

  // Mock data for weekly XP (Fills dynamically if new XP is gained)
  const weeklyXPData = [
    { day: "Pzt", xp: 45 },
    { day: "Sal", xp: 90 },
    { day: "Çar", xp: 120 },
    { day: "Per", xp: 60 },
    { day: "Cum", xp: 150 },
    { day: "Cmt", xp: level > 1 ? 210 : 80 },
    { day: "Paz", xp: xp > 0 ? xp + 40 : 110 }
  ];

  // Fluency data (Words Per Minute WPM)
  const wpmData = [
    { label: "Gerçek Teşhis", wpm: 68, color: "#10b981" },
    { label: "Kafe Simülasyonu", wpm: 84, color: "#f59e0b" },
    { label: "AI Sohbet Odası", wpm: 92, color: "#ec4899" },
    { label: "VAS Toplantısı", wpm: 78, color: "#8b5cf6" },
    { label: "IK İş Mülakatı", wpm: 88, color: "#3b82f6" }
  ];

  // Grammar accuracy calculation
  const totalEvaluated = recentMistakes.length + 20; // base scale
  const correctCount = 20; // baseline
  const grammarAccuracy = Math.round((correctCount / totalEvaluated) * 100);

  const handleSpeakText = (text) => {
    speakText(text, 0.95);
  };

  const handleClearMistakes = () => {
    localStorage.removeItem("speakflow_recent_mistakes");
    setRecentMistakes([]);
  };

  // SVG Line Chart math helper
  const maxXP = Math.max(...weeklyXPData.map(d => d.xp));
  const chartHeight = 150;
  const chartWidth = 500;
  const padding = 30;
  
  // Calculate SVG points for weekly line chart
  const points = weeklyXPData.map((d, i) => {
    const x = padding + (i * (chartWidth - padding * 2)) / (weeklyXPData.length - 1);
    const y = chartHeight - padding - (d.xp / maxXP) * (chartHeight - padding * 2);
    return { x, y, day: d.day, xp: d.xp };
  });

  const linePath = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      {/* Intro Header */}
      <div className="glass-panel" style={{ padding: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ textAlign: "left" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, fontSize: "1.4rem" }}>
            <Activity size={24} style={{ color: "var(--color-primary)" }} />
            Gelişim Analitiği ve Raporlar (Analytics)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "5px", maxWidth: "600px" }}>
            Uygulama genelindeki konuşma, gramer ve pratik verilerinizin görsel analiz raporları.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
        
        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", textAlign: "left" }}>
          <div style={{ background: "rgba(139, 92, 246, 0.1)", width: "45px", height: "45px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContext: "center", justifyContent: "center", color: "#c084fc" }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>SEVİYE & XP</div>
            <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "white", marginTop: "2px" }}>Seviye {level}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-primary)" }}>Haftalık Toplam: {weeklyXPData.reduce((acc, d) => acc + d.xp, 0)} XP</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", textAlign: "left" }}>
          <div style={{ background: "rgba(251, 191, 36, 0.1)", width: "45px", height: "45px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContext: "center", justifyContent: "center", color: "#fbbf24" }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>GÜNLÜK SERİ</div>
            <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "white", marginTop: "2px" }}>{streak} Gün</div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-warning)" }}>Kesintisiz Pratik</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", textAlign: "left" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", width: "45px", height: "45px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContext: "center", justifyContent: "center", color: "#34d399" }}>
            <BookMarked size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>KAYITLI KELİMELER</div>
            <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "white", marginTop: "2px" }}>{vocabCount} Kelime</div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-success)" }}>Tekrar Odasında Kayıtlı</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", textAlign: "left" }}>
          <div style={{ background: "rgba(59, 130, 246, 0.1)", width: "45px", height: "45px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContext: "center", justifyContent: "center", color: "#3b82f6" }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>HAFTALIK ÇALIŞMA</div>
            <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "white", marginTop: "2px" }}>~1.5 Saat</div>
            <div style={{ fontSize: "0.7rem", color: "#3b82f6" }}>Ortalama Günlük 15 Dk</div>
          </div>
        </div>

      </div>

      {/* SVG Charts Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* CHART 1: SVG Neon Line Chart (Weekly XP Progression) */}
        <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px", textAlign: "left", position: "relative" }}>
          <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <TrendingUp size={18} style={{ color: "var(--color-primary)" }} />
            Haftalık XP Kazanım Grafiği
          </h3>

          <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "auto", minWidth: "400px" }}>
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

              {/* Glowing Line Path */}
              <polyline
                fill="none"
                stroke="rgba(139, 92, 246, 0.2)"
                strokeWidth={8}
                points={linePath}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth={3}
                points={linePath}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill="var(--bg-card)"
                    stroke="var(--color-secondary)"
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => setLineTooltip({ x: p.x, y: p.y - 15, label: p.day, value: `${p.xp} XP` })}
                    onMouseLeave={() => setLineTooltip(null)}
                  />
                  {/* Axis labels */}
                  <text
                    x={p.x}
                    y={chartHeight - 10}
                    fill="var(--text-dark)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {p.day}
                  </text>
                </g>
              ))}

              {/* Interactive Tooltip Overlay */}
              {lineTooltip && (
                <g>
                  <rect
                    x={lineTooltip.x - 40}
                    y={lineTooltip.y - 28}
                    width={80}
                    height={22}
                    rx={4}
                    fill="rgba(15, 15, 25, 0.95)"
                    stroke="var(--color-primary)"
                    strokeWidth={1}
                  />
                  <text
                    x={lineTooltip.x}
                    y={lineTooltip.y - 14}
                    fill="white"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {lineTooltip.label}: {lineTooltip.value}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* CHART 2: SVG Bar Chart (Speaking speed velocity in WPM) */}
        <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px", textAlign: "left" }}>
          <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <BarChart2 size={18} style={{ color: "var(--color-secondary)" }} />
            Akıcılık (Konuşma Hızı - WPM)
          </h3>

          <div style={{ position: "relative", width: "100%" }}>
            <svg viewBox="0 0 500 150" style={{ width: "100%", height: "auto" }}>
              {/* Baseline */}
              <line x1={30} y1={120} x2={470} y2={120} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

              {/* Rendering Bars */}
              {wpmData.map((d, i) => {
                const barWidth = 40;
                const barSpacing = (440 - barWidth * wpmData.length) / (wpmData.length - 1);
                const x = 30 + i * (barWidth + barSpacing);
                const barHeight = (d.wpm / 120) * 100; // max scale WPM is 120
                const y = 120 - barHeight;

                return (
                  <g key={i}>
                    {/* Bar background fill */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={4}
                      fill={d.color}
                      style={{ cursor: "pointer", transition: "all 0.3s ease", opacity: 0.8 }}
                      onMouseEnter={() => setBarTooltip({ x: x + barWidth / 2, y: y - 10, label: d.label, value: `${d.wpm} Kelime/Dk` })}
                      onMouseLeave={() => setBarTooltip(null)}
                    />
                    {/* WPM text above bars */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      fill="rgba(255,255,255,0.6)"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {d.wpm}
                    </text>
                    {/* Labels under bars */}
                    <text
                      x={x + barWidth / 2}
                      y={135}
                      fill="var(--text-dark)"
                      fontSize="8"
                      textAnchor="middle"
                    >
                      {d.label.split(" ")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Interactive Tooltip Overlay */}
              {barTooltip && (
                <g>
                  <rect
                    x={barTooltip.x - 70}
                    y={barTooltip.y - 28}
                    width={140}
                    height={22}
                    rx={4}
                    fill="rgba(15, 15, 25, 0.95)"
                    stroke="var(--color-secondary)"
                    strokeWidth={1}
                  />
                  <text
                    x={barTooltip.x}
                    y={barTooltip.y - 14}
                    fill="white"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {barTooltip.label}: {barTooltip.value}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

      </div>

      <div className="dashboard-grid">
        
        {/* CHART 3: Donut Chart (Grammar Accuracy Rate) */}
        <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px", textAlign: "left", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px", margin: 0, width: "100%" }}>
            <Activity size={18} style={{ color: "var(--color-success)" }} />
            Ortalama Gramer Doğruluk Oranı
          </h3>

          <div style={{ position: "relative", width: "160px", height: "160px", marginTop: "15px" }}>
            <svg width="100%" height="100%" viewBox="0 0 40 40" className="donut">
              <circle className="donut-hole" cx="20" cy="20" r="15.915" fill="transparent"></circle>
              <circle className="donut-ring" cx="20" cy="20" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="3.2"></circle>
              <circle 
                className="donut-segment" 
                cx="20" 
                cy="20" 
                r="15.915" 
                fill="transparent" 
                stroke="var(--color-success)" 
                strokeWidth="3.2" 
                strokeDasharray={`${grammarAccuracy} ${100 - grammarAccuracy}`} 
                strokeDashoffset="25"
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "white" }}>{grammarAccuracy}%</span>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Doğruluk</div>
            </div>
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "5px" }}>
            Gramer doğruluğu, son canlandırma ve akıllı teşhis raporlarında tespit edilen hatalar baz alınarak dinamik olarak hesaplanmıştır.
          </div>
        </div>

        {/* Mistakes review logger card */}
        <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px", textAlign: "left", maxHeight: "350px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <AlertCircle size={18} style={{ color: "var(--color-warning)" }} />
              En Sık Yapılan Gramer Hataların
            </h3>
            {recentMistakes.length > 0 && (
              <button 
                onClick={handleClearMistakes}
                className="btn btn-secondary btn-icon"
                style={{ width: "26px", height: "26px", border: "none", background: "rgba(239,68,68,0.05)" }}
                title="Tüm Hataları Temizle"
              >
                <Trash2 size={12} style={{ color: "var(--color-danger)" }} />
              </button>
            )}
          </div>

          {recentMistakes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              👍 Harika! Kayıtlı aktif hata bulunmamaktadır. Konuşma simülasyonları veya Rol yapma seansları yaptıkça hatalarınız burada toplanacaktır.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentMistakes.map((item, idx) => (
                <div key={idx} className="glass-card" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                      <span style={{ color: "var(--color-danger)", textDecoration: "line-through" }}>"{item.wrong}"</span>
                      {" ➔ "}
                      <span style={{ color: "var(--color-success)", fontWeight: "700" }}>"{item.correct}"</span>
                    </div>
                    <button 
                      onClick={() => handleSpeakText(item.correct)}
                      className="btn btn-secondary btn-icon"
                      style={{ width: "22px", height: "22px", border: "none" }}
                      title="Doğrusunu Dinle"
                    >
                      <Volume2 size={10} />
                    </button>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                    💡 <b>İpucu:</b> {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
