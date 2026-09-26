"use client";

import { useState, useEffect } from "react";
import {
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Plus,
  Check,
  RefreshCw,
} from "lucide-react";
import { getRecommendations, createActionFromRecommendation } from "@/lib/api/recommendations";
import { getProblems } from "@/lib/api/problems";

export default function RecommendationsView({ onSelectProblem, onOpenCreateAction, company }) {
  const [recommendations, setRecommendations] = useState([]);
  const [problemsList, setProblemsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      getRecommendations(company?.id).catch(() => ({ data: [] })),
      getProblems({ accountId: company?.id }).catch(() => ({ data: [] })),
    ])
      .then(([recsRes, probsRes]) => {
        setRecommendations(recsRes?.data || []);
        setProblemsList(probsRes?.data || []);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [company?.id]);

  const handlePromoteToAction = async (rec, associatedProb) => {
    try {
      await createActionFromRecommendation(rec.id, {
        title: rec.title || rec.recommendation,
        owner: company?.ownerName || "Product Lead",
      });
      setActionSuccessMsg(`Created product action for "${rec.title || rec.recommendation}"`);
      setTimeout(() => setActionSuccessMsg(""), 4000);
    } catch (err) {
      if (onOpenCreateAction) {
        onOpenCreateAction(associatedProb || { id: rec.problemId, name: rec.problemName });
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">Product Decision Workspace</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Evidence-grounded action recommendations synthesized from recurring customer friction signals for {company?.name || "your account"}.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="p-1.5 rounded-lg border border-[#E5E1D8] bg-white text-[#71717A] hover:text-[#18181B] transition-colors self-start"
          title="Refresh recommendations"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs text-[#065F46] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#71717A]" />
          <p className="text-xs text-[#71717A]">Synthesizing recommendations from backend...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <Lightbulb className="w-8 h-8 mx-auto text-[#A1A1AA]" />
          <h3 className="text-sm font-bold text-[#18181B]">No Recommendations Generated</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            Recommendations are generated from recurring customer friction problem clusters. Connect your feedback channels or run NLP analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const associatedProb = problemsList.find(
              (p) => String(p.id) === String(rec.problemId)
            );

            return (
              <div
                key={rec.id}
                className="p-6 rounded-2xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-all space-y-4 shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Recommendation
                      </span>
                      <span className="text-xs text-[#71717A]">
                        Cluster: <strong>{rec.problemName}</strong>
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#18181B]">{rec.title}</h2>
                    {associatedProb && (
                      <p className="text-xs text-[#71717A]">
                        Category: {associatedProb.category || "Core Experience"} · Priority Score: {typeof associatedProb.priorityScore === "number" ? associatedProb.priorityScore.toFixed(2) : associatedProb.priorityScore}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#71717A] uppercase block">
                        Confidence
                      </span>
                      <span className="font-mono text-sm font-bold text-[#059669]">
                        {rec.confidencePercent || `${Math.round((rec.confidence || 0.85) * 100)}%`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rationale and Evidence Statement */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] text-xs space-y-1.5">
                  <p className="font-bold text-[#18181B]">Why this recommendation?</p>
                  <p className="text-[#3F3F46] leading-relaxed">{rec.reason || rec.rationale || "Directly mitigates high customer friction identified in user signals."}</p>
                </div>

                {/* Bottom Buttons */}
                <div className="pt-3 border-t border-[#ECE8E0] flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-[#71717A]">
                    Target Workspace: <strong>{company?.name}</strong>
                  </span>

                  <div className="flex items-center gap-2.5">
                    {rec.problemId && (
                      <button
                        onClick={() => onSelectProblem && onSelectProblem(rec.problemId)}
                        className="px-3.5 py-1.5 rounded-lg border border-[#E5E1D8] text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA] transition-colors"
                      >
                        Inspect Problem Dossier
                      </button>
                    )}
                    <button
                      onClick={() => handlePromoteToAction(rec, associatedProb)}
                      className="px-4 py-1.5 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Promote to Product Action</span>
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
