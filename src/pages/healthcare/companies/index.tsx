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
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-react"
import {
  useCompanies,
  useDeleteCompany,
  useToggleCompanyStatus,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Helper function to get full image URL
const getImageUrl = (logoPath: string | null) => {
  if (!logoPath) return ""
  if (logoPath.startsWith("http")) return logoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${logoPath}`
}

export function Companies() {
  const navigate = useNavigate()

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [cityFilter, setCityFilter] = useState("all")

  // Companies
  const [companiesPage, setCompaniesPage] = useState(1)
  const { data: companiesData, isLoading: loadingCompanies } = useCompanies(companiesPage, {
    search: debouncedSearch || undefined,
    city: cityFilter && cityFilter !== "all" ? cityFilter : undefined,
  })
  const deleteCompany = useDeleteCompany()
  const toggleCompanyStatus = useToggleCompanyStatus()

  const companies = companiesData?.data || []

  // Get unique cities for filters
  const cities = Array.from(new Set(companies.map((c) => c.city).filter(Boolean))) as string[]

  const handleDeleteCompany = async (id: number) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompany.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete company"
        alert(errorMessage)
      }
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleCompanyStatus.mutateAsync(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to toggle company status"
      alert(errorMessage)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-muted-foreground">Manage healthcare companies</p>
          </div>
          <Button onClick={() => navigate("/healthcare/companies/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Companies</CardTitle>
            <CardDescription>
              A list of all healthcare companies{" "}
              {companiesData?.meta?.total ? `(${companiesData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search companies..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingCompanies ? (
              <div className="text-center py-8 text-muted-foreground">Loading companies...</div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No companies found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getImageUrl(company.logo)} alt={company.name} />
                            <AvatarFallback>{company.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>{company.phone || "—"}</TableCell>
                        <TableCell>{company.city || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={company.is_active ? "default" : "secondary"}>
                            {company.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/companies/${company.id}/details`)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(company.id)}
                              title={company.is_active ? "Deactivate" : "Activate"}
                            >
                              {company.is_active ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/companies/${company.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCompany(company.id)}
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
                {companiesData?.meta && (
                  <Pagination
                    currentPage={companiesData.meta.current_page}
                    lastPage={companiesData.meta.last_page}
                    onPageChange={setCompaniesPage}
                    total={companiesData.meta.total}
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