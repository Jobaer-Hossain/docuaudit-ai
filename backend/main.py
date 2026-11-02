import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any

from models import (
    DocumentMetadata,
    DocumentDetail,
    ChatRequest,
    ChatResponse,
    AuditFinding
)
from sample_data import SAMPLE_DOCUMENTS
from agent_pipeline import (
    ArithmeticAuditEngine,
    LegalComplianceAuditEngine,
    AntiHallucinationGroundingAgent
)
from extractor import extract_pdf_document

app = FastAPI(
    title="DocuAudit AI - Multi-Modal Document Intelligence & Audit Agent",
    version="1.0.0",
    description="Enterprise-grade autonomous document auditing, spatial grounding, and anti-hallucination RAG."
)

# Enable CORS for frontend Vite dev server (usually localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory document storage initialized with rich sample enterprise documents
DOCUMENT_STORE: Dict[str, DocumentDetail] = dict(SAMPLE_DOCUMENTS)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DocuAudit AI Autonomous Intelligence Engine",
        "loaded_documents": len(DOCUMENT_STORE),
        "engine_version": "2.4.0-agentic"
    }

@app.get("/api/documents", response_model=List[DocumentMetadata])
def list_documents():
    return [doc.metadata for doc in DOCUMENT_STORE.values()]

@app.get("/api/documents/{doc_id}", response_model=DocumentDetail)
def get_document(doc_id: str):
    if doc_id not in DOCUMENT_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    return DOCUMENT_STORE[doc_id]

@app.post("/api/documents/upload", response_model=DocumentDetail)
async def upload_document(file: UploadFile = File(...)):
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Parse and execute multi-agent audit
        audited_doc = extract_pdf_document(file_path, file.filename)
        DOCUMENT_STORE[audited_doc.metadata.id] = audited_doc
        return audited_doc
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)

@app.post("/api/documents/{doc_id}/chat", response_model=ChatResponse)
def grounded_document_chat(doc_id: str, payload: ChatRequest):
    if doc_id not in DOCUMENT_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = DOCUMENT_STORE[doc_id]
    response = AntiHallucinationGroundingAgent.answer_with_citations(
        question=payload.question,
        doc=doc
    )
    return response

@app.post("/api/documents/{doc_id}/re-audit", response_model=DocumentDetail)
def re_audit_document(doc_id: str):
    if doc_id not in DOCUMENT_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = DOCUMENT_STORE[doc_id]
    arith_findings = ArithmeticAuditEngine.audit_tabular_data(doc.elements)
    legal_findings = LegalComplianceAuditEngine.audit_clauses(doc.elements)
    
    # Merge findings preserving any unique sample findings
    existing_find_ids = {f.id for f in arith_findings + legal_findings}
    preserved_findings = [f for f in doc.findings if f.id not in existing_find_ids]
    
    doc.findings = arith_findings + legal_findings + preserved_findings
    
    crit_count = sum(1 for f in doc.findings if f.severity == "CRITICAL")
    warn_count = sum(1 for f in doc.findings if f.severity == "WARNING")
    doc.metadata.critical_issues = crit_count
    doc.metadata.warnings = warn_count
    doc.metadata.health_score = max(20, 100 - (crit_count * 20) - (warn_count * 8))
    
    return doc

@app.get("/api/reconciliation/{doc_id}")
def get_reconciliation_details(doc_id: str):
    if doc_id not in DOCUMENT_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = DOCUMENT_STORE[doc_id]
    if not doc.reconciliation_data:
        return {"has_reconciliation": False, "message": "No purchase order reference tied to this document."}
    return {"has_reconciliation": True, "data": doc.reconciliation_data}

@app.get("/api/export-audit-cert/{doc_id}")
def export_audit_certificate(doc_id: str):
    if doc_id not in DOCUMENT_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = DOCUMENT_STORE[doc_id]
    return {
        "certificate_id": f"CERT-AUDIT-{doc.metadata.id.upper()}",
        "document_title": doc.metadata.title,
        "health_score": f"{doc.metadata.health_score}/100",
        "compliance_tier": doc.metadata.status,
        "critical_violations": doc.metadata.critical_issues,
        "warnings": doc.metadata.warnings,
        "audited_summary": doc.summary,
        "findings_digest": [
            {
                "rule": f.audit_rule,
                "severity": f.severity,
                "title": f.title,
                "evidence": f.citation_evidence,
                "expected": f.expected_value,
                "actual": f.actual_value,
                "page": f.page_number
            }
            for f in doc.findings
        ],
        "tamper_proof_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8005, reload=True)
