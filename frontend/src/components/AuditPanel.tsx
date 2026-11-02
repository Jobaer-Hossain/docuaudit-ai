import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Crosshair, 
  Award,
  FileEdit,
  FileWarning,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { DocumentDetail, AuditFinding, BoundingBox } from '../types';

interface AuditPanelProps {
  document: DocumentDetail;
  onSpotlight: (page: number, bbox: BoundingBox) => void;
  onReAudit: () => void;
  isReAuditing: boolean;
  onOpenCertificate: () => void;
  onOpenRemediation: (finding: AuditFinding) => void;
  onGenerateDisputeLetter: () => void;
  onUpdateFindingStatus: (findingId: string, status: 'FLAGGED' | 'RESOLVED' | 'ACCEPTED_EXCEPTION') => void;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({
  document,
  onSpotlight,
  onReAudit,
  isReAuditing,
  onOpenCertificate,
  onOpenRemediation,
  onGenerateDisputeLetter,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'>('ALL');

  const { metadata, findings, metrics, summary, integrity } = document;

  const filteredFindings = findings.filter((f) => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'RESOLVED') return f.status === 'RESOLVED';
    return f.severity === filterSeverity && f.status !== 'RESOLVED';
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 border-emerald-300 bg-emerald-50';
    if (score >= 60) return 'text-amber-700 border-amber-300 bg-amber-50';
    return 'text-red-700 border-red-300 bg-red-50';
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Executive Health Score Banner */}
      <div className="p-5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">
                Compliance Health Score
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              {summary}
            </p>
          </div>

          {/* Health Score Gauge */}
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 ${getScoreColor(metadata.health_score)} shadow-xs shrink-0`}>
            <span className="text-2xl font-black font-mono">
              {metadata.health_score}
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
              Score / 100
            </span>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          {metrics.discrepancy_amount && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
              <span className="text-[10px] text-red-700 uppercase tracking-wider block font-semibold">
                Financial Discrepancy
              </span>
              <span className="text-sm font-bold text-red-800 font-mono">
                {metrics.discrepancy_amount}
              </span>
            </div>
          )}

          {metrics.liability_cap && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <span className="text-[10px] text-amber-700 uppercase tracking-wider block font-semibold">
                Liability Exposure
              </span>
              <span className="text-sm font-bold text-amber-800 font-mono">
                {metrics.liability_cap}
              </span>
            </div>
          )}

          {metrics.claimed_total && (
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                Claimed vs True Total
              </span>
              <span className="text-xs font-mono text-slate-800">
                {metrics.claimed_total} vs <strong className="text-emerald-700">{metrics.audited_true_total}</strong>
              </span>
            </div>
          )}

          {metrics.compliance_status && (
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                Audit Status
              </span>
              <span className="text-xs font-semibold text-amber-700">
                {metrics.compliance_status}
              </span>
            </div>
          )}
        </div>

        {/* Cryptographic Hash Seal Strip */}
        {integrity && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-600 mb-3 shadow-2xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Lock className="w-3 h-3 text-emerald-600" /> SHA-256 Seal: {integrity.document_sha256.slice(0, 12)}...
            </span>
            <span className="text-slate-500">{integrity.integrity_status}</span>
          </div>
        )}

        {/* Action Buttons: Re-Audit, Dispute Letter, Certificate */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onReAudit}
            disabled={isReAuditing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReAuditing ? 'animate-spin' : ''}`} />
            <span>{isReAuditing ? 'Scanning...' : 'Run Re-Audit'}</span>
          </button>

          <button
            onClick={onGenerateDisputeLetter}
            className="flex items-center gap-1.5 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-medium transition-colors shadow-2xs"
          >
            <FileWarning className="w-3.5 h-3.5 text-amber-600" />
            <span>Dispute Memo</span>
          </button>

          <button
            onClick={onOpenCertificate}
            className="flex items-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 transition-colors shadow-2xs"
          >
            <Award className="w-3.5 h-3.5 text-brand-600" />
            <span>Audit Cert</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/70 border-b border-slate-200 text-xs">
        <span className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">
          Audit Findings ({filteredFindings.length})
        </span>

        <div className="flex items-center gap-1 bg-slate-200/70 border border-slate-200 p-0.5 rounded-lg">
          {(['ALL', 'CRITICAL', 'WARNING', 'RESOLVED'] as const).map((sev) => {
            const count = sev === 'ALL' 
              ? findings.length 
              : sev === 'RESOLVED'
              ? findings.filter((f) => f.status === 'RESOLVED').length
              : findings.filter((f) => f.severity === sev && f.status !== 'RESOLVED').length;

            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  filterSeverity === sev
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev.charAt(0) + sev.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Findings List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
        {filteredFindings.map((finding) => {
          const isCritical = finding.severity === 'CRITICAL';
          const isWarning = finding.severity === 'WARNING';
          const isResolved = finding.status === 'RESOLVED';

          return (
            <div
              key={finding.id}
              className={`p-3.5 rounded-xl border transition-all shadow-2xs ${
                isResolved
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : isCritical
                  ? 'bg-white border-red-200 hover:border-red-300'
                  : isWarning
                  ? 'bg-white border-amber-200 hover:border-amber-300'
                  : 'bg-white border-emerald-200'
              }`}
            >
              {/* Finding Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {isResolved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCritical ? (
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className={`font-semibold text-xs leading-tight ${isResolved ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {finding.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isCritical
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isResolved ? 'RESOLVED' : finding.severity}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {finding.description}
              </p>

              {/* Expected vs Actual Diff Box */}
              {(finding.expected_value || finding.actual_value) && (
                <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-200 text-[11px] font-mono space-y-1">
                  {finding.expected_value && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Expected:</span>
                      <span className="text-emerald-700 font-semibold">{finding.expected_value}</span>
                    </div>
                  )}
                  {finding.actual_value && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Stated:</span>
                      <span className="text-red-700 font-bold">{finding.actual_value}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Auditor Resolution Notes if present */}
              {finding.auditor_notes && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-2 mb-2 text-[10px] text-emerald-800 font-mono">
                  <strong>Auditor Note:</strong> {finding.auditor_notes}
                </div>
              )}

              {/* Citation Snippet & Rule */}
              <div className="bg-slate-50 rounded p-2 mb-2 border border-slate-200 text-[10px] text-slate-600 font-mono">
                <span className="text-brand-700 font-semibold block mb-0.5">Grounding Evidence:</span>
                <span className="italic">{finding.citation_evidence}</span>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] flex-wrap gap-2">
                <span className="text-slate-400 font-mono text-[10px]">
                  {finding.audit_rule.split(':')[0]} • Page {finding.page_number}
                </span>

                <div className="flex items-center gap-2">
                  {finding.remediation && !isResolved && (
                    <button
                      onClick={() => onOpenRemediation(finding)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium text-[10px] transition-colors"
                    >
                      <FileEdit className="w-3 h-3 text-brand-600" />
                      <span>Review Redline</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSpotlight(finding.page_number, finding.bounding_box)}
                    className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold hover:underline"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Spotlight</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
