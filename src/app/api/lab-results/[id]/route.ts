import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  /*
   * TEMPORARY DEMO LAB RESULT
   *
   * This data will eventually come from the external
   * laboratory system.
   */
  const result = {
    id,
    laboratoryNo: id === "LAB-2026-00125" ? "LAB-2026-00125" : id,
    patientName: "Juan Dela Cruz",
    testName: "Complete Blood Count (CBC)",
    dateReleased: "August 15, 2026",
    status: "READY",
    specimen: "Whole Blood",
    remarks:
      "Results are within the expected reference range. Please consult the attending physician for clinical interpretation of these results.",
    items: [
      {
        test: "Hemoglobin",
        result: "14.2",
        unit: "g/dL",
        referenceRange: "13.5 - 17.5",
      },
      {
        test: "White Blood Cell Count",
        result: "7.8",
        unit: "x10^9/L",
        referenceRange: "4.0 - 11.0",
      },
      {
        test: "Platelet Count",
        result: "265",
        unit: "x10^9/L",
        referenceRange: "150 - 450",
      },
      {
        test: "Hematocrit",
        result: "42.1",
        unit: "%",
        referenceRange: "41 - 53",
      },
    ],
  };

  try {
    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([595.28, 841.89]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    /*
     * Colors
     */
    const darkText = rgb(0.12, 0.18, 0.25);
    const grayText = rgb(0.4, 0.45, 0.5);
    const lightGray = rgb(0.94, 0.95, 0.97);
    const borderColor = rgb(0.86, 0.88, 0.91);
    const clinicalBlue = rgb(0.08, 0.42, 0.65);
    const green = rgb(0.05, 0.55, 0.3);

    /*
     * Header
     */
    page.drawText("RAPHA DIAGNOSTIC LABORATORY", {
      x: 50,
      y: pageHeight - 60,
      size: 18,
      font: boldFont,
      color: clinicalBlue,
    });

    page.drawText("Laboratory Result Report", {
      x: 50,
      y: pageHeight - 82,
      size: 10,
      font,
      color: grayText,
    });

    page.drawLine({
      start: {
        x: 50,
        y: pageHeight - 100,
      },
      end: {
        x: pageWidth - 50,
        y: pageHeight - 100,
      },
      thickness: 1,
      color: borderColor,
    });

    /*
     * Result information
     */
    let y = pageHeight - 135;

    page.drawText("LABORATORY RESULT", {
      x: 50,
      y,
      size: 11,
      font: boldFont,
      color: grayText,
    });

    y -= 28;

    page.drawText(result.testName, {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: darkText,
    });

    y -= 35;

    /*
     * Patient information
     */
    page.drawText("Patient Information", {
      x: 50,
      y,
      size: 11,
      font: boldFont,
      color: clinicalBlue,
    });

    y -= 25;

    page.drawText(`Patient: ${result.patientName}`, {
      x: 50,
      y,
      size: 10,
      font,
      color: darkText,
    });

    page.drawText(`Laboratory No.: ${result.laboratoryNo}`, {
      x: 300,
      y,
      size: 10,
      font,
      color: darkText,
    });

    y -= 20;

    page.drawText(`Date Released: ${result.dateReleased}`, {
      x: 50,
      y,
      size: 10,
      font,
      color: darkText,
    });

    page.drawText(`Specimen: ${result.specimen}`, {
      x: 300,
      y,
      size: 10,
      font,
      color: darkText,
    });

    y -= 20;

    page.drawText("Status: Released", {
      x: 50,
      y,
      size: 10,
      font: boldFont,
      color: green,
    });

    y -= 45;

    /*
     * Results table
     */
    page.drawText("Test Results", {
      x: 50,
      y,
      size: 11,
      font: boldFont,
      color: clinicalBlue,
    });

    y -= 22;

    const tableX = 50;
    const tableWidth = pageWidth - 100;
    const rowHeight = 28;

    /*
     * Table header
     */
    page.drawRectangle({
      x: tableX,
      y: y - rowHeight + 5,
      width: tableWidth,
      height: rowHeight,
      color: lightGray,
    });

    page.drawText("Test", {
      x: tableX + 10,
      y: y - 14,
      size: 8.5,
      font: boldFont,
      color: darkText,
    });

    page.drawText("Result", {
      x: tableX + 205,
      y: y - 14,
      size: 8.5,
      font: boldFont,
      color: darkText,
    });

    page.drawText("Unit", {
      x: tableX + 285,
      y: y - 14,
      size: 8.5,
      font: boldFont,
      color: darkText,
    });

    page.drawText("Reference Range", {
      x: tableX + 335,
      y: y - 14,
      size: 8.5,
      font: boldFont,
      color: darkText,
    });

    y -= rowHeight;

    /*
     * Table rows
     */
    result.items.forEach((item) => {
      page.drawRectangle({
        x: tableX,
        y: y - rowHeight + 5,
        width: tableWidth,
        height: rowHeight,
        borderColor,
        borderWidth: 0.5,
      });

      page.drawText(item.test, {
        x: tableX + 10,
        y: y - 14,
        size: 8.5,
        font,
        color: darkText,
      });

      page.drawText(item.result, {
        x: tableX + 205,
        y: y - 14,
        size: 8.5,
        font: boldFont,
        color: darkText,
      });

      /*
       * IMPORTANT:
       * Do not use "⁹" here.
       * The standard WinAnsi font used by pdf-lib
       * cannot encode that character.
       */
      page.drawText(item.unit, {
        x: tableX + 285,
        y: y - 14,
        size: 8.5,
        font,
        color: grayText,
      });

      page.drawText(item.referenceRange, {
        x: tableX + 335,
        y: y - 14,
        size: 8.5,
        font,
        color: grayText,
      });

      y -= rowHeight;
    });

    y -= 35;

    /*
     * Remarks
     */
    page.drawText("Laboratory Remarks", {
      x: 50,
      y,
      size: 11,
      font: boldFont,
      color: clinicalBlue,
    });

    y -= 22;

    const remarksLines = [
      "Results are within the expected reference range.",
      "Please consult the attending physician for clinical",
      "interpretation of these results.",
    ];

    remarksLines.forEach((line) => {
      page.drawText(line, {
        x: 50,
        y,
        size: 9,
        font,
        color: grayText,
      });

      y -= 15;
    });

    /*
     * Footer
     */
    page.drawLine({
      start: {
        x: 50,
        y: 55,
      },
      end: {
        x: pageWidth - 50,
        y: 55,
      },
      thickness: 1,
      color: borderColor,
    });

    page.drawText(
      "Demo laboratory result — external laboratory system not yet connected.",
      {
        x: 50,
        y: 38,
        size: 7.5,
        font,
        color: grayText,
      },
    );

    /*
     * Generate PDF
     */
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="lab-result-${result.laboratoryNo}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate laboratory result PDF.",
      },
      {
        status: 500,
      },
    );
  }
}
