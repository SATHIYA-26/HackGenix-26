'use client';

import React, { useState } from 'react';
import { ProblemCluster } from '@/lib/types';
import { Sparkles, MessageSquare, Copy, Check, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface KeyInsightsCardProps {
  selectedCluster?: ProblemCluster;
  onOpenEvidence: (cluster: ProblemCluster) => void;
  onOpenAiGenerator: (cluster?: ProblemCluster) => void;
}

export default function KeyInsightsCard({
  selectedCluster,
  onOpenEvidence,
  onOpenAiGenerator,
}: KeyInsightsCardProps) {
  const [copied, setCopied] = useState(false);

  // If a cluster is selected, show insights tailored to it, or show overall executive summary
  const isClusterSelected = !!selectedCluster;

  const handleCopyInsight = () => {
    const textToCopy = `Key Product Insights:
1. 240% increase in negative sentiment associated with UPI payment & order creation.
2. Concentrated on Android v4.2 with 89% negative sentiment ratio.
3. Projected impact: -4.2 points on Net Sentiment and ~$14.4k/mo revenue leakage.`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cm-card p-6 h-full flex flex-col justify-between relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50/50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Key insights</h2>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-200/50">
              <Sparkles size={11} />
              AI Synthesized
            </span>
          </div>

          <button
            onClick={handleCopyInsight}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            title="Copy insights to clipboard"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Editorial Text Paragraphs matching Chattermill's exact phrasing structure */}
        <div className="space-y-3.5 text-[13.5px] leading-relaxed text-slate-700 font-normal">
          <p>
            There has been a <strong className="font-bold text-slate-950">240% increase</strong> in negative sentiment
            associated with <strong className="font-bold text-slate-950 underline decoration-rose-300 decoration-2 underline-offset-2">UPI payment confirmation</strong> in the last 30 days.
          </p>

          <p>
            Customers on <strong className="font-bold text-slate-950">Android 4.2</strong> are expressing severe frustration with
            the <strong className="font-bold text-slate-950">order auto-cancelling after bank debit</strong>, with a{' '}
            <strong className="font-bold text-rose-600">89% negative mention ratio</strong> across Google Play and Zendesk.
          </p>

          <p>
            As a result <strong className="font-bold text-slate-950">Net Sentiment</strong> is projected to decrease by{' '}
            <strong className="font-bold text-slate-950">4.2 points</strong> and poses an estimated{' '}
            <strong className="font-bold text-rose-600">$14.4k/month</strong> in checkout revenue leakage.
          </p>
        </div>

        {/* Highlight Alert Box */}
        {selectedCluster && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-snug">
              <span className="font-bold text-slate-800">Active Cluster Focus: </span>
              {selectedCluster.title} ({selectedCluster.primaryPlatform} v{selectedCluster.primaryVersion})
              <div className="mt-1 font-mono text-[11px] text-slate-500">
                Priority: {selectedCluster.priority} · Score {selectedCluster.priorityScore}/100
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenAiGenerator(selectedCluster)}
          className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <MessageSquare size={13} />
          <span>Draft AI Response</span>
        </button>

        <button
          onClick={() => selectedCluster && onOpenEvidence(selectedCluster)}
          className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
        >
          <span>View 2,341 Quotes</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
}
