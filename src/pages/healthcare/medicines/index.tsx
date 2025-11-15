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
  useMedicines,
  useDeleteMedicine,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"

export function Medicines() {
  const navigate = useNavigate()

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [activeIngredientFilter, setActiveIngredientFilter] = useState<string>("all")
  const [dosageFormFilter, setDosageFormFilter] = useState<string>("all")

  // Medicines
  const [medicinesPage, setMedicinesPage] = useState(1)
  const { data: medicinesData, isLoading: loadingMedicines } = useMedicines(medicinesPage, {
    search: debouncedSearch || undefined,
    active_ingredient: activeIngredientFilter !== "all" ? activeIngredientFilter : undefined,
    dosage_form: dosageFormFilter !== "all" ? dosageFormFilter : undefined,
  })
  const deleteMedicine = useDeleteMedicine()

  const medicines = medicinesData?.data || []

  // Get unique active ingredients for filter
  const activeIngredients = [...new Set(medicines.map(m => m.active_ingredient).filter((ai): ai is string => ai !== null))]
  const dosageForms = [...new Set(medicines.map(m => m.dosage_form).filter((d): d is string => d !== null))]

  const handleDeleteMedicine = async (id: number) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteMedicine.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete medicine"
        alert(errorMessage)
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
            <p className="text-muted-foreground">Manage healthcare medicines</p>
          </div>
          <Button onClick={() => navigate("/healthcare/medicines/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Medicine
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Medicines</CardTitle>
            <CardDescription>
              A list of all medicines{" "}
              {medicinesData?.meta?.total ? `(${medicinesData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <Select value={activeIngredientFilter} onValueChange={setActiveIngredientFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by active ingredient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Active Ingredients</SelectItem>
                  {activeIngredients.map((activeIngredient) => (
                    <SelectItem key={activeIngredient} value={activeIngredient}>
                      {activeIngredient}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dosageFormFilter} onValueChange={setDosageFormFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by dosage form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dosage Forms</SelectItem>
                  {dosageForms.map((dosageForm) => (
                    <SelectItem key={dosageForm} value={dosageForm}>
                      {dosageForm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingMedicines ? (
              <div className="text-center py-8 text-muted-foreground">Loading medicines...</div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No medicines found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Dosage Form</TableHead>
                      <TableHead>Strength</TableHead>
                      <TableHead>Active Ingredient</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell className="font-medium">{medicine.name}</TableCell>
                        <TableCell>{medicine.dosage_form || "—"}</TableCell>
                        <TableCell>{medicine.strength || "—"}</TableCell>
                        <TableCell>
                          {medicine.active_ingredient ? (
                            <Badge variant="secondary">{medicine.active_ingredient}</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{medicine.manufacturer || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={medicine.is_active ? "default" : "secondary"}>
                            {medicine.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/medicines/${medicine.id}`)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/medicines/${medicine.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMedicine(medicine.id)}
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
                {medicinesData?.meta && (
                  <Pagination
                    currentPage={medicinesData.meta.current_page}
                    lastPage={medicinesData.meta.last_page}
                    onPageChange={setMedicinesPage}
                    total={medicinesData.meta.total}
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