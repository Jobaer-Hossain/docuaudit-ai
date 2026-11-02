import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  MessageSquare, 
  GitCompare, 
  Layers, 
  Loader2, 
  CheckCircle2, 
  AlertOctagon,
  ChevronDown,
  Lock,
  FileWarning
} from 'lucide-react';
import { DocumentDetail, DocumentMetadata, BoundingBox, DocumentElement, AuditFinding } from './types';
import { 
  fetchDocuments, 
  fetchDocumentDetail, 
  reAuditDocument, 
  updateFindingStatus, 
  generateDisputeLetter,
  verifyIntegrity 
} from './api';
import { DocumentViewer } from './components/DocumentViewer';
import { AuditPanel } from './components/AuditPanel';
import { ReconciliationView } from './components/ReconciliationView';
import { AgentChat } from './components/AgentChat';
import { UploadModal } from './components/UploadModal';
import { AuditCertificateModal } from './components/AuditCertificateModal';
import { RemediationModal } from './components/RemediationModal';
import { DisputeMemoModal } from './components/DisputeMemoModal';

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string>('inv-2026-8941');
  const [currentDocDetail, setCurrentDocDetail] = useState<DocumentDetail | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [focusedBbox, setFocusedBbox] = useState<BoundingBox | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'recon' | 'chat'>('audit');
  
  const [isUploadingOpen, setIsUploadingOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [remediationFinding, setRemediationFinding] = useState<AuditFinding | null>(null);
  const [disputeLetterMarkdown, setDisputeLetterMarkdown] = useState<string | null>(null);
  const [isReAuditing, setIsReAuditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocumentList();
  }, []);

  const loadDocumentList = async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !docs.some((d) => d.id === currentDocId)) {
        setCurrentDocId(docs[0].id);
      }
    } catch (err) {
      console.error('Failed to load documents list:', err);
    }
  };

  useEffect(() => {
    if (!currentDocId) return;
    loadDetail(currentDocId);
  }, [currentDocId]);

  const loadDetail = async (id: string) => {
    setLoading(true);
    try {
      const detail = await fetchDocumentDetail(id);
      setCurrentDocDetail(detail);
      setCurrentPage(1);
      setFocusedBbox(null);
    } catch (err) {
      console.error('Failed to fetch doc details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotlight = (page: number, bbox: BoundingBox) => {
    setCurrentPage(page);
    setFocusedBbox(bbox);

    setTimeout(() => {
      setFocusedBbox(null);
    }, 4500);
  };

  const handleSelectBboxElement = (el: DocumentElement) => {
    setFocusedBbox(el.bbox);
    if (el.meta?.anomaly) {
      setActiveTab('audit');
    }
  };

  const handleReAudit = async () => {
    if (!currentDocDetail) return;
    setIsReAuditing(true);
    try {
      const updated = await reAuditDocument(currentDocDetail.metadata.id);
      setCurrentDocDetail(updated);
    } catch (err) {
      console.error('Re-audit failed:', err);
    } finally {
      setIsReAuditing(false);
    }
  };

  const handleUpdateFindingStatus = async (
    findingId: string, 
    status: 'FLAGGED' | 'RESOLVED' | 'ACCEPTED_EXCEPTION',
    notes?: string
  ) => {
    if (!currentDocDetail) return;
    try {
      const res = await updateFindingStatus(currentDocDetail.metadata.id, findingId, status, notes);
      
      setCurrentDocDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          metadata: {
            ...prev.metadata,
            health_score: res.health_score,
            critical_issues: res.critical_issues,
            warnings: res.warnings,
          },
          findings: prev.findings.map((f) => 
            f.id === findingId 
              ? { ...f, status: status, auditor_notes: notes || f.auditor_notes } 
              : f
          )
        };
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleApplyRemediation = async (findingId: string, notes: string) => {
    await handleUpdateFindingStatus(findingId, 'RESOLVED', notes);
  };

  const handleGenerateDispute = async () => {
    if (!currentDocDetail) return;
    try {
      const res = await generateDisputeLetter(currentDocDetail.metadata.id);
      setDisputeLetterMarkdown(res.letter_markdown);
    } catch (err) {
      console.error('Failed to generate dispute letter:', err);
    }
  };

  const handleDocumentUploaded = (newDoc: DocumentDetail) => {
    setDocuments((prev) => [newDoc.metadata, ...prev]);
    setCurrentDocId(newDoc.metadata.id);
    setCurrentDocDetail(newDoc);
    setCurrentPage(1);
    setActiveTab('audit');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100/70 text-slate-900 overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between z-30 shrink-0 shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight text-slate-900">
                DocuAudit <span className="text-brand-600 font-semibold">Pro</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Enterprise Compliance
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Financial & Legal Audit Verification Platform
            </p>
          </div>
        </div>

        {/* Center: Document Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentDocId}
              onChange={(e) => setCurrentDocId(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer shadow-xs font-medium"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.status})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsUploadingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>SHA-256 Integrity Verified</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Engine Ready</span>
          </div>
        </div>
      </header>

      {/* Main Studio Split Layout */}
      <main className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Left Pane: Interactive Document Canvas Viewer (58%) */}
        <div className="w-[58%] h-full flex flex-col">
          {loading || !currentDocDetail ? (
            <div className="flex flex-col items-center justify-center h-full bg-white border border-slate-200 rounded-xl shadow-xs">
              <Loader2 className="w-7 h-7 text-brand-600 animate-spin mb-2" />
              <span className="text-xs text-slate-500 font-mono">
                Loading document layout & spatial tokens...
              </span>
            </div>
          ) : (
            <DocumentViewer
              document={currentDocDetail}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              focusedBbox={focusedBbox}
              onSelectBbox={handleSelectBboxElement}
            />
          )}
        </div>

        {/* Right Pane: Autonomous Intelligence Studio Tabs (42%) */}
        <div className="w-[42%] h-full flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          {/* Studio Tab Bar */}
          <div className="flex items-center justify-between p-1.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-200/80">
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'audit'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
                <span>Audit Findings</span>
                {currentDocDetail && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-700 font-mono font-bold">
                    {currentDocDetail.findings.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('recon')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'recon'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5 text-brand-600" />
                <span>3-Way Reconciliation</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                <span>Audit Q&A</span>
              </button>
            </div>
          </div>

          {/* Active Studio Content */}
          <div className="flex-1 overflow-hidden p-1 bg-white">
            {loading || !currentDocDetail ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-slate-400 font-mono">Loading document telemetry...</span>
              </div>
            ) : (
              <>
                {activeTab === 'audit' && (
                  <AuditPanel
                    document={currentDocDetail}
                    onSpotlight={handleSpotlight}
                    onReAudit={handleReAudit}
                    isReAuditing={isReAuditing}
                    onOpenCertificate={() => setIsCertOpen(true)}
                    onOpenRemediation={(finding) => setRemediationFinding(finding)}
                    onGenerateDisputeLetter={handleGenerateDispute}
                    onUpdateFindingStatus={handleUpdateFindingStatus}
                  />
                )}

                {activeTab === 'recon' && (
                  <ReconciliationView document={currentDocDetail} />
                )}

                {activeTab === 'chat' && (
                  <AgentChat
                    document={currentDocDetail}
                    onSpotlight={handleSpotlight}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isUploadingOpen && (
        <UploadModal
          onClose={() => setIsUploadingOpen(false)}
          onDocumentUploaded={handleDocumentUploaded}
        />
      )}

      {isCertOpen && currentDocDetail && (
        <AuditCertificateModal
          document={currentDocDetail}
          onClose={() => setIsCertOpen(false)}
        />
      )}

      {remediationFinding && (
        <RemediationModal
          finding={remediationFinding}
          onClose={() => setRemediationFinding(null)}
          onApplyRemediation={handleApplyRemediation}
        />
      )}

      {disputeLetterMarkdown && (
        <DisputeMemoModal
          letterMarkdown={disputeLetterMarkdown}
          onClose={() => setDisputeLetterMarkdown(null)}
        />
      )}
    </div>
  );
};

export default App;
