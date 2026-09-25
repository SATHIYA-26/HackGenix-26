"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function DemoModal({ isOpen, planName, onClose }) {
  const [name, setName] = useState("Mani (Founder)");
  const [email, setEmail] = useState("admin@manisbiriyani.com");
  const [businessType, setBusinessType] = useState("google_maps");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 700);
  };

  return (
    <div id="demoModal" className="cm-modal-backdrop active">
      <div className="cm-modal-card">
        <div className="cm-modal-header">
          <h3 className="cm-modal-title">Book a Live Reviewr Demo</h3>
          <button onClick={onClose} className="cm-close-btn">
            ×
          </button>
        </div>

        <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Schedule a 15-minute personalized walkthrough tailored to your business locations, YouTube channel, or Play
          Store mobile app.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              id="demoBookingName"
              placeholder="e.g. Mani R"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input
              type="email"
              className="form-input"
              id="demoBookingEmail"
              placeholder="admin@manisbiriyani.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Business Type / Target Channel</label>
            <select
              className="form-input"
              id="demoBookingType"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            >
              <option value="google_maps">Multi-Branch Google Maps Chain (e.g. Restaurants, Retail)</option>
              <option value="youtube">YouTube Creator Channel</option>
              <option value="play_store">Google Play Store Mobile App</option>
            </select>
          </div>

          {isSuccess && (
            <div
              id="demoBookingSuccess"
              className="flex items-center gap-2"
              style={{
                display: "flex",
                background: "var(--sentiment-pos-bg)",
                border: "1px solid var(--sentiment-pos-border)",
                color: "var(--sentiment-pos)",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              <Check className="w-4 h-4 shrink-0 text-[#059669]" />
              <span>Demo booking request received! Our VoC specialist will contact you shortly.</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" onClick={onClose} className="cm-btn cm-btn-outline" disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              id="demoBookingSubmitBtn"
              className="cm-btn cm-btn-primary flex items-center gap-1.5"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <>
                  <span className="cm-spinner"></span> Confirming...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Demo Scheduled!
                </>
              ) : planName ? (
                `Book Demo for ${planName} Plan →`
              ) : (
                "Confirm Demo Booking →"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
