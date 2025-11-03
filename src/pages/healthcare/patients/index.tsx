import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, Upload } from "lucide-react"
import { usePatients, useDeletePatient } from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import type { Patient } from "@/types"

// Helper function to get full image URL
const getImageUrl = (photoPath: string | null) => {
  if (!photoPath) return ""
  if (photoPath.startsWith("http")) return photoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${photoPath}`
}

export function Patients() {
  const navigate = useNavigate()

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [genderFilter, setGenderFilter] = useState<string>("all")

  // Patients
  const [patientsPage, setPatientsPage] = useState(1)
  const { data: patientsData, isLoading: loadingPatients } = usePatients(patientsPage, {
    search: debouncedSearch || undefined,
    gender: genderFilter !== "all" ? genderFilter : undefined,
  })
  const deletePatient = useDeletePatient()

  const patients = patientsData?.data || []

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return
    try {
      await deletePatient.mutateAsync(id)
    } catch (error) {
      console.error("Error deleting patient:", error)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          <Button onClick={() => navigate("/healthcare/patients/create")} className="shadow-lg hover:shadow-secondary/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter patients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, email, mobile..."
              />
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Patients</CardTitle>
            <CardDescription>
              {patientsData?.meta?.total || 0} total patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPatients ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">No patients found</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/healthcare/patients/create")}
                  className="mt-2"
                >
                  Create your first patient
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient: Patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={getImageUrl(patient.photo)} alt={patient.name} />
                            <AvatarFallback>{patient.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.email || "—"}</TableCell>
                        <TableCell>{patient.mobile || "—"}</TableCell>
                        <TableCell>{patient.gender || "—"}</TableCell>
                        <TableCell>{patient.city || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/patients/${patient.id}/details`)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/patients/${patient.id}/upload-document`)}
                              title="Upload Document"
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/patients/${patient.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(patient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {patientsData?.meta && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={patientsData.meta.current_page}
                      lastPage={patientsData.meta.last_page}
                      onPageChange={setPatientsPage}
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
