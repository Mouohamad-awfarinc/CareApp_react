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
import { Plus, Edit, Trash2, Upload, FlaskConical, Filter, Download } from "lucide-react"
import {
  useLabTests,
  useCreateLabTest,
  useUpdateLabTest,
  useDeleteLabTest,
  useUploadLabTestResult,
  useDoctors,
  usePatients,
  useVisits,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import type { LabTest } from "@/types"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { Textarea } from "@/components/ui/textarea"

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  }
  return colors[status] || "bg-gray-500"
}

// Helper function to get full file URL
const getFileUrl = (filePath: string | null) => {
  if (!filePath) return ""
  if (filePath.startsWith("http")) return filePath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${filePath}`
}

export function LabTests() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  // Filters
  const [doctorFilter, setDoctorFilter] = useState<string>("all")
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [visitFilter, setVisitFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Pagination
  const [page, setPage] = useState(1)

  // Fetch data
  const { data: labTestsData, isLoading } = useLabTests(page, {
    doctor_id: doctorFilter !== "all" ? Number(doctorFilter) : undefined,
    patient_id: patientFilter !== "all" ? Number(patientFilter) : undefined,
    visit_id: visitFilter !== "all" ? Number(visitFilter) : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  })

  const { data: doctorsData } = useDoctors(1, {})
  const { data: patientsData } = usePatients(1, {})
  const { data: visitsData } = useVisits(1, {})

  // Mutations
  const createLabTest = useCreateLabTest()
  const updateLabTest = useUpdateLabTest()
  const deleteLabTest = useDeleteLabTest()
  const uploadLabTestResult = useUploadLabTestResult()

  // Dialog states
  const [labTestDialogOpen, setLabTestDialogOpen] = useState(false)
  const [editingLabTest, setEditingLabTest] = useState<LabTest | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingLabTest, setDeletingLabTest] = useState<LabTest | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadingLabTest, setUploadingLabTest] = useState<LabTest | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    visit_id: "",
    patient_id: "",
    doctor_id: "",
    test_name: "",
    test_code: "",
    requested_date: "",
    status: "pending",
  })

  const handleOpenDialog = (labTest?: LabTest) => {
    if (labTest) {
      setEditingLabTest(labTest)
      setFormData({
        visit_id: labTest.visit_id.toString(),
        patient_id: labTest.patient_id.toString(),
        doctor_id: labTest.doctor_id.toString(),
        test_name: labTest.test_name,
        test_code: labTest.test_code,
        requested_date: labTest.requested_date,
        status: labTest.status,
      })
    } else {
      setEditingLabTest(null)
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        visit_id: "",
        patient_id: "",
        doctor_id: "",
        test_name: "",
        test_code: "",
        requested_date: today,
        status: "pending",
      })
    }
    setLabTestDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingLabTest) {
        await updateLabTest.mutateAsync({
          id: editingLabTest.id,
          data: {
            test_name: formData.test_name,
            test_code: formData.test_code,
            status: formData.status,
          },
        })
      } else {
        await createLabTest.mutateAsync({
          visit_id: Number(formData.visit_id),
          patient_id: Number(formData.patient_id),
          doctor_id: Number(formData.doctor_id),
          test_name: formData.test_name,
          test_code: formData.test_code,
          requested_date: formData.requested_date,
        })
      }
      setLabTestDialogOpen(false)
    } catch (error) {
      console.error("Error saving lab test:", error)
    }
  }

  const handleOpenDeleteDialog = (labTest: LabTest) => {
    setDeletingLabTest(labTest)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingLabTest) return
    try {
      await deleteLabTest.mutateAsync(deletingLabTest.id)
      setDeleteDialogOpen(false)
      setDeletingLabTest(null)
    } catch (error) {
      console.error("Error deleting lab test:", error)
    }
  }

  const handleOpenUploadDialog = (labTest: LabTest) => {
    setUploadingLabTest(labTest)
    setUploadFile(null)
    setUploadResult("")
    setUploadDialogOpen(true)
  }

  const handleUploadResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadingLabTest || !uploadFile) return
    try {
      await uploadLabTestResult.mutateAsync({
        labTestId: uploadingLabTest.id,
        file: uploadFile,
        result: uploadResult || undefined,
      })
      setUploadDialogOpen(false)
      setUploadingLabTest(null)
      setUploadFile(null)
      setUploadResult("")
    } catch (error) {
      console.error("Error uploading lab test result:", error)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lab Tests</h1>
            <p className="text-muted-foreground">Manage patient lab tests</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Lab Test
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
            <div className="grid gap-4 md:grid-cols-4">
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lab Tests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lab Tests List</CardTitle>
            <CardDescription>
              {labTestsData?.meta?.total || 0} lab tests found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading lab tests...</div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Test Code</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labTestsData?.data?.map((labTest: LabTest) => (
                      <TableRow key={labTest.id}>
                        <TableCell>{labTest.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FlaskConical className="mr-2 h-4 w-4 text-purple-500" />
                            {labTest.test_name}
                          </div>
                        </TableCell>
                        <TableCell>{labTest.test_code}</TableCell>
                        <TableCell>{labTest.patient?.name || "N/A"}</TableCell>
                        <TableCell>{labTest.doctor?.name || "N/A"}</TableCell>
                        <TableCell>
                          {new Date(labTest.requested_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(labTest.status)}>
                            {labTest.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {labTest.result_file_path ? (
                            <a
                              href={getFileUrl(labTest.result_file_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:underline"
                            >
                              <Download className="mr-1 h-4 w-4" />
                              Download
                            </a>
                          ) : (
                            <span className="text-muted-foreground">No result</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(labTest)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {labTest.status !== "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenUploadDialog(labTest)}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDeleteDialog(labTest)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {labTestsData?.data?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No lab tests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {labTestsData?.meta && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={labTestsData.meta.current_page}
                      totalPages={labTestsData.meta.last_page}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Lab Test Dialog */}
        <Dialog open={labTestDialogOpen} onOpenChange={setLabTestDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLabTest ? "Edit Lab Test" : "New Lab Test"}
              </DialogTitle>
              <DialogDescription>
                {editingLabTest
                  ? "Update lab test details"
                  : "Create a new lab test request"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {!editingLabTest && (
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
                  <Label htmlFor="test_name">Test Name *</Label>
                  <Input
                    id="test_name"
                    value={formData.test_name}
                    onChange={(e) =>
                      setFormData({ ...formData, test_name: e.target.value })
                    }
                    required
                    placeholder="e.g., Complete Blood Count"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="test_code">Test Code *</Label>
                  <Input
                    id="test_code"
                    value={formData.test_code}
                    onChange={(e) => setFormData({ ...formData, test_code: e.target.value })}
                    required
                    placeholder="e.g., CBC"
                  />
                </div>

                {!editingLabTest && (
                  <div className="grid gap-2">
                    <Label htmlFor="requested_date">Requested Date *</Label>
                    <Input
                      id="requested_date"
                      type="date"
                      value={formData.requested_date}
                      onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                      required
                    />
                  </div>
                )}

                {editingLabTest && (
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLabTestDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLabTest.isPending || updateLabTest.isPending}>
                  {editingLabTest ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Upload Result Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Lab Test Result</DialogTitle>
              <DialogDescription>
                Upload result file for {uploadingLabTest?.test_name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadResult}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="result_file">Result File * (PDF, Images, or Documents)</Label>
                  <Input
                    id="result_file"
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png,.gif,.svg,.doc,.docx"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Max file size: 10MB. Accepted formats: PDF, JPEG, PNG, GIF, SVG, DOC, DOCX
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="upload_result">Result Summary (Optional)</Label>
                  <Textarea
                    id="upload_result"
                    value={uploadResult}
                    onChange={(e) => setUploadResult(e.target.value)}
                    rows={3}
                    placeholder="Enter result summary..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadLabTestResult.isPending || !uploadFile}>
                  Upload
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Lab Test Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Lab Test</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this lab test? This action cannot be undone.
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
                disabled={deleteLabTest.isPending}
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

