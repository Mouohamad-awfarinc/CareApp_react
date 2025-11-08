import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useMedicine, useUpdateMedicine } from "@/hooks/use-healthcare"
import type { UpdateMedicineRequest } from "@/types"

export function EditMedicine() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const medicineId = parseInt(id || "0")

  const { data: medicine, isLoading: loadingMedicine } = useMedicine(medicineId)
  const updateMedicine = useUpdateMedicine()

  const [formData, setFormData] = useState<UpdateMedicineRequest>({
    name: "",
    description: "",
    dosage_form: "",
    strength: "",
    manufacturer: "",
    category: "",
    is_active: true,
  })

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        description: medicine.description || "",
        dosage_form: medicine.dosage_form || "",
        strength: medicine.strength || "",
        manufacturer: medicine.manufacturer || "",
        category: medicine.category || "",
        is_active: medicine.is_active,
      })
    }
  }, [medicine])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMedicine.mutateAsync({ id: medicineId, data: formData })
      navigate(`/healthcare/medicines/${medicineId}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update medicine"
      alert(errorMessage)
    }
  }

  const handleInputChange = (field: keyof UpdateMedicineRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loadingMedicine) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading medicine...</p>
        </div>
      </AppLayout>
    )
  }

  if (!medicine) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Medicine not found</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/healthcare/medicines/${medicineId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Medicine</h1>
            <p className="text-muted-foreground">Update medicine information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Medicine Information</CardTitle>
            <CardDescription>
              Update the details for {medicine.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter medicine name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage_form">Dosage Form</Label>
                  <Input
                    id="dosage_form"
                    value={formData.dosage_form || ""}
                    onChange={(e) => handleInputChange("dosage_form", e.target.value)}
                    placeholder="e.g., Tablet, Capsule, Syrup"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strength">Strength</Label>
                  <Input
                    id="strength"
                    value={formData.strength || ""}
                    onChange={(e) => handleInputChange("strength", e.target.value)}
                    placeholder="e.g., 500mg, 10mg/ml"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer || ""}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    placeholder="Enter manufacturer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ""}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="e.g., Antibiotic, Analgesic"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Active Status</Label>
                  <Select
                    value={formData.is_active ? "active" : "inactive"}
                    onValueChange={(value) => handleInputChange("is_active", value === "active")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter medicine description"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/healthcare/medicines/${medicineId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMedicine.isPending}>
                  {updateMedicine.isPending ? "Updating..." : "Update Medicine"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}