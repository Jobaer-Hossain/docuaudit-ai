import React, { useState } from 'react';
import { 
  X, 
  Wand2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck2, 
  Sparkles,
  Calculator,
  Scale
} from 'lucide-react';
import { AuditFinding, FindingRemediation } from '../types';

interface RemediationModalProps {
  finding: AuditFinding;
  onClose: () => void;
  onApplyRemediation: (findingId: string, notes: string) => void;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  finding,
  onClose,
  onApplyRemediation,
}) => {
  const [notes, setNotes] = useState(`Remediation applied based on automated compliance rule ${finding.audit_rule}`);
  const [isApplying, setIsApplying] = useState(false);

  const rem = finding.remediation;

  if (!rem) {
    return null;
  }

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      onApplyRemediation(finding.id, notes);
      setIsApplying(false);
      onClose();
    }, 400);
  };

  const isLegal = rem.action_type === 'REDLINE_CLAUSE';
  const isMath = rem.action_type === 'MATH_ADJUSTMENT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              {isLegal ? <Scale className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>AI Remediation & Safe Redline Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  +{rem.risk_reduction_pct}% Risk Reduction
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated risk mitigation for: {finding.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-200">
          {/* Side-by-Side Diff Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original Risky Snippet */}
            <div className="space-y-1.5">
              <span className="font-bold text-red-400 uppercase text-[10px] tracking-wider block">
                Original Risky Text (Page {finding.page_number})
              </span>
              <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3.5 text-[11px] font-mono text-red-200 leading-relaxed min-h-[120px] select-text">
                {rem.original_text}
              </div>
            </div>

            {/* Proposed Safe Redline */}
            <div className="space-y-1.5">
              <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Audited Safe Replacement
              </span>
              <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-xl p-3.5 text-[11px] font-mono text-emerald-200 leading-relaxed min-h-[120px] select-text">
                {rem.proposed_remediation}
              </div>
            </div>
          </div>

          {/* Rationale & Policy Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-brand-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Compliance Rationale & Legal Authority</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {rem.rationale}
            </p>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              Enforces Rule: {finding.audit_rule}
            </div>
          </div>

          {/* Auditor Resolution Notes Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-300">
              Auditor Resolution Notes / Sign-off:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400">
            Applying this remediation will mark this finding as <strong className="text-emerald-400">RESOLVED</strong> and boost the document health score.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApplying ? 'Applying...' : 'Apply Safe Redline & Resolve'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
