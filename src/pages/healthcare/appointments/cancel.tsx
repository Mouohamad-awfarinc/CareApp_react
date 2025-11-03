import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useAppointment, useCancelAppointment } from "@/hooks/use-healthcare"

export function CancelAppointment() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const appointmentId = parseInt(id || "0")

  const { data: appointment, isLoading } = useAppointment(appointmentId)
  const cancelAppointment = useCancelAppointment()

  const [cancelReason, setCancelReason] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!cancelReason.trim()) {
      setError("Please provide a reason for cancellation")
      return
    }

    try {
      await cancelAppointment.mutateAsync({
        id: appointmentId,
        reason: cancelReason,
      })
      navigate("/healthcare/appointments")
    } catch (err) {
      setError("Failed to cancel appointment")
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

  if (appointment.status === "cancelled") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">This appointment has already been cancelled</p>
            <Button
              variant="link"
              onClick={() => navigate("/healthcare/appointments")}
              className="mt-2"
            >
              Go back to appointments
            </Button>
          </div>
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
            <h1 className="text-3xl font-bold tracking-tight">Cancel Appointment</h1>
            <p className="text-muted-foreground">Cancel this appointment with a reason</p>
          </div>
        </div>

        {/* Warning Card */}
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Warning: This action cannot be undone</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cancelling this appointment will notify the patient and update the appointment status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
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
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                <p className="text-sm">{new Date(appointment.appointment_date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Badge variant="secondary">{appointment.type}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge>{appointment.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancel Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Reason</CardTitle>
              <CardDescription>Please provide a reason for cancelling this appointment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="cancel_reason">Reason *</Label>
                <Textarea
                  id="cancel_reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  placeholder="Enter the reason for cancellation..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/healthcare/appointments")}>
              Go Back
            </Button>
            <Button type="submit" variant="destructive" disabled={cancelAppointment.isPending}>
              {cancelAppointment.isPending ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
