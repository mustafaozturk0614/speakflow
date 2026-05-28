export const diagnosticQuestions = [
  {
    id: 1,
    question: "Tell me about yourself. What do you do, and what are your hobbies?",
    focus: "Self-introduction, vocabulary breadth, basic grammar (Present Simple)."
  },
  {
    id: 2,
    question: "What did you do last weekend? Explain it in detail.",
    focus: "Talking about past events, past tense irregular verbs (Past Simple)."
  },
  {
    id: 3,
    question: "If you had a million dollars, what would you do with it?",
    focus: "Hypothetical situations, conditional structures (Second Conditional)."
  },
  {
    id: 4,
    question: "Why do you want to improve your English? What is your biggest challenge when speaking?",
    focus: "Expressing motivation, identifying self-assessed weaknesses, complex clauses."
  },
  {
    id: 5,
    question: "Imagine you are planning a holiday. Where are you going to go, and what will you do there?",
    focus: "Talking about future plans, intentions, predictions (will vs. going to)."
  }
];

export const grammarPatterns = [
  {
    id: "past",
    title: "1. Geçmiş Zaman (Past Events)",
    formula: "Subject + Verb-ED (veya 2. hal) + Object",
    simpleExplanation: "Geçmişte yapılıp bitmiş eylemleri anlatırken kullanırsın. Düzenli fiillere '-ed' takısı gelir (work -> worked), düzensiz fiillerin ise 2. halini kullanman gerekir (go -> went, see -> saw). Olumsuzlarda ve sorularda 'did' yardımıyla fiil yalın haline döner.",
    examples: [
      { en: "I went to the cinema yesterday.", tr: "Dün sinemaya gittim." },
      { en: "She worked late last night.", tr: "Dün gece geç saatlere kadar çalıştı." },
      { en: "We did not play football on Sunday.", tr: "Pazar günü futbol oynamadık." }
    ],
    sentenceBuilders: [
      {
        id: 1,
        target: "I went to the market yesterday",
        words: ["I", "went", "to", "the", "market", "yesterday"]
      },
      {
        id: 2,
        target: "She worked late last night",
        words: ["She", "worked", "late", "last", "night"]
      }
    ],
    questions: [
      {
        text: "'Dün akşam televizyon izledim' cümlesinin doğru çevirisi hangisidir?",
        options: [
          "I watch TV yesterday.",
          "I watched TV yesterday.",
          "I was watch TV yesterday."
        ],
        correctIndex: 1,
        explanation: "Geçmiş zaman olumlu cümlesinde düzenli fiil olan 'watch' sonuna '-ed' alarak 'watched' olur. 'was' yardımcı fiili bu yapıda kullanılmaz."
      },
      {
        text: "'She didn't ___ coffee this morning.' boşluğuna hangisi gelmelidir?",
        options: [
          "drank",
          "drink",
          "drinking"
        ],
        correctIndex: 1,
        explanation: "Olumsuz cümlelerde 'didn't' kullanıldığı için fiilin 2. hali (drank) yerine 1. hali (drink) kullanılır."
      },
      {
        text: "'Geçen yıl İngiltere'ye gittik' cümlesi için hangisi doğrudur?",
        options: [
          "We went to England last year.",
          "We did go to England last year.",
          "We was go to England last year."
        ],
        correctIndex: 0,
        explanation: "Gitmek (go) fiilinin geçmiş zaman (2. hal) biçimi düzensizdir ve 'went' olur. 'We went...' doğru kalıptır."
      }
    ]
  },
  {
    id: "present",
    title: "2. Şimdiki & Geniş Zaman (Routine & Now)",
    formula: "Subject + Verb(s) + Object  /  Subject + am/is/are + Verb-ING",
    simpleExplanation: "Alışkanlıkları ve genel doğruları anlatırken Geniş Zaman (Present Simple) kullanılır. He/She/It öznelerinde fiile '-s' takısı eklenir. Şu an yapılan işlerde ise Şimdiki Zaman (Present Continuous) kullanılır, fiile '-ing' eklenir.",
    examples: [
      { en: "I drink coffee every morning.", tr: "Her sabah kahve içerim. (Geniş Zaman)" },
      { en: "He plays tennis on Saturdays.", tr: "O Cumartesileri tenis oynar. (Geniş Zaman)" },
      { en: "I am learning English right now.", tr: "Şu an İngilizce öğreniyorum. (Şimdiki Zaman)" }
    ],
    sentenceBuilders: [
      {
        id: 1,
        target: "I drink coffee every morning",
        words: ["I", "drink", "coffee", "every", "morning"]
      },
      {
        id: 2,
        target: "We are learning English right now",
        words: ["We", "are", "learning", "English", "right", "now"]
      }
    ],
    questions: [
      {
        text: "'O (erkek) her gün kitap okur' cümlesinin doğru hali hangisidir?",
        options: [
          "He reads books every day.",
          "He read books every day.",
          "He is read books every day."
        ],
        correctIndex: 0,
        explanation: "Geniş zamanda 'He' öznesi için fiilin sonuna '-s' takısı getirilmelidir: 'reads'."
      },
      {
        text: "'Şu an müzik dinliyorum' ifadesi hangisinde doğru verilmiştir?",
        options: [
          "I am listen to music right now.",
          "I am listening to music right now.",
          "I listening to music right now."
        ],
        correctIndex: 1,
        explanation: "Şimdiki zamanda 'am/is/are' yardımcı fiilinin yanında esas fiile '-ing' takısı eklenir ve 'listen' fiili daima 'to' edatıyla kullanılır."
      },
      {
        text: "'Do you ___ here?' sorusunda boşluğa hangisi gelmelidir?",
        options: [
          "working",
          "work",
          "works"
        ],
        correctIndex: 1,
        explanation: "Geniş zaman sorularında 'do/does' kullanıldığı için fiil tamamen yalın halde (work) kalır."
      }
    ]
  },
  {
    id: "future",
    title: "3. Gelecek Zaman (Future Plans)",
    formula: "Subject + will + Verb (Tahmin)  /  Subject + am/is/are + going to + Verb (Kesin Plan)",
    simpleExplanation: "Gelecekle ilgili anlık kararlar veya tahminlerde 'will' kullanılır. Önceden planlanmış, kesinleşmiş eylemler veya güçlü belirtisi olan durumlar için ise 'be going to' yapısı tercih edilir.",
    examples: [
      { en: "I will call you later.", tr: "Seni sonra arayacağım. (Söz/Tahmin)" },
      { en: "I am going to travel to London next month.", tr: "Gelecek ay Londra'ya seyahat edeceğim. (Planlı)" },
      { en: "They are going to meet tomorrow.", tr: "Yarın buluşacaklar. (Planlı)" }
    ],
    sentenceBuilders: [
      {
        id: 1,
        target: "I will call you later",
        words: ["I", "will", "call", "you", "later"]
      },
      {
        id: 2,
        target: "They are going to meet tomorrow",
        words: ["They", "are", "going", "to", "meet", "tomorrow"]
      }
    ],
    questions: [
      {
        text: "'Yarın yağmur yağacak' (Tahmin/Hava durumu) ifadesi hangisidir?",
        options: [
          "It is raining tomorrow.",
          "It will rain tomorrow.",
          "It rain tomorrow."
        ],
        correctIndex: 1,
        explanation: "Tahminler ve hava durumu olasılıkları için 'will + fiil' yapısı kullanılır: 'It will rain'."
      },
      {
        text: "'Gelecek hafta yeni bir araba alacağım' (Planı yapılmış) cümlesi hangisidir?",
        options: [
          "I am going to buy a new car next week.",
          "I will buy a new car next week.",
          "I buy a new car next week."
        ],
        correctIndex: 0,
        explanation: "Önceden karar verilmiş ve planlanmış gelecek zaman eylemlerinde 'be going to' kullanılır."
      },
      {
        text: "'We are going to ___ a movie tonight.' boşluğuna hangisi gelmelidir?",
        options: [
          "watch",
          "watched",
          "watching"
        ],
        correctIndex: 0,
        explanation: "'be going to' yapısından sonra fiil her zaman 1. (yalın) halinde gelir: 'watch'."
      }
    ]
  },
  {
    id: "conditionals",
    title: "4. Koşul Cümleleri (If Clauses)",
    formula: "If + Subject + Verb-2 ..., Subject + would + Verb-1",
    simpleExplanation: "Şu an için gerçek dışı, hayali veya gerçekleşmesi düşük ihtimalli durumları anlatırken kullanılır (Second Conditional). Koşul kısmında fiilin 2. hali (geçmiş zaman) kullanılırken, sonuç kısmında 'would + fiil' kullanılır.",
    examples: [
      { en: "If I spoke English fluently, I would find a better job.", tr: "İngilizceyi akıcı konuşsaydım, daha iyi bir iş bulurdum." },
      { en: "If I had time, I would travel more.", tr: "Zamanım olsaydı daha çok seyahat ederdim." },
      { en: "If I were rich, I would buy a boat.", tr: "Zengin olsaydım bir tekne alırdım." }
    ],
    sentenceBuilders: [
      {
        id: 1,
        target: "If I had time I would travel more",
        words: ["If", "I", "had", "time", "I", "would", "travel", "more"]
      },
      {
        id: 2,
        target: "If she spoke English she would get the job",
        words: ["If", "she", "spoke", "English", "she", "would", "get", "the", "job"]
      }
    ],
    questions: [
      {
        text: "'Zengin olsaydım, büyük bir ev alırdım' ifadesi hangisinde doğrudur?",
        options: [
          "If I am rich, I would buy a big house.",
          "If I were rich, I would buy a big house.",
          "If I was rich, I will buy a big house."
        ],
        correctIndex: 1,
        explanation: "Hayali koşul cümlelerinde (Type 2), 'be' fiili tüm özneler için resmi dilde 'were' olarak kullanılır: 'If I were'."
      },
      {
        text: "'Daha çok çalışsaydı, sınavı geçerdi' cümlesi hangisidir?",
        options: [
          "If he studied more, he would pass the exam.",
          "If he studies more, he would pass the exam.",
          "If he study more, he will pass the exam."
        ],
        correctIndex: 0,
        explanation: "Koşul yan cümlesinde past tense (studied), ana cümlede ise 'would + fiil' (would pass) kullanılır."
      },
      {
        text: "'If it rained, we ___ stay at home.' cümlesinde boşluğa hangisi gelmelidir?",
        options: [
          "will",
          "would",
          "shall"
        ],
        correctIndex: 1,
        explanation: "Koşul cümlesi geçmiş zamanla (rained) kurulduğu için sonuç cümlesi 'would' ile tamamlanmalıdır."
      }
    ]
  },
  {
    id: "perfect",
    title: "5. Yakın Geçmiş Zaman (Present Perfect)",
    formula: "Subject + have/has + Verb-3 (fiilin 3. hali)",
    simpleExplanation: "Geçmişte yapılmış ama zamanı tam olarak belirtilmeyen eylemler, kişisel tecrübeler (hayatımda şunu yaptım/yapmadım) veya geçmişte başlayıp etkisi hala devam eden durumlar için kullanılır. He/She/It için 'has', diğer özneler için 'have' kullanılır.",
    examples: [
      { en: "I have visited London three times.", tr: "Londra'yı üç kez ziyaret ettim. (Tecrübe)" },
      { en: "She has lost her keys again.", tr: "Anahtarlarını yine kaybetti. (Etkisi sürüyor, anahtarlar yok)" },
      { en: "Have you ever eaten sushi?", tr: "Hiç suşi yedin mi? (Hayat boyu tecrübe sorusu)" }
    ],
    sentenceBuilders: [
      {
        id: 1,
        target: "I have visited London three times",
        words: ["I", "have", "visited", "London", "three", "times"]
      },
      {
        id: 2,
        target: "She has lost her keys again",
        words: ["She", "has", "lost", "her", "keys", "again"]
      }
    ],
    questions: [
      {
        text: "'Daha önce hiç suşi yedin mi?' sorusunun doğru çevirisi hangisidir?",
        options: [
          "Have you ever eaten sushi?",
          "Did you ever eaten sushi?",
          "Have you ever eat sushi?"
        ],
        correctIndex: 0,
        explanation: "Hayat boyu tecrübeleri sorarken 'Have you ever + Verb-3' kalıbı kullanılır. Eat fiilinin 3. hali 'eaten'dır."
      },
      {
        text: "'Filmi zaten izledim' cümlesi hangisinde doğru verilmiştir?",
        options: [
          "I already watched the movie.",
          "I have already watched the movie.",
          "I am watch the movie already."
        ],
        correctIndex: 1,
        explanation: "Zamanı belirtilmeyen ve bitmiş eylemlerde 'already' (zaten/çoktan) zarfı ile Present Perfect kullanımı en doğal olanıdır."
      },
      {
        text: "'He has ___ his homework.' boşluğuna hangisi gelmelidir?",
        options: [
          "finished",
          "finish",
          "finishing"
        ],
        correctIndex: 0,
        explanation: "Present Perfect yapısında 'have/has' sonrasında fiilin 3. hali kullanılır. Düzenli fiil olan 'finish' fiilinin 3. hali 'finished' olur."
      }
    ]
  }
];

export const conversationPatterns = [
  {
    pattern: "I was wondering if...",
    meaning: "...olup olmadığını merak ediyordum (Çok kibar rica/soru)",
    examples: [
      { en: "I was wondering if you could help me.", tr: "Bana yardım edip edemeyeceğinizi merak ediyordum." },
      { en: "I was wondering if you are free tonight.", tr: "Bu akşam boş olup olmadığınızı merak ediyordum." }
    ]
  },
  {
    pattern: "It's not worth...",
    meaning: "...maya değmez / lüzum yok",
    examples: [
      { en: "It's not worth worrying about.", tr: "Bunun hakkında endişelenmeye değmez." },
      { en: "It's not worth buying a new car.", tr: "Yeni bir araba almaya değmez." }
    ]
  },
  {
    pattern: "I'd like to...",
    meaning: "...istiyorum (Kibar 'I want to')",
    examples: [
      { en: "I'd like to order a coffee, please.", tr: "Bir kahve sipariş etmek istiyorum lütfen." },
      { en: "I'd like to ask a question.", tr: "Bir soru sormak istiyorum." }
    ]
  },
  {
    pattern: "I'm planning to...",
    meaning: "...mayı planlıyorum",
    examples: [
      { en: "I'm planning to move to another city.", tr: "Başka bir şehre taşınmayı planlıyorum." },
      { en: "I'm planning to start a new course.", tr: "Yeni bir kursa başlamayı planlıyorum." }
    ]
  },
  {
    pattern: "How about...?",
    meaning: "...ya ne dersin? (Öneri)",
    examples: [
      { en: "How about having dinner together?", tr: "Birlikte akşam yemeği yemeye ne dersin?" },
      { en: "How about meeting tomorrow?", tr: "Yarın buluşmaya ne dersin?" }
    ]
  }
];

export const naturalExpressions = [
  {
    phrase: "Hit the nail on the head",
    meaning: "Tam üstüne basmak / Hedefi tam on ikiden vurmak",
    whenToUse: "Biri bir problemi veya durumu tam olarak doğru teşhis ettiğinde ya da çok doğru bir şey söylediğinde kullanılır.",
    context: "İş toplantılarında, tartışmalarda veya bir arkadaşınızın analizine katılırken.",
    variation: "Ezberlemek yerine: 'You are exactly right' veya 'Spot on' ifadelerini de aynı anlamda kullanabilirsin. Bunu 'He hit the nail on the head with his suggestion' gibi farklı öznelerle çekimleyebilirsin."
  },
  {
    phrase: "Under the weather",
    meaning: "Keyifsiz / Hafif hasta / Halsiz",
    whenToUse: "Çok ağır yatalak hasta değil de, nezle başlangıcı, yorgunluk veya can sıkıntısı gibi hafif halsizlik durumlarında kullanılır.",
    context: "İşe gidilemediğinde veya bir buluşma iptal edildiğinde kibar bir gerekçe olarak.",
    variation: "Ezberlemek yerine: 'I am not feeling well today' yerine kullanılır. Farklılaştırmak için: 'I am feeling a bit under the weather today' (Bugün kendimi biraz keyifsiz hissediyorum)."
  },
  {
    phrase: "Call it a day",
    meaning: "Paydos etmek / Bugünlük bu kadar demek",
    whenToUse: "Bir işi, çalışmayı veya toplantıyı o gün için sonlandırmaya karar verildiğinde kullanılır.",
    context: "İş yerinde mesai bitimine yakın ya da ders çalışırken yorulduğunuzda.",
    variation: "Ezberlemek yerine: 'Let's finish for today' anlamına gelir. Şöyle çeşitlendirebilirsin: 'We are all tired, let's call it a day.' (Hepimiz yorulduk, bugünlük bu kadar diyelim)."
  },
  {
    phrase: "Break a leg",
    meaning: "Şansın açık olsun / Şeytanın bacağını kır",
    whenToUse: "Birisi sahneye çıkmadan, sınava girmeden ya da önemli bir sunum yapmadan önce şans dilemek için kullanılır.",
    context: "Tiyatrocular arasında başlamış olsa da günümüzde her türlü önemli performans öncesi kullanılır.",
    variation: "Ezberlemek yerine: 'Good luck!' demenin daha havalı halidir. 'Go out there and break a leg!' (Git oraya ve göster kendini!) şeklinde heveslendirmek için kullanabilirsin."
  },
  {
    phrase: "Off the top of my head",
    meaning: "Ezbere / Düşünmeden / Hemen aklıma gelen",
    whenToUse: "Bir konuda kesin bilgi sahibi olmadan, sadece ilk anda aklınıza gelen tahmini söylerken kullanılır.",
    context: "Rakamlar veya detaylar sorulduğunda ve emin olmadığınızda.",
    variation: "Ezberlemek yerine: 'Without thinking too much' veya 'As far as I can guess' yerine geçer. Cümlede kullanımı: 'Off the top of my head, I think the project costs $5000.' (Ezbere söyleyecek olursam, bence proje 5000 dolar tutar)."
  }
];

export const simulationScenarios = [
  {
    id: "cafe",
    title: "☕ Cafe & Restaurant",
    description: "Bir kafede sipariş verme, hesap isteme veya yanlış siparişi bildirme simülasyonu.",
    character: "Sarah (Barista)",
    intro: "Welcome to Brew & Blend Cafe! What can I get started for you today?",
    steps: [
      {
        botQuestion: "Welcome to Brew & Blend Cafe! What can I get started for you today?",
        expectedFocus: "Ordering a drink, specifying size or milk option.",
        hints: ["I'd like to get a medium latte, please.", "Can I have a black coffee?"],
        corrections: {
          "i want coffee": "I'd like to order a coffee, please. (Daha kibar ve doğal)",
          "give me coffee": "Could I get a coffee, please? (Emir kipi yerine soru kalıbı daha doğal durur)"
        }
      },
      {
        botQuestion: "Sure! Would you like any pastries or snacks to go with that?",
        expectedFocus: "Accepting or declining food items politely.",
        hints: ["No, thanks. Just the coffee.", "Yes, I'll have a chocolate muffin, please."],
        corrections: {
          "no": "No, thank you. / No, I'm good, thanks. (Tek başına 'no' kaba durabilir)"
        }
      },
      {
        botQuestion: "Great choice. Will that be for here or to go?",
        expectedFocus: "Specifying dining in or takeaway.",
        hints: ["For here, please.", "To go, thanks."],
        corrections: {
          "go": "To go, please. ('Go' yerine 'To go' kalıbı kullanılır)"
        }
      },
      {
        botQuestion: "Awesome, that will be $6.50. How would you like to pay?",
        expectedFocus: "Stating payment method (card or cash).",
        hints: ["I'll pay by card.", "Can I pay with cash?", "Here is my credit card."],
        corrections: {
          "with card": "By card, please. / I'll pay by card. ('with card' yerine 'by card' tercih edilir)"
        }
      }
    ]
  },
  {
    id: "interview",
    title: "💼 Job Interview",
    description: "İngilizce iş mülakatı simülasyonu. Kendini tanıtma, güçlü yönler ve kariyer hedefleri.",
    character: "Mr. Davis (HR Manager)",
    intro: "Hello, thank you for coming in today. To start, could you please tell me a bit about yourself?",
    steps: [
      {
        botQuestion: "Hello, thank you for coming in today. To start, could you please tell me a bit about yourself?",
        expectedFocus: "Introducing profession, experience, and background.",
        hints: ["I'm a software developer with 3 years of experience...", "I have been working as a marketer for..."],
        corrections: {
          "i am work developer": "I work as a developer. / I am a developer. (Meslek söylerken 'work as' veya direkt 'am' kullanılır)"
        }
      },
      {
        botQuestion: "Excellent. Why do you want to work for our company specifically?",
        expectedFocus: "Explaining motivation, mentioning company values or products.",
        hints: ["I've been following your products and I really like your vision...", "Your company is a market leader in..."],
        corrections: {
          "you are very good company": "I admire your company's achievements. / You have a great reputation. (Daha profesyonel ifadeler)"
        }
      },
      {
        botQuestion: "What do you consider to be your greatest professional strength?",
        expectedFocus: "Stating skills like problem-solving, communication, or teamwork with a short example.",
        hints: ["I believe my greatest strength is my problem-solving ability...", "I am very good at communication and..."],
        corrections: {
          "i am very good work": "I have strong work ethics. / I work very efficiently. (Daha kurumsal ifadeler)"
        }
      },
      {
        botQuestion: "Thank you. Do you have any questions for me about the role or the company?",
        expectedFocus: "Asking a professional question to show interest.",
        hints: ["What does a typical day look like in this role?", "What are the growth opportunities here?"],
        corrections: {
          "no question": "No, I think you covered everything. Thank you. (Kaba 'no' yerine şık kapatış)"
        }
      }
    ]
  },
  {
    id: "hotel",
    title: "🏨 Hotel Check-in",
    description: "Otele giriş yapma, oda tipini netleştirme ve oda ile ilgili bir problemi çözme.",
    character: "Alex (Receptionist)",
    intro: "Hello! Welcome to the Grand Plaza Hotel. Do you have a reservation with us?",
    steps: [
      {
        botQuestion: "Hello! Welcome to the Grand Plaza Hotel. Do you have a reservation with us?",
        expectedFocus: "Confirming reservation and giving name.",
        hints: ["Yes, under the name John Smith.", "Yes, I booked a room online."],
        corrections: {
          "yes name is smith": "Yes, I have a reservation under the name Smith. (Daha akıcı)"
        }
      },
      {
        botQuestion: "Perfect, I found it. A double room for three nights. May I please see your ID or passport?",
        expectedFocus: "Handing over ID politely.",
        hints: ["Sure, here it is.", "Here is my passport."],
        corrections: {
          "take this": "Here you go. / Here is my passport. (Bir eşya verirken 'take this' yerine 'here you go' veya 'here it is' denir)"
        }
      },
      {
        botQuestion: "Here is your keycard, room 405. Breakfast is served from 7 to 10 AM. Is there anything else you need?",
        expectedFocus: "Asking about Wi-Fi or elevator location.",
        hints: ["What is the Wi-Fi password?", "Where is the elevator?", "Could you help with the bags?"],
        corrections: {
          "wifi password what": "Could you tell me the Wi-Fi password? / What is the Wi-Fi password? (Düzgün soru sırası)"
        }
      }
    ]
  }
];

export const dailyRoutineSteps = [
  {
    id: "shadowing",
    title: "1. Gölge Değişimi (Shadowing) - 5 Dakika",
    description: "Aşağıdaki doğal cümleyi dinle (Hoparlör ikonuna bas), ardından sesini kaydederek birebir tekrar etmeye çalış. Akıcılık ve telaffuzunu geliştirir.",
    phrases: [
      "Honestly, I am a bit under the weather today, so I think I'll call it a day.",
      "Off the top of my head, I can't give you a number, but I'll check and email you.",
      "I was wondering if you could spare a few minutes to help me with this project."
    ]
  },
  {
    id: "recall",
    title: "2. Aktif Hatırlama (Active Recall) - 5 Dakika",
    description: "Türkçesi verilen ifadeyi, aşağıdaki kelimeleri doğru sıraya koyarak oluştur. Zihinden çeviri hızını artırır.",
    challenges: [
      {
        tr: "Dün sinemaya gittiğimi söylemiştim.",
        en: "I told you I went to the cinema yesterday",
        words: ["I", "told", "you", "I", "went", "to", "the", "cinema", "yesterday"],
        userSelected: []
      },
      {
        tr: "Bana yardım edip edemeyeceğini merak ediyordum.",
        en: "I was wondering if you could help me",
        words: ["I", "was", "wondering", "if", "you", "could", "help", "me"],
        userSelected: []
      }
    ]
  },
  {
    id: "chat",
    title: "3. Hızlı AI Sohbeti (Simulation) - 5 Dakika",
    description: "Kısa ve odaklanmış bir konuşma yap. AI'a sadece 3 cümle söyle ve geri bildirim al.",
    prompts: [
      "Talk to the AI about what you ate for breakfast today.",
      "Tell the AI about one thing you want to buy in the future.",
      "Describe the weather outside right now to the AI."
    ]
  }
];

// ================= PRESENTATION SLIDES & SPEAKER SCRIPT DATA =================
export const presentationSlides = [
  {
    id: 1,
    titleTr: "SLAYT 01 · Kapak — HTTPS Geçişi",
    titleEn: "SLIDE 01 · Cover — HTTPS Migration",
    scriptTr: "Merhaba arkadaşlar. Bugün sizlere şirketimiz açısından önem taşıyan teknik bir gündemi, mümkün olduğunca anlaşılır bir dille aktarmaya çalışacağım. Konumuz, kullanıcı tanıma akışımızın HTTPS geçişiyle birlikte nasıl etkileneceği. Bazı ürünlerimizde kullanıcının telefon numarasını otomatik tanıyarak onu doğrudan akışa alıyoruz. HTTP üzerinde rahatlıkla çalışan bu yapı, HTTPS'e geçişle birlikte yeniden tasarlanmak durumunda. Birlikte, bu değişimin sebebine ve önümüzdeki çözüm yollarına bakacağız.",
    scriptEn: "Good morning everyone. Today I'd like to walk you through a technical topic that has direct implications for our business — and I'll do my best to keep the explanation accessible. Our subject is how our user recognition flow will be affected by the upcoming HTTPS migration. In some of our products, we recognize users automatically by reading their phone number from the network. This works smoothly today over HTTP, but with the migration to HTTPS this mechanism needs to be redesigned. We'll look together at why this change is necessary and what solutions are on the table.",
    vocabulary: [
      { word: "migration", tr: "göç / geçiş" },
      { word: "implications", tr: "etkiler / sonuçlar" },
      { word: "recognition flow", tr: "tanıma akışı" },
      { word: "redesigned", tr: "yeniden tasarlanmış" },
      { word: "CP (Content Provider)", tr: "İçerik Sağlayıcı. Mobil servis/portal kurup içerik barındıran taraf." },
      { word: "Aggregator (Entegratör)", tr: "Operatörler ile CP'ler arasında mobil ödeme teknik altyapısını sağlayan aracı şirket." }
    ],
    sentenceBuilder: {
      target: "Our subject is how our user recognition flow will be affected by the upcoming HTTPS migration",
      words: ["Our", "subject", "is", "how", "our", "user", "recognition", "flow", "will", "be", "affected", "by", "the", "upcoming", "HTTPS", "migration"]
    }
  },
  {
    id: 2,
    titleTr: "SLAYT 02 · Gündem",
    titleEn: "SLIDE 02 · Agenda",
    scriptTr: "Sunum boyunca altı temel başlığı ele alacağız. Önce header enrichment dediğimiz yapının ne olduğunu anlatacağım. Ardından bu yapının HTTP üzerinde nasıl işlediğini göstereceğim. Üçüncü başlıkta, ekim ayında devreye girecek Chrome güncellemesinin neden bizim için bir dönüm noktası olduğunu konuşacağız. Sonrasında HTTPS'e geçtiğimizde tam olarak neyin değiştiğini ve bu değişikliğin uygulamamızı nasıl etkilediğini paylaşacağım. Son bölümde Türk Telekom'un önerdiği Extension 1000 çözümünü ve yanında planlamamız gereken yedek senaryoları ele alacağız.",
    scriptEn: "Throughout this session we'll cover six core topics. First, I'll explain what header enrichment is. Then I'll show how it works over HTTP today. Third, we'll discuss why the Chrome update arriving in October is a turning point for us. After that we'll look at exactly what changes when we move to HTTPS and how this impacts our application. In the final section we'll discuss Turkcell-style operator solution — Extension 1000 — and the alternative approaches we should evaluate alongside it.",
    vocabulary: [
      { word: "turning point", tr: "dönüm noktası" },
      { word: "header enrichment", tr: "başlık zenginleştirme (operatörün numara enjekte etmesi)" },
      { word: "evaluate", tr: "değerlendirmek" },
      { word: "alternative approaches", tr: "alternatif yaklaşımlar" }
    ],
    sentenceBuilder: {
      target: "Throughout this session we will cover six core topics",
      words: ["Throughout", "this", "session", "we", "will", "cover", "six", "core", "topics"]
    }
  },
  {
    id: 3,
    titleTr: "SLAYT 03 · Header Enrichment Nedir?",
    titleEn: "SLIDE 03 · What is Header Enrichment?",
    scriptTr: "Header enrichment'ı şöyle ifade edebiliriz: Kullanıcı sitemize geldiğinde, operatör onun telefon numarasını isteğin üzerine küçük bir not olarak ekler. Backend sitemimiz bu notu okur ve kullanıcıyı doğrudan tanır. Bu sayede kullanıcı, telefon numarasını girmek ya da OTP doğrulamasından geçmek zorunda kalmaz. Akış kısalır, kullanıcı deneyimi pürüzsüz hâle gelir; dönüşüm oranlarımız da bu sayede yüksek seviyede kalır. Anahtar kavramımız burada MSISDN — yani kullanıcının telefon numarasıdır.",
    scriptEn: "Let me describe header enrichment in simple terms. When a user reaches our site, the operator adds the phone number to the request as a small note in the header. Our backend reads this note and recognizes the user automatically. As a result, the user doesn't have to enter their phone number or go through an OTP verification. The flow becomes shorter and the experience becomes frictionless, which directly supports our high conversion rates. The key concept here is MSISDN — in other words, the user's phone number.",
    vocabulary: [
      { word: "frictionless", tr: "sürtünmesiz / pürüzsüz" },
      { word: "conversion rates", tr: "dönüşüm oranları" },
      { word: "automatically", tr: "otomatik olarak" },
      { word: "verification", tr: "doğrulama" },
      { word: "Landing Page (LP)", tr: "Açılış Sayfası. Reklam tıklandığında açılan, operatör ödeme onay butonu içeren sayfa." },
      { word: "CR (Conversion Rate)", tr: "Dönüşüm Oranı. Ziyaretçilerin aboneye dönüşme yüzdesi." }
    ],
    sentenceBuilder: {
      target: "The flow becomes shorter and the experience becomes frictionless",
      words: ["The", "flow", "becomes", "shorter", "and", "the", "experience", "becomes", "frictionless"]
    }
  },
  {
    id: 4,
    titleTr: "SLAYT 04 · HTTP Üzerinde Akış Nasıl İşliyordu?",
    titleEn: "SLIDE 04 · How Did the Flow Work Over HTTP?",
    scriptTr: "HTTP üzerinde bu akış oldukça yalın bir biçimde işliyordu. Trafik şifreli olmadığı için operatör, isteğin içeriğine erişebiliyor ve telefon numarasını isteğe başlık olarak ekleyebiliyordu. Backend bu başlığı okuyarak kullanıcıyı anında tanıya biliyordu. Bu yapı bizim için son derece değerliydi; çünkü kullanıcıdan herhangi bir ek adım talep etmeden iç akışa geçmek mümkündü. Reklamı tıklayan kullanıcı, doğrudan abonelik veya işlem akışına dâhil edilebiliyordu.",
    scriptEn: "Over HTTP, this flow used to operate in a very straightforward way. Because the traffic was unencrypted, the operator could see inside the request and add the phone number as a header. The backend read this header and recognized the user instantly. This setup was extremely valuable to us, since it allowed us to move the user into the flow without requiring any additional step. A user clicking on an advertisement could be taken directly into the subscription or transaction journey.",
    vocabulary: [
      { word: "unencrypted", tr: "şifrelenmemiş" },
      { word: "straightforward", tr: "yalın / basit" },
      { word: "subscription journey", tr: "abonelik yolculuğu" },
      { word: "instantly", tr: "anında" },
      { word: "Revenue Share", tr: "Gelir Paylaşımı. Operatör ile içerik sağlayıcının kazancı paylaşma oranı." },
      { word: "Renewal", tr: "Yenileme. Abonelik dönemi sonunda servis ücretinin faturadan tekrar otomatik çekilmesi." }
    ],
    sentenceBuilder: {
      target: "Because the traffic was unencrypted the operator could see inside the request",
      words: ["Because", "the", "traffic", "was", "unencrypted", "the", "operator", "could", "see", "inside", "the", "request"]
    }
  },
  {
    id: 5,
    titleTr: "SLAYT 05 · Google Chrome Güncellemesi / HTTPS Zorunluluğu",
    titleEn: "SLIDE 05 · Google Chrome Update / HTTPS Push",
    scriptTr: "Şimdi gelin, bu konuyu neden bu kadar öncelikli gündemimize aldığımızı konuşalım. Web ekosistemi uzun zamandır HTTPS'e doğru yönelmiş durumda; ancak önümüzde belirleyici bir tarih var: Ekim 2026. Bu tarihte yayımlanacak Chrome güncellemesiyle birlikte, HTTP üzerinden çalışan sitelerde kullanıcıya gösterilen güvenlik uyarıları çok daha görünür hâle gelecek. Pek çok kullanıcı bu uyarıyla karşılaştığında doğrudan geri dönüyor; landing sayfamız hiç açılmadan kullanıcıyı kaybedebiliyoruz. Reklam bütçesini harcadığımız hâlde dönüşüm gerçekleşmiyor. Bu nedenle HTTPS'e geçiş, bizim için artık bir tercih değil; takvime bağlanmış bir zorunluluk hâline gelmiştir.",
    scriptEn: "Now let's talk about why this topic has become such a high priority. The web ecosystem has been steadily moving toward HTTPS for years, but there is a decisive date ahead of us: October 2026. With the Chrome release on that date, the security warnings shown for HTTP sites will become significantly more visible. Many users abandon the page when they see such a warning; we lose the user before our landing page even loads. Despite spending the advertising budget, no conversion takes place. For this reason, HTTPS migration is no longer optional for us — it has become a hard deadline.",
    vocabulary: [
      { word: "decisive date", tr: "belirleyici tarih" },
      { word: "security warnings", test: "güvenlik uyarıları" },
      { word: "abandon the page", tr: "sayfayı terk etmek" },
      { word: "hard deadline", tr: "kesin / katı son tarih" }
    ],
    sentenceBuilder: {
      target: "HTTPS migration is no longer optional for us it has become a hard deadline",
      words: ["HTTPS", "migration", "is", "no", "longer", "optional", "for", "us", "it", "has", "become", "a", "hard", "deadline"]
    }
  },
  {
    id: 6,
    titleTr: "SLAYT 06 · HTTPS'e Geçtiğimizde Ne Değişir?",
    titleEn: "SLIDE 06 · What Changes When We Move to HTTPS?",
    scriptTr: "HTTPS'e geçişle birlikte trafiğimiz şifreli bir tünelin içinden geçmeye başlar. Bu, güvenlik açısından son derece önemli ve gerekli bir adımdır; ancak bizim için bir yan etki oluşturur. Operatör, artık isteğin içeriğine erişemediği için telefon numarasını isteğe başlık olarak ekleyemez. Yani HTTPS'e geçer geçmez, operatörden otomatik olarak gelen MSISDN bilgisi kesilir. Bu, mevcut akışımızın aynı şekilde sürdürülememesi anlamına gelir.",
    scriptEn: "With the HTTPS migration, our traffic begins flowing through an encrypted tunnel. This is essential for security and user trust, but it has a side effect for our flow. Because the operator can no longer see inside the request, it cannot add the phone number as a header. In other words, as soon as we move to HTTPS, the MSISDN information that used to arrive automatically from the operator is cut off. Our current flow can no longer continue in the same form.",
    vocabulary: [
      { word: "encrypted tunnel", tr: "şifreli tünel" },
      { word: "side effect", tr: "yan etki" },
      { word: "cut off", tr: "kesilmek / durdurulmak" },
      { word: "user trust", tr: "kullanıcı güveni" },
      { word: "Billing Attempts", tr: "Ücretlendirme Denemeleri. Yetersiz bakiyeli hattı bakiye yüklendiğinde otomatik çekme denemesi." },
      { word: "Grace Period", tr: "Tolerans Süresi. Bakiye yetersizliğinde üyeliğin askıda tutulup çekilmeye çalışıldığı süre." }
    ],
    sentenceBuilder: {
      target: "Our traffic begins flowing through an encrypted tunnel",
      words: ["Our", "traffic", "begins", "flowing", "through", "an", "encrypted", "tunnel"]
    }
  },
  {
    id: 7,
    titleTr: "SLAYT 07 · Uygulamamıza Etkisi",
    titleEn: "SLIDE 07 · How It Affects Our Application",
    scriptTr: "Bu durumun somut sonuçları şu şekilde ortaya çıkar: MSISDN bilgisi backend'e ulaşmadığında, sistem kullanıcıyı otomatik olarak tanıyamaz. Bu noktada kullanıcıdan ya telefon numarasını manuel olarak girmesi ya da OTP doğrulaması yapması istenir. Her bir ek adım, dönüşüm oranımızda kayda değer bir düşüş anlamına gelir. Kullanıcı reklamı görür, tıklar, sayfaya ulaşır; ancak abonelik akışına geçmek yerine önce numara girer, ardından SMS bekler, sonra OTP'yi yazar. Bu zincirin her halkasında belirli bir oranda kullanıcı kaybı yaşanır. Dolayısıyla bu mesele, yalnızca teknik bir başlık değil; doğrudan iş sonuçlarımıza yansıyan bir konudur.",
    scriptEn: "The concrete consequences are as follows: when MSISDN does not reach the backend, the system cannot recognize the user automatically. At that point, the user is asked to enter their phone number manually or complete an OTP verification. Each additional step translates into a measurable drop in conversion. The user sees the ad, clicks, reaches the landing page; but rather than moving into the subscription flow, they first enter a phone number, then wait for an SMS, then type the OTP. At each step in this chain we lose a portion of users. So this is not merely a technical header problem — it directly affects our business outcomes.",
    vocabulary: [
      { word: "consequences", tr: "sonuçlar" },
      { word: "measurable drop", tr: "ölçülebilir düşüş" },
      { word: "additional step", tr: "ekstra adım" },
      { word: "business outcomes", tr: "iş sonuçları / çıktıları" },
      { word: "Churn Rate", tr: "Abone Kayıp Oranı. Servisi iptal edenlerin aktif aboneye oranı." },
      { word: "Lifetime Value (LTV)", tr: "Abone Ömür Boyu Değeri. Bir abonenin sistemde kaldığı süre boyunca kazandırdığı toplam net gelir." }
    ],
    sentenceBuilder: {
      target: "Each additional step translates into a measurable drop in conversion",
      words: ["Each", "additional", "step", "translates", "into", "a", "measurable", "drop", "in", "conversion"]
    }
  },
  {
    id: 8,
    titleTr: "SLAYT 08 · İki Yönlü Risk, Tek Bir Karar",
    titleEn: "SLIDE 08 · Two-Sided Risk, One Decision",
    scriptTr: "Bu noktada iki yönlü bir riskle karşı karşıyayız. Bir tarafta HTTP'de kalmaya devam edersek, Chrome uyarısı nedeniyle kullanıcıyı landing sayfasına ulaşmadan kaybediyoruz. Diğer tarafta plansız bir HTTPS geçişi yaparsak, otomatik tanıma akışımız bozulduğu için dönüşüm oranımız düşüyor. Yani 'hiçbir şey yapmamak' bir seçenek değildir; ancak 'aceleyle HTTPS'e geçmek' de yeterli bir çözüm değildir. Hedefimiz çok nettir: HTTPS'e güvenli biçimde geçmek ve bu geçişi yaparken mevcut kullanıcı tanıma akışımızı mümkün olduğunca korumaktır.",
    scriptEn: "At this stage we are facing a two-sided risk. On one side, if we stay on HTTP, we lose users before they ever see our landing page, due to the Chrome warning. On the other side, if we move to HTTPS without a plan, our automatic recognition flow breaks and conversion drops. Doing nothing is not an option; rushing into HTTPS without preparation is not a solution either. Our objective is clear: to migrate to HTTPS safely while preserving our user recognition flow as much as possible.",
    vocabulary: [
      { word: "two-sided risk", tr: "iki yönlü risk" },
      { word: "doing nothing", tr: "hiçbir şey yapmamak" },
      { word: "rushing into", tr: "aceleye getirmek / aceleyle girişmek" },
      { word: "preserving", tr: "korumak / muhafaza etmek" }
    ],
    sentenceBuilder: {
      target: "Doing nothing is not an option rushing into HTTPS is not a solution",
      words: ["Doing", "nothing", "is", "not", "an", "option", "rushing", "into", "HTTPS", "is", "not", "a", "solution"]
    }
  },
  {
    id: 9,
    titleTr: "SLAYT 09 · Hedefimizi Üç Sütunla Tanımlıyoruz",
    titleEn: "SLIDE 09 · Our Goal in Three Pillars",
    scriptTr: "Hedefimizi üç başlık altında özetleyebiliriz. Birincisi, güvenli bağlantı: Kullanıcı sayfamıza geldiğinde yeşil kilit simgesini görmeli, tarayıcı herhangi bir uyarı vermemelidir. İkincisi, otomatik tanıma: MSISDN bilgisinin kesilmesinin önüne geçerek backend'in kullanıcıyı tanımaya devam etmesini sağlamalıyız. Üçüncüsü, sürtünmesiz deneyim: Manuel form, ek OTP veya gereksiz adımlar olmamalıdır. Bu üç başlığı bir arada karşılayamadığımız sürece, ya güveni, ya dönüşümü ya da kullanıcı deneyimini kaybetme riskiyle karşı karşıya kalırız.",
    scriptEn: "We can summarize our objective under three headings. First, a secure connection: users should see the green padlock and the browser should not display any warning. Second, automatic recognition: we must preserve the MSISDN flow so the backend can continue to recognize the user. Third, a frictionless experience: there should be no manual forms, additional OTPs, or unnecessary steps. Unless all three are satisfied together, we risk losing either trust, conversion, or user experience.",
    vocabulary: [
      { word: "padlock", tr: "asma kilit (tarayıcıdaki kilit simgesi)" },
      { word: "under three headings", tr: "üç başlık altında" },
      { word: "risk losing", tr: "kaybetme riski taşımak" },
      { word: "MT SMS", tr: "Mobile Terminated. Sunucudan kullanıcı telefonuna atılan SMS." },
      { word: "MO SMS", tr: "Mobile Originated. Kullanıcının faturasından düşerek kısa numaraya yolladığı SMS." }
    ],
    sentenceBuilder: {
      target: "We must preserve the MSISDN flow so the backend can recognize the user",
      words: ["We", "must", "preserve", "the", "MSISDN", "flow", "so", "the", "backend", "can", "recognize", "the", "user"]
    }
  },
  {
    id: 10,
    titleTr: "SLAYT 10 · Çözüm: MSISDN'i Farklı Bir Yerde Taşımak (Extension 1000)",
    titleEn: "SLIDE 10 · Solution: Carrying the MSISDN Elsewhere (Extension 1000)",
    scriptTr: "Tam bu noktada Türk Telekom'un önerdiği Extension 1000 yaklaşımı devreye giriyor. Yaklaşımın mantığı oldukça basittir: Telefon numarasını artık HTTP isteğinin içine eklemek mümkün değildir; çünkü trafik baştan sona şifrelidir. Buna karşılık, bağlantı kurulurken — yani şifreli tünel henüz kapanmadan, taraflar el sıkışırken — özel bir alanda bu bilgiyi taşımak mümkündür. İşte bu özel alana Extension 1000 adı verilir. Yani operatör artık MSISDN bilgisini isteğin içine değil, el sıkışmanın içine yerleştirir.",
    scriptEn: "This is where the operator-provided solution — Extension 1000 — comes into play. The idea is straightforward: we can no longer place the phone number inside the HTTP request, because the traffic is encrypted end to end. However, before the encrypted tunnel is established — while the two sides are still performing the TLS handshake — the information can be carried inside a dedicated field. This field is called Extension 1000. In other words, the operator no longer places MSISDN inside the request, but inside the handshake.",
    vocabulary: [
      { word: "TLS handshake", tr: "TLS el sıkışması (bağlantı başlangıcı)" },
      { word: "dedicated field", tr: "özel / tahsis edilmiş alan" },
      { word: "end to end", tr: "uçtan uca" },
      { word: "Header Enrichment", tr: "Operatörün şebeke seviyesinde MSISDN'i istek başlığına yerleştirme teknolojisi." }
    ],
    sentenceBuilder: {
      target: "The operator no longer places MSISDN inside the request but inside the handshake",
      words: ["The", "operator", "no", "longer", "places", "MSISDN", "inside", "the", "request", "but", "inside", "the", "handshake"]
    }
  },
  {
    id: 11,
    titleTr: "SLAYT 11 · Bizim Çözümümüz: Proxy Katmanı",
    titleEn: "SLIDE 11 · Our Solution: A Proxy Layer",
    scriptTr: "Bizim tarafımızda ise bu bilgiyi kullanılabilir hâle getirmek için bir proxy katmanı devreye girer. Proxy, gelen bağlantıdaki Extension 1000 alanını okur; içinden telefon numarasını ayıklar ve backend'in zaten anladığı standart başlık formatına çevirir. Bu sayede backend tarafında herhangi bir değişiklik yapmamıza neredeyse gerek kalmaz; çünkü backend, eskiden olduğu gibi MSISDN başlığını okuyup işine devam eder. Tüm dönüştürme işi proxy katmanında gerçekleşir. Bu yaklaşım sayesinde backend'e dokunmadan, mevcut akışımızı koruyabiliriz.",
    scriptEn: "On our side, a proxy layer makes this information usable. The proxy reads the Extension 1000 field from the incoming connection, extracts the phone number, and converts it into the standard header format the backend already understands. As a result, almost no change is required on the backend side; it continues to read the MSISDN header exactly as before. All translation work happens at the proxy layer. With this approach, we preserve our existing flow without touching the backend.",
    vocabulary: [
      { word: "proxy layer", tr: "vekil sunucu katmanı" },
      { word: "extracts", tr: "söker / ayıklar" },
      { word: "header format", tr: "başlık formatı" }
    ],
    sentenceBuilder: {
      target: "The proxy extracts the phone number and converts it into the standard header format",
      words: ["The", "proxy", "extracts", "the", "phone", "number", "and", "converts", "it", "into", "the", "standard", "header", "format"]
    }
  },
  {
    id: 12,
    titleTr: "SLAYT 12 · Extension 1000'in Sınırları",
    titleEn: "SLIDE 12 · The Limits of Extension 1000",
    scriptTr: "Bu noktada açık olmamız gereken bir konu var. Extension 1000 güçlü bir çözüm adayıdır; ancak her senaryoda yüzde yüz garanti sunan bir yöntem değildir. Farklı tarayıcıların ve cihazların davranışları birebir aynı olmayabilir. Özellikle modern güvenlik standartları — TLS 1.3 gibi — devreye girdiğinde, bazı kombinasyonlarda Extension 1000 düşebilir. Bu nedenle 'Extension 1000 var, mesele kapanmıştır' demek doğru bir yaklaşım olmaz. Bilgi geldi mi gelmedi mi, gelmediği durumda ne yapacağız sorusunun yanıtı mutlaka önceden hazır olmalıdır.",
    scriptEn: "There is one point we should be transparent about. Extension 1000 is a strong candidate, but it does not provide a one-hundred-percent guarantee in every scenario. Different browsers and devices may not behave identically. In particular, with modern security standards such as TLS 1.3, Extension 1000 may not be available in some combinations. Therefore, saying 'Extension 1000 is in place, problem solved' would not be accurate. We must always have an answer ready for the situations in which the information does not arrive.",
    vocabulary: [
      { word: "transparent", tr: "şeffaf / açık" },
      { word: "guarantee", tr: "garanti" },
      { word: "security standards", tr: "güvenlik standartları" }
    ],
    sentenceBuilder: {
      target: "Different browsers and devices may not behave identically",
      words: ["Different", "browsers", "and", "devices", "may", "not", "behave", "identically"]
    }
  },
  {
    id: 13,
    titleTr: "SLAYT 13 · Alternatif Çözüm Yolları",
    titleEn: "SLIDE 13 · Alternative Solution Paths",
    scriptTr: "Extension 1000 elimizdeki tek yöntem değildir. MSISDN tabanlı kullanıcı tanımayı sürdürmek için, birbirinden bağımsız olarak değerlendirebileceğimiz dört alternatif çözüm yolu daha bulunmaktadır... İlk alternatif Operatör API entegrasyonudur... İkinci alternatif kullanıcıdan OTP doğrulamasıdır... Üçüncü alternatif click-id ya da session-id tabanlı takiptir... Dördüncü alternatif ise trusted proxy yaklaşımıdır.",
    scriptEn: "Extension 1000 is not the only option we have. To sustain MSISDN-based user recognition, we have four additional alternative solutions, each of which can be evaluated independently. Each represents a different architectural approach; we can prefer one over another or use several together. The first alternative is operator API integration. The second alternative is OTP verification by the user. The third alternative is click-id or session-id based tracking. The fourth alternative is the trusted proxy approach.",
    vocabulary: [
      { word: "sustain", tr: "sürdürmek" },
      { word: "evaluated independently", tr: "bağımsız olarak değerlendirilmek" },
      { word: "architectural approach", tr: "mimari yaklaşım" },
      { word: "complement each other", tr: "birbirini tamamlamak" },
      { word: "CPA (Cost Per Acquisition)", tr: "Edinme Başına Maliyet. Reklam kampanyalarında edinilen her aktif yeni abone başına ödenen maliyet." },
      { word: "Compliance", tr: "Yasal Uyum. Sayfa ve onay tasarımlarının BTK ve Operatör kurallarına uygunluğu." }
    ],
    sentenceBuilder: {
      target: "We have four additional alternative solutions each of which can be evaluated independently",
      words: ["We", "have", "four", "additional", "alternative", "solutions", "each", "of", "which", "can", "be", "evaluated", "independently"]
    }
  },
  {
    id: 14,
    titleTr: "SLAYT 14 · Kapanış — Karar Noktası",
    titleEn: "SLIDE 14 · Closing — Decision Point",
    scriptTr: "Sözlerimi bir sonuç ve bir karar noktasıyla toparlamak istiyorum. Şu ana kadar Pexala olarak bu konuda yapabileceğimiz hazırlıkları büyük ölçüde tamamladık. Geliştirdiğimiz proxy çözümü, varsayılan mobil tarayıcılarda — yani kullanıcıların büyük çoğunluğunun karşılaştığı senaryoda — sorunsuz biçimde çalışmaktadır. Bu kapsamda yaptığımız testler olumlu sonuç vermiştir. Ancak Chrome ve Firefox gibi modern tarayıcılarda Türk Telekom tarafında Extension 1000 bilgisinin yakalanamadığı tespit edilmiştir. Bu durumu TT ekipleriyle paylaştık ve geri dönüşlerini bekliyoruz...",
    scriptEn: "I'd like to close my remarks with a status update and a decision point. On the Pexala side, we have largely completed the preparations we can make on this topic. The proxy solution we have developed works successfully on default mobile browsers — that is, the environment most of our users encounter. The tests we have conducted in that scope have produced positive results. However, on modern browsers such as Chrome and Firefox, it has been observed that the operator side cannot capture the Extension 1000 information. We have formally raised this finding with the operator teams and are currently waiting for their response.",
    vocabulary: [
      { word: "status update", tr: "durum güncellemesi" },
      { word: "raised this finding", tr: "bu bulguyu ilettik / sunduk" },
      { word: "decision rests with", tr: "karar ...'a aittir" }
    ],
    sentenceBuilder: {
      target: "The proxy solution we have developed works successfully on default mobile browsers",
      words: ["The", "proxy", "solution", "we", "have", "developed", "works", "successfully", "on", "default", "mobile", "browsers"]
    }
  }
];

export const presentationQA = [
  {
    id: 1,
    question: "What if the operator cannot support Extension 1000 on modern browsers like Chrome? What is our fallback plan?",
    expectedKeywords: ["OTP", "API", "fallback", "manual", "verification"],
    botFollowUp: "That makes sense. Transitioning to OTP is safe but will affect conversions, while Operator API integration would require negotiation.",
    hint: "Kullanıcıya OTP (tek kullanımlık şifre) sunabilir veya operatörün HTTP API'sine istek atarak numarayı sorgulayabiliriz."
  },
  {
    id: 2,
    question: "Will the proxy layer introduce significant latency to our user recognition flow?",
    expectedKeywords: ["latency", "proxy", "handshake", "minimal", "milliseconds"],
    botFollowUp: "Indeed, since the TLS termination happens at the edge, latency should be minimal, but we need to load-test it.",
    hint: "Proxy katmanı bağlantı sonlandırmasını (TLS termination) hızlı yaptığı için ek yük milisaniyeler seviyesinde kalacaktır."
  },
  {
    id: 3,
    question: "Is OTP verification really going to hurt our conversion rate that much?",
    expectedKeywords: ["conversion", "drop", "friction", "OTP", "steps"],
    botFollowUp: "Absolutely, adding even a single input field or SMS waiting step historically causes a 20 to 30 percent drop.",
    hint: "Evet, kullanıcıların SMS beklemek veya numara yazmak zorunda kalması (friction) dönüşümlerde %20-30 arası düşüşe yol açar."
  },
  {
    id: 4,
    question: "How exactly does the operator insert the MSISDN during the TLS handshake?",
    expectedKeywords: ["TLS", "handshake", "extension", "client", "hello", "sni"],
    botFollowUp: "Exactly. The operator network injects the MSISDN into a custom TLS extension field before forwarding the packet to our server.",
    hint: "Operatör ağ seviyesinde paketi yakalar ve TLS el sıkışmasındaki özel bir eklenti alanına (Extension 1000) şifreli olarak enjekte eder."
  }
];

// ================= NEW STANDALONE VAS SECTOR TERMS DATABASE =================
export const vasSectorTerms = [
  {
    english: "Revenue Share",
    turkish: "Gelir Paylaşımı",
    desc: "Operatör (Turkcell, Vodafone vb.) ile katma değerli servis sağlayıcı (CP) arasında elde edilen brüt veya net üyelik gelirlerinin paylaşım oranı modeli."
  },
  {
    english: "Billing Attempts",
    turkish: "Ücretlendirme Denemeleri",
    desc: "Bakiyesi yetersiz olan abonelerin hatlarından, faturasından veya TL bakiyesinden ücretin tahsil edilebilmesi için sistemin yaptığı otomatik tahsilat denemeleri döngüsü."
  },
  {
    english: "Grace Period",
    turkish: "Tolerans Süresi (Askıda Tutma)",
    desc: "Abone bakiyesi kalmadığında, aboneliğin hemen iptal edilmeyip, çekim denemeleriyle askıda tutulduğu ve haklarının sınırlı devam ettiği koruma süresi."
  },
  {
    english: "Renewal",
    turkish: "Otomatik Yenileme",
    desc: "Abonelik dönemi (haftalık/aylık vb.) sona erdiğinde, servis hakkının ve ücret çekim işleminin otomatik olarak yenilenmesi işlemi."
  },
  {
    english: "MT SMS (Mobile Terminated SMS)",
    turkish: "Kullanıcıya Gönderilen SMS",
    desc: "Servis sağlayıcı sunucularından çıkıp mobil şebeke aracılığıyla doğrudan kullanıcı cihazına ulaşan mesaj (örn: şifreler, welcome mesajları)."
  },
  {
    english: "MO SMS (Mobile Originated SMS)",
    turkish: "Kullanıcıdan Gelen SMS",
    desc: "Kullanıcının kendi cihazından bir kısa numaraya gönderdiği SMS (örn: üyeliğini sonlandırmak için IPTAL yazıp göndermesi)."
  },
  {
    english: "CPA (Cost Per Acquisition)",
    thought: "How much did it cost to acquire a subscriber.",
    turkish: "Edinme Başına Maliyet",
    desc: "Reklam kampanyalarında edinilen her aktif yeni abone başına ödenen edinim maliyeti tutarı."
  },
  {
    english: "CR (Conversion Rate)",
    turkish: "Dönüşüm Oranı",
    desc: "Açılış sayfasını (landing page) ziyaret eden kullanıcıların yüzde kaçının abonelik onayını tamamlayarak üyeliğe dönüştüğünü gösteren verimlilik oranı."
  },
  {
    english: "Churn Rate",
    turkish: "Abone Kayıp Oranı",
    desc: "Belirli bir süre içinde (günlük/haftalık/aylık) abonelikten ayrılan (iptal eden) üyelerin toplam aktif üye sayısına oranı."
  },
  {
    english: "Lifetime Value (LTV)",
    turkish: "Abone Ömür Boyu Değeri",
    desc: "Bir abonenin üye kaldığı süre boyunca firmaya kazandırdığı ortalama toplam brüt veya net gelir tahmini."
  },
  {
    english: "Landing Page (LP)",
    turkish: "Açılış Sayfası",
    desc: "Kullanıcının reklama tıkladığında yönlendirildiği, operatör ödeme onay butonunu ve yasal tarife bilgilerini içeren sayfa."
  },
  {
    english: "Header Enrichment",
    turkish: "Başlık Zenginleştirme",
    desc: "Operatörün, HTTP paket başlıklarına kullanıcının telefon numarasını (MSISDN) şifreli olarak enjekte etmesini sağlayan otomatik kullanıcı tanıma tekniği."
  },
  {
    english: "CP (Content Provider)",
    turkish: "İçerik Sağlayıcı",
    desc: "Servisi veya portalı işleten, oyunu, videoyu veya astroloji içeriğini hazırlayarak operatör ödeme altyapısıyla sunan şirket (Pexala vb.)."
  },
  {
    english: "Aggregator (Entegratör)",
    turkish: "Mobil Ödeme Entegratörü",
    desc: "Tüm operatörler ile tek tek entegre olmak yerine CP'lere tek API ile ödeme tahsilatı ve teknik altyapı sağlayan lisanslı aracı finansal kuruluşlar."
  },
  {
    english: "Compliance",
    turkish: "Yasal Uyum (Regülasyon)",
    desc: "Landing page tasarımlarının, reklam görsellerinin ve SMS içeriklerinin BTK veya operatör katı kurallarına ve tüketici haklarına uygunluğu."
  }
];
