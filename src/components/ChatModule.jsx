import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  RefreshCw, 
  Volume2, 
  AlertCircle,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { SpeechRecognizer, speakText, stopSpeaking } from "../utils/speech";
import { evaluateSentenceLocally } from "../utils/diagnostics";
import { hasApiKey, callGeminiAPI, COACH_SYSTEM_PROMPT } from "../utils/gemini";

export default function ChatModule() {
  const [level, setLevel] = useState("intermediate"); // beginner, intermediate, advanced
  const [speed, setSpeed] = useState(0.9);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // States for Continuous Voice Chat Mode
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState("idle"); // idle, listening, processing, speaking
  const [lastUserSpeech, setLastUserSpeech] = useState("");
  const [lastCoachResponse, setLastCoachResponse] = useState("");
  const [activeCorrection, setActiveCorrection] = useState(null);
  const [voiceMuted, setVoiceMuted] = useState(false);

  const recognizerRef = useRef(null);
  const chatEndRef = useRef(null);
  const voiceActiveRef = useRef(false);


  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer();
    // Welcome message
    const welcome = "Hello! I am your English speaking partner today. What would you like to talk about? We can talk about your day, travel, technology, or anything you like!";
    setMessages([{ role: "assistant", content: welcome, correction: null }]);
    setTimeout(() => {
      speakText(welcome, speed);
    }, 500);

    return () => {
      voiceActiveRef.current = false;
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  // Voice Chat Handlers
  const startVoiceChat = async () => {
    voiceActiveRef.current = true;
    setVoiceMode(true);
    setVoiceMuted(false);
    
    const welcome = "Hello! I am your English voice coach. Let's practice speaking. Just talk to me, and I will reply.";
    setLastCoachResponse(welcome);
    setVoiceState("speaking");
    setActiveCorrection(null);
    setLastUserSpeech("");
    
    try {
      await speakText(welcome, speed);
    } catch (err) {
      console.error(err);
    }
    
    if (voiceActiveRef.current) {
      triggerVoiceLoop();
    }
  };

  const endVoiceChat = () => {
    voiceActiveRef.current = false;
    stopSpeaking();
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setVoiceMode(false);
    setVoiceState("idle");
  };

  const handleToggleMute = () => {
    if (voiceMuted) {
      setVoiceMuted(false);
      if (voiceState === "muted") {
        setVoiceState("listening");
        triggerVoiceLoop();
      }
    } else {
      setVoiceMuted(true);
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setVoiceState("muted");
    }
  };

  const triggerVoiceLoop = () => {
    if (!voiceActiveRef.current || voiceMuted) return;
    
    setVoiceState("listening");
    
    recognizerRef.current.start(
      () => {
        // start callback
      },
      async (transcript) => {
        if (!voiceActiveRef.current || voiceMuted) return;
        setLastUserSpeech(transcript);
        setVoiceState("processing");
        
        const updatedMsgs = [...messages, { role: "user", content: transcript }];
        setMessages(updatedMsgs);
        
        let coachReply = "";
        let correctionData = null;
        
        try {
          if (hasApiKey()) {
            const systemPrompt = `
You are a friendly, encouraging English speaking companion.
The user wants to practice English. Current difficulty level is: ${level.toUpperCase()}.
Keep your response brief (max 2 short sentences) so that it is easy to listen to.

Follow these rules:
1. Smart Correction (Akıllı Düzeltme): Check the user's message for major errors. If found, explain them briefly in Turkish and provide a natural alternative.
2. Format response as a JSON:
{
  "correction": {
    "hasError": true/false,
    "wrongText": "...",
    "correctText": "...",
    "explanation": "..."
  },
  "coachResponse": "Your next conversational question/response."
}
            `;
            const result = await callGeminiAPI(
              updatedMsgs.map(m => ({ role: m.role, content: m.content })),
              systemPrompt
            );
            coachReply = result.coachResponse;
            correctionData = result.correction?.hasError ? result.correction : null;
          } else {
            // Offline mock fallback
            correctionData = evaluateSentenceLocally(transcript);
            const mockResponses = [
              "That is very interesting. Tell me more about it.",
              "Nice! How long have you been doing that?",
              "Cool. What do you plan to do next?",
              "Awesome! Let's talk more about it."
            ];
            coachReply = mockResponses[Math.floor(Math.random() * mockResponses.length)] + " (Not: Gemini API key girilmediği için yerel simülasyondur.)";
          }
          
          setLastCoachResponse(coachReply);
          setActiveCorrection(correctionData);
          setMessages(prev => [...prev, { role: "assistant", content: coachReply, correction: correctionData }]);
          
          if (voiceActiveRef.current && !voiceMuted) {
            setVoiceState("speaking");
            await speakText(coachReply, speed);
          }
          
        } catch (err) {
          console.error(err);
          const errorMsg = "Sorry, I had trouble processing that. Let's try again.";
          setLastCoachResponse(errorMsg);
          if (voiceActiveRef.current && !voiceMuted) {
            setVoiceState("speaking");
            await speakText(errorMsg, speed);
          }
        }
        
        if (voiceActiveRef.current && !voiceMuted) {
          triggerVoiceLoop();
        }
      },
      (err) => {
        console.error("Voice recognition error in loop:", err);
        // Restart loop if still active after a short delay
        if (voiceActiveRef.current && !voiceMuted) {
          setTimeout(() => {
            triggerVoiceLoop();
          }, 1500);
        }
      },
      () => {
        // end callback
      }
    );
  };


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartListening = () => {
    if (!recognizerRef.current || !recognizerRef.current.supported) {
      setErrorMsg("Ses tanıma tarayıcınızda desteklenmiyor.");
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
        setErrorMsg(`Mikrofon hatası: ${err}`);
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

    const updatedMessages = [...messages, { role: "user", content: userText }];
    setMessages(updatedMessages);

    try {
      if (hasApiKey()) {
        // ONLINE DYNAMIC MODE
        const systemPrompt = `
You are a friendly, encouraging English speaking companion.
The user wants to practice English. Current difficulty level is: ${level.toUpperCase()}.
Adjust your vocabulary complexity, sentence length, and syntax to fit this level:
- BEGINNER: Use extremely simple words, Present Simple tense mostly, short sentences (max 8 words).
- INTERMEDIATE: Average daily English.
- ADVANCED: Complex sentences, idioms, phrasal verbs.

Follow these rules:
1. Smart Correction (Akıllı Düzeltme): Check the user's message for major errors. If found, explain them briefly in Turkish and provide a natural alternative.
2. Keep the conversation engaging. Ask one clear question back.
3. If they repeat mistakes, point it out gently.

Format response as a JSON:
{
  "correction": {
    "hasError": true/false,
    "wrongText": "...",
    "correctText": "...",
    "explanation": "..."
  },
  "coachResponse": "Your next conversational question/response."
}
        `;

        const response = await callGeminiAPI(
          updatedMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt
        );

        setMessages(prev => [...prev, {
          role: "assistant",
          content: response.coachResponse,
          correction: response.correction?.hasError ? response.correction : null
        }]);

        speakText(response.coachResponse, speed);
      } else {
        // OFFLINE MOCK MODE
        // Local response generation
        const localCorrection = evaluateSentenceLocally(userText);
        
        setTimeout(() => {
          const mockResponses = [
            "That sounds very interesting! Tell me more about it.",
            "I see! What is your favorite thing about that?",
            "That is cool. How often do you do that?",
            "Indeed! What do you plan to do next?",
            "I agree with you. It is a great way to spend time."
          ];
          const randomIdx = Math.floor(Math.random() * mockResponses.length);
          const responseText = mockResponses[randomIdx];

          setMessages(prev => [...prev, {
            role: "assistant",
            content: `${responseText} (Not: Gemini API key ayarlanmadığı için bu yerel bir simülasyon cevabıdır.)`,
            correction: localCorrection.hasError ? localCorrection : null
          }]);

          speakText(responseText, speed);
          setLoading(false);
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Yanıt alınamadı. Gemini API veya internet bağlantınızı kontrol edin.");
    } finally {
      if (hasApiKey()) setLoading(false);
    }
  };

  const handleReset = () => {
    const welcome = "Let's start our conversation fresh! What is on your mind today?";
    setMessages([{ role: "assistant", content: welcome, correction: null }]);
    setInputVal("");
    setErrorMsg("");
    speakText(welcome, speed);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: "15px", animation: "fadeIn 0.2s ease" }}>
      {/* Header controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "1.6rem" }}>
            <Sparkles size={24} style={{ color: "var(--color-primary)" }} />
            Sürekli Eğitim (AI Chat Partner)
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Seviyenize göre otomatik ayarlanan, ucu açık konuşma arkadaşı.</p>
        </div>

        {/* Level and Speed Selection */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div>
            <select
              className="form-input"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{ padding: "6px 12px", fontSize: "0.8rem", width: "130px", background: "#131327" }}
            >
              <option value="beginner">Başlangıç (Simple)</option>
              <option value="intermediate">Orta (Normal)</option>
              <option value="advanced">İleri (Fluent)</option>
            </select>
          </div>

          <div>
            <select
              className="form-input"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ padding: "6px 12px", fontSize: "0.8rem", width: "120px", background: "#131327" }}
            >
              <option value={0.75}>Hız: Yavaş</option>
              <option value={0.95}>Hız: Normal</option>
              <option value={1.15}>Hız: Hızlı</option>
            </select>
          </div>

          <button onClick={handleReset} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
            Temizle
          </button>

          <button 
            onClick={voiceMode ? endVoiceChat : startVoiceChat} 
            className={`btn ${voiceMode ? "btn-danger" : "btn-primary"}`}
            style={{ padding: "6px 12px", fontSize: "0.8rem", gap: "6px" }}
          >
            {voiceMode ? "📞 Arama Kapat" : "🎙️ Sesli Sohbet"}
          </button>
        </div>
      </div>

      {voiceMode ? (
        // ================= VOICE MODE ROOM VIEW =================
        <div className="voice-room-container">
          <div style={{ position: "absolute", top: "15px", right: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
            <span className="badge badge-primary">Sesli Oda: {level.toUpperCase()}</span>
          </div>

          {/* Voice Circle Visualizer Reacting to States */}
          <div className={`voice-circle-container ${voiceState}`}>
            <div className={`voice-circle ${voiceState}`}>
              {voiceState === "listening" ? "🎙️" : voiceState === "processing" ? "🧠" : voiceState === "speaking" ? "🔊" : "🔇"}
            </div>
            <div className="pulse-ring" />
            <div className="pulse-ring" style={{ animationDelay: "0.5s" }} />
          </div>

          <div style={{ fontSize: "1.1rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: 
            voiceState === "listening" ? "var(--color-success)" : 
            voiceState === "processing" ? "var(--color-warning)" : 
            voiceState === "speaking" ? "var(--color-secondary)" : "var(--text-muted)" 
          }}>
            {voiceState === "listening" ? "Sizi Dinliyorum..." : 
             voiceState === "processing" ? "AI Düşünüyor..." : 
             voiceState === "speaking" ? "AI Konuşuyor..." : "Mikrofon Sessizde"}
          </div>

          {/* Subtitles Overlay */}
          <div className="subtitle-area">
            {lastUserSpeech && (
              <div className="sub-user">
                🗣️ "{lastUserSpeech}"
              </div>
            )}
            {lastCoachResponse && (
              <div className="sub-coach">
                👩‍🏫 "{lastCoachResponse.replace(/\(Not:.*?\)/g, "").trim()}"
              </div>
            )}
          </div>

          {/* Active Grammar Correction Card */}
          {activeCorrection && (
            <div className="glass-card" style={{
              borderLeft: "4px solid var(--color-warning)",
              background: "rgba(245, 158, 11, 0.05)",
              padding: "15px",
              borderRadius: "10px",
              maxWidth: "450px",
              animation: "fadeIn 0.3s ease",
              marginTop: "10px",
              textAlign: "left"
            }}>
              <div style={{ color: "var(--color-warning)", fontWeight: "700", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                <AlertCircle size={14} /> Gramer Akıllı Uyarısı
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                <b>Düzeltme:</b> "{activeCorrection.wrongText}" ➔ <span style={{ color: "#34d399" }}>"{activeCorrection.correctText}"</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                {activeCorrection.explanation}
              </div>
            </div>
          )}

          {/* Call Control Footer */}
          <div style={{ display: "flex", gap: "15px", marginTop: "20px", zIndex: 3 }}>
            <button
              onClick={handleToggleMute}
              className={`btn btn-secondary ${voiceMuted ? "btn-danger" : ""}`}
              style={{ padding: "12px 20px", borderRadius: "30px", border: "1px solid var(--border-glass)" }}
            >
              {voiceMuted ? "🔇 Mikrofonu Aç" : "🎤 Sessize Al"}
            </button>
            
            <button
              onClick={endVoiceChat}
              className="btn btn-danger"
              style={{ padding: "12px 30px", borderRadius: "30px", fontWeight: "700" }}
            >
              📞 Aramayı Kapat
            </button>
          </div>
        </div>
      ) : (
        // ================= TEXT CHAT VIEW =================
        <>
          {errorMsg && (
            <div className="badge badge-danger" style={{ padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem" }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chat logs */}
          <div className="chat-window" style={{ flex: 1 }}>
            {messages.map((msg, idx) => (
              <React.Fragment key={idx}>
                {/* Render correction box if needed */}
                {msg.role === "assistant" && msg.correction && msg.correction.hasError && (
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
                        onClick={() => speakText(msg.content.replace(/\(Not:.*?\)/g, "").trim(), speed)}
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

            {loading && (
              <div className="chat-bubble assistant" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 15px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>AI düşünüyor ve analiz ediyor...</span>
                <RefreshCw className="animate-spin" size={14} style={{ color: "var(--color-primary)" }} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input panel */}
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
              title={isListening ? "Dinlemeyi Durdur" : "Konuşmaya Başla"}
            >
              <Mic size={18} style={{ color: isListening ? "var(--color-danger)" : "var(--color-primary)" }} />
            </button>

            <input
              type="text"
              className="form-input"
              placeholder={isListening ? "Konuşun..." : "İngilizce bir şeyler yazın ya da ses kaydıyla konuşun..."}
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

          {/* Tip for Gemini */}
          {!hasApiKey() && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-muted)", justifyContent: "center" }}>
              <TrendingUp size={12} style={{ color: "var(--color-primary)" }} />
              <span>Dinamik ve özelleştirilmiş bir yapay zeka sohbeti için Ayarlar'dan Gemini API Anahtarı girebilirsiniz.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
