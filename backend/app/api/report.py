from fastapi import APIRouter, HTTPException, Response
from app.api.history import get_audit
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO

router = APIRouter()

@router.get("/report/{audit_id}")
async def generate_pdf_report(audit_id: str):
    audit_obj = get_audit(audit_id)
    if not audit_obj:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    audit = audit_obj.model_dump()
        
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    styles = getSampleStyleSheet()
    story = []

    # Custom Styles
    styles.add(ParagraphStyle(name='AuditTitle', parent=styles['Heading1'], alignment=1, fontSize=16, spaceAfter=20, textTransform='uppercase')) # Center
    styles.add(ParagraphStyle(name='AuditSection', parent=styles['Heading4'], fontSize=11, spaceBefore=12, spaceAfter=6))
    styles.add(ParagraphStyle(name='AuditBody', parent=styles['Normal'], fontSize=10, leading=14, alignment=4)) # Justified
    styles.add(ParagraphStyle(name='Signature', parent=styles['Normal'], fontSize=10, leading=14, spaceBefore=4))

    # HEADER
    story.append(Paragraph("INDEPENDENT AUDITOR'S REPORT", styles['AuditTitle']))
    story.append(Spacer(1, 12))
    story.append(Paragraph("To the Board of Directors and Shareholders", styles['AuditBody']))
    story.append(Spacer(1, 12))

    # OPINION
    score = audit['compliance_score']['final_score']
    band = audit['compliance_score']['risk_band']
    opinion_text = (
        f"We have audited the accompanying dataset transaction_data.csv. In our opinion, "
        f"except for the effects of the matters described in the Basis for Qualified Opinion section, "
        f"the data presents strictly to compliance standards (Score: {score}/100 - {band})."
    )
    story.append(Paragraph("Opinion", styles['AuditSection']))
    story.append(Paragraph(opinion_text, styles['AuditBody']))

    # BASIS FOR OPINION
    basis_text = (
        "We conducted our audit in accordance with high-precision algorithmic verification standards. "
        "Our responsibilities under those standards are further described in the Auditor's Responsibilities section of our report. "
        "We are independent of the entity and have fulfilled our ethical responsibilities. We believe that the audit evidence "
        "we have obtained (Cryptographic Fingerprint & Rule Validations) is sufficient and appropriate to provide a basis for our opinion."
    )
    story.append(Paragraph("Basis for Opinion", styles['AuditSection']))
    story.append(Paragraph(basis_text, styles['AuditBody']))

    # KEY AUDIT MATTERS
    story.append(Paragraph("Key Audit Matters & Risk Assessment", styles['AuditSection']))
    ai_text = audit.get('ai_explanation', 'No specific risks identified.')
    story.append(Paragraph(ai_text, styles['AuditBody']))

    # RULE BREAKDOWN TABLE
    story.append(Paragraph("Supplemental Audit Evidence: Rule Breakdown", styles['AuditSection']))
    story.append(Spacer(1, 6))
    
    table_data = [['Compliance Rule', 'Status', 'Severity', 'Audit Observations']]
    for r in audit['rule_results']:
        status = "FAIL" if not r['passed'] else "PASS"
        status_color = colors.red if not r['passed'] else colors.green
        table_data.append([
            Paragraph(r['rule_id'], styles['BodyText']), 
            Paragraph(f"<font color='{status_color}'><b>{status}</b></font>", styles['BodyText']),
            r['severity'],
            Paragraph(r['description'], styles['BodyText'])
        ])

    t = Table(table_data, colWidths=[110, 50, 60, 250])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)

    # RESPONSIBILITIES
    man_resp = "Management is responsible for the preparation and fair presentation of the data in accordance with internal governance policies."
    story.append(Paragraph("Management's Responsibility", styles['AuditSection']))
    story.append(Paragraph(man_resp, styles['AuditBody']))

    aud_resp = "Our objectives are to obtain reasonable assurance about whether the dataset as a whole is free from material misstatement, whether due to fraud or error."
    story.append(Paragraph("Auditor's Responsibility", styles['AuditSection']))
    story.append(Paragraph(aud_resp, styles['AuditBody']))
    
    story.append(Spacer(1, 30))

    # SIGNATURE
    story.append(Paragraph("___________________________________", styles['Normal']))
    story.append(Paragraph("<b>AuditX Automated Systems</b>", styles['Signature']))
    story.append(Paragraph("Place: Digital Audit Cloud", styles['Signature']))
    from datetime import date
    story.append(Paragraph(f"Date: {date.today().strftime('%m/%d/%Y')}", styles['Signature']))
    
    # FOOTER (HASH)
    story.append(Spacer(1, 30))
    hash_text = f"Cryptographic Fingerprint: {audit.get('provenance_hash', 'N/A')}"
    story.append(Paragraph(hash_text, ParagraphStyle('Hash', parent=styles['Normal'], fontSize=7, textColor=colors.grey)))

    doc.build(story)
    buffer.seek(0)
    
    return Response(content=buffer.getvalue(), media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=audit_report_{audit_id}.pdf"})
