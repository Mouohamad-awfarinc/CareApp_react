import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, Edit, Trash2, Plus } from "lucide-react"
import {
  useDoctor,
  useClinics,
  useAllDoctorClinics,
  useCreateDoctorClinic,
  useUpdateDoctorClinic,
  useDeleteDoctorClinic,
} from "@/hooks/use-healthcare"
import { Badge } from "@/components/ui/badge"
import type { DoctorClinic } from "@/types"

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
  const deleteDoctorClinic = useDeleteDoctorClinic()

  const allClinics = allClinicsData?.data || []
  const existingAssociations = doctorClinicsData?.data || []
  const [editingClinic, setEditingClinic] = useState<number | null>(null)
  const [editFees, setEditFees] = useState("")
  const [editConsultationFees, setEditConsultationFees] = useState("")
  const [assigningClinic, setAssigningClinic] = useState<number | null>(null)
  const [assignFees, setAssignFees] = useState("")
  const [assignConsultationFees, setAssignConsultationFees] = useState("")
  const [error, setError] = useState("")

  const handleEditClinic = (association: DoctorClinic) => {
    setEditingClinic(association.id)
    setEditFees(association.fees ? String(association.fees) : "")
    setEditConsultationFees(association.consultation_fees ? String(association.consultation_fees) : "")
  }

  const handleSaveEdit = async (associationId: number) => {
    try {
      setError("")
      await updateDoctorClinic.mutateAsync({
        id: associationId,
        data: {
          fees: editFees ? parseFloat(editFees) : null,
          consultation_fees: editConsultationFees ? parseFloat(editConsultationFees) : null,
          active: true,
        }
      })
      setEditingClinic(null)
      setEditFees("")
      setEditConsultationFees("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update clinic"
      setError(errorMessage)
    }
  }

  const handleCancelEdit = () => {
    setEditingClinic(null)
    setEditFees("")
    setEditConsultationFees("")
  }

  const handleStartAssignClinic = (clinicId: number) => {
    setAssigningClinic(clinicId)
    setAssignFees("")
    setAssignConsultationFees("")
  }

  const handleCancelAssign = () => {
    setAssigningClinic(null)
    setAssignFees("")
    setAssignConsultationFees("")
  }

  const handleRemoveClinic = async (associationId: number) => {
    if (confirm("Are you sure you want to remove this clinic assignment?")) {
      try {
        setError("")
        await deleteDoctorClinic.mutateAsync(associationId)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to remove clinic assignment"
        setError(errorMessage)
      }
    }
  }

  const handleAssignClinic = async (clinicId: number) => {
    try {
      setError("")
      await createDoctorClinic.mutateAsync({
        doctor_id: doctorId,
        clinic_id: clinicId,
        fees: assignFees ? parseFloat(assignFees) : null,
        consultation_fees: assignConsultationFees ? parseFloat(assignConsultationFees) : null,
        active: true,
      })
      setAssigningClinic(null)
      setAssignFees("")
      setAssignConsultationFees("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign clinic"
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

        {/* Currently Assigned Clinics */}
        <Card>
          <CardHeader>
            <CardTitle>Currently Assigned Clinics</CardTitle>
            <CardDescription>
              Clinics currently assigned to {doctor.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {existingAssociations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No clinics currently assigned
              </div>
            ) : (
              <div className="space-y-4">
                {existingAssociations.map((association) => (
                  <div key={association.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{association.clinic?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {association.clinic?.city} • {association.clinic?.category}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={association.active ? "default" : "secondary"}>
                            {association.active ? "Active" : "Inactive"}
                          </Badge>
                          {association.fees && (
                            <span className="text-sm">Fees: ${association.fees}</span>
                          )}
                          {association.consultation_fees && (
                            <span className="text-sm">Consultation: ${association.consultation_fees}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClinic(association)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveClinic(association.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {editingClinic === association.id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`edit-fees-${association.id}`}>Fees ($)</Label>
                            <Input
                              id={`edit-fees-${association.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={editFees}
                              onChange={(e) => setEditFees(e.target.value)}
                              placeholder="100.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit-consultation-${association.id}`}>Consultation Fees ($)</Label>
                            <Input
                              id={`edit-consultation-${association.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={editConsultationFees}
                              onChange={(e) => setEditConsultationFees(e.target.value)}
                              placeholder="50.00"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(association.id)}
                            disabled={updateDoctorClinic.isPending}
                          >
                            {updateDoctorClinic.isPending ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Clinics */}
        <Card>
          <CardHeader>
            <CardTitle>Available Clinics</CardTitle>
            <CardDescription>
              Assign additional clinics to {doctor.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allClinics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No clinics available
              </div>
            ) : (
              <div className="space-y-4">
                {allClinics
                  .filter((clinic) => !existingAssociations.some((assoc) => assoc.clinic?.id === clinic.id))
                  .map((clinic) => (
                    <div key={clinic.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{clinic.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {clinic.city || "No city"} • {clinic.category || "No category"}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartAssignClinic(clinic.id)}
                          disabled={createDoctorClinic.isPending}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Assign
                        </Button>
                      </div>

                      {assigningClinic === clinic.id && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`assign-fees-${clinic.id}`}>Consultation Fees ($)</Label>
                              <Input
                                id={`assign-fees-${clinic.id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={assignFees}
                                onChange={(e) => setAssignFees(e.target.value)}
                                placeholder="100.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`assign-consultation-${clinic.id}`}>Follow-up Fees ($)</Label>
                              <Input
                                id={`assign-consultation-${clinic.id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={assignConsultationFees}
                                onChange={(e) => setAssignConsultationFees(e.target.value)}
                                placeholder="50.00"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => handleAssignClinic(clinic.id)}
                              disabled={createDoctorClinic.isPending}
                            >
                              {createDoctorClinic.isPending ? "Assigning..." : "Confirm Assign"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelAssign}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => navigate("/healthcare/doctors")}>
            Back to Doctors
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
