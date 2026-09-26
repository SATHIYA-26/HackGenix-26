"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  TrendingDown,
  Activity,
  Check,
  RefreshCw,
  Play,
  Rocket,
  BarChart2,
  ClipboardList,
  Trash2,
} from "lucide-react";
import {
  getActions,
  startActionImplementation,
  releaseAction,
  measureActionImpact,
  deleteAction,
} from "@/lib/api/actions";

export default function ActionsView({ onSelectProblem, company }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionsList, setActionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchActions = () => {
    setIsLoading(true);
    getActions({ accountId: company?.id })
      .then((res) => {
        setActionsList(res?.data || []);
      })
      .catch((err) => {
        console.warn("Actions fetch error:", err);
        setActionsList([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchActions();
  }, [company?.id]);

  const handleStart = async (act) => {
    setProcessingId(act.id);
    try {
      await startActionImplementation(act.actionId || act.id, company?.ownerName || "Engineering Lead");
      setStatusMessage(`Action "${act.title}" moved to In Progress`);
      fetchActions();
    } catch (err) {
      console.error("Start action error:", err);
    } finally {
      setProcessingId(null);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const handleRelease = async (act) => {
    setProcessingId(act.id);
    try {
      await releaseAction(act.actionId || act.id, "v1.2.0-patch");
      setStatusMessage(`Action "${act.title}" released to production`);
      fetchActions();
    } catch (err) {
      console.error("Release action error:", err);
    } finally {
      setProcessingId(null);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const handleMeasure = async (act) => {
    setProcessingId(act.id);
    try {
      await measureActionImpact(act.actionId || act.id);
      setStatusMessage(`Post-release impact measured for "${act.title}"`);
      fetchActions();
    } catch (err) {
      console.error("Measure impact error:", err);
    } finally {
      setProcessingId(null);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const handleDelete = async (act) => {
    if (typeof window !== "undefined" && !window.confirm(`Are you sure you want to remove the action "${act.title}"?`)) {
      return;
    }
    setProcessingId(act.id);
    try {
      await deleteAction(act.actionId || act.id);
      setStatusMessage(`Action "${act.title}" removed.`);
      fetchActions();
    } catch (err) {
      console.warn("Delete action error:", err);
      setActionsList((prev) => prev.filter((a) => a.id !== act.id));
    } finally {
      setProcessingId(null);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const filteredActions = actionsList.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">Product Decision Tracking</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Closed-loop resolution tracking: monitor implementation, deployment, and post-fix sentiment impact for {company?.name || "your account"}.
          </p>
        </div>

        <button
          onClick={fetchActions}
          disabled={isLoading}
          className="p-1.5 rounded-lg border border-[#E5E1D8] bg-white text-[#71717A] hover:text-[#18181B] transition-colors self-start"
          title="Refresh actions"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs text-[#065F46] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {["all", "Planned", "In Progress", "Released"].map((st) => (
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
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#71717A]" />
          <p className="text-xs text-[#71717A]">Loading product actions from backend...</p>
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <ClipboardList className="w-8 h-8 mx-auto text-[#A1A1AA]" />
          <h3 className="text-sm font-bold text-[#18181B]">No Closed-Loop Actions Found</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            {actionsList.length === 0
              ? "No actions have been created for this account yet. Convert any problem cluster or recommendation into an action."
              : "No actions match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredActions.map((act) => {
            const isProcessing = processingId === act.id;

            return (
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
                      {act.problemId && (
                        <span
                          onClick={() => onSelectProblem && onSelectProblem(act.problemId)}
                          className="text-xs text-[#4F46E5] hover:underline cursor-pointer"
                        >
                          Origin: {act.problemName}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-[#18181B]">{act.title}</h2>
                    <p className="text-xs text-[#71717A]">{act.targetMetric}</p>
                  </div>

                  <div className="text-right text-xs text-[#71717A] shrink-0">
                    <p>
                      Assignee: <strong>{act.owner || act.assignee}</strong>
                    </p>
                    <p className="text-[11px] mt-0.5">
                      Created: {act.startedDate}
                      {act.targetDate && ` · Target: ${act.targetDate}`}
                    </p>
                  </div>
                </div>

                {/* Post-Fix Impact Measurement if Released */}
                {act.postMonitoring && (
                  <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
                        <Activity className="w-4 h-4" />
                        <span>Post-Fix Impact Measurement</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {act.milestones?.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#3F3F46] bg-[#FAF8F5] p-2 rounded-lg border border-[#ECE8E0]">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            m.done ? "bg-[#7C3AED] text-white" : "bg-[#E5E1D8] text-[#71717A]"
                          }`}
                        >
                          {m.done ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                        </span>
                        <span className={m.done ? "line-through text-[#71717A]" : "font-medium"}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Lifecycle Controls */}
                <div className="pt-3 text-[11px] text-[#71717A] flex items-center justify-between border-t border-[#ECE8E0] flex-wrap gap-2">
                  {act.problemId ? (
                    <button
                      onClick={() => onSelectProblem && onSelectProblem(act.problemId)}
                      className="text-[#4F46E5] font-semibold hover:underline flex items-center gap-1"
                    >
                      Inspect Problem Origin →
                    </button>
                  ) : <span />}

                  <div className="flex items-center gap-2">
                    {act.status === "Planned" && (
                      <button
                        onClick={() => handleStart(act)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start Work</span>
                      </button>
                    )}
                    {act.status === "In Progress" && (
                      <button
                        onClick={() => handleRelease(act)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-[#059669] text-white text-xs font-semibold hover:bg-[#047857] transition-colors flex items-center gap-1.5"
                      >
                        <Rocket className="w-3 h-3" />
                        <span>Release to Prod</span>
                      </button>
                    )}
                    {act.status === "Released" && (
                      <button
                        onClick={() => handleMeasure(act)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-colors flex items-center gap-1.5"
                      >
                        <BarChart2 className="w-3 h-3" />
                        <span>Re-measure Impact</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(act)}
                      disabled={isProcessing}
                      title="Delete action"
                      className="p-1.5 rounded-lg border border-[#E5E1D8] text-[#71717A] hover:text-[#DC2626] hover:border-[#FECACA] hover:bg-[#FEF2F2] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
