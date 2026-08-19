import { apiDownload, saveDownloadedFile } from "@/lib/api-client"

export async function exportDiagnosisToPdf(diagnosisId: string) {
  saveDownloadedFile(await apiDownload(`/diagnoses/${diagnosisId}/pdf`))
}

export async function exportDiagnosisToWord(diagnosisId: string) {
  saveDownloadedFile(await apiDownload(`/diagnoses/${diagnosisId}/word`))
}
