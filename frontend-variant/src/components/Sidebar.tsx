'use client';

import React from 'react';
import { 
  Home, 
  Layers, 
  Sparkles, 
  BarChart2, 
  LayoutGrid, 
  SlidersHorizontal, 
  Activity, 
  HelpCircle, 
  Bell, 
  User 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount?: number;
}

export default function Sidebar({ activeTab, setActiveTab, unreadCount = 3 }: SidebarProps) {
  const topNavItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: Home },
    { id: 'clusters', label: 'Problem Discovery & Clusters', icon: Layers },
    { id: 'insights', label: 'AI Synthesis & Insights', icon: Sparkles },
    { id: 'drivers', label: 'Sentiment & Driver Analytics', icon: BarChart2 },
    { id: 'revenue', label: 'Revenue & Business Impact', icon: LayoutGrid },
    { id: 'priority', label: 'Priority Scoring Engine', icon: SlidersHorizontal },
    { id: 'integrations', label: 'Connectors & Ingestion Pipeline', icon: Activity },
  ];

  return (
    <aside className="w-[68px] bg-white border-r border-slate-200/80 flex flex-col justify-between items-center py-4 select-none shrink-0 z-20 min-h-screen sticky top-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      {/* Top Logo and Navigation */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Brand Icon (Inspired by Chattermill dual-arc geometry) */}
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className="relative group p-2 rounded-xl hover:bg-slate-100 transition-colors"
          title="FeedbackGenix Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-sm shadow-teal-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10C7 7.23858 9.23858 5 12 5C14.7614 5 17 7.23858 17 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="8" cy="15" r="2.2" fill="white"/>
              <circle cx="16" cy="15" r="2.2" fill="white"/>
              <path d="M12 13V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                )}

                {/* Floating Tooltip */}
                <div className="absolute left-[64px] px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 shadow-lg z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center gap-2 w-full px-2 pt-4 border-t border-slate-100">
        {/* Help */}
        <button
          onClick={() => setActiveTab('integrations')}
          title="Pipeline Documentation & API"
          className="relative group w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
        >
          <HelpCircle size={19} strokeWidth={1.8} />
          <div className="absolute left-[64px] px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
            Pipeline Docs & API
          </div>
        </button>

        {/* Notifications */}
        <button
          onClick={() => alert('3 real-time alerts: High negativity surge in UPI Payment cluster (+240%), iOS 18.1 crash rate spike, and 1 new source sync ready.')}
          title="System Alerts & Surges"
          className="relative group w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
        >
          <Bell size={19} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          )}
          <div className="absolute left-[64px] px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
            {unreadCount} Critical Problem Alerts
          </div>
        </button>

        {/* User Profile Avatar */}
        <div className="pt-2">
          <div 
            title="Barath (Lead Product Engineer)"
            className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-semibold text-xs border border-slate-300 shadow-xs cursor-pointer hover:ring-2 hover:ring-blue-500/30 transition-all"
          >
            BJ
          </div>
        </div>
      </div>
    </aside>
  );
}
