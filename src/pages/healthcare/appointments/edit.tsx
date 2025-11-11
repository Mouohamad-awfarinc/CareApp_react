import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { useAppointment, useUpdateAppointment } from "@/hooks/use-healthcare"

export function EditAppointment() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const appointmentId = parseInt(id || "0")

  const { data: appointment, isLoading } = useAppointment(appointmentId)
  const updateAppointment = useUpdateAppointment()

  const [formData, setFormData] = useState({
    appointment_date: "",
    appointment_time: "",
    duration_minutes: 15,
    type: "in_clinic",
    status: "booked",
    notes: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (appointment) {
      setFormData({
        appointment_date: appointment.appointment_date.split('T')[0], // Extract date part only
        appointment_time: appointment.appointment_time.substring(0, 5), // Extract HH:MM part only
        duration_minutes: appointment.duration_minutes || 15,
        type: appointment.type || "in_clinic",
        status: appointment.status,
        notes: appointment.notes || "",
      })
    }
  }, [appointment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.appointment_date || !formData.appointment_time) {
      setError("Please fill in all required fields")
      return
    }

    try {
      await updateAppointment.mutateAsync({
        id: appointmentId,
        data: {
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          duration_minutes: formData.duration_minutes,
          type: formData.type,
          status: formData.status,
          notes: formData.notes || null,
        },
      })
      navigate("/healthcare/appointments")
    } catch (err) {
      setError("Failed to update appointment")
      console.error(err)
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

  if (!appointment) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Appointment not found</p>
        </div>
      </AppLayout>
    )
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Appointment</h1>
            <p className="text-muted-foreground">Update appointment information</p>
          </div>
        </div>

        {/* Appointment Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Appointment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient</p>
                <p className="text-sm">{appointment.patient?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                <p className="text-sm">{appointment.doctor?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clinic</p>
                <p className="text-sm">{appointment.clinic?.name || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Update Appointment Details</CardTitle>
              <CardDescription>Modify appointment details including date, time, duration, type, status, and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Appointment Date */}
                <div className="grid gap-2">
                  <Label htmlFor="appointment_date">Appointment Date *</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    required
                  />
                </div>

                {/* Appointment Time */}
                <div className="grid gap-2">
                  <Label htmlFor="appointment_time">Appointment Time *</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    required
                  />
                </div>

                {/* Duration */}
                <div className="grid gap-2">
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="15"
                    max="480"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 15 })}
                  />
                </div>

                {/* Type */}
                <div className="grid gap-2">
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select
                    key={formData.type}
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_clinic">In Clinic</SelectItem>
                      <SelectItem value="telemedicine">Telemedicine</SelectItem>
                      <SelectItem value="home_visit">Home Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    key={formData.status}
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
            <Button type="submit" disabled={updateAppointment.isPending}>
              {updateAppointment.isPending ? "Updating..." : "Update Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
