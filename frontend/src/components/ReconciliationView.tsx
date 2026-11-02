import React from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  DollarSign, 
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import { DocumentDetail } from '../types';

interface ReconciliationViewProps {
  document: DocumentDetail;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({ document }) => {
  const recon = document.reconciliation_data;

  if (!recon) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <GitCompare className="w-12 h-12 text-slate-600 mb-3" />
        <h4 className="text-slate-200 font-bold mb-1">No Purchase Order Linked</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          This document is not currently associated with a 3-way reconciliation PO record. Select Invoice #8941 to view live 3-way matching.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-brand-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                3-Way Reconciliation Matcher
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Cross-Checking PO: {recon.po_reference} ↔ Inv: {recon.invoice_reference}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold">
              Total Budget Variance
            </span>
            <span className="text-sm font-bold font-mono text-red-400">
              {recon.variance}
            </span>
          </div>
        </div>

        {/* Budget Comparison Bar */}
        <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Approved PO Budget</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {recon.po_budget_approved}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Vendor Invoiced</span>
            <span className="text-base font-bold text-red-400 font-mono">
              {recon.invoice_billed}
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="flex-1 overflow-auto p-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-brand-400" />
          Line-by-Line Item Matching
        </h4>

        <div className="space-y-3">
          {recon.items_comparison?.map((item: any, idx: number) => {
            const isMatch = item.match;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  isMatch
                    ? 'bg-slate-950/40 border-slate-800'
                    : 'bg-red-950/30 border-red-900/80 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isMatch ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200 text-xs">
                      {item.item}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isMatch
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {isMatch ? 'Reconciled' : 'Discrepancy'}
                  </span>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Purchase Order Terms</span>
                    <span className="text-slate-300">
                      Qty: {item.po_qty} @ ${item.po_rate.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vendor Billed</span>
                    <span className={isMatch ? 'text-slate-300' : 'text-red-400 font-bold'}>
                      Qty: {item.inv_qty} @ ${item.inv_rate.toFixed(2)}
                    </span>
                  </div>
                </div>

                {item.issue && (
                  <div className="mt-2 text-xs text-red-300 bg-red-950/60 border border-red-900/70 p-2 rounded">
                    <strong>Audit Flag:</strong> {item.issue}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Audit Advice Card */}
        <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-900/70 text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4" />
            <span>Autonomous Audit Directive: Payment Hold Recommended</span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            Due to the +$7,436.00 variance and arithmetic inflation on line item 3, automated disbursement has been locked. Issue credit memo request #CR-8941 to Apex Datacenter before settlement.
          </p>
        </div>
      </div>
    </div>
  );
};
