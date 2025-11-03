import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useDoctor } from "@/hooks/use-healthcare"

export function ManageSchedule() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const doctorId = parseInt(id || "0")

  const { data: doctor, isLoading } = useDoctor(doctorId)

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
            <h1 className="text-3xl font-bold tracking-tight">Manage Schedule</h1>
            <p className="text-muted-foreground">Manage schedule for {doctor.name}</p>
          </div>
        </div>

        {/* Schedule Card */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Schedule</CardTitle>
            <CardDescription>
              Configure working hours and availability for this doctor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Schedule management feature coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
