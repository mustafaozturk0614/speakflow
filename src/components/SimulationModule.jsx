import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  RefreshCw, 
  Play, 
  Volume2, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Award
} from "lucide-react";
import { simulationScenarios } from "../utils/mockData";
import { SpeechRecognizer, speakText, stopSpeaking } from "../utils/speech";
import { evaluateSentenceLocally } from "../utils/diagnostics";
import { hasApiKey, callGeminiAPI, COACH_SYSTEM_PROMPT } from "../utils/gemini";
import { awardXP, logMistake } from "../utils/gamification";

export default function SimulationModule() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]); // [{ role: 'assistant'|'user', content: '', correction: null }]
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [finished, setFinished] = useState(false);

  const recognizerRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer();
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when message list updates
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartScenario = (scenario) => {
    setSelectedScenario(scenario);
    setMessages([{
      role: "assistant",
      content: scenario.intro,
      correction: null
    }]);
    setCurrentStepIdx(0);
    setFinished(false);
    setInputVal("");
    setErrorMsg("");
    
    // Play intro voice
    setTimeout(() => {
      speakText(scenario.intro, 0.95);
    }, 300);
  };

  const handleStartListening = () => {
    if (!recognizerRef.current || !recognizerRef.current.supported) {
      setErrorMsg("Ses tanıma tarayıcınızda desteklenmiyor. Cevabınızı yazabilirsiniz.");
      return;
    }
    setErrorMsg("");

    recognizerRef.current.start(
      () => setIsListening(true),
      (transcript) => {
        setInputVal((prev) => prev ? prev + " " + transcript : transcript);
      },
      (err) => {
        console.error(err);
        setErrorMsg(`Mikrofon algılanamadı ya da hata oluştu: ${err}`);
        setIsListening(false);
      },
      () => setIsListening(false)
    );
  };

  const handleStopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputVal.trim()) return;
    const userText = inputVal.trim();
    setInputVal("");
    handleStopListening();
    setLoading(true);

    // Append user message
    const updatedMessages = [...messages, { role: "user", content: userText }];
    setMessages(updatedMessages);

    try {
      if (hasApiKey()) {
        // ONLINE GEMINI MODE
        // We will call the Gemini API passing context
        // and using COACH_SYSTEM_PROMPT
        const geminiResponse = await callGeminiAPI(
          updatedMessages.map(m => ({ role: m.role, content: m.content })),
          COACH_SYSTEM_PROMPT
        );

        if (geminiResponse.correction?.hasError) {
          logMistake(
            geminiResponse.correction.wrongText,
            geminiResponse.correction.correctText,
            geminiResponse.correction.explanation
          );
        }

        const newMsg = {
          role: "assistant",
          content: geminiResponse.coachResponse,
          correction: geminiResponse.correction?.hasError ? {
            wrongText: geminiResponse.correction.wrongText,
            correctText: geminiResponse.correction.correctText,
            explanation: geminiResponse.correction.explanation
          } : null
        };

        setMessages(prev => [...prev, newMsg]);
        speakText(geminiResponse.coachResponse, 0.95);

      } else {
        // LOCAL OFFLINE SIMULATION MODE
        const scenarioSteps = selectedScenario.steps;
        const currentStep = scenarioSteps[currentStepIdx];
        
        // 1. Evaluate user's text for spelling or structure errors locally
        const localCorrection = evaluateSentenceLocally(userText);

        // Check if there are custom corrections configured for this specific step
        let correctionData = null;
        if (localCorrection.hasError) {
          correctionData = localCorrection;
        } else if (currentStep.corrections) {
          const userLower = userText.toLowerCase().trim();
          for (const [key, correctionVal] of Object.entries(currentStep.corrections)) {
            if (userLower.includes(key)) {
              correctionData = {
                hasError: true,
                wrongText: userText,
                correctText: correctionVal.replace(/\(.*?\)/g, "").trim(),
                explanation: correctionVal
              };
              break;
            }
          }
        }

        if (correctionData && correctionData.hasError) {
          logMistake(
            correctionData.wrongText,
            correctionData.correctText,
            correctionData.explanation
          );
        }

        // 2. Schedule next step response
        const nextStepIdx = currentStepIdx + 1;
        if (nextStepIdx < scenarioSteps.length) {
          const nextStep = scenarioSteps[nextStepIdx];
          
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: nextStep.botQuestion,
              correction: correctionData
            }]);
            setCurrentStepIdx(nextStepIdx);
            speakText(nextStep.botQuestion, 0.95);
            setLoading(false);
          }, 800);
        } else {
          // Finished the scenario
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: "Thank you for completing this roleplay! You did a fantastic job practicing real life English.",
              correction: correctionData
            }]);
            setFinished(true);
            setLoading(false);
            awardXP(50); // Award 50 XP for finishing a scenario!
          }, 800);
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("AI yanıt oluştururken hata oluştu. Lütfen bağlantınızı kontrol edin veya Ayarlar'dan API Key'inizi doğrulayın.");
    } finally {
      if (hasApiKey()) setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedScenario(null);
    setMessages([]);
    setFinished(false);
    setInputVal("");
    setErrorMsg("");
  };

  const replayMessageTTS = (text) => {
    speakText(text, 0.95);
  };

  // Scenario Selection Screen
  if (!selectedScenario) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.2s ease" }}>
        <div>
          <h1>Gerçek Konuşma Simülasyonu</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Farklı günlük durumlarda gerçekçi konuşma canlandırmaları yapın. Hata yapma korkusunu geride bırakıp akıcılığınızı test edin.
          </p>
        </div>

        <div className="dashboard-grid">
          {simulationScenarios.map((scen) => (
            <div key={scen.id} className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1.5rem" }}>{scen.title.split(" ")[0]}</span>
                <span className="badge badge-primary">{scen.character}</span>
              </div>
              <h3 style={{ fontSize: "1.2rem" }}>{scen.title.split(" ").slice(1).join(" ")}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: "1.5", flex: 1 }}>{scen.description}</p>
              <button onClick={() => handleStartScenario(scen)} className="btn btn-primary" style={{ width: "100%", gap: "8px" }}>
                <Play size={16} /> Pratiğe Başla
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active Chat Screen
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: "15px", animation: "fadeIn 0.2s ease" }}>
      {/* Simulation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "rgba(139, 92, 246, 0.15)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem"
          }}>
            {selectedScenario.title.split(" ")[0]}
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem" }}>{selectedScenario.title.split(" ").slice(1).join(" ")}</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rol: {selectedScenario.character}</p>
          </div>
        </div>

        <button onClick={handleReset} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
          Senaryodan Çık
        </button>
      </div>

      {errorMsg && (
        <div className="badge badge-danger" style={{ padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem" }}>
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="chat-window" style={{ flex: 1 }}>
        {messages.map((msg, idx) => (
          <React.Fragment key={idx}>
            {/* If there is a correction from the previous message, render it BEFORE the bot's response */}
            {msg.role === "assistant" && msg.correction && (
              <div className="glass-card" style={{
                alignSelf: "flex-start",
                width: "90%",
                maxWidth: "600px",
                borderLeft: "4px solid var(--color-warning)",
                background: "rgba(245, 158, 11, 0.04)",
                padding: "15px",
                borderRadius: "8px",
                marginTop: "5px",
                animation: "fadeIn 0.3s ease"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-warning)", fontWeight: "700", fontSize: "0.85rem", marginBottom: "8px" }}>
                  <AlertCircle size={16} /> Akıllı Düzeltme (Smart Correction)
                </div>
                <div className="correction-wrong">Hatalı: "{msg.correction.wrongText}"</div>
                <div className="correction-right">Doğal Hali: "{msg.correction.correctText}"</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                  💡 <b>Açıklama:</b> {msg.correction.explanation}
                </div>
              </div>
            )}

            {/* Bubble */}
            <div className={`chat-bubble ${msg.role}`}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                <span>{msg.content}</span>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => replayMessageTTS(msg.content)}
                    className="btn btn-secondary btn-icon"
                    style={{ width: "24px", height: "24px", minHeight: "24px", padding: 0, flexShrink: 0, background: "transparent", borderColor: "transparent" }}
                    title="Tekrar Dinle"
                  >
                    <Volume2 size={12} style={{ color: "var(--text-muted)" }} />
                  </button>
                )}
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* Finished Reward Screen */}
        {finished && (
          <div className="glass-card" style={{
            alignSelf: "center",
            textAlign: "center",
            maxWidth: "400px",
            padding: "30px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            background: "rgba(16, 185, 129, 0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            marginTop: "10px"
          }}>
            <Award size={48} style={{ color: "var(--color-success)" }} />
            <h3 style={{ color: "#34d399" }}>Simülasyon Tamamlandı!</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Harika! İngilizce konuşma ritminizi ve özgüveninizi geliştirmek için çok önemli bir adım attınız. Yeni senaryoları deneyin.
            </p>
            <button onClick={handleReset} className="btn btn-primary" style={{ width: "100%" }}>
              Diğer Senaryolara Dön
            </button>
          </div>
        )}

        {loading && (
          <div className="chat-bubble assistant" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 15px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Yazıyor...</span>
            <RefreshCw className="animate-spin" size={14} style={{ color: "var(--color-primary)" }} />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input controls */}
      {!finished && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Quick Hints display */}
          {selectedScenario.steps[currentStepIdx]?.hints && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>💡 İpuçları (Tıklayıp Kullan):</span>
              {selectedScenario.steps[currentStepIdx].hints.map((hint, hIdx) => (
                <button
                  key={hIdx}
                  onClick={() => setInputVal(hint)}
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px" }}
                >
                  {hint}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-area">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`btn btn-secondary btn-icon ${isListening ? "listening" : ""}`}
              style={{
                width: "48px",
                height: "48px",
                flexShrink: 0,
                borderColor: isListening ? "var(--color-danger)" : "var(--border-glass)",
                background: isListening ? "rgba(239, 68, 68, 0.1)" : "transparent"
              }}
              title={isListening ? "Dinlemeyi Kapat" : "Konuşarak Cevap Ver"}
            >
              <Mic size={18} style={{ color: isListening ? "var(--color-danger)" : "var(--color-primary)" }} />
            </button>

            <input
              type="text"
              className="form-input"
              placeholder={isListening ? "Konuşmanız yazıya dökülüyor..." : "Mesajınızı buraya yazın..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={loading}
              style={{ flex: 1, height: "48px" }}
            />

            <button
              onClick={handleSendMessage}
              disabled={loading || !inputVal.trim()}
              className="btn btn-primary"
              style={{ padding: "0 18px", height: "48px" }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
