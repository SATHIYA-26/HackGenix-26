'use client';

import React, { useState, useEffect } from 'react';
import { ProblemCluster } from '@/lib/types';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  MessageSquare, 
  Sliders, 
  ShieldCheck 
} from 'lucide-react';

interface AiResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cluster: ProblemCluster | null;
  initialQuote?: string;
}

export default function AiResponseModal({
  isOpen,
  onClose,
  cluster,
  initialQuote
}: AiResponseModalProps) {
  const [channel, setChannel] = useState<'play_store' | 'support_ticket' | 'hotfix_notice'>('play_store');
  const [tone, setTone] = useState<'empathetic' | 'technical' | 'concise'>('empathetic');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);

  // Template generators based on tone and channel
  const generateResponseContent = (ch: typeof channel, t: typeof tone, clust: ProblemCluster | null) => {
    const title = clust ? clust.title : 'Recent Checkout & Payment Issue';
    const ver = clust ? clust.primaryVersion : '4.2';

    if (ch === 'play_store') {
      if (t === 'empathetic') {
        return `Hi there, we sincerely apologize for the frustration caused by the order cancellation after your payment was deducted. We understand how concerning it is when money leaves your bank without an immediate order confirmation.\n\nOur engineering team has identified a webhook callback timeout on version ${ver} and has deployed an immediate patch. Your transaction has been automatically reconciled—please check your bank statement within 2-4 hours, or write directly to priority-support@app.com with your Order / Transaction ID so we can credit your wallet instantly. Thank you for your patience!`;
      } else if (t === 'technical') {
        return `Hello, thank you for flagging this. We investigated transaction logs for this issue and found an asynchronous gateway acknowledgement timeout affecting v${ver}. We have released a server-side hotfix to decouple the UPI transaction confirmation from client-side network handshakes. Reversal requests have been queued with the clearing house. If you haven't received your refund within 24h, please reach out with reference #PAY-${clust?.id || 'SYNC'}.`;
      } else {
        return `Apologies for the inconvenience! We've identified and resolved the UPI order sync bug affecting app version ${ver}. Any pending debited amounts are being automatically reversed to your original payment method. Please update to our latest app build. If you need urgent assistance, DM us anytime.`;
      }
    } else if (ch === 'support_ticket') {
      return `Dear Customer,\n\nThank you for reaching out to our priority support team. We understand that your payment went through successfully while your order was cancelled on the app.\n\nRoot Cause Context: Our backend analytics detected this issue within our ${title} incident cluster. Our engineering squad has pushed an automated reconciliation script.\n\nStatus Update:\n1. Your transaction is marked as Verified.\n2. A full reversal has been initiated via the payment gateway (ARN Reference: ARN-${Math.floor(100000 + Math.random() * 900000)}).\n3. Funds typically reflect in your account within 24 to 48 banking hours.\n\nPlease reply directly to this ticket if you have any further questions.`;
    } else {
      return `📢 Incident Post-Mortem & Release Note: ${title}\n\nSummary:\nOver the last 72 hours, an issue occurred causing UPI payment dropouts and subsequent order cancellation on client builds v${ver}. Impacted users: ~${clust?.feedbackCount || '2,300'}.\n\nResolution:\n1. Deployed gateway retry circuit-breaker.\n2. Automated refund reconciliation queue for all pending authorizations.\n3. Rolled out defensive patch v4.2.1 to production.`;
    }
  };

  useEffect(() => {
    if (isOpen && cluster) {
      setGeneratedText(generateResponseContent(channel, tone, cluster));
    }
  }, [isOpen, channel, tone, cluster]);

  if (!isOpen) return null;

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedText(generateResponseContent(channel, tone, cluster));
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = () => {
    setPublished(true);
    setTimeout(() => {
      setPublished(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AI Customer Response Generator
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Grounded in root-cause cluster context & customer sentiment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Configuration Controls */}
        <div className="p-5 pb-3 border-b border-slate-100 space-y-3">
          {/* Target Channel Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Publishing Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setChannel('play_store')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  channel === 'play_store'
                    ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                App / Play Store Reply
              </button>
              <button
                onClick={() => setChannel('support_ticket')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  channel === 'support_ticket'
                    ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Zendesk Ticket Escalation
              </button>
              <button
                onClick={() => setChannel('hotfix_notice')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  channel === 'hotfix_notice'
                    ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Public Incident Status
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Tone & Voice
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'empathetic', label: 'Empathetic & Apologetic' },
                { id: 'technical', label: 'Technical Root-Cause' },
                { id: 'concise', label: 'Concise & Actionable' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTone(item.id as typeof tone)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tone === item.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Initial Customer Quote if present */}
        {initialQuote && (
          <div className="px-5 py-2.5 bg-amber-50/70 border-b border-amber-100 flex items-start gap-2 text-xs">
            <span className="font-bold text-amber-800 shrink-0">Responding to:</span>
            <span className="text-amber-900 italic line-clamp-1">&ldquo;{initialQuote}&rdquo;</span>
          </div>
        )}

        {/* Editable Generated Response Area */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-blue-600" />
              Suggested AI Draft:
            </span>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
              <span>Regenerate</span>
            </button>
          </div>

          <textarea
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            rows={7}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
          />

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              Human review required before publishing
            </span>
            <span>{generatedText.length} characters</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-[#1d39c4] hover:bg-[#162da0] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              {published ? (
                <>
                  <Check size={14} />
                  <span>Published!</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Approve & Publish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
