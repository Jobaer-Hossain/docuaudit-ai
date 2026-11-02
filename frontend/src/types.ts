export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DocumentElement {
  id: string;
  page: number;
  element_type: 'text' | 'header' | 'table_cell' | 'metric' | 'signature' | 'badge' | 'clause';
  bbox: BoundingBox;
  text: string;
  confidence: number;
  meta?: Record<string, any>;
}

export interface FindingRemediation {
  action_type: 'REDLINE_CLAUSE' | 'MATH_ADJUSTMENT' | 'SIGNATURE_ESCALATION' | 'DISPUTE_NOTICE';
  title: string;
  original_text: string;
  proposed_remediation: string;
  rationale: string;
  risk_reduction_pct: number;
}

export interface AuditFinding {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'VERIFIED';
  category: string;
  title: string;
  description: string;
  expected_value?: string;
  actual_value?: string;
  page_number: number;
  bounding_box: BoundingBox;
  audit_rule: string;
  citation_evidence: string;
  confidence_score: number;
  status: 'FLAGGED' | 'RESOLVED' | 'ACCEPTED_EXCEPTION';
  auditor_notes?: string;
  remediation?: FindingRemediation;
}

export interface Citation {
  id: string;
  page: number;
  bounding_box: BoundingBox;
  source_snippet: string;
  relevance_score: number;
  claim_supported: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  groundingScore?: number;
  reasoningSteps?: string[];
  timestamp: string;
}

export interface IntegrityRecord {
  document_sha256: string;
  audit_trail_sha256: string;
  integrity_status: 'VERIFIED_INTACT' | 'TAMPER_DETECTED';
  sealed_at: string;
  verified_elements_count: number;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  category: string;
  total_pages: number;
  file_size_kb: number;
  uploaded_at: string;
  health_score: number;
  critical_issues: number;
  warnings: number;
  status: string;
  sha256_hash?: string;
}

export interface PageContent {
  page: number;
  title: string;
  width: number;
  height: number;
}

export interface DocumentDetail {
  metadata: DocumentMetadata;
  pages_content: PageContent[];
  elements: DocumentElement[];
  findings: AuditFinding[];
  summary: string;
  metrics: Record<string, any>;
  integrity?: IntegrityRecord;
  reconciliation_data?: Record<string, any>;
}

export interface AuditCertificate {
  certificate_id: string;
  document_title: string;
  health_score: string;
  compliance_tier: string;
  critical_violations: number;
  warnings: number;
  audited_summary: string;
  findings_digest: Array<{
    rule: string;
    severity: string;
    title: string;
    evidence: string;
    expected?: string;
    actual?: string;
    page: number;
    status?: string;
  }>;
  tamper_proof_hash: string;
}
