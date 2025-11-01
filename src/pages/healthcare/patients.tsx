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
import { Plus, Edit, Trash2, AlertCircle, Eye, Upload, FileText, Calendar, Stethoscope, Pill } from "lucide-react"
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useUpdatePatientFile,
  useDeletePatient,
  usePatientProfiles,
  usePatientLatestProfile,
  usePatientDocuments,
  usePatientAppointments,
  usePatientVisits,
  usePatientPrescriptions,
  useUploadPatientDocument,
  useDeletePatientDocument,
} from "@/hooks/use-healthcare"
import { useUsers } from "@/hooks/use-users"
import { useDebounce } from "@/hooks/use-debounce"
import type { Patient, CreatePatientRequest } from "@/types"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Helper function to get full image URL
const getImageUrl = (photoPath: string | null) => {
  if (!photoPath) return ""
  if (photoPath.startsWith("http")) return photoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${photoPath}`
}

export function Patients() {
  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [genderFilter, setGenderFilter] = useState<string>("all")

  // Patients
  const [patientsPage, setPatientsPage] = useState(1)
  const { data: patientsData, isLoading: loadingPatients } = usePatients(patientsPage, {
    search: debouncedSearch || undefined,
    gender: genderFilter !== "all" ? genderFilter : undefined,
  })
  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()
  const updatePatientFile = useUpdatePatientFile()
  const deletePatient = useDeletePatient()

  // Users for form
  const [usersPage] = useState(1)
  const { data: usersData } = useUsers(usersPage, {})

  // Dialog states
  const [patientDialogOpen, setPatientDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [viewPatientDetails, setViewPatientDetails] = useState<Patient | null>(null)

  // Patient profiles data
  const { data: patientProfiles, isLoading: loadingProfiles } = usePatientProfiles(
    viewPatientDetails?.id || 0
  )
  const { data: latestProfile } = usePatientLatestProfile(viewPatientDetails?.id || 0)
  
  // Patient documents, appointments, visits, prescriptions
  const { data: patientDocuments } = usePatientDocuments(viewPatientDetails?.id || 0, {})
  const { data: patientAppointments } = usePatientAppointments(viewPatientDetails?.id || 0, {})
  const { data: patientVisits } = usePatientVisits(viewPatientDetails?.id || 0, {})
  const { data: patientPrescriptions } = usePatientPrescriptions(viewPatientDetails?.id || 0, {})
  
  // Upload document mutations
  const uploadDocument = useUploadPatientDocument()
  const deleteDocument = useDeletePatientDocument()
  
  // Upload document states
  const [uploadDocumentDialogOpen, setUploadDocumentDialogOpen] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("medical_record")

  // Form states
  const [patientForm, setPatientForm] = useState({
    user_id: "",
    name: "",
    mobile: "",
    email: "",
    work_phone: "",
    home_phone: "",
    country: "",
    city: "",
    district: "",
    area: "",
    address: "",
    gender: "",
    national_id: "",
    birth_date: "",
    title: "",
    occupation: "",
    height: "",
    weight: "",
    emergency_contact_name: "",
    emergency_contact_mobile: "",
    longitude: "",
    latitude: "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const patients = patientsData?.data || []
  const users = usersData?.data || []

  const handleOpenPatientDialog = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient)
      // Get userId from nested user object if not directly available
      const userId = patient.user_id || patient.user?.id
      setPatientForm({
        user_id: userId?.toString() || "",
        name: patient.name,
        mobile: patient.mobile || "",
        email: patient.email || "",
        work_phone: patient.work_phone || "",
        home_phone: patient.home_phone || "",
        country: patient.country || "",
        city: patient.city || "",
        district: patient.district || "",
        area: patient.area || "",
        address: patient.address || "",
        gender: patient.gender || "",
        national_id: patient.national_id || "",
        birth_date: patient.birth_date || "",
        title: patient.title || "",
        occupation: patient.occupation || "",
        height: patient.height || "",
        weight: patient.weight || "",
        emergency_contact_name: patient.emergency_contact_name || "",
        emergency_contact_mobile: patient.emergency_contact_mobile || "",
        longitude: patient.longitude || "",
        latitude: patient.latitude || "",
      })
    } else {
      setEditingPatient(null)
      setPatientForm({
        user_id: "",
        name: "",
        mobile: "",
        email: "",
        work_phone: "",
        home_phone: "",
        country: "",
        city: "",
        district: "",
        area: "",
        address: "",
        gender: "",
        national_id: "",
        birth_date: "",
        title: "",
        occupation: "",
        height: "",
        weight: "",
        emergency_contact_name: "",
        emergency_contact_mobile: "",
        longitude: "",
        latitude: "",
      })
    }
    setPhotoFile(null)
    setError("")
    setPatientDialogOpen(true)
  }

  const handleSubmitPatient = async () => {
    try {
      setError("")

      if (editingPatient) {
        // Update patient data (without files)
        const requestData = {
          user_id: Number(patientForm.user_id),
          name: patientForm.name,
          mobile: patientForm.mobile || null,
          email: patientForm.email || null,
          work_phone: patientForm.work_phone || null,
          home_phone: patientForm.home_phone || null,
          country: patientForm.country || null,
          city: patientForm.city || null,
          district: patientForm.district || null,
          area: patientForm.area || null,
          address: patientForm.address || null,
          gender: patientForm.gender || null,
          national_id: patientForm.national_id || null,
          birth_date: patientForm.birth_date || null,
          title: patientForm.title || null,
          occupation: patientForm.occupation || null,
          height: patientForm.height || null,
          weight: patientForm.weight || null,
          emergency_contact_name: patientForm.emergency_contact_name || null,
          emergency_contact_mobile: patientForm.emergency_contact_mobile || null,
          longitude: patientForm.longitude || null,
          latitude: patientForm.latitude || null,
        }
        await updatePatient.mutateAsync({ id: editingPatient.id, data: requestData })

        // If photo is provided, update it separately
        if (photoFile) {
          await updatePatientFile.mutateAsync({
            id: editingPatient.id,
            type: "photo",
            file: photoFile,
          })
        }
      } else {
        // Create new patient (with files if provided)
        const requestData: CreatePatientRequest = {
          user_id: Number(patientForm.user_id),
          name: patientForm.name,
          mobile: patientForm.mobile || null,
          email: patientForm.email || null,
          work_phone: patientForm.work_phone || null,
          home_phone: patientForm.home_phone || null,
          country: patientForm.country || null,
          city: patientForm.city || null,
          district: patientForm.district || null,
          area: patientForm.area || null,
          address: patientForm.address || null,
          gender: patientForm.gender || null,
          national_id: patientForm.national_id || null,
          birth_date: patientForm.birth_date || null,
          title: patientForm.title || null,
          occupation: patientForm.occupation || null,
          height: patientForm.height || null,
          weight: patientForm.weight || null,
          emergency_contact_name: patientForm.emergency_contact_name || null,
          emergency_contact_mobile: patientForm.emergency_contact_mobile || null,
          longitude: patientForm.longitude || null,
          latitude: patientForm.latitude || null,
        }
        if (photoFile) {
          requestData.photo = photoFile
        }
        await createPatient.mutateAsync(requestData)
      }
      setPatientDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save patient"
      setError(errorMessage)
    }
  }

  const handleDeletePatient = async (id: number) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete patient"
        alert(errorMessage)
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">Manage patient records</p>
          </div>
          <Button onClick={() => handleOpenPatientDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Patients</CardTitle>
            <CardDescription>
              A list of all patients{" "}
              {patientsData?.meta?.total ? `(${patientsData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search patients..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingPatients ? (
              <div className="text-center py-8 text-muted-foreground">Loading patients...</div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No patients found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getImageUrl(patient.photo)} alt={patient.name} />
                            <AvatarFallback>{patient.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.email || "—"}</TableCell>
                        <TableCell>{patient.mobile || "—"}</TableCell>
                        <TableCell>{patient.gender || "—"}</TableCell>
                        <TableCell>{patient.city || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewPatientDetails(patient)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenPatientDialog(patient)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {patientsData?.meta && (
                  <Pagination
                    currentPage={patientsData.meta.current_page}
                    lastPage={patientsData.meta.last_page}
                    onPageChange={setPatientsPage}
                    total={patientsData.meta.total}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Patient Dialog */}
        <Dialog open={patientDialogOpen} onOpenChange={setPatientDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingPatient ? "Edit Patient" : "Create Patient"}</DialogTitle>
              <DialogDescription>
                {editingPatient ? "Update patient information" : "Create a new patient record"}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="overflow-y-auto flex-1 min-h-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-user">User *</Label>
                  <Select
                    value={patientForm.user_id}
                    onValueChange={(value) => setPatientForm({ ...patientForm, user_id: value })}
                  >
                    <SelectTrigger id="patient-user">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Name *</Label>
                  <Input
                    id="patient-name"
                    value={patientForm.name}
                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-email">Email</Label>
                  <Input
                    id="patient-email"
                    type="email"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-mobile">Mobile</Label>
                  <Input
                    id="patient-mobile"
                    value={patientForm.mobile}
                    onChange={(e) => setPatientForm({ ...patientForm, mobile: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-work-phone">Work Phone</Label>
                  <Input
                    id="patient-work-phone"
                    value={patientForm.work_phone}
                    onChange={(e) => setPatientForm({ ...patientForm, work_phone: e.target.value })}
                    placeholder="+1234567891"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-home-phone">Home Phone</Label>
                  <Input
                    id="patient-home-phone"
                    value={patientForm.home_phone}
                    onChange={(e) => setPatientForm({ ...patientForm, home_phone: e.target.value })}
                    placeholder="+1234567892"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-country">Country</Label>
                  <Input
                    id="patient-country"
                    value={patientForm.country}
                    onChange={(e) => setPatientForm({ ...patientForm, country: e.target.value })}
                    placeholder="USA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-city">City</Label>
                  <Input
                    id="patient-city"
                    value={patientForm.city}
                    onChange={(e) => setPatientForm({ ...patientForm, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-district">District</Label>
                  <Input
                    id="patient-district"
                    value={patientForm.district}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, district: e.target.value })
                    }
                    placeholder="Manhattan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-area">Area</Label>
                  <Input
                    id="patient-area"
                    value={patientForm.area}
                    onChange={(e) => setPatientForm({ ...patientForm, area: e.target.value })}
                    placeholder="Midtown"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="patient-address">Address</Label>
                  <Input
                    id="patient-address"
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-gender">Gender</Label>
                  <Select
                    value={patientForm.gender}
                    onValueChange={(value) => setPatientForm({ ...patientForm, gender: value })}
                  >
                    <SelectTrigger id="patient-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-birth-date">Birth Date</Label>
                  <Input
                    id="patient-birth-date"
                    type="date"
                    value={patientForm.birth_date}
                    onChange={(e) => setPatientForm({ ...patientForm, birth_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-national-id">National ID</Label>
                  <Input
                    id="patient-national-id"
                    value={patientForm.national_id}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, national_id: e.target.value })
                    }
                    placeholder="1234567890123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-title">Title</Label>
                  <Input
                    id="patient-title"
                    value={patientForm.title}
                    onChange={(e) => setPatientForm({ ...patientForm, title: e.target.value })}
                    placeholder="Ms."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-occupation">Occupation</Label>
                  <Input
                    id="patient-occupation"
                    value={patientForm.occupation}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, occupation: e.target.value })
                    }
                    placeholder="Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-height">Height (cm)</Label>
                  <Input
                    id="patient-height"
                    type="number"
                    value={patientForm.height}
                    onChange={(e) => setPatientForm({ ...patientForm, height: e.target.value })}
                    placeholder="165.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-weight">Weight (kg)</Label>
                  <Input
                    id="patient-weight"
                    type="number"
                    value={patientForm.weight}
                    onChange={(e) => setPatientForm({ ...patientForm, weight: e.target.value })}
                    placeholder="60.25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-emergency-name">Emergency Contact Name</Label>
                  <Input
                    id="patient-emergency-name"
                    value={patientForm.emergency_contact_name}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, emergency_contact_name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-emergency-mobile">Emergency Contact Mobile</Label>
                  <Input
                    id="patient-emergency-mobile"
                    value={patientForm.emergency_contact_mobile}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, emergency_contact_mobile: e.target.value })
                    }
                    placeholder="+1234567893"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-longitude">Longitude</Label>
                  <Input
                    id="patient-longitude"
                    value={patientForm.longitude}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, longitude: e.target.value })
                    }
                    placeholder="-74.0060"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-latitude">Latitude</Label>
                  <Input
                    id="patient-latitude"
                    value={patientForm.latitude}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, latitude: e.target.value })
                    }
                    placeholder="40.7128"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="patient-photo">Photo</Label>
                  <Input
                    id="patient-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPatientDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitPatient}
                disabled={createPatient.isPending || updatePatient.isPending}
              >
                {createPatient.isPending || updatePatient.isPending
                  ? "Saving..."
                  : editingPatient
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={!!viewPatientDetails} onOpenChange={(open) => !open && setViewPatientDetails(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{viewPatientDetails?.name} Details</DialogTitle>
              <DialogDescription>View patient information</DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 min-h-0 space-y-6">
              {/* Patient Info */}
              {viewPatientDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={getImageUrl(viewPatientDetails.photo)} alt={viewPatientDetails.name} />
                        <AvatarFallback className="text-2xl">{viewPatientDetails.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold">{viewPatientDetails.name}</h3>
                        <p className="text-sm text-muted-foreground">{viewPatientDetails.email || "No email"}</p>
                        {viewPatientDetails.gender && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-secondary">{viewPatientDetails.gender}</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                        <p className="text-sm">{viewPatientDetails.mobile || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Work Phone</p>
                        <p className="text-sm">{viewPatientDetails.work_phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Home Phone</p>
                        <p className="text-sm">{viewPatientDetails.home_phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">National ID</p>
                        <p className="text-sm">{viewPatientDetails.national_id || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">City</p>
                        <p className="text-sm">{viewPatientDetails.city || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Country</p>
                        <p className="text-sm">{viewPatientDetails.country || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p className="text-sm">{viewPatientDetails.address || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                        <p className="text-sm">{viewPatientDetails.emergency_contact_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Emergency Mobile</p>
                        <p className="text-sm">{viewPatientDetails.emergency_contact_mobile || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                        <p className="text-sm">{viewPatientDetails.occupation || "—"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Latest Profile */}
              {latestProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Medical Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Clinic</p>
                        <p className="text-sm">{latestProfile.clinic?.name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Profile Type</p>
                        <p className="text-sm">{latestProfile.profile_type || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Blood Type</p>
                        <p className="text-sm">{latestProfile.blood_type || "—"}</p>
                      </div>
                      {latestProfile.medical_history && latestProfile.medical_history.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Medical History</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {latestProfile.medical_history.map((item, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs rounded bg-secondary">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {latestProfile.allergies && latestProfile.allergies.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {latestProfile.allergies.map((item, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs rounded bg-destructive/10 text-destructive">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {latestProfile.chronic_conditions && latestProfile.chronic_conditions.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Chronic Conditions</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {latestProfile.chronic_conditions.map((item, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs rounded bg-orange-100 dark:bg-orange-900">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {latestProfile.medications && latestProfile.medications.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Medications</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {latestProfile.medications.map((item, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {latestProfile.notes && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Notes</p>
                          <p className="text-sm">{latestProfile.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Profiles */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>All Profiles ({patientProfiles?.length || 0})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingProfiles ? (
                    <div className="text-center py-4 text-muted-foreground">Loading profiles...</div>
                  ) : !patientProfiles || patientProfiles.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No profiles found</div>
                  ) : (
                    <div className="space-y-4">
                      {patientProfiles.map((profile) => (
                        <div key={profile.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{profile.clinic?.name || "Unknown Clinic"}</h4>
                              <p className="text-sm text-muted-foreground">{profile.profile_type}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(profile.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {profile.medical_history && profile.medical_history.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Medical History</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {profile.medical_history.map((item, idx) => (
                                    <span key={idx} className="px-2 py-0.5 text-xs rounded bg-secondary">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {profile.allergies && profile.allergies.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Allergies</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {profile.allergies.map((item, idx) => (
                                    <span key={idx} className="px-2 py-0.5 text-xs rounded bg-destructive/10 text-destructive">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {profile.medications && profile.medications.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Medications</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {profile.medications.map((item, idx) => (
                                    <span key={idx} className="px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button onClick={() => setViewPatientDetails(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

