import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Search, Plus, Minus } from "lucide-react"
import { useCompany, useClinics, useAssignClinicToCompany, useUnassignClinicFromCompany } from "@/hooks/use-healthcare"
import { Pagination } from "@/components/data-table/pagination"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

// Helper function to get full image URL
const getImageUrl = (logoPath: string | null) => {
  if (!logoPath) return ""
  if (logoPath.startsWith("http")) return logoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${logoPath}`
}

export function AssignClinic() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const companyId = parseInt(id || "0")

  const { data: company, isLoading: loadingCompany } = useCompany(companyId)
  const [clinicsPage, setClinicsPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: clinicsData, isLoading: loadingClinics } = useClinics(clinicsPage, { search: searchTerm })
  const assignClinic = useAssignClinicToCompany()
  const unassignClinic = useUnassignClinicFromCompany()

  const handleAssignClinic = async (clinicId: number) => {
    try {
      await assignClinic.mutateAsync({ companyId, clinicId })
      toast.success("Clinic assigned successfully!")
    } catch (error) {
      console.error("Failed to assign clinic:", error)
      toast.error("Failed to assign clinic. Please try again.")
    }
  }

  const handleUnassignClinic = async (clinicId: number) => {
    try {
      await unassignClinic.mutateAsync({ companyId, clinicId })
      toast.success("Clinic unassigned successfully!")
    } catch (error) {
      console.error("Failed to unassign clinic:", error)
      toast.error("Failed to unassign clinic. Please try again.")
    }
  }

  if (loadingCompany) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading company...</p>
        </div>
      </AppLayout>
    )
  }

  if (!company) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Company not found</p>
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
            onClick={() => navigate(`/healthcare/companies/${companyId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Assign Clinics to {company.name}</h1>
            <p className="text-muted-foreground">Manage clinic assignments for this company</p>
          </div>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={getImageUrl(company.logo)} alt={company.name} />
                <AvatarFallback className="text-lg">{company.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{company.name}</h3>
                <p className="text-sm text-muted-foreground">{company.email}</p>
                <Badge variant={company.is_active ? "default" : "secondary"} className="mt-1">
                  {company.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinics List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <CardTitle>Available Clinics</CardTitle>
                <CardDescription>
                  Search and assign clinics to this company
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clinics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingClinics ? (
              <div className="text-center py-4 text-muted-foreground">Loading clinics...</div>
            ) : !clinicsData?.data || clinicsData.data.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No clinics found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinicsData.data.map((clinic) => {
                      const isAssignedToThisCompany = clinic.company_id === companyId
                      const isAssignedToOtherCompany = clinic.company_id !== null && clinic.company_id !== companyId
                      const isAvailable = clinic.company_id === null
                      return (
                        <TableRow key={clinic.id}>
                          <TableCell>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={getImageUrl(clinic.photo)} alt={clinic.name} />
                              <AvatarFallback>{clinic.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          </TableCell>
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
                          <TableCell>
                            {isAssignedToThisCompany ? (
                              <Badge variant="default">Assigned</Badge>
                            ) : isAssignedToOtherCompany ? (
                              <Badge variant="destructive">Assigned to Another Company</Badge>
                            ) : (
                              <Badge variant="outline">Available</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isAssignedToThisCompany ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnassignClinic(clinic.id)}
                                disabled={unassignClinic.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Minus className="h-4 w-4 mr-1" />
                                Unassign
                              </Button>
                            ) : isAvailable ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignClinic(clinic.id)}
                                disabled={assignClinic.isPending}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Assign
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="text-gray-400 cursor-not-allowed"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Already Assigned
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {clinicsData?.meta && (
                  <Pagination
                    currentPage={clinicsData.meta.current_page}
                    lastPage={clinicsData.meta.last_page}
                    onPageChange={setClinicsPage}
                    total={clinicsData.meta.total}
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