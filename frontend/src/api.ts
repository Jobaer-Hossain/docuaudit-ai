import { DocumentMetadata, DocumentDetail, Citation, AuditCertificate } from './types';

const API_BASE = 'http://127.0.0.1:8005/api';

export async function fetchDocuments(): Promise<DocumentMetadata[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function fetchDocumentDetail(docId: string): Promise<DocumentDetail> {
  const res = await fetch(`${API_BASE}/documents/${docId}`);
  if (!res.ok) throw new Error('Failed to fetch document detail');
  return res.json();
}

export async function uploadDocumentFile(file: File): Promise<DocumentDetail> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function sendGroundedChat(docId: string, question: string): Promise<{
  answer: string;
  citations: Citation[];
  grounding_score: number;
  reasoning_steps: string[];
  hallucination_check_passed: boolean;
}> {
  const res = await fetch(`${API_BASE}/documents/${docId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, document_id: docId }),
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json();
}

export async function reAuditDocument(docId: string): Promise<DocumentDetail> {
  const res = await fetch(`${API_BASE}/documents/${docId}/re-audit`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Re-audit failed');
  return res.json();
}

export async function updateFindingStatus(
  docId: string,
  findingId: string,
  status: 'FLAGGED' | 'RESOLVED' | 'ACCEPTED_EXCEPTION',
  notes?: string
): Promise<{
  finding_id: string;
  new_status: string;
  health_score: number;
  critical_issues: number;
  warnings: number;
}> {
  const res = await fetch(`${API_BASE}/documents/${docId}/findings/${findingId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error('Failed to update finding status');
  return res.json();
}

export async function generateDisputeLetter(docId: string): Promise<{ letter_markdown: string }> {
  const res = await fetch(`${API_BASE}/documents/${docId}/dispute-letter`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate dispute letter');
  return res.json();
}

export async function verifyIntegrity(docId: string): Promise<{
  document_id: string;
  status: string;
  document_hash: string;
  trail_hash: string;
  elements_audited: number;
  tamper_detected: boolean;
  verification_timestamp: string;
}> {
  const res = await fetch(`${API_BASE}/documents/${docId}/verify-integrity`);
  if (!res.ok) throw new Error('Failed to verify integrity');
  return res.json();
}

export async function fetchAuditCertificate(docId: string): Promise<AuditCertificate> {
  const res = await fetch(`${API_BASE}/export-audit-cert/${docId}`);
  if (!res.ok) throw new Error('Failed to fetch certificate');
  return res.json();
}
