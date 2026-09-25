"use client";

import { Globe, Plus, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { CONNECTED_SOURCES } from "../data/intelligenceMockData";

export default function SourcesView({ onOpenConnectSource }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">Connected Feedback Channels</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Real-time ingestion pipelines and webhook connectors streaming customer signals into Reviewr.
          </p>
        </div>

        <button
          onClick={onOpenConnectSource}
          className="h-9 px-4 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect New Source</span>
        </button>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase">Active Pipelines</span>
          <p className="text-2xl font-bold text-[#18181B] mt-1">5 Connected</p>
          <p className="text-[11px] text-[#059669] mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> All webhooks operational
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase">Total Ingested</span>
          <p className="text-2xl font-bold text-[#18181B] mt-1">50,090</p>
          <p className="text-[11px] text-[#71717A] mt-0.5">Reviews, comments, & tickets</p>
        </div>

        <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase">Deduplication Rate</span>
          <p className="text-2xl font-bold text-[#059669] mt-1">99.98%</p>
          <p className="text-[11px] text-[#71717A] mt-0.5">Zero duplicate collisions</p>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONNECTED_SOURCES.map((src) => {
          const isConnected = src.status === "connected";

          return (
            <div
              key={src.id}
              className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#D6D1C6] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] flex items-center justify-center p-2">
                    {src.icon ? (
                      <img src={src.icon} alt={src.name} className="w-full h-full object-contain" />
                    ) : (
                      <Globe className="w-5 h-5 text-[#71717A]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#18181B]">{src.name}</h3>
                    <p className="text-xs text-[#71717A]">{src.description}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                    isConnected
                      ? "bg-[#ECFDF5] text-[#059669]"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? "bg-[#059669]" : "bg-[#94A3B8]"
                    }`}
                  />
                  {src.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#ECE8E0] text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#71717A] block">Feedback Volume</span>
                  <span className="font-bold text-[#18181B]">{src.totalFeedback.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717A] block">Last Sync</span>
                  <span className="font-semibold text-[#18181B]">{src.lastSync}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717A] block">Pipeline Latency</span>
                  <span className="font-semibold text-[#059669]">{src.latency}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#71717A] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" /> Verified Secure
                </span>
                {isConnected ? (
                  <button className="text-xs font-semibold text-[#18181B] hover:text-[#4F46E5] flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Sync Now
                  </button>
                ) : (
                  <button
                    onClick={onOpenConnectSource}
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    + Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
