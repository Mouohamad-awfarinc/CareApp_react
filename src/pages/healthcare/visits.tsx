import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit, CheckCircle, Eye, Filter, FileText, FlaskConical } from "lucide-react"
import {
  useVisits,
  useCreateVisit,
  useUpdateVisit,
  useCompleteVisit,
  useVisitPrescriptions,
  useVisitLabTests,
  useClinics,
  useDoctors,
  usePatients,
  useAppointments,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import type { Visit } from "@/types"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    in_progress: "bg-yellow-500",
    completed: "bg-green-500",
  }
  return colors[status] || "bg-gray-500"
}

export function Visits() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  // Filters
  const [clinicFilter, setClinicFilter] = useState<string>("all")
  const [doctorFilter, setDoctorFilter] = useState<string>("all")
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFromFilter, setDateFromFilter] = useState<string>("")
  const [dateToFilter, setDateToFilter] = useState<string>("")

  // Pagination
  const [page, setPage] = useState(1)

  // Fetch data
  const { data: visitsData, isLoading } = useVisits(page, {
    clinic_id: clinicFilter !== "all" ? Number(clinicFilter) : undefined,
    doctor_id: doctorFilter !== "all" ? Number(doctorFilter) : undefined,
    patient_id: patientFilter !== "all" ? Number(patientFilter) : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    date_from: dateFromFilter || undefined,
    date_to: dateToFilter || undefined,
  })

  const { data: clinicsData } = useClinics(1, {})
  const { data: doctorsData } = useDoctors(1, {})
  const { data: patientsData } = usePatients(1, {})
  const { data: appointmentsData } = useAppointments(1, {})

  // Mutations
  const createVisit = useCreateVisit()
  const updateVisit = useUpdateVisit()
  const completeVisit = useCompleteVisit()

  // Dialog states
  const [visitDialogOpen, setVisitDialogOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false)
  const [viewingVisit, setViewingVisit] = useState<Visit | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    appointment_id: "",
    patient_id: "",
    doctor_id: "",
    clinic_id: "",
    diagnosis: "",
    doctor_notes: "",
  })

  // Fetch related data for viewing
  const { data: prescriptionsData } = useVisitPrescriptions(viewingVisit?.id || 0)
  const { data: labTestsData } = useVisitLabTests(viewingVisit?.id || 0)

  const handleOpenDialog = (visit?: Visit) => {
    if (visit) {
      setEditingVisit(visit)
      setFormData({
        appointment_id: visit.appointment_id.toString(),
        patient_id: visit.patient_id.toString(),
        doctor_id: visit.doctor_id.toString(),
        clinic_id: visit.clinic_id.toString(),
        diagnosis: visit.diagnosis || "",
        doctor_notes: visit.doctor_notes || "",
      })
    } else {
      setEditingVisit(null)
      setFormData({
        appointment_id: "",
        patient_id: "",
        doctor_id: "",
        clinic_id: "",
        diagnosis: "",
        doctor_notes: "",
      })
    }
    setVisitDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingVisit) {
        await updateVisit.mutateAsync({
          id: editingVisit.id,
          data: {
            diagnosis: formData.diagnosis || null,
            doctor_notes: formData.doctor_notes || null,
          },
        })
      } else {
        await createVisit.mutateAsync({
          appointment_id: Number(formData.appointment_id),
          patient_id: Number(formData.patient_id),
          doctor_id: Number(formData.doctor_id),
          clinic_id: Number(formData.clinic_id),
          diagnosis: formData.diagnosis || null,
          doctor_notes: formData.doctor_notes || null,
        })
      }
      setVisitDialogOpen(false)
    } catch (error) {
      console.error("Error saving visit:", error)
    }
  }

  const handleCompleteVisit = async (visitId: number) => {
    try {
      await completeVisit.mutateAsync(visitId)
    } catch (error) {
      console.error("Error completing visit:", error)
    }
  }

  const handleViewDetails = (visit: Visit) => {
    setViewingVisit(visit)
    setViewDetailsDialogOpen(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Visits</h1>
            <p className="text-muted-foreground">Manage patient visits</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Visit
          </Button>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Clinic</Label>
                <Select value={clinicFilter} onValueChange={setClinicFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Clinics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clinics</SelectItem>
                    {clinicsData?.data?.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id.toString()}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctorsData?.data?.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={patientFilter} onValueChange={setPatientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Patients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    {patientsData?.data?.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Visits List</CardTitle>
            <CardDescription>
              {visitsData?.meta?.total || 0} visits found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading visits...</div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitsData?.data?.map((visit: Visit) => (
                      <TableRow key={visit.id}>
                        <TableCell>{visit.id}</TableCell>
                        <TableCell>
                          {new Date(visit.started_at).toLocaleString()}
                        </TableCell>
                        <TableCell>{visit.patient?.name || "N/A"}</TableCell>
                        <TableCell>{visit.doctor?.name || "N/A"}</TableCell>
                        <TableCell>{visit.clinic?.name || "N/A"}</TableCell>
                        <TableCell>
                          {visit.diagnosis ? (
                            <span className="truncate max-w-[200px] block">
                              {visit.diagnosis}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">No diagnosis</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(visit)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(visit)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {visit.status === "in_progress" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteVisit(visit.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {visitsData?.data?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No visits found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {visitsData?.meta && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={visitsData.meta.current_page}
                      totalPages={visitsData.meta.last_page}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Visit Dialog */}
        <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVisit ? "Edit Visit" : "New Visit"}
              </DialogTitle>
              <DialogDescription>
                {editingVisit
                  ? "Update visit details"
                  : "Create a new visit"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {!editingVisit && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="appointment_id">Appointment *</Label>
                      <Select
                        value={formData.appointment_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, appointment_id: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select appointment" />
                        </SelectTrigger>
                        <SelectContent>
                          {appointmentsData?.data?.map((appointment: any) => (
                            <SelectItem key={appointment.id} value={appointment.id.toString()}>
                              Apt #{appointment.id} - {appointment.patient?.name || "N/A"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="patient_id">Patient *</Label>
                      <Select
                        value={formData.patient_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, patient_id: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patientsData?.data?.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="doctor_id">Doctor *</Label>
                      <Select
                        value={formData.doctor_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, doctor_id: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctorsData?.data?.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="clinic_id">Clinic *</Label>
                      <Select
                        value={formData.clinic_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, clinic_id: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinic" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinicsData?.data?.map((clinic) => (
                            <SelectItem key={clinic.id} value={clinic.id.toString()}>
                              {clinic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    rows={3}
                    placeholder="Enter diagnosis..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="doctor_notes">Doctor Notes</Label>
                  <Textarea
                    id="doctor_notes"
                    value={formData.doctor_notes}
                    onChange={(e) => setFormData({ ...formData, doctor_notes: e.target.value })}
                    rows={4}
                    placeholder="Enter doctor's notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVisitDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createVisit.isPending || updateVisit.isPending}>
                  {editingVisit ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Visit Details Dialog */}
        <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visit Details</DialogTitle>
              <DialogDescription>
                View complete visit information
              </DialogDescription>
            </DialogHeader>
            {viewingVisit && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="prescriptions">
                    <FileText className="mr-2 h-4 w-4" />
                    Prescriptions
                  </TabsTrigger>
                  <TabsTrigger value="lab-tests">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Lab Tests
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>Patient</Label>
                      <p className="text-sm font-medium">{viewingVisit.patient?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label>Doctor</Label>
                      <p className="text-sm font-medium">{viewingVisit.doctor?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label>Clinic</Label>
                      <p className="text-sm font-medium">{viewingVisit.clinic?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label>Started At</Label>
                      <p className="text-sm">{new Date(viewingVisit.started_at).toLocaleString()}</p>
                    </div>
                    {viewingVisit.ended_at && (
                      <div>
                        <Label>Ended At</Label>
                        <p className="text-sm">{new Date(viewingVisit.ended_at).toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <Label>Status</Label>
                      <Badge className={getStatusColor(viewingVisit.status)}>
                        {viewingVisit.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div>
                      <Label>Diagnosis</Label>
                      <p className="text-sm whitespace-pre-wrap">{viewingVisit.diagnosis || "No diagnosis recorded"}</p>
                    </div>
                    <div>
                      <Label>Doctor Notes</Label>
                      <p className="text-sm whitespace-pre-wrap">{viewingVisit.doctor_notes || "No notes recorded"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="prescriptions">
                  {prescriptionsData && prescriptionsData.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptionsData.map((prescription: any) => (
                        <Card key={prescription.id}>
                          <CardContent className="pt-6">
                            <div className="grid gap-2">
                              <div className="flex justify-between">
                                <span className="font-medium">{prescription.medication_name}</span>
                                <span className="text-sm text-muted-foreground">{prescription.dosage}</span>
                              </div>
                              <p className="text-sm">Frequency: {prescription.frequency}</p>
                              <p className="text-sm">Duration: {prescription.duration}</p>
                              {prescription.notes && (
                                <p className="text-sm text-muted-foreground">Notes: {prescription.notes}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No prescriptions for this visit</p>
                  )}
                </TabsContent>

                <TabsContent value="lab-tests">
                  {labTestsData && labTestsData.length > 0 ? (
                    <div className="space-y-4">
                      {labTestsData.map((labTest: any) => (
                        <Card key={labTest.id}>
                          <CardContent className="pt-6">
                            <div className="grid gap-2">
                              <div className="flex justify-between">
                                <span className="font-medium">{labTest.test_name}</span>
                                <Badge className={getStatusColor(labTest.status)}>
                                  {labTest.status}
                                </Badge>
                              </div>
                              <p className="text-sm">Test Code: {labTest.test_code}</p>
                              <p className="text-sm">Requested: {new Date(labTest.requested_date).toLocaleDateString()}</p>
                              {labTest.result && (
                                <p className="text-sm">Result: {labTest.result}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No lab tests for this visit</p>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

