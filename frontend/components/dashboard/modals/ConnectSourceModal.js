"use client";

import { useState } from "react";
import { X, CheckCircle2, ArrowRight, ArrowLeft, Radio, Globe, Video, Play, MessageSquare, Plus, ShieldCheck } from "lucide-react";

const AVAILABLE_SOURCES = [
  { id: "youtube", name: "YouTube Creator Channel", icon: Video, desc: "Ingest video comments, community replies, and sponsor feedback." },
  { id: "google_maps", name: "Google Maps & Places", icon: Globe, desc: "Sync branch reviews, star ratings, and photo comment text." },
  { id: "play_store", name: "Google Play Store", icon: Play, desc: "Analyze Android app reviews, version telemetry, and bug reports." },
  { id: "support", name: "Zendesk & Support Desk", icon: MessageSquare, desc: "Import CSAT tickets, negative chat logs, and escalation tags." },
  { id: "api", name: "Custom Webhook / REST API", icon: Plus, desc: "Send in-house transactional survey JSON payloads in real time." },
];

export default function ConnectSourceModal({ isOpen, onClose, onSourceConnected }) {
  const [step, setStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState("youtube");
  const [resourceId, setResourceId] = useState("@manis_dum_biriyani");
  const [syncFreq, setSyncFreq] = useState("realtime");
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setStep(4); // Success step
      if (onSourceConnected) {
        onSourceConnected({
          name: AVAILABLE_SOURCES.find((s) => s.id === selectedSource)?.name || "Connected Source",
          type: selectedSource,
        });
      }
    }, 1000);
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E1D8] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ECE8E0] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <h2 className="text-sm font-bold text-[#18181B]">Connect Feedback Source</h2>
            <p className="text-xs text-[#71717A]">
              Step {step} of 3: {step === 1 ? "Select Source" : step === 2 ? "Configuration" : step === 3 ? "Sync Settings" : "Complete"}
            </p>
          </div>
          <button onClick={handleClose} className="text-[#71717A] hover:text-[#18181B] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Select Source */}
        {step === 1 && (
          <div className="p-6 space-y-3">
            <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wide">
              Select Customer Channel
            </p>
            <div className="space-y-2">
              {AVAILABLE_SOURCES.map((src) => {
                const Icon = src.icon;
                const isSelected = selectedSource === src.id;
                return (
                  <div
                    key={src.id}
                    onClick={() => setSelectedSource(src.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? "border-[#18181B] bg-[#FBF9F5] shadow-sm"
                        : "border-[#E5E1D8] hover:border-[#D6D1C6] bg-white"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-[#18181B] text-white" : "bg-[#F4F1EA] text-[#3F3F46]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#18181B]">{src.name}</p>
                      <p className="text-[11px] text-[#71717A]">{src.desc}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#18181B] bg-[#18181B]" : "border-[#D6D1C6]"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Connection Details */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B]">
                Resource Identifier / Handle / URL
              </label>
              <input
                type="text"
                className="w-full bg-[#FBF9F5] border border-[#E5E1D8] focus:border-[#18181B] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] outline-none"
                placeholder="e.g. YouTube Channel ID, Google Place CID, or Play Store Package"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
              />
              <p className="text-[11px] text-[#71717A]">
                Reviewr normalizes public customer reviews and deduplicates duplicate mentions automatically.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B]">Branch / Segment Tag</label>
              <input
                type="text"
                className="w-full bg-[#FBF9F5] border border-[#E5E1D8] focus:border-[#18181B] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] outline-none"
                placeholder="e.g. Flagship Store or Android Production"
                defaultValue="Primary Workspace Tag"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#7C3AED] shrink-0" />
              <p className="text-xs text-[#4F46E5]">
                OAuth 2.0 and API keys are encrypted at rest using AES-256 and never shared.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Sync Settings */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wide">
              Automated Ingestion Frequency
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "realtime", label: "Live Webhook", sub: "Sub-minute sync" },
                { id: "hourly", label: "Hourly Digest", sub: "Every 60 mins" },
                { id: "daily", label: "Daily Batch", sub: "Every 24 hours" },
              ].map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSyncFreq(f.id)}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                    syncFreq === f.id
                      ? "border-[#18181B] bg-[#FBF9F5] font-semibold"
                      : "border-[#E5E1D8] hover:border-[#D6D1C6] text-[#71717A]"
                  }`}
                >
                  <p className="text-xs text-[#18181B]">{f.label}</p>
                  <p className="text-[10px] text-[#71717A] mt-0.5">{f.sub}</p>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-2">
              <p className="text-xs font-bold text-[#18181B]">Pipeline Safeguards:</p>
              <div className="text-[11px] text-[#71717A] space-y-1">
                <p>✓ Composite deduplication: <code>(business_id + source + external_id)</code></p>
                <p>✓ Automated spam & bot suppression filter enabled</p>
                <p>✓ Aspect-Based Sentiment (ABSA) model applied during ingestion</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18181B]">Source Successfully Connected!</h3>
              <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">
                Customer feedback signals are now streaming into Reviewr. Normalized review clusters will appear in your Problems & Insights feeds.
              </p>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="px-6 py-3.5 border-t border-[#ECE8E0] flex items-center justify-between bg-[#FAF8F5]">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-semibold text-[#71717A] hover:text-[#18181B] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 rounded-lg border border-[#E5E1D8] text-xs font-semibold text-[#71717A] hover:bg-[#F4F1EA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isConnecting}
                className="px-4 py-2 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] flex items-center gap-1.5"
              >
                {isConnecting ? (
                  <>
                    <span className="cm-spinner"></span> Connecting...
                  </>
                ) : step === 3 ? (
                  "Confirm & Connect Source"
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] ml-auto"
            >
              Go to Workspace
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
