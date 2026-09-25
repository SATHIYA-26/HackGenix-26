'use client';

import React, { useState } from 'react';
import { ProblemCluster, FeedbackItem } from '@/lib/types';
import { feedbackEvidenceList } from '@/lib/data';
import { 
  X, 
  Search, 
  ExternalLink, 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  ShieldAlert, 
  Star, 
  Sliders, 
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

interface EvidenceDrawerProps {
  cluster: ProblemCluster | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAiGenerator: (cluster: ProblemCluster, initialQuote?: string) => void;
}

export default function EvidenceDrawer({
  cluster,
  isOpen,
  onClose,
  onOpenAiGenerator
}: EvidenceDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen || !cluster) return null;

  // Filter evidence related to this cluster or matching search
  const filteredEvidence = feedbackEvidenceList.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sourceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === null || item.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const handleCopyQuote = (quote: string, id: string) => {
    navigator.clipboard?.writeText(quote);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Surface */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 font-bold text-xs rounded-full flex items-center gap-1">
                <ShieldAlert size={12} />
                {cluster.priority} PRIORITY
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Score: {cluster.priorityScore}/100
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-600">
                {cluster.primaryPlatform} v{cluster.primaryVersion}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {cluster.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">
              {cluster.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Priority Scoring Formula Breakdown (Explainable ML pattern from README) */}
        <div className="px-6 py-3.5 bg-blue-50/50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-blue-900 flex items-center gap-1.5">
            <Sliders size={13} />
            Explainable Scoring Model:
          </span>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
            <span>Freq: <b className="text-slate-900">{cluster.scoringFactors.frequency}</b></span>
            <span>Sev: <b className="text-slate-900">{cluster.scoringFactors.severity}</b></span>
            <span>Growth: <b className="text-emerald-700 font-bold">{cluster.scoringFactors.growth}</b></span>
            <span>Impact: <b className="text-slate-900">{cluster.scoringFactors.userImpact}</b></span>
            <span>Sent: <b className="text-rose-700 font-bold">{cluster.scoringFactors.sentiment}</b></span>
          </div>
        </div>

        {/* AI Root Cause & Recommendation Strip */}
        <div className="p-4 mx-6 mt-4 rounded-xl bg-gradient-to-r from-blue-950 to-slate-900 text-white text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-blue-300 flex items-center gap-1.5">
              <Sparkles size={13} />
              AI Technical Diagnostic:
            </span>
            <button
              onClick={() => onOpenAiGenerator(cluster)}
              className="text-[11px] font-semibold text-blue-300 hover:text-white underline flex items-center gap-1"
            >
              <MessageSquare size={11} />
              Generate Response
            </button>
          </div>
          <p className="text-slate-200 leading-relaxed">
            {cluster.aiSummary}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
            💡 Recommended Action: {cluster.recommendedAction}
          </div>
        </div>

        {/* Evidence Search and Filters */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Traceable Customer Evidence ({filteredEvidence.length} of {cluster.feedbackCount.toLocaleString()} total)
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              BGE Vector Similarity ≥ 0.88
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search raw feedback quotes..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>

            {/* Rating Filter Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterRating(null)}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filterRating === null
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRating(1)}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-0.5 transition-all ${
                  filterRating === 1
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>1</span>
                <Star size={10} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>

        {/* Evidence Quote Cards List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
          {filteredEvidence.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No quotes match your search filter.
            </div>
          ) : (
            filteredEvidence.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-xs transition-all group"
              >
                {/* Source & Author Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold flex items-center gap-1">
                      {item.sourceName}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {item.author}
                    </span>
                    {item.location && (
                      <span className="text-[10px] text-slate-400">· {item.location}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Semantic match badge */}
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded-md">
                      {Math.round(item.semanticSimilarity * 100)}% Match
                    </span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                </div>

                {/* Verbatim Quote */}
                <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/60 p-2.5 rounded-lg border border-slate-100 italic">
                  &ldquo;{item.text}&rdquo;
                </p>

                {/* Footer Metadata & Actions */}
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
                    <span>Platform: {item.platform}</span>
                    {item.version && <span>· v{item.version}</span>}
                    <span>· Rating: {item.rating}/5 ⭐</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyQuote(item.text, item.id)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1"
                      title="Copy quote"
                    >
                      {copiedId === item.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      <span>{copiedId === item.id ? 'Copied' : 'Quote'}</span>
                    </button>
                    <button
                      onClick={() => onOpenAiGenerator(cluster, item.text)}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-md font-semibold transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={11} />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Traceability Engine: PostgreSQL + pgvector + BGE Embeddings
          </span>
          <button
            onClick={() => onOpenAiGenerator(cluster)}
            className="px-4 py-2 bg-[#1d39c4] hover:bg-[#162da0] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            <span>Generate Action Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
