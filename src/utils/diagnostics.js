// Rule-based local diagnostic and evaluation engine for Turkish learners of English

const commonMistakesDatabase = [
  {
    pattern: /\bi\s+am\s+work\b/i,
    wrongText: "I am work...",
    correctText: "I work... / I am working...",
    explanation: "İngilizcede aynı anda hem am/is/are hem de yalın fiil kullanılmaz. Durumu veya mesleği belirtirken 'I work' veya 'I am a...' demelisin."
  },
  {
    pattern: /\bi\s+am\s+agree\b/i,
    wrongText: "I am agree",
    correctText: "I agree",
    explanation: "'Agree' (katılmak) zaten bir fiildir. Önüne 'am' getirilmez. 'I agree' demen yeterlidir."
  },
  {
    pattern: /\bi\s+am\s+go\b/i,
    wrongText: "I am go...",
    correctText: "I am going... / I go...",
    explanation: "Şu an gidiyorsan 'I am going', genelde gidersen 'I go' kullanılır. 'I am go' hatalıdır."
  },
  {
    pattern: /\bi\s+was\s+go\b/i,
    wrongText: "I was go...",
    correctText: "I went... / I was going...",
    explanation: "Geçmişte gittim demek için 'I went', gidiyordum demek için 'I was going' demelisin."
  },
  {
    pattern: /\bhe\s+work\b/i,
    wrongText: "He work...",
    correctText: "He works...",
    explanation: "Geniş zamanda he/she/it öznelerinden sonra fiile '-s' takısı gelir."
  },
  {
    pattern: /\bshe\s+work\b/i,
    wrongText: "She work...",
    correctText: "She works...",
    explanation: "Geniş zamanda he/she/it öznelerinden sonra fiile '-s' takısı gelir."
  },
  {
    pattern: /\bi\s+work\s+here\s+since\b/i,
    wrongText: "...work here since...",
    correctText: "...have been working here since...",
    explanation: "'Since' (beri) kullanarak geçmişten bugüne devam eden işleri anlatırken Present Perfect Continuous ('have been working') kullanılır."
  },
  {
    pattern: /\bmore\s+good\b/i,
    wrongText: "more good",
    correctText: "better",
    explanation: "'Good' kelimesinin karşılaştırma (comparative) hali 'more good' değil, düzensiz olan 'better' kelimesidir."
  },
  {
    pattern: /\bmore\s+bad\b/i,
    wrongText: "more bad",
    correctText: "worse",
    explanation: "'Bad' kelimesinin karşılaştırma (comparative) hali 'more bad' değil, düzensiz olan 'worse' kelimesidir."
  },
  {
    pattern: /\bwith\s+card\b/i,
    wrongText: "with card",
    correctText: "by card",
    explanation: "Ödeme yöntemlerini söylerken 'with card' yerine 'by card' (kartla) veya 'in cash' (nakit) ifadesi tercih edilir."
  },
  {
    pattern: /\bplay\b.*\bgame\b/i,
    wrongText: "play game",
    correctText: "play games / play video games",
    explanation: "İngilizcede oyun oynamak derken genelde çoğul olarak 'play games' ya da 'play video games' tercih edilir."
  },
  {
    pattern: /\blisten\s+music\b/i,
    wrongText: "listen music",
    correctText: "listen to music",
    explanation: "Listen fiili her zaman 'to' edatı ile birlikte kullanılır: 'listen to music'."
  },
  {
    pattern: /\bgo\s+to\s+holiday\b/i,
    wrongText: "go to holiday",
    correctText: "go on holiday / go on vacation",
    explanation: "Tatile gitmek derken yönelme edatı 'to' yerine 'on' edatı kullanılır: 'go on holiday'."
  },
  {
    pattern: /\bexplain\s+me\b/i,
    wrongText: "explain me",
    correctText: "explain to me",
    explanation: "Bana açıkla derken yönelme belirtmek için 'explain to me' kullanılır."
  }
];

export const evaluateSentenceLocally = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      hasError: false,
      wrongText: "",
      correctText: "",
      explanation: ""
    };
  }

  const cleanText = text.trim();
  
  // Check for patterns in the database
  for (const item of commonMistakesDatabase) {
    if (item.pattern.test(cleanText)) {
      return {
        hasError: true,
        wrongText: item.wrongText,
        correctText: item.correctText,
        explanation: item.explanation
      };
    }
  }

  // Generic check for very short responses without capitalization or ending
  if (cleanText.split(/\s+/).length < 3) {
    return {
      hasError: true,
      wrongText: cleanText,
      correctText: `I would like to say: ${cleanText}...`,
      explanation: "Çok kısa ve kelime odaklı bir cevap verdin. Cümleyi tam bir yargı belirtecek şekilde 'I would like to...' veya 'I think...' gibi kalıplarla başlatabilirsin."
    };
  }

  return {
    hasError: false,
    wrongText: "",
    correctText: "",
    explanation: ""
  };
};

export const runFullDiagnostic = (responses) => {
  // responses is an object: { 1: "text", 2: "text", ... }
  let totalWords = 0;
  let totalHesitations = 0;
  let totalConnectors = 0;
  let errorsDetected = [];
  
  const connectors = ["because", "and", "but", "so", "although", "when", "if", "that", "while"];
  const hesitationWords = ["uhm", "uh", "eh", "ah", "hmm", "hm", "like", "well"];

  Object.values(responses).forEach(text => {
    if (!text) return;
    const words = text.toLowerCase().split(/\s+/);
    totalWords += words.length;

    // Count hesitations
    words.forEach(w => {
      const cleanW = w.replace(/[^a-zA-Z]/g, "");
      if (hesitationWords.includes(cleanW)) {
        totalHesitations++;
      }
      if (connectors.includes(cleanW)) {
        totalConnectors++;
      }
    });

    // Check errors
    const evaluation = evaluateSentenceLocally(text);
    if (evaluation.hasError) {
      errorsDetected.push({
        error: evaluation.wrongText,
        correction: evaluation.correctText,
        explanation: evaluation.explanation
      });
    }
  });

  const totalQuestions = Object.keys(responses).length || 1;
  const avgWordsPerQuestion = totalWords / totalQuestions;

  // 1. Calculate Fluency Score (0 - 100)
  // Higher word count per question and use of connectors boosts this
  let fluencyScore = Math.min(100, Math.round((avgWordsPerQuestion * 4) + (totalConnectors * 8)));
  if (fluencyScore < 20) fluencyScore = 20;

  // 2. Calculate Confidence Score (0 - 100)
  // Penalized by excessive hesitations and extremely short sentences
  let confidenceScore = Math.min(100, Math.round(100 - (totalHesitations * 10) - (errorsDetected.length * 5)));
  if (totalWords < 15) confidenceScore = Math.max(10, confidenceScore - 30);
  if (confidenceScore < 15) confidenceScore = 15;

  // 3. Diagnose Mental Blocks
  let mentalBlocks = "";
  if (avgWordsPerQuestion < 6) {
    mentalBlocks = "Hata yapma korkusu nedeniyle çok kısa cevaplar verme eğilimindesin. Kelime kelime çevirmeye çalışmak konuşma hızını yavaşlatıyor.";
  } else if (totalHesitations / (totalWords || 1) > 0.15) {
    mentalBlocks = "Konuşurken zihninde sürekli Türkçe kelimeleri İngilizceye çevirmeye çalışıyorsun. Bu durum cümle aralarında 'uhm', 'like' gibi duraksamalara yol açıyor.";
  } else {
    mentalBlocks = "Temel cümle yapılarını kurabiliyorsun ancak daha karmaşık ve akıcı cümleler kurmak için zihnindeki Türkçe şablonlardan kurtulup hazır İngilizce kalıplara (chunks) odaklanmalısın.";
  }

  // 4. Generate recommendations
  let recommendations = "";
  if (fluencyScore < 50) {
    recommendations = "Günde 15 dakikalık rutindeki 'Shadowing' (Gölge Değişimi) egzersizine odaklan. Cümleleri kelime kelime değil, bir bütün melodi olarak taklit et. Ayrıca 'Pratik Gramer' bölümündeki formüllerle basit cümleler kurma pratiği yap.";
  } else if (confidenceScore < 60) {
    recommendations = "Hata yapmaktan korkma! Konuşma Simülasyonu modunda AI ile bol bol pratik yap. Akıllı Düzeltme seçeneğini 'Düşük' seviyeye getirerek sadece anlamı bozan hatalara odaklan, böylece konuşma ritmin bozulmaz.";
  } else {
    recommendations = "Doğal İfadeler ve Günlük Kalıplar modüllerine ağırlık ver. Cümlelerini zenginleştirmek için 'Hit the nail on the head' veya 'Call it a day' gibi deyimleri günlük konuşmalarına entegre et.";
  }

  return {
    fluencyScore,
    confidenceScore,
    mentalBlocks,
    recurringErrors: errorsDetected.length > 0 ? errorsDetected : [
      { error: "Yok", correction: "Harika!", explanation: "Temel gramer veya kalıp hatası tespit edilmedi." }
    ],
    recommendations
  };
};
