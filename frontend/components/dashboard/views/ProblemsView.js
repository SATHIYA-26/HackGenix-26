"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Filter, Search, LayoutGrid, List, ChevronRight } from "lucide-react";
import { PROBLEMS } from "../data/intelligenceMockData";

export default function ProblemsView({ onSelectProblem, company }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"

  const problemsList = company?.problems && company.problems.length > 0 ? company.problems : PROBLEMS;

  const filteredProblems = problemsList.filter((p) => {
    if (activeTab !== "all" && p.status !== activeTab) return false;
    if (selectedProduct !== "all" && p.category !== selectedProduct) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchExpl = (p.shortExplanation || "").toLowerCase().includes(q);
      const matchProd = (p.product || "").toLowerCase().includes(q);
      if (!matchName && !matchExpl && !matchProd) return false;
    }
    return true;
  });

  const categories = Array.from(new Set(problemsList.map((p) => p.category)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">Customer Problems</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Discover what customers are struggling with across all ingestion channels.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-[#E5E1D8] bg-white p-0.5 self-start">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "table" ? "bg-[#18181B] text-white" : "text-[#71717A] hover:text-[#18181B]"
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "grid" ? "bg-[#18181B] text-white" : "text-[#71717A] hover:text-[#18181B]"
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar: Status Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All", count: PROBLEMS.length },
            { id: "emerging", label: "Emerging", count: PROBLEMS.filter((p) => p.status === "emerging").length },
            { id: "growing", label: "Growing", count: PROBLEMS.filter((p) => p.status === "growing").length },
            { id: "critical", label: "Critical", count: PROBLEMS.filter((p) => p.status === "critical").length },
            { id: "resolved", label: "Resolved", count: PROBLEMS.filter((p) => p.status === "resolved").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-[#18181B] text-white"
                  : "bg-white text-[#71717A] border border-[#E5E1D8] hover:bg-[#F4F1EA]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? "bg-[#27272A] text-white" : "bg-[#F4F1EA] text-[#71717A]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="bg-white border border-[#E5E1D8] focus:border-[#18181B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#18181B] outline-none"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="bg-white border border-[#E5E1D8] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] outline-none"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-[#E5E1D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#71717A] font-semibold uppercase tracking-wider border-b border-[#ECE8E0]">
                <tr>
                  <th className="px-5 py-3.5">Problem & Core Why</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Mentions</th>
                  <th className="px-5 py-3.5">Growth</th>
                  <th className="px-5 py-3.5">Sentiment</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8E0]">
                {filteredProblems.map((prob) => (
                  <tr
                    key={prob.id}
                    onClick={() => onSelectProblem(prob.id)}
                    className="hover:bg-[#FBF9F5] cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4 max-w-sm">
                      <p className="font-bold text-[#18181B] group-hover:text-[#4F46E5] transition-colors">
                        {prob.name}
                      </p>
                      <p className="text-[11px] text-[#71717A] line-clamp-1 mt-0.5">
                        {prob.shortExplanation}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-[#71717A] whitespace-nowrap">
                      <span className="bg-[#F4F1EA] px-2 py-0.5 rounded text-[11px] font-medium text-[#3F3F46]">
                        {prob.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#18181B] whitespace-nowrap">
                      {prob.feedbackCount}
                    </td>
                    <td className="px-5 py-4 font-bold whitespace-nowrap">
                      <span
                        className={
                          prob.growthRate > 0.3
                            ? "text-[#E11D48]"
                            : prob.growthRate > 0
                            ? "text-[#D97706]"
                            : "text-[#059669]"
                        }
                      >
                        {prob.growthRate > 0 ? "↑" : "↓"} {prob.growthLabel}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-[#E11D48]">
                      {Math.round(prob.negativeSentiment * 100)}% Neg
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#18181B] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#ECE8E0]">
                        {prob.priorityScore}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          prob.status === "critical"
                            ? "bg-[#FFF1F2] text-[#E11D48]"
                            : prob.status === "emerging"
                            ? "bg-[#FEF3C7] text-[#D97706]"
                            : prob.status === "resolved"
                            ? "bg-[#ECFDF5] text-[#059669]"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {prob.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className="text-[11px] font-bold text-[#18181B] group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                        Inspect →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProblems.map((prob) => (
            <div
              key={prob.id}
              onClick={() => onSelectProblem(prob.id)}
              className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      prob.status === "critical"
                        ? "bg-[#FFF1F2] text-[#E11D48]"
                        : prob.status === "emerging"
                        ? "bg-[#FEF3C7] text-[#D97706]"
                        : prob.status === "resolved"
                        ? "bg-[#ECFDF5] text-[#059669]"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {prob.status}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#18181B]">
                    Score {prob.priorityScore}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#18181B] group-hover:text-[#4F46E5] transition-colors">
                    {prob.name}
                  </h3>
                  <p className="text-xs text-[#71717A] mt-1 line-clamp-2 leading-relaxed">
                    {prob.shortExplanation}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#ECE8E0] text-center">
                  <div className="bg-[#FAF8F5] p-2 rounded">
                    <p className="text-[10px] text-[#71717A]">Volume</p>
                    <p className="text-xs font-bold text-[#18181B]">{prob.feedbackCount}</p>
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded">
                    <p className="text-[10px] text-[#71717A]">Growth</p>
                    <p className="text-xs font-bold text-[#E11D48]">{prob.growthLabel}</p>
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded">
                    <p className="text-[10px] text-[#71717A]">Negative</p>
                    <p className="text-xs font-bold text-[#E11D48]">
                      {Math.round(prob.negativeSentiment * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#ECE8E0] flex items-center justify-between text-[11px] text-[#71717A]">
                <span>{prob.product} · {prob.platform}</span>
                <span className="font-bold text-[#18181B] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  View dossier →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
