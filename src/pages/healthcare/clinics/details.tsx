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
import { ArrowLeft, Stethoscope, UserPlus } from "lucide-react"
import {
  useClinic,
  useClinicDoctors,
  useClinicPatients,
} from "@/hooks/use-healthcare"
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

export function ClinicDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const clinicId = parseInt(id || "0")

  const { data: clinic, isLoading } = useClinic(clinicId)
  const [doctorsPage, setDoctorsPage] = useState(1)
  const [patientsPage, setPatientsPage] = useState(1)

  const { data: doctorsData, isLoading: loadingDoctors } = useClinicDoctors(clinicId, doctorsPage)
  const { data: patientsData, isLoading: loadingPatients } = useClinicPatients(clinicId, patientsPage)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading clinic details...</p>
        </div>
      </AppLayout>
    )
  }

  if (!clinic) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Clinic not found</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/healthcare/clinics")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{clinic.name} Details</h1>
            <p className="text-muted-foreground">View doctors and patients associated with this clinic</p>
          </div>
        </div>

        {/* Clinic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={getImageUrl(clinic.photo)} alt={clinic.name} />
                <AvatarFallback className="text-2xl">{clinic.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{clinic.name}</h3>
                <p className="text-sm text-muted-foreground">{clinic.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">City</p>
                <p className="text-sm">{clinic.city || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <Badge variant="secondary">{clinic.category || "—"}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                <p className="text-sm">{clinic.mobile || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm">{clinic.phone || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Country</p>
                <p className="text-sm">{clinic.country || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">District</p>
                <p className="text-sm">{clinic.district || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Area</p>
                <p className="text-sm">{clinic.area || "—"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm">{clinic.address || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fees</p>
                <p className="text-sm">{clinic.fees ? `$${clinic.fees}` : "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consultation Fees</p>
                <p className="text-sm">{clinic.consultation_fees ? `$${clinic.consultation_fees}` : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctors */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              <CardTitle>Doctors ({doctorsData?.meta?.total || 0})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDoctors ? (
              <div className="text-center py-4 text-muted-foreground">Loading doctors...</div>
            ) : !doctorsData?.data || doctorsData.data.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No doctors found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Mobile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorsData.data.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>
                          {doctor.specialty ? (
                            <Badge variant="secondary">{doctor.specialty.name}</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{doctor.mobile || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {doctorsData?.meta && (
                  <Pagination
                    currentPage={doctorsData.meta.current_page}
                    lastPage={doctorsData.meta.last_page}
                    onPageChange={setDoctorsPage}
                    total={doctorsData.meta.total}
                  />
                )}
              </>
            )}
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
