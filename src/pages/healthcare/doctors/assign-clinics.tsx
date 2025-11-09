import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle } from "lucide-react"
import {
  useDoctor,
  useClinics,
  useAllDoctorClinics,
  useCreateDoctorClinic,
  useUpdateDoctorClinic,
} from "@/hooks/use-healthcare"
import { Checkbox } from "@/components/ui/checkbox"
import type { DoctorClinic } from "@/types"

interface ClinicAssignment {
  clinic_id: number
  fees?: string
  consultation_fees?: string
  active: boolean
}

export function AssignClinics() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const doctorId = parseInt(id || "0")

  const { data: doctor, isLoading } = useDoctor(doctorId)
  const [clinicsPage] = useState(1)
  const { data: allClinicsData } = useClinics(clinicsPage, {})
  const { data: doctorClinicsData } = useAllDoctorClinics(1, { doctor_id: doctorId })
  const createDoctorClinic = useCreateDoctorClinic()
  const updateDoctorClinic = useUpdateDoctorClinic()

  const allClinics = allClinicsData?.data || []
  const [clinicAssignments, setClinicAssignments] = useState<ClinicAssignment[]>([])
  const [error, setError] = useState("")

  // Initialize clinic assignments when data is loaded
  useEffect(() => {
    const existingAssociations = doctorClinicsData?.data || []
    if (existingAssociations.length > 0) {
      const initialAssignments = existingAssociations.map((association) => ({
        clinic_id: association.clinic?.id || 0,
        fees: association.fees ? String(association.fees) : "",
        consultation_fees: association.consultation_fees ? String(association.consultation_fees) : "",
        active: association.active,
      }))
      console.log('Initialized assignments from existing data:', initialAssignments)
      setClinicAssignments(initialAssignments)
    }
  }, [doctorClinicsData])

  const handleToggleClinic = (clinicId: number, checked: boolean) => {
    if (checked) {
      // Add new assignment
      setClinicAssignments((prev) => [
        ...prev,
        { clinic_id: clinicId, fees: "", consultation_fees: "", active: true }
      ])
    } else {
      // Remove assignment
      setClinicAssignments((prev) => prev.filter((a) => a.clinic_id !== clinicId))
    }
  }

  const handleFeesChange = (clinicId: number, field: 'fees' | 'consultation_fees', value: string) => {
    setClinicAssignments((prev) =>
      prev.map((assignment) =>
        assignment.clinic_id === clinicId
          ? { ...assignment, [field]: value }
          : assignment
      )
    )
  }

  const isClinicSelected = (clinicId: number) => {
    return clinicAssignments.some((a) => a.clinic_id === clinicId)
  }

  const getClinicAssignment = (clinicId: number) => {
    return clinicAssignments.find((a) => a.clinic_id === clinicId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError("")
      const existingAssociations = doctorClinicsData?.data || []

      console.log('All clinic assignments:', clinicAssignments) // Debug log

      // Create/update associations one by one
      for (const assignment of clinicAssignments) {
        console.log('Assignment object:', assignment) // Debug log
        
        // Check if this is an existing association
        const existing = existingAssociations.find((a: DoctorClinic) => a.clinic?.id === assignment.clinic_id)

        if (existing) {
          // Update existing - only send fees, consultation_fees, and active
          const updateData = {
            fees: assignment.fees ? parseFloat(assignment.fees) : null,
            consultation_fees: assignment.consultation_fees ? parseFloat(assignment.consultation_fees) : null,
            active: assignment.active,
          }
          console.log('Updating existing association:', existing.id, updateData)
          await updateDoctorClinic.mutateAsync({
            id: existing.id,
            data: updateData
          })
        } else {
          // Create new - send doctor_id, clinic_id, fees, consultation_fees, and active
          const createData = {
            doctor_id: doctorId,
            clinic_id: assignment.clinic_id,
            fees: assignment.fees ? parseFloat(assignment.fees) : null,
            consultation_fees: assignment.consultation_fees ? parseFloat(assignment.consultation_fees) : null,
            active: assignment.active,
          }
          console.log('Creating new association:', createData)
          await createDoctorClinic.mutateAsync(createData)
        }
      }

      // Handle removals - any existing associations not in clinicAssignments should be deactivated
      const toRemove = existingAssociations.filter(
        (existing: DoctorClinic) => !clinicAssignments.some(a => a.clinic_id === existing.clinic?.id)
      )

      for (const association of toRemove) {
        await updateDoctorClinic.mutateAsync({
          id: association.id,
          data: { 
            fees: association.fees,
            consultation_fees: association.consultation_fees,
            active: false 
          }
        })
      }

      navigate("/healthcare/doctors")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update clinic assignments"
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
                  allClinics.map((clinic) => {
                    const assignment = getClinicAssignment(clinic.id)
                    const isSelected = isClinicSelected(clinic.id)

                    return (
                      <div key={clinic.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`clinic-${clinic.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleToggleClinic(clinic.id, checked === true)
                            }
                          />
                          <Label
                            htmlFor={`clinic-${clinic.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {clinic.name} - {clinic.city || "No city"} ({clinic.category || "No category"})
                          </Label>
                        </div>

                        {isSelected && (
                          <div className="ml-6 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`fees-${clinic.id}`}>Fees ($)</Label>
                              <Input
                                id={`fees-${clinic.id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={assignment?.fees || ""}
                                onChange={(e) => handleFeesChange(clinic.id, 'fees', e.target.value)}
                                placeholder="100.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`consultation-fees-${clinic.id}`}>Consultation Fees ($)</Label>
                              <Input
                                id={`consultation-fees-${clinic.id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={assignment?.consultation_fees || ""}
                                onChange={(e) => handleFeesChange(clinic.id, 'consultation_fees', e.target.value)}
                                placeholder="50.00"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
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
                  disabled={createDoctorClinic.isPending || updateDoctorClinic.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {createDoctorClinic.isPending || updateDoctorClinic.isPending ? "Updating..." : "Update Clinic Assignments"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
