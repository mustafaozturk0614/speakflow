import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Mic, 
  MicOff, 
  Send, 
  RefreshCw, 
  Award, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Play
} from "lucide-react";
import { diagnosticQuestions } from "../utils/mockData";
import { SpeechRecognizer, speakText } from "../utils/speech";
import { runFullDiagnostic, evaluateSentenceLocally } from "../utils/diagnostics";
import { hasApiKey, callGeminiAPI, DIAGNOSTIC_SYSTEM_PROMPT } from "../utils/gemini";

export default function DiagnosticModule() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({ 1: "", 2: "", 3: "", 4: "", 5: "" });
  const [inputVal, setInputVal] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [recognizer, setRecognizer] = useState(null);

  useEffect(() => {
    const rec = new SpeechRecognizer();
    setRecognizer(rec);
  }, []);

  const currentQuestion = diagnosticQuestions[currentIdx];

  const handleStartListening = () => {
    if (!recognizer || !recognizer.supported) {
      setErrorMsg("Tarayıcınızda Ses Tanıma (Speech Recognition) desteklenmiyor. Lütfen Chrome, Edge veya Safari kullanın ya da cevabınızı yazın.");
      return;
    }
    setErrorMsg("");
    
    recognizer.start(
      () => {
        setIsListening(true);
      },
      (transcript) => {
        setInputVal((prev) => prev ? prev + " " + transcript : transcript);
      },
      (error) => {
        console.error("Speech Recognition Error:", error);
        setErrorMsg(`Ses tanıma hatası: ${error}. Lütfen mikrofon izinlerini kontrol edin veya yazarak devam edin.`);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopListening = () => {
    if (recognizer) {
      recognizer.stop();
      setIsListening(false);
    }
  };

  const handleTextSubmit = () => {
    if (!inputVal.trim()) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: inputVal }));
    setInputVal("");
    handleStopListening();

    if (currentIdx < diagnosticQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleSkipOrNext = () => {
    setInputVal("");
    handleStopListening();
    if (currentIdx < diagnosticQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setInputVal(answers[diagnosticQuestions[currentIdx - 1].id] || "");
    }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (hasApiKey()) {
        // Send answers to Gemini API for diagnostic
        const systemPrompt = DIAGNOSTIC_SYSTEM_PROMPT;
        const messages = [
          {
            role: "user",
            content: JSON.stringify(
              diagnosticQuestions.map((q) => ({
                question: q.question,
                answer: answers[q.id] || "(Cevap verilmedi)"
              }))
            )
          }
        ];
        
        const geminiReport = await callGeminiAPI(messages, systemPrompt);
        setReport(geminiReport);
      } else {
        // Run locally
        const localReport = runFullDiagnostic(answers);
        setReport(localReport);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Değerlendirme yapılırken hata oluştu. Gemini API bağlantısı veya JSON ayrıştırma başarısız oldu. Yerel analiz çalıştırılıyor...");
      // Fallback to local
      const localReport = runFullDiagnostic(answers);
      setReport(localReport);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setAnswers({ 1: "", 2: "", 3: "", 4: "", 5: "" });
    setInputVal("");
    setReport(null);
    setErrorMsg("");
  };

  const playTTSQuestion = () => {
    speakText(currentQuestion.question, 0.95);
  };

  // Diagnostic Results Screen
  if (report) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ marginBottom: "5px" }}>Kişisel Konuşma Teşhis Raporu</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Cevaplarınız ve ses ritminiz üzerinden oluşturulan profiliniz.</p>
          </div>
          <button onClick={handleReset} className="btn btn-secondary" style={{ gap: "8px" }}>
            <RefreshCw size={16} /> Yeniden Test Et
          </button>
        </div>

        {/* Scores Cards */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div className="glass-card" style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "25px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "15px" }}>Akıcılık Düzeyi</span>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: `8px solid ${report.fluencyScore > 60 ? "var(--color-success)" : "var(--color-warning)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: "800",
              color: report.fluencyScore > 60 ? "#34d399" : "#fbbf24",
              marginBottom: "15px",
              boxShadow: `0 0 20px ${report.fluencyScore > 60 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)"}`
            }}>
              {report.fluencyScore}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Hız, duraklamalar ve bağlantı ifadeleri (connectors) kullanımı.</p>
          </div>

          <div className="glass-card" style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "25px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "15px" }}>Özgüven & Ritmi</span>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: `8px solid ${report.confidenceScore > 60 ? "var(--color-success)" : "var(--color-warning)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: "800",
              color: report.confidenceScore > 60 ? "#34d399" : "#fbbf24",
              marginBottom: "15px",
              boxShadow: `0 0 20px ${report.confidenceScore > 60 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)"}`
            }}>
              {report.confidenceScore}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sessiz harflere sığınma, korku derecesi ve tereddüt sıklığı.</p>
          </div>
        </div>

        {/* Mental Blocks */}
        <div className="glass-card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
          <h4 style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <Activity size={18} /> Zihinsel Blokaj Analizi
          </h4>
          <p style={{ lineHeight: "1.6" }}>{report.mentalBlocks}</p>
        </div>

        {/* Recurring Errors */}
        <div className="glass-card">
          <h4 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
            <AlertCircle size={18} style={{ color: "var(--color-danger)" }} /> Tespit Edilen Tekrar Eden Hatalar
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {report.recurringErrors && report.recurringErrors.map((err, idx) => (
              <div key={idx} className="correction-box" style={{ margin: 0 }}>
                {err.error && err.error !== "Yok" ? (
                  <>
                    <div className="correction-wrong">Söylediğiniz: "{err.error}"</div>
                    <div className="correction-right">Doğal Hali: "{err.correction}"</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      💡 <b>Neden Hatalı:</b> {err.explanation}
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)" }}>
                    <CheckCircle size={16} />
                    <span>Tebrikler! Belirgin bir gramer veya kelime hatası bulunamadı.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass-card" style={{ borderLeft: "4px solid var(--color-success)" }}>
          <h4 style={{ color: "var(--color-success)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <Award size={18} /> Eylem Planı & Öneriler
          </h4>
          <p style={{ lineHeight: "1.6" }}>{report.recommendations}</p>
        </div>
      </div>
    );
  }

  // Diagnostic Quiz Screen
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, animation: "fadeIn 0.2s ease" }}>
      {/* Header */}
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Activity size={32} style={{ color: "var(--color-primary)" }} />
          Gerçek Teşhis (Diagnosis)
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          İngilizce seviyenizi, zihinsel bariyerlerinizi, tekrarlayan konuşma hatalarınızı ve akıcılık katsayınızı teşhis edin.
        </p>
      </div>

      {errorMsg && (
        <div className="badge badge-danger" style={{ padding: "12px", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem" }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Question Card */}
      <div className="glass-panel" style={{ padding: "35px", display: "flex", flexDirection: "column", gap: "25px", position: "relative" }}>
        {/* Progress Tracker */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="badge badge-primary">Soru {currentIdx + 1} / 5</span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Odak: {currentQuestion.focus}</span>
        </div>

        {/* Question TTS Control */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button 
            onClick={playTTSQuestion} 
            className="btn btn-secondary btn-icon" 
            style={{ width: "45px", height: "45px", background: "rgba(139, 92, 246, 0.15)", borderColor: "rgba(139, 92, 246, 0.3)" }}
            title="Sesi Dinle"
          >
            <Play size={18} style={{ color: "var(--color-primary)" }} />
          </button>
          <h2 style={{ fontSize: "1.4rem", lineHeight: "1.4", flex: 1 }}>{currentQuestion.question}</h2>
        </div>

        {/* User Response Area */}
        <div style={{ position: "relative", marginTop: "15px" }}>
          <textarea
            className="form-input"
            rows={5}
            placeholder="Cevabınızı buraya yazabilir ya da aşağıdaki mikrofon düğmesini kullanarak sesli konuşabilirsiniz..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{ fontSize: "1.1rem", lineHeight: "1.5", resize: "none", padding: "18px" }}
          />

          {/* Voice Input Section */}
          <div className="mic-button-container">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`mic-button ${isListening ? "listening" : ""}`}
              style={{ width: "60px", height: "60px" }}
              title={isListening ? "Kaydı Durdur" : "Ses kaydını başlat ve konuş"}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <span style={{ fontSize: "0.8rem", color: isListening ? "var(--color-danger)" : "var(--text-muted)", marginTop: "10px", fontWeight: "600" }}>
              {isListening ? "Sizi dinliyorum, lütfen İngilizce konuşun..." : "Sesle Yanıt Vermek İçin Tıklayın"}
            </span>

            {isListening && (
              <div className="speech-wave listening">
                <span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "20px", marginTop: "10px" }}>
          <button onClick={handlePrevious} disabled={currentIdx === 0} className="btn btn-secondary" style={{ opacity: currentIdx === 0 ? 0.3 : 1 }}>
            Geri
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSkipOrNext} className="btn btn-secondary">
              Geç
            </button>
            <button onClick={handleTextSubmit} disabled={!inputVal.trim()} className="btn btn-primary" style={{ gap: "8px" }}>
              <span>Cevabı Kaydet</span>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Answer Summary and Analysis Activation */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <h4 style={{ fontSize: "1rem" }}>Kaydedilen Cevaplarınız</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
          {[1, 2, 3, 4, 5].map((id) => (
            <div
              key={id}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: answers[id] ? "var(--color-success)" : "var(--border-glass)",
                background: answers[id] ? "rgba(16, 185, 129, 0.05)" : "rgba(255, 255, 255, 0.01)",
                textAlign: "center",
                fontSize: "0.85rem",
                color: answers[id] ? "#34d399" : "var(--text-muted)",
                fontWeight: "600"
              }}
            >
              Cevap {id} {answers[id] ? "✓" : "-"}
            </div>
          ))}
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loading || Object.values(answers).every((x) => x === "")}
          className="btn btn-primary"
          style={{ width: "100%", gap: "10px", marginTop: "10px", padding: "14px" }}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={18} />
              <span>Analiz Yapılıyor, Lütfen Bekleyin...</span>
            </>
          ) : (
            <>
              <Activity size={18} />
              <span>Cevaplarımı Analiz Et ve Seviyemi Teşhis Et</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
