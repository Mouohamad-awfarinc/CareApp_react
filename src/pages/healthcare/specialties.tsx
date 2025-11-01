import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import {
  useSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import type { Specialty } from "@/types"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"

export function Specialties() {
  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Specialties
  const [specialtiesPage, setSpecialtiesPage] = useState(1)
  const { data: specialtiesData, isLoading: loadingSpecialties } = useSpecialties(
    specialtiesPage,
    { search: debouncedSearch || undefined }
  )
  const createSpecialty = useCreateSpecialty()
  const updateSpecialty = useUpdateSpecialty()
  const deleteSpecialty = useDeleteSpecialty()

  // Dialog states
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)

  // Form states
  const [specialtyForm, setSpecialtyForm] = useState({ name: "", description: "" })
  const [error, setError] = useState("")

  const specialties = specialtiesData?.data || []

  const handleOpenSpecialtyDialog = (specialty?: Specialty) => {
    if (specialty) {
      setEditingSpecialty(specialty)
      setSpecialtyForm({ name: specialty.name, description: specialty.description || "" })
    } else {
      setEditingSpecialty(null)
      setSpecialtyForm({ name: "", description: "" })
    }
    setError("")
    setSpecialtyDialogOpen(true)
  }

  const handleSubmitSpecialty = async () => {
    try {
      setError("")
      if (editingSpecialty) {
        await updateSpecialty.mutateAsync({ id: editingSpecialty.id, data: specialtyForm })
      } else {
        await createSpecialty.mutateAsync(specialtyForm)
      }
      setSpecialtyDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save specialty"
      setError(errorMessage)
    }
  }

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Specialties</h1>
            <p className="text-muted-foreground">
              Manage medical specialties
            </p>
          </div>
          <Button onClick={() => handleOpenSpecialtyDialog()}>
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
                              onClick={() => handleOpenSpecialtyDialog(specialty)}
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

        {/* Specialty Dialog */}
        <Dialog open={specialtyDialogOpen} onOpenChange={setSpecialtyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSpecialty ? "Edit Specialty" : "Create Specialty"}
              </DialogTitle>
              <DialogDescription>
                {editingSpecialty
                  ? "Update specialty information"
                  : "Create a new medical specialty"}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="specialty-name">Name *</Label>
                <Input
                  id="specialty-name"
                  value={specialtyForm.name}
                  onChange={(e) => setSpecialtyForm({ ...specialtyForm, name: e.target.value })}
                  placeholder="Cardiology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty-description">Description</Label>
                <Input
                  id="specialty-description"
                  value={specialtyForm.description}
                  onChange={(e) =>
                    setSpecialtyForm({ ...specialtyForm, description: e.target.value })
                  }
                  placeholder="Heart and cardiovascular system"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSpecialtyDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSpecialty}
                disabled={createSpecialty.isPending || updateSpecialty.isPending}
              >
                {createSpecialty.isPending || updateSpecialty.isPending
                  ? "Saving..."
                  : editingSpecialty
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}


