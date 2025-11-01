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
import { Plus, Edit, XCircle, Calendar, AlertCircle, Filter } from "lucide-react"
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
  useClinics,
  useDoctors,
  usePatients,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import type { Appointment } from "@/types"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { Textarea } from "@/components/ui/textarea"

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    booked: "bg-blue-500",
    confirmed: "bg-green-500",
    arrived: "bg-purple-500",
    in_progress: "bg-yellow-500",
    completed: "bg-gray-500",
    cancelled: "bg-red-500",
    no_show: "bg-orange-500",
  }
  return colors[status] || "bg-gray-500"
}

export function Appointments() {
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
  const { data: appointmentsData, isLoading } = useAppointments(page, {
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

  // Mutations
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()
  const cancelAppointment = useCancelAppointment()

  // Dialog states
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    clinic_id: "",
    doctor_clinic_id: "",
    type: "in_clinic",
    appointment_date: "",
    notes: "",
    status: "booked",
  })

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment)
      setFormData({
        patient_id: appointment.patient_id.toString(),
        doctor_id: appointment.doctor_id.toString(),
        clinic_id: appointment.clinic_id.toString(),
        doctor_clinic_id: appointment.doctor_clinic_id.toString(),
        type: appointment.type,
        appointment_date: appointment.appointment_date.slice(0, 16),
        notes: appointment.notes || "",
        status: appointment.status,
      })
    } else {
      setEditingAppointment(null)
      setFormData({
        patient_id: "",
        doctor_id: "",
        clinic_id: "",
        doctor_clinic_id: "",
        type: "in_clinic",
        appointment_date: "",
        notes: "",
        status: "booked",
      })
    }
    setAppointmentDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAppointment) {
        await updateAppointment.mutateAsync({
          id: editingAppointment.id,
          data: {
            appointment_date: formData.appointment_date,
            status: formData.status,
            notes: formData.notes || null,
          },
        })
      } else {
        await createAppointment.mutateAsync({
          patient_id: Number(formData.patient_id),
          doctor_id: Number(formData.doctor_id),
          clinic_id: Number(formData.clinic_id),
          doctor_clinic_id: Number(formData.doctor_clinic_id),
          type: formData.type,
          appointment_date: formData.appointment_date,
          notes: formData.notes || null,
        })
      }
      setAppointmentDialogOpen(false)
    } catch (error) {
      console.error("Error saving appointment:", error)
    }
  }

  const handleOpenCancelDialog = (appointment: Appointment) => {
    setCancellingAppointment(appointment)
    setCancelReason("")
    setCancelDialogOpen(true)
  }

  const handleCancelAppointment = async () => {
    if (!cancellingAppointment) return
    try {
      await cancelAppointment.mutateAsync({
        id: cancellingAppointment.id,
        reason: cancelReason || undefined,
      })
      setCancelDialogOpen(false)
      setCancellingAppointment(null)
    } catch (error) {
      console.error("Error cancelling appointment:", error)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage patient appointments</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
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
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
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

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments List</CardTitle>
            <CardDescription>
              {appointmentsData?.meta?.total || 0} appointments found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading appointments...</div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointmentsData?.data?.map((appointment: Appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.id}</TableCell>
                        <TableCell>
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </TableCell>
                        <TableCell>{appointment.patient?.name || "N/A"}</TableCell>
                        <TableCell>{appointment.doctor?.name || "N/A"}</TableCell>
                        <TableCell>{appointment.clinic?.name || "N/A"}</TableCell>
                        <TableCell className="capitalize">{appointment.type.replace("_", " ")}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(appointment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenCancelDialog(appointment)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {appointmentsData?.data?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {appointmentsData?.meta && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={appointmentsData.meta.current_page}
                      totalPages={appointmentsData.meta.last_page}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Appointment Dialog */}
        <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Edit Appointment" : "New Appointment"}
              </DialogTitle>
              <DialogDescription>
                {editingAppointment
                  ? "Update appointment details"
                  : "Create a new appointment"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {!editingAppointment && (
                  <>
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

                    <div className="grid gap-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_clinic">In Clinic</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="home_visit">Home Visit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="appointment_date">Date & Time *</Label>
                  <Input
                    id="appointment_date"
                    type="datetime-local"
                    value={formData.appointment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, appointment_date: e.target.value })
                    }
                    required
                  />
                </div>

                {editingAppointment && (
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="arrived">Arrived</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAppointmentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAppointment.isPending || updateAppointment.isPending}>
                  {editingAppointment ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Cancel Appointment Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cancel_reason">Cancellation Reason</Label>
                <Textarea
                  id="cancel_reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                Keep Appointment
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancelAppointment}
                disabled={cancelAppointment.isPending}
              >
                Cancel Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

