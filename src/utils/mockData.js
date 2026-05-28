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
    scriptTr: "Merhaba arkadaşlar. Bugün HTTPS geçişi hakkında konuşacağım. Mobil hatlardan telefon numarasını HTTP üzerinden otomatik olarak alıyoruz. Ancak HTTPS ile bu yapı değişecek. Şimdi çözümlere ve detaylara bakalım.",
    scriptEn: "Hello everyone. Today, I will talk about HTTPS transition. We automatically get the user's phone number over HTTP. But HTTPS will change this. Let's look at the solutions.",
    vocabulary: [
      { word: "migration", tr: "göç / geçiş" },
      { word: "implications", tr: "etkiler / sonuçlar" },
      { word: "recognition flow", tr: "tanıma akışı" },
      { word: "redesigned", tr: "yeniden tasarlanmış" },
      { word: "CP (Content Provider)", tr: "İçerik Sağlayıcı. Mobil servis/portal kurup içerik barındıran taraf." },
      { word: "Aggregator (Entegratör)", tr: "Operatörler ile CP'ler arasında mobil ödeme teknik altyapısını sağlayan aracı şirket." }
    ],
    sentenceBuilder: {
      target: "Today I will talk about HTTPS transition",
      targetTr: "Bugün HTTPS geçişi hakkında konuşacağım.",
      words: ["Today", "I", "will", "talk", "about", "HTTPS", "transition"]
    }
  },
  {
    id: 2,
    titleTr: "SLAYT 02 · Gündem",
    titleEn: "SLIDE 02 · Agenda",
    scriptTr: "Bugün altı konumuz var. İlk olarak, header enrichment nedir? İkinci olarak, HTTP üzerinde nasıl çalışır? Üçüncü olarak, yeni Chrome güncellemesi. Sonra, HTTPS değişiklikleri. Son olarak da çözümlerimiz.",
    scriptEn: "Today we have six topics. First, what is header enrichment? Second, how it works over HTTP. Third, the new Chrome update. Then, the HTTPS changes. Finally, our solutions.",
    vocabulary: [
      { word: "turning point", tr: "dönüm noktası" },
      { word: "header enrichment", tr: "başlık zenginleştirme (operatörün numara enjekte etmesi)" },
      { word: "evaluate", tr: "değerlendirmek" },
      { word: "alternative approaches", tr: "alternatif yaklaşımlar" }
    ],
    sentenceBuilder: {
      target: "Today we have six topics",
      targetTr: "Bugün altı konumuz var.",
      words: ["Today", "we", "have", "six", "topics"]
    }
  },
  {
    id: 3,
    titleTr: "SLAYT 03 · Header Enrichment Nedir?",
    titleEn: "SLIDE 03 · What is Header Enrichment?",
    scriptTr: "Header enrichment nedir? Operatör, telefon numarasını isteğe ekler. Sistemimiz bu numarayı otomatik olarak okur. Kullanıcı numara yazmak zorunda kalmaz. Bu işlem çok hızlı ve kolaydır.",
    scriptEn: "What is header enrichment? The operator adds the phone number to the request. Our system reads it automatically. The user does not write their phone number. This is fast and easy.",
    vocabulary: [
      { word: "frictionless", tr: "sürtünmesiz / pürüzsüz" },
      { word: "conversion rates", tr: "dönüşüm oranları" },
      { word: "automatically", tr: "otomatik olarak" },
      { word: "verification", tr: "doğrulama" },
      { word: "Landing Page (LP)", tr: "Açılış Sayfası. Reklam tıklandığında açılan, operatör ödeme onay butonu içeren sayfa." },
      { word: "CR (Conversion Rate)", tr: "Dönüşüm Oranı. Ziyaretçilerin aboneye dönüşme yüzdesi." }
    ],
    sentenceBuilder: {
      target: "This is fast and easy",
      targetTr: "Bu işlem hızlı ve kolaydır.",
      words: ["This", "is", "fast", "and", "easy"]
    }
  },
  {
    id: 4,
    titleTr: "SLAYT 04 · HTTP Üzerinde Akış Nasıl İşliyordu?",
    titleEn: "SLIDE 04 · How Did the Flow Work Over HTTP?",
    scriptTr: "HTTP protokolünde trafik şifreli değildir. Bu yüzden operatör isteği görebilir ve telefon numarasını ekleyebilir. Sistemimiz kullanıcıyı anında tanır. Kullanıcının fazladan bir şey yapması gerekmez.",
    scriptEn: "On HTTP, traffic is not encrypted. So, the operator can see the request. They add the phone number easily. Our system reads it instantly. The user has no extra steps.",
    vocabulary: [
      { word: "unencrypted", tr: "şifrelenmemiş" },
      { word: "straightforward", tr: "yalın / basit" },
      { word: "subscription journey", tr: "abonelik yolculuğu" },
      { word: "instantly", tr: "anında" },
      { word: "Revenue Share", tr: "Gelir Paylaşımı. Operatör ile içerik sağlayıcının kazancı paylaşma oranı." },
      { word: "Renewal", tr: "Yenileme. Abonelik dönemi sonunda servis ücretinin faturadan tekrar otomatik çekilmesi." }
    ],
    sentenceBuilder: {
      target: "The user has no extra steps",
      targetTr: "Kullanıcının ekstra adımları yoktur.",
      words: ["The", "user", "has", "no", "extra", "steps"]
    }
  },
  {
    id: 5,
    titleTr: "SLAYT 05 · Google Chrome Güncellemesi / HTTPS Zorunluluğu",
    titleEn: "SLIDE 05 · Google Chrome Update / HTTPS Push",
    scriptTr: "Bu geçiş neden önemli? Google Chrome, HTTP siteleri için güvenlik uyarıları gösterecek. Kullanıcılar sayfamızı terk edecek. Bu durum müşteri ve para kaybettirecek. Bu yüzden HTTPS'e geçmeliyiz.",
    scriptEn: "Why is this important? Google Chrome will show security warnings for HTTP sites. Users will leave our page. We will lose users and money. We must move to HTTPS.",
    vocabulary: [
      { word: "decisive date", tr: "belirleyici tarih" },
      { word: "security warnings", tr: "güvenlik uyarıları" },
      { word: "abandon the page", tr: "sayfayı terk etmek" },
      { word: "hard deadline", tr: "kesin / katı son tarih" }
    ],
    sentenceBuilder: {
      target: "We must move to HTTPS",
      targetTr: "HTTPS'e geçmek zorundayız.",
      words: ["We", "must", "move", "to", "HTTPS"]
    }
  },
  {
    id: 6,
    titleTr: "SLAYT 06 · HTTPS'e Geçtiğimizde Ne Değişir?",
    titleEn: "SLIDE 06 · What Changes When We Move to HTTPS?",
    scriptTr: "HTTPS bağlantısında trafiğimiz şifreli bir tünelden geçer. Güvenlik için iyidir ama bu durum akışımızı değiştirir. Operatör isteğin içeriğini göremez. Bu yüzden telefon numarasını ekleyemez. Otomatik giriş durur.",
    scriptEn: "On HTTPS, our traffic is encrypted. The operator cannot see the request. So, they cannot add the phone number. The automatic login stops working.",
    vocabulary: [
      { word: "encrypted tunnel", tr: "şifreli tünel" },
      { word: "side effect", tr: "yan etki" },
      { word: "cut off", tr: "kesilmek / durdurulmak" },
      { word: "user trust", tr: "kullanıcı güveni" },
      { word: "Billing Attempts", tr: "Ücretlendirme Denemeleri. Yetersiz bakiyeli hattı bakiye yüklendiğinde otomatik çekme denemesi." },
      { word: "Grace Period", tr: "Tolerans Süresi. Bakiye yetersizliğinde üyeliğin askıda tutulup çekilmeye çalışıldığı süre." }
    ],
    sentenceBuilder: {
      target: "The automatic login stops working",
      targetTr: "Otomatik giriş çalışmayı durdurur.",
      words: ["The", "automatic", "login", "stops", "working"]
    }
  },
  {
    id: 7,
    titleTr: "SLAYT 07 · Modelimizin Etkisi",
    titleEn: "SLIDE 07 · How It Affects Our Application",
    scriptTr: "Sonra ne olacak? Kullanıcıyı otomatik olarak tanıyamayız. Kullanıcı numarasını elle yazmak zorunda kalır. Veya SMS kodu bekler. Bu durum üye olma oranını çok düşürür.",
    scriptEn: "What happens next? We cannot know the user automatically. The user must type their number manually. Or they must wait for an SMS code. This makes our conversion drop.",
    vocabulary: [
      { word: "consequences", tr: "sonuçlar" },
      { word: "measurable drop", tr: "ölçülebilir düşüş" },
      { word: "additional step", tr: "ekstra adım" },
      { word: "business outcomes", tr: "iş sonuçları / çıktıları" },
      { word: "Churn Rate", tr: "Abone Kayıp Oranı. Servisi iptal edenlerin aktif aboneye oranı." },
      { word: "Lifetime Value (LTV)", tr: "Abone Ömür Boyu Değeri. Bir abonenin sistemde kaldığı süre boyunca kazandırdığı toplam net gelir." }
    ],
    sentenceBuilder: {
      target: "This makes our conversion drop",
      targetTr: "Bu durum dönüşümümüzü düşürür.",
      words: ["This", "makes", "our", "conversion", "drop"]
    }
  },
  {
    id: 8,
    titleTr: "SLAYT 08 · İki Yönlü Risk, Tek Bir Karar",
    titleEn: "SLIDE 08 · Two-Sided Risk, One Decision",
    scriptTr: "İki temel riskimiz var. HTTP'de kalırsak kullanıcılar uyarı görür. Plansız HTTPS'e geçersek otomatik giriş bozulur. Güvenli bir çözüme ihtiyacımız var.",
    scriptEn: "We have two risks. If we stay on HTTP, users see warnings. If we move to HTTPS without a plan, automatic login fails. We need a safe solution.",
    vocabulary: [
      { word: "two-sided risk", tr: "iki yönlü risk" },
      { word: "doing nothing", tr: "hiçbir şey yapmamak" },
      { word: "rushing into", tr: "aceleye getirmek / aceleyle girişmek" },
      { word: "preserving", tr: "korumak / muhafaza etmek" }
    ],
    sentenceBuilder: {
      target: "We need a safe solution",
      targetTr: "Güvenli bir çözüme ihtiyacımız var.",
      words: ["We", "need", "a", "safe", "solution"]
    }
  },
  {
    id: 9,
    titleTr: "SLAYT 09 · Hedefimizi Üç Sütunla Tanımlıyoruz",
    titleEn: "SLIDE 09 · Our Goal in Three Pillars",
    scriptTr: "Üç hedefimiz var. Birincisi, güvenli bir bağlantı. İkincisi, kullanıcının otomatik tanınması. Üçüncüsü ise formsuz ve kolay bir deneyim.",
    scriptEn: "We have three goals. First, a secure connection. Second, automatic recognition of the user. Third, an easy experience with no extra forms.",
    vocabulary: [
      { word: "padlock", tr: "asma kilit (tarayıcıdaki kilit simgesi)" },
      { word: "under three headings", tr: "üç başlık altında" },
      { word: "risk losing", tr: "kaybetme riski taşımak" },
      { word: "MT SMS", tr: "Mobile Terminated. Sunucudan kullanıcı telefonuna atılan SMS." },
      { word: "MO SMS", tr: "Mobile Originated. Kullanıcının faturasından düşerek kısa numaraya yolladığı SMS." }
    ],
    sentenceBuilder: {
      target: "We have three goals",
      targetTr: "Üç hedefimiz var.",
      words: ["We", "have", "three", "goals"]
    }
  },
  {
    id: 10,
    titleTr: "SLAYT 10 · Çözüm: MSISDN'i Farklı Bir Yerde Taşımak (Extension 1000)",
    titleEn: "SLIDE 10 · Solution: Carrying the MSISDN Elsewhere (Extension 1000)",
    scriptTr: "Operatör Extension 1000 adında bir çözüm sunuyor. Numarayı HTTP isteğine koyamayız. Ama TLS el sıkışması sırasında gönderebiliriz. Bu özel bir alandır.",
    scriptEn: "The operator offers Extension 1000. We cannot put the number in the request. But we can send it during the TLS connection handshake. This is a special field.",
    vocabulary: [
      { word: "TLS handshake", tr: "TLS el sıkışması (bağlantı başlangıcı)" },
      { word: "dedicated field", tr: "özel / tahsis edilmiş alan" },
      { word: "end to end", tr: "uçtan uca" },
      { word: "Header Enrichment", tr: "Operatörün şebeke seviyesinde MSISDN'i istek başlığına yerleştirme teknolojisi." }
    ],
    sentenceBuilder: {
      target: "The operator offers Extension 1000",
      targetTr: "Operatör Extension 1000 çözümünü sunuyor.",
      words: ["The", "operator", "offers", "Extension", "1000"]
    }
  },
  {
    id: 11,
    titleTr: "SLAYT 11 · Bizim Çözümümüz: Proxy Katmanı",
    titleEn: "SLIDE 11 · Our Solution: A Proxy Layer",
    scriptTr: "Kendi tarafımızda bir proxy katmanı kullanacağız. Proxy Extension 1000 alanını okur. Telefon numarasını bulur ve backend'e gönderir. Backend üzerinde değişiklik yapmaya gerek kalmaz.",
    scriptEn: "On our side, we use a proxy layer. The proxy reads Extension 1000. It finds the phone number and sends it to our backend. The backend does not change.",
    vocabulary: [
      { word: "proxy layer", tr: "vekil sunucu katmanı" },
      { word: "extracts", tr: "söker / ayıklar" },
      { word: "header format", tr: "başlık formatı" }
    ],
    sentenceBuilder: {
      target: "The proxy reads Extension 1000",
      targetTr: "Proxy Extension 1000 alanını okur.",
      words: ["The", "proxy", "reads", "Extension", "1000"]
    }
  },
  {
    id: 12,
    titleTr: "SLAYT 12 · Extension 1000'in Sınırları",
    titleEn: "SLIDE 12 · The Limits of Extension 1000",
    scriptTr: "Ancak Extension 1000 çözümü yüzde yüz kesin değildir. Her tarayıcıda çalışmayabilir. Örneğin, TLS 1.3 sürümünde hata verebilir. Bu yüzden yedek bir plana ihtiyacımız var.",
    scriptEn: "But Extension 1000 is not 100% perfect. It does not work on all browsers. For example, with TLS 1.3, it might fail. We need a backup plan.",
    vocabulary: [
      { word: "transparent", tr: "şeffaf / açık" },
      { word: "guarantee", tr: "garanti" },
      { word: "security standards", tr: "güvenlik standartları" }
    ],
    sentenceBuilder: {
      target: "We need a backup plan",
      targetTr: "Yedek bir plana ihtiyacımız var.",
      words: ["We", "need", "a", "backup", "plan"]
    }
  },
  {
    id: 13,
    titleTr: "SLAYT 13 · Alternatif Çözüm Yolları",
    titleEn: "SLIDE 13 · Alternative Solution Paths",
    scriptTr: "Extension 1000 tek seçeneğimiz değil. Başka çözümlerimiz de var. Operatör API entegrasyonu yapabiliriz. SMS doğrulama ekleyebiliriz. Veya session ID takibi yapabiliriz.",
    scriptEn: "Extension 1000 is not our only option. We have other solutions. One is operator API. Another is SMS verification. We can also track session IDs.",
    vocabulary: [
      { word: "sustain", tr: "sürdürmek" },
      { word: "evaluated independently", tr: "bağımsız olarak değerlendirilmek" },
      { word: "architectural approach", tr: "mimari yaklaşım" },
      { word: "complement each other", tr: "birbirini tamamlamak" },
      { word: "CPA (Cost Per Acquisition)", tr: "Edinme Başına Maliyet. Reklam kampanyalarında edinilen her aktif yeni abone başına ödenen maliyet." },
      { word: "Compliance", tr: "Yasal Uyum. Sayfa ve onay tasarımlarının BTK ve Operatör kurallarına uygunluğu." }
    ],
    sentenceBuilder: {
      target: "Extension 1000 is not our only option",
      targetTr: "Extension 1000 tek seçeneğimiz değil.",
      words: ["Extension", "1000", "is", "not", "our", "only", "option"]
    }
  },
  {
    id: 14,
    titleTr: "SLAYT 14 · Kapanış — Karar Noktası",
    titleEn: "SLIDE 14 · Closing — Decision Point",
    scriptTr: "Kapatırken durumumuz şudur. Proxy çözümümüz varsayılan mobil tarayıcılarda iyi çalışıyor. Ancak Chrome ve Firefox üzerinde hata veriyor. Operatörden geri bildirim bekliyoruz.",
    scriptEn: "To close, our proxy works on default mobile browsers. But it fails on Chrome and Firefox. We are waiting for the operator's feedback.",
    vocabulary: [
      { word: "status update", tr: "durum güncellemesi" },
      { word: "raised this finding", tr: "bu bulguyu ilettik / sunduk" },
      { word: "decision rests with", tr: "karar ...'a aittir" }
    ],
    sentenceBuilder: {
      target: "We are waiting for the operator's feedback",
      targetTr: "Operatörün geri bildirimini bekliyoruz.",
      words: ["We", "are", "waiting", "for", "the", "operator's", "feedback"]
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
