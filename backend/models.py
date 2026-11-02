from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    # Normalized coordinates 0-1000 for standard page rendering
    ymin: float
    xmin: float
    ymax: float
    xmax: float

class DocumentElement(BaseModel):
    id: str
    page: int
    element_type: Literal["text", "header", "table_cell", "metric", "signature", "badge", "clause"]
    bbox: BoundingBox
    text: str
    confidence: float = 0.98
    meta: Dict[str, Any] = Field(default_factory=dict)

class AuditFinding(BaseModel):
    id: str
    severity: Literal["CRITICAL", "WARNING", "INFO", "VERIFIED"]
    category: Literal[
        "ARITHMETIC_ERROR",
        "TAX_DISCREPANCY",
        "LEGAL_LIABILITY",
        "MISSING_AUTHORIZATION",
        "TIMELINE_PARADOX",
        "POLICY_VIOLATION",
        "GROUNDING_VERIFIED"
    ]
    title: str
    description: str
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    page_number: int
    bounding_box: BoundingBox
    audit_rule: str
    citation_evidence: str
    confidence_score: float = 0.95
    status: Literal["FLAGGED", "RESOLVED", "ACCEPTED"] = "FLAGGED"

class Citation(BaseModel):
    id: str
    page: int
    bounding_box: BoundingBox
    source_snippet: str
    relevance_score: float
    claim_supported: bool = True

class ChatRequest(BaseModel):
    question: str
    document_id: str

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]
    grounding_score: float
    reasoning_steps: List[str]
    hallucination_check_passed: bool

class DocumentMetadata(BaseModel):
    id: str
    title: str
    category: str
    total_pages: int
    file_size_kb: float
    uploaded_at: str
    health_score: int
    critical_issues: int
    warnings: int
    status: str

class DocumentDetail(BaseModel):
    metadata: DocumentMetadata
    pages_content: List[Dict[str, Any]]
    elements: List[DocumentElement]
    findings: List[AuditFinding]
    summary: str
    metrics: Dict[str, Any]
    reconciliation_data: Optional[Dict[str, Any]] = None
