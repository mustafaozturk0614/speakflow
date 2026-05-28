// Netlify Identity Cloud Sync Utility for SpeakFlow

export const initNetlifySync = (onUserChange) => {
  if (typeof window === "undefined" || !window.netlifyIdentity) {
    console.warn("Netlify Identity widget is not loaded.");
    return;
  }

  const widget = window.netlifyIdentity;

  // Set up event listeners
  widget.on("init", (user) => {
    onUserChange(user);
    if (user) {
      syncCloudToLocal(user);
    }
  });

  widget.on("login", (user) => {
    onUserChange(user);
    syncCloudToLocal(user);
    widget.close();
  });

  widget.on("logout", () => {
    onUserChange(null);
    localStorage.clear(); // Clear local progress on logout
    window.location.reload();
  });

  // Call init
  widget.init();
};

export const openNetlifyLogin = () => {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.open();
  }
};

export const logoutNetlify = () => {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.logout();
  }
};

export const isNetlifyLoggedIn = () => {
  if (window.netlifyIdentity) {
    return !!window.netlifyIdentity.currentUser();
  }
  return false;
};

export const syncLocalToCloud = async () => {
  if (typeof window === "undefined" || !window.netlifyIdentity) return;
  
  const user = window.netlifyIdentity.currentUser();
  if (!user) return; // Only sync if logged in

  try {
    const keysToBackup = [
      "speakflow_xp",
      "speakflow_level",
      "speakflow_streak",
      "speakflow_last_active_date",
      "speakflow_vocabulary",
      "speakflow_daily_tasks",
      "speakflow_gemini_api_key"
    ];
    
    const speakflowData = {};
    keysToBackup.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        speakflowData[key] = val;
      }
    });

    // Update user metadata in Netlify
    await user.update({
      user_metadata: {
        speakflow_data: speakflowData
      }
    });
    console.log("SpeakFlow progress synced to Netlify Cloud successfully.");
  } catch (err) {
    console.error("Failed to sync progress to Netlify:", err);
  }
};

export const syncCloudToLocal = (user) => {
  if (!user || !user.user_metadata || !user.user_metadata.speakflow_data) return;

  try {
    const cloudData = user.user_metadata.speakflow_data;
    let hasChanges = false;

    Object.keys(cloudData).forEach(key => {
      const localVal = localStorage.getItem(key);
      const cloudVal = cloudData[key];
      
      if (localVal !== cloudVal) {
        localStorage.setItem(key, cloudVal);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      console.log("Loaded SpeakFlow progress from Netlify Cloud.");
      // Trigger update events
      window.dispatchEvent(new CustomEvent("speakflow_xp_changed"));
      window.dispatchEvent(new CustomEvent("speakflow_tasks_changed"));
      window.dispatchEvent(new CustomEvent("speakflow_vocabulary_changed"));
      window.dispatchEvent(new CustomEvent("speakflow_streak_changed"));
      
      // Refresh page to load everything clean
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  } catch (err) {
    console.error("Error reading cloud data:", err);
  }
};
