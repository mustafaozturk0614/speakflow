import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import SettingsModal from "./components/SettingsModal";
import DashboardModule from "./components/DashboardModule";
import DiagnosticModule from "./components/DiagnosticModule";
import GrammarModule from "./components/GrammarModule";
import PresentationModule from "./components/PresentationModule";
import PatternModule from "./components/PatternModule";
import ExpressionsModule from "./components/ExpressionsModule";
import SimulationModule from "./components/SimulationModule";
import RoleplayModule from "./components/RoleplayModule";
import LessonGeneratorModule from "./components/LessonGeneratorModule";
import AnalyticsModule from "./components/AnalyticsModule";
import RoutineModule from "./components/RoutineModule";
import ChatModule from "./components/ChatModule";
import { awardXP } from "./utils/gamification";
import { initNetlifySync } from "./utils/netlifySync";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState(null); // stores level number if leveled up
  const [user, setUser] = useState(null); // Netlify user details

  useEffect(() => {
    // Initialize Netlify Sync
    initNetlifySync((currentUser) => {
      setUser(currentUser);
    });

    // Award a tiny bit of XP just for launching the app to welcome them!
    setTimeout(() => {
      awardXP(5);
    }, 1000);

    const handleLevelUp = (e) => {
      const nextLvl = e.detail.level;
      setLevelUpMessage(nextLvl);
      
      // Play a quick celebratory chime
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        
        // play chord
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (err) {
        console.error(err);
      }

      // Hide level up overlay after 3 seconds
      setTimeout(() => {
        setLevelUpMessage(null);
      }, 3500);
    };

    window.addEventListener("speakflow_level_up", handleLevelUp);
    return () => window.removeEventListener("speakflow_level_up", handleLevelUp);
  }, []);

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardModule />;
      case "diagnostics":
        return <DiagnosticModule />;
      case "grammar":
        return <GrammarModule />;
      case "presentation":
        return <PresentationModule />;
      case "patterns":
        return <PatternModule />;
      case "expressions":
        return <ExpressionsModule />;
      case "simulation":
        return <SimulationModule />;
      case "roleplay":
        return <RoleplayModule />;
      case "lessons":
        return <LessonGeneratorModule />;
      case "analytics":
        return <AnalyticsModule />;
      case "routine":
        return <RoutineModule />;
      case "chat":
        return <ChatModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setShowSettingsModal(true)} 
        user={user}
      />

      {/* Main Workspace Area */}
      <main className="main-content">
        <div style={{ flex: 1, maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "10px" }}>
          {renderActiveModule()}
        </div>
      </main>

      {/* Level Up Celebratory Modal Overlay */}
      {levelUpMessage && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 10000,
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 0 25px rgba(236, 72, 153, 0.4)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          animation: "slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          <span style={{ fontSize: "2rem" }}>🏆</span>
          <div>
            <h4 style={{ margin: 0, fontSize: "1.1rem" }}>TEBRİKLER!</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.9 }}>Seviye Atladınız! Yeni Seviye: <b>{levelUpMessage}</b></p>
          </div>
        </div>
      )}

      {/* Preferences / Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
}
