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
import { Plus, Trash2 } from "lucide-react"
import {
  useDoctorPreferredMedicines,
  useRemoveDoctorPreferredMedicine,
} from "@/hooks/use-healthcare"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

export function MyMedicines() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Mutations
  const removePreferredMedicine = useRemoveDoctorPreferredMedicine()

  // Get current user's preferred medicines (assuming user has doctor profile)
  const { data: preferredMedicines } = useDoctorPreferredMedicines(user?.id || 0)

  const preferredMedicinesList = preferredMedicines || []

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
              <Button onClick={() => navigate("/healthcare/add-preferred-medicines")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
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
                    <TableHead>Active Ingredient</TableHead>
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
                        {medicine.active_ingredient ? (
                          <Badge variant="secondary">{medicine.active_ingredient}</Badge>
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