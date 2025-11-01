import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit, Trash2, Pill, Filter } from "lucide-react"
import {
  usePrescriptions,
  useCreatePrescription,
  useUpdatePrescription,
  useDeletePrescription,
  useDoctors,
  usePatients,
  useVisits,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import type { Prescription } from "@/types"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { Textarea } from "@/components/ui/textarea"

export function Prescriptions() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  // Filters
  const [doctorFilter, setDoctorFilter] = useState<string>("all")
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [visitFilter, setVisitFilter] = useState<string>("all")

  // Pagination
  const [page, setPage] = useState(1)

  // Fetch data
  const { data: prescriptionsData, isLoading } = usePrescriptions(page, {
    doctor_id: doctorFilter !== "all" ? Number(doctorFilter) : undefined,
    patient_id: patientFilter !== "all" ? Number(patientFilter) : undefined,
    visit_id: visitFilter !== "all" ? Number(visitFilter) : undefined,
  })

  const { data: doctorsData } = useDoctors(1, {})
  const { data: patientsData } = usePatients(1, {})
  const { data: visitsData } = useVisits(1, {})

  // Mutations
  const createPrescription = useCreatePrescription()
  const updatePrescription = useUpdatePrescription()
  const deletePrescription = useDeletePrescription()

  // Dialog states
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPrescription, setDeletingPrescription] = useState<Prescription | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    visit_id: "",
    patient_id: "",
    doctor_id: "",
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: "",
  })

  const handleOpenDialog = (prescription?: Prescription) => {
    if (prescription) {
      setEditingPrescription(prescription)
      setFormData({
        visit_id: prescription.visit_id.toString(),
        patient_id: prescription.patient_id.toString(),
        doctor_id: prescription.doctor_id.toString(),
        medication_name: prescription.medication_name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        notes: prescription.notes || "",
      })
    } else {
      setEditingPrescription(null)
      setFormData({
        visit_id: "",
        patient_id: "",
        doctor_id: "",
        medication_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: "",
      })
    }
    setPrescriptionDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPrescription) {
        await updatePrescription.mutateAsync({
          id: editingPrescription.id,
          data: {
            medication_name: formData.medication_name,
            dosage: formData.dosage,
            frequency: formData.frequency,
            duration: formData.duration,
            notes: formData.notes || null,
          },
        })
      } else {
        await createPrescription.mutateAsync({
          visit_id: Number(formData.visit_id),
          patient_id: Number(formData.patient_id),
          doctor_id: Number(formData.doctor_id),
          medication_name: formData.medication_name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          duration: formData.duration,
          notes: formData.notes || null,
        })
      }
      setPrescriptionDialogOpen(false)
    } catch (error) {
      console.error("Error saving prescription:", error)
    }
  }

  const handleOpenDeleteDialog = (prescription: Prescription) => {
    setDeletingPrescription(prescription)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingPrescription) return
    try {
      await deletePrescription.mutateAsync(deletingPrescription.id)
      setDeleteDialogOpen(false)
      setDeletingPrescription(null)
    } catch (error) {
      console.error("Error deleting prescription:", error)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Prescriptions</h1>
            <p className="text-muted-foreground">Manage patient prescriptions</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Prescription
          </Button>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctorsData?.data?.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={patientFilter} onValueChange={setPatientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Patients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    {patientsData?.data?.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visit</Label>
                <Select value={visitFilter} onValueChange={setVisitFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Visits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visits</SelectItem>
                    {visitsData?.data?.map((visit: any) => (
                      <SelectItem key={visit.id} value={visit.id.toString()}>
                        Visit #{visit.id} - {visit.patient?.name || "N/A"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Prescriptions List</CardTitle>
            <CardDescription>
              {prescriptionsData?.meta?.total || 0} prescriptions found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading prescriptions...</div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptionsData?.data?.map((prescription: Prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell>{prescription.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Pill className="mr-2 h-4 w-4 text-blue-500" />
                            {prescription.medication_name}
                          </div>
                        </TableCell>
                        <TableCell>{prescription.dosage}</TableCell>
                        <TableCell>{prescription.frequency}</TableCell>
                        <TableCell>{prescription.duration}</TableCell>
                        <TableCell>{prescription.patient?.name || "N/A"}</TableCell>
                        <TableCell>{prescription.doctor?.name || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(prescription)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDeleteDialog(prescription)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {prescriptionsData?.data?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No prescriptions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {prescriptionsData?.meta && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={prescriptionsData.meta.current_page}
                      totalPages={prescriptionsData.meta.last_page}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Prescription Dialog */}
        <Dialog open={prescriptionDialogOpen} onOpenChange={setPrescriptionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPrescription ? "Edit Prescription" : "New Prescription"}
              </DialogTitle>
              <DialogDescription>
                {editingPrescription
                  ? "Update prescription details"
                  : "Create a new prescription"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {!editingPrescription && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="visit_id">Visit *</Label>
                      <Select
                        value={formData.visit_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, visit_id: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select visit" />
                        </SelectTrigger>
                        <SelectContent>
                          {visitsData?.data?.map((visit: any) => (
                            <SelectItem key={visit.id} value={visit.id.toString()}>
                              Visit #{visit.id} - {visit.patient?.name || "N/A"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="patient_id">Patient *</Label>
                      <Select
                        value={formData.patient_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, patient_id: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patientsData?.data?.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="doctor_id">Doctor *</Label>
                      <Select
                        value={formData.doctor_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, doctor_id: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctorsData?.data?.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="medication_name">Medication Name *</Label>
                  <Input
                    id="medication_name"
                    value={formData.medication_name}
                    onChange={(e) =>
                      setFormData({ ...formData, medication_name: e.target.value })
                    }
                    required
                    placeholder="e.g., Paracetamol"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    required
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    required
                    placeholder="e.g., Every 6 hours"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    placeholder="e.g., 5 days"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional instructions..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPrescriptionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPrescription.isPending || updatePrescription.isPending}>
                  {editingPrescription ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Prescription Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Prescription</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this prescription? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deletePrescription.isPending}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

