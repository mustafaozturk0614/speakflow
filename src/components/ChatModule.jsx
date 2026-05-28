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

  const recognizerRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer();
    // Welcome message
    const welcome = "Hello! I am your English speaking partner today. What would you like to talk about? We can talk about your day, travel, technology, or anything you like!";
    setMessages([{ role: "assistant", content: welcome, correction: null }]);
    setTimeout(() => {
      speakText(welcome, speed);
    }, 500);

    return () => {
      stopSpeaking();
    };
  }, []);

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
        </div>
      </div>

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
    </div>
  );
}
