import React, { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  Volume2, 
  Mic, 
  RotateCcw,
  Sparkles,
  Check
} from "lucide-react";
import { dailyRoutineSteps } from "../utils/mockData";
import { SpeechRecognizer, speakText } from "../utils/speech";
import { awardXP, completeDailyTask } from "../utils/gamification";

export default function RoutineModule() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [timerRunning, setTimerRunning] = useState(false);
  
  // Shadowing State
  const [shadowResult, setShadowResult] = useState("");
  const [shadowScore, setShadowScore] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [shadowIndex, setShadowIndex] = useState(0);
  const [spokenWordsList, setSpokenWordsList] = useState([]);

  // Active Recall State
  const [recallIdx, setRecallIdx] = useState(0);
  const [recallWords, setRecallWords] = useState([]);
  const [recallSelection, setRecallSelection] = useState([]);
  const [recallFeedback, setRecallFeedback] = useState(null);

  const timerRef = useRef(null);
  const recognizerRef = useRef(null);

  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer();
    return () => clearInterval(timerRef.current);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, timeLeft]);

  // Load Active Recall challenge
  useEffect(() => {
    if (activeStepIdx === 1) {
      const challenge = dailyRoutineSteps[1].challenges[recallIdx];
      if (challenge) {
        setRecallSelection([]);
        setRecallFeedback(null);
        setRecallWords([...challenge.words].sort(() => Math.random() - 0.5));
      }
    }
  }, [activeStepIdx, recallIdx]);

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(15 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Shadowing Logic
  const handlePlayShadow = (text) => {
    speakText(text, 0.85);
  };

  const handleStartShadowListening = (expectedText) => {
    if (!recognizerRef.current || !recognizerRef.current.supported) {
      alert("Ses tanıma bu tarayıcıda desteklenmiyor.");
      return;
    }
    setShadowResult("");
    setShadowScore(null);
    setSpokenWordsList([]);

    recognizerRef.current.start(
      () => setIsListening(true),
      (transcript) => {
        setShadowResult(transcript);
        
        // Match speech word by word
        const targetClean = expectedText.toLowerCase().replace(/[^a-z0-9\s]/g, "");
        const targetWords = targetClean.split(/\s+/).filter(w => w.length > 0);
        
        const spokenClean = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, "");
        const spokenWords = spokenClean.split(/\s+/).filter(w => w.length > 0);
        setSpokenWordsList(spokenWords);

        let matches = 0;
        targetWords.forEach(w => {
          if (spokenWords.includes(w)) matches++;
        });

        const score = Math.round((matches / targetWords.length) * 100);
        setShadowScore(score);

        if (score >= 80) {
          awardXP(30); // Award 30 XP
          completeDailyTask("task_shadowing"); // Complete daily task!
        }
      },
      (err) => {
        console.error(err);
        setIsListening(false);
      },
      () => setIsListening(false)
    );
  };

  const handleNextShadow = () => {
    setShadowResult("");
    setShadowScore(null);
    setSpokenWordsList([]);
    if (shadowIndex < dailyRoutineSteps[0].phrases.length - 1) {
      setShadowIndex(shadowIndex + 1);
    } else {
      setShadowIndex(0);
    }
  };

  // Active Recall Logic
  const handleRecallWordClick = (word, index) => {
    setRecallSelection([...recallSelection, { word, index }]);
    const newWords = [...recallWords];
    newWords[index] = null;
    setRecallWords(newWords);
  };

  const handleRecallRemove = (wordObj, sIdx) => {
    const newSelection = [...recallSelection];
    newSelection.splice(sIdx, 1);
    setRecallSelection(newSelection);

    const newWords = [...recallWords];
    newWords[wordObj.index] = wordObj.word;
    setRecallWords(newWords);
    setRecallFeedback(null);
  };

  const checkRecall = () => {
    const userSentence = recallSelection.map(w => w.word).join(" ");
    const challenge = dailyRoutineSteps[1].challenges[recallIdx];
    
    const cleanUser = userSentence.toLowerCase().trim();
    const cleanExpected = challenge.en.toLowerCase().trim();

    if (cleanUser === cleanExpected) {
      setRecallFeedback({ status: "success", text: "Doğru dizilim!" });
      speakText(challenge.en, 0.9);
      awardXP(20); // Award 20 XP for correct recall
    } else {
      setRecallFeedback({ status: "error", text: `Yanlış dizilim. İpucu: "${challenge.en}"` });
    }
  };

  const nextRecall = () => {
    if (recallIdx < dailyRoutineSteps[1].challenges.length - 1) {
      setRecallIdx(recallIdx + 1);
    } else {
      setRecallIdx(0);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.2s ease" }}>
      {/* Header & Timer Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1>15 Dakikalık Günlük Rutin</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Zamanınız kısıtlıysa her gün bu 3 hızlı aşamayı yapın. Maksimum konuşma verimi için tasarlanmıştır.
          </p>
        </div>

        {/* Timer Card */}
        <div className="glass-panel" style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          padding: "10px 20px",
          border: timerRunning ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid var(--border-glass)",
          background: timerRunning ? "rgba(139, 92, 246, 0.05)" : "rgba(255,255,255,0.02)",
          borderRadius: "12px"
        }}>
          <Clock size={24} style={{ color: timerRunning ? "var(--color-primary)" : "var(--text-muted)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>KALAN SÜRE</span>
            <span style={{ fontSize: "1.4rem", fontFamily: "monospace", fontWeight: "700" }}>{formatTime(timeLeft)}</span>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={toggleTimer} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>
              {timerRunning ? "Duraklat" : "Başlat"}
            </button>
            <button onClick={resetTimer} className="btn btn-secondary btn-icon" style={{ width: "30px", height: "30px" }} title="Sıfırla">
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Steps Progress Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {dailyRoutineSteps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => setActiveStepIdx(idx)}
            className="glass-card"
            style={{
              padding: "12px",
              borderColor: activeStepIdx === idx ? "rgba(139, 92, 246, 0.4)" : "var(--border-glass)",
              background: activeStepIdx === idx ? "rgba(139, 92, 246, 0.05)" : "var(--bg-card)",
              textAlign: "left",
              borderRadius: "10px"
            }}
          >
            <div style={{ fontSize: "0.75rem", color: activeStepIdx === idx ? "#c084fc" : "var(--text-muted)", fontWeight: "600" }}>AŞAMA {idx + 1}</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {step.title.split("-")[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Active Stage Screen */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        {activeStepIdx === 0 && (
          // SHADOWING SCREEN
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s ease" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "5px" }}>Gölge Değişimi (Shadowing) - 5 Dakika</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                Cümleyi dinleyin ve tekrarlayın. Telaffuzunuz kelime kelime eşleşecektir.
              </p>
            </div>

            {/* Target text card */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-glass)",
              padding: "20px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "15px"
            }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "600", lineHeight: "1.5", color: "#fff" }}>
                {dailyRoutineSteps[0].phrases[shadowIndex].split(/\s+/).map((word, wIdx) => {
                  const cleanW = word.toLowerCase().replace(/[^a-z0-9]/g, "");
                  const isMatched = spokenWordsList.includes(cleanW);
                  let color = "white";
                  if (shadowResult) {
                    color = isMatched ? "#34d399" : "#f87171";
                  }
                  return (
                    <span key={wIdx} style={{ color, marginRight: "6px", display: "inline-block" }}>
                      {word}
                    </span>
                  );
                })}
              </span>
              <button
                onClick={() => handlePlayShadow(dailyRoutineSteps[0].phrases[shadowIndex])}
                className="btn btn-primary btn-icon"
                style={{ width: "45px", height: "45px", flexShrink: 0 }}
                title="Sesi Oynat"
              >
                <Volume2 size={20} />
              </button>
            </div>

            {/* Record interaction */}
            <div className="mic-button-container">
              <button
                onClick={() => handleStartShadowListening(dailyRoutineSteps[0].phrases[shadowIndex])}
                className={`mic-button ${isListening ? "listening" : ""}`}
                style={{ width: "65px", height: "65px" }}
              >
                <Mic size={22} />
              </button>
              <span style={{ fontSize: "0.8rem", color: isListening ? "var(--color-danger)" : "var(--text-muted)", marginTop: "10px", fontWeight: "600" }}>
                {isListening ? "Cümleyi söyleyin..." : "Tekrar Etmek İçin Konuşun"}
              </span>
            </div>

            {/* Comparison Feedback */}
            {shadowResult && (
              <div className="glass-card" style={{ border: "1px dashed var(--border-glass)" }}>
                <div style={{ fontSize: "0.9rem", marginBottom: "8px" }}>
                  🗣️ Algılanan Sözünüz: <b>"{shadowResult}"</b>
                </div>

                {shadowScore !== null && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                    <div style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      background: shadowScore >= 80 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                      color: shadowScore >= 80 ? "#34d399" : "#fbbf24"
                    }}>
                      Uyum Skoru: %{shadowScore}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {shadowScore >= 80 ? "Mükemmel telaffuz ve ritim! Görev tamamlandı." : "Bazı kelimeler eşleşmedi, tekrar deneyebilirsiniz."}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button onClick={handleNextShadow} className="btn btn-secondary" style={{ alignSelf: "flex-end" }}>
              Sonraki Cümleye Geç
            </button>
          </div>
        )}

        {activeStepIdx === 1 && (
          // ACTIVE RECALL SCREEN
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s ease" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "5px" }}>Aktif Hatırlama (Active Recall) - 5 Dakika</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Türkçe cümleyi kurmak için aşağıdaki kelimeleri doğru sıraya dizin.
              </p>
            </div>

            <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--color-secondary)", padding: "10px 0" }}>
              🗣️ Türkçe Cümle: "{dailyRoutineSteps[1].challenges[recallIdx].tr}"
            </div>

            <div className="builder-area">
              {recallSelection.length === 0 ? (
                <span style={{ color: "var(--text-dark)", fontSize: "0.85rem" }}>Kelime karolarını seçin...</span>
              ) : (
                recallSelection.map((w, sIdx) => (
                  <div
                    key={sIdx}
                    onClick={() => handleRecallRemove(w, sIdx)}
                    className="word-tile"
                    style={{ background: "var(--color-primary)", color: "white" }}
                  >
                    {w.word}
                  </div>
                ))
              )}
            </div>

            <div className="word-pool">
              {recallWords.map((word, index) => {
                if (word === null) return null;
                return (
                  <div
                    key={index}
                    onClick={() => handleRecallWordClick(word, index)}
                    className="word-tile"
                  >
                    {word}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "15px", marginTop: "15px" }}>
              <div>
                {recallFeedback && (
                  <span style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: recallFeedback.status === "success" ? "#34d399" : "#f87171"
                  }}>
                    {recallFeedback.text}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={checkRecall} className="btn btn-primary" style={{ gap: "6px" }}>
                  Kontrol Et
                </button>
                <button onClick={nextRecall} className="btn btn-secondary">
                  Sonraki Egzersiz
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStepIdx === 2 && (
          // QUICK SIMULATION SCREEN
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s ease" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "5px" }}>Hızlı AI Sohbeti (Mini Simulation) - 5 Dakika</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Aşağıdaki konulardan birini seçerek "Konuşma Simülasyonu" veya "Sunum Pratiği" moduna gidin ve pratik yapın.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {dailyRoutineSteps[2].prompts.map((p, idx) => (
                <div key={idx} className="glass-card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px" }}>
                  <Sparkles size={18} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.95rem" }}>{p}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "15px", marginTop: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Rutin pratikleri başarıyla tamamlandı sayılır!</span>
              <span className="badge badge-success" style={{ gap: "6px", padding: "8px 12px" }}>
                <Check size={14} /> Hazırsınız!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
