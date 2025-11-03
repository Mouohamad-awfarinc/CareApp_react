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
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import {
  useClinics,
  useDeleteClinic,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
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

export function Clinics() {
  const navigate = useNavigate()

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [cityFilter, setCityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Clinics
  const [clinicsPage, setClinicsPage] = useState(1)
  const { data: clinicsData, isLoading: loadingClinics } = useClinics(clinicsPage, {
    search: debouncedSearch || undefined,
    city: cityFilter && cityFilter !== "all" ? cityFilter : undefined,
    category: categoryFilter && categoryFilter !== "all" ? categoryFilter : undefined,
  })
  const deleteClinic = useDeleteClinic()

  const clinics = clinicsData?.data || []

  // Get unique cities and categories for filters
  const cities = Array.from(new Set(clinics.map((c) => c.city).filter(Boolean))) as string[]
  const categories = Array.from(new Set(clinics.map((c) => c.category).filter(Boolean))) as string[]

  const handleDeleteClinic = async (id: number) => {
    if (confirm("Are you sure you want to delete this clinic?")) {
      try {
        await deleteClinic.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete clinic"
        alert(errorMessage)
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clinics</h1>
            <p className="text-muted-foreground">Manage healthcare clinics</p>
          </div>
          <Button onClick={() => navigate("/healthcare/clinics/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Clinic
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Clinics</CardTitle>
            <CardDescription>
              A list of all healthcare clinics{" "}
              {clinicsData?.meta?.total ? `(${clinicsData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search clinics..."
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingClinics ? (
              <div className="text-center py-8 text-muted-foreground">Loading clinics...</div>
            ) : clinics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No clinics found</div>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinics.map((clinic) => (
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
                        <TableCell>{clinic.category || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/clinics/${clinic.id}/details`)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/clinics/${clinic.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClinic(clinic.id)}
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
