import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import {
  useDoctor,
  useClinics,
  useDoctorClinics,
  useAssignDoctorToClinics,
} from "@/hooks/use-healthcare"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function AssignClinics() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const doctorId = parseInt(id || "0")

  const { data: doctor, isLoading } = useDoctor(doctorId)
  const [clinicsPage] = useState(1)
  const { data: allClinicsData } = useClinics(clinicsPage, {})
  const { data: doctorClinicsData } = useDoctorClinics(doctorId)
  const assignDoctorToClinics = useAssignDoctorToClinics()

  const allClinics = allClinicsData?.data || []
  const [selectedClinics, setSelectedClinics] = useState<
    Array<{ clinic_id: number; is_active: boolean }>
  >([])
  const [error, setError] = useState("")

  // Initialize selected clinics when doctor clinics data is loaded
  useEffect(() => {
    if (doctorClinicsData) {
      const initialSelected = doctorClinicsData.map((clinic) => ({
        clinic_id: clinic.id,
        is_active: true,
      }))
      setSelectedClinics(initialSelected)
    }
  }, [doctorClinicsData])

  const handleToggleClinic = (clinicId: number, isActive: boolean) => {
    setSelectedClinics((prev) => {
      const existing = prev.find((c) => c.clinic_id === clinicId)
      if (existing) {
        // If already selected, update is_active
        return prev.map((c) =>
          c.clinic_id === clinicId ? { ...c, is_active: isActive } : c
        )
      } else {
        // Add new selection
        return [...prev, { clinic_id: clinicId, is_active: isActive }]
      }
    })
  }

  const isClinicSelected = (clinicId: number) => {
    return selectedClinics.some((c) => c.clinic_id === clinicId && c.is_active)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError("")
      await assignDoctorToClinics.mutateAsync({
        doctorId,
        clinics: selectedClinics,
      })
      navigate("/healthcare/doctors")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign clinics"
      setError(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    )
  }

  if (!doctor) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Doctor not found</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/healthcare/doctors")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assign Clinics</h1>
            <p className="text-muted-foreground">Assign clinics to {doctor.name}</p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select Clinics</CardTitle>
            <CardDescription>
              Choose which clinics this doctor should be associated with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {allClinics.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No clinics available
                  </div>
                ) : (
                  allClinics.map((clinic) => (
                    <div key={clinic.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`clinic-${clinic.id}`}
                        checked={isClinicSelected(clinic.id)}
                        onCheckedChange={(checked) =>
                          handleToggleClinic(clinic.id, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`clinic-${clinic.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {clinic.name} - {clinic.city || "No city"} ({clinic.category || "No category"})
                      </Label>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/healthcare/doctors")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={assignDoctorToClinics.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {assignDoctorToClinics.isPending ? "Assigning..." : "Assign Clinics"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
