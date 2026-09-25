'use client';

import React, { useState } from 'react';
import { ProblemCluster, PriorityLevel } from '@/lib/types';
import { 
  Layers, 
  Search, 
  TrendingUp, 
  Filter, 
  Sliders, 
  ExternalLink, 
  Sparkles, 
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ProblemDiscoveryViewProps {
  clusters: ProblemCluster[];
  onOpenEvidence: (cluster: ProblemCluster) => void;
  onOpenAiGenerator: (cluster: ProblemCluster) => void;
}

export default function ProblemDiscoveryView({
  clusters,
  onOpenEvidence,
  onOpenAiGenerator
}: ProblemDiscoveryViewProps) {
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClusters = clusters.filter((item) => {
    const matchesPriority = selectedPriority === 'ALL' || item.priority === selectedPriority;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: ProblemCluster['status']) => {
    switch (status) {
      case 'investigating':
        return { label: 'Investigating', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'resolved':
        return { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'active':
        return { label: 'Active Issue', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
            <Layers size={14} />
            <span>UNSUPERVISED SEMANTIC CLUSTERING (BERTopic + HDBSCAN)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Problem Cluster Discovery & Priority Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            The platform groups related customer feedback across disparate platforms without requiring predefined tags, calculating explainable priority scores for evidence-backed decisions.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
            <div className="text-base font-bold text-slate-900 font-mono">{clusters.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Discovered Clusters</div>
          </div>
          <div className="px-3.5 py-2 bg-rose-50 border border-rose-200/60 rounded-xl text-center">
            <div className="text-base font-bold text-rose-700 font-mono">
              {clusters.filter(c => c.priority === 'CRITICAL').length}
            </div>
            <div className="text-[10px] text-rose-600 font-medium">Critical Action Needed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Priority Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-xl shadow-xs self-start">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPriority === p
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems, platforms, keywords..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all"
          />
        </div>
      </div>

      {/* Problem Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClusters.map((cluster) => {
          const status = getStatusBadge(cluster.status);

          return (
            <div
              key={cluster.id}
              className="cm-card p-5 flex flex-col justify-between hover:border-blue-300 transition-all group"
            >
              <div>
                {/* Header row: Priority and Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityBadge(cluster.priority)}`}>
                    {cluster.priority} · {cluster.priorityScore}/100
                  </span>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Problem Title & Category */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {cluster.title}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {cluster.category}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                  {cluster.description}
                </p>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Volume</div>
                    <div className="text-xs font-bold text-slate-800 font-mono">
                      {cluster.feedbackCount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Growth</div>
                    <div className="text-xs font-bold text-emerald-600 font-mono">
                      +{cluster.growthRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Negativity</div>
                    <div className="text-xs font-bold text-rose-600 font-mono">
                      {cluster.negativeSentimentRate}%
                    </div>
                  </div>
                </div>

                {/* Scoring factors preview */}
                <div className="mt-3 text-[10px] text-slate-500 font-mono flex items-center justify-between px-1">
                  <span>Platform: <b className="text-slate-700">{cluster.primaryPlatform}</b></span>
                  <span>Ver: <b className="text-slate-700">{cluster.primaryVersion}</b></span>
                  <span>Est. Loss: <b className="text-rose-600">${(cluster.estimatedRevenueImpactMonthly/1000).toFixed(1)}k/mo</b></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenEvidence(cluster)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>Evidence Traces</span>
                  <ArrowUpRight size={12} />
                </button>

                <button
                  onClick={() => onOpenAiGenerator(cluster)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Sparkles size={12} />
                  <span>AI Response</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
