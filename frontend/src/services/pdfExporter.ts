import { jsPDF } from "jspdf";
import { ScanResponse } from "../types";

export function exportScanToPdf(scan: ScanResponse): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 18;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    // Top border line
    doc.setDrawColor(6, 182, 212); // Cyan
    doc.setLineWidth(0.8);
    doc.line(margin, 10, pageWidth - margin, 10);

    // Bottom footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `PHANTOM X Autonomous Threat Defense Platform  |  Scan ID: ${scan.scan_id}  |  CONFIDENTIAL`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      pageWidth - margin - 12,
      pageHeight - 8
    );
  };

  drawHeaderFooter();

  // Document Title Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.text("PHANTOM X THREAT INVESTIGATION DOSSIER", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Official Cybersecurity Incident Record  |  Rule Engine: ${scan.rule_engine_version}  |  Generated (UTC): ${scan.timestamp.replace("T", " ").slice(0, 19)}`,
    margin,
    y
  );
  y += 6;

  // Cryptographic Hash Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 10, "FD");
  doc.setFontSize(8);
  doc.setFont("courier", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(`SHA-256 INTEGRITY HASH: ${scan.report_hash}`, margin + 3, y + 6);
  y += 15;

  // Executive Risk Assessment Banner
  checkPageBreak(30);
  const isHigh = scan.risk.score >= 65;
  const isMed = scan.risk.score >= 30 && scan.risk.score < 65;

  doc.setFillColor(isHigh ? 254 : isMed ? 254 : 240, isHigh ? 242 : isMed ? 243 : 253, isHigh ? 242 : isMed ? 199 : 244);
  doc.setDrawColor(isHigh ? 239 : isMed ? 245 : 16, isHigh ? 68 : isMed ? 158 : 185, isHigh ? 68 : isMed ? 11 : 129);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(isHigh ? 185 : isMed ? 180 : 21, isHigh ? 28 : isMed ? 83 : 128, isHigh ? 28 : isMed ? 9 : 61);
  doc.text("EXECUTIVE RISK ASSESSMENT", margin + 5, y + 7);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`${scan.risk.score} / 100`, margin + 5, y + 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`CLASSIFICATION: ${scan.risk.category}`, margin + 55, y + 13);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Confidence: ${scan.risk.confidence}  |  Coverage: ${scan.risk.coverage_status}`, margin + 55, y + 19);
  y += 30;

  // Section 1: Target Identifiers
  checkPageBreak(35);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("1. TARGET IDENTIFIERS", margin, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const targetLines = [
    `Submitted URL:      ${scan.url_components.submitted_url}`,
    `Normalized URL:     ${scan.url_components.normalized_url}`,
    `Hostname:           ${scan.url_components.hostname}`,
    `Registrable Domain: ${scan.url_components.registrable_domain} (Suffix: ${scan.url_components.suffix})`,
  ];
  if (scan.url_components.unicode_hostname !== scan.url_components.punycode_hostname) {
    targetLines.push(`Unicode/Punycode:   ${scan.url_components.unicode_hostname} / ${scan.url_components.punycode_hostname}`);
  }
  if (scan.url_components.port) {
    targetLines.push(`Custom Port:        ${scan.url_components.port}`);
  }

  for (const line of targetLines) {
    doc.text(line, margin + 3, y);
    y += 5;
  }
  y += 4;

  // Section 2: Brand Impersonation (if applicable)
  if (scan.brand_match) {
    checkPageBreak(35);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(185, 28, 28);
    doc.text("2. BRAND IMPERSONATION RADAR (ACTIVE DETECTION)", margin, y);
    y += 6;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(`Targeted Brand:     ${scan.brand_match.brand_name}`, margin + 3, y);
    y += 5;
    doc.text(`Legitimate Domain:  ${scan.brand_match.legitimate_domain}`, margin + 3, y);
    y += 5;
    doc.text(`Actual Domain:      ${scan.brand_match.actual_domain} (Similarity: ${Math.round(scan.brand_match.similarity_score * 100)}%)`, margin + 3, y);
    y += 5;
    doc.text(`Technique:          ${scan.brand_match.substitution_technique || "Homoglyph Substitution"}`, margin + 3, y);
    y += 5;
    doc.text(`Forensic Evidence:  ${scan.brand_match.evidence}`, margin + 3, y);
    y += 8;
  }

  // Section 3: AI Incident Explanation
  checkPageBreak(40);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("3. INCIDENT EXPLANATION & THREAT NARRATIVE", margin, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(2, 132, 199);
  doc.text(`Attack Vector: ${scan.attack_story.suspected_attack_category}`, margin + 3, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(scan.attack_story.executive_summary, contentWidth - 6);
  doc.text(summaryLines, margin + 3, y);
  y += summaryLines.length * 4.5 + 3;

  doc.setFont("helvetica", "bold");
  doc.text("Potential Impact:", margin + 3, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  const impactLines = doc.splitTextToSize(scan.attack_story.potential_impact, contentWidth - 6);
  doc.text(impactLines, margin + 3, y);
  y += impactLines.length * 4.5 + 6;

  // Section 4: Forensic Findings Table
  checkPageBreak(30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`4. FORENSIC EVIDENCE FINDINGS (${scan.findings.length} SIGNALS)`, margin, y);
  y += 6;

  if (scan.findings.length === 0) {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("No adverse structural, syntactic, or reputation indicators identified.", margin + 3, y);
    y += 8;
  } else {
    for (const f of scan.findings) {
      checkPageBreak(25);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 18, "FD");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const sevColor = f.severity === "CRITICAL" ? [220, 38, 38] : f.severity === "HIGH" ? [234, 88, 12] : [217, 119, 6];
      doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
      doc.text(`[${f.severity}]`, margin + 3, y + 5);

      doc.setTextColor(15, 23, 42);
      doc.text(`${f.name}  (${f.detector_id})`, margin + 22, y + 5);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Evidence: ${f.evidence}`, margin + 3, y + 10);
      doc.text(`Action:   ${f.recommended_action}`, margin + 3, y + 14.5);
      y += 21;
    }
  }

  // Section 5: SOC Defensive Countermeasures
  checkPageBreak(30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("5. RECOMMENDED DEFENSIVE ACTIONS (SOC PLAYBOOK)", margin, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  for (const action of scan.risk.recommended_actions) {
    checkPageBreak(8);
    doc.text(`[ ]  ${action}`, margin + 3, y);
    y += 5;
  }
  y += 8;

  // Final Verification Block
  checkPageBreak(20);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Verified by PHANTOM X Autonomous Threat Defense Engine. This dossier provides deterministic forensic analysis.",
    margin,
    y
  );

  // Save PDF file directly to browser downloads
  const sanitizedId = scan.scan_id.replace(/[^a-zA-Z0-9_-]/g, "");
  doc.save(`PHANTOM_X_EVIDENCE_${sanitizedId}.pdf`);
}
