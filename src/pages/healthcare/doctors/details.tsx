import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, UserPlus, Building2, Pill } from "lucide-react"
import { useDoctor, useDoctorPatients, useDoctorClinics } from "@/hooks/use-healthcare"
import { Pagination } from "@/components/data-table/pagination"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Helper function to get full image URL
const getImageUrl = (photoPath: string | null) => {
  if (!photoPath) return ""
  if (photoPath.startsWith("http")) return photoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${photoPath}`
}

export function DoctorDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const doctorId = parseInt(id || "0")

  const { data: doctor, isLoading } = useDoctor(doctorId)
  const [patientsPage, setPatientsPage] = useState(1)
  const { data: patientsData, isLoading: loadingPatients } = useDoctorPatients(
    doctorId,
    patientsPage
  )
  const { data: doctorClinicsData } = useDoctorClinics(doctorId)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading doctor details...</p>
        </div>
      </AppLayout>
    )
  }

  if (!doctor) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Doctor not found</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/healthcare/doctors")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{doctor.name} Details</h1>
            <p className="text-muted-foreground">View patients and clinics associated with this doctor</p>
          </div>
        </div>

        {/* Doctor Info */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={getImageUrl(doctor.photo)} alt={doctor.name} />
                <AvatarFallback className="text-2xl">
                  {doctor.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Specialty</p>
                {doctor.specialty ? (
                  <Badge variant="secondary">{doctor.specialty.name}</Badge>
                ) : (
                  <p className="text-sm">—</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                <p className="text-sm">{doctor.mobile || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">License Number</p>
                <p className="text-sm">{doctor.license_number || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-sm">{doctor.title || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                <p className="text-sm">{doctor.occupation || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Experience</p>
                <p className="text-sm">{doctor.experience_years ? `${doctor.experience_years} years` : "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-sm">{doctor.gender || "—"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Qualifications</p>
                <p className="text-sm">{doctor.qualifications?.join(", ") || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Clinics ({doctorClinicsData?.length || 0})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!doctorClinicsData || doctorClinicsData.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No clinics found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctorClinicsData.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">{clinic.name}</TableCell>
                      <TableCell>{clinic.email}</TableCell>
                      <TableCell>{clinic.city || "—"}</TableCell>
                      <TableCell>
                        {clinic.category ? (
                          <Badge variant="secondary">{clinic.category}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Preferred Medicines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                <CardTitle>Preferred Medicines</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/healthcare/doctors/${doctorId}/preferred-medicines`)}
              >
                Manage Preferred Medicines
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage the medicines that this doctor frequently prescribes and prefers to use.
            </p>
          </CardContent>
        </Card>

        {/* Patients */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              <CardTitle>Patients ({patientsData?.meta?.total || 0})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPatients ? (
              <div className="text-center py-4 text-muted-foreground">Loading patients...</div>
            ) : !patientsData?.data || patientsData.data.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No patients found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Gender</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientsData.data.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.email || "—"}</TableCell>
                        <TableCell>{patient.mobile || "—"}</TableCell>
                        <TableCell>{patient.gender || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {patientsData?.meta && (
                  <Pagination
                    currentPage={patientsData.meta.current_page}
                    lastPage={patientsData.meta.last_page}
                    onPageChange={setPatientsPage}
                    total={patientsData.meta.total}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
