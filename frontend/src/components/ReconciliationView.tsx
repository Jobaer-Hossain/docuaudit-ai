import React, { useState } from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  FileSpreadsheet,
  Download,
  Filter
} from 'lucide-react';
import { DocumentDetail } from '../types';

interface ReconciliationViewProps {
  document: DocumentDetail;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({ document }) => {
  const [filterDiscrepanciesOnly, setFilterDiscrepanciesOnly] = useState(false);
  const recon = document.reconciliation_data;

  if (!recon) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
        <GitCompare className="w-12 h-12 text-slate-300 mb-3" />
        <h4 className="text-slate-800 font-semibold mb-1">No Purchase Order Linked</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          This document is not currently associated with a 3-way reconciliation PO record. Select Invoice #8941 to view live 3-way matching.
        </p>
      </div>
    );
  }

  const items = recon.items_comparison || [];
  const displayItems = filterDiscrepanciesOnly ? items.filter((i: any) => !i.match) : items;

  const exportCSV = () => {
    const headers = ['Item Description', 'PO Qty', 'Invoiced Qty', 'PO Rate ($)', 'Invoiced Rate ($)', 'Status', 'Audit Exception'];
    const rows = items.map((i: any) => [
      `"${i.item}"`,
      i.po_qty,
      i.inv_qty,
      i.po_rate,
      i.inv_rate,
      i.match ? 'MATCHED' : 'DISCREPANCY',
      `"${i.issue || 'None'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = window.document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reconciliation_${recon.po_reference}_${recon.invoice_reference}.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                3-Way Reconciliation Matcher
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Cross-Checking PO: {recon.po_reference} ↔ Inv: {recon.invoice_reference}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-red-700 uppercase tracking-wider block font-bold">
              Total Budget Variance
            </span>
            <span className="text-sm font-bold font-mono text-red-700">
              {recon.variance}
            </span>
          </div>
        </div>

        {/* Budget Comparison Bar */}
        <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs mb-3 shadow-2xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Approved PO Budget</span>
            <span className="text-base font-bold text-emerald-700 font-mono">
              {recon.po_budget_approved}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Vendor Invoiced</span>
            <span className="text-base font-bold text-red-700 font-mono">
              {recon.invoice_billed}
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            onClick={() => setFilterDiscrepanciesOnly(!filterDiscrepanciesOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              filterDiscrepanciesOnly
                ? 'bg-red-50 border-red-300 text-red-700 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterDiscrepanciesOnly ? 'Showing Discrepancies Only' : 'Show Discrepancies Only'}</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[11px] font-medium transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-brand-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="flex-1 overflow-auto p-4 bg-slate-50/40">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-brand-600" />
          Line-by-Line Item Matching ({displayItems.length})
        </h4>

        <div className="space-y-3">
          {displayItems.map((item: any, idx: number) => {
            const isMatch = item.match;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all shadow-2xs ${
                  isMatch
                    ? 'bg-white border-slate-200'
                    : 'bg-red-50/60 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isMatch ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-900 text-xs">
                      {item.item}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isMatch
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {isMatch ? 'Reconciled' : 'Discrepancy'}
                  </span>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Purchase Order Terms</span>
                    <span className="text-slate-700">
                      Qty: {item.po_qty} @ ${item.po_rate.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Vendor Billed</span>
                    <span className={isMatch ? 'text-slate-700' : 'text-red-700 font-bold'}>
                      Qty: {item.inv_qty} @ ${item.inv_rate.toFixed(2)}
                    </span>
                  </div>
                </div>

                {item.issue && (
                  <div className="mt-2 text-xs text-red-800 bg-red-100/70 border border-red-200 p-2 rounded">
                    <strong>Audit Flag:</strong> {item.issue}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Audit Directive Card */}
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Audit Directive: Payment Hold Active</span>
          </div>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            Due to the +$7,436.00 variance and arithmetic inflation on line item 3, automated disbursement has been locked. Issue credit memo request to Apex Datacenter before settlement.
          </p>
        </div>
      </div>
    </div>
  );
};
