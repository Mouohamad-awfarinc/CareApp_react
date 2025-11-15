/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, FileText, Calendar, Stethoscope, Pill } from "lucide-react"
import {
  usePatient,
  usePatientProfiles,
  usePatientDocuments,
  usePatientAppointments,
  usePatientVisits,
  usePatientPrescriptions,
} from "@/hooks/use-healthcare"

// Helper function to get full image URL
const getImageUrl = (photoPath: string | null) => {
  if (!photoPath) return ""
  if (photoPath.startsWith("http")) return photoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${photoPath}`
}

export function PatientDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const patientId = parseInt(id || "0")

  const { data: patient, isLoading } = usePatient(patientId)
  const { data: patientProfiles, isLoading: loadingProfiles } = usePatientProfiles(patientId)
  // Latest profile endpoint returns 404 - commenting out for now
  // const { data: latestProfile } = usePatientLatestProfile(patientId)
  const { data: patientDocumentsData } = usePatientDocuments(patientId, {})
  const { data: patientAppointmentsData } = usePatientAppointments(patientId, {})
  const { data: patientVisitsData } = usePatientVisits(patientId, {})
  const { data: patientPrescriptionsData } = usePatientPrescriptions(patientId, {})

  // Extract arrays from API responses
  const patientDocuments = patientDocumentsData?.data || []
  const patientAppointments = patientAppointmentsData?.data || []
  const patientVisits = patientVisitsData?.data || []
  const patientPrescriptions = patientPrescriptionsData?.data || []

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
          <Button variant="ghost" size="icon" onClick={() => navigate("/healthcare/patients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{patient.name} Details</h1>
            <p className="text-muted-foreground">View comprehensive patient information</p>
          </div>
          <Button onClick={() => navigate(`/healthcare/patients/${patientId}/upload-document`)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Patient Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={getImageUrl(patient.photo)} alt={patient.name} />
                <AvatarFallback className="text-2xl">{patient.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">{patient.email || "No email"}</p>
                {patient.gender && (
                  <Badge variant="secondary" className="mt-1">{patient.gender}</Badge>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                <p className="text-sm">{patient.mobile || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">National ID</p>
                <p className="text-sm">{patient.national_id || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Birth Date</p>
                <p className="text-sm">{patient.birth_date || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">City</p>
                <p className="text-sm">{patient.city || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                <p className="text-sm">{patient.occupation || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                <p className="text-sm">{patient.emergency_contact_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{patient.emergency_contact_mobile || ""}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Different Sections */}
        <Tabs defaultValue="profiles" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="mr-2 h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="visits">
              <Stethoscope className="mr-2 h-4 w-4" />
              Visits
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <Pill className="mr-2 h-4 w-4" />
              Prescriptions
            </TabsTrigger>
          </TabsList>

          {/* Profiles Tab */}
          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <CardTitle>Medical Profiles</CardTitle>
                <CardDescription>Patient medical history and profiles</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProfiles ? (
                  <p className="text-muted-foreground">Loading profiles...</p>
                ) : !patientProfiles || patientProfiles.length === 0 ? (
                  <p className="text-muted-foreground">No profiles found</p>
                ) : (
                  <div className="space-y-4">
                    {patientProfiles.map((profile) => (
                      <div key={profile.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                          <Badge variant="outline">{profile.profile_type}</Badge>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          {profile.blood_type && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Blood Type</p>
                              <p className="text-sm">{profile.blood_type}</p>
                            </div>
                          )}
                          {profile.clinic?.name && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Clinic</p>
                              <p className="text-sm">{profile.clinic.name}</p>
                            </div>
                          )}
                        </div>
                        {(() => {
                          const allergies = profile.allergies as any
                          const allergiesArray = Array.isArray(allergies) ? allergies : (typeof allergies === 'string' && allergies ? allergies.split(',').map((s: string) => s.trim()) : [])
                          return allergiesArray.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground">Allergies</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {allergiesArray.map((item: string, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 text-xs rounded bg-red-100 dark:bg-red-900">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Patient uploaded documents and files</CardDescription>
              </CardHeader>
              <CardContent>
                {!patientDocuments || patientDocuments.length === 0 ? (
                  <p className="text-muted-foreground">No documents found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Visit</TableHead>
                        <TableHead>Uploaded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {patientDocuments.map((doc: any) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Badge variant="outline">{doc.document_type}</Badge>
                          </TableCell>
                          <TableCell>{doc.file_name || "—"}</TableCell>
                          <TableCell>{doc.visit_id ? `Visit #${doc.visit_id}` : "—"}</TableCell>
                          <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>Patient appointment history</CardDescription>
              </CardHeader>
              <CardContent>
                {!patientAppointments || patientAppointments.length === 0 ? (
                  <p className="text-muted-foreground">No appointments found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Clinic</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {patientAppointments.map((appointment: any) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{new Date(appointment.appointment_date).toLocaleString()}</TableCell>
                          <TableCell>{appointment.doctor?.name || "—"}</TableCell>
                          <TableCell>{appointment.clinic?.name || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{appointment.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{appointment.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value="visits">
            <Card>
              <CardHeader>
                <CardTitle>Visits</CardTitle>
                <CardDescription>Patient visit history</CardDescription>
              </CardHeader>
              <CardContent>
                {!patientVisits || patientVisits.length === 0 ? (
                  <p className="text-muted-foreground">No visits found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Clinic</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {patientVisits.map((visit: any) => (
                        <TableRow key={visit.id}>
                          <TableCell>{new Date(visit.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{visit.doctor?.name || "—"}</TableCell>
                          <TableCell>{visit.clinic?.name || "—"}</TableCell>
                          <TableCell>{visit.diagnosis || "—"}</TableCell>
                          <TableCell>
                            <Badge>{visit.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions</CardTitle>
                <CardDescription>Patient prescription history</CardDescription>
              </CardHeader>
              <CardContent>
                {!patientPrescriptions || patientPrescriptions.length === 0 ? (
                  <p className="text-muted-foreground">No prescriptions found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Doctor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {patientPrescriptions.map((prescription: any) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">{prescription.medication_name}</TableCell>
                          <TableCell>{prescription.dosage}</TableCell>
                          <TableCell>{prescription.frequency}</TableCell>
                          <TableCell>{prescription.duration}</TableCell>
                          <TableCell>{prescription.doctor?.name || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
