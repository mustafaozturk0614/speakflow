import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Play, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Trophy, 
  Star, 
  Volume2 
} from "lucide-react";
import { grammarPatterns } from "../utils/mockData";
import { speakText } from "../utils/speech";
import { awardXP, completeDailyTask } from "../utils/gamification";

export default function GrammarModule() {
  // Topics & Progression
  const [completedLessons, setCompletedLessons] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(grammarPatterns[0]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Öğren, 2: Cümle Kur, 3: Pekiştir

  // Step 2: Sentence Builder States
  const [activeBuilderIdx, setActiveBuilderIdx] = useState(0); // 0 or 1
  const [assembledWords, setAssembledWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [builderFeedback, setBuilderFeedback] = useState(null);
  const [builderSuccessCount, setBuilderSuccessCount] = useState(0); // number of sentences built correctly (needs to reach 2)

  // Step 3: Practice States
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null); // { correct: bool, text: str }
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("speakflow_completed_lessons");
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Helper to determine lock status
  const isLessonUnlocked = (lessonId) => {
    const idx = grammarPatterns.findIndex(p => p.id === lessonId);
    if (idx === 0) return true; // first lesson always unlocked
    
    // Unlocked if previous lesson is completed
    const prevLesson = grammarPatterns[idx - 1];
    return completedLessons.includes(prevLesson.id);
  };

  // Reset builder state when active lesson or builder index changes
  useEffect(() => {
    if (selectedPattern.sentenceBuilders && selectedPattern.sentenceBuilders[activeBuilderIdx]) {
      resetBuilderForCurrentSentence();
    }
  }, [selectedPattern, activeBuilderIdx]);

  // Reset quiz when transitioning to Step 3
  useEffect(() => {
    if (currentStep === 3) {
      setActiveQuestionIdx(0);
      setSelectedOption(null);
      setQuizFeedback(null);
      setCorrectAnswersCount(0);
    }
  }, [currentStep]);

  const resetBuilderForCurrentSentence = () => {
    setAssembledWords([]);
    setBuilderFeedback(null);
    const builder = selectedPattern.sentenceBuilders[activeBuilderIdx];
    if (builder) {
      const shuffled = [...builder.words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
    }
  };

  const handleLessonSelect = (pattern) => {
    if (!isLessonUnlocked(pattern.id)) {
      alert("Bu konuya geçmek için lütfen önceki konuları tamamlayın!");
      return;
    }
    setSelectedPattern(pattern);
    setCurrentStep(1);
    setActiveBuilderIdx(0);
    setBuilderSuccessCount(0);
  };

  // Visual Builder Actions
  const handleWordClick = (word, index) => {
    setAssembledWords([...assembledWords, { word, originalIndex: index }]);
    const newPool = [...shuffledWords];
    newPool[index] = null;
    setShuffledWords(newPool);
  };

  const handleRemoveWord = (wordObj, assembledIndex) => {
    const newAssembled = [...assembledWords];
    newAssembled.splice(assembledIndex, 1);
    setAssembledWords(newAssembled);

    const newPool = [...shuffledWords];
    newPool[wordObj.originalIndex] = wordObj.word;
    setShuffledWords(newPool);
    setBuilderFeedback(null);
  };

  const checkSentence = () => {
    const userSentence = assembledWords.map(w => w.word).join(" ");
    const currentBuilder = selectedPattern.sentenceBuilders[activeBuilderIdx];
    
    const cleanUser = userSentence.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    const cleanTarget = currentBuilder.target.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

    if (cleanUser === cleanTarget) {
      setBuilderFeedback({
        status: "success",
        text: "Tebrikler! Cümleyi doğru inşa ettiniz."
      });
      speakText(currentBuilder.target, 0.9);
      
      // Update correct count
      const nextSuccessCount = builderSuccessCount + 1;
      setBuilderSuccessCount(nextSuccessCount);

      if (nextSuccessCount < 2 && activeBuilderIdx === 0) {
        // Move to second sentence automatically after a short delay
        setTimeout(() => {
          setActiveBuilderIdx(1);
        }, 1500);
      }
    } else {
      setBuilderFeedback({
        status: "error",
        text: "Hatalı kelime dizilimi. Formülü inceleyerek tekrar deneyin!"
      });
    }
  };

  // Multiple Choice Quiz Actions
  const handleOptionSelect = (optionIdx) => {
    if (quizFeedback) return; // disable selection once checked
    setSelectedOption(optionIdx);

    const question = selectedPattern.questions[activeQuestionIdx];
    const isCorrect = optionIdx === question.correctIndex;

    if (isCorrect) {
      setQuizFeedback({ correct: true, text: "Doğru Cevap! 🎉" });
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      setQuizFeedback({ correct: false, text: "Yanlış Cevap, tekrar inceleyin. ❌" });
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setQuizFeedback(null);
    if (activeQuestionIdx < selectedPattern.questions.length - 1) {
      setActiveQuestionIdx(prev => prev + 1);
    } else {
      // Completed all questions in the quiz!
      setActiveQuestionIdx(selectedPattern.questions.length); // trigger results view
    }
  };

  const handleCompleteLesson = () => {
    // Add current lesson to completed
    const updated = [...completedLessons];
    if (!updated.includes(selectedPattern.id)) {
      updated.push(selectedPattern.id);
    }
    setCompletedLessons(updated);
    localStorage.setItem("speakflow_completed_lessons", JSON.stringify(updated));
    awardXP(50); // Award 50 XP
    completeDailyTask("task_grammar"); // Complete daily grammar task!

    // Try to find and select next lesson
    const currentIdx = grammarPatterns.findIndex(p => p.id === selectedPattern.id);
    const nextLesson = grammarPatterns[currentIdx + 1];

    if (nextLesson) {
      setSelectedPattern(nextLesson);
      setCurrentStep(1);
      setActiveBuilderIdx(0);
      setBuilderSuccessCount(0);
    } else {
      // All lessons completed!
      alert("Tebrikler! Tüm gramer konularını başarıyla tamamladınız! 🏆");
      setCurrentStep(1); // Go back to lesson page
    }
  };

  // Helper to draw progress bars or ticks
  const getProgressPercentage = () => {
    const completedCount = completedLessons.length;
    return (completedCount / grammarPatterns.length) * 100;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.2s ease" }}>
      {/* Top Banner & Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BookOpen size={32} style={{ color: "var(--color-primary)" }} />
            Pratik Dil Bilgisi (Gramer Yolculuğu)
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Okul derslerini geride bırakın. Önce öğrenin, sonra cümle kurun, pekiştirin ve yeni konuları açın!
          </p>
        </div>

        {/* Level Progression Bar */}
        <div className="glass-panel" style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: "6px", width: "250px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "600" }}>
            <span>GENEL İLERLEME</span>
            <span style={{ color: "var(--color-secondary)" }}>%{Math.round(getProgressPercentage())}</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{
              background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              width: `${getProgressPercentage()}%`,
              height: "100%",
              transition: "width 0.4s ease"
            }} />
          </div>
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textAlign: "right" }}>
            {completedLessons.length} / {grammarPatterns.length} Konu Bitti
          </span>
        </div>
      </div>

      {/* Topics Roadmap Horizontal Carousel */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px" }}>
        {grammarPatterns.map((pat, idx) => {
          const isCompleted = completedLessons.includes(pat.id);
          const isUnlocked = isLessonUnlocked(pat.id);
          const isActive = selectedPattern.id === pat.id;

          return (
            <button
              key={pat.id}
              onClick={() => isUnlocked && handleLessonSelect(pat)}
              className="glass-card"
              style={{
                flex: "0 0 200px",
                padding: "15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                cursor: isUnlocked ? "pointer" : "not-allowed",
                opacity: isUnlocked ? 1 : 0.4,
                borderColor: isActive ? "var(--color-primary)" : isCompleted ? "rgba(16, 185, 129, 0.4)" : "var(--border-glass)",
                background: isActive ? "rgba(139, 92, 246, 0.08)" : isCompleted ? "rgba(16, 185, 129, 0.03)" : "rgba(255, 255, 255, 0.01)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: "600", color: isCompleted ? "#34d399" : "var(--text-muted)" }}>
                  {isCompleted ? "✓ TAMAMLANDI" : `KONU ${idx + 1}`}
                </span>
                {!isUnlocked ? (
                  <Lock size={12} style={{ color: "var(--text-muted)" }} />
                ) : isCompleted ? (
                  <Check size={12} style={{ color: "#34d399" }} />
                ) : (
                  <Unlock size={12} style={{ color: "var(--color-primary)" }} />
                )}
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", textAlign: "left" }}>
                {pat.title.split(". ")[1] || pat.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Inner Step Indicator Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "10px" }}>
        {[
          { step: 1, label: "1. ÖĞREN (Grammar Visual)", icon: BookOpen },
          { step: 2, label: `2. CÜMLE KUR (${builderSuccessCount}/2)`, icon: Star },
          { step: 3, label: "3. PEKİŞTİR (Mini Test)", icon: Trophy }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isPassed = currentStep > item.step;

          return (
            <button
              key={item.step}
              onClick={() => {
                // Prevent jumping ahead if not qualified
                if (item.step === 2 && builderSuccessCount === 0 && currentStep === 1) {
                  // Let them move to sentence build anyway, but keep tracker
                }
                if (item.step === 3 && builderSuccessCount < 2) {
                  alert("Lütfen önce 2 cümle kurma egzersizini de tamamlayın!");
                  return;
                }
                setCurrentStep(item.step);
              }}
              className="btn"
              style={{
                background: isActive ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)" : "transparent",
                borderColor: isActive ? "rgba(139, 92, 246, 0.4)" : isPassed ? "rgba(16, 185, 129, 0.3)" : "var(--border-glass)",
                color: isActive ? "#c084fc" : isPassed ? "#34d399" : "var(--text-muted)",
                borderRadius: "10px",
                padding: "12px",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Study Panel */}
      <div className="glass-panel" style={{ padding: "30px", minHeight: "350px" }}>
        
        {currentStep === 1 && (
          // ================= STEP 1: LEARN =================
          <div style={{ display: "flex", flexDirection: "column", gap: "25px", animation: "fadeIn 0.2s ease" }}>
            <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "15px" }}>
              <span className="badge badge-primary" style={{ marginBottom: "10px" }}>YAPISAL FORMÜL</span>
              <h2 style={{ fontSize: "1.8rem", fontFamily: "monospace", color: "#c084fc", fontWeight: "700" }}>
                {selectedPattern.formula}
              </h2>
            </div>

            <div>
              <h4 style={{ fontSize: "1.05rem", marginBottom: "8px" }}>Bu Yapıyı Ne Zaman ve Nasıl Kullanırız?</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                {selectedPattern.simpleExplanation}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: "1.05rem", marginBottom: "12px" }}>Günlük Hayattan Doğal Cümle Örnekleri</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedPattern.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-glass)",
                      padding: "15px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "1.05rem" }}>{ex.en}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>{ex.tr}</div>
                    </div>
                    <button
                      onClick={() => speakText(ex.en, 0.9)}
                      className="btn btn-secondary btn-icon"
                      style={{ width: "36px", height: "36px" }}
                    >
                      <Volume2 size={16} style={{ color: "var(--color-primary)" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="btn btn-primary"
              style={{ alignSelf: "flex-end", gap: "8px", marginTop: "10px" }}
            >
              <span>Cümle Kurma Egzersizine Geç</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          // ================= STEP 2: BUILD SENTENCE =================
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s ease" }}>
            <div>
              <span className="badge badge-warning" style={{ marginBottom: "5px" }}>
                EGZERSİZ {activeBuilderIdx + 1} / 2
              </span>
              <h3 style={{ fontSize: "1.2rem", marginTop: "5px" }}>Görsel Cümle Kurucu</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Aşağıdaki kelimeleri doğru İngilizce gramer formülüyle dizin.
              </p>
            </div>

            {/* Target Meaning */}
            <div style={{
              background: "rgba(139, 92, 246, 0.05)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              padding: "15px",
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#c084fc"
            }}>
              🗣️ Türkçe Cümle: "{selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "I went to the market yesterday" ? "Dün markete gittim." : 
                                    selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "She worked late last night" ? "O dün gece geç çalıştı." :
                                    selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "I drink coffee every morning" ? "Her sabah kahve içerim." :
                                    selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "We are learning English right now" ? "Şu an İngilizce öğreniyoruz." :
                                    selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "I will call you later" ? "Seni sonra arayacağım." :
                                    selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "They are going to meet tomorrow" ? "Yarın buluşacaklar." :
                                    selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "If I had time I would travel more" ? "Zamanım olsaydı daha çok seyahat ederdir." :
                                    selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "If she spoke English she would get the job" ? "İngilizce konuşsaydı işi alırdı." :
                                    selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "I have visited London three times" ? "Londra'yı üç kez ziyaret ettim." :
                                    selectedPattern.sentenceBuilders[activeBuilderIdx]?.target === "She has lost her keys again" ? "Anahtarlarını yine kaybetti." : "Cümleyi kurun."}"
            </div>

            {/* Assembled area */}
            <div className="builder-area" style={{ minHeight: "100px", fontSize: "1.1rem" }}>
              {assembledWords.length === 0 ? (
                <span style={{ color: "var(--text-dark)" }}>Kelimeleri seçmek için havuzdan tıklayın...</span>
              ) : (
                assembledWords.map((wordObj, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleRemoveWord(wordObj, idx)}
                    className="word-tile"
                    style={{ background: "var(--color-primary)", color: "white" }}
                  >
                    {wordObj.word}
                  </div>
                ))
              )}
            </div>

            {/* Word pool */}
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

            {/* Actions & Feedback */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "20px", marginTop: "10px" }}>
              <div>
                {builderFeedback && (
                  <div className={`badge ${builderFeedback.status === "success" ? "badge-success" : "badge-danger"}`} style={{ padding: "8px 12px", borderRadius: "6px" }}>
                    {builderFeedback.text}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={resetBuilderForCurrentSentence} className="btn btn-secondary">
                  Temizle
                </button>
                <button
                  onClick={checkSentence}
                  disabled={assembledWords.length === 0}
                  className="btn btn-primary"
                >
                  Kontrol Et
                </button>
              </div>
            </div>

            {/* Success Next Step Prompt */}
            {builderSuccessCount >= 2 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "15px",
                borderRadius: "10px",
                marginTop: "15px"
              }}>
                <span style={{ color: "#34d399", fontWeight: "600", fontSize: "0.9rem" }}>
                  🎉 İki cümleyi de başarıyla kurdunuz! Pekiştirme aşamasına geçmeye hazırsınız.
                </span>
                <button onClick={() => setCurrentStep(3)} className="btn btn-primary" style={{ gap: "6px" }}>
                  <span>Pekiştirme Adımına Geç</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          // ================= STEP 3: REINFORCE / QUIZ =================
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s ease" }}>
            
            {activeQuestionIdx < selectedPattern.questions.length ? (
              // Quiz Question view
              <>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: "5px" }}>
                    SORU {activeQuestionIdx + 1} / {selectedPattern.questions.length}
                  </span>
                  <h3 style={{ fontSize: "1.2rem", marginTop: "5px" }}>
                    {selectedPattern.questions[activeQuestionIdx].text}
                  </h3>
                </div>

                {/* Options List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedPattern.questions[activeQuestionIdx].options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    let optionBg = "rgba(255,255,255,0.02)";
                    let optionBorder = "var(--border-glass)";

                    if (isSelected) {
                      if (quizFeedback) {
                        optionBg = quizFeedback.correct ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)";
                        optionBorder = quizFeedback.correct ? "var(--color-success)" : "var(--color-danger)";
                      } else {
                        optionBg = "rgba(139, 92, 246, 0.15)";
                        optionBorder = "var(--color-primary)";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(optIdx)}
                        className="btn"
                        style={{
                          justifyContent: "flex-start",
                          padding: "16px 20px",
                          background: optionBg,
                          borderColor: optionBorder,
                          borderRadius: "10px",
                          textAlign: "left",
                          fontSize: "1rem",
                          fontWeight: "500",
                          color: "white"
                        }}
                      >
                        <span style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: isSelected ? "var(--color-primary)" : "rgba(255,255,255,0.1)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "12px",
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          flexShrink: 0
                        }}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Question Feedback Box */}
                {quizFeedback && (
                  <div style={{
                    padding: "15px",
                    borderRadius: "10px",
                    background: quizFeedback.correct ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
                    border: `1px solid ${quizFeedback.correct ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                  }}>
                    <strong style={{ display: "block", color: quizFeedback.correct ? "#34d399" : "#f87171", marginBottom: "5px" }}>
                      {quizFeedback.text}
                    </strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                      💡 {selectedPattern.questions[activeQuestionIdx].explanation}
                    </p>
                  </div>
                )}

                {/* Navigation actions */}
                {quizFeedback && (
                  <button
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                    style={{ alignSelf: "flex-end", gap: "6px" }}
                  >
                    <span>{activeQuestionIdx === selectedPattern.questions.length - 1 ? "Test Sonucunu Gör" : "Sonraki Soru"}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </>
            ) : (
              // Quiz Results View
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px", padding: "20px" }}>
                <Trophy size={60} style={{ color: "var(--color-warning)" }} />
                
                <div>
                  <h2 style={{ fontSize: "1.6rem", color: "#34d399", marginBottom: "8px" }}>Tebrikler! Testi Bitirdiniz</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                    Konuyla ilgili tüm soruları başarıyla yanıtladınız. Artık bu yapıyı günlük konuşmalarınızda kullanmaya hazırsınız.
                  </p>
                </div>

                <div style={{
                  padding: "10px 25px",
                  borderRadius: "20px",
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#c084fc",
                  fontWeight: "700",
                  fontSize: "1rem",
                  border: "1px solid rgba(139, 92, 246, 0.3)"
                }}>
                  Doğruluk Oranı: %100 (3 / 3 Soru)
                </div>

                <button
                  onClick={handleCompleteLesson}
                  className="btn btn-primary"
                  style={{ gap: "8px", padding: "12px 30px", marginTop: "10px" }}
                >
                  <span>Konuyu Tamamla & Sonraki Konunun Kilidini Aç</span>
                  <Unlock size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
