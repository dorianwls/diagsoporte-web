import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Download, FileText, LoaderCircle, Printer } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageErrorState, PageLoadingState } from "@/components/shared/async-state"
import { exportDiagnosisToPdf, exportDiagnosisToWord } from "@/features/diagnoses/diagnosis-export-service"
import { findDiagnosisById } from "@/features/diagnoses/diagnosis-repository"
import { DiagnosisReportDocument } from "@/features/diagnoses/diagnosis-report-document"
import { useApiQuery } from "@/hooks/use-api-query"
import { getErrorMessage } from "@/lib/api-client"

interface PrintDiagnosisPageProps {
  diagnosisId: string
}

export function PrintDiagnosisPage({ diagnosisId }: PrintDiagnosisPageProps) {
  const query = useApiQuery(`print-diagnosis:${diagnosisId}`, (signal) => findDiagnosisById(diagnosisId, signal))
  const diagnosis = query.data
  const [exporting, setExporting] = useState<"word" | "pdf" | null>(null)

  if (query.isLoading) return <PageLoadingState label="Preparando el documento institucional..." />
  if (query.error) return <PageErrorState error={query.error} onRetry={query.reload} />
  if (!diagnosis) {
    return <Card className="mx-auto max-w-xl py-10 text-center"><CardContent><FileText className="mx-auto size-8 text-muted-foreground" /><h1 className="mt-4 text-xl font-semibold">Diagnóstico no encontrado</h1><Button asChild className="mt-6"><Link to="/diagnosticos">Volver a los diagnósticos</Link></Button></CardContent></Card>
  }

  async function handleExport(format: "word" | "pdf") {
    if (!diagnosis) return
    setExporting(format)
    try {
      if (format === "word") await exportDiagnosisToWord(diagnosisId)
      else await exportDiagnosisToPdf(diagnosisId)
      toast.success(`Archivo ${format === "word" ? "Word" : "PDF"} descargado correctamente`)
    } catch (error) {
      toast.error(getErrorMessage(error, `No fue posible descargar el archivo ${format === "word" ? "Word" : "PDF"}`))
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="mx-auto max-w-[64rem]">
      <div className="no-print mb-5 flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button asChild variant="ghost"><Link to="/diagnosticos/$diagnosisId" params={{ diagnosisId }}><ArrowLeft data-icon="inline-start" />Volver al diagnóstico</Link></Button>
          <p className="mt-1 px-3 text-xs text-muted-foreground">Vista basada en el reporte físico institucional proporcionado.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button variant="outline" onClick={() => handleExport("word")} disabled={Boolean(exporting)}>{exporting === "word" ? <LoaderCircle className="animate-spin" /> : <FileText />}Word</Button>
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={Boolean(exporting)}>{exporting === "pdf" ? <LoaderCircle className="animate-spin" /> : <Download />}PDF</Button>
          <Button onClick={() => window.print()} disabled={Boolean(exporting)}><Printer />Imprimir</Button>
        </div>
      </div>

      <DiagnosisReportDocument diagnosis={diagnosis} />
    </div>
  )
}
