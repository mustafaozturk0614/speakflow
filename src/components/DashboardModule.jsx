import React, { useState, useEffect } from "react";
import { 
  Award, 
  Flame, 
  CheckCircle, 
  BookMarked, 
  TrendingUp, 
  Volume2, 
  Trash2, 
  Lock, 
  Zap,
  Plus,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { 
  getXP, 
  getLevel, 
  getStreak, 
  updateStreak, 
  getDailyTasks, 
  getUnlockedBadges, 
  getVocabulary, 
  toggleVocabulary 
} from "../utils/gamification";
import { speakText } from "../utils/speech";
import { hasApiKey, callGeminiAPI } from "../utils/gemini";

const allBadges = [
  { id: "first_word", title: "İlk Kelime", desc: "Sözlüğe ilk kelimeyi ekle.", icon: "⭐" },
  { id: "level_2", title: "Yolcu", desc: "2. Seviyeye ulaş.", icon: "🚀" },
  { id: "level_5", title: "Konuşkan", desc: "5. Seviyeye ulaş.", icon: "🗣️" },
  { id: "streak_3", title: "İstikrarlı", desc: "3 günlük çalışma serisi yap.", icon: "🔥" },
  { id: "all_tasks_today", title: "Görev Erbapı", desc: "Tüm günlük görevleri tamamla.", icon: "🏆" },
  { id: "words_10", title: "Kelime Avcısı", desc: "Sözlüğe 10 kelime ekle.", icon: "📚" },
  { id: "presentation_slide", title: "Sunucu", desc: "İlk kez bir sunum slaytı seslendir.", icon: "🎤" },
  { id: "diagnostic_done", title: "Bilinçli", desc: "İlk teşhis testini tamamla.", icon: "🧠" }
];

export default function DashboardModule() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [vocabList, setVocabList] = useState([]);

  // States for Custom Card Creator
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEng, setNewEng] = useState("");
  const [newTr, setNewTr] = useState("");
  const [newType, setNewType] = useState("custom");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    // Run streak checker on dashboard open
    updateStreak();
    
    // Load initial values
    setXp(getXP());
    setLevel(getLevel());
    setStreak(getStreak());
    setDailyTasks(getDailyTasks());
    setUnlockedBadges(getUnlockedBadges());
    setVocabList(getVocabulary());

    // Listeners for updates
    const handleXPChanged = () => {
      setXp(getXP());
      setLevel(getLevel());
    };
    const handleTasksChanged = () => setDailyTasks(getDailyTasks());
    const handleBadgesChanged = () => setUnlockedBadges(getUnlockedBadges());
    const handleVocabChanged = () => setVocabList(getVocabulary());
    const handleStreakChanged = () => setStreak(getStreak());

    window.addEventListener("speakflow_xp_changed", handleXPChanged);
    window.addEventListener("speakflow_level_up", handleXPChanged);
    window.addEventListener("speakflow_tasks_changed", handleTasksChanged);
    window.addEventListener("speakflow_badge_unlocked", handleBadgesChanged);
    window.addEventListener("speakflow_vocabulary_changed", handleVocabChanged);
    window.addEventListener("speakflow_streak_changed", handleStreakChanged);

    return () => {
      window.removeEventListener("speakflow_xp_changed", handleXPChanged);
      window.removeEventListener("speakflow_level_up", handleXPChanged);
      window.removeEventListener("speakflow_tasks_changed", handleTasksChanged);
      window.removeEventListener("speakflow_badge_unlocked", handleBadgesChanged);
      window.removeEventListener("speakflow_vocabulary_changed", handleVocabChanged);
      window.removeEventListener("speakflow_streak_changed", handleStreakChanged);
    };
  }, []);

  const handleSpeakWord = (text) => {
    speakText(text, 0.95);
  };

  const handleRemoveWord = (item) => {
    toggleVocabulary(item);
  };

  const handleCreateCustomCard = (e) => {
    e.preventDefault();
    if (!newEng.trim() || !newTr.trim()) {
      alert("Lütfen kartı kaydetmeden önce hem İngilizce hem Türkçe alanları doldurun. (Veya alanlardan birini yazıp alttaki AI butonuna tıklayarak otomatik doldurabilirsiniz!)");
      return;
    }
    
    const newItem = {
      type: newType,
      english: newEng.trim(),
      turkish: newTr.trim()
    };
    
    toggleVocabulary(newItem);
    setNewEng("");
    setNewTr("");
    setShowAddForm(false);
  };

  const handleAiFill = async () => {
    if (!newEng.trim() && !newTr.trim()) {
      alert("Lütfen önce İngilizce veya Türkçe alanlardan en az birini doldurun.");
      return;
    }

    if (!hasApiKey()) {
      alert("Yapay Zeka desteği için lütfen Ayarlar menüsünden Gemini API anahtarınızı girin. (Ücretsiz bir API anahtarı kullanabilirsiniz).");
      return;
    }

    setAiLoading(true);

    try {
      const inputData = {};
      if (newEng.trim()) inputData.english = newEng.trim();
      if (newTr.trim()) inputData.turkish = newTr.trim();

      const systemPrompt = `
You are a translation assistant for language learning cards.
Analyze the provided JSON containing either "english" or "turkish" keys.
Translate the word or phrase to the missing language and classify it into one of these types:
- "expression" (for idioms, slang, conversational expressions like "Hit the nail on the head", "under the weather")
- "pattern" (for grammar chunks like "I was wondering if...", "It's not worth...")
- "term" (for technical or sector specific terms like "Grace Period", "Revenue Share", "API")
- "custom" (for general words or simple phrases like "apple", "go to school")

Provide a very short and natural translation. Keep the description or extra notes out of the direct translation, but you can place clean meaning in Turkish.

Format your response strictly as a JSON object:
{
  "english": "English translation or original",
  "turkish": "Turkish translation or original",
  "type": "custom"
}
Respond ONLY with this JSON. Do not include markdown code block syntax.
      `;

      const response = await callGeminiAPI([
        { role: "user", content: JSON.stringify(inputData) }
      ], systemPrompt);

      if (response.english) setNewEng(response.english);
      if (response.turkish) setNewTr(response.turkish);
      if (response.type) setNewType(response.type);

    } catch (err) {
      console.error(err);
      alert("Yapay zeka yanıtı alınamadı: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const xpNeeded = level * 100;
  const xpPercentage = Math.min(100, Math.round((xp / xpNeeded) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.2s ease" }}>
      {/* Top Banner with level & streak */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1>Gelişim Paneli (Dashboard)</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            SpeakFlow dil öğrenme yolculuğunuzun özet durumu ve günlük hedefleriniz.
          </p>
        </div>

        {/* Streak & Level Cards */}
        <div style={{ display: "flex", gap: "15px" }}>
          {/* Streak Alev */}
          <div className="glass-panel" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 20px", borderRadius: "12px" }}>
            <Flame size={28} style={{ color: "var(--color-warning)", fill: "var(--color-warning)" }} />
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>ÇALIŞMA SERİSİ</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fbbf24" }}>{streak} GÜN</div>
            </div>
          </div>

          {/* Level and XP indicator */}
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "10px 20px", borderRadius: "12px", width: "200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "600" }}>
              <span>SEVİYE {level}</span>
              <span style={{ color: "#c084fc" }}>{xp}/{xpNeeded} XP</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                width: `${xpPercentage}%`,
                height: "100%",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))" }}>
        
        {/* Left Side: Daily Tasks & Badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          {/* Daily Tasks Panel */}
          <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
              <Zap size={18} style={{ color: "var(--color-secondary)" }} />
              Bugünün Görevleri
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {dailyTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "15px",
                    borderRadius: "10px",
                    background: task.completed ? "rgba(16, 185, 129, 0.04)" : "rgba(255, 255, 255, 0.02)",
                    border: "1px solid",
                    borderColor: task.completed ? "rgba(16, 185, 129, 0.3)" : "var(--border-glass)",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <CheckCircle 
                      size={20} 
                      style={{ 
                        color: task.completed ? "var(--color-success)" : "var(--text-dark)", 
                        fill: task.completed ? "rgba(16, 185, 129, 0.2)" : "none" 
                      }} 
                    />
                    <span style={{ 
                      fontSize: "0.9rem", 
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "var(--text-muted)" : "white"
                    }}>
                      {task.label}
                    </span>
                  </div>
                  <span className="badge badge-primary">+{task.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Panel */}
          <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
              <Award size={18} style={{ color: "var(--color-primary)" }} />
              Başarı Rozetleri
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {allBadges.map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      padding: "10px 5px",
                      borderRadius: "10px",
                      background: isUnlocked ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.01)",
                      border: "1px solid",
                      borderColor: isUnlocked ? "rgba(139,92,246,0.25)" : "var(--border-glass)",
                      opacity: isUnlocked ? 1 : 0.35,
                      position: "relative"
                    }}
                    title={badge.desc}
                  >
                    <span style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{badge.icon}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", display: "block" }}>{badge.title}</span>
                    {!isUnlocked && (
                      <div style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        background: "rgba(0,0,0,0.5)",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Lock size={8} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Charts & Vocabulary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          {/* Charts Panel (SVG representation) */}
          <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
              <TrendingUp size={18} style={{ color: "var(--color-accent)" }} />
              Konuşma Gelişim Grafiği (Son Teşhisler)
            </h3>
            
            {/* SVG Plot */}
            <div style={{ width: "100%", height: "180px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px", position: "relative" }}>
              <svg viewBox="0 0 100 40" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                {/* Gridlines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                
                {/* Curve 1: Akıcılık (Fluency) - Violet */}
                <path
                  d="M 5,30 C 25,24 50,15 95,8"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Dots on Curve 1 */}
                <circle cx="5" cy="30" r="1.5" fill="var(--color-primary)" />
                <circle cx="50" cy="18.5" r="1.5" fill="var(--color-primary)" />
                <circle cx="95" cy="8" r="1.5" fill="var(--color-primary)" />

                {/* Curve 2: Özgüven (Confidence) - Pink */}
                <path
                  d="M 5,32 C 25,28 50,22 95,14"
                  fill="none"
                  stroke="var(--color-secondary)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Dots on Curve 2 */}
                <circle cx="5" cy="32" r="1.5" fill="var(--color-secondary)" />
                <circle cx="50" cy="24.5" r="1.5" fill="var(--color-secondary)" />
                <circle cx="95" cy="14" r="1.5" fill="var(--color-secondary)" />
              </svg>
              
              {/* Legend overlay */}
              <div style={{
                position: "absolute",
                bottom: "10px",
                left: "15px",
                display: "flex",
                gap: "15px",
                fontSize: "0.7rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-primary)", display: "inline-block" }} />
                  <span style={{ color: "var(--text-muted)" }}>Akıcılık (Fluency)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-secondary)", display: "inline-block" }} />
                  <span style={{ color: "var(--text-muted)" }}>Özgüven (Confidence)</span>
                </div>
              </div>
            </div>
          </div>
 
          {/* Custom Card Creator Panel */}
          <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
                <Plus size={18} style={{ color: "var(--color-primary)" }} />
                Yeni Kelime Kartı Oluştur
              </h3>
              <button 
                onClick={() => setShowAddForm(!showAddForm)} 
                className="btn btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px" }}
              >
                {showAddForm ? "Kapat" : "Kart Ekle"}
              </button>
            </div>
            
            {showAddForm && (
              <form onSubmit={handleCreateCustomCard} style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "fadeIn 0.2s ease" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>İNGİLİZCE KELİME / İFADE</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Örn: Call it a day (AI ile doldurmak için boş bırakabilirsiniz)" 
                    value={newEng}
                    onChange={(e) => setNewEng(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>TÜRKÇE ANLAMI / AÇIKLAMA</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Örn: Paydos etmek, sonlandırmak (AI ile doldurmak için boş bırakabilirsiniz)" 
                    value={newTr}
                    onChange={(e) => setNewTr(e.target.value)}
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleAiFill}
                  disabled={aiLoading}
                  className="btn btn-secondary"
                  style={{ gap: "8px", fontSize: "0.8rem", width: "100%", padding: "10px", border: "1px dashed var(--color-primary)", color: "#c084fc", justifyContent: "center" }}
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      <span>Yapay Zeka Çeviriyor ve Sınıflandırıyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} style={{ color: "var(--color-primary)" }} />
                      <span>✨ AI ile Otomatik Çevir & Doldur</span>
                    </>
                  )}
                </button>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>KATEGORİ</label>
                  <select 
                    className="form-input" 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value)}
                    style={{ background: "#131325", border: "1px solid var(--border-glass)", cursor: "pointer", color: "white" }}
                  >
                    <option value="custom">Kişisel Kelime</option>
                    <option value="expression">Deyim (Idiom)</option>
                    <option value="pattern">Kalıp (Chunk)</option>
                    <option value="term">Sektörel Terim</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }}>
                  Sözlüğüme Ekle
                </button>
              </form>
            )}
          </div>

          {/* Vocabulary Box */}
          <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px", maxHeight: "350px", overflowY: "auto" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
              <BookMarked size={18} style={{ color: "var(--color-success)" }} />
              Kişisel Sözlüğüm ({vocabList.length} İfade)
            </h3>
            
            {vocabList.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "15px" }}>
                Henüz sözlüğe ifade kaydetmediniz. Doğal İfadeler ve Konuşma Kalıpları modüllerinden kelimelerin yanındaki yıldız simgesine tıklayarak ekleyebilirsiniz.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {vocabList.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-card"
                    style={{
                      padding: "10px 15px",
                      margin: 0,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#c084fc" }}>
                        {item.english}
                        <span className="badge badge-primary" style={{ fontSize: "0.6rem", padding: "2px 6px", marginLeft: "8px" }}>
                          {item.type === "expression" ? "deyim" : item.type === "pattern" ? "kalıp" : item.type === "term" ? "terim" : "özel"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{item.turkish}</div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleSpeakWord(item.english)}
                        className="btn btn-secondary btn-icon"
                        style={{ width: "26px", height: "26px", border: "none" }}
                      >
                        <Volume2 size={12} />
                      </button>
                      <button
                        onClick={() => handleRemoveWord(item)}
                        className="btn btn-danger btn-icon"
                        style={{ width: "26px", height: "26px", border: "none", background: "rgba(239, 68, 68, 0.1)" }}
                      >
                        <Trash2 size={12} style={{ color: "var(--color-danger)" }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
