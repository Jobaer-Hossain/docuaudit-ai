import { DocumentMetadata, DocumentDetail, ChatMessage, Citation, AuditCertificate } from './types';

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

export async function fetchAuditCertificate(docId: string): Promise<AuditCertificate> {
  const res = await fetch(`${API_BASE}/export-audit-cert/${docId}`);
  if (!res.ok) throw new Error('Failed to fetch certificate');
  return res.json();
}
