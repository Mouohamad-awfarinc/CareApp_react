import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, XCircle, Filter } from "lucide-react"
import { useAppointments, useClinics, useDoctors, usePatients } from "@/hooks/use-healthcare"
import type { Appointment } from "@/types"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"

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
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState("")
  
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

  const appointments = appointmentsData?.data || []
  const clinics = clinicsData?.data || []
  const doctors = doctorsData?.data || []
  const patients = patientsData?.data || []

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">Manage patient appointments</p>
          </div>
          <Button onClick={() => navigate("/healthcare/appointments/create")} className="shadow-lg hover:shadow-secondary/20">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            <CardDescription>Filter appointments by various criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search appointments..."
              />
              <Select value={clinicFilter} onValueChange={setClinicFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by clinic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clinics</SelectItem>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id.toString()}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="date_from" className="text-sm font-medium">
                  Date From
                </label>
                <Input
                  id="date_from"
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="date_to" className="text-sm font-medium">
                  Date To
                </label>
                <Input
                  id="date_to"
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
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>
              {appointmentsData?.meta?.total || 0} total appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">No appointments found</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/healthcare/appointments/create")}
                  className="mt-2"
                >
                  Create your first appointment
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment: Appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {appointment.patient?.name || "N/A"}
                        </TableCell>
                        <TableCell>{appointment.doctor?.name || "N/A"}</TableCell>
                        <TableCell>{appointment.clinic?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{appointment.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/appointments/${appointment.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/healthcare/appointments/${appointment.id}/cancel`)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {appointmentsData?.meta && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={appointmentsData.meta.current_page}
                      lastPage={appointmentsData.meta.last_page}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
