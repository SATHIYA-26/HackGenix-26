'use client';

import React from 'react';
import { sourcesData } from '@/lib/data';
import { 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  Cpu, 
  Zap, 
  ArrowRight, 
  Play, 
  Headphones, 
  Star, 
  CreditCard,
  MessageSquare
} from 'lucide-react';

export default function IntegrationsView() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'play': return <Play size={16} className="text-emerald-600 fill-emerald-600/20" />;
      case 'apple': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600">
          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
          <path d="M10 2c1 .5 2 2 2 5" />
        </svg>
      );
      case 'headphones': return <Headphones size={16} className="text-teal-700" />;
      case 'star': return <Star size={16} className="text-amber-500 fill-amber-500/20" />;
      case 'youtube': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-rose-600">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
      case 'credit-card': return <CreditCard size={16} className="text-indigo-600" />;
      default: return <MessageSquare size={16} className="text-blue-600" />;
    }
  };

  const pipelineStages = [
    { title: 'Source Connectors', desc: 'OAuth & Webhooks', stat: '7 Connected' },
    { title: 'Worker Ingestion', desc: 'Celery + Redis Queue', stat: '0.4s avg latency' },
    { title: 'NLP Extraction', desc: 'RoBERTa + DistilBERT', stat: '99.4% accuracy' },
    { title: 'Vector Embeddings', desc: 'BGE Embeddings', stat: '51.5k vectors in pgvector' },
    { title: 'Cluster Engine', desc: 'BERTopic + HDBSCAN', stat: '6 Active Clusters' },
    { title: 'Insight Reasoning', desc: 'LLM Evidence Synthesis', stat: '100% Traceable' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-badge" />
            <span>REAL-TIME INGESTION & PIPELINE STATUS</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Connectors & AI Processing Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Continuously collects feedback from app stores, support queues, reviews, and community channels. Feedback is normalized, embedded with BGE models, and clustered using vector distance.
          </p>
        </div>

        <button
          onClick={() => alert('Triggering instant background sync on all 7 connectors...')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 self-start md:self-auto transition-all shadow-xs"
        >
          <RefreshCw size={13} />
          <span>Sync All Sources Now</span>
        </button>
      </div>

      {/* End-to-End Pipeline Visualization */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-x-auto">
        <div className="text-xs font-bold text-blue-400 mb-4 flex items-center gap-2">
          <Zap size={14} />
          <span>END-TO-END FEEDBACK PROCESSING PIPELINE</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 min-w-[700px]">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage.title}
              className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 relative flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold block mb-1">
                  0{idx + 1} STAGE
                </span>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {stage.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {stage.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/80 text-[10px] font-mono text-emerald-400 font-semibold">
                {stage.stat}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Feedback Sources List */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Database size={15} className="text-slate-600" />
          <span>Active Ingestion Connectors ({sourcesData.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sourcesData.map((source) => (
            <div
              key={source.id}
              className="cm-card p-4 flex items-center justify-between hover:border-blue-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                  {getIcon(source.iconName)}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {source.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {source.category} · Synced {source.lastSync}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 font-mono">
                  {source.totalIngested.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Sync
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
