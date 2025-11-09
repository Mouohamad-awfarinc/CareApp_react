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
import { ArrowLeft, Building2 } from "lucide-react"
import {
  useCompany,
  useCompanyClinics,
} from "@/hooks/use-healthcare"
import { Pagination } from "@/components/data-table/pagination"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Helper function to get full image URL
const getImageUrl = (logoPath: string | null) => {
  if (!logoPath) return ""
  if (logoPath.startsWith("http")) return logoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${logoPath}`
}

export function CompanyDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const companyId = parseInt(id || "0")

  const { data: company, isLoading } = useCompany(companyId)
  const [clinicsPage, setClinicsPage] = useState(1)

  const { data: clinicsData, isLoading: loadingClinics } = useCompanyClinics(companyId, clinicsPage)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading company details...</p>
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
            onClick={() => navigate("/healthcare/companies")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{company.name} Details</h1>
            <p className="text-muted-foreground">View clinics associated with this company</p>
          </div>
          <Button
            onClick={() => navigate(`/healthcare/companies/${companyId}/assign-clinic`)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Assign Clinic
          </Button>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={getImageUrl(company.logo)} alt={company.name} />
                <AvatarFallback className="text-2xl">{company.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{company.name}</h3>
                <p className="text-sm text-muted-foreground">{company.email}</p>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm">{company.phone || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                <p className="text-sm">{company.mobile || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={company.is_active ? "default" : "secondary"}>
                  {company.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Country</p>
                <p className="text-sm">{company.country || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">City</p>
                <p className="text-sm">{company.city || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">District</p>
                <p className="text-sm">{company.district || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Area</p>
                <p className="text-sm">{company.area || "—"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm">{company.address || "—"}</p>
              </div>
              {company.description && (
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{company.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clinics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Clinics ({clinicsData?.meta?.total || 0})</CardTitle>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinicsData.data.map((clinic) => (
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
                      </TableRow>
                    ))}
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