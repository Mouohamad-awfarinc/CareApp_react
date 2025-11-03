import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { usePatient, useUploadPatientDocument, usePatientVisits } from "@/hooks/use-healthcare"

export function UploadDocument() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const patientId = parseInt(id || "0")

  const { data: patient, isLoading } = usePatient(patientId)
  const { data: visitsData } = usePatientVisits(patientId, {})
  const uploadDocument = useUploadPatientDocument()

  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("medical_record")
  const [visitId, setVisitId] = useState<string>("")
  const [error, setError] = useState("")

  // Extract array from API response
  const visits = visitsData?.data || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!documentFile) {
      setError("Please select a file to upload")
      return
    }

    try {
      await uploadDocument.mutateAsync({
        patientId,
        file: documentFile,
        documentType,
        visitId: visitId ? Number(visitId) : undefined,
      })
      navigate(`/healthcare/patients/${patientId}/details`)
    } catch (err) {
      setError("Failed to upload document")
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    )
  }

  if (!patient) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Patient not found</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/healthcare/patients/${patientId}/details`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
            <p className="text-muted-foreground">Upload document for {patient.name}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
              <CardDescription>Select document type and file to upload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Document Type */}
              <div className="grid gap-2">
                <Label htmlFor="document_type">Document Type *</Label>
                <Select value={documentType} onValueChange={setDocumentType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical_record">Medical Record</SelectItem>
                    <SelectItem value="lab_result">Lab Result</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="imaging">Imaging/X-Ray</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Associated Visit (Optional) */}
              <div className="grid gap-2">
                <Label htmlFor="visit_id">Associated Visit (Optional)</Label>
                <Select value={visitId} onValueChange={setVisitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No associated visit</SelectItem>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {visits.map((visit: any) => (
                      <SelectItem key={visit.id} value={visit.id.toString()}>
                        Visit #{visit.id} - {visit.doctor?.name || "N/A"} - {new Date(visit.created_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="grid gap-2">
                <Label htmlFor="document">Document File *</Label>
                <Input
                  id="document"
                  type="file"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, images (JPG, PNG), documents
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/healthcare/patients/${patientId}/details`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploadDocument.isPending}>
              {uploadDocument.isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
