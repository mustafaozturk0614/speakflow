import React, { useState, useEffect } from "react";
import { BookMarked, Play, Info, Layers, RefreshCw, Star } from "lucide-react";
import { naturalExpressions } from "../utils/mockData";
import { speakText } from "../utils/speech";
import { getVocabulary, toggleVocabulary, awardXP } from "../utils/gamification";

export default function ExpressionsModule() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [variationSubject, setVariationSubject] = useState("I");
  const [variationTime, setVariationTime] = useState("today");
  const [bookmarkedList, setBookmarkedList] = useState([]);

  useEffect(() => {
    setBookmarkedList(getVocabulary().filter(v => v.type === "expression").map(v => v.english));
  }, []);

  const currentExp = naturalExpressions[selectedIdx];

  const handlePlayTTS = (text) => {
    speakText(text, 0.9);
  };

  const handleToggleBookmark = (e, exp) => {
    e.stopPropagation();
    const item = {
      type: "expression",
      english: exp.phrase,
      turkish: exp.meaning
    };
    const added = toggleVocabulary(item);
    
    setBookmarkedList(prev => 
      added ? [...prev, exp.phrase] : prev.filter(ph => ph !== exp.phrase)
    );
  };

  // Helper to generate dynamic sentence variation depending on the active phrase
  const getDynamicVariation = (phrase) => {
    const sub = variationSubject;
    const time = variationTime;

    if (phrase === "Hit the nail on the head") {
      const verb = sub === "He" || sub === "She" ? "hits" : "hit";
      return `${sub} ${verb} the nail on the head.`;
    }

    if (phrase === "Under the weather") {
      let verb = "am";
      if (sub === "He" || sub === "She") verb = "is";
      if (sub === "We" || sub === "They") verb = "are";

      if (time === "yesterday") {
        verb = (sub === "He" || sub === "She" || sub === "I") ? "was" : "were";
      }

      return `${sub} ${verb} feeling a bit under the weather ${time}.`;
    }

    if (phrase === "Call it a day") {
      if (sub !== "I" && sub !== "We") {
        return `${sub} decided to call it a day ${time === "yesterday" ? "yesterday" : "early"}.`;
      }
      return `${sub === "I" ? "I think I'll" : "Let's"} call it a day ${time === "yesterday" ? "yesterday" : ""}.`;
    }

    if (phrase === "Break a leg") {
      return `Go out there, ${sub.toLowerCase()}! Break a leg!`;
    }

    if (phrase === "Off the top of my head") {
      const pron = sub === "I" ? "my" : sub === "He" ? "his" : sub === "She" ? "her" : "their";
      return `Off the top of ${pron} head, ${sub} can't remember.`;
    }

    return phrase;
  };

  const handlePlayVariation = () => {
    const sentence = getDynamicVariation(currentExp.phrase);
    handlePlayTTS(sentence);
    awardXP(5); // Award 5 XP for practicing variations
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.2s ease" }}>
      {/* Header */}
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <BookMarked size={32} style={{ color: "var(--color-primary)" }} />
          Doğal İfadeler (Natural Expressions)
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Kitap dili yerine ana dili İngilizce olanların en çok tercih ettiği deyim ve kalıpları ezberlemeden, mantığını kavrayarak öğrenin.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Left List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {naturalExpressions.map((exp, idx) => {
            const isBookmarked = bookmarkedList.includes(exp.phrase);
            const isSelected = selectedIdx === idx;
            
            return (
              <div
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className="glass-card"
                role="button"
                tabIndex={0}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "15px",
                  cursor: "pointer",
                  borderColor: isSelected ? "rgba(139, 92, 246, 0.4)" : "var(--border-glass)",
                  background: isSelected ? "rgba(139, 92, 246, 0.05)" : "var(--bg-card)",
                  outline: "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", color: isSelected ? "#c084fc" : "var(--text-main)", fontSize: "1.05rem" }}>
                    {exp.phrase}
                  </span>
                  
                  <div style={{ display: "flex", gap: "5px" }}>
                    {/* Bookmark star */}
                    <button
                      onClick={(e) => handleToggleBookmark(e, exp)}
                      className="btn btn-secondary btn-icon"
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        background: "transparent", 
                        borderColor: "transparent",
                        color: isBookmarked ? "var(--color-warning)" : "var(--text-muted)" 
                      }}
                      title="Sözlüğe Ekle"
                    >
                      <Star size={14} fill={isBookmarked ? "var(--color-warning)" : "none"} />
                    </button>

                    {/* Audio play button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTTS(exp.phrase);
                      }}
                      className="btn btn-secondary btn-icon"
                      style={{ width: "28px", height: "28px", background: "transparent", borderColor: "transparent" }}
                      title="Seslendir"
                    >
                      <Play size={14} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>{exp.meaning}</p>
              </div>
            );
          })}
        </div>

        {/* Right Details Panel */}
        <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "25px" }}>
          {/* Main Phrase Card */}
          <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", color: "var(--color-primary)", marginBottom: "6px" }}>{currentExp.phrase}</h2>
              <span className="badge badge-success" style={{ fontSize: "0.85rem" }}>{currentExp.meaning}</span>
            </div>
            
            <button
              onClick={(e) => handleToggleBookmark(e, currentExp)}
              className="btn btn-secondary"
              style={{ gap: "6px", fontSize: "0.8rem" }}
            >
              <Star size={14} fill={bookmarkedList.includes(currentExp.phrase) ? "var(--color-warning)" : "none"} style={{ color: bookmarkedList.includes(currentExp.phrase) ? "var(--color-warning)" : "inherit" }} />
              <span>{bookmarkedList.includes(currentExp.phrase) ? "Sözlükte Kayıtlı" : "Sözlüğe Ekle"}</span>
            </button>
          </div>

          {/* Details Table/Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <Info size={16} style={{ color: "var(--color-accent)", marginTop: "3px", flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>Ne Zaman Kullanılır?</strong>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px", lineHeight: "1.5" }}>{currentExp.whenToUse}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <Layers size={16} style={{ color: "var(--color-secondary)", marginTop: "3px", flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>Uygun Durumlar / Konsept</strong>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px", lineHeight: "1.5" }}>{currentExp.context}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <RefreshCw size={16} style={{ color: "var(--color-warning)", marginTop: "3px", flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>Ezberlemeden Nasıl Farklılaştırılır?</strong>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px", lineHeight: "1.5" }}>{currentExp.variation}</p>
              </div>
            </div>
          </div>

          {/* Dynamic Builder Simulator */}
          <div className="glass-card" style={{ border: "1px solid rgba(139, 92, 246, 0.2)", background: "rgba(139, 92, 246, 0.02)", marginTop: "10px" }}>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "15px", color: "#c084fc" }}>Cümleyi Değiştirerek Kullanma Deneyimi</h4>
            
            {/* Control Selectors */}
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Özne Seçin</label>
                <select
                  className="form-input"
                  value={variationSubject}
                  onChange={(e) => setVariationSubject(e.target.value)}
                  style={{ background: "#131327", fontSize: "0.85rem" }}
                >
                  <option value="I">I (Ben)</option>
                  <option value="He">He (O - Erkek)</option>
                  <option value="She">She (O - Kadın)</option>
                  <option value="We">We (Biz)</option>
                  <option value="They">They (Onlar)</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Zaman Seçin</label>
                <select
                  className="form-input"
                  value={variationTime}
                  onChange={(e) => setVariationTime(e.target.value)}
                  style={{ background: "#131327", fontSize: "0.85rem" }}
                >
                  <option value="today">Today (Bugün)</option>
                  <option value="yesterday">Yesterday (Dün)</option>
                </select>
              </div>
            </div>

            {/* Rendered Live Sentence */}
            <div style={{
              background: "rgba(0,0,0,0.2)",
              padding: "15px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid var(--border-glass)"
            }}>
              <span style={{ fontSize: "1.1rem", fontWeight: "600", fontFamily: "monospace", color: "#fff" }}>
                {getDynamicVariation(currentExp.phrase)}
              </span>
              <button
                onClick={handlePlayVariation}
                className="btn btn-primary btn-icon"
                style={{ width: "36px", height: "36px" }}
                title="Cümleyi Seslendir"
              >
                <Play size={14} />
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px" }}>
              💡 <b>Tavsiye:</b> Formülleri ezberlemeyin. Özne veya zamanı değiştirerek cümlenin melodisinin nasıl değiştiğini dinleyin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
