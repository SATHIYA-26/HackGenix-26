'use client';

import React from 'react';
import { 
  Check, 
  X, 
  MessageSquare, 
  Play, 
  Headphones, 
  Star, 
  CreditCard 
} from 'lucide-react';
import { sourcesData } from '@/lib/data';
import { FeedbackSource } from '@/lib/types';

interface DataSourcePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSources: FeedbackSource[];
  toggleSource: (id: FeedbackSource) => void;
  selectAllSources: () => void;
  clearAllSources: () => void;
  showCalloutBubble: boolean;
  dismissCalloutBubble: () => void;
}

export default function DataSourcePopover({
  isOpen,
  onClose,
  selectedSources,
  toggleSource,
  selectAllSources,
  clearAllSources,
  showCalloutBubble,
  dismissCalloutBubble,
}: DataSourcePopoverProps) {
  if (!isOpen) return null;

  const getSourceIcon = (id: FeedbackSource) => {
    switch (id) {
      case 'surveys':
        return <MessageSquare size={14} className="text-cyan-600" />;
      case 'google_play':
        return <Play size={14} className="text-emerald-600 fill-emerald-600/20" />;
      case 'app_store':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600">
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
            <path d="M10 2c1 .5 2 2 2 5" />
          </svg>
        );
      case 'zendesk':
        return <Headphones size={14} className="text-teal-700" />;
      case 'trustpilot':
        return <Star size={14} className="text-emerald-700 fill-emerald-700/20" />;
      case 'youtube':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-rose-600">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'stripe_webhooks':
        return <CreditCard size={14} className="text-indigo-600" />;
      default:
        return <MessageSquare size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="absolute top-2 left-6 z-40 flex items-start gap-3 animate-in fade-in duration-200">
      {/* Popover Card */}
      <div className="w-64 bg-white rounded-2xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-4 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-800 tracking-tight">Data source</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={selectedSources.length === sourcesData.length ? clearAllSources : selectAllSources}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {selectedSources.length === sourcesData.length ? 'Clear' : 'Select all'}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Source List */}
        <div className="mt-2.5 space-y-1">
          {sourcesData.map((source) => {
            const isChecked = selectedSources.includes(source.id);
            return (
              <label
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer text-xs font-medium transition-colors ${
                  isChecked ? 'bg-blue-50/40 text-slate-800' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">{getSourceIcon(source.id)}</span>
                    <span className="font-semibold text-slate-700">{source.name}</span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {source.totalIngested.toLocaleString()}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>{selectedSources.length} sources active</span>
          <span className="text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Syncing
          </span>
        </div>
      </div>

      {/* Chattermill Signature Electric Blue Callout Bubble with Caret */}
      {showCalloutBubble && (
        <div className="relative mt-6 max-w-xs bg-[#2563eb] text-white p-4 rounded-2xl shadow-xl shadow-blue-500/20 text-xs font-normal leading-relaxed animate-in fade-in slide-in-from-left-2 duration-300">
          {/* Triangular Caret pointing left */}
          <div className="absolute top-5 -left-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-[#2563eb] border-b-[8px] border-b-transparent" />

          {/* Dismiss button */}
          <button
            onClick={dismissCalloutBubble}
            className="absolute top-2.5 right-2.5 text-blue-200 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>

          <p className="pr-3 text-[13px] leading-snug">
            All feedback channels are consolidated and analyzed in one place to give a{' '}
            <strong className="font-bold text-white">complete picture</strong> of what customers care about.
          </p>
        </div>
      )}
    </div>
  );
}
