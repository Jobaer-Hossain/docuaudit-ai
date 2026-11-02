import React, { useState } from 'react';
import { 
  X, 
  FileEdit, 
  CheckCircle2, 
  ShieldCheck, 
  Calculator,
  Scale
} from 'lucide-react';
import { AuditFinding } from '../types';

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
  const [notes, setNotes] = useState(`Remediation applied based on audit rule ${finding.audit_rule}`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              {isLegal ? <Scale className="w-4 h-4 text-brand-600" /> : <Calculator className="w-4 h-4 text-brand-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <span>Compliance Redline Review</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Risk Reduction: -{rem.risk_reduction_pct}%
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Resolution Proposal for: {finding.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-800">
          {/* Side-by-Side Diff Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original Risky Snippet */}
            <div className="space-y-1.5">
              <span className="font-semibold text-red-700 text-[11px] tracking-wide block">
                Current Contract Wording (Page {finding.page_number})
              </span>
              <div className="bg-red-50/60 border border-red-200 rounded-lg p-3.5 text-[11px] font-mono text-red-900 leading-relaxed min-h-[120px] select-text">
                {rem.original_text}
              </div>
            </div>

            {/* Proposed Safe Redline */}
            <div className="space-y-1.5">
              <span className="font-semibold text-emerald-700 text-[11px] tracking-wide block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Proposed Standard Clause
              </span>
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 text-[11px] font-mono text-emerald-900 leading-relaxed min-h-[120px] select-text">
                {rem.proposed_remediation}
              </div>
            </div>
          </div>

          {/* Rationale & Policy Card */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Policy Justification & Benchmark</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {rem.rationale}
            </p>
            <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400">
              Reference Rule: {finding.audit_rule}
            </div>
          </div>

          {/* Auditor Resolution Notes Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-700">
              Auditor Sign-off Note:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 shadow-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs">
          <span className="text-[11px] text-slate-500">
            Applying this redline marks finding as <strong className="text-emerald-700">RESOLVED</strong> and updates health score.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApplying ? 'Applying...' : 'Apply Redline'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
