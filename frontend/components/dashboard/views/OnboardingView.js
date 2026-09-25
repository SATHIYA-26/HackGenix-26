"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Globe,
  Tag,
  ShieldCheck,
  ChevronRight,
  Database,
  Cpu,
  TrendingUp,
  Check,
} from "lucide-react";

export default function OnboardingView({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("Enterprise Product Core");
  const [selectedProductType, setSelectedProductType] = useState("fintech");
  const [selectedSources, setSelectedSources] = useState(["youtube", "playstore", "zendesk"]);
  const [selectedTaxonomies, setSelectedTaxonomies] = useState(["payments", "checkout", "auth"]);

  // Analysis simulation state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const productOptions = [
    { id: "fintech", name: "FinTech & Payments", desc: "Checkout, UPI webhooks, refunds & gateways" },
    { id: "media", name: "Media & Streaming", desc: "Video playback, offline DRM, subscription plans" },
    { id: "retail", name: "Omnichannel Retail", desc: "In-store trial rooms, queue flow, dining & inventory" },
    { id: "b2b", name: "B2B SaaS Platform", desc: "Integrations, API latency, team permissions" },
  ];

  const sourceOptions = [
    { id: "youtube", name: "YouTube Comments", desc: "Community video feedback & sentiment" },
    { id: "playstore", name: "Google Play Store", desc: "App release reviews & crash complaints" },
    { id: "appstore", name: "Apple App Store", desc: "iOS customer ratings & device reports" },
    { id: "zendesk", name: "Customer Support (Zendesk)", desc: "Escalated high-touch customer tickets" },
    { id: "googlemaps", name: "Google Reviews / Maps", desc: "Physical branch & showroom feedback" },
  ];

  const taxonomyOptions = [
    { id: "payments", name: "Payment Processing & UPI" },
    { id: "checkout", name: "Cart & Checkout Funnel" },
    { id: "auth", name: "Sign In & SMS 2FA Authentication" },
    { id: "performance", name: "App Speed & Freeze Diagnostics" },
    { id: "store", name: "Showroom / Physical Operations" },
  ];

  const analysisSteps = [
    "Connecting feedback pipelines across selected channels...",
    "Ingesting 12,480 raw customer voice records...",
    "Running NLP normalization, deduplication & noise filtering...",
    "Generating 1536-dimensional semantic embeddings...",
    "Discovering 15 recurring and emerging customer problems...",
    "Synthesizing priority scores and evidence-backed recommendations...",
  ];

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnalysisStep(step);
      if (step >= analysisSteps.length) {
        clearInterval(interval);
      }
    }, 800);
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    } else if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#18181B] flex flex-col justify-between p-4 md:p-8 font-sans antialiased">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-[#E5E1D8]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#18181B] text-white flex items-center justify-center font-serif font-bold text-sm">
            R
          </div>
          <div>
            <span className="font-serif font-bold text-sm tracking-tight">Reviewr</span>
            <span className="text-[10px] text-[#71717A] ml-2 font-medium">Feedback Intelligence</span>
          </div>
        </div>

        {/* Step Indicator */}
        {!isAnalyzing && (
          <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                  currentStep === s
                    ? "bg-[#7C3AED] text-white shadow-xs"
                    : currentStep > s
                    ? "bg-[#7C3AED] text-white"
                    : "bg-[#ECE8E0] text-[#71717A]"
                }`}
              >
                {currentStep > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Main Flow Stage */}
      <main className="max-w-2xl mx-auto w-full my-auto py-10">
        {!isAnalyzing ? (
          <div className="bg-white rounded-2xl border border-[#E5E1D8] p-6 md:p-10 shadow-sm space-y-8 animate-in fade-in">
            {/* Step 1: Welcome & Workspace */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded font-bold">
                    Step 1 of 5
                  </span>
                  <h1 className="text-2xl font-serif font-bold text-[#18181B] mt-2">
                    Welcome to Feedback Intelligence
                  </h1>
                  <p className="text-sm text-[#71717A] mt-1">
                    Turn scattered customer voices across app stores, reviews, and support into evidence-backed product decisions.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#18181B]">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-sm focus:outline-hidden focus:border-[#18181B] bg-[#FBF9F5]"
                    placeholder="e.g. Acme Consumer Product Team"
                  />
                  <p className="text-[11px] text-[#71717A]">
                    You can invite product managers, designers, and engineers after setup.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#EBE7DD] space-y-2 text-xs text-[#52525B]">
                  <p className="font-bold text-[#18181B]">What happens next:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li>Connect feedback streams from public and internal channels</li>
                    <li>NLP models cluster recurring problems and detect velocity spikes</li>
                    <li>Synthesize explainable recommendations with traceable customer quotes</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-2"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Product Type */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded font-bold">
                    Step 2 of 5
                  </span>
                  <h1 className="text-2xl font-serif font-bold text-[#18181B] mt-2">
                    What product domain do you manage?
                  </h1>
                  <p className="text-sm text-[#71717A] mt-1">
                    Select your primary domain so Reviewr calibrates semantic embeddings for industry-specific terminology.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedProductType(opt.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedProductType === opt.id
                          ? "border-[#18181B] bg-[#FAF8F5] shadow-xs ring-1 ring-[#18181B]"
                          : "border-[#E5E1D8] hover:border-[#A1A1AA] bg-white"
                      }`}
                    >
                      <p className="text-xs font-bold text-[#18181B]">{opt.name}</p>
                      <p className="text-[11px] text-[#71717A] mt-1">{opt.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-[#71717A] hover:text-[#18181B]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-2"
                  >
                    <span>Next: Connect Sources</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Connect Feedback Sources */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded font-bold">
                    Step 3 of 5
                  </span>
                  <h1 className="text-2xl font-serif font-bold text-[#18181B] mt-2">
                    Connect feedback channels
                  </h1>
                  <p className="text-sm text-[#71717A] mt-1">
                    Select which sources you want Reviewr to continuously ingest and deduplicate.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {sourceOptions.map((src) => {
                    const isChecked = selectedSources.includes(src.id);
                    return (
                      <div
                        key={src.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedSources(selectedSources.filter((s) => s !== src.id));
                          } else {
                            setSelectedSources([...selectedSources, src.id]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? "border-[#18181B] bg-[#FAF8F5]"
                            : "border-[#E5E1D8] hover:border-[#A1A1AA] bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? "bg-[#18181B] border-[#18181B] text-white" : "border-[#A1A1AA]"
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#18181B]">{src.name}</p>
                            <p className="text-[10px] text-[#71717A]">{src.desc}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded font-bold">
                          Ready to stream
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-[#71717A] hover:text-[#18181B]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-2"
                  >
                    <span>Next: Product Taxonomy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Product Areas / Taxonomy */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded font-bold">
                    Step 4 of 5
                  </span>
                  <h1 className="text-2xl font-serif font-bold text-[#18181B] mt-2">
                    Choose product focus areas
                  </h1>
                  <p className="text-sm text-[#71717A] mt-1">
                    Map feedback automatically to team squads and features.
                  </p>
                </div>

                <div className="space-y-2">
                  {taxonomyOptions.map((tax) => {
                    const isChecked = selectedTaxonomies.includes(tax.id);
                    return (
                      <div
                        key={tax.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedTaxonomies(selectedTaxonomies.filter((t) => t !== tax.id));
                          } else {
                            setSelectedTaxonomies([...selectedTaxonomies, tax.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? "border-[#18181B] bg-[#FAF8F5]"
                            : "border-[#E5E1D8] hover:border-[#A1A1AA] bg-white"
                        }`}
                      >
                        <span className="text-xs font-semibold text-[#18181B]">{tax.name}</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? "bg-[#18181B] border-[#18181B] text-white" : "border-[#A1A1AA]"
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-[#71717A] hover:text-[#18181B]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-5 py-2.5 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-2"
                  >
                    <span>Review & Run Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Summary & Trigger */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded font-bold">
                    Step 5 of 5 · Ready
                  </span>
                  <h1 className="text-2xl font-serif font-bold text-[#18181B] mt-2">
                    Start Analyzing Your Customer Feedback
                  </h1>
                  <p className="text-sm text-[#71717A] mt-1">
                    Everything is configured. Reviewr will now build your initial intelligence catalog.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#EBE7DD] space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[#E5E1D8] pb-2">
                    <span className="text-[#71717A]">Workspace</span>
                    <span className="font-bold text-[#18181B]">{workspaceName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5E1D8] pb-2">
                    <span className="text-[#71717A]">Active Sources</span>
                    <span className="font-bold text-[#18181B]">{selectedSources.length} channels connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Initial Batch Volume</span>
                    <span className="font-bold text-[#18181B]">12,480 feedback records</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="text-xs text-[#71717A] hover:text-[#18181B]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStartAnalysis}
                    className="px-6 py-3 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-[#DDD6FE]" />
                    <span>Start Continuous Analysis</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Live Machine Learning Analysis Simulation Screen */
          <div className="bg-white rounded-2xl border border-[#E5E1D8] p-8 md:p-12 shadow-sm space-y-8 animate-in fade-in text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED] flex items-center justify-center mx-auto shadow-xs">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-serif font-bold text-[#18181B]">
                {analysisStep >= analysisSteps.length ? "Workspace Ready" : "Analyzing Your Customer Feedback..."}
              </h2>
              <p className="text-xs text-[#71717A]">
                {analysisStep >= analysisSteps.length
                  ? "12,480 items analyzed across 15 problem clusters with full evidence traceability."
                  : analysisSteps[Math.min(analysisStep, analysisSteps.length - 1)]}
              </p>
            </div>

            {/* Progress Bars */}
            <div className="space-y-2 text-left">
              {analysisSteps.map((stepText, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold ${
                      idx < analysisStep
                        ? "bg-[#7C3AED] text-white"
                        : idx === analysisStep
                        ? "border-2 border-[#7C3AED] text-[#7C3AED] animate-spin"
                        : "bg-[#ECE8E0] text-[#71717A]"
                    }`}
                  >
                    {idx < analysisStep ? <Check className="w-2.5 h-2.5" /> : idx === analysisStep ? "•" : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] truncate ${
                      idx <= analysisStep ? "text-[#18181B] font-medium" : "text-[#A1A1AA]"
                    }`}
                  >
                    {stepText}
                  </span>
                </div>
              ))}
            </div>

            {analysisStep >= analysisSteps.length && (
              <div className="pt-4 animate-in fade-in slide-in-from-bottom-2">
                <button
                  onClick={handleFinish}
                  className="w-full py-3 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Enter Feedback Intelligence Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 border-t border-[#ECE8E0] text-[11px] text-[#71717A]">
        Evidence-backed product decisions powered by Reviewr Intelligence Engine.
      </footer>
    </div>
  );
}
