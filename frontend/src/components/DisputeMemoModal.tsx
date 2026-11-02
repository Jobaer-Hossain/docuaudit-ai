import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileWarning } from 'lucide-react';

interface DisputeMemoModalProps {
  letterMarkdown: string;
  onClose: () => void;
}

export const DisputeMemoModal: React.FC<DisputeMemoModalProps> = ({
  letterMarkdown,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(letterMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <FileWarning className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Vendor Billing Dispute & Audit Deficiency Notice
              </h3>
              <p className="text-[11px] text-slate-500">
                Official SOX-compliant notification package
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
        <div className="flex-1 overflow-y-auto p-6 select-text bg-slate-50/50">
          <div className="p-6 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-xs">
            {letterMarkdown}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-2xs font-medium"
          >
            <Printer className="w-4 h-4" />
            <span>Print Notice</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors font-medium shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
