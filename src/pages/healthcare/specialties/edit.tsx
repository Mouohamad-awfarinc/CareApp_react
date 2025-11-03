import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useSpecialties, useUpdateSpecialty } from "@/hooks/use-healthcare"

export function EditSpecialty() {
  const navigate = useNavigate()
  const { specialtyId } = useParams<{ specialtyId: string }>()
  const { data: specialtiesData } = useSpecialties(1, {})
  const updateSpecialty = useUpdateSpecialty()

  const specialty = specialtiesData?.data?.find(s => s.id === Number(specialtyId))

  const [specialtyForm, setSpecialtyForm] = useState({ name: "", description: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    if (specialty) {
      setSpecialtyForm({ name: specialty.name, description: specialty.description || "" })
    }
  }, [specialty])

  const handleSubmitSpecialty = async () => {
    try {
      setError("")
      if (!specialtyId) return
      await updateSpecialty.mutateAsync({ id: Number(specialtyId), data: specialtyForm })
      navigate('/healthcare/specialties')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update specialty"
      setError(errorMessage)
    }
  }

  if (!specialty) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-muted-foreground">Specialty not found</div>
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
            onClick={() => navigate('/healthcare/specialties')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <div className="accent-line-green" />
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Edit Specialty</h1>
            <p className="text-muted-foreground mt-1">
              Update specialty information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Specialty Information</CardTitle>
            <CardDescription>
              Update the details for this specialty
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={specialtyForm.name}
                  onChange={(e) => setSpecialtyForm({ ...specialtyForm, name: e.target.value })}
                  placeholder="Cardiology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={specialtyForm.description}
                  onChange={(e) => setSpecialtyForm({ ...specialtyForm, description: e.target.value })}
                  placeholder="Specialty description..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => navigate('/healthcare/specialties')}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSpecialty}
                disabled={updateSpecialty.isPending}
              >
                {updateSpecialty.isPending ? "Updating..." : "Update Specialty"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
