import { ArrowLeft, Printer } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

interface PrintDiagnosisPageProps {
  diagnosisId: string
}

export function PrintDiagnosisPage({ diagnosisId }: PrintDiagnosisPageProps) {
  return (
    <div className="mx-auto max-w-[56rem]">
      <div className="no-print mb-5 flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm">
        <Button asChild variant="ghost">
          <Link to="/diagnosticos/$diagnosisId" params={{ diagnosisId }}>
            <ArrowLeft data-icon="inline-start" />
            Volver al diagnóstico
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer data-icon="inline-start" />
          Imprimir documento
        </Button>
      </div>

      <article className="print-document min-h-[70rem] bg-white p-8 text-slate-900 shadow-sm ring-1 ring-slate-200 sm:p-12">
        <header className="border-b-2 border-slate-800 pb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em]">Universidad Nacional de Ingeniería</p>
          <h1 className="mt-2 text-2xl font-bold uppercase tracking-wide">Soporte Técnico</h1>
          <p className="mt-1 text-sm text-slate-600">Hoja de diagnóstico técnico · {diagnosisId}</p>
        </header>

        <section className="grid gap-x-8 gap-y-5 border-b border-slate-300 py-7 sm:grid-cols-2">
          <PrintField label="Responsable del equipo" value="Juan Pérez" />
          <PrintField label="Área" value="Auditoría Interna" />
          <PrintField label="Inicio de actividad técnica" value="16/08/2026 · 08:15" />
          <PrintField label="Finalización de actividad técnica" value="16/08/2026 · 09:30" />
        </section>

        <PrintSection title="Datos del equipo">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <PrintField label="Tipo" value="Laptop" />
            <PrintField label="Marca" value="Dell" />
            <PrintField label="Código UNI" value="UNI-00234" />
            <PrintField label="Color" value="Gris" />
            <PrintField label="Número de serie" value="8H2L9Q3" />
            <PrintField label="Modelo" value="Latitude 5420" />
          </div>
        </PrintSection>

        <PrintSection title="Tipo de soporte realizado">
          <p className="text-sm">Diagnóstico</p>
        </PrintSection>

        <PrintSection title="Observaciones Técnicas">
          <p className="text-sm leading-7">
            Se verificó el funcionamiento del disco duro, memoria RAM, sistema operativo y
            conectividad. Se detectó lentitud durante el inicio del sistema operativo.
          </p>
        </PrintSection>

        <PrintSection title="Diagnóstico">
          <p className="text-sm leading-7">
            El equipo presenta degradación del disco duro. Se recomienda reemplazar el
            dispositivo por una unidad SSD.
          </p>
        </PrintSection>

        <footer className="mt-18 grid gap-12 text-center sm:grid-cols-2">
          <Signature label="Dorian Lanuza" caption="Técnico asignado" />
          <Signature label="Firma" caption="Responsable del equipo" />
        </footer>
      </article>
    </div>
  )
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-slate-300 py-7">
      <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.16em]">{title}</h2>
      {children}
    </section>
  )
}

function PrintField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 border-b border-slate-400 pb-1 text-sm font-medium">{value}</p>
    </div>
  )
}

function Signature({ label, caption }: { label: string; caption: string }) {
  return (
    <div className="pt-12">
      <div className="border-t border-slate-700 pt-2">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{caption}</p>
      </div>
    </div>
  )
}
