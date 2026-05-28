// Gamification and progress utility for SpeakFlow
import { syncLocalToCloud } from "./netlifySync";

// 1. XP and Level Management
export const getXP = () => parseInt(localStorage.getItem("speakflow_xp") || "0");
export const getLevel = () => parseInt(localStorage.getItem("speakflow_level") || "1");

export const awardXP = (amount) => {
  let xp = getXP();
  let lvl = getLevel();
  xp += amount;
  
  const xpNeeded = lvl * 100;
  let leveledUp = false;

  if (xp >= xpNeeded) {
    xp = xp - xpNeeded;
    lvl += 1;
    leveledUp = true;
    localStorage.setItem("speakflow_level", lvl.toString());
    
    // Trigger Level Up Event
    window.dispatchEvent(new CustomEvent("speakflow_level_up", { detail: { level: lvl } }));
    
    // Unlock Badge automatically
    if (lvl === 2) unlockBadge("level_2");
    if (lvl === 5) unlockBadge("level_5");
  }

  localStorage.setItem("speakflow_xp", xp.toString());
  window.dispatchEvent(new CustomEvent("speakflow_xp_changed"));
  syncLocalToCloud();
  
  return leveledUp;
};

// 2. Badges Management
export const getUnlockedBadges = () => {
  try {
    return JSON.parse(localStorage.getItem("speakflow_badges") || "[]");
  } catch (e) {
    return [];
  }
};

export const unlockBadge = (badgeId) => {
  const badges = getUnlockedBadges();
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    localStorage.setItem("speakflow_badges", JSON.stringify(badges));
    window.dispatchEvent(new CustomEvent("speakflow_badge_unlocked", { detail: { badgeId } }));
    awardXP(50); // bonus XP for unlocking a badge!
    syncLocalToCloud();
  }
};

// 3. Streak Management
export const getStreak = () => parseInt(localStorage.getItem("speakflow_streak") || "0");

export const updateStreak = () => {
  const lastActiveStr = localStorage.getItem("speakflow_last_active_date");
  const todayStr = new Date().toDateString();

  if (lastActiveStr === todayStr) {
    return; // Already active today, no change
  }

  const streak = getStreak();
  if (!lastActiveStr) {
    // First time ever
    localStorage.setItem("speakflow_streak", "1");
    localStorage.setItem("speakflow_last_active_date", todayStr);
  } else {
    const lastActive = new Date(lastActiveStr);
    const today = new Date(todayStr);
    
    // Calculate difference in days
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day!
      const newStreak = streak + 1;
      localStorage.setItem("speakflow_streak", newStreak.toString());
      localStorage.setItem("speakflow_last_active_date", todayStr);
      if (newStreak === 3) unlockBadge("streak_3");
      if (newStreak === 7) unlockBadge("streak_7");
    } else if (diffDays > 1) {
      // Streak broken, reset
      localStorage.setItem("speakflow_streak", "1");
      localStorage.setItem("speakflow_last_active_date", todayStr);
    }
  }
  window.dispatchEvent(new CustomEvent("speakflow_streak_changed"));
  syncLocalToCloud();
};

// 4. Daily Tasks Management
export const getDailyTasks = () => {
  const todayStr = new Date().toDateString();
  const storedDate = localStorage.getItem("speakflow_tasks_date");
  
  const defaultTasks = [
    { id: "task_presentation", label: "Bir sunum slaytı seslendir", completed: false, xp: 30 },
    { id: "task_grammar", label: "Bir pratik gramer testini çöz", completed: false, xp: 30 },
    { id: "task_shadowing", label: "Shadowing egzersizinde %80 skor yap", completed: false, xp: 30 }
  ];

  if (storedDate !== todayStr) {
    localStorage.setItem("speakflow_tasks_date", todayStr);
    localStorage.setItem("speakflow_daily_tasks", JSON.stringify(defaultTasks));
    return defaultTasks;
  }

  try {
    return JSON.parse(localStorage.getItem("speakflow_daily_tasks") || JSON.stringify(defaultTasks));
  } catch (e) {
    return defaultTasks;
  }
};

export const completeDailyTask = (taskId) => {
  const tasks = getDailyTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (task && !task.completed) {
    task.completed = true;
    localStorage.setItem("speakflow_daily_tasks", JSON.stringify(tasks));
    awardXP(task.xp);
    window.dispatchEvent(new CustomEvent("speakflow_tasks_changed"));
    
    // Check if all completed
    const allDone = tasks.every(t => t.completed);
    if (allDone) {
      unlockBadge("all_tasks_today");
      awardXP(50); // bonus for doing all tasks
    }
    syncLocalToCloud();
  }
};

// 5. Personal Vocabulary Management
export const getVocabulary = () => {
  try {
    return JSON.parse(localStorage.getItem("speakflow_vocabulary") || "[]");
  } catch (e) {
    return [];
  }
};

export const toggleVocabulary = (item) => {
  // item is { type, english, turkish }
  const list = getVocabulary();
  const idx = list.findIndex(i => i.english === item.english && i.type === item.type);
  let added = false;

  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    // Inject default SRS parameters if missing
    const srsItem = {
      ...item,
      srsStage: 0,
      nextReviewDate: Date.now(),
      interval: 0,
      easeFactor: 2.5
    };
    list.push(srsItem);
    added = true;
    unlockBadge("first_word");
    if (list.length >= 10) unlockBadge("words_10");
  }

  localStorage.setItem("speakflow_vocabulary", JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("speakflow_vocabulary_changed"));
  syncLocalToCloud();
  return added;
};

// 6. Spaced Repetition (SRS) Engine
export const updateVocabularyCardSrs = (english, type, rating) => {
  const list = getVocabulary();
  const idx = list.findIndex(i => i.english === english && i.type === type);
  if (idx > -1) {
    const card = list[idx];
    let stage = card.srsStage || 0;
    let factor = card.easeFactor || 2.5;
    let interval = card.interval || 0;

    if (rating === "hard") {
      stage = 0;
      interval = 1; // 1 day
      factor = Math.max(1.3, factor - 0.2);
    } else if (rating === "good") {
      stage += 1;
      if (stage === 1) {
        interval = 1;
      } else if (stage === 2) {
        interval = 3;
      } else {
        interval = Math.round(interval * factor);
      }
    } else if (rating === "easy") {
      stage += 2;
      factor = factor + 0.15;
      if (stage === 1) {
        interval = 1;
      } else if (stage === 2) {
        interval = 3;
      } else {
        interval = Math.round(interval * factor * 1.5);
      }
    }

    card.srsStage = stage;
    card.easeFactor = factor;
    card.interval = interval;
    // Set next review date. For demo/practice purposes, we will use hours or minutes instead of days
    // to let the user see review cards appear quickly. Let's make 1 interval unit = 1 hour instead of 24 hours!
    // That way they can practice and see them appear again in the same day, which is awesome.
    card.nextReviewDate = Date.now() + interval * 60 * 60 * 1000; 

    localStorage.setItem("speakflow_vocabulary", JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("speakflow_vocabulary_changed"));
    awardXP(15); // +15 XP for studying!
    syncLocalToCloud();
  }
};

// 7. Recent Mistakes Logging
export const getRecentMistakes = () => {
  try {
    return JSON.parse(localStorage.getItem("speakflow_recent_mistakes") || "[]");
  } catch (e) {
    return [];
  }
};

export const logMistake = (wrong, correct, explanation) => {
  if (!wrong || !correct) return;
  const list = getRecentMistakes();
  // Avoid duplicate entries
  if (list.some(m => m.wrong.toLowerCase().trim() === wrong.toLowerCase().trim())) return;
  list.unshift({ wrong, correct, explanation, date: Date.now() });
  // Keep only the 10 most recent mistakes
  const trimmed = list.slice(0, 10);
  localStorage.setItem("speakflow_recent_mistakes", JSON.stringify(trimmed));
  window.dispatchEvent(new CustomEvent("speakflow_mistakes_changed"));
  syncLocalToCloud();
};

