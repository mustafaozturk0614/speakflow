import React, { useState, useEffect } from "react";
import { X, Key, Volume2, Save, AlertTriangle } from "lucide-react";
import { getApiKey, saveApiKey, removeApiKey } from "../utils/gemini";
import { getAvailableVoices, speakText } from "../utils/speech";

export default function SettingsModal({ onClose }) {
  const [apiKey, setApiKey] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [speed, setSpeed] = useState(0.9);
  const [saved, setSaved] = useState(false);
  
  // Backup & Sync States
  const [showImportField, setShowImportField] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [backupSuccess, setBackupSuccess] = useState("");

  useEffect(() => {
    // Load API Key
    setApiKey(getApiKey());

    // Load available voices
    const loadVoices = () => {
      const list = getAvailableVoices();
      setVoices(list);
      
      const storedVoice = localStorage.getItem("speakflow_voice_name");
      if (storedVoice) {
        setSelectedVoice(storedVoice);
      } else if (list.length > 0) {
        // Select a default English voice
        const def = list.find(v => v.lang.startsWith("en-US")) || list[0];
        setSelectedVoice(def.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Load speed settings
    const storedSpeed = localStorage.getItem("speakflow_voice_speed");
    if (storedSpeed) {
      setSpeed(parseFloat(storedSpeed));
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
    } else {
      removeApiKey();
    }

    localStorage.setItem("speakflow_voice_name", selectedVoice);
    localStorage.setItem("speakflow_voice_speed", speed.toString());

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const handleTestVoice = () => {
    speakText("Hello! This is a test of my speaking speed and voice pitch. Let's practice English!", speed, selectedVoice);
  };

  const handleExportData = () => {
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
      
      const backupObj = {};
      keysToBackup.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) {
          backupObj[key] = val;
        }
      });
      
      const jsonString = JSON.stringify(backupObj);
      const base64Code = btoa(unescape(encodeURIComponent(jsonString)));
      
      navigator.clipboard.writeText(base64Code);
      setBackupSuccess("Yedek kodunuz panoya kopyalandı! Telefonunuza yapıştırabilirsiniz.");
      setTimeout(() => setBackupSuccess(""), 4500);
    } catch (err) {
      console.error(err);
      alert("Yedekleme kodu oluşturulamadı: " + err.message);
    }
  };

  const handleImportData = () => {
    if (!importCode.trim()) return;
    try {
      const jsonString = decodeURIComponent(escape(atob(importCode.trim())));
      const backupObj = JSON.parse(jsonString);
      
      if (typeof backupObj !== "object" || backupObj === null) {
        throw new Error("Geçersiz yedek kodu formatı.");
      }
      
      Object.keys(backupObj).forEach(key => {
        localStorage.setItem(key, backupObj[key]);
      });
      
      setBackupSuccess("Veriler başarıyla yüklendi! Sayfa yenileniyor...");
      setImportCode("");
      setShowImportField(false);
      
      window.dispatchEvent(new CustomEvent("speakflow_xp_changed"));
      window.dispatchEvent(new CustomEvent("speakflow_tasks_changed"));
      window.dispatchEvent(new CustomEvent("speakflow_vocabulary_changed"));
      window.dispatchEvent(new CustomEvent("speakflow_streak_changed"));
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Hata: Yedek kodu çözülemedi. Lütfen geçerli bir kod kopyaladığınızdan emin olun.");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="glass-panel" style={{
        maxWidth: "500px",
        width: "100%",
        padding: "25px",
        position: "relative",
        animation: "fadeIn 0.2s ease"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <Volume2 size={22} style={{ color: "var(--color-primary)" }} />
            Ayarlar & Tercihler
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ marginLeft: "auto", width: "32px", height: "32px" }}>
            <X size={16} />
          </button>
        </div>

        {/* Gemini API Key */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-muted)" }}>
            <Key size={14} style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }} />
            Gemini API Anahtarı (Opsiyonel)
          </label>
          <input
            type="password"
            className="form-input"
            placeholder="AI Modu için API Anahtarınızı girin..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            API Anahtarı olmadan da offline <b>Simülasyon Modu</b> çalışacaktır. Ücretsiz API anahtarınızı almak için{" "}
            <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
              Google AI Studio
            </a>
            'yu ziyaret edebilirsiniz. Anahtarınız sadece tarayıcınızda saklanır.
          </span>
        </div>

        {/* Text to Speech Voice Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-muted)" }}>
            Konuşma Sesi
          </label>
          <select
            className="form-input"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{ marginBottom: "8px", background: "#18182f" }}
          >
            {voices.length === 0 ? (
              <option>Yükleniyor veya İngilizce ses bulunamadı...</option>
            ) : (
              voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Speech Speed Slider */}
        <div style={{ marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>
              Konuşma Hızı (Rate): {speed}x
            </label>
            <button
              onClick={handleTestVoice}
              className="btn btn-secondary"
              style={{ padding: "2px 8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Volume2 size={12} /> Test Et
            </button>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "var(--color-primary)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
            <span>Yavaş (Yarım)</span>
            <span>Normal</span>
            <span>Hızlı</span>
          </div>
        </div>

        {/* Netlify Eşitleme Durumu Bilgilendirmesi */}
        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "15px", marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-muted)" }}>
            ☁️ Bulut Senkronizasyonu
          </label>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Uygulamanız Netlify Identity ile entegre edilmiştir. Yan paneldeki <b>"Giriş Yap"</b> butonunu kullanarak giriş yapabilir, tüm cihazlarınızda otomatik veri eşitlemesinin keyfini çıkarabilirsiniz!
          </p>
        </div>

        {/* Footer Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn btn-secondary">
            İptal
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ minWidth: "120px" }}>
            {saved ? (
              "Kaydedildi!"
            ) : (
              <>
                <Save size={16} /> Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
