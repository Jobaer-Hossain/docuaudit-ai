import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  Bot, 
  GitCompare, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon,
  ChevronDown
} from 'lucide-react';
import { DocumentDetail, DocumentMetadata, BoundingBox, DocumentElement } from './types';
import { fetchDocuments, fetchDocumentDetail, reAuditDocument } from './api';
import { DocumentViewer } from './components/DocumentViewer';
import { AuditPanel } from './components/AuditPanel';
import { ReconciliationView } from './components/ReconciliationView';
import { AgentChat } from './components/AgentChat';
import { UploadModal } from './components/UploadModal';
import { AuditCertificateModal } from './components/AuditCertificateModal';

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string>('inv-2026-8941');
  const [currentDocDetail, setCurrentDocDetail] = useState<DocumentDetail | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [focusedBbox, setFocusedBbox] = useState<BoundingBox | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'recon' | 'chat'>('audit');
  
  const [isUploadingOpen, setIsUploadingOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isReAuditing, setIsReAuditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load documents on mount
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

  // Load document detail when docId changes
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

    // Clear spotlight after 4.5 seconds
    setTimeout(() => {
      setFocusedBbox(null);
    }, 4500);
  };

  const handleSelectBboxElement = (el: DocumentElement) => {
    setFocusedBbox(el.bbox);
    // Switch to audit tab if clicking an element with anomaly
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

  const handleDocumentUploaded = (newDoc: DocumentDetail) => {
    setDocuments((prev) => [newDoc.metadata, ...prev]);
    setCurrentDocId(newDoc.metadata.id);
    setCurrentDocDetail(newDoc);
    setCurrentPage(1);
    setActiveTab('audit');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/90 px-6 flex items-center justify-between z-30 shrink-0 backdrop-blur">
        {/* Brand & Mission Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">
                DocuAudit <span className="text-brand-400">AI</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-brand-500/15 border border-brand-500/40 text-brand-300 font-bold">
                v2.4 Grounded Multi-Modal
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Autonomous Document Intelligence & Anti-Hallucination Audit Agent
            </p>
          </div>
        </div>

        {/* Center: Document Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentDocId}
              onChange={(e) => setCurrentDocId(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.status})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsUploadingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-brand-600/20 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-900/80 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Spatial Engine Connected</span>
          </div>
        </div>
      </header>

      {/* Main Studio Split Layout */}
      <main className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Left Pane: Interactive Document Canvas Viewer (60%) */}
        <div className="w-[58%] h-full flex flex-col">
          {loading || !currentDocDetail ? (
            <div className="flex flex-col items-center justify-center h-full bg-slate-900 border border-slate-800 rounded-xl">
              <Sparkles className="w-8 h-8 text-brand-400 animate-spin mb-2" />
              <span className="text-xs text-slate-400 font-mono">
                Extracting multi-modal layout & spatial coordinates...
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
        <div className="w-[42%] h-full flex flex-col bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800">
          {/* Studio Tab Bar */}
          <div className="flex items-center justify-between p-1.5 bg-slate-950/80 border-b border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'audit'
                    ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Audit Findings</span>
                {currentDocDetail && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500/20 text-red-300 font-mono">
                    {currentDocDetail.findings.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('recon')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'recon'
                    ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>3-Way Reconciliation</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Grounded Agent Chat</span>
              </button>
            </div>
          </div>

          {/* Active Studio Content */}
          <div className="flex-1 overflow-hidden p-1">
            {loading || !currentDocDetail ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-slate-500 font-mono">Loading document telemetry...</span>
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
    </div>
  );
};

export default App;
