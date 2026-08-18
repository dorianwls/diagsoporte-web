import institutionalLetterhead from "@/assets/institutional-letterhead.png"
import { equipmentTypes } from "@/config/catalogs"
import { formatLongDate } from "@/lib/formatters"
import type { TechnicalDiagnosis } from "@/types/domain"

export async function exportDiagnosisToWord(diagnosis: TechnicalDiagnosis) {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    Header,
    HorizontalPositionRelativeFrom,
    ImageRun,
    Packer,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    TextWrappingType,
    VerticalPositionRelativeFrom,
    WidthType,
  } = await import("docx")
  const letterheadData = await fetch(institutionalLetterhead).then((response) => response.arrayBuffer())

  const border = { style: BorderStyle.SINGLE, size: 4, color: "4B5563" }
  const borders = { top: border, bottom: border, left: border, right: border }
  const nilBorder = { style: BorderStyle.NIL, size: 0, color: "FFFFFF" }
  const noBorders = { top: nilBorder, bottom: nilBorder, left: nilBorder, right: nilBorder }
  const cellMargins = { top: 70, bottom: 70, left: 90, right: 90 }
  type ParagraphAlignment = (typeof AlignmentType)[keyof typeof AlignmentType]
  const paragraph = (text: string, bold = false, alignment: ParagraphAlignment = AlignmentType.LEFT) =>
    new Paragraph({
      alignment,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text, bold, size: 18, font: "Arial" })],
    })
  const cell = (text: string, options?: { bold?: boolean; columnSpan?: number; shading?: boolean; alignment?: typeof AlignmentType[keyof typeof AlignmentType] }) =>
    new TableCell({
      columnSpan: options?.columnSpan,
      borders,
      margins: cellMargins,
      shading: options?.shading ? { fill: "E5E7EB", type: ShadingType.CLEAR } : undefined,
      children: [paragraph(text, options?.bold, options?.alignment)],
    })
  const sectionRows = (title: string, text: string) => [
    new TableRow({ children: [cell(title.toUpperCase(), { bold: true, shading: true, alignment: AlignmentType.CENTER })] }),
    new TableRow({ children: [new TableCell({ borders, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: reportParagraphs(text, Paragraph, TextRun) })] }),
  ]

  const snapshot = diagnosis.snapshot
  const equipmentType = getEquipmentTypeLabel(diagnosis)
  const document = new Document({
    creator: "Diagnósticos UNI",
    title: `Reporte de soporte técnico ${diagnosis.code}`,
    styles: {
      default: {
        document: { run: { font: "Arial", size: 18 }, paragraph: { spacing: { after: 0 } } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 2550, right: 1020, bottom: 2100, left: 1020 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: "png",
                    data: letterheadData,
                    transformation: { width: 816, height: 1056 },
                    floating: {
                      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
                      verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
                      behindDocument: true,
                      allowOverlap: true,
                      wrap: { type: TextWrappingType.NONE },
                    },
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "REPORTE DE SOPORTE TÉCNICO", bold: true, size: 26, font: "Arial" })] }),
          new Paragraph({ spacing: { before: 0, after: 240 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: diagnosis.code, size: 16, font: "Arial", color: "6B7280" })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [cell("INFORMACIÓN GENERAL", { bold: true, columnSpan: 2, shading: true, alignment: AlignmentType.CENTER })] }),
              new TableRow({ children: [cell("ÁREA", { bold: true }), cell(snapshot.area.name)] }),
              new TableRow({ children: [cell("RESPONSABLE DEL EQUIPO", { bold: true }), cell(snapshot.responsible.fullName)] }),
              new TableRow({ children: [cell("FECHA DE INICIO DE ACTIVIDAD", { bold: true }), cell(formatLongDate(diagnosis.startedAt))] }),
              new TableRow({ children: [cell("FECHA DE FINALIZACIÓN", { bold: true }), cell(formatLongDate(diagnosis.finishedAt))] }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [cell("DESCRIPCIÓN DE EQUIPO", { bold: true, columnSpan: 6, shading: true, alignment: AlignmentType.CENTER })] }),
              new TableRow({ children: ["Equipo", "Marca", "Código UNI", "Color", "S/N", "Modelo"].map((value) => cell(value, { bold: true, shading: true })) }),
              new TableRow({ children: [equipmentType, snapshot.equipment.brand, snapshot.equipment.uniCode, snapshot.equipment.color ?? "—", snapshot.equipment.serialNumber, snapshot.equipment.model].map((value) => cell(value)) }),
            ],
          }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: sectionRows("Tipo de soporte realizado", diagnosis.supportPerformed) }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: sectionRows("Observaciones Técnicas", diagnosis.technicalObservations) }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: sectionRows("Diagnóstico", diagnosis.diagnosis) }),
          new Paragraph({ spacing: { before: 500, after: 0 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorders,
            rows: [new TableRow({ children: [signatureCell("ASIGNADO A", snapshot.assignedTechnician.fullName, "Soporte Técnico", TableCell, Paragraph, TextRun, noBorders), signatureCell("RECIBIDO POR", "", "Firma del responsable", TableCell, Paragraph, TextRun, noBorders)] })],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(document)
  downloadBlob(blob, `${diagnosis.code}-reporte-soporte-tecnico.docx`)
}

export async function exportDiagnosisToPdf(diagnosis: TechnicalDiagnosis) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")])
  const letterheadDataUrl = await imageUrlToDataUrl(institutionalLetterhead)
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })
  const snapshot = diagnosis.snapshot
  const margin = 18
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const drawLetterhead = () => pdf.addImage(letterheadDataUrl, "PNG", 0, 0, pageWidth, pageHeight)
  drawLetterhead()
  pdf.internal.events.subscribe("addPage", drawLetterhead)

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(12)
  pdf.text("REPORTE DE SOPORTE TÉCNICO", pageWidth / 2, 44, { align: "center" })
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(6.5)
  pdf.text(diagnosis.code, pageWidth / 2, 47.5, { align: "center" })

  autoTable(pdf, {
    startY: 51,
    margin: { left: margin, right: margin },
    head: [[{ content: "INFORMACIÓN GENERAL", colSpan: 2, styles: { halign: "center" } }]],
    body: [
      ["ÁREA", snapshot.area.name],
      ["RESPONSABLE DEL EQUIPO", snapshot.responsible.fullName],
      ["FECHA DE INICIO DE ACTIVIDAD", formatLongDate(diagnosis.startedAt)],
      ["FECHA DE FINALIZACIÓN", formatLongDate(diagnosis.finishedAt)],
    ],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 1.5, lineColor: [55, 65, 81], lineWidth: 0.15 },
    headStyles: { fillColor: [229, 231, 235], textColor: [15, 23, 42], fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 62, fontStyle: "bold" } },
  })

  let currentY = getLastAutoTableY(pdf, 51)
  autoTable(pdf, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      { content: "DESCRIPCIÓN DE EQUIPO", colSpan: 6, styles: { halign: "center" } },
    ], ["Equipo", "Marca", "Código UNI", "Color", "S/N", "Modelo"]],
    body: [[getEquipmentTypeLabel(diagnosis), snapshot.equipment.brand, snapshot.equipment.uniCode, snapshot.equipment.color ?? "—", snapshot.equipment.serialNumber, snapshot.equipment.model]],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 7.5, cellPadding: 1.7, lineColor: [55, 65, 81], lineWidth: 0.15, valign: "middle" },
    headStyles: { fillColor: [229, 231, 235], textColor: [15, 23, 42], fontStyle: "bold" },
  })
  currentY = getLastAutoTableY(pdf, currentY)

  for (const [title, text] of [
    ["TIPO DE SOPORTE REALIZADO", diagnosis.supportPerformed],
    ["OBSERVACIONES TÉCNICAS", diagnosis.technicalObservations],
    ["DIAGNÓSTICO", diagnosis.diagnosis],
  ]) {
    autoTable(pdf, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[title]],
      body: [[`• ${text}`]],
      theme: "grid",
      styles: { font: "helvetica", fontSize: 8, cellPadding: 2.2, lineColor: [55, 65, 81], lineWidth: 0.15, overflow: "linebreak" },
      headStyles: { fillColor: [229, 231, 235], textColor: [15, 23, 42], fontStyle: "bold", halign: "center" },
    })
    currentY = getLastAutoTableY(pdf, currentY)
  }

  let signatureY = currentY + 20
  if (signatureY > 238) {
    pdf.addPage()
    signatureY = 50
  }
  pdf.setFontSize(8)
  pdf.setFont("helvetica", "bold")
  pdf.text("ASIGNADO A:", 24, signatureY)
  pdf.text("RECIBIDO POR:", 112, signatureY)
  pdf.setLineWidth(0.2)
  pdf.line(45, signatureY, 92, signatureY)
  pdf.line(136, signatureY, 185, signatureY)
  pdf.setFont("helvetica", "normal")
  pdf.text(snapshot.assignedTechnician.fullName, 68, signatureY - 1, { align: "center" })
  pdf.text("Soporte Técnico", 68, signatureY + 4, { align: "center" })
  pdf.text("Firma del responsable", 160, signatureY + 4, { align: "center" })

  pdf.save(`${diagnosis.code}-reporte-soporte-tecnico.pdf`)
}

function getEquipmentTypeLabel(diagnosis: TechnicalDiagnosis) {
  return equipmentTypes.find((type) => type.value === diagnosis.snapshot.equipment.type)?.label ?? diagnosis.snapshot.equipment.type
}

function reportParagraphs(
  text: string,
  ParagraphClass: typeof import("docx").Paragraph,
  TextRunClass: typeof import("docx").TextRun,
) {
  return text.split(/\n+/).filter(Boolean).map((line) => new ParagraphClass({ spacing: { after: 50 }, children: [new TextRunClass({ text: `• ${line.replace(/^[•➤>-]\s*/, "")}`, size: 18, font: "Arial" })] }))
}

function signatureCell(
  label: string,
  name: string,
  caption: string,
  TableCellClass: typeof import("docx").TableCell,
  ParagraphClass: typeof import("docx").Paragraph,
  TextRunClass: typeof import("docx").TextRun,
  borders: ConstructorParameters<typeof import("docx").TableCell>[0]["borders"],
) {
  return new TableCellClass({
    borders,
    children: [
      new ParagraphClass({ alignment: "center", children: [new TextRunClass({ text: `${label}: ______________________________`, bold: true, size: 17, font: "Arial" })] }),
      new ParagraphClass({ alignment: "center", children: [new TextRunClass({ text: name, size: 17, font: "Arial" })] }),
      new ParagraphClass({ alignment: "center", children: [new TextRunClass({ text: caption, size: 16, font: "Arial" })] }),
    ],
  })
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function getLastAutoTableY(pdf: object, fallback: number) {
  return (pdf as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? fallback
}

async function imageUrlToDataUrl(url: string) {
  const blob = await fetch(url).then((response) => response.blob())
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}
