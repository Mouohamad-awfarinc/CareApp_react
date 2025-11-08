import { useState } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"
import {
  useMedicines,
  useDoctorPreferredMedicines,
  useAddDoctorPreferredMedicine,
  useRemoveDoctorPreferredMedicine,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { useAuth } from "@/hooks/use-auth"
import type { Medicine } from "@/types"

export function MyMedicines() {
  const { user } = useAuth()

  // All medicines for adding
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [medicinesPage, setMedicinesPage] = useState(1)
  const { data: medicinesData } = useMedicines(medicinesPage, {
    search: debouncedSearch || undefined,
    is_active: true, // Only show active medicines
  })

  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)

  // Mutations
  const addPreferredMedicine = useAddDoctorPreferredMedicine()
  const removePreferredMedicine = useRemoveDoctorPreferredMedicine()

  // Get current user's preferred medicines (assuming user has doctor profile)
  const { data: preferredMedicines } = useDoctorPreferredMedicines(user?.id || 0)

  const medicines = medicinesData?.data || []
  const preferredMedicinesList = preferredMedicines || []

  const handleAddMedicine = async () => {
    if (!selectedMedicine || !user?.id) return

    try {
      await addPreferredMedicine.mutateAsync({
        doctorId: user.id,
        medicineId: selectedMedicine.id,
      })
      setIsAddDialogOpen(false)
      setSelectedMedicine(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add medicine"
      alert(errorMessage)
    }
  }

  const handleRemoveMedicine = async (medicineId: number) => {
    if (!user?.id) return

    if (confirm("Are you sure you want to remove this medicine from your preferred list?")) {
      try {
        await removePreferredMedicine.mutateAsync({
          doctorId: user.id,
          medicineId,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to remove medicine"
        alert(errorMessage)
      }
    }
  }

  const availableMedicines = medicines.filter(
    medicine => !preferredMedicinesList.some(pm => pm.id === medicine.id)
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Medicines</h1>
          <p className="text-muted-foreground">
            Manage your preferred medicines
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Preferred Medicines</CardTitle>
                <CardDescription>
                  Medicines you prefer to use in your practice
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medicine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Preferred Medicine</DialogTitle>
                    <DialogDescription>
                      Select a medicine to add to your preferred list
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <SearchInput
                        placeholder="Search available medicines..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      {availableMedicines.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          No available medicines found
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {availableMedicines.map((medicine) => (
                            <div
                              key={medicine.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedMedicine?.id === medicine.id
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => setSelectedMedicine(medicine)}
                            >
                              <div className="font-medium">{medicine.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {medicine.dosage_form && `${medicine.dosage_form}`}
                                {medicine.strength && ` - ${medicine.strength}`}
                                {medicine.manufacturer && ` by ${medicine.manufacturer}`}
                              </div>
                              {medicine.category && (
                                <Badge variant="secondary" className="mt-1">
                                  {medicine.category}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {medicinesData?.meta && medicinesData.meta.last_page > 1 && (
                      <Pagination
                        currentPage={medicinesData.meta.current_page}
                        lastPage={medicinesData.meta.last_page}
                        onPageChange={setMedicinesPage}
                        total={medicinesData.meta.total}
                      />
                    )}

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false)
                          setSelectedMedicine(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddMedicine}
                        disabled={!selectedMedicine || addPreferredMedicine.isPending}
                      >
                        {addPreferredMedicine.isPending ? "Adding..." : "Add Medicine"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {preferredMedicinesList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No preferred medicines added yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Dosage Form</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preferredMedicinesList.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.dosage_form || "—"}</TableCell>
                      <TableCell>{medicine.strength || "—"}</TableCell>
                      <TableCell>
                        {medicine.category ? (
                          <Badge variant="secondary">{medicine.category}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{medicine.manufacturer || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMedicine(medicine.id)}
                          title="Remove from preferred"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}