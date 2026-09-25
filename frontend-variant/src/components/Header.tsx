'use client';

import React, { useState } from 'react';
import { 
  Star, 
  RotateCcw, 
  Share2, 
  Filter, 
  Calendar, 
  Check, 
  Download,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  title: string;
  selectedSourcesCount: number;
  totalSourcesCount: number;
  isPopoverOpen: boolean;
  setIsPopoverOpen: (open: boolean) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  onSave?: () => void;
  onOpenAiGenerator?: () => void;
}

export default function Header({
  title,
  selectedSourcesCount,
  totalSourcesCount,
  isPopoverOpen,
  setIsPopoverOpen,
  dateRange,
  setDateRange,
  onSave,
  onOpenAiGenerator
}: HeaderProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const dateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Year to Date'];

  const handleSaveClick = () => {
    setIsSaved(true);
    if (onSave) onSave();
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <header className="h-16 px-6 bg-transparent flex items-center justify-between border-b border-slate-200/50 sticky top-0 z-10 backdrop-blur-md">
      {/* Left: Star & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsStarred(!isStarred)}
          className={`p-1.5 rounded-lg transition-colors ${
            isStarred ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-slate-600'
          }`}
          title={isStarred ? 'Starred dashboard' : 'Star this dashboard'}
        >
          <Star size={18} fill={isStarred ? 'currentColor' : 'none'} strokeWidth={1.8} />
        </button>

        <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          {title}
        </h1>

        {/* Live Ingestion Indicator */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-xs font-medium text-emerald-700 ml-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-badge" />
          <span>Live Ingestion Active</span>
        </div>
      </div>

      {/* Right: Filters and Actions */}
      <div className="flex items-center gap-2.5">
        {/* Date Range Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          >
            <Calendar size={14} className="text-slate-400" />
            <span>{dateRange}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateRange(opt);
                    setShowDateDropdown(false);
                  }}
                  className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-slate-50 font-medium ${
                    dateRange === opt ? 'text-blue-600 bg-blue-50/50 font-semibold' : 'text-slate-700'
                  }`}
                >
                  {opt}
                  {dateRange === opt && <Check size={14} className="text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Data Source Trigger Button */}
        <button
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-xs ${
            isPopoverOpen
              ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/10'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter size={14} className={isPopoverOpen ? 'text-blue-600' : 'text-slate-400'} />
          <span>Data source</span>
          <span className="px-1.5 py-0.2 bg-blue-100/70 text-blue-700 rounded-md text-[11px] font-bold">
            {selectedSourcesCount}/{totalSourcesCount}
          </span>
        </button>

        {/* AI Action Quick Launch */}
        {onOpenAiGenerator && (
          <button
            onClick={onOpenAiGenerator}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <Sparkles size={14} />
            <span>AI Response</span>
          </button>
        )}

        {/* History / Undo Button */}
        <button
          onClick={() => alert('View historical snapshot: 3 earlier versions cached.')}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-colors"
          title="Version history"
        >
          <RotateCcw size={16} strokeWidth={1.8} />
        </button>

        {/* Export Button */}
        <button
          onClick={() => alert('Exporting evidence dashboard data as CSV and PDF...')}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-colors"
          title="Export CSV / Report"
        >
          <Download size={16} strokeWidth={1.8} />
        </button>

        {/* Chattermill Signature Save Button */}
        <button
          onClick={handleSaveClick}
          className="px-4 py-1.5 bg-[#1d39c4] hover:bg-[#162da0] text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-98 flex items-center gap-1.5"
        >
          {isSaved ? (
            <>
              <Check size={14} />
              <span>Saved!</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </button>
      </div>
    </header>
  );
}
