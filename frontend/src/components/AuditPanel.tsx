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
  CheckCircle2,
  ShieldCheck,
  ChevronRight
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
  onUpdateFindingStatus,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'>('ALL');

  const { metadata, findings, metrics, summary, integrity } = document;

  const filteredFindings = findings.filter((f) => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'RESOLVED') return f.status === 'RESOLVED';
    return f.severity === filterSeverity && f.status !== 'RESOLVED';
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-red-400 border-red-500/40 bg-red-500/10';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Executive Health Score Banner */}
      <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-slate-100 text-sm tracking-wide uppercase">
                Autonomous Compliance Health
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {summary}
            </p>
          </div>

          {/* Health Score Gauge */}
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 ${getScoreColor(metadata.health_score)} shadow-lg shrink-0`}>
            <span className="text-2xl font-black font-mono">
              {metadata.health_score}
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Score / 100
            </span>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          {metrics.discrepancy_amount && (
            <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-2.5">
              <span className="text-[10px] text-red-300 uppercase tracking-wider block font-semibold">
                Financial Discrepancy
              </span>
              <span className="text-sm font-bold text-red-400 font-mono">
                {metrics.discrepancy_amount}
              </span>
            </div>
          )}

          {metrics.liability_cap && (
            <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-2.5">
              <span className="text-[10px] text-red-300 uppercase tracking-wider block font-semibold">
                Liability Exposure
              </span>
              <span className="text-sm font-bold text-red-400 font-mono">
                {metrics.liability_cap}
              </span>
            </div>
          )}

          {metrics.claimed_total && (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Claimed vs True Total
              </span>
              <span className="text-xs font-mono text-slate-200">
                {metrics.claimed_total} vs <strong className="text-emerald-400">{metrics.audited_true_total}</strong>
              </span>
            </div>
          )}

          {metrics.compliance_status && (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Audit Status
              </span>
              <span className="text-xs font-semibold text-amber-300">
                {metrics.compliance_status}
              </span>
            </div>
          )}
        </div>

        {/* Cryptographic Hash Seal Strip */}
        {integrity && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 mb-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Lock className="w-3 h-3" /> SHA-256 Seal: {integrity.document_sha256.slice(0, 12)}...
            </span>
            <span className="text-slate-500">{integrity.integrity_status}</span>
          </div>
        )}

        {/* Action Buttons: Re-Audit, Dispute Letter, Certificate */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onReAudit}
            disabled={isReAuditing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-brand-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReAuditing ? 'animate-spin' : ''}`} />
            <span>{isReAuditing ? 'Scanning...' : 'Run Re-Audit'}</span>
          </button>

          <button
            onClick={onGenerateDisputeLetter}
            className="flex items-center gap-1.5 py-2 px-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 rounded-lg text-xs font-semibold transition-colors"
          >
            <FileWarning className="w-3.5 h-3.5 text-amber-400" />
            <span>Dispute Memo</span>
          </button>

          <button
            onClick={onOpenCertificate}
            className="flex items-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-brand-400" />
            <span>Audit Cert</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[11px] tracking-wide">
          Audit Findings ({filteredFindings.length})
        </span>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
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
                    ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev.charAt(0) + sev.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Findings List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredFindings.map((finding) => {
          const isCritical = finding.severity === 'CRITICAL';
          const isWarning = finding.severity === 'WARNING';
          const isResolved = finding.status === 'RESOLVED';

          return (
            <div
              key={finding.id}
              className={`p-3.5 rounded-xl border transition-all hover:shadow-lg ${
                isResolved
                  ? 'bg-emerald-950/15 border-emerald-900/50 opacity-80'
                  : isCritical
                  ? 'bg-red-950/20 border-red-900/60 hover:border-red-600/80'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-900/60 hover:border-amber-600/80'
                  : 'bg-emerald-950/20 border-emerald-900/60'
              }`}
            >
              {/* Finding Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {isResolved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCritical ? (
                    <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className={`font-bold text-xs leading-tight ${isResolved ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                    {finding.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isCritical
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isResolved ? 'RESOLVED' : finding.severity}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {finding.description}
              </p>

              {/* Expected vs Actual Diff Box */}
              {(finding.expected_value || finding.actual_value) && (
                <div className="bg-slate-950/80 rounded-lg p-2.5 mb-3 border border-slate-800 text-[11px] font-mono space-y-1">
                  {finding.expected_value && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Expected:</span>
                      <span className="text-emerald-400 font-medium">{finding.expected_value}</span>
                    </div>
                  )}
                  {finding.actual_value && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Stated:</span>
                      <span className="text-red-400 font-semibold">{finding.actual_value}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Auditor Resolution Notes if present */}
              {finding.auditor_notes && (
                <div className="bg-emerald-950/30 border border-emerald-900/50 rounded p-2 mb-2 text-[10px] text-emerald-300 font-mono">
                  <strong>Auditor Sign-off:</strong> {finding.auditor_notes}
                </div>
              )}

              {/* Citation Snippet & Rule */}
              <div className="bg-slate-900/60 rounded p-2 mb-2 border border-slate-800/80 text-[10px] text-slate-400 font-mono">
                <span className="text-brand-400 font-semibold block mb-0.5">Grounding Evidence:</span>
                <span className="italic">{finding.citation_evidence}</span>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] flex-wrap gap-2">
                <span className="text-slate-500 font-mono text-[10px]">
                  {finding.audit_rule.split(':')[0]} • Page {finding.page_number}
                </span>

                <div className="flex items-center gap-2">
                  {/* AI Remediation Button */}
                  {finding.remediation && !isResolved && (
                    <button
                      onClick={() => onOpenRemediation(finding)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-medium text-[10px] transition-colors"
                    >
                      <FileEdit className="w-3 h-3 text-brand-400" />
                      <span>Review Redline</span>
                    </button>
                  )}

                  {/* Spotlight Button */}
                  <button
                    onClick={() => onSpotlight(finding.page_number, finding.bounding_box)}
                    className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold hover:underline"
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
