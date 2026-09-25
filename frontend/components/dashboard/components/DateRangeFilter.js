"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check, RotateCcw } from "lucide-react";

export const PRESET_RANGES = [
  { id: "today", label: "Today", days: 1 },
  { id: "1w", label: "1 Week", days: 7 },
  { id: "1m", label: "1 Month", days: 30 },
  { id: "3m", label: "3 Months", days: 90 },
  { id: "ytd", label: "Year to Date", days: 268 },
  { id: "custom", label: "Custom Range", days: null },
];

export function getRangeDates(presetId, customStart, customEnd) {
  const end = new Date();
  const start = new Date();

  if (presetId === "today") {
    // start is today
  } else if (presetId === "1w") {
    start.setDate(end.getDate() - 7);
  } else if (presetId === "1m") {
    start.setDate(end.getDate() - 30);
  } else if (presetId === "3m") {
    start.setDate(end.getDate() - 90);
  } else if (presetId === "ytd") {
    start.setMonth(0, 1);
  } else if (presetId === "custom" && customStart && customEnd) {
    return {
      startDate: new Date(customStart),
      endDate: new Date(customEnd),
      days: Math.max(1, Math.round((new Date(customEnd) - new Date(customStart)) / (1000 * 60 * 60 * 24))),
    };
  }

  const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  return { startDate: start, endDate: end, days };
}

export function formatDateShort(d) {
  if (!d || isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateInput(d) {
  if (!d || isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DateRangeFilter({ selectedRange, onRangeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Local state inside popover
  const [activePreset, setActivePreset] = useState(selectedRange?.preset || "1m");
  const initialDates = getRangeDates(selectedRange?.preset || "1m", selectedRange?.startDate, selectedRange?.endDate);
  
  const [tempStart, setTempStart] = useState(formatDateInput(selectedRange?.startDate ? new Date(selectedRange.startDate) : initialDates.startDate));
  const [tempEnd, setTempEnd] = useState(formatDateInput(selectedRange?.endDate ? new Date(selectedRange.endDate) : initialDates.endDate));

  // Sync with prop
  useEffect(() => {
    if (selectedRange?.preset) {
      setActivePreset(selectedRange.preset);
      if (selectedRange.startDate && selectedRange.endDate) {
        setTempStart(formatDateInput(new Date(selectedRange.startDate)));
        setTempEnd(formatDateInput(new Date(selectedRange.endDate)));
      }
    }
  }, [selectedRange]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    if (preset.id !== "custom") {
      const { startDate, endDate, days } = getRangeDates(preset.id);
      setTempStart(formatDateInput(startDate));
      setTempEnd(formatDateInput(endDate));
      onRangeChange({
        preset: preset.id,
        label: preset.label,
        startDate,
        endDate,
        days,
      });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (!tempStart || !tempEnd) return;
    const start = new Date(tempStart);
    const end = new Date(tempEnd);
    if (start > end) {
      alert("Start date cannot be after end date.");
      return;
    }
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    onRangeChange({
      preset: "custom",
      label: `${formatDateShort(start)} – ${formatDateShort(end)}`,
      startDate: start,
      endDate: end,
      days,
    });
    setIsOpen(false);
  };

  const currentLabel = () => {
    if (selectedRange?.preset === "custom" && selectedRange.startDate && selectedRange.endDate) {
      return `${formatDateShort(new Date(selectedRange.startDate))} – ${formatDateShort(new Date(selectedRange.endDate))}`;
    }
    const preset = PRESET_RANGES.find((p) => p.id === (selectedRange?.preset || "1m"));
    const { startDate, endDate } = getRangeDates(preset?.id || "1m", selectedRange?.startDate, selectedRange?.endDate);
    return `${preset?.label || "1 Month"} (${formatDateShort(startDate)} – ${formatDateShort(endDate)})`;
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Quick Pills Bar + Calendar Toggle */}
      <div className="flex items-center rounded-lg border border-[#E5E1D8] bg-white p-1 text-xs shadow-2xs gap-1">
        {/* Quick presets shortcut buttons */}
        <div className="flex items-center gap-0.5">
          {[
            { id: "1w", label: "1 Week" },
            { id: "1m", label: "1 Month" },
            { id: "3m", label: "3 Months" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(PRESET_RANGES.find((x) => x.id === p.id))}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                (selectedRange?.preset || "1m") === p.id
                  ? "bg-[#18181B] text-white"
                  : "text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F1EA]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-[#E5E1D8] mx-0.5" />

        {/* Calendar Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition-colors ${
            isOpen || selectedRange?.preset === "custom" || selectedRange?.preset === "today" || selectedRange?.preset === "ytd"
              ? "bg-[#F4F1EA] text-[#18181B]"
              : "text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F1EA]"
          }`}
          title="Open calendar date filter"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#18181B]" />
          <span className="hidden sm:inline-block max-w-[170px] truncate">{currentLabel()}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Interactive Calendar Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl bg-white border border-[#E5E1D8] shadow-xl p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E0]">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#18181B]" />
              <span className="text-xs font-bold text-[#18181B]">Date Range Filter</span>
            </div>
            <button
              onClick={() => handleSelectPreset(PRESET_RANGES.find((x) => x.id === "1m"))}
              className="text-[11px] text-[#71717A] hover:text-[#18181B] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Quick Presets Grid */}
          <div className="mt-3">
            <label className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-2">
              Presets
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESET_RANGES.filter((p) => p.id !== "custom").map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                      isSelected
                        ? "bg-[#18181B] text-white border-[#18181B]"
                        : "bg-[#FAF8F5] text-[#3F3F46] border-[#E5E1D8] hover:bg-[#F4F1EA]"
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Range Section */}
          <div className="mt-4 pt-3 border-t border-[#ECE8E0]">
            <label className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-2">
              Custom Calendar Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-[#71717A] block mb-1">Start Date</span>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => {
                    setTempStart(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#18181B] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] block mb-1">End Date</span>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => {
                    setTempEnd(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#18181B] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] outline-none"
                />
              </div>
            </div>

            {tempStart && tempEnd && (
              <div className="mt-2.5 p-2 bg-[#FAF8F5] rounded-lg text-[11px] text-[#71717A] flex items-center justify-between">
                <span>Selected Window:</span>
                <span className="font-bold text-[#18181B]">
                  {Math.max(1, Math.round((new Date(tempEnd) - new Date(tempStart)) / (1000 * 60 * 60 * 24)))} days
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#71717A] hover:bg-[#F4F1EA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustom}
                className="px-4 py-1.5 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors shadow-xs"
              >
                Apply Date Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
