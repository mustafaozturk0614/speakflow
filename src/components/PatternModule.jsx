import React, { useState, useEffect } from "react";
import { Compass, Play, Check, ArrowRight, Star } from "lucide-react";
import { conversationPatterns } from "../utils/mockData";
import { speakText } from "../utils/speech";
import { getVocabulary, toggleVocabulary, awardXP } from "../utils/gamification";

export default function PatternModule() {
  const [selectedPat, setSelectedPat] = useState(conversationPatterns[0]);
  const [drillAnswers, setDrillAnswers] = useState({}); // { [pattern_index_example_index]: "user_text" }
  const [drillFeedback, setDrillFeedback] = useState({}); // { [key]: { correct: true/false } }
  const [bookmarkedList, setBookmarkedList] = useState([]);

  useEffect(() => {
    setBookmarkedList(getVocabulary().filter(v => v.type === "pattern").map(v => v.english));
  }, []);

  const handlePlayTTS = (text) => {
    speakText(text, 0.9);
  };

  const handleToggleBookmark = () => {
    const item = {
      type: "pattern",
      english: selectedPat.pattern,
      turkish: selectedPat.meaning
    };
    const added = toggleVocabulary(item);
    
    setBookmarkedList(prev => 
      added ? [...prev, selectedPat.pattern] : prev.filter(p => p !== selectedPat.pattern)
    );
  };

  const handleCheckAnswer = (patternIndex, exampleIndex, expectedText) => {
    const key = `${patternIndex}_${exampleIndex}`;
    const userVal = drillAnswers[key] || "";
    
    const cleanUser = userVal.toLowerCase().replace(/[^a-z0-9']/g, "").trim();
    const cleanExpected = expectedText.toLowerCase().replace(/[^a-z0-9']/g, "").trim();

    const isCorrect = cleanUser === cleanExpected;

    setDrillFeedback((prev) => ({
      ...prev,
      [key]: { correct: isCorrect, checked: true }
    }));

    if (isCorrect) {
      handlePlayTTS(expectedText);
      awardXP(10); // Award 10 XP for a correct sentence check!
    }
  };

  const isBookmarked = bookmarkedList.includes(selectedPat.pattern);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.2s ease" }}>
      {/* Header */}
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Compass size={32} style={{ color: "var(--color-primary)" }} />
          Konuşma Odaklı Kalıplar (Chunks)
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Günlük hayattaki konuşmaların %70'i hazır şablonlarla (chunks) yapılır. Kelimeleri tek tek birleştirmek yerine bu bütünsel kalıpları öğrenin.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Patterns Menu list */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto" }}>
          <h4 style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", padding: "5px 10px" }}>Hazır Kalıp Listesi</h4>
          {conversationPatterns.map((pat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPat(pat)}
              className="btn"
              style={{
                justifyContent: "space-between",
                padding: "15px",
                background: selectedPat.pattern === pat.pattern ? "rgba(139, 92, 246, 0.1)" : "transparent",
                borderColor: selectedPat.pattern === pat.pattern ? "rgba(139, 92, 246, 0.3)" : "var(--border-glass)",
                color: selectedPat.pattern === pat.pattern ? "#c084fc" : "var(--text-main)",
                textAlign: "left",
                borderRadius: "10px"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: "700" }}>{pat.pattern}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{pat.meaning}</span>
              </div>
              <ArrowRight size={16} style={{ opacity: selectedPat.pattern === pat.pattern ? 1 : 0.3 }} />
            </button>
          ))}
        </div>

        {/* Right Side: Active Pattern Details and Practice */}
        <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Pattern info Card */}
          <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "1.6rem", color: "var(--color-primary)", marginBottom: "5px" }}>{selectedPat.pattern}</h2>
              <p style={{ fontSize: "1rem", color: "var(--text-main)", fontWeight: "500" }}>
                💡 Anlamı: <span style={{ color: "var(--color-secondary)" }}>{selectedPat.meaning}</span>
              </p>
            </div>
            
            <button
              onClick={handleToggleBookmark}
              className="btn btn-secondary"
              style={{ gap: "6px", fontSize: "0.8rem" }}
            >
              <Star 
                size={14} 
                fill={isBookmarked ? "var(--color-warning)" : "none"} 
                style={{ color: isBookmarked ? "var(--color-warning)" : "inherit" }} 
              />
              <span>{isBookmarked ? "Sözlükte Kayıtlı" : "Sözlüğe Ekle"}</span>
            </button>
          </div>

          {/* Drills Section */}
          <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "15px" }}>Kalıbı Cümleye Dökme Egzersizleri</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {selectedPat.examples.map((ex, exIdx) => {
                const patIdx = conversationPatterns.findIndex(p => p.pattern === selectedPat.pattern);
                const key = `${patIdx}_${exIdx}`;
                const feedback = drillFeedback[key];
                
                return (
                  <div
                    key={exIdx}
                    className="glass-card"
                    style={{
                      padding: "15px",
                      borderColor: feedback?.checked ? (feedback.correct ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)") : "var(--border-glass)",
                      background: feedback?.checked ? (feedback.correct ? "rgba(16, 185, 129, 0.02)" : "rgba(239, 68, 68, 0.02)") : "rgba(255, 255, 255, 0.01)"
                    }}
                  >
                    {/* TR prompt */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>🗣️ Türkçe Cümle: <i>{ex.tr}</i></span>
                      <button
                        onClick={() => handlePlayTTS(ex.en)}
                        className="btn btn-secondary btn-icon"
                        style={{ width: "28px", height: "28px" }}
                        title="İpucu Telaffuz"
                      >
                        <Play size={12} />
                      </button>
                    </div>

                    {/* Drill inputs */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="İngilizce karşılığını yazın..."
                        value={drillAnswers[key] || ""}
                        onChange={(e) => setDrillAnswers({ ...drillAnswers, [key]: e.target.value })}
                        disabled={feedback?.correct}
                        style={{ fontSize: "0.95rem" }}
                      />
                      <button
                        onClick={() => handleCheckAnswer(patIdx, exIdx, ex.en)}
                        disabled={feedback?.correct}
                        className="btn btn-primary"
                        style={{ padding: "10px 15px" }}
                      >
                        <Check size={16} />
                      </button>
                    </div>

                    {/* Hint / Feedback */}
                    {feedback?.checked && (
                      <div style={{ marginTop: "8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        {feedback.correct ? (
                          <span style={{ color: "#34d399", fontWeight: "600" }}>✓ Doğru cevap! Kulak aşinalığı için tekrar dinleyin.</span>
                        ) : (
                          <span style={{ color: "#f87171" }}>
                            ✗ Hatalı yazım. İpucu: Cümle tam olarak <b>"{ex.en}"</b> olmalı.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
