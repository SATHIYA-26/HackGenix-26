"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";

export default function LiveSyncModal({
  isOpen,
  onClose,
  currentAccount,
  currentAccountId,
  onAccountChange,
  onAddFeedbackItem,
}) {
  const [resourceId, setResourceId] = useState("ChIJN1t_tDeuEmsRUsoyG83frY4");
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const steps = [
    { text: `Connecting to ${currentAccount?.typeLabel || "API provider"}...` },
    { text: `Fetching customer reviews & comments for '${resourceId}'...` },
    { text: "Standardizing timestamps, star ratings, and metadata JSONB payload..." },
    { text: "Validating composite deduplication constraint (business_id + source + external_id)..." },
    { text: `Successfully synchronized reviews for ${currentAccount?.name || "Business"} into PostgreSQL!` },
  ];

  const handleRunSync = async () => {
    setIsSyncing(true);
    setIsComplete(false);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    const newComment = {
      id: `fb-live-${Date.now()}`,
      source: currentAccount.type,
      source_type: currentAccount.type === "youtube" ? "comment" : "review",
      branch: currentAccount.locations[1] || "Main",
      external_id: `ext_live_${Date.now()}`,
      author_name: "Verified Customer (Reviewr Live)",
      author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      rating: currentAccount.type === "youtube" ? null : 5.0,
      sentiment: "positive",
      sentiment_score: 98,
      theme: currentAccount.themes[0]?.name || "General Feedback",
      created_at: new Date().toISOString(),
      text: `[Live Ingestion Sync for ${currentAccount.name}]: Fresh customer review ingested and verified with zero duplicate collisions!`,
      source_url: "#",
      metadata: { verified: true },
    };

    onAddFeedbackItem(newComment);

    setIsComplete(true);
    setIsSyncing(false);

    setTimeout(() => {
      onClose();
      setCurrentStepIndex(-1);
      setIsComplete(false);
    }, 1200);
  };

  return (
    <div id="syncModal" className="cm-modal-backdrop active">
      <div className="cm-modal-card">
        <div className="cm-modal-header">
          <h3 className="cm-modal-title">Live Feedback Source Ingestion</h3>
          <button id="closeSyncModalBtn" className="cm-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Provide a Google Maps Place ID, YouTube Video ID, or Play Store Package Name. Reviewr ingests raw reviews,
          applies schema normalization, and enforces composite deduplication.
        </p>

        <div className="cm-form-group">
          <label className="cm-form-label">Resource Identifier / URL</label>
          <input
            type="text"
            id="syncVideoInput"
            className="cm-form-input"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            placeholder="e.g. Google Maps Place ID or YouTube Video ID"
          />
        </div>

        <div className="cm-form-group">
          <label className="cm-form-label">Target Reviewr Account</label>
          <select
            id="modalAccountSelect"
            className="cm-form-input"
            value={currentAccountId}
            onChange={(e) => onAccountChange(e.target.value)}
          >
            <option value="acc_manis">Mani's Dum Biriyani (Google Maps)</option>
            <option value="acc_chepauk">Chepauk Sports Store (Google Maps)</option>
            <option value="acc_spotify">Spotify (Google Play Store)</option>
            <option value="acc_mrwhosetheboss">Mrwhosetheboss (YouTube Channel)</option>
          </select>
        </div>

        {/* Animated Progress Steps */}
        {currentStepIndex >= 0 && (
          <div id="syncStepsBox" className="cm-sync-steps-box" style={{ display: "flex" }}>
            {steps.map((s, idx) => {
              let icon = <Clock className="w-3.5 h-3.5 inline text-[#71717A] shrink-0" />;
              let cls = "";
              if (idx < currentStepIndex || isComplete) {
                icon = <Check className="w-3.5 h-3.5 inline text-[#059669] shrink-0" />;
                cls = "done";
              } else if (idx === currentStepIndex) {
                icon = <span className="cm-spinner"></span>;
                cls = "active";
              }
              return (
                <div key={idx} className={`cm-step-line ${cls} flex items-center gap-2`}>
                  {icon} <span>{s.text}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
          <button onClick={onClose} className="cm-btn cm-btn-outline" disabled={isSyncing}>
            Cancel
          </button>
          <button
            id="runSyncBtn"
            className="cm-btn cm-btn-primary flex items-center gap-1.5"
            onClick={handleRunSync}
            disabled={isSyncing || isComplete}
          >
            {isSyncing ? (
              <>
                <span className="cm-spinner"></span> Ingesting...
              </>
            ) : isComplete ? (
              <>
                <Check className="w-3.5 h-3.5" /> Ingestion Complete
              </>
            ) : (
              "Start Live Ingestion"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
