import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Edit, Trash2, Clock } from "lucide-react"
import { useDoctor, useAllDoctorClinics, useDoctorClinicSchedules } from "@/hooks/use-healthcare"
import { useCreateDoctorClinicSchedule, useUpdateDoctorClinicSchedule, useDeleteDoctorClinicSchedule } from "@/hooks/use-healthcare"
import { toast } from "sonner"
import type { DoctorSchedule } from "@/types"

const DAYS_OF_WEEK = [
  { value: "Sunday", label: "Sunday" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
]

interface ScheduleFormData {
  doctor_clinic_id: number
  day_of_week: string
  start_time: string
  end_time: string
  slot_duration_minutes: number
}

export function ManageSchedule() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const doctorId = parseInt(id || "0")

  const { data: doctor, isLoading: loadingDoctor } = useDoctor(doctorId)
  const { data: doctorClinicsData } = useAllDoctorClinics(1, { doctor_id: doctorId })
  const { data: schedulesData } = useDoctorClinicSchedules({ doctor_id: doctorId })

  const createSchedule = useCreateDoctorClinicSchedule()
  const updateSchedule = useUpdateDoctorClinicSchedule()
  const deleteSchedule = useDeleteDoctorClinicSchedule()

  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(null)
  const [formData, setFormData] = useState<ScheduleFormData>({
    doctor_clinic_id: 0,
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 15,
  })

  const doctorClinics = doctorClinicsData?.data || []
  const schedules = schedulesData?.data || []

  const handleCreateSchedule = async () => {
    if (!formData.doctor_clinic_id) {
      toast.error("Please select a clinic")
      return
    }

    try {
      await createSchedule.mutateAsync(formData)
      toast.success("Schedule created successfully")
      setIsCreateDialogOpen(false)
      resetForm()
    } catch {
      toast.error("Failed to create schedule")
    }
  }

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return

    try {
      await updateSchedule.mutateAsync({
        id: editingSchedule.id,
        data: formData,
      })
      toast.success("Schedule updated successfully")
      setEditingSchedule(null)
      resetForm()
    } catch {
      toast.error("Failed to update schedule")
    }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return

    try {
      await deleteSchedule.mutateAsync(scheduleId)
      toast.success("Schedule deleted successfully")
    } catch {
      toast.error("Failed to delete schedule")
    }
  }

  const resetForm = () => {
    setFormData({
      doctor_clinic_id: selectedClinicId || 0,
      day_of_week: "Monday",
      start_time: "09:00",
      end_time: "17:00",
      slot_duration_minutes: 15,
    })
  }

  const openEditDialog = (schedule: DoctorSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      doctor_clinic_id: schedule.doctor_clinic.id,
      day_of_week: schedule.day_of_week,
      start_time: extractTimeFromDateTime(schedule.start_time),
      end_time: extractTimeFromDateTime(schedule.end_time),
      slot_duration_minutes: schedule.slot_duration_minutes,
    })
  }

  const extractTimeFromDateTime = (dateTimeString: string) => {
    // If it's already just a time string (HH:MM), return as is
    if (dateTimeString.length === 5 && dateTimeString.includes(':')) {
      return dateTimeString
    }
    // If it's a full datetime string, extract the time portion
    try {
      const date = new Date(dateTimeString)
      return date.toTimeString().slice(0, 5) // HH:MM format
    } catch {
      return dateTimeString // fallback to original string
    }
  }

  const getSchedulesForClinic = (clinicId: number) => {
    return schedules.filter((schedule: DoctorSchedule) => schedule.doctor_clinic?.id === clinicId)
  }

  if (loadingDoctor) {
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
            <p className="text-muted-foreground">Manage working hours for {doctor.name} at different clinics</p>
          </div>
        </div>

        {/* Clinic Schedules */}
        {doctorClinics.map((doctorClinic) => {
          const clinicSchedules = getSchedulesForClinic(doctorClinic.id)

          return (
            <Card key={doctorClinic.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {doctorClinic.clinic?.name || "Unknown Clinic"}
                    </CardTitle>
                    <CardDescription>
                      {doctorClinic.clinic?.address || "No address available"}
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateDialogOpen && selectedClinicId === doctorClinic.id} onOpenChange={(open) => {
                    setIsCreateDialogOpen(open)
                    if (!open) setSelectedClinicId(null)
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClinicId(doctorClinic.id)
                          setFormData(prev => ({ ...prev, doctor_clinic_id: doctorClinic.id }))
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Schedule
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Schedule for {doctorClinic.clinic?.name}</DialogTitle>
                        <DialogDescription>
                          Set working hours for this clinic
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="day_of_week">Day of Week</Label>
                          <Select
                            value={formData.day_of_week}
                            onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input
                              id="start_time"
                              type="time"
                              value={formData.start_time}
                              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="end_time">End Time</Label>
                            <Input
                              id="end_time"
                              type="time"
                              value={formData.end_time}
                              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="slot_duration">Slot Duration (minutes)</Label>
                          <Select
                            value={formData.slot_duration_minutes.toString()}
                            onValueChange={(value) => setFormData({ ...formData, slot_duration_minutes: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateSchedule} disabled={createSchedule.isPending}>
                            {createSchedule.isPending ? "Creating..." : "Create Schedule"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {clinicSchedules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No schedules set for this clinic. Click "Add Schedule" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Slot Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clinicSchedules.map((schedule: DoctorSchedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{schedule.day_of_week}</TableCell>
                          <TableCell>{extractTimeFromDateTime(schedule.start_time)}</TableCell>
                          <TableCell>{extractTimeFromDateTime(schedule.end_time)}</TableCell>
                          <TableCell>{schedule.slot_duration_minutes} minutes</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(schedule)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSchedule(schedule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )
        })}

        {/* Edit Schedule Dialog */}
        <Dialog open={!!editingSchedule} onOpenChange={(open) => {
          if (!open) setEditingSchedule(null)
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Schedule</DialogTitle>
              <DialogDescription>
                Update working hours for this schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_day_of_week">Day of Week</Label>
                <Select
                  value={formData.day_of_week}
                  onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_start_time">Start Time</Label>
                  <Input
                    id="edit_start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_end_time">End Time</Label>
                  <Input
                    id="edit_end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_slot_duration">Slot Duration (minutes)</Label>
                <Select
                  value={formData.slot_duration_minutes.toString()}
                  onValueChange={(value) => setFormData({ ...formData, slot_duration_minutes: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingSchedule(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSchedule} disabled={updateSchedule.isPending}>
                  {updateSchedule.isPending ? "Updating..." : "Update Schedule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
