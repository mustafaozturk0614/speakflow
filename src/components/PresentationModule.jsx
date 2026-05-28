import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Volume2, 
  Mic, 
  MicOff, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  BookOpen, 
  CheckCircle, 
  MessageSquare, 
  Sparkles, 
  Star,
  RefreshCw
} from "lucide-react";
import { presentationSlides, presentationQA, vasSectorTerms } from "../utils/mockData";
import { SpeechRecognizer, speakText, stopSpeaking } from "../utils/speech";
import { awardXP, completeDailyTask, toggleVocabulary, getVocabulary } from "../utils/gamification";
import { hasApiKey, callGeminiAPI } from "../utils/gemini";

export default function PresentationModule() {
  const [subTab, setSubTab] = useState("slides"); // slides, builder, vocab, speaking, qa, sektor
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  
  // VAS Sector Terms States
  const [flippedTerms, setFlippedTerms] = useState({}); // { [index]: boolean }
  const [sektorQuizActive, setSektorQuizActive] = useState(false);
  const [sektorQuizIdx, setSektorQuizIdx] = useState(0);
  const [sektorQuizQuestions, setSektorQuizQuestions] = useState([]);
  const [sektorQuizSelected, setSektorQuizSelected] = useState(null);
  const [sektorQuizFeedback, setSektorQuizFeedback] = useState(null); // { correct: boolean, text: string }
  const [sektorQuizScore, setSektorQuizScore] = useState(0);

  
  // States for Speech simulation
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [speakingScore, setSpeakingScore] = useState(null);
  const [spokenWordsList, setSpokenWordsList] = useState([]);
  
  // Sentence Builder States
  const [assembledWords, setAssembledWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [builderFeedback, setBuilderFeedback] = useState(null);

  // Vocab Quiz States
  const [vocabQuizIdx, setVocabQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [vocabFeedback, setVocabFeedback] = useState(null);
  const [vocabScore, setVocabScore] = useState(0);

  // Q&A States
  const [activeQAIdx, setActiveQAIdx] = useState(null);
  const [userQAInput, setUserQAInput] = useState("");
  const [qaFeedback, setQaFeedback] = useState(null); // { score, evalText, botResponse }
  const [qaLoading, setQaLoading] = useState(false);

  // Vocabulary Bookmarks
  const [bookmarkedList, setBookmarkedList] = useState([]);

  const recognizerRef = useRef(null);

  const slide = presentationSlides[currentSlideIdx];

  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer();
    // Load bookmarked words
    setBookmarkedList(getVocabulary().filter(v => v.type === "term").map(v => v.english));
    return () => stopSpeaking();
  }, []);

  // Shuffle builder words on slide change
  useEffect(() => {
    if (slide.sentenceBuilder) {
      resetBuilder();
    }
    // Reset speaking states on slide change
    setSpokenTranscript("");
    setSpeakingScore(null);
    setSpokenWordsList([]);
  }, [currentSlideIdx, subTab]);

  const resetBuilder = () => {
    setAssembledWords([]);
    setBuilderFeedback(null);
    const shuffled = [...slide.sentenceBuilder.words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  };

  const handlePlayTTS = (text) => {
    speakText(text, 0.95);
  };

  // Word-by-word evaluation engine
  const handleStartSpeaking = () => {
    if (!recognizerRef.current || !recognizerRef.current.supported) {
      alert("Ses tanıma tarayıcınızda desteklenmiyor.");
      return;
    }
    setSpokenTranscript("");
    setSpeakingScore(null);
    setSpokenWordsList([]);

    recognizerRef.current.start(
      () => setIsListening(true),
      (transcript) => {
        setSpokenTranscript(transcript);
        
        // Match speech
        const targetClean = slide.scriptEn.toLowerCase().replace(/[^a-z0-9\s]/g, "");
        const targetWords = targetClean.split(/\s+/).filter(w => w.length > 0);
        
        const spokenClean = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, "");
        const spokenWords = spokenClean.split(/\s+/).filter(w => w.length > 0);
        setSpokenWordsList(spokenWords);

        // Calculate match score
        let matches = 0;
        targetWords.forEach(word => {
          if (spokenWords.includes(word)) {
            matches++;
          }
        });

        const score = Math.round((matches / targetWords.length) * 100);
        setSpeakingScore(score);

        if (score >= 80) {
          awardXP(30); // Award 30 XP
          completeDailyTask("task_presentation"); // Complete daily task!
        }
      },
      (err) => {
        console.error(err);
        setIsListening(false);
      },
      () => setIsListening(false)
    );
  };

  const handleStopSpeaking = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }
  };

  // Sentence Builder Actions
  const handleWordClick = (word, index) => {
    setAssembledWords([...assembledWords, { word, index }]);
    const newPool = [...shuffledWords];
    newPool[index] = null;
    setShuffledWords(newPool);
  };

  const handleRemoveWord = (wordObj, assembledIndex) => {
    const newAssembled = [...assembledWords];
    newAssembled.splice(assembledIndex, 1);
    setAssembledWords(newAssembled);

    const newPool = [...shuffledWords];
    newPool[wordObj.index] = wordObj.word;
    setShuffledWords(newPool);
    setBuilderFeedback(null);
  };

  const checkSentence = () => {
    const userSentence = assembledWords.map(w => w.word).join(" ");
    const cleanUser = userSentence.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    const cleanTarget = slide.sentenceBuilder.target.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

    if (cleanUser === cleanTarget) {
      setBuilderFeedback({ status: "success", text: "Doğru Cümle! Tebrikler." });
      speakText(slide.sentenceBuilder.target, 0.95);
      awardXP(15); // Award 15 XP
    } else {
      setBuilderFeedback({ status: "error", text: "Kelime sıralaması yanlış. Tekrar deneyin." });
    }
  };

  // Vocab Bookmark Toggle
  const handleToggleTermBookmark = (word, translation) => {
    const item = {
      type: "term",
      english: word,
      turkish: translation
    };
    const added = toggleVocabulary(item);
    setBookmarkedList(prev => 
      added ? [...prev, word] : prev.filter(w => w !== word)
    );
  };

  // Technical Vocab Quiz Actions
  // We collect all vocabulary words across slides to form a pool
  const allVocabQuizList = presentationSlides.flatMap(s => s.vocabulary).slice(0, 10); // get first 10
  const activeQuizWord = allVocabQuizList[vocabQuizIdx];

  const handleStartVocabQuiz = () => {
    setVocabQuizIdx(0);
    setSelectedOpt(null);
    setVocabFeedback(null);
    setVocabScore(0);
  };

  const handleVocabAnswer = (optIdx, correctTranslation) => {
    if (vocabFeedback) return;
    setSelectedOpt(optIdx);
    
    // Get option translation
    const quizOptions = getQuizOptions(activeQuizWord);
    const selectedText = quizOptions[optIdx];
    const isCorrect = selectedText === correctTranslation;

    if (isCorrect) {
      setVocabFeedback({ correct: true, text: "Doğru Terim Eşleşmesi! 🎉" });
      setVocabScore(prev => prev + 1);
      awardXP(10);
    } else {
      setVocabFeedback({ correct: false, text: `Yanlış. Doğru karşılık: "${correctTranslation}" olmalı.` });
    }
  };

  const getQuizOptions = (wordObj) => {
    if (!wordObj) return [];
    // generate 3 random wrong options
    const wrongTranslations = allVocabQuizList
      .filter(w => w.tr !== wordObj.tr)
      .map(w => w.tr)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    return [wordObj.tr, ...wrongTranslations].sort(() => 0.5 - Math.random());
  };

  const handleNextVocabQuestion = () => {
    setSelectedOpt(null);
    setVocabFeedback(null);
    if (vocabQuizIdx < allVocabQuizList.length - 1) {
      setVocabQuizIdx(prev => prev + 1);
    } else {
      setVocabQuizIdx(allVocabQuizList.length); // trigger end
    }
  };

  // Q&A Speaking Actions
  const handleQASelect = (idx) => {
    setActiveQAIdx(idx);
    setUserQAInput("");
    setQaFeedback(null);
    
    // Play Q&A voice
    setTimeout(() => {
      speakText(presentationQA[idx].question, 0.95);
    }, 200);
  };

  const handleQAMicInput = () => {
    if (!recognizerRef.current || !recognizerRef.current.supported) {
      alert("Ses tanıma tarayıcınızda desteklenmiyor.");
      return;
    }
    recognizerRef.current.start(
      () => setIsListening(true),
      (transcript) => {
        setUserQAInput(transcript);
      },
      (err) => {
        console.error(err);
        setIsListening(false);
      },
      () => setIsListening(false)
    );
  };

  const handleQASubmit = async () => {
    if (!userQAInput.trim()) return;
    setQaLoading(true);
    
    const qa = presentationQA[activeQAIdx];

    try {
      if (hasApiKey()) {
        const systemPrompt = `
You are an expert technical audience member asking questions after a presentation on HTTPS Header Enrichment Migration.
Evaluate the user's answer to this question: "${qa.question}"
Assess:
1. Technical accuracy: Did they explain the mechanism correctly?
2. Vocabulary: Did they use technical terms correctly?
3. Fluency & tone.

Format response as JSON:
{
  "score": 85,
  "evalText": "Your Turkish assessment of their response...",
  "botResponse": "Your expert follow-up response in English (keep it brief, 2 sentences)."
}
        `;
        const result = await callGeminiAPI([{ role: "user", content: userQAInput }], systemPrompt);
        setQaFeedback(result);
        speakText(result.botResponse, 0.95);
        awardXP(25);
      } else {
        // Local evaluation
        const lowerAnswer = userQAInput.toLowerCase();
        const matched = qa.expectedKeywords.filter(k => lowerAnswer.includes(k.toLowerCase()));
        const score = Math.min(100, Math.max(30, 30 + (matched.length * 20)));

        const localEval = {
          score,
          evalText: `Cevabınız analiz edildi. Yakalanan teknik kavramlar: ${matched.join(", ") || "Yok"}. ${
            matched.length > 1 ? "Sorudaki mimari detayları ve fallback mekanizmalarını doğru anladığınızı gösterdiniz." : "Sunuma ait anahtar kelimeleri (örn: OTP, latency) kullanarak açıklamanızı zenginleştirebilirsiniz."
          }`,
          botResponse: qa.botFollowUp
        };

        setQaFeedback(localEval);
        speakText(qa.botFollowUp, 0.95);
        awardXP(15);
      }
    } catch (e) {
      console.error(e);
      alert("Hata oluştu.");
    } finally {
      setQaLoading(false);
    }
  };

  // Sektör Terimleri Helper Handlers
  const toggleTermFlip = (idx) => {
    setFlippedTerms(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const startSektorQuiz = () => {
    const shuffled = [...vasSectorTerms].sort(() => Math.random() - 0.5);
    const selectedTerms = shuffled.slice(0, 5);
    
    const questions = selectedTerms.map(term => {
      const wrongTerms = vasSectorTerms
        .filter(t => t.english !== term.english)
        .map(t => t.english)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [term.english, ...wrongTerms].sort(() => Math.random() - 0.5);
      
      return {
        desc: term.desc,
        correct: term.english,
        turkish: term.turkish,
        options
      };
    });
    
    setSektorQuizQuestions(questions);
    setSektorQuizIdx(0);
    setSektorQuizSelected(null);
    setSektorQuizFeedback(null);
    setSektorQuizScore(0);
    setSektorQuizActive(true);
  };

  const handleSektorQuizAnswer = (opt) => {
    if (sektorQuizFeedback) return;
    setSektorQuizSelected(opt);
    
    const currentQ = sektorQuizQuestions[sektorQuizIdx];
    const isCorrect = opt === currentQ.correct;
    
    if (isCorrect) {
      setSektorQuizFeedback({ correct: true, text: "Harika! Doğru eşleşme. 🎯" });
      setSektorQuizScore(prev => prev + 1);
      awardXP(10);
      speakText(currentQ.correct, 0.95);
    } else {
      setSektorQuizFeedback({ correct: false, text: `Yanlış. Doğru terim: "${currentQ.correct}" (${currentQ.turkish}) olmalıydı.` });
    }
  };

  const handleNextSektorQuestion = () => {
    setSektorQuizSelected(null);
    setSektorQuizFeedback(null);
    if (sektorQuizIdx < 4) {
      setSektorQuizIdx(prev => prev + 1);
    } else {
      setSektorQuizIdx(5); // results
      awardXP(40); // 40 XP completion bonus
      completeDailyTask("task_presentation");
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIdx < presentationSlides.length - 1) {
      setCurrentSlideIdx(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(prev => prev - 1);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.2s ease" }}>
      {/* Header */}
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MessageSquare size={32} style={{ color: "var(--color-primary)" }} />
          Sunum Hazırlığı (HTTPS Header Enrichment)
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          14 Slaytlık sunum kartlarınızı sesli sunma pratiği yapın, teknik terimleri çalışın ve dinleyici soru-cevaplarını simüle edin.
        </p>
      </div>

      {/* Sub tabs navigation */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px", overflowX: "auto" }}>
        {[
          { id: "slides", label: "1. Slayt Kartları" },
          { id: "builder", label: "2. Cümle Kurucu" },
          { id: "vocab", label: "3. Terim Egzersizleri" },
          { id: "speaking", label: "4. Sunum Simülatörü" },
          { id: "qa", label: "5. Soru-Cevap (Q&A)" },
          { id: "sektor", label: "6. Sektör Terimleri" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSubTab(tab.id); handleStopSpeaking(); }}
            className={`btn ${subTab === tab.id ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "8px 16px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Workspace based on sub tab */}
      {subTab === "slides" && (
        // ================= TAB 1: SLIDE CARDS =================
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Slider controller */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={handlePrevSlide} disabled={currentSlideIdx === 0} className="btn btn-secondary">
              <ArrowLeft size={16} /> Önceki
            </button>
            <span className="badge badge-primary">Slayt {currentSlideIdx + 1} / 14</span>
            <button onClick={handleNextSlide} disabled={currentSlideIdx === presentationSlides.length - 1} className="btn btn-secondary">
              Sonraki <ArrowRight size={16} />
            </button>
          </div>

          <div className="dashboard-grid">
            {/* Slide Body */}
            <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "15px" }}>
                <span className="badge badge-primary" style={{ marginBottom: "8px" }}>TR: {slide.titleTr}</span>
                <h2 style={{ fontSize: "1.6rem", color: "var(--color-primary)" }}>{slide.titleEn}</h2>
              </div>

              {/* Speaker Script Panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <strong style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>SPEAKER SCRIPT (ENGLISH)</strong>
                  <div style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    position: "relative",
                    marginTop: "5px"
                  }}>
                    "{slide.scriptEn}"
                    <button
                      onClick={() => handlePlayTTS(slide.scriptEn)}
                      className="btn btn-secondary btn-icon"
                      style={{ position: "absolute", bottom: "10px", right: "10px", width: "32px", height: "32px" }}
                      title="Sesi Dinle"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>SPEAKER SCRIPT (TÜRKÇE)</strong>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.6", marginTop: "5px" }}>
                    "{slide.scriptTr}"
                  </p>
                </div>
              </div>
            </div>

            {/* Slide Vocabulary Dictionary */}
            <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Slayta Özel Kritik Terimler</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {slide.vocabulary.map((vocab, vIdx) => {
                  const isBookmarked = bookmarkedList.includes(vocab.word);
                  return (
                    <div
                      key={vIdx}
                      className="glass-card"
                      style={{ padding: "12px", margin: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div>
                        <span style={{ fontWeight: "700", color: "#c084fc", fontSize: "0.95rem" }}>{vocab.word}</span>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>{vocab.tr}</div>
                      </div>

                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          onClick={() => handleToggleTermBookmark(vocab.word, vocab.tr)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: "26px", height: "26px", border: "none", color: isBookmarked ? "var(--color-warning)" : "var(--text-muted)" }}
                        >
                          <Star size={12} fill={isBookmarked ? "var(--color-warning)" : "none"} />
                        </button>
                        <button
                          onClick={() => handlePlayTTS(vocab.word)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: "26px", height: "26px", border: "none" }}
                        >
                          <Volume2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === "builder" && (
        // ================= TAB 2: SENTENCE BUILDER =================
        <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: "5px" }}>SLAYT {slide.id} CÜMLE PRATİĞİ</span>
            <h3>Slayt Cümlesini Birleştirin</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
              Slayttan alınan bu anahtar cümleyi kurallar çerçevesinde doğru birleştirin.
            </p>
          </div>

          <div style={{
            background: "rgba(139, 92, 246, 0.05)",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            fontWeight: "600",
            color: "#c084fc"
          }}>
            🗣️ Hedef Cümle: {slide.id === 1 ? "Konumuz, kullanıcı tanıma akışımızın HTTPS geçişiyle birlikte nasıl etkileneceği." : 
                              slide.id === 2 ? "Sunum boyunca altı temel başlığı ele alacağız." :
                              slide.id === 3 ? "Akış kısalır, kullanıcı deneyimi pürüzsüz hâle gelir." :
                              slide.id === 4 ? "Trafik şifresiz olduğu için operatör isteğin içeriğini görebiliyordu." :
                              slide.id === 5 ? "HTTPS geçişi artık isteğe bağlı değil, katı bir son tarihtir." :
                              slide.id === 6 ? "Trafiğimiz şifreli bir tünel içinden akmaya başlar." :
                              slide.id === 7 ? "Her ek adım, dönüşümde ölçülebilir bir düşüş yaratır." :
                              slide.id === 8 ? "Hiçbir şey yapmamak bir seçenek değildir, acele etmek de çözüm değildir." :
                              slide.id === 9 ? "Backend'in kullanıcıyı tanımaya devam etmesi için MSISDN akışını korumalıyız." :
                              slide.id === 10 ? "Operatör artık MSISDN'i isteğin içine değil, el sıkışmanın içine yerleştirir." :
                              slide.id === 11 ? "Proxy telefon numarasını ayıklar ve standart başlık formatına çevirir." :
                              slide.id === 12 ? "Farklı tarayıcılar ve cihazlar aynı şekilde davranmayabilir." :
                              slide.id === 13 ? "Her biri bağımsız değerlendirilebilen dört ek alternatif çözümümüz var." :
                              slide.id === 14 ? "Geliştirdiğimiz proxy çözümü varsayılan mobil tarayıcılarda sorunsuz çalışmaktadır." : "Cümleyi kurun."}
          </div>

          {/* Builder Drop Area */}
          <div className="builder-area" style={{ minHeight: "100px" }}>
            {assembledWords.length === 0 ? (
              <span style={{ color: "var(--text-dark)" }}>Kelimeleri seçin...</span>
            ) : (
              assembledWords.map((wordObj, sIdx) => (
                <div
                  key={sIdx}
                  onClick={() => handleRemoveWord(wordObj, sIdx)}
                  className="word-tile"
                  style={{ background: "var(--color-primary)", color: "white" }}
                >
                  {wordObj.word}
                </div>
              ))
            )}
          </div>

          {/* Word Pool Area */}
          <div className="word-pool">
            {shuffledWords.map((word, index) => {
              if (word === null) return null;
              return (
                <div
                  key={index}
                  onClick={() => handleWordClick(word, index)}
                  className="word-tile"
                >
                  {word}
                </div>
              );
            })}
          </div>

          {/* Verification feedback */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "15px" }}>
            <div>
              {builderFeedback && (
                <div className={`badge ${builderFeedback.status === "success" ? "badge-success" : "badge-danger"}`}>
                  {builderFeedback.text}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={resetBuilder} className="btn btn-secondary">Temizle</button>
              <button onClick={checkSentence} disabled={assembledWords.length === 0} className="btn btn-primary">Kontrol Et</button>
            </div>
          </div>
        </div>
      )}

      {subTab === "vocab" && (
        // ================= TAB 3: VOCAB QUIZ =================
        <div className="glass-panel" style={{ padding: "30px", minHeight: "350px" }}>
          {vocabQuizIdx < allVocabQuizList.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s ease" }}>
              <div>
                <span className="badge badge-primary">TERİM SORUSU {vocabQuizIdx + 1} / {allVocabQuizList.length}</span>
                <h3 style={{ fontSize: "1.3rem", marginTop: "10px" }}>
                  Aşağıdaki teknik İngilizce terimin Türkçe karşılığı hangisidir?
                </h3>
                <h2 style={{ fontSize: "2rem", color: "var(--color-primary)", marginTop: "10px" }}>
                  "{activeQuizWord?.word}"
                </h2>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {getQuizOptions(activeQuizWord).map((opt, optIdx) => {
                  const isSelected = selectedOpt === optIdx;
                  let bg = "rgba(255,255,255,0.02)";
                  let border = "var(--border-glass)";

                  if (isSelected) {
                    if (vocabFeedback) {
                      bg = vocabFeedback.correct ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)";
                      border = vocabFeedback.correct ? "var(--color-success)" : "var(--color-danger)";
                    } else {
                      bg = "rgba(139,92,246,0.15)";
                      border = "var(--color-primary)";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleVocabAnswer(optIdx, activeQuizWord.tr)}
                      className="btn"
                      style={{ justifyContent: "flex-start", padding: "15px 20px", background: bg, borderColor: border, color: "white" }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {vocabFeedback && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <span style={{ color: vocabFeedback.correct ? "#34d399" : "#f87171", fontWeight: "600" }}>{vocabFeedback.text}</span>
                  <button onClick={handleNextVocabQuestion} className="btn btn-primary" style={{ gap: "6px" }}>
                    <span>Sonraki Soru</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Quiz Results
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px" }}>
              <Award size={64} style={{ color: "var(--color-warning)" }} />
              <h2>Terim Testi Tamamlandı!</h2>
              <p style={{ color: "var(--text-muted)" }}>HTTPS Header Enrichment sunumuna ait teknik kavramları pekiştirdiniz.</p>
              <div className="badge badge-success" style={{ padding: "10px 20px", fontSize: "1rem" }}>
                Skor: {vocabScore} / {allVocabQuizList.length} Doğru
              </div>
              <button onClick={handleStartVocabQuiz} className="btn btn-primary">Yeniden Başlat</button>
            </div>
          )}
        </div>
      )}

      {subTab === "speaking" && (
        // ================= TAB 4: PRESENTATION SIMULATOR =================
        <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "25px" }}>
          <div>
            <span className="badge badge-primary">SLAYT {slide.id} SESLİ SUNMA PRATİĞİ</span>
            <h3>Slaytı İngilizce Sunun</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
              Mikrofon simgesine basıp slaytın İngilizce metnini okuyun. Telaffuzunuz kelime kelime doğrulanacaktır.
            </p>
          </div>

          {/* Orijinal Metin (Target Speech) */}
          <div style={{
            background: "rgba(255,255,255,0.01)",
            border: "1px solid var(--border-glass)",
            padding: "20px",
            borderRadius: "10px",
            fontSize: "1.15rem",
            lineHeight: "1.7",
            position: "relative"
          }}>
            {/* Word by word rendering colored by speech recognition */}
            {slide.scriptEn.split(/\s+/).map((word, wordIdx) => {
              const cleanW = word.toLowerCase().replace(/[^a-z0-9]/g, "");
              const isMatched = spokenWordsList.includes(cleanW);
              let color = "white";
              if (spokenTranscript) {
                color = isMatched ? "#34d399" : "#f87171"; // green or red
              }
              return (
                <span key={wordIdx} style={{ color, marginRight: "6px", display: "inline-block", fontWeight: spokenTranscript && isMatched ? "600" : "400" }}>
                  {word}
                </span>
              );
            })}
          </div>

          {/* Mic controls */}
          <div className="mic-button-container">
            <button
              onClick={isListening ? handleStopSpeaking : handleStartSpeaking}
              className={`mic-button ${isListening ? "listening" : ""}`}
              style={{ width: "65px", height: "65px" }}
            >
              <Mic size={22} />
            </button>
            <span style={{ fontSize: "0.8rem", color: isListening ? "var(--color-danger)" : "var(--text-muted)", marginTop: "10px", fontWeight: "600" }}>
              {isListening ? "Sizi dinliyorum..." : "Konuşmak İçin Dokunun"}
            </span>
          </div>

          {/* Feedback */}
          {spokenTranscript && (
            <div className="glass-card" style={{ border: "1px dashed var(--border-glass)", marginTop: "15px" }}>
              <div style={{ fontSize: "0.9rem" }}>🗣️ Söylediğiniz: <b>"{spokenTranscript}"</b></div>
              {speakingScore !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                  <div style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    background: speakingScore >= 80 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    color: speakingScore >= 80 ? "#34d399" : "#fbbf24"
                  }}>
                    Eşleşme Oranı: %{speakingScore}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {speakingScore >= 80 ? "Başarılı sunum! Daily görev tamamlandı ve +30 XP kazandınız." : "Bazı kelimeler atlandı veya anlaşılamadı. Tekrar deneyin."}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Slider controller */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "15px" }}>
            <button onClick={handlePrevSlide} disabled={currentSlideIdx === 0} className="btn btn-secondary">
              Önceki Slayt
            </button>
            <button onClick={handleNextSlide} disabled={currentSlideIdx === presentationSlides.length - 1} className="btn btn-secondary">
              Sonraki Slayt
            </button>
          </div>
        </div>
      )}

      {subTab === "qa" && (
        // ================= TAB 5: AUDIENCE Q&A =================
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {activeQAIdx === null ? (
            // List of questions
            <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <h3>Simüle Edilmiş İzleyici Soruları</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "10px" }}>
                Sunum sonrasında dinleyicilerden gelebilecek 4 kritik sorudan birini seçerek cevap pratiği yapın.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {presentationQA.map((qa, idx) => (
                  <button
                    key={qa.id}
                    onClick={() => handleQASelect(idx)}
                    className="btn btn-secondary"
                    style={{ justifyContent: "flex-start", padding: "18px", textAlign: "left", borderRadius: "10px" }}
                  >
                    🗣️ {qa.question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // QA Active Session
            <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "25px" }}>
              <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "15px" }}>
                <span className="badge badge-secondary" style={{ marginBottom: "5px" }}>ZOR TEKNİK SORU</span>
                <h2 style={{ fontSize: "1.4rem", color: "var(--color-primary)" }}>
                  {presentationQA[activeQAIdx].question}
                </h2>
                <button
                  onClick={() => handlePlayTTS(presentationQA[activeQAIdx].question)}
                  className="btn btn-secondary"
                  style={{ gap: "4px", padding: "4px 8px", fontSize: "0.75rem", marginTop: "10px" }}
                >
                  <Volume2 size={12} /> Soruyu Seslendir
                </button>
              </div>

              {/* User Answer Field */}
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "5px" }}>
                  İNGİLİZCE CEVABINIZ (Konuşun veya Yazın)
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Cevabınızı buraya yazabilir ya da mikrofonu kullanarak sesli konuşabilirsiniz..."
                  value={userQAInput}
                  onChange={(e) => setUserQAInput(e.target.value)}
                  style={{ padding: "15px", fontSize: "1rem", lineHeight: "1.5" }}
                />

                <div className="mic-button-container" style={{ margin: "15px 0" }}>
                  <button
                    onClick={isListening ? handleStopSpeaking : handleQAMicInput}
                    className={`mic-button ${isListening ? "listening" : ""}`}
                    style={{ width: "55px", height: "55px" }}
                  >
                    <Mic size={18} />
                  </button>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    {isListening ? "Dinleniyor..." : "Sesle Yanıt Ver"}
                  </span>
                </div>
              </div>

              {/* Submission & Feedback */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={() => setActiveQAIdx(null)} className="btn btn-secondary">
                  Sorulara Geri Dön
                </button>
                <button onClick={handleQASubmit} disabled={qaLoading || !userQAInput.trim()} className="btn btn-primary" style={{ gap: "6px" }}>
                  {qaLoading ? <RefreshCw className="animate-spin" size={14} /> : null}
                  <span>Cevabımı Değerlendir</span>
                </button>
              </div>

              {qaFeedback && (
                <div className="glass-card" style={{ borderLeft: "4px solid var(--color-primary)", marginTop: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ color: "var(--color-primary)" }}>Cevap Değerlendirmesi</h4>
                    <span className="badge badge-success" style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
                      Değerlendirme Puanı: {qaFeedback.score} / 100
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "15px" }}>{qaFeedback.evalText}</p>

                  <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "15px" }}>
                    <strong style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "5px" }}>
                      AI Dinleyici Yanıtı (Follow-up Response):
                    </strong>
                    <div style={{
                      background: "rgba(0,0,0,0.15)",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      fontStyle: "italic",
                      position: "relative"
                    }}>
                      "{qaFeedback.botResponse}"
                      <button
                        onClick={() => speakText(qaFeedback.botResponse, 0.95)}
                        className="btn btn-secondary btn-icon"
                        style={{ position: "absolute", bottom: "8px", right: "8px", width: "24px", height: "24px", border: "none" }}
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {subTab === "sektor" && (
        // ================= TAB 6: VAS SEKTÖR TERİMLERİ (FLASHCARDS & MATCHING) =================
        <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.2s ease" }}>
          
          {/* Sektör Terimleri Quiz Section */}
          <div className="glass-panel" style={{ padding: "30px" }}>
            {!sektorQuizActive ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem" }}>🚀 Mobil & VAS Sektör Terimleri Testi</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                    Tanımları verilen 5 rastgele katma değerli servis terimini doğru tahmin edin, +40 XP bonus kazanın!
                  </p>
                </div>
                <button onClick={startSektorQuiz} className="btn btn-primary" style={{ gap: "6px" }}>
                  <Sparkles size={16} />
                  <span>Alıştırmayı Başlat</span>
                </button>
              </div>
            ) : sektorQuizIdx < 5 ? (
              // Quiz Question
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-primary">Soru {sektorQuizIdx + 1} / 5</span>
                  <span className="badge badge-success">Skor: {sektorQuizScore} / {sektorQuizIdx}</span>
                </div>
                <div>
                  <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Bu hangi terimin açıklamasıdır?</h4>
                  <div style={{
                    background: "rgba(139, 92, 246, 0.05)",
                    padding: "20px",
                    borderRadius: "10px",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    fontSize: "1.1rem",
                    lineHeight: "1.6",
                    marginTop: "10px",
                    fontWeight: "500"
                  }}>
                    "{sektorQuizQuestions[sektorQuizIdx]?.desc}"
                  </div>
                </div>

                {/* Multiple choice options */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {sektorQuizQuestions[sektorQuizIdx]?.options.map((opt, oIdx) => {
                    const isSelected = sektorQuizSelected === opt;
                    const isCorrectOpt = opt === sektorQuizQuestions[sektorQuizIdx]?.correct;
                    let border = "var(--border-glass)";
                    let bg = "rgba(255, 255, 255, 0.02)";

                    if (sektorQuizFeedback) {
                      if (isCorrectOpt) {
                        border = "var(--color-success)";
                        bg = "rgba(16, 185, 129, 0.15)";
                      } else if (isSelected) {
                        border = "var(--color-danger)";
                        bg = "rgba(239, 68, 68, 0.15)";
                      }
                    } else if (isSelected) {
                      border = "var(--color-primary)";
                      bg = "rgba(139, 92, 246, 0.15)";
                    }

                    return (
                      <div
                        key={oIdx}
                        role="button"
                        onClick={() => handleSektorQuizAnswer(opt)}
                        className="btn"
                        style={{
                          justifyContent: "center",
                          padding: "16px",
                          background: bg,
                          borderColor: border,
                          color: "white",
                          fontSize: "0.95rem",
                          cursor: sektorQuizFeedback ? "default" : "pointer"
                        }}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>

                {sektorQuizFeedback && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "15px", marginTop: "10px" }}>
                    <span style={{ color: sektorQuizFeedback.correct ? "#34d399" : "#f87171", fontWeight: "600", fontSize: "0.95rem" }}>
                      {sektorQuizFeedback.text}
                    </span>
                    <button onClick={handleNextSektorQuestion} className="btn btn-primary" style={{ gap: "6px" }}>
                      <span>{sektorQuizIdx === 4 ? "Sonuçları Gör" : "Sonraki Soru"}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Quiz Finished Screen
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px", padding: "10px 0" }}>
                <Award size={60} style={{ color: "var(--color-warning)" }} />
                <h3>Alıştırma Tamamlandı!</h3>
                <p style={{ color: "var(--text-muted)", maxWidth: "500px" }}>
                  Mobil içerik ve VAS sektör terimleri konusundaki bilginizi başarıyla test ettiniz. Günlük sunum görevi tamamlandı!
                </p>
                <div style={{ display: "flex", gap: "15px", marginTop: "5px" }}>
                  <div className="badge badge-success" style={{ padding: "8px 16px", fontSize: "0.95rem" }}>
                    Skor: {sektorQuizScore} / 5 Doğru
                  </div>
                  <div className="badge badge-primary" style={{ padding: "8px 16px", fontSize: "0.95rem" }}>
                    +40 XP Tamamlama Bonusu
                  </div>
                </div>
                <button onClick={startSektorQuiz} className="btn btn-primary" style={{ marginTop: "10px" }}>
                  Yeniden Başlat
                </button>
              </div>
            )}
          </div>

          {/* Flashcards Section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px" }}>
              <div>
                <h3 style={{ fontSize: "1.3rem" }}>🃏 Mobil & VAS Sektörü Terim Kartları</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
                  Tanımını ve Türkçe karşılığını görmek için kartın üzerine dokunup çevirin.
                </p>
              </div>
              <span className="badge badge-primary">{vasSectorTerms.length} Terim Yüklendi</span>
            </div>

            {/* Flashcards Grid */}
            <div className="flip-card-container">
              {vasSectorTerms.map((term, index) => {
                const isFlipped = !!flippedTerms[index];
                const isBookmarked = bookmarkedList.includes(term.english);
                
                return (
                  <div
                    key={index}
                    className={`flip-card ${isFlipped ? "flipped" : ""}`}
                    onClick={() => toggleTermFlip(index)}
                  >
                    <div className="flip-card-inner">
                      
                      {/* Front Side */}
                      <div className="flip-card-front">
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
                          İngilizce Terim
                        </span>
                        <h3 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#c084fc", margin: "10px 0" }}>
                          {term.english}
                        </h3>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "10px" }}>
                          Kartı çevirmek için tıkla
                        </p>
                      </div>

                      {/* Back Side */}
                      <div className="flip-card-back" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-secondary)" }}>
                            {term.turkish}
                          </span>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleTermBookmark(term.english, term.turkish); }}
                              className="btn btn-secondary btn-icon"
                              style={{ width: "24px", height: "24px", border: "none", color: isBookmarked ? "var(--color-warning)" : "var(--text-muted)" }}
                              title="Sözlüğe Ekle"
                            >
                              <Star size={12} fill={isBookmarked ? "var(--color-warning)" : "none"} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePlayTTS(term.english); }}
                              className="btn btn-secondary btn-icon"
                              style={{ width: "24px", height: "24px", border: "none" }}
                              title="Telaffuz Dinle"
                            >
                              <Volume2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: "0.75rem", lineHeight: "1.4", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
                          {term.desc}
                        </p>
                        <span onClick={() => toggleTermFlip(index)} style={{ fontSize: "0.7rem", color: "var(--color-primary)", marginTop: "auto", cursor: "pointer", display: "inline-block", padding: "2px 5px" }}>
                          Geri Çevir
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
