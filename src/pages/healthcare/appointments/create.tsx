import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { useCreateAppointment, useClinics, useDoctors, usePatients } from "@/hooks/use-healthcare"

export function CreateAppointment() {
  const navigate = useNavigate()
  const createAppointment = useCreateAppointment()

  const { data: clinicsData } = useClinics(1, {})
  const { data: doctorsData } = useDoctors(1, {})
  const { data: patientsData } = usePatients(1, {})

  const clinics = clinicsData?.data || []
  const doctors = doctorsData?.data || []
  const patients = patientsData?.data || []

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    clinic_id: "",
    doctor_clinic_id: "",
    type: "in_clinic",
    appointment_date: "",
    notes: "",
    status: "booked",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.patient_id || !formData.doctor_id || !formData.clinic_id || !formData.appointment_date) {
      setError("Please fill in all required fields")
      return
    }

    try {
      await createAppointment.mutateAsync({
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
        clinic_id: Number(formData.clinic_id),
        doctor_clinic_id: Number(formData.doctor_clinic_id) || Number(formData.clinic_id),
        type: formData.type,
        appointment_date: formData.appointment_date,
        notes: formData.notes || null,
        status: formData.status,
      })
      navigate("/healthcare/appointments")
    } catch (err) {
      setError("Failed to create appointment")
      console.error(err)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/healthcare/appointments")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Appointment</h1>
            <p className="text-muted-foreground">Create a new appointment</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Enter appointment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Patient */}
                <div className="grid gap-2">
                  <Label htmlFor="patient_id">Patient *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Doctor */}
                <div className="grid gap-2">
                  <Label htmlFor="doctor_id">Doctor *</Label>
                  <Select
                    value={formData.doctor_id}
                    onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clinic */}
                <div className="grid gap-2">
                  <Label htmlFor="clinic_id">Clinic *</Label>
                  <Select
                    value={formData.clinic_id}
                    onValueChange={(value) => setFormData({ ...formData, clinic_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id.toString()}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div className="grid gap-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_clinic">In Clinic</SelectItem>
                      <SelectItem value="home_visit">Home Visit</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Appointment Date & Time */}
                <div className="grid gap-2">
                  <Label htmlFor="appointment_date">Appointment Date & Time *</Label>
                  <Input
                    id="appointment_date"
                    type="datetime-local"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    required
                  />
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="arrived">Arrived</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Enter any additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/healthcare/appointments")}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAppointment.isPending}>
              {createAppointment.isPending ? "Creating..." : "Create Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
