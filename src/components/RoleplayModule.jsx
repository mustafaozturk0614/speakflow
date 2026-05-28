import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Volume2, 
  Mic, 
  MicOff, 
  AlertCircle, 
  Sparkles, 
  CheckCircle, 
  Phone, 
  PhoneOff, 
  ArrowLeft, 
  HelpCircle, 
  Award, 
  Info,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { SpeechRecognizer, speakText, stopSpeaking } from "../utils/speech";
import { evaluateSentenceLocally } from "../utils/diagnostics";
import { hasApiKey, callGeminiAPI } from "../utils/gemini";
import { awardXP, completeDailyTask, logMistake } from "../utils/gamification";

const scenarios = [
  {
    id: "vas_meeting",
    title: "VAS / Telekom Toplantısı",
    role: "CP (İçerik Sağlayıcı) Yöneticisi",
    partner: "David (VAS İş Ortaklığı Müdürü)",
    avatar: "👨‍💼",
    difficulty: "B1",
    theme: "purple",
    context: "Bir katma değerli servisler (VAS) toplayıcısı (Aggregator) ile yeni mobil üyelik servisinin Gelir Paylaşımı (Revenue Share) oranlarını ve faturalama denemelerini (billing attempts) tartışın.",
    keyVocab: ["Revenue Share", "Billing Attempts", "Compliance", "Aggregator", "MT/MO SMS"],
    intro: "Hello, thank you for joining today's meeting. We need to agree on the revenue share split for the new subscription service. Our standard aggregator offer is a 60-40 split in our favor. What do you think?",
    hints: [
      { en: "I suggest a 70-30 revenue share split in our favor.", tr: "Bizim lehine %70-%30 gelir paylaşımı oranı öneriyorum." },
      { en: "What is your standard rate for billing attempts?", tr: "Faturalandırma denemeleri için standart oranınız nedir?" },
      { en: "We need a lower setup fee for this compliance process.", tr: "Bu uyumluluk süreci için daha düşük bir kurulum ücretine ihtiyacımız var." }
    ]
  },
  {
    id: "cafe",
    title: "Kafede Kahve Siparişi",
    role: "Müşteri",
    partner: "Emma (Barista)",
    avatar: "☕",
    difficulty: "A1-A2",
    theme: "amber",
    context: "Londra'da yoğun bir kafedesiniz. Sıra size geldiğinde hızlıca kahve ve yiyecek siparişi vermelisiniz.",
    keyVocab: ["Flat White", "Croissant", "Take away", "Eat-in", "Still water"],
    intro: "Hello there! Welcome to Coffee House. What can I get started for you today?",
    hints: [
      { en: "I would like to get a medium flat white and a warm croissant, please.", tr: "Orta boy bir flat white ve sıcak bir kruvasan rica ediyorum." },
      { en: "Can I have it to go, please?", tr: "Paket servis (götürmek için) olabilir mi lütfen?" },
      { en: "How much is it in total?", tr: "Toplam ne kadar tutuyor?" }
    ]
  },
  {
    id: "airport",
    title: "Havalimanı Gümrük Kontrolü",
    role: "Yolcu",
    partner: "Officer Jones (Gümrük Memuru)",
    avatar: "👮",
    difficulty: "A1-A2",
    theme: "emerald",
    context: "New York havalimanına iniş yaptınız. Gümrük kontrolünden geçerken seyahat amacınızı ve yanınızdaki eşyaları beyan etmelisiniz.",
    keyVocab: ["Declare", "Passport", "Business trip", "Vacation", "Luggage"],
    intro: "Good afternoon. Please hand me your passport. What is the main purpose of your visit to the United States?",
    hints: [
      { en: "I am here on a business trip for a tech conference.", tr: "Bir teknoloji konferansı için iş gezisi amacıyla buradayım." },
      { en: "I have nothing to declare, only my personal belongings.", tr: "Beyan edecek bir şeyim yok, sadece kişisel eşyalarım." },
      { en: "I will be staying at the Grand Plaza Hotel for five days.", tr: "Beş gün boyunca Grand Plaza Otel'de kalacağım." }
    ]
  },
  {
    id: "job_interview",
    title: "Yazılım İş Görüşmesi",
    role: "Yazılım Geliştirici Adayı",
    partner: "Sarah (Teknoloji İK Yetkilisi)",
    avatar: "👩‍💻",
    difficulty: "A2-B1",
    theme: "blue",
    context: "Yabancı bir teknoloji şirketi için React geliştirici pozisyonuna başvurdunuz. İK yetkilisi ile ön görüşme yapıyorsunuz.",
    keyVocab: ["Database", "Experience", "Framework", "Remote work", "Team player"],
    intro: "Hi! Thanks for joining the interview call today. Can you tell me a little bit about your technical background and your experience with React?",
    hints: [
      { en: "I have three years of experience building web apps with React and JavaScript.", tr: "React ve JavaScript ile web uygulamaları geliştirme konusunda 3 yıllık deneyimim var." },
      { en: "I prefer working in a remote environment with flexible hours.", tr: "Esnek çalışma saatlerine sahip uzaktan çalışma ortamını tercih ederim." },
      { en: "I worked closely with backend teams to integrate REST APIs.", tr: "REST API'leri entegre etmek için backend ekipleriyle yakın çalıştım." }
    ]
  },
  {
    id: "hotel",
    title: "Otel Giriş İşlemi (Check-in)",
    role: "Müşteri",
    partner: "Michael (Otel Resepsiyonisti)",
    avatar: "🏨",
    difficulty: "A1-A2",
    theme: "indigo",
    context: "New York'ta bir butik otelin lobisindesiniz. Önceden yaptırdığınız rezervasyonu beyan edip anahtar kartınızı almalısınız.",
    keyVocab: ["Reservation", "ID card", "Check-in", "Key card", "Room number"],
    intro: "Hello, welcome to the Grand Plaza Hotel. How can I help you today?",
    hints: [
      { en: "Hello, I have a reservation under the name of Mustafa.", tr: "Merhaba, Mustafa adına bir rezervasyonum var." },
      { en: "Here is my ID card and my booking confirmation.", tr: "İşte kimlik kartım ve rezervasyon onay belgem." },
      { en: "Does the room price include free breakfast and Wi-Fi?", tr: "Oda fiyatına ücretsiz kahvaltı ve Wi-Fi dahil mi?" }
    ]
  }
];

const getOfflineResponse = (scenarioId, turnCount, userText) => {
  const text = userText.toLowerCase();
  
  if (scenarioId === "cafe") {
    if (turnCount === 1) {
      return "Sure, what size would you like? We have small, medium, and large.";
    } else if (turnCount === 2) {
      return "Perfect. And would you like any pastries or snacks with that? Our croissants are fresh.";
    } else if (turnCount === 3) {
      return "Excellent. Will that be eat-in or take-away today?";
    } else if (turnCount === 4) {
      return "Alright. That will be five pounds and fifty pence in total, please. Cash or card?";
    } else {
      return "Thank you. Your order will be ready at the counter in a minute. Have a wonderful day!";
    }
  }
  
  if (scenarioId === "vas_meeting") {
    if (turnCount === 1) {
      return "I see. A seventy-thirty split might be difficult because our platform setup and compliance checks cost a lot. Could you do sixty-five thirty-five?";
    } else if (turnCount === 2) {
      return "That sounds more reasonable. Regarding billing attempts, we will attempt to charge the subscriber once a day for up to seven days during the grace period. Is that okay?";
    } else if (turnCount === 3) {
      return "Okay, great. For MT and MO SMS routing, we need you to comply with our local operator guidelines to avoid filtering. When can you submit the landing page for review?";
    } else {
      return "Perfect. I will send you the contract details via email. Let's finish the setup by next week. Thank you!";
    }
  }
  
  if (scenarioId === "airport") {
    if (turnCount === 1) {
      return "Thank you. And how long do you plan to stay in the United States?";
    } else if (turnCount === 2) {
      return "Alright. Where will you be staying during your visit?";
    } else if (turnCount === 3) {
      return "Understood. Are you carrying any food, plants, or currency over ten thousand dollars to declare?";
    } else if (turnCount === 4) {
      return "Good. Put your luggage through the scanner, please. Enjoy your stay!";
    } else {
      return "Thank you, you are cleared to go. Have a safe trip!";
    }
  }
  
  if (scenarioId === "job_interview") {
    if (turnCount === 1) {
      return "Excellent. That's a good amount of React experience. What database systems have you worked with, and how do you handle state management?";
    } else if (turnCount === 2) {
      return "I see. We use Redux Toolkit and PostgreSQL here. How do you feel about working in a remote team, and what is your preferred communication style?";
    } else if (turnCount === 3) {
      return "Great. We operate on a hybrid-remote model with daily standups. Finally, what are your salary expectations and your notice period?";
    } else {
      return "Wonderful. Thanks for sharing. We will get back to you by early next week. Have a great day!";
    }
  }
  
  if (scenarioId === "hotel") {
    if (turnCount === 1) {
      return "Certainly! May I please see your ID card or passport to verify your booking?";
    } else if (turnCount === 2) {
      return "Thank you, I found your reservation. You are booked for three nights. Could you please sign here and provide a credit card for incidentals?";
    } else if (turnCount === 3) {
      return "Perfect. Here is your key card. Your room is 402 on the fourth floor. Breakfast is served from 7 AM to 10 AM. Do you need help with your luggage?";
    } else {
      return "You're very welcome. Enjoy your stay with us at the Grand Plaza!";
    }
  }

  return "Okay, I understand. Can you tell me more about that?";
};

export default function RoleplayModule() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [dialogue, setDialogue] = useState([]);
  const [voiceState, setVoiceState] = useState("idle"); // idle, listening, processing, speaking, muted
  const [lastUserSpeech, setLastUserSpeech] = useState("");
  const [lastCoachResponse, setLastCoachResponse] = useState("");
  const [activeCorrection, setActiveCorrection] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [showHintBox, setShowHintBox] = useState(false);
  
  // Evaluation States
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const recognizerRef = useRef(null);
  const voiceActiveRef = useRef(false);
  const speed = 0.95;

  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer();
    return () => {
      voiceActiveRef.current = false;
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  const startCall = async (scenario) => {
    setSelectedScenario(scenario);
    setSessionActive(true);
    voiceActiveRef.current = true;
    setMicMuted(false);
    setShowHintBox(false);
    setShowReport(false);
    setReportData(null);
    setDialogue([{ role: "assistant", content: scenario.intro }]);
    setLastCoachResponse(scenario.intro);
    setLastUserSpeech("");
    setActiveCorrection(null);
    setVoiceState("speaking");

    try {
      await speakText(scenario.intro, speed);
    } catch (err) {
      console.error(err);
    }

    if (voiceActiveRef.current) {
      triggerVoiceLoop(scenario);
    }
  };

  const triggerVoiceLoop = (scenario) => {
    if (!voiceActiveRef.current || micMuted) return;
    setVoiceState("listening");

    recognizerRef.current.start(
      () => {},
      async (transcript) => {
        if (!voiceActiveRef.current || micMuted) return;
        setLastUserSpeech(transcript);
        setVoiceState("processing");

        const updatedDialogue = [...dialogue, { role: "user", content: transcript }];
        setDialogue(updatedDialogue);

        const userTurns = updatedDialogue.filter(m => m.role === "user").length;
        let partnerReply = "";
        let correctionData = null;

        try {
          if (hasApiKey()) {
            const systemPrompt = `
You are roleplaying as "${scenario.partner}" for the scenario "${scenario.title}".
The scenario context is: ${scenario.context}.
You are speaking to the user who is playing the role of "${scenario.role}".
Respond to their last message naturally and briefly (max 2 short sentences). Keep the English level appropriate for a ${scenario.difficulty} learner.

At the same time, check if they made any grammar mistakes.
Return your response as a JSON object:
{
  "reply": "Your next conversational roleplay line",
  "correction": {
    "hasError": true/false,
    "wrongText": "The wrong word or phrase they spoke",
    "correctText": "The corrected word or phrase",
    "explanation": "Simple explanation in Turkish"
  }
}
Respond ONLY with this JSON. Do not include markdown formatting.
            `;
            const result = await callGeminiAPI(
              updatedDialogue.map(m => ({ role: m.role, content: m.content })),
              systemPrompt
            );
            partnerReply = result.reply;
            correctionData = result.correction?.hasError ? result.correction : null;
            if (correctionData) {
              logMistake(correctionData.wrongText, correctionData.correctText, correctionData.explanation);
            }
          } else {
            // Local offline fallback
            partnerReply = getOfflineResponse(scenario.id, userTurns, transcript);
            correctionData = evaluateSentenceLocally(transcript);
            if (correctionData && correctionData.hasError) {
              logMistake(correctionData.wrongText, correctionData.correctText, correctionData.explanation);
            }
          }

          setLastCoachResponse(partnerReply);
          setActiveCorrection(correctionData);
          setDialogue(prev => [...prev, { role: "assistant", content: partnerReply, correction: correctionData }]);

          if (voiceActiveRef.current && !micMuted) {
            setVoiceState("speaking");
            await speakText(partnerReply, speed);
          }
        } catch (err) {
          console.error(err);
          const errorMsg = "Sorry, I missed that. Can you repeat?";
          setLastCoachResponse(errorMsg);
          if (voiceActiveRef.current && !micMuted) {
            setVoiceState("speaking");
            await speakText(errorMsg, speed);
          }
        }

        if (voiceActiveRef.current && !micMuted) {
          triggerVoiceLoop(scenario);
        }
      },
      (err) => {
        console.error("STT Error in Roleplay:", err);
        if (voiceActiveRef.current && !micMuted) {
          setTimeout(() => {
            triggerVoiceLoop(scenario);
          }, 1500);
        }
      },
      () => {}
    );
  };

  const handleToggleMute = () => {
    if (micMuted) {
      setMicMuted(false);
      if (voiceState === "muted") {
        setVoiceState("listening");
        triggerVoiceLoop(selectedScenario);
      }
    } else {
      setMicMuted(true);
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setVoiceState("muted");
    }
  };

  const endCallAndEvaluate = async () => {
    voiceActiveRef.current = false;
    stopSpeaking();
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setVoiceState("idle");
    setEvaluating(true);
    setShowReport(true);

    const userTurns = dialogue.filter(m => m.role === "user");
    const turnCount = userTurns.length;

    if (turnCount === 0) {
      setReportData({
        overallGrade: "F",
        xpEarned: 0,
        fluency: 0,
        grammar: 0,
        completion: 0,
        summary: "Görüşme yapılmadı. Herhangi bir cümle kurmadınız.",
        corrections: []
      });
      setEvaluating(false);
      return;
    }

    try {
      if (hasApiKey()) {
        const systemPrompt = `
You are an expert English teacher evaluating a roleplay conversation.
The scenario was: "${selectedScenario.title}" (Role: ${selectedScenario.role}).
Analyze this dialogue: ${JSON.stringify(dialogue)}.
Score the user on:
1. Fluency & Vocabulary (out of 100).
2. Grammar Accuracy (out of 100).
3. Completion of the scenario goal (out of 100).

Suggest an overall grade (A, B, C, D, or F).
Find all mistakes made by the user, provide correct English versions, and explain them in Turkish.
Provide a summary of feedback in Turkish.
Format your response as a JSON:
{
  "overallGrade": "A",
  "xpEarned": 40,
  "fluency": 85,
  "grammar": 80,
  "completion": 90,
  "summary": "Feedback in Turkish...",
  "corrections": [
    { "userText": "user's wrong phrase", "correctedText": "corrected phrase", "explanation": "Turkish explanation" }
  ]
}
Respond ONLY with this JSON.
        `;
        const result = await callGeminiAPI([], systemPrompt);
        setReportData(result);
        if (result.corrections && result.corrections.length > 0) {
          result.corrections.forEach(c => {
            logMistake(c.userText, c.correctedText, c.explanation);
          });
        }
      } else {
        // Local evaluation calculations
        let localCorrections = [];
        let grammarDeductions = 0;

        userTurns.forEach(turn => {
          const evalResult = evaluateSentenceLocally(turn.content);
          if (evalResult && evalResult.hasError) {
            localCorrections.push({
              userText: evalResult.wrongText,
              correctedText: evalResult.correctText,
              explanation: evalResult.explanation
            });
            logMistake(evalResult.wrongText, evalResult.correctText, evalResult.explanation);
            grammarDeductions += 12;
          }
        });

        const fluencyScore = Math.min(95, 60 + turnCount * 8 + (localCorrections.length === 0 ? 10 : 0));
        const grammarScore = Math.max(50, 100 - grammarDeductions);
        const completionScore = turnCount >= 4 ? 95 : turnCount === 3 ? 85 : turnCount === 2 ? 70 : 50;

        const avgScore = Math.round((fluencyScore + grammarScore + completionScore) / 3);
        let grade = "C";
        if (avgScore >= 90) grade = "A";
        else if (avgScore >= 80) grade = "B";
        else if (avgScore >= 60) grade = "D";
        else if (avgScore < 50) grade = "F";

        setReportData({
          overallGrade: grade,
          xpEarned: 40,
          fluency: fluencyScore,
          grammar: grammarScore,
          completion: completionScore,
          summary: `Tebrikler, ${selectedScenario.title} aramasını başarıyla tamamladınız. ${turnCount} konuşma sırası gerçekleştirdiniz.`,
          corrections: localCorrections
        });
      }

      // Award XP
      awardXP(40);
      completeDailyTask("task_presentation"); // satisfies speaking daily task
    } catch (err) {
      console.error(err);
      // Fallback in case of API failure during evaluation
      setReportData({
        overallGrade: "B",
        xpEarned: 40,
        fluency: 80,
        grammar: 85,
        completion: 90,
        summary: "Aramayı tamamladınız. Bağlantı hatası nedeniyle detaylı değerlendirme oluşturulamadı, ancak pratik XP puanınız eklendi!",
        corrections: []
      });
    } finally {
      setEvaluating(false);
    }
  };

  const handleSpeakText = (text) => {
    speakText(text, speed);
  };

  if (sessionActive) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Active Phone Call Room UI */}
        {!showReport ? (
          <div className="voice-room-container" style={{ minHeight: "550px" }}>
            
            {/* Header details */}
            <div style={{ position: "absolute", top: "20px", left: "20px", right: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.5rem" }}>{selectedScenario.avatar}</span>
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", color: "white" }}>{selectedScenario.title}</h4>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Rol: {selectedScenario.role}</span>
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "4px 8px" }}>
                Zorluk: {selectedScenario.difficulty}
              </span>
            </div>

            {/* Glowing avatar sphere */}
            <div className={`voice-circle-container ${voiceState}`}>
              <div className="pulse-ring"></div>
              <div className={`voice-circle ${voiceState}`}>
                {selectedScenario.avatar}
              </div>
            </div>

            {/* Speaking Partner Name and Status */}
            <div style={{ textAlign: "center", zIndex: 2 }}>
              <div style={{ fontSize: "1rem", fontWeight: "700", color: "white" }}>{selectedScenario.partner}</div>
              <div style={{ 
                fontSize: "0.8rem", 
                marginTop: "4px", 
                fontWeight: "600", 
                color: voiceState === "listening" ? "var(--color-success)" : 
                       voiceState === "processing" ? "var(--color-warning)" : 
                       voiceState === "speaking" ? "var(--color-secondary)" : "var(--text-muted)" 
              }}>
                {voiceState === "listening" ? "🎙️ Sizi Dinliyorum (Konuşun)..." : 
                 voiceState === "processing" ? "🧠 Yanıt Hazırlanıyor..." : 
                 voiceState === "speaking" ? "🔊 Karşı Taraf Konuşuyor..." : "🔇 Mikrofon Sessizde"}
              </div>
            </div>

            {/* Subtitles Area */}
            <div className="subtitle-area" style={{ minHeight: "80px" }}>
              {lastUserSpeech && (
                <div className="sub-user">
                  🗣️ "{lastUserSpeech}"
                </div>
              )}
              {lastCoachResponse && (
                <div className="sub-coach" style={{ fontSize: "1.05rem" }}>
                  "{lastCoachResponse.replace(/\(Not:.*?\)/g, "").trim()}"
                </div>
              )}
            </div>

            {/* Active grammar correction popup */}
            {activeCorrection && (
              <div className="glass-card" style={{
                borderLeft: "4px solid var(--color-warning)",
                background: "rgba(245, 158, 11, 0.05)",
                padding: "12px 15px",
                borderRadius: "8px",
                maxWidth: "450px",
                animation: "fadeIn 0.3s ease",
                textAlign: "left"
              }}>
                <div style={{ color: "var(--color-warning)", fontWeight: "700", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                  <AlertCircle size={14} /> Hata Tespit Edildi
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>
                  <b>Düzeltme:</b> "{activeCorrection.wrongText}" ➔ <span style={{ color: "#34d399" }}>"{activeCorrection.correctText}"</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {activeCorrection.explanation}
                </div>
              </div>
            )}

            {/* Floating Hint Box Helper */}
            {showHintBox ? (
              <div className="glass-card" style={{ width: "100%", maxWidth: "450px", padding: "15px", textAlign: "left", animation: "fadeIn 0.3s ease" }}>
                <h5 style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", color: "var(--color-primary)" }}>
                  <HelpCircle size={14} /> Tıkandın mı? Bu Cümleleri Deneyebilirsin:
                </h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedScenario.hints.map((hint, idx) => (
                    <div key={idx} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-glass)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#c084fc" }}>{hint.en}</span>
                        <button 
                          onClick={() => handleSpeakText(hint.en)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: "22px", height: "22px", border: "none" }}
                          title="Seslendir"
                        >
                          <Volume2 size={10} />
                        </button>
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>{hint.tr}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowHintBox(true)}
                className="btn btn-secondary"
                style={{ padding: "6px 14px", borderRadius: "15px", fontSize: "0.75rem" }}
              >
                💡 İpucu Cümlelerini Göster
              </button>
            )}

            {/* Call Controls */}
            <div style={{ display: "flex", gap: "12px", marginTop: "10px", zIndex: 3 }}>
              <button
                onClick={handleToggleMute}
                className={`btn btn-secondary ${micMuted ? "btn-danger" : ""}`}
                style={{ padding: "10px 18px", borderRadius: "25px", fontSize: "0.8rem" }}
              >
                {micMuted ? "🔇 Mikrofonu Aç" : "🎤 Sessize Al"}
              </button>
              
              <button
                onClick={endCallAndEvaluate}
                className="btn btn-danger"
                style={{ padding: "10px 25px", borderRadius: "25px", fontWeight: "700", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <PhoneOff size={14} /> Aramayı Bitir ve Puanla
              </button>
            </div>

          </div>
        ) : (
          
          // ================= EVALUATION REPORT CARD =================
          <div className="glass-panel" style={{ padding: "30px", animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "15px", marginBottom: "20px" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, fontSize: "1.4rem" }}>
                <Award size={24} style={{ color: "var(--color-primary)" }} />
                Canlandırma Değerlendirme Raporu
              </h2>
              <button 
                onClick={() => setSessionActive(false)}
                className="btn btn-secondary"
                style={{ borderRadius: "8px", padding: "8px 15px", fontSize: "0.8rem" }}
              >
                Geri Dön
              </button>
            </div>

            {evaluating ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div className="voice-circle" style={{ margin: "0 auto", animation: "float 2s infinite ease-in-out", border: "2px solid var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  🧠
                </div>
                <h4 style={{ marginTop: "20px" }}>Yapay Zeka Konuşmayı Analiz Ediyor...</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Gramer hataları, telaffuz ve akıcılık inceleniyor.</p>
              </div>
            ) : reportData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                
                {/* Score Meters Dashboard */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                  
                  <div className="glass-card" style={{ textAlign: "center", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>GENEL DERECE</span>
                    <div style={{ 
                      fontSize: "3rem", 
                      fontWeight: "900", 
                      background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)", 
                      WebkitBackgroundClip: "text", 
                      WebkitTextFillColor: "transparent",
                      margin: "10px 0"
                    }}>
                      {reportData.overallGrade}
                    </div>
                    <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>+{reportData.xpEarned} XP Kazanıldı!</span>
                  </div>

                  <div className="glass-card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", marginBottom: "8px" }}>
                      <span>🗣️ Konuşma Akıcılığı</span>
                      <span style={{ color: "var(--color-primary)" }}>{reportData.fluency}%</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${reportData.fluency}%`, height: "100%", background: "var(--color-primary)", borderRadius: "4px" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", marginTop: "15px", marginBottom: "8px" }}>
                      <span>✍️ Gramer Doğruluğu</span>
                      <span style={{ color: "var(--color-success)" }}>{reportData.grammar}%</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${reportData.grammar}%`, height: "100%", background: "var(--color-success)", borderRadius: "4px" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", marginTop: "15px", marginBottom: "8px" }}>
                      <span>🎯 Hedef Tamamlama</span>
                      <span style={{ color: "var(--color-secondary)" }}>{reportData.completion}%</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${reportData.completion}%`, height: "100%", background: "var(--color-secondary)", borderRadius: "4px" }} />
                    </div>
                  </div>

                </div>

                {/* Feedback Summary */}
                <div className="glass-card" style={{ padding: "20px", borderLeft: "4px solid var(--color-primary)" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px" }}>Koç Özeti & Öneriler</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: "1.5", margin: 0 }}>
                    {reportData.summary}
                  </p>
                </div>

                {/* Grammatical Corrections Section */}
                <div className="glass-card" style={{ padding: "20px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                    <AlertCircle size={16} style={{ color: "var(--color-warning)" }} />
                    Gramer Hataları & İpuçları
                  </h4>

                  {reportData.corrections && reportData.corrections.length === 0 ? (
                    <p style={{ color: "#34d399", fontSize: "0.85rem", margin: 0, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle size={16} /> Mükemmel! Görüşme boyunca herhangi bir ciddi gramer hatası tespit edilmedi.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {reportData.corrections.map((corr, idx) => (
                        <div key={idx} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                            Hatalı Söylenen: <span style={{ color: "var(--color-danger)", textDecoration: "line-through" }}>"{corr.userText}"</span>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: "600", marginTop: "2px" }}>
                            Doğru / Doğal Söyleniş: "{corr.correctedText}"
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                            💡 <b>Açıklama:</b> {corr.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Conversation Log Review */}
                <div className="glass-card" style={{ padding: "20px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                    <MessageSquare size={16} style={{ color: "var(--color-secondary)" }} />
                    Konuşma Kaydı Geçmişi
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "5px" }}>
                    {dialogue.map((item, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: "8px 12px", 
                          borderRadius: "8px", 
                          alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                          background: item.role === "user" ? "rgba(139, 92, 246, 0.1)" : "rgba(255,255,255,0.02)",
                          border: "1px solid",
                          borderColor: item.role === "user" ? "rgba(139, 92, 246, 0.2)" : "var(--border-glass)",
                          maxWidth: "85%",
                          fontSize: "0.8rem",
                          color: "white",
                          textAlign: "left"
                        }}
                      >
                        <b>{item.role === "user" ? "Siz" : selectedScenario.partner}:</b> {item.content}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      {/* Intro Header */}
      <div className="glass-panel" style={{ padding: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ textAlign: "left" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, fontSize: "1.4rem" }}>
            <Users size={24} style={{ color: "var(--color-primary)" }} />
            Yapay Zeka Rol Yapma Odası (AI Roleplay)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "5px", maxWidth: "600px" }}>
            Farklı senaryolarda yapay zekayla sesli konuşma pratiği yapın. Aramayı tamamladığınızda akıcılık ve gramer performansınız değerlendirilecektir.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(139, 92, 246, 0.1)", padding: "8px 15px", borderRadius: "10px", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
          <Sparkles size={16} style={{ color: "#c084fc" }} />
          <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#c084fc" }}>Tamamlamada +40 XP</span>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {scenarios.map((sc) => (
          <div 
            key={sc.id} 
            className="glass-panel srs-hover" 
            style={{ 
              padding: "25px", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between",
              minHeight: "260px",
              textAlign: "left"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <span style={{ fontSize: "2rem" }}>{sc.avatar}</span>
                <span className="badge badge-primary" style={{ fontSize: "0.65rem", padding: "3px 8px" }}>
                  Zorluk: {sc.difficulty}
                </span>
              </div>
              
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "white", margin: "0 0 8px 0" }}>{sc.title}</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4", margin: "0 0 15px 0" }}>
                {sc.context}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "15px" }}>
                {sc.keyVocab.map((vocab, vIdx) => (
                  <span 
                    key={vIdx} 
                    style={{ 
                      fontSize: "0.65rem", 
                      padding: "2px 6px", 
                      background: "rgba(255,255,255,0.03)", 
                      border: "1px solid var(--border-glass)", 
                      borderRadius: "4px",
                      color: "rgba(255,255,255,0.6)"
                    }}
                  >
                    {vocab}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => startCall(sc)}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", gap: "8px", padding: "10px 0", fontSize: "0.85rem", fontWeight: "600", borderRadius: "8px" }}
            >
              <Phone size={14} /> Aramayı Başlat
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
