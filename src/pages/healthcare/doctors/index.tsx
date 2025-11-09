import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Plus, Edit, Trash2, Eye, Building2, Calendar } from "lucide-react"
import {
  useDoctors,
  useDeleteDoctor,
  useSpecialties,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Helper function to get full image URL
const getImageUrl = (photoPath: string | null) => {
  if (!photoPath) return ""
  if (photoPath.startsWith("http")) return photoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${photoPath}`
}

export function Doctors() {
  const navigate = useNavigate()

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>("all")

  // Doctors
  const [doctorsPage, setDoctorsPage] = useState(1)
  const { data: doctorsData, isLoading: loadingDoctors } = useDoctors(doctorsPage, {
    search: debouncedSearch || undefined,
    specialty_id:
      specialtyFilter && specialtyFilter !== "all" ? Number(specialtyFilter) : undefined,
    review_status: reviewStatusFilter !== "all" ? reviewStatusFilter : undefined,
  })
  const deleteDoctor = useDeleteDoctor()

  // Specialties for filter
  const [specialtiesPage] = useState(1)
  const { data: specialtiesData } = useSpecialties(specialtiesPage)

  const doctors = doctorsData?.data || []
  const specialties = specialtiesData?.data || []

  const handleDeleteDoctor = async (id: number) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      try {
        await deleteDoctor.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete doctor"
        alert(errorMessage)
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
            <p className="text-muted-foreground">Manage healthcare doctors</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/healthcare/doctors/review")} variant="outline">
              Review Licenses
            </Button>
            <Button onClick={() => navigate("/healthcare/doctors/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Doctors</CardTitle>
            <CardDescription>
              A list of all healthcare doctors{" "}
              {doctorsData?.meta?.total ? `(${doctorsData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id.toString()}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={reviewStatusFilter} onValueChange={setReviewStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by review status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingDoctors ? (
              <div className="text-center py-8 text-muted-foreground">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No doctors found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Review Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getImageUrl(doctor.photo)} alt={doctor.name} />
                            <AvatarFallback>{doctor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
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
                        <TableCell>
                          <Badge
                            variant={
                              doctor.review_status === 'approved' ? 'default' :
                              doctor.review_status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {doctor.review_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/doctors/${doctor.id}/details`)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/doctors/${doctor.id}/assign-clinics`)}
                              title="Assign Clinics"
                            >
                              <Building2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/doctors/${doctor.id}/schedule`)}
                              title="Manage Schedule"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/doctors/${doctor.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDoctor(doctor.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
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
      </div>
    </AppLayout>
  )
}
