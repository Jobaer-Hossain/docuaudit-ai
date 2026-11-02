import hashlib
from typing import Dict, Any, List
from models import (
    DocumentDetail,
    DocumentMetadata,
    DocumentElement,
    AuditFinding,
    BoundingBox,
    FindingRemediation,
    IntegrityRecord
)

def compute_element_hash(elements: List[DocumentElement]) -> str:
    concat_text = "".join([f"{e.id}:{e.text}:{e.page}" for e in elements])
    return hashlib.sha256(concat_text.encode("utf-8")).hexdigest()

SAMPLE_DOCUMENTS: Dict[str, DocumentDetail] = {
    "inv-2026-8941": DocumentDetail(
        metadata=DocumentMetadata(
            id="inv-2026-8941",
            title="Enterprise Cloud Infrastructure Invoice #8941",
            category="Invoice / Billing",
            total_pages=2,
            file_size_kb=245.8,
            uploaded_at="2026-11-01 14:22:00",
            health_score=48,
            critical_issues=3,
            warnings=2,
            status="CRITICAL_RISK",
            sha256_hash="8f92a17cb25e4028bc74e92a488b0a991823dcf49b398687a2df6e59cba70412"
        ),
        summary="Audit failed 4 automated policy checks. Identified $4,436.00 in arithmetic overcharges, an inverted payment due date paradox, and an unexecuted CFO approval signature.",
        metrics={
            "vendor": "Apex Datacenter & Cloud Corp",
            "invoice_number": "INV-2026-8941",
            "invoice_date": "November 12, 2026",
            "payment_due": "November 02, 2026",
            "claimed_total": "$42,500.00",
            "audited_true_total": "$38,064.00",
            "discrepancy_amount": "+$4,436.00 (Overcharge)",
            "compliance_status": "Non-Compliant (SOX Section 404 Block)",
            "arithmetic_score": 45,
            "legal_score": 85,
            "auth_score": 30
        },
        integrity=IntegrityRecord(
            document_sha256="8f92a17cb25e4028bc74e92a488b0a991823dcf49b398687a2df6e59cba70412",
            audit_trail_sha256="4d71e21b850937a04870f0559ebf02e5bcfd600600a94379a008cb0ff2084c68",
            integrity_status="VERIFIED_INTACT",
            sealed_at="2026-11-01 14:22:05 UTC",
            verified_elements_count=13
        ),
        pages_content=[
            {
                "page": 1,
                "title": "Vendor Invoice - Summary & Line Items",
                "width": 800,
                "height": 1050
            },
            {
                "page": 2,
                "title": "Tax Schedule, Bank Details & Execution Signatures",
                "width": 800,
                "height": 1050
            }
        ],
        elements=[
            # Page 1 Elements
            DocumentElement(
                id="p1-el-1",
                page=1,
                element_type="header",
                bbox=BoundingBox(ymin=40, xmin=50, ymax=90, xmax=550),
                text="APEX DATACENTER & CLOUD CORP - ENTERPRISE INVOICE",
                confidence=0.99
            ),
            DocumentElement(
                id="p1-el-2",
                page=1,
                element_type="text",
                bbox=BoundingBox(ymin=105, xmin=50, ymax=165, xmax=380),
                text="Bill To: Globex International Operations LLC\n100 Enterprise Way, Suite 400\nAustin, TX 78701\nTax ID: US-882910394",
                confidence=0.98
            ),
            DocumentElement(
                id="p1-el-3",
                page=1,
                element_type="badge",
                bbox=BoundingBox(ymin=105, xmin=450, ymax=180, xmax=750),
                text="Invoice #: INV-2026-8941\nDate: 2026-11-12\nDue Date: 2026-11-02 (PAST DUE)\nPO Reference: PO-9021",
                confidence=0.99
            ),
            # Table Header
            DocumentElement(
                id="p1-el-tbl-head",
                page=1,
                element_type="table_cell",
                bbox=BoundingBox(ymin=210, xmin=50, ymax=245, xmax=750),
                text="Item # | Description | Units | Rate ($) | Stated Subtotal ($)",
                confidence=0.98
            ),
            # Line 1
            DocumentElement(
                id="p1-el-line-1",
                page=1,
                element_type="table_cell",
                bbox=BoundingBox(ymin=250, xmin=50, ymax=290, xmax=750),
                text="01 | Bare Metal Elastic Compute Cluster (64-core) | 10 | $1,200.00 | $12,000.00",
                confidence=0.99
            ),
            # Line 2
            DocumentElement(
                id="p1-el-line-2",
                page=1,
                element_type="table_cell",
                bbox=BoundingBox(ymin=295, xmin=50, ymax=335, xmax=750),
                text="02 | NVMe Tier-1 Hot Storage (50 TB) | 2 | $3,500.00 | $7,000.00",
                confidence=0.99
            ),
            # Line 3 (ARITHMETIC ERROR: 4 * 2450 = 9800, NOT 12800)
            DocumentElement(
                id="p1-el-line-3",
                page=1,
                element_type="table_cell",
                bbox=BoundingBox(ymin=340, xmin=50, ymax=385, xmax=750),
                text="03 | Dedicated GPU Node H100 (80GB VRAM) | 4 | $2,450.00 | $12,800.00",
                confidence=0.99,
                meta={"anomaly": "arithmetic_error", "expected": "$9,800.00", "stated": "$12,800.00"}
            ),
            # Line 4
            DocumentElement(
                id="p1-el-line-4",
                page=1,
                element_type="table_cell",
                bbox=BoundingBox(ymin=390, xmin=50, ymax=430, xmax=750),
                text="04 | Enterprise 24/7 Dedicated Support SLA | 1 | $3,000.00 | $3,000.00",
                confidence=0.99
            ),
            # Total summary block
            DocumentElement(
                id="p1-el-subtotal",
                page=1,
                element_type="metric",
                bbox=BoundingBox(ymin=450, xmin=450, ymax=485, xmax=750),
                text="Claimed Net Subtotal: $34,800.00",
                confidence=0.99
            ),
            DocumentElement(
                id="p1-el-tax",
                page=1,
                element_type="metric",
                bbox=BoundingBox(ymin=490, xmin=450, ymax=525, xmax=750),
                text="State & Cloud VAT (18%): $6,264.00",
                confidence=0.99
            ),
            DocumentElement(
                id="p1-el-grandtotal",
                page=1,
                element_type="metric",
                bbox=BoundingBox(ymin=530, xmin=450, ymax=575, xmax=750),
                text="TOTAL AMOUNT PAYABLE: $42,500.00 USD",
                confidence=0.99,
                meta={"anomaly": "tax_total_mismatch", "expected": "$38,064.00"}
            ),
            DocumentElement(
                id="p1-el-notes",
                page=1,
                element_type="text",
                bbox=BoundingBox(ymin=620, xmin=50, ymax=720, xmax=750),
                text="Payment Instructions: ACH / Wire Transfer to Silicon Bay Bank.\nRouting: 021000021 | Acct: 9948201948.\nLate payments accrue 2.5% penalty per month compounding.",
                confidence=0.97
            ),

            # Page 2 Elements
            DocumentElement(
                id="p2-el-audit-head",
                page=2,
                element_type="header",
                bbox=BoundingBox(ymin=50, xmin=50, ymax=95, xmax=650),
                text="COMPLIANCE SCHEDULE & DUAL EXECUTIVE AUTHORIZATION",
                confidence=0.99
            ),
            DocumentElement(
                id="p2-el-policy",
                page=2,
                element_type="clause",
                bbox=BoundingBox(ymin=120, xmin=50, ymax=220, xmax=750),
                text="Section 4.1: Corporate Procurement Policy §104 mandates that any single invoice exceeding $25,000.00 USD must have dual sign-off from both the Department VP and Chief Financial Officer prior to disbursement.",
                confidence=0.98
            ),
            DocumentElement(
                id="p2-el-sig-vp",
                page=2,
                element_type="signature",
                bbox=BoundingBox(ymin=250, xmin=50, ymax=350, xmax=380),
                text="Approved By: Sarah Jenkins, VP Infrastructure\nDigital Signature: [VERIFIED Cryptographic Hash SHA-256 e9a128f]\nSigned Date: 2026-11-03 10:14:02 UTC",
                confidence=0.99
            ),
            # Missing signature box
            DocumentElement(
                id="p2-el-sig-cfo",
                page=2,
                element_type="signature",
                bbox=BoundingBox(ymin=250, xmin=420, ymax=350, xmax=750),
                text="Approved By: Chief Financial Officer\nDigital Signature: [UNSIGNED - PENDING CFO AUTHORIZATION]\nStatus: BLOCKED FROM PAYMENT RELEASE",
                confidence=0.98,
                meta={"anomaly": "missing_required_signature"}
            ),
            DocumentElement(
                id="p2-el-regulatory-note",
                page=2,
                element_type="text",
                bbox=BoundingBox(ymin=400, xmin=50, ymax=480, xmax=750),
                text="Audit Trail Stamp: Log ID #AUD-991280. Disbursing funds without completed CFO countersignature constitutes an internal SOX Section 404 audit deficiency.",
                confidence=0.98
            )
        ],
        findings=[
            AuditFinding(
                id="find-arith-1",
                severity="CRITICAL",
                category="ARITHMETIC_ERROR",
                title="Line Item 03 Multiplicative Overcharge",
                description="Item 'Dedicated GPU Node H100': 4 units * $2,450.00 equals $9,800.00, but invoice billed $12,800.00. Vendor is overcharging by exactly $3,000.00 USD.",
                expected_value="$9,800.00 (4 * $2,450.00)",
                actual_value="$12,800.00",
                page_number=1,
                bounding_box=BoundingBox(ymin=340, xmin=50, ymax=385, xmax=750),
                audit_rule="RULE-FIN-01: Line Item Quantity × Unit Price must match stated Subtotal within ±$0.01 tolerance.",
                citation_evidence="Page 1, Row 3: '03 | Dedicated GPU Node H100 | 4 | $2,450.00 | $12,800.00'",
                confidence_score=0.99,
                status="FLAGGED",
                auditor_notes="Confirmed mathematical error in vendor billing template. Credit memo required.",
                remediation=FindingRemediation(
                    action_type="MATH_ADJUSTMENT",
                    title="Correct Line Item 03 & Issue Dispute Credit Memo",
                    original_text="03 | Dedicated GPU Node H100 | 4 | $2,450.00 | $12,800.00",
                    proposed_remediation="03 | Dedicated GPU Node H100 | 4 | $2,450.00 | $9,800.00 (Credit Adjustment -$3,000.00)",
                    rationale="Enforces exact mathematical billing contract rates. Recovers $3,000.00 unauthorized overbill.",
                    risk_reduction_pct=100
                )
            ),
            AuditFinding(
                id="find-tax-1",
                severity="CRITICAL",
                category="TAX_DISCREPANCY",
                title="Grand Total Summation Mismatch (Hidden Charge)",
                description="The Stated Subtotal ($34,800.00) + 18% VAT ($6,264.00) equals $41,064.00. However, Grand Total is stated as $42,500.00. There is an unaccounted discrepancy of $1,436.00.",
                expected_value="$41,064.00 (or $38,064.00 with audited GPU line)",
                actual_value="$42,500.00",
                page_number=1,
                bounding_box=BoundingBox(ymin=530, xmin=450, ymax=575, xmax=750),
                audit_rule="RULE-FIN-02: Total Amount Payable must mathematically equal Subtotal + Taxes - Discounts.",
                citation_evidence="Page 1, Bottom Right: 'Claimed Net: $34,800.00' + 'VAT (18%): $6,264.00' -> 'TOTAL AMOUNT PAYABLE: $42,500.00'",
                confidence_score=0.99,
                status="FLAGGED",
                remediation=FindingRemediation(
                    action_type="MATH_ADJUSTMENT",
                    title="Recalculate Net Subtotal and True Tax Total",
                    original_text="TOTAL AMOUNT PAYABLE: $42,500.00 USD",
                    proposed_remediation="TOTAL AUDITED PAYABLE: $38,064.00 USD (Net: $31,800.00 + VAT: $6,264.00)",
                    rationale="Eliminates the phantom $1,436.00 surcharge and incorporates the Line 03 correction.",
                    risk_reduction_pct=100
                )
            ),
            AuditFinding(
                id="find-sig-1",
                severity="CRITICAL",
                category="MISSING_AUTHORIZATION",
                title="Missing Required CFO Execution Signature",
                description="Procurement Policy §104 mandates dual executive approval for disbursements >$25,000. The invoice lacks the CFO digital certificate.",
                expected_value="Verified Cryptographic Signature from Authorized CFO",
                actual_value="[UNSIGNED - PENDING CFO AUTHORIZATION]",
                page_number=2,
                bounding_box=BoundingBox(ymin=250, xmin=420, ymax=350, xmax=750),
                audit_rule="RULE-COMPL-04: Disbursement threshold >= $25k requires dual cryptographic sign-off.",
                citation_evidence="Page 2, Box 2: 'Digital Signature: [UNSIGNED - PENDING CFO AUTHORIZATION]'",
                confidence_score=0.98,
                status="FLAGGED",
                remediation=FindingRemediation(
                    action_type="SIGNATURE_ESCALATION",
                    title="Trigger Executive Approval Workflow to CFO",
                    original_text="Digital Signature: [UNSIGNED - PENDING CFO AUTHORIZATION]",
                    proposed_remediation="Dispatch automated authorization packet with corrected total ($38,064.00) to CFO Inbox.",
                    rationale="Ensures SOX 404 internal financial control compliance before wire transmission.",
                    risk_reduction_pct=95
                )
            ),
            AuditFinding(
                id="find-date-1",
                severity="WARNING",
                category="TIMELINE_PARADOX",
                title="Chronological Conflict: Payment Due Date Precedes Invoice Date",
                description="Invoice Issue Date is 2026-11-12, but Payment Due Date is marked as 2026-11-02 (10 days before the invoice was even generated).",
                expected_value="Due Date >= Invoice Date + 30 Days (Net-30 Standard)",
                actual_value="Due Date: 2026-11-02 vs Invoice Date: 2026-11-12",
                page_number=1,
                bounding_box=BoundingBox(ymin=105, xmin=450, ymax=180, xmax=750),
                audit_rule="RULE-PROC-09: Due Date must be chronologically progressive relative to Issue Date.",
                citation_evidence="Page 1, Header: 'Date: 2026-11-12 | Due Date: 2026-11-02 (PAST DUE)'",
                confidence_score=0.97,
                status="FLAGGED",
                remediation=FindingRemediation(
                    action_type="DISPUTE_NOTICE",
                    title="Amend Payment Due Date to Standard Net-30",
                    original_text="Date: 2026-11-12 | Due Date: 2026-11-02",
                    proposed_remediation="Date: 2026-11-12 | Due Date: 2026-12-12 (Net-30 Standard Terms)",
                    rationale="Avoids automated late penalty accruals triggered by vendor billing system glitch.",
                    risk_reduction_pct=85
                )
            ),
            AuditFinding(
                id="find-ground-1",
                severity="VERIFIED",
                category="GROUNDING_VERIFIED",
                title="Vendor Entity & Bank Routing Verified Against Global Registry",
                description="Apex Datacenter & Cloud Corp Tax ID US-882910394 and Silicon Bay Bank Routing #021000021 match verified master vendor records.",
                expected_value="Match active ERP Vendor Master File",
                actual_value="Verified SHA-256 match in ERP database",
                page_number=1,
                bounding_box=BoundingBox(ymin=40, xmin=50, ymax=90, xmax=550),
                audit_rule="RULE-KYV-01: Know-Your-Vendor verification check.",
                citation_evidence="Page 1, Header: 'APEX DATACENTER & CLOUD CORP'",
                confidence_score=0.99,
                status="RESOLVED"
            )
        ],
        reconciliation_data={
            "po_reference": "PO-9021",
            "invoice_reference": "INV-2026-8941",
            "po_budget_approved": "$35,064.00",
            "invoice_billed": "$42,500.00",
            "variance": "+$7,436.00 (+21.2%)",
            "items_comparison": [
                {
                    "item": "Elastic Compute Cluster (64-core)",
                    "po_qty": 10,
                    "inv_qty": 10,
                    "po_rate": 1200.00,
                    "inv_rate": 1200.00,
                    "match": True
                },
                {
                    "item": "NVMe Tier-1 Storage (50 TB)",
                    "po_qty": 2,
                    "inv_qty": 2,
                    "po_rate": 3500.00,
                    "inv_rate": 3500.00,
                    "match": True
                },
                {
                    "item": "Dedicated GPU Node H100",
                    "po_qty": 4,
                    "inv_qty": 4,
                    "po_rate": 2450.00,
                    "inv_rate": 3200.00,
                    "match": False,
                    "issue": "Line item arithmetic inflated on invoice by $3,000.00"
                },
                {
                    "item": "24/7 Dedicated Support SLA",
                    "po_qty": 1,
                    "inv_qty": 1,
                    "po_rate": 3000.00,
                    "inv_rate": 3000.00,
                    "match": True
                }
            ]
        }
    ),

    "msa-contract-7740": DocumentDetail(
        metadata=DocumentMetadata(
            id="msa-contract-7740",
            title="Strategic Master Services Agreement (Nexus BioTech)",
            category="Legal Contract",
            total_pages=2,
            file_size_kb=312.4,
            uploaded_at="2026-11-01 16:45:10",
            health_score=55,
            critical_issues=2,
            warnings=3,
            status="HIGH_RISK",
            sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        ),
        summary="Legal audit agent detected an Uncapped Consequential Damages liability clause (violating risk limits), an anomalous Foreign Arbitration seat, and an Asymmetric 24-Hour Termination clause.",
        metrics={
            "party_a": "Nexus BioTech Inc. (Client)",
            "party_b": "OmniSoft Global Systems Corp (Contractor)",
            "contract_type": "Master Services Agreement (MSA)",
            "effective_date": "October 15, 2026",
            "liability_cap": "UNCAPPED (High Legal Exposure)",
            "jurisdiction": "Zurich, Switzerland (Anomalous for US entities)",
            "termination_notice": "24 Hours (Asymmetric Client Right)",
            "compliance_status": "High Risk - Redline Recommended",
            "arithmetic_score": 100,
            "legal_score": 42,
            "auth_score": 95
        },
        integrity=IntegrityRecord(
            document_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            audit_trail_sha256="7a66f019bb2c1b489a742880c514801127e997bc56191f6920f18d7efee26a11",
            integrity_status="VERIFIED_INTACT",
            sealed_at="2026-11-01 16:45:15 UTC",
            verified_elements_count=8
        ),
        pages_content=[
            {
                "page": 1,
                "title": "MSA Recitals, Scope of Work & Compensation Terms",
                "width": 800,
                "height": 1050
            },
            {
                "page": 2,
                "title": "Indemnification, Limitation of Liability & Governing Law",
                "width": 800,
                "height": 1050
            }
        ],
        elements=[
            # Page 1
            DocumentElement(
                id="c1-el-title",
                page=1,
                element_type="header",
                bbox=BoundingBox(ymin=40, xmin=50, ymax=85, xmax=750),
                text="MASTER SERVICES AGREEMENT (CONTRACT REF: MSA-2026-7740)",
                confidence=0.99
            ),
            DocumentElement(
                id="c1-el-recitals",
                page=1,
                element_type="text",
                bbox=BoundingBox(ymin=95, xmin=50, ymax=185, xmax=750),
                text="This Master Services Agreement is entered into by Nexus BioTech Inc., a Delaware corporation ('Company'), and OmniSoft Global Systems Corp, a California corporation ('Contractor'). Effective as of October 15, 2026.",
                confidence=0.99
            ),
            DocumentElement(
                id="c1-el-sec1",
                page=1,
                element_type="clause",
                bbox=BoundingBox(ymin=200, xmin=50, ymax=310, xmax=750),
                text="SECTION 1: SCOPE OF SERVICES & DELIVERABLES\nContractor shall provide AI algorithmic pipeline development, bioinformatics modeling, and data infrastructure integration as outlined in individual Statements of Work (SOW). Standard delivery milestone turnaround is 14 calendar days.",
                confidence=0.98
            ),
            DocumentElement(
                id="c1-el-sec5",
                page=1,
                element_type="clause",
                bbox=BoundingBox(ymin=330, xmin=50, ymax=450, xmax=750),
                text="SECTION 5: PAYMENT & FEES\nCompany shall pay Contractor within forty-five (45) days following receipt of an undisputed itemized invoice. Late payments shall accrue interest at 1.0% per annum or the maximum rate permissible by law.",
                confidence=0.98
            ),
            DocumentElement(
                id="c1-el-sec9",
                page=1,
                element_type="clause",
                bbox=BoundingBox(ymin=470, xmin=50, ymax=600, xmax=750),
                text="SECTION 9: CONFIDENTIALITY & PROPRIETARY RIGHTS\nAll algorithms, source code, analytical models, and intellectual property generated by Contractor under this Agreement shall be deemed 'work made for hire' and remain the sole exclusive property of Company from inception.",
                confidence=0.99
            ),
            # Page 2
            DocumentElement(
                id="c2-el-sec11",
                page=2,
                element_type="clause",
                bbox=BoundingBox(ymin=50, xmin=50, ymax=200, xmax=750),
                text="SECTION 11.2: INDEMNIFICATION & LIABILITY (HIGH RISK EXPOSURE)\nContractor shall defend, indemnify, and hold harmless Company, its officers, directors, and affiliates from ANY and ALL claims, losses, lost profits, reputational harm, or indirect/consequential damages without financial cap or limitation whatsoever.",
                confidence=0.99,
                meta={"anomaly": "uncapped_liability"}
            ),
            DocumentElement(
                id="c2-el-sec14",
                page=2,
                element_type="clause",
                bbox=BoundingBox(ymin=220, xmin=50, ymax=340, xmax=750),
                text="SECTION 14.1: TERMINATION FOR CONVENIENCE\nCompany may terminate this Agreement or any Statement of Work immediately upon twenty-four (24) hours written notice to Contractor without penalty or payment for uncompleted milestone hours.",
                confidence=0.98,
                meta={"anomaly": "asymmetric_termination"}
            ),
            DocumentElement(
                id="c2-el-sec18",
                page=2,
                element_type="clause",
                bbox=BoundingBox(ymin=360, xmin=50, ymax=470, xmax=750),
                text="SECTION 18: GOVERNING LAW & ARBITRATION SEAT\nThis Agreement shall be interpreted in accordance with the substantive laws of the Canton of Zurich, Switzerland, and disputes resolved via Swiss Arbitration Centre in Zurich in the German language.",
                confidence=0.98,
                meta={"anomaly": "foreign_jurisdiction"}
            ),
            DocumentElement(
                id="c2-el-sig-both",
                page=2,
                element_type="signature",
                bbox=BoundingBox(ymin=500, xmin=50, ymax=620, xmax=750),
                text="Signed for Nexus BioTech Inc.: [Dr. Julian Vance, CEO - Executed]\nSigned for OmniSoft Global Corp: [Marcus Vance, CTO - Executed]\nTimestamp: 2026-10-15 18:20:00 PST",
                confidence=0.99
            )
        ],
        findings=[
            AuditFinding(
                id="find-legal-1",
                severity="CRITICAL",
                category="LEGAL_LIABILITY",
                title="Uncapped Consequential Damages Indemnity (Section 11.2)",
                description="Contractor agrees to indemnify Company for ALL claims including lost profits and indirect damages WITHOUT ANY CAP. Corporate standard requires capping liability at 1x-2x annual contract fees and explicitly excluding consequential damages.",
                expected_value="Mutual liability cap <= 200% of fees paid in preceding 12 months; exclusion of consequential damages",
                actual_value="Uncapped liability covering indirect, consequential, and reputational damages",
                page_number=2,
                bounding_box=BoundingBox(ymin=50, xmin=50, ymax=200, xmax=750),
                audit_rule="RULE-LEGAL-01: Commercial contracts must include mutual liability caps and consequential damage disclaimers.",
                citation_evidence="Page 2, Section 11.2: 'Contractor shall defend, indemnify... from ANY and ALL claims, lost profits... without financial cap or limitation whatsoever.'",
                confidence_score=0.99,
                status="FLAGGED",
                remediation=FindingRemediation(
                    action_type="REDLINE_CLAUSE",
                    title="Insert Standard Mutual Consequential Damages Cap",
                    original_text="Contractor shall defend, indemnify, and hold harmless Company from ANY and ALL claims, losses, lost profits, reputational harm, or indirect/consequential damages without financial cap or limitation whatsoever.",
                    proposed_remediation="Except for gross negligence or willful misconduct, neither party shall be liable for indirect, incidental, or consequential damages. Each party's aggregate aggregate liability under this Agreement shall not exceed the total fees paid or payable by Company in the twelve (12) months preceding the claim.",
                    rationale="Mitigates infinite balance-sheet exposure and restores market-standard mutual risk allocation.",
                    risk_reduction_pct=95
                )
            ),
            AuditFinding(
                id="find-term-1",
                severity="WARNING",
                category="POLICY_VIOLATION",
                title="Asymmetric 24-Hour Termination Without Cause (Section 14.1)",
                description="Client has right to terminate on 24 hours notice with zero payment for work-in-progress. Standard enterprise terms mandate 30 days notice with pro-rata compensation for accrued labor.",
                expected_value="30-day written notice with pro-rata payout for unbilled work",
                actual_value="24-hour immediate termination with zero payment for uncompleted milestones",
                page_number=2,
                bounding_box=BoundingBox(ymin=220, xmin=50, ymax=340, xmax=750),
                audit_rule="RULE-LEGAL-05: Termination for convenience must provide >= 30 calendar days notice with accrued compensation.",
                citation_evidence="Page 2, Section 14.1: 'terminate immediately upon twenty-four (24) hours written notice... without penalty or payment for uncompleted milestone hours.'",
                confidence_score=0.97,
                status="FLAGGED",
                remediation=FindingRemediation(
                    action_type="REDLINE_CLAUSE",
                    title="Amend Termination Notice to 30 Days with Pro-Rata Payment",
                    original_text="Company may terminate this Agreement immediately upon twenty-four (24) hours written notice without penalty or payment for uncompleted milestone hours.",
                    proposed_remediation="Either party may terminate this Agreement for convenience upon thirty (30) days prior written notice. Upon termination, Company shall pay Contractor for all authorized Services performed and non-cancelable expenses incurred up to the effective termination date.",
                    rationale="Protects against abrupt cancellation and guarantees payment for completed engineering sprints.",
                    risk_reduction_pct=90
                )
            ),
            AuditFinding(
                id="find-juris-1",
                severity="WARNING",
                category="POLICY_VIOLATION",
                title="Jurisdiction Anomaly: Swiss Law & Arbitration for US Domestic Entities",
                description="Both entities are US corporations (Delaware and California), but governing law is set to Zurich, Switzerland in German. This introduces severe cross-border legal friction and prohibitive litigation costs.",
                expected_value="State of Delaware or California, USA / American Arbitration Association (AAA)",
                actual_value="Canton of Zurich, Switzerland (German language proceedings)",
                page_number=2,
                bounding_box=BoundingBox(ymin=360, xmin=50, ymax=470, xmax=750),
                audit_rule="RULE-GOV-02: Domestic US contracts should designate domestic governing law unless foreign parent company is involved.",
                citation_evidence="Page 2, Section 18: 'substantive laws of the Canton of Zurich, Switzerland... Swiss Arbitration Centre in Zurich in the German language.'",
                confidence_score=0.96,
                status="FLAGGED",
                remediation=FindingRemediation(
                    action_type="REDLINE_CLAUSE",
                    title="Designate Domestic Delaware Jurisdiction & English Arbitration",
                    original_text="This Agreement shall be interpreted in accordance with the substantive laws of the Canton of Zurich, Switzerland, and disputes resolved via Swiss Arbitration Centre in Zurich in the German language.",
                    proposed_remediation="This Agreement shall be governed by the laws of the State of Delaware, USA. Any dispute arising hereunder shall be finally settled by arbitration administered by the American Arbitration Association (AAA) in New York, NY, in the English language.",
                    rationale="Drastically reduces legal overhead and standardizes dispute resolution for US corporate entities.",
                    risk_reduction_pct=88
                )
            )
        ]
    )
}
