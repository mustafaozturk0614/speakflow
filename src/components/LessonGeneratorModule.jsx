import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookMarked, 
  HelpCircle, 
  Volume2, 
  CheckCircle, 
  Mic, 
  Play, 
  Plus, 
  ArrowRight, 
  Info, 
  ChevronRight, 
  Smile, 
  Award,
  AlertCircle
} from "lucide-react";
import { speakText } from "../utils/speech";
import { hasApiKey, callGeminiAPI } from "../utils/gemini";
import { toggleVocabulary, getVocabulary, awardXP } from "../utils/gamification";
import { SpeechRecognizer } from "../utils/speech";

const suggestedTopics = [
  { id: "negotiation", title: "Gelir Paylaşımı Pazarlığı (Negotiation)", desc: "Revenue share ve faturalama modelleri üzerine pratik." },
  { id: "interview", title: "React/Software İş Görüşmesi", desc: "İş geçmişi ve teknik becerileri anlatma." },
  { id: "meeting", title: "Proje Durum Toplantısı (Sync Meeting)", desc: "Günlük işleri bildirme ve engelleri paylaşma." },
  { id: "support", title: "Müşteri Desteği (Client Relations)", desc: "Müşteri şikayetleri ve sorun giderme." }
];

const fallbackLessons = {
  negotiation: {
    title: "Gelir Paylaşımı Pazarlığı (Negotiation)",
    vocabulary: [
      { english: "Revenue Share", turkish: "Gelir Paylaşımı", type: "term" },
      { english: "Billing Attempt", turkish: "Faturalama Denemesi", type: "term" },
      { english: "Setup Fee", turkish: "Kurulum Ücreti", type: "term" },
      { english: "Negotiation", turkish: "Müzakere / Pazarlık", type: "term" },
      { english: "Split", turkish: "Bölüşüm / Paylaşım", type: "term" }
    ],
    grammarExercises: [
      {
        title: "Conditional (Koşul Cümlesi)",
        formula: "If + Subject + Simple Present, Subject + will + Verb",
        simpleExplanation: "Eğer bir koşul gerçekleşirse gelecekte ne olacağını anlatmak için kullanılır.",
        examples: [
          { en: "If we agree, we will sign the contract.", tr: "Eğer anlaşırsak sözleşmeyi imzalayacağız." }
        ],
        words: ["If", "we", "agree", "we", "will", "sign", "the", "contract", "they", "will", "pay"],
        correctAnswers: ["If we agree we will sign the contract", "If we agree we will sign the contract."]
      }
    ],
    presentationScript: {
      title: "Revenue Share Pazarlığı",
      scriptEn: "We want a seventy-thirty split. Our services have high traffic. We need a low setup fee.",
      scriptTr: "%70-%30 bölüşüm istiyoruz. Servislerimizin yüksek trafiği var. Düşük kurulum ücretine ihtiyacımız var.",
      target: "We want a seventy-thirty split.",
      targetTr: "%70-%30 bölüşüm istiyoruz.",
      words: ["We", "want", "a", "seventy-thirty", "split", "traffic", "setup"]
    }
  },
  interview: {
    title: "Software İş Görüşmesi",
    vocabulary: [
      { english: "Background", turkish: "Geçmiş / Arka plan", type: "term" },
      { english: "Requirement", turkish: "Gereksinim", type: "term" },
      { english: "Responsible", turkish: "Sorumlu", type: "term" },
      { english: "Teamwork", turkish: "Takım çalışması", type: "term" },
      { english: "Goal", turkish: "Hedef / Amaç", type: "term" }
    ],
    grammarExercises: [
      {
        title: "Present Perfect (Deneyimler)",
        formula: "Subject + have/has + Verb-3rd state",
        simpleExplanation: "Geçmişte yapılmış ama zamanı tam verilmemiş genel iş deneyimlerini anlatırken kullanılır.",
        examples: [
          { en: "I have worked in tech for three years.", tr: "Teknoloji alanında üç yıl çalıştım." }
        ],
        words: ["I", "have", "worked", "in", "tech", "for", "three", "years", "she", "has", "developed"],
        correctAnswers: ["I have worked in tech for three years", "I have worked in tech for three years."]
      }
    ],
    presentationScript: {
      title: "İş Geçmişini Anlatma",
      scriptEn: "I am a web developer. I built apps with React. I am a good team player.",
      scriptTr: "Ben bir web geliştiriciyim. React ile uygulamalar yaptım. İyi bir takım oyuncusuyum.",
      target: "I built apps with React.",
      targetTr: "React ile uygulamalar yaptım.",
      words: ["I", "built", "apps", "with", "React", "developer", "team"]
    }
  },
  meeting: {
    title: "Proje Durum Toplantısı (Sync Meeting)",
    vocabulary: [
      { english: "Obstacle", turkish: "Engel / Engelleyici Unsur", type: "term" },
      { english: "Status Update", turkish: "Durum Güncellemesi", type: "term" },
      { english: "On Track", turkish: "Planlanan Zamanda Giden", type: "term" },
      { english: "Task", turkish: "Görev / İş", type: "term" },
      { english: "Deadline", turkish: "Son Teslim Tarihi", type: "term" }
    ],
    grammarExercises: [
      {
        title: "Present Continuous (Devam Eden Eylemler)",
        formula: "Subject + am/is/are + Verb-ING",
        simpleExplanation: "Şu anda üzerinde çalışmakta olduğunuz eylemleri belirtmek için kullanılır.",
        examples: [
          { en: "I am working on the database fix today.", tr: "Bugün veritabanı düzeltmesi üzerinde çalışıyorum." }
        ],
        words: ["I", "am", "working", "on", "the", "database", "fix", "today", "we", "are", "testing"],
        correctAnswers: ["I am working on the database fix today", "I am working on the database fix today."]
      }
    ],
    presentationScript: {
      title: "Proje Durumu Güncelleme",
      scriptEn: "Today I am writing code. Everything is on track. I have no obstacles.",
      scriptTr: "Bugün kod yazıyorum. Her şey yolunda gidiyor. Herhangi bir engelim yok.",
      target: "Everything is on track.",
      targetTr: "Her şey yolunda gidiyor.",
      words: ["Everything", "is", "on", "track", "all", "on", "project"]
    }
  },
  support: {
    title: "Müşteri Desteği (Client Relations)",
    vocabulary: [
      { english: "Apologize", turkish: "Özür dilemek", type: "term" },
      { english: "Issue", turkish: "Sorun / Problem", type: "term" },
      { english: "Investigate", turkish: "Araştırmak / İncelemek", type: "term" },
      { english: "Refund", turkish: "İade / Geri ödeme", type: "term" },
      { english: "Resolution", turkish: "Çözüm", type: "term" }
    ],
    grammarExercises: [
      {
        title: "Polite Request (Kibar İstek)",
        formula: "Could you + Verb-1 + Object, please?",
        simpleExplanation: "Müşteriden kibar bir şekilde bir işlem yapmasını isterken kullanılır.",
        examples: [
          { en: "Could you send us your account email, please?", tr: "Lütfen hesap e-postanızı bize gönderir misiniz?" }
        ],
        words: ["Could", "you", "send", "us", "your", "account", "email", "please", "can", "give"],
        correctAnswers: ["Could you send us your account email please", "Could you send us your account email, please."]
      }
    ],
    presentationScript: {
      title: "Müşteri Sorunu Çözme",
      scriptEn: "We apologize for the issue. We are investigating it now. We will resolve it soon.",
      scriptTr: "Sorun için özür dileriz. Şu anda araştırıyoruz. Yakında çözeceğiz.",
      target: "We apologize for the issue.",
      targetTr: "Sorun için özür dileriz.",
      words: ["We", "apologize", "for", "the", "issue", "sorry", "problem"]
    }
  }
};

export default function LessonGeneratorModule() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  
  // Custom Sentence Builder Game State
  const [selectedWords, setSelectedWords] = useState([]);
  const [exerciseCorrect, setExerciseCorrect] = useState(false);
  const [exerciseChecked, setExerciseChecked] = useState(false);

  // Presenter Practice Simulator Game State
  const [micState, setMicState] = useState("idle"); // idle, listening, success, error
  const [userReadTranscript, setUserReadTranscript] = useState("");
  const [shadowScore, setShadowScore] = useState(null);
  const [dictSavedList, setDictSavedList] = useState([]);

  const recognizerRef = useRef(null);

  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer();
    // Load dictionary states
    const vocab = getVocabulary().map(v => v.english);
    setDictSavedList(vocab);

    return () => {
      if (recognizerRef.current) recognizerRef.current.stop();
    };
  }, [activeLesson]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setActiveLesson(null);
    setSelectedWords([]);
    setExerciseCorrect(false);
    setExerciseChecked(false);
    setUserReadTranscript("");
    setShadowScore(null);

    // Check if topic matches standard fallback list
    const lowerTopic = topic.toLowerCase();
    let selectedFallback = null;

    if (lowerTopic.includes("pazarlık") || lowerTopic.includes("negotiation") || lowerTopic.includes("split") || lowerTopic.includes("revenue")) {
      selectedFallback = "negotiation";
    } else if (lowerTopic.includes("mülakat") || lowerTopic.includes("interview") || lowerTopic.includes("yazılım") || lowerTopic.includes("react")) {
      selectedFallback = "interview";
    } else if (lowerTopic.includes("proje") || lowerTopic.includes("meeting") || lowerTopic.includes("toplantı")) {
      selectedFallback = "meeting";
    } else if (lowerTopic.includes("destek") || lowerTopic.includes("müşteri") || lowerTopic.includes("relations") || lowerTopic.includes("support")) {
      selectedFallback = "support";
    }

    try {
      if (hasApiKey()) {
        const systemPrompt = `
You are an AI English Language Curriculum Generator.
Your job is to generate a beautiful, personalized, micro-learning English lesson based on the topic provided by the user.
Topic: "${topic}"

Provide the output in JSON format exactly as follows:
{
  "title": "A short descriptive title for the lesson in Turkish",
  "vocabulary": [
    { "english": "English Word/Phrase", "turkish": "Turkish Translation", "type": "term" } // exactly 5 items
  ],
  "grammarExercises": [
    {
      "title": "Grammar Pattern Name (in Turkish)",
      "formula": "e.g., Subject + have + Verb-3",
      "simpleExplanation": "Simple explanation in Turkish",
      "examples": [
        { "en": "Example English sentence", "tr": "Example Turkish translation" }
      ],
      "words": ["array", "of", "words", "to", "assemble", "the", "sentence"], // must contain all correct words plus 2-3 distractor words (all lower/title case logically)
      "correctAnswers": ["Example English sentence", "Example English sentence."] // variants of correct punctuation
    }
  ],
  "presentationScript": {
    "title": "Topic Presentation",
    "scriptEn": "A short A1-A2 presentation script of 3 sentences.",
    "scriptTr": "Turkish translation of the script",
    "target": "One key target sentence from the script for the user to practice building",
    "targetTr": "Turkish translation of target sentence",
    "words": ["array", "of", "words", "to", "build", "target"]
  }
}
Do not include any Markdown wrap. Return only the raw JSON.
        `;
        const result = await callGeminiAPI([], systemPrompt);
        setActiveLesson(result);
      } else {
        // Fallback simulation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const key = selectedFallback || "negotiation";
        setActiveLesson(fallbackLessons[key]);
      }
    } catch (err) {
      console.error(err);
      setActiveLesson(fallbackLessons.negotiation);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedClick = (suggested) => {
    setTopic(suggested.title);
    setLoading(true);
    setActiveLesson(null);
    setTimeout(() => {
      const key = suggested.id;
      setActiveLesson(fallbackLessons[key]);
      setLoading(false);
    }, 800);
  };

  // Vocabulary handlers
  const handleToggleDict = (item) => {
    toggleVocabulary(item);
    if (dictSavedList.includes(item.english)) {
      setDictSavedList(prev => prev.filter(w => w !== item.english));
    } else {
      setDictSavedList(prev => [...prev, item.english]);
    }
  };

  // Grammar Builder Game handlers
  const handleWordClick = (word) => {
    if (exerciseChecked) return;
    setSelectedWords(prev => [...prev, word]);
  };

  const handleRemoveWord = (idx) => {
    if (exerciseChecked) return;
    setSelectedWords(prev => prev.filter((_, i) => i !== idx));
  };

  const checkSentenceBuilder = (exercise) => {
    setExerciseChecked(true);
    const userSentence = selectedWords.join(" ").trim().toLowerCase();
    
    // Normalize and verify
    const isCorrect = exercise.correctAnswers.some(ans => {
      const normalizedAns = ans.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
      const normalizedUser = userSentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
      return normalizedAns === normalizedUser;
    });

    setExerciseCorrect(isCorrect);
    if (isCorrect) {
      awardXP(20); // Award +20 XP for correct sentence
    }
  };

  // Presentation script mic check
  const startReadingCheck = (targetSentence) => {
    if (!recognizerRef.current) return;
    setMicState("listening");
    setUserReadTranscript("");
    setShadowScore(null);

    recognizerRef.current.start(
      () => {},
      (transcript) => {
        setUserReadTranscript(transcript);
        setMicState("processing");

        // Simple word matching logic
        const targetClean = targetSentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
        const userClean = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
        
        const targetWords = targetClean.split(" ");
        const userWords = userClean.split(" ");
        
        let matchCount = 0;
        targetWords.forEach(w => {
          if (userWords.includes(w)) matchCount++;
        });

        const score = Math.round((matchCount / targetWords.length) * 100);
        setShadowScore(score);

        if (score >= 70) {
          setMicState("success");
          awardXP(30); // bonus XP!
        } else {
          setMicState("error");
        }
      },
      (err) => {
        console.error(err);
        setMicState("error");
      },
      () => {}
    );
  };

  const stopReadingCheck = () => {
    if (recognizerRef.current) recognizerRef.current.stop();
    setMicState("idle");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      {/* Introduction Header */}
      <div className="glass-panel" style={{ padding: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ textAlign: "left" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, fontSize: "1.4rem" }}>
            <Sparkles size={24} style={{ color: "var(--color-primary)" }} />
            Yapay Zeka Kişisel Ders Üretici (AI Custom Lesson)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "5px", maxWidth: "600px" }}>
            Çalışmak istediğiniz konuyu girin. Yapay zeka sizin seviyenize ve konunuza özel kelime kartları, cümle kurma egzersizleri ve okuma sunumu hazırlayacaktır.
          </p>
        </div>
      </div>

      {/* Generator Input Section */}
      <div className="glass-panel" style={{ padding: "25px" }}>
        <form onSubmit={handleGenerate} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-control"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Örn: Pazarlama toplantısı, kafede kahve istemek, veri tabanı kurmak..."
            style={{ flex: 1, minWidth: "280px" }}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            disabled={loading}
          >
            <Sparkles size={16} /> {loading ? "Ders Üretiliyor..." : "Ders Oluştur"}
          </button>
        </form>

        {/* Suggestion list */}
        {!activeLesson && !loading && (
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Popüler Konularla Hızlı Başla:</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "10px" }}>
              {suggestedTopics.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSuggestedClick(item)}
                  className="glass-card srs-hover" 
                  style={{ padding: "12px 15px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#c084fc" }}>{item.title}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="glass-panel" style={{ padding: "50px", textAlign: "center" }}>
          <div className="voice-circle" style={{ margin: "0 auto", animation: "float 2s infinite ease-in-out", border: "2px solid var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            🔮
          </div>
          <h4 style={{ marginTop: "20px" }}>Ders İçerikleri Oluşturuluyor...</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Yapay zeka size özel kelimeler, gramer egzersizleri ve sunum scripti hazırlıyor.</p>
        </div>
      )}

      {/* Active Lesson Sandbox */}
      {activeLesson && (
        <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.3s ease" }}>
          
          <div className="glass-panel" style={{ padding: "20px", textAlign: "left", borderLeft: "4px solid var(--color-primary)" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "white" }}>
              Ders: {activeLesson.title}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Yapay Zeka Tarafından Özel Hazırlanmıştır.</span>
          </div>

          <div className="dashboard-grid">
            
            {/* COLUMN 1: Custom Vocabulary Terms */}
            <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px", textAlign: "left" }}>
              <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <BookMarked size={18} style={{ color: "var(--color-primary)" }} />
                1. Özel Kelimeler
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                Bu ders için üretilmiş kritik 5 kelime. Kelimeleri yıldız ikonuna tıklayarak sözlüğünüze kaydedebilirsiniz.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                {activeLesson.vocabulary.map((item, idx) => {
                  const isSaved = dictSavedList.includes(item.english);
                  return (
                    <div key={idx} className="glass-card" style={{ padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#c084fc" }}>
                          {item.english}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {item.turkish}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => speakText(item.english)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: "26px", height: "26px", border: "none" }}
                        >
                          <Volume2 size={12} />
                        </button>
                        <button
                          onClick={() => handleToggleDict(item)}
                          className={`btn btn-secondary btn-icon ${isSaved ? "btn-primary" : ""}`}
                          style={{ width: "26px", height: "26px", border: "none" }}
                          title="Sözlüğe Kaydet (SRS)"
                        >
                          <span style={{ fontSize: "0.8rem", color: isSaved ? "yellow" : "white" }}>★</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: Visual Sentence Builder Egzersizi */}
            <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px", textAlign: "left" }}>
              <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <HelpCircle size={18} style={{ color: "var(--color-success)" }} />
                2. Cümle Kurma Egzersizi
              </h3>
              
              {activeLesson.grammarExercises.map((ex, exIdx) => (
                <div key={exIdx} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="badge badge-primary" style={{ alignSelf: "flex-start", fontSize: "0.65rem", padding: "4px 8px" }}>
                    Kalıp: {ex.title}
                  </div>
                  
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                    <b>Formül:</b> <code>{ex.formula}</code>
                    <br />
                    <b>Açıklama:</b> {ex.simpleExplanation}
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 15px", borderRadius: "8px", border: "1px solid var(--border-glass)", minHeight: "50px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginTop: "5px" }}>
                    {selectedWords.length === 0 ? (
                      <span style={{ color: "var(--text-dark)", fontSize: "0.75rem" }}>Aşağıdaki kelimelere tıklayarak cümleyi kurun.</span>
                    ) : (
                      selectedWords.map((word, wIdx) => (
                        <span 
                          key={wIdx} 
                          onClick={() => handleRemoveWord(wIdx)}
                          className="badge badge-primary" 
                          style={{ cursor: "pointer", fontSize: "0.8rem", padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          {word} <span style={{ opacity: 0.6 }}>×</span>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Word pool */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "5px" }}>
                    {ex.words.map((word, wIdx) => {
                      const countInSelected = selectedWords.filter(w => w === word).length;
                      const totalInPool = ex.words.filter(w => w === word).length;
                      const isChosen = countInSelected >= totalInPool;
                      return (
                        <button
                          key={wIdx}
                          onClick={() => handleWordClick(word)}
                          className={`btn btn-secondary ${isChosen ? "disabled" : ""}`}
                          style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "6px", pointerEvents: isChosen ? "none" : "auto", opacity: isChosen ? 0.3 : 1 }}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action buttons & feedback */}
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => checkSentenceBuilder(ex)}
                        className="btn btn-primary"
                        style={{ padding: "8px 15px", fontSize: "0.75rem", borderRadius: "6px", flex: 1, justifyContent: "center" }}
                        disabled={selectedWords.length === 0 || exerciseChecked}
                      >
                        Cümleyi Kontrol Et
                      </button>
                      <button
                        onClick={() => { setSelectedWords([]); setExerciseChecked(false); setExerciseCorrect(false); }}
                        className="btn btn-secondary"
                        style={{ padding: "8px 15px", fontSize: "0.75rem", borderRadius: "6px" }}
                      >
                        Temizle
                      </button>
                    </div>

                    {exerciseChecked && (
                      <div className="glass-card" style={{
                        borderLeft: `4px solid ${exerciseCorrect ? "var(--color-success)" : "var(--color-danger)"}`,
                        background: exerciseCorrect ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
                        padding: "10px 15px",
                        borderRadius: "6px",
                        animation: "fadeIn 0.3s ease"
                      }}>
                        <div style={{ color: exerciseCorrect ? "var(--color-success)" : "var(--color-danger)", fontWeight: "700", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                          {exerciseCorrect ? (
                            <>
                              <CheckCircle size={14} /> Doğru! +20 XP
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} /> Hatalı Cümle
                            </>
                          )}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-main)", marginTop: "4px" }}>
                          {exerciseCorrect ? (
                            "Harika! Doğru sıralama yaptınız."
                          ) : (
                            <>
                              <b>Doğru Cevap:</b> "{ex.correctAnswers[0]}"
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* SECTION 3: Shadowing Okuma Simülatörü */}
          <div className="glass-panel" style={{ padding: "25px", textAlign: "left" }}>
            <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 10px 0" }}>
              <Mic size={18} style={{ color: "var(--color-secondary)" }} />
              3. Okuma ve Telaffuz Simülatörü (Shadowing)
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "15px" }}>
              Aşağıdaki kısa sunum scriptini dinleyin. Ardından mikrofona basarak hedef cümleyi okuyun ve telaffuz skorunuzu görün.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              
              {/* Script Box */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <h4 style={{ fontSize: "0.85rem", color: "white", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Sunum Metni</span>
                  <button 
                    onClick={() => speakText(activeLesson.presentationScript.scriptEn)}
                    className="btn btn-secondary"
                    style={{ padding: "4px 10px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Play size={10} /> Metni Dinle
                  </button>
                </h4>
                
                <div style={{ fontSize: "0.9rem", fontStyle: "italic", color: "#c084fc", lineHeight: "1.5" }}>
                  "{activeLesson.presentationScript.scriptEn}"
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "5px", borderTop: "1px solid var(--border-glass)", paddingTop: "5px" }}>
                  {activeLesson.presentationScript.scriptTr}
                </div>
              </div>

              {/* Mic Practice Sandbox */}
              <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h4 style={{ fontSize: "0.85rem", color: "white", margin: "0 0 4px 0" }}>Hedef Cümle</h4>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px" }}>Bu cümleyi mikrofona okuyun:</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#34d399", marginBottom: "5px" }}>
                    "{activeLesson.presentationScript.target}"
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-dark)", fontStyle: "italic" }}>
                    ({activeLesson.presentationScript.targetTr})
                  </div>
                </div>

                <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  
                  {/* Mic action buttons */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {micState === "listening" ? (
                      <button 
                        onClick={stopReadingCheck}
                        className="btn btn-danger"
                        style={{ padding: "8px 15px", fontSize: "0.75rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "5px" }}
                      >
                        🔴 Dinleniyor... Durdur
                      </button>
                    ) : (
                      <button 
                        onClick={() => startReadingCheck(activeLesson.presentationScript.target)}
                        className="btn btn-primary"
                        style={{ padding: "8px 15px", fontSize: "0.75rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "5px" }}
                        disabled={micState === "processing"}
                      >
                        <Mic size={12} /> Okumayı Başlat
                      </button>
                    )}

                    {micState === "processing" && (
                      <span style={{ fontSize: "0.75rem", color: "var(--color-warning)" }}>🧠 Analiz Ediliyor...</span>
                    )}
                  </div>

                  {/* Mic Transcript / Score Results */}
                  {userReadTranscript && (
                    <div style={{ marginTop: "10px", padding: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-glass)", borderRadius: "6px" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Söylediğiniz:</div>
                      <div style={{ fontSize: "0.8rem", color: "white", fontStyle: "italic", marginTop: "2px" }}>
                        "{userReadTranscript}"
                      </div>

                      {shadowScore !== null && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Telaffuz Eşleşmesi:</span>
                          <span style={{ 
                            fontSize: "0.85rem", 
                            fontWeight: "800", 
                            color: shadowScore >= 70 ? "var(--color-success)" : "var(--color-danger)" 
                          }}>
                            {shadowScore}%
                          </span>
                          
                          {shadowScore >= 70 ? (
                            <span className="badge badge-success" style={{ fontSize: "0.6rem" }}>+30 XP Kazandın!</span>
                          ) : (
                            <span style={{ fontSize: "0.65rem", color: "var(--text-dark)" }}>%70 üzeri başarı gerektirir.</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
