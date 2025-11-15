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
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus } from "lucide-react"
import {
  useMedicines,
  useDoctorPreferredMedicines,
  useAddDoctorPreferredMedicine,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { useAuth } from "@/hooks/use-auth"

export function AddPreferredMedicines() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Selected medicines state
  const [selectedMedicines, setSelectedMedicines] = useState<number[]>([])

  // Search and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [medicinesPage, setMedicinesPage] = useState(1)
  const { data: medicinesData } = useMedicines(medicinesPage, {
    search: debouncedSearch || undefined,
    is_active: true,
  })

  // Get current user's preferred medicines to filter out already added ones
  const { data: preferredMedicines } = useDoctorPreferredMedicines(user?.id || 0)

  // Mutations
  const addPreferredMedicine = useAddDoctorPreferredMedicine()

  const medicines = medicinesData?.data || []
  const preferredMedicinesList = preferredMedicines || []

  // Filter out already preferred medicines
  const availableMedicines = medicines.filter(
    medicine => !preferredMedicinesList.some(pm => pm.id === medicine.id)
  )

  const handleSelectMedicine = (medicineId: number, checked: boolean) => {
    if (checked) {
      setSelectedMedicines(prev => [...prev, medicineId])
    } else {
      setSelectedMedicines(prev => prev.filter(id => id !== medicineId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMedicines(availableMedicines.map(m => m.id))
    } else {
      setSelectedMedicines([])
    }
  }

  const handleAddSelectedMedicines = async () => {
    if (!user?.id || selectedMedicines.length === 0) return

    try {
      // Add all selected medicines
      const promises = selectedMedicines.map(medicineId =>
        addPreferredMedicine.mutateAsync({
          doctorId: user.id,
          medicineId,
        })
      )

      await Promise.all(promises)

      // Navigate back to my medicines page
      navigate("/healthcare/my-medicines")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add medicines"
      alert(errorMessage)
    }
  }

  const allSelected = availableMedicines.length > 0 && selectedMedicines.length === availableMedicines.length

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/healthcare/my-medicines")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Preferred Medicines</h1>
            <p className="text-muted-foreground">
              Select medicines to add to your preferred list
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Medicines</CardTitle>
                <CardDescription>
                  Choose medicines to add to your preferred list
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedMedicines.length} selected
                </span>
                <Button
                  onClick={handleAddSelectedMedicines}
                  disabled={selectedMedicines.length === 0 || addPreferredMedicine.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {addPreferredMedicine.isPending ? "Adding..." : "Add Selected"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <SearchInput
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                {availableMedicines.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Select All
                    </label>
                  </div>
                )}
              </div>

              {availableMedicines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No medicines found matching your search" : "All available medicines are already in your preferred list"}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Dosage Form</TableHead>
                        <TableHead>Strength</TableHead>
                        <TableHead>Active Ingredient</TableHead>
                        <TableHead>Manufacturer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableMedicines.map((medicine) => (
                        <TableRow
                          key={medicine.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            const isSelected = selectedMedicines.includes(medicine.id)
                            handleSelectMedicine(medicine.id, !isSelected)
                          }}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedMedicines.includes(medicine.id)}
                              onCheckedChange={(checked) =>
                                handleSelectMedicine(medicine.id, checked as boolean)
                              }
                            />
                          </TableCell>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {medicinesData?.meta && medicinesData.meta.last_page > 1 && (
                <Pagination
                  currentPage={medicinesData.meta.current_page}
                  lastPage={medicinesData.meta.last_page}
                  onPageChange={setMedicinesPage}
                  total={medicinesData.meta.total}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}