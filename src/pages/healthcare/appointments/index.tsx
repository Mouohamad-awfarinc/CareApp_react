import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, XCircle, Filter, UserPlus } from "lucide-react"
import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import type { Appointment } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/data-table/pagination"
import { SearchInput } from "@/components/data-table/search-input"

export function Appointments() {
  const navigate = useNavigate()

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchFilter, setSearchFilter] = useState<string>("")

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(searchFilter, 500)

  // Pagination
  const [page, setPage] = useState(1)

  // Fetch data (only status filter is sent)
  const { data: appointmentsData, isLoading } = useAppointments(page, {
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: debouncedSearch || undefined,
  })

  const appointments = appointmentsData?.data || []

  const updateAppointmentStatus = useUpdateAppointmentStatus()

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">Manage patient appointments</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/healthcare/patients/create")}
              className="shadow-lg hover:shadow-secondary/20"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
            <Button onClick={() => navigate("/healthcare/appointments/create")} className="shadow-lg hover:shadow-secondary/20">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </div>
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
                placeholder="Search by patient name, email, mobile, or notes..."
                value={searchFilter}
                onChange={setSearchFilter}
              />
              <div />
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
                          <Select
                            value={appointment.status}
                            onValueChange={(value) => {
                              updateAppointmentStatus.mutate({
                                id: appointment.id,
                                status: value,
                              })
                            }}
                            disabled={updateAppointmentStatus.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="booked">Booked</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="arrived">Arrived</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="no_show">No Show</SelectItem>
                            </SelectContent>
                          </Select>
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
