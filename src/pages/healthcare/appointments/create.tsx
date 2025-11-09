import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Clock } from "lucide-react"
import { useCreateAppointment, useDoctors, usePatients, useAvailableSlots, useDoctorClinics } from "@/hooks/use-healthcare"

export function CreateAppointment() {
  const navigate = useNavigate()
  const createAppointment = useCreateAppointment()

  const { data: doctorsData } = useDoctors(1, {})
  const { data: patientsData } = usePatients(1, {})

  const doctors = doctorsData?.data || []
  const patients = patientsData?.data || []

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    clinic_id: "",
    doctor_clinic_id: "",
    type: "in_clinic",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: 30,
    notes: "",
    status: "booked",
  })
  const [error, setError] = useState("")

  // Get available slots when doctor, clinic, and date are selected
  const { data: availableSlotsData } = useAvailableSlots(
    formData.doctor_id ? Number(formData.doctor_id) : 0,
    formData.clinic_id ? Number(formData.clinic_id) : 0,
    formData.appointment_date
  )

  const availableSlots = availableSlotsData?.data || []

  // Get clinics for selected doctor
  const { data: doctorClinicsData } = useDoctorClinics(
    formData.doctor_id ? Number(formData.doctor_id) : 0
  )
  const doctorClinics = doctorClinicsData || []

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset doctor_clinic_id when doctor or clinic changes
      ...(name === 'doctor_id' || name === 'clinic_id' ? { doctor_clinic_id: "" } : {}),
      // Reset appointment_time when date changes
      ...(name === 'appointment_date' ? { appointment_time: "" } : {}),
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return !!formData.patient_id
      case 2:
        return !!formData.doctor_id
      case 3:
        return !!formData.clinic_id
      case 4:
        return !!formData.appointment_date && !!formData.appointment_time
      default:
        return false
    }
  }

  const handleSlotSelect = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      appointment_time: slot,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.patient_id || !formData.doctor_id || !formData.clinic_id || !formData.appointment_date || !formData.appointment_time) {
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
        appointment_time: formData.appointment_time,
        duration_minutes: Number(formData.duration_minutes),
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
              <CardDescription>Step {currentStep} of 4</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Step 1: Select Patient */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Select Patient</h3>
                    <p className="text-muted-foreground">Choose the patient for this appointment</p>
                  </div>
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
                </div>
              )}

              {/* Step 2: Select Doctor */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Select Doctor</h3>
                    <p className="text-muted-foreground">Choose the doctor for this appointment</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="doctor_id">Doctor *</Label>
                    <Select
                      value={formData.doctor_id}
                      onValueChange={(value) => {
                        setFormData({ ...formData, doctor_id: value, clinic_id: "", appointment_time: "" })
                      }}
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
                </div>
              )}

              {/* Step 3: Select Clinic */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Select Clinic</h3>
                    <p className="text-muted-foreground">Choose a clinic where the doctor is available</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="clinic_id">Clinic *</Label>
                    <Select
                      value={formData.clinic_id}
                      onValueChange={(value) => {
                        setFormData({ ...formData, clinic_id: value, appointment_time: "" })
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorClinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id.toString()}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 4: Select Date and Time */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Select Date & Time</h3>
                    <p className="text-muted-foreground">Choose available date and time slot</p>
                  </div>

                  {/* Appointment Date */}
                  <div className="grid gap-2">
                    <Label htmlFor="appointment_date">Appointment Date *</Label>
                    <Input
                      id="appointment_date"
                      name="appointment_date"
                      type="date"
                      value={formData.appointment_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Appointment Time Slots */}
                  <div className="grid gap-2">
                    <Label>Available Time Slots *</Label>
                    {formData.doctor_id && formData.clinic_id && formData.appointment_date ? (
                      availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              type="button"
                              variant={formData.appointment_time === slot.time ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSlotSelect(slot.time)}
                              className="flex items-center gap-1"
                            >
                              <Clock className="h-3 w-3" />
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                          No available slots for this date
                        </div>
                      )
                    ) : (
                      <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                        Select date to see available slots
                      </div>
                    )}
                  </div>

                  {/* Additional Fields */}
                  <div className="grid gap-4 md:grid-cols-3">
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
                          <SelectItem value="telemedicine">Telemedicine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duration */}
                    <div className="grid gap-2">
                      <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                      <Select
                        value={formData.duration_minutes.toString()}
                        onValueChange={(value) => setFormData({ ...formData, duration_minutes: parseInt(value) })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? () => navigate("/healthcare/appointments") : prevStep}
            >
              {currentStep === 1 ? "Cancel" : "Previous"}
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNext()}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={createAppointment.isPending}>
                {createAppointment.isPending ? "Creating..." : "Create Appointment"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
