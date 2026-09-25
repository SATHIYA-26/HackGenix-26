"use client";

import { useState } from "react";
import { User, Users, Sparkles, FolderTree, Shield, CheckCircle2, Plus } from "lucide-react";
import { USER_PROFILE, PRODUCT_TAXONOMY } from "../data/intelligenceMockData";

export default function SettingsView({ company }) {
  const [activeTab, setActiveTab] = useState("taxonomy");
  const [taxonomy, setTaxonomy] = useState(PRODUCT_TAXONOMY);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#ECE8E0] pb-6">
        <h1 className="text-2xl font-bold text-[#18181B] font-serif">Workspace Configuration</h1>
        <p className="text-xs text-[#71717A] mt-1">
          Manage product taxonomy, team roles, AI weighting formulas, and enterprise privacy rules.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#ECE8E0]">
        {[
          { id: "taxonomy", label: "Product Taxonomy", icon: FolderTree },
          { id: "ai", label: "AI Models & Weights", icon: Sparkles },
          { id: "members", label: "Team & Roles", icon: Users },
          { id: "workspace", label: "Workspace Details", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? "border-[#18181B] text-[#18181B] bg-white"
                  : "border-transparent text-[#71717A] hover:text-[#18181B]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isSaved && (
        <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#059669] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration saved successfully!</span>
        </div>
      )}

      {/* Section 63: Product Taxonomy UI */}
      {activeTab === "taxonomy" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B]">Product Areas & Features</h2>
              <p className="text-xs text-[#71717A]">
                Reviewr's NLP engine maps unstructured reviews into these hierarchical product categories.
              </p>
            </div>
            <button
              onClick={handleSave}
              className="h-8 px-3.5 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A]"
            >
              Save Taxonomy
            </button>
          </div>

          <div className="space-y-4">
            {taxonomy.map((tax, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-[#E5E1D8] bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-[#ECE8E0] pb-2">
                  <span className="text-sm font-bold text-[#18181B]">{tax.product}</span>
                  <span className="text-xs text-[#71717A]">{tax.features.length} Features Tagged</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#71717A] uppercase block mb-1.5">
                    Sub-features & Capabilities:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tax.features.map((f, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#ECE8E0] font-medium text-[#3F3F46]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#71717A]">
                  <div>
                    <span className="font-semibold text-[#18181B]">Target Platforms:</span>{" "}
                    {tax.platforms.join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold text-[#18181B]">Active Release Versions:</span>{" "}
                    {tax.versions.join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Models & Priority Weights */}
      {activeTab === "ai" && (
        <div className="p-6 rounded-xl border border-[#E5E1D8] bg-white space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[#18181B]">Priority Formula Weight Calibration</h2>
            <p className="text-xs text-[#71717A]">
              Fine-tune the weights used to calculate the 0.0 to 1.0 problem urgency score.
            </p>
          </div>

          <div className="space-y-4 max-w-lg text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Frequency Weight (Review Volume)</span>
                <span>30%</span>
              </div>
              <input type="range" className="w-full accent-[#18181B]" defaultValue={30} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Severity Weight (Negative Sentiment & Churn Risk)</span>
                <span>35%</span>
              </div>
              <input type="range" className="w-full accent-[#18181B]" defaultValue={35} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Velocity Weight (7-Day Acceleration Rate)</span>
                <span>25%</span>
              </div>
              <input type="range" className="w-full accent-[#18181B]" defaultValue={25} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>User Impact Weight (Platform Segment Coverage)</span>
                <span>10%</span>
              </div>
              <input type="range" className="w-full accent-[#18181B]" defaultValue={10} />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="h-8 px-4 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A]"
          >
            Update Weights
          </button>
        </div>
      )}

      {/* Team Members */}
      {activeTab === "members" && (
        <div className="p-6 rounded-xl border border-[#E5E1D8] bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B]">Workspace Collaborators</h2>
              <p className="text-xs text-[#71717A]">Role-based access to customer insights and action tracking.</p>
            </div>
            <button className="h-8 px-3 rounded-lg border border-[#E5E1D8] text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA]">
              + Invite Member
            </button>
          </div>

          <div className="divide-y divide-[#ECE8E0] text-xs">
            {[
              {
                name: company?.ownerName || "Mani",
                email: company?.email || "admin@manisbiriyani.com",
                role: company?.ownerRole || "Founder & Operations",
              },
              {
                name: "Customer Operations Lead",
                email: `support@${company?.handle ? company.handle.replace("@", "") + ".com" : "reviewr.ai"}`,
                role: "CX & VoC Manager",
              },
              {
                name: "Product & Growth Lead",
                email: `product@${company?.handle ? company.handle.replace("@", "") + ".com" : "reviewr.ai"}`,
                role: "Decision Workspace Lead",
              },
            ].map((m, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#18181B]">{m.name}</p>
                  <p className="text-[#71717A]">{m.email}</p>
                </div>
                <span className="bg-[#FAF8F5] border border-[#ECE8E0] px-2.5 py-1 rounded text-[#3F3F46] font-medium">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workspace Details */}
      {activeTab === "workspace" && (
        <div className="p-6 rounded-xl border border-[#E5E1D8] bg-white space-y-4 max-w-lg text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#18181B]">Workspace Organization Name</label>
            <input
              type="text"
              key={company?.id}
              className="w-full bg-[#FBF9F5] border border-[#E5E1D8] rounded-xl px-3 py-2 text-xs text-[#18181B] outline-none"
              defaultValue={company ? `${company.name} Workspace` : "Reviewr Enterprise Workspace"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#18181B]">Primary Notification Slack Channel</label>
            <input
              type="text"
              className="w-full bg-[#FBF9F5] border border-[#E5E1D8] rounded-xl px-3 py-2 text-xs text-[#18181B] outline-none"
              defaultValue="#voc-alerts-realtime"
            />
          </div>

          <button
            onClick={handleSave}
            className="h-8 px-4 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A]"
          >
            Save Details
          </button>
        </div>
      )}
    </div>
  );
}
