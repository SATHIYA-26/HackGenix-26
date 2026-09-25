"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Calendar, ArrowRight, User, TrendingDown, ShieldCheck, Activity } from "lucide-react";
import { ACTIONS } from "../data/intelligenceMockData";

export default function ActionsView({ onSelectProblem }) {
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredActions = ACTIONS.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#ECE8E0] pb-6">
        <h1 className="text-2xl font-bold text-[#18181B] font-serif">Product Decision Tracking</h1>
        <p className="text-xs text-[#71717A] mt-1">
          Close the feedback loop by tracking what the product team decided to fix and measuring outcomes after release.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {["all", "In Progress", "Planned", "Released"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === st
                ? "bg-[#18181B] text-white"
                : "bg-white text-[#71717A] border border-[#E5E1D8] hover:bg-[#F4F1EA]"
            }`}
          >
            {st === "all" ? "All Decisions" : st}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div className="space-y-5">
        {filteredActions.map((act) => (
          <div
            key={act.id}
            className="p-6 rounded-2xl border border-[#E5E1D8] bg-white space-y-4 shadow-xs"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      act.status === "Released"
                        ? "bg-[#ECFDF5] text-[#059669]"
                        : act.status === "In Progress"
                        ? "bg-[#EFF6FF] text-[#2563EB]"
                        : "bg-[#FEF3C7] text-[#D97706]"
                    }`}
                  >
                    {act.status}
                  </span>
                  <span
                    onClick={() => onSelectProblem(act.problemId)}
                    className="text-xs text-[#4F46E5] hover:underline cursor-pointer"
                  >
                    Origin: {act.problemName}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#18181B]">{act.title}</h2>
                <p className="text-xs text-[#71717A]">{act.targetMetric}</p>
              </div>

              <div className="text-right text-xs text-[#71717A] shrink-0">
                <p>Owner: <strong>{act.owner}</strong></p>
                <p className="text-[11px] mt-0.5">Started {act.startedDate} · Due {act.targetDate}</p>
              </div>
            </div>

            {/* Section 31: Post-Fix Monitoring Highlight (If Released) */}
            {act.postMonitoring && (
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
                    <Activity className="w-4 h-4" />
                    <span>POST-FIX IMPACT MEASUREMENT (Observed Feedback Shift)</span>
                  </div>
                  <span className="text-xs font-bold text-[#059669] bg-white px-2 py-0.5 rounded border border-[#A7F3D0]">
                    {act.postMonitoring.sentimentLift}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg border border-[#A7F3D0]/60">
                    <span className="text-[10px] text-[#71717A] uppercase block">Before Release</span>
                    <span className="text-sm font-bold text-[#18181B]">{act.postMonitoring.beforeVolume}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#A7F3D0]/60">
                    <span className="text-[10px] text-[#71717A] uppercase block">After Release</span>
                    <span className="text-sm font-bold text-[#059669]">{act.postMonitoring.afterVolume}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#A7F3D0]/60">
                    <span className="text-[10px] text-[#71717A] uppercase block">Observed Change</span>
                    <span className="text-sm font-bold text-[#059669] flex items-center justify-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {act.postMonitoring.changePercent}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#065F46] leading-relaxed">
                  {act.postMonitoring.observedResult}
                </p>
              </div>
            )}

            {/* Milestones */}
            <div className="space-y-1.5 pt-2">
              <p className="text-[11px] font-bold text-[#71717A] uppercase">Implementation Milestones:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {act.milestones?.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[#3F3F46]">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        m.done ? "bg-[#059669] text-white" : "bg-[#F4F1EA] text-[#71717A]"
                      }`}
                    >
                      {m.done ? "✓" : idx + 1}
                    </span>
                    <span className={m.done ? "line-through text-[#71717A]" : ""}>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#71717A] flex items-center justify-between border-t border-[#ECE8E0]">
              <span>{act.sourceTrace}</span>
              <button
                onClick={() => onSelectProblem(act.problemId)}
                className="text-[#4F46E5] font-semibold hover:underline flex items-center gap-1"
              >
                Inspect Problem &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
