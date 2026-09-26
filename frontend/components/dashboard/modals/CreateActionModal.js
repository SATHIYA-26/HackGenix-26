"use client";

import { useState } from "react";
import { X, CheckCircle2, ArrowRight, Calendar, User, Target, Sparkles, RefreshCw } from "lucide-react";
import { createAction } from "@/lib/api/actions";

export default function CreateActionModal({ isOpen, problem, onClose, onActionCreated, company }) {
  const [title, setTitle] = useState(
    problem ? `Investigate & resolve ${problem.name}` : "Investigate customer feedback friction"
  );
  const [owner, setOwner] = useState(company?.ownerName || "Engineering Team");
  const [targetDate, setTargetDate] = useState("2026-10-05");
  const [targetMetric, setTargetMetric] = useState("Deflect 80%+ of related negative customer complaints");
  const [status, setStatus] = useState("In Progress");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const problemNumericId = parseInt(String(problem?.id || "1").replace(/\D/g, "") || "1", 10);

    try {
      await createAction({
        problem_id: problemNumericId,
        title,
        description: targetMetric,
        assignee: owner,
        account_id: company?.id || "acc_manis",
      });
    } catch (err) {
      console.warn("Backend action persistence notice:", err);
    }

    setIsSubmitting(false);

    if (onActionCreated) {
      onActionCreated({
        id: `act-${Date.now()}`,
        title,
        problemId: problem ? problem.id : "prob-1",
        problemName: problem ? problem.name : "Customer Issue",
        status,
        owner,
        ownerRole: "Product & Engineering",
        startedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        targetDate: new Date(targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        targetMetric,
        sourceTrace: `Traced to ${problem ? problem.feedbackCount : 127} customer voices`,
        milestones: [
          { name: "Root cause analysis with engineering team", done: true },
          { name: "Build prototype fix & unit tests", done: false },
          { name: "Deploy to staging canary environment", done: false },
          { name: "Post-release customer feedback monitoring", done: false },
        ],
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E1D8] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ECE8E0] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <h2 className="text-sm font-bold text-[#18181B]">Create Product Action Decision</h2>
            <p className="text-xs text-[#71717A]">
              Convert evidence-backed customer signal into a tracked roadmap deliverable
            </p>
          </div>
          <button onClick={onClose} className="text-[#71717A] hover:text-[#18181B] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#18181B]">Action Title</label>
            <input
              type="text"
              className="w-full bg-[#FBF9F5] border border-[#E5E1D8] focus:border-[#18181B] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#71717A]" /> Action Owner
              </label>
              <select
                className="w-full bg-[#FBF9F5] border border-[#E5E1D8] rounded-xl px-3 py-2 text-xs text-[#18181B] outline-none"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                <option value="Mani (Founder & Operations)">Mani (Founder & Operations)</option>
                <option value="Murali (Store General Manager)">Murali (Chepauk Store GM)</option>
                <option value="Pooja Sundaram (Store CX Lead)">Pooja Sundaram (H&M CX Lead)</option>
                <option value="VJ Sidhu (Creator & Producer)">VJ Sidhu (Creator & Producer)</option>
                <option value="Elena Rostova (Android Core PM)">Elena Rostova (Spotify PM)</option>
                <option value="Operations & Kitchen Team">Store Operations Team</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#71717A]" /> Target Release
              </label>
              <input
                type="date"
                className="w-full bg-[#FBF9F5] border border-[#E5E1D8] rounded-xl px-3 py-2 text-xs text-[#18181B] outline-none"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#71717A]" /> Target Measurable Outcome
            </label>
            <input
              type="text"
              className="w-full bg-[#FBF9F5] border border-[#E5E1D8] focus:border-[#18181B] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] outline-none"
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              placeholder="e.g. Deflect 80%+ of related negative customer complaints"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#18181B]">Initial Decision Status</label>
            <div className="grid grid-cols-3 gap-2">
              {["Investigating", "Planned", "In Progress"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    status === s
                      ? "border-[#18181B] bg-[#18181B] text-white"
                      : "border-[#E5E1D8] bg-white text-[#71717A] hover:bg-[#F4F1EA]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0" />
            <p className="text-xs text-[#71717A]">
              Reviewr will automatically start <strong>Post-Fix Monitoring</strong> once marked as Released, tracking sentiment shifts before vs. after.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-[#ECE8E0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E5E1D8] text-xs font-semibold text-[#71717A] hover:bg-[#F4F1EA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Commit Action Decision</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
