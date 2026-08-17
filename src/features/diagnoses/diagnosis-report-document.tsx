import { equipmentTypes, supportTypes } from "@/config/catalogs"
import { formatLongDate } from "@/lib/formatters"
import type { TechnicalDiagnosis } from "@/types/domain"

interface DiagnosisReportDocumentProps {
  diagnosis: TechnicalDiagnosis
}

export function DiagnosisReportDocument({ diagnosis }: DiagnosisReportDocumentProps) {
  const { snapshot } = diagnosis
  const equipmentType = equipmentTypes.find((type) => type.value === snapshot.equipment.type)?.label ?? snapshot.equipment.type
  const supportType = diagnosis.supportType === "OTHER" ? diagnosis.supportTypeDetail ?? "Otro" : supportTypes.find((type) => type.value === diagnosis.supportType)?.label ?? diagnosis.supportType

  return (
    <article className="print-document mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white px-[13mm] py-[10mm] font-sans text-[10.5px] leading-[1.3] text-slate-950 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 h-2 bg-slate-900" />
      <header className="grid grid-cols-3 items-center gap-5 text-center">
        <BrandMark title="Gobierno de Reconciliación y Unidad Nacional" subtitle="El Pueblo, Presidente" />
        <BrandMark title="SETEC" subtitle="Soporte técnico" large />
        <BrandMark title="UNI · División de Sistemas" subtitle="Información universitaria y Desarrollo Tecnológico" />
      </header>

      <div className="my-7 text-center"><h1 className="text-[15px] font-bold uppercase tracking-[0.12em]">Reporte de soporte técnico</h1><p className="mt-1 font-mono text-[8px] text-slate-500">{diagnosis.code}</p></div>

      <ReportTable>
        <thead><tr><SectionHeading colSpan={2}>Información general</SectionHeading></tr></thead>
        <tbody>
          <ReportRow label="Área" value={snapshot.area.name} />
          <ReportRow label="Responsable del equipo" value={snapshot.responsible.fullName} />
          <ReportRow label="Fecha de inicio de actividad" value={formatLongDate(diagnosis.startedAt)} />
          <ReportRow label="Fecha de finalización" value={formatLongDate(diagnosis.finishedAt)} />
        </tbody>
      </ReportTable>

      <ReportTable className="border-t-0">
        <thead>
          <tr><SectionHeading colSpan={6}>Descripción de equipo</SectionHeading></tr>
          <tr className="bg-slate-100 text-left font-bold"><th>Equipo</th><th>Marca</th><th>Código UNI</th><th>Color</th><th>S/N</th><th>Modelo</th></tr>
        </thead>
        <tbody><tr><td>{equipmentType}</td><td>{snapshot.equipment.brand}</td><td>{snapshot.equipment.uniCode}</td><td>{snapshot.equipment.color ?? "—"}</td><td>{snapshot.equipment.serialNumber}</td><td>{snapshot.equipment.model}</td></tr></tbody>
      </ReportTable>

      <ReportSection title="Tipo de soporte realizado"><ReportList text={supportType} /></ReportSection>
      <ReportSection title="Observaciones Técnicas"><ReportList text={diagnosis.technicalObservations} /></ReportSection>
      <ReportSection title="Diagnóstico"><ReportList text={diagnosis.diagnosis} marker="➤" /></ReportSection>

      <section className="mt-16 grid grid-cols-2 gap-10 px-10 text-center">
        <Signature label="Asignado a" name={snapshot.assignedTechnician.fullName} caption="Soporte Técnico" />
        <Signature label="Recibido por" name="" caption="Firma del responsable" />
      </section>

      <footer className="mt-16 grid grid-cols-3 gap-4 border-t border-slate-500 pt-4 text-[8px] text-slate-700">
        <p>Teléfono institucional<br />Soporte técnico</p>
        <p className="text-center">www.uni.edu.ni</p>
        <p className="text-right">Recinto Universitario Simón Bolívar<br />Avenida Universitaria, Managua, Nicaragua</p>
      </footer>
      <div className="mt-5 h-2 bg-slate-900" />
    </article>
  )
}

function BrandMark({ title, subtitle, large = false }: { title: string; subtitle: string; large?: boolean }) {
  return <div><p className={large ? "text-xl font-black tracking-tight" : "text-[10px] font-bold"}>{title}</p><p className="mt-0.5 text-[7.5px] leading-tight text-slate-600">{subtitle}</p></div>
}

function ReportTable({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <table className={`w-full table-fixed border-collapse border border-slate-700 [&_td]:border [&_td]:border-slate-700 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-slate-700 [&_th]:px-2 [&_th]:py-1 ${className}`}>{children}</table>
}

function SectionHeading({ children, colSpan }: { children: React.ReactNode; colSpan: number }) {
  return <th colSpan={colSpan} className="bg-slate-200 text-center font-bold uppercase">{children}</th>
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return <tr><td className="w-[39%] font-medium uppercase">{label}</td><td>{value}</td></tr>
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-x border-b border-slate-700"><h2 className="border-b border-slate-700 bg-slate-200 px-2 py-1 text-center font-bold uppercase">{title}</h2><div className="min-h-10 px-5 py-2">{children}</div></section>
}

function ReportList({ text, marker = "•" }: { text: string; marker?: string }) {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  return <ul className="space-y-1">{lines.map((line, index) => <li key={`${line}-${index}`} className="flex gap-2"><span aria-hidden>{marker}</span><span>{line.replace(/^[•➤>-]\s*/, "")}</span></li>)}</ul>
}

function Signature({ label, name, caption }: { label: string; name: string; caption: string }) {
  return <div><div className="flex items-end gap-2"><span className="whitespace-nowrap font-semibold uppercase">{label}:</span><span className="min-h-4 flex-1 border-b border-slate-800">{name}</span></div><p className="mt-1 text-[9px] text-slate-600">{caption}</p></div>
}
