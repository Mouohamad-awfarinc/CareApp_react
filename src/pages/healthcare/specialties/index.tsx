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
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  useSpecialties,
  useDeleteSpecialty,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"

export function Specialties() {
  const navigate = useNavigate()
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Specialties
  const [specialtiesPage, setSpecialtiesPage] = useState(1)
  const { data: specialtiesData, isLoading: loadingSpecialties } = useSpecialties(
    specialtiesPage,
    { search: debouncedSearch || undefined }
  )
  const deleteSpecialty = useDeleteSpecialty()

  const specialties = specialtiesData?.data || []

  const handleDeleteSpecialty = async (id: number) => {
    if (confirm("Are you sure you want to delete this specialty?")) {
      try {
        await deleteSpecialty.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete specialty"
        alert(errorMessage)
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <div className="accent-line-green" />
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Specialties Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage medical specialties and their information
            </p>
          </div>
          <Button onClick={() => navigate('/healthcare/specialties/create')} className="shadow-lg hover:shadow-secondary/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Specialty
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Specialties</CardTitle>
            <CardDescription>
              A list of all medical specialties {specialtiesData?.meta?.total ? `(${specialtiesData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search specialties..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {loadingSpecialties ? (
              <div className="text-center py-8 text-muted-foreground">Loading specialties...</div>
            ) : specialties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No specialties found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialties.map((specialty) => (
                      <TableRow key={specialty.id}>
                        <TableCell className="font-medium">{specialty.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {specialty.description || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/specialties/${specialty.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSpecialty(specialty.id)}
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
                {specialtiesData?.meta && (
                  <Pagination
                    currentPage={specialtiesData.meta.current_page}
                    lastPage={specialtiesData.meta.last_page}
                    onPageChange={setSpecialtiesPage}
                    total={specialtiesData.meta.total}
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
