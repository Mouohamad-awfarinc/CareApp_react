import { useState, useEffect } from "react"
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
import { Plus, Edit, Trash2, UserPlus, AlertCircle, Eye, Stethoscope, Building2, Calendar } from "lucide-react"
import {
  useDoctors,
  useCreateDoctor,
  useUpdateDoctor,
  useUpdateDoctorFile,
  useDeleteDoctor,
  useSpecialties,
  useDoctorPatients,
  useDoctorClinics,
  useAssignDoctorToClinics,
  useClinics,
  useDoctorSchedule,
  useUpdateDoctorSchedule,
} from "@/hooks/use-healthcare"
import { useUsers } from "@/hooks/use-users"
import { useDebounce } from "@/hooks/use-debounce"
import type { Doctor, CreateDoctorRequest, Clinic } from "@/types"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"

// Helper function to get full image URL
const getImageUrl = (photoPath: string | null) => {
  if (!photoPath) return ""
  if (photoPath.startsWith("http")) return photoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${photoPath}`
}

export function Doctors() {
  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")

  // Doctors
  const [doctorsPage, setDoctorsPage] = useState(1)
  const { data: doctorsData, isLoading: loadingDoctors } = useDoctors(doctorsPage, {
    search: debouncedSearch || undefined,
    specialty_id:
      specialtyFilter && specialtyFilter !== "all" ? Number(specialtyFilter) : undefined,
  })
  const createDoctor = useCreateDoctor()
  const updateDoctor = useUpdateDoctor()
  const updateDoctorFile = useUpdateDoctorFile()
  const deleteDoctor = useDeleteDoctor()
  const assignDoctorToClinics = useAssignDoctorToClinics()

  // Specialties for filter and form
  const [specialtiesPage] = useState(1)
  const { data: specialtiesData } = useSpecialties(specialtiesPage)

  // Clinics for assign dialog
  const [clinicsPage] = useState(1)
  const { data: allClinicsData } = useClinics(clinicsPage, {})

  // Users for form
  const [usersPage] = useState(1)
  const { data: usersData } = useUsers(usersPage, {})

  // Dialog states
  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [viewDoctorDetails, setViewDoctorDetails] = useState<Doctor | null>(null)
  const [assignClinicsDialogOpen, setAssignClinicsDialogOpen] = useState(false)
  const [assigningDoctor, setAssigningDoctor] = useState<Doctor | null>(null)
  const [patientsPage, setPatientsPage] = useState(1)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [managingScheduleDoctor, setManagingScheduleDoctor] = useState<Doctor | null>(null)

  // Doctor details data
  const { data: patientsData, isLoading: loadingPatients } = useDoctorPatients(
    viewDoctorDetails?.id || 0,
    patientsPage
  )
  const { data: doctorClinicsData } = useDoctorClinics(viewDoctorDetails?.id || 0)

  // Form states
  const [doctorForm, setDoctorForm] = useState({
    user_id: "",
    name: "",
    email: "",
    specialty_id: "",
    mobile: "",
    license_number: "",
    title: "",
    occupation: "",
    experience_years: "",
    gender: "",
    qualifications: "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [licenseCardFile, setLicenseCardFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const doctors = doctorsData?.data || []
  const specialties = specialtiesData?.data || []
  const users = usersData?.data || []
  const allClinics = allClinicsData?.data || []

  const handleOpenDoctorDialog = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor)
      // Get ids from nested objects if not directly available
      const userId = doctor.user_id || doctor.user?.id
      const specialtyId = doctor.specialty_id || doctor.specialty?.id
      setDoctorForm({
        user_id: userId?.toString() || "",
        name: doctor.name,
        email: doctor.email || "",
        specialty_id: specialtyId?.toString() || "",
        mobile: doctor.mobile || "",
        license_number: doctor.license_number || "",
        title: doctor.title || "",
        occupation: doctor.occupation || "",
        experience_years: doctor.experience_years?.toString() || "",
        gender: doctor.gender || "",
        qualifications: doctor.qualifications.join(", ") || "",
      })
    } else {
      setEditingDoctor(null)
      setDoctorForm({
        user_id: "",
        name: "",
        email: "",
        specialty_id: "",
        mobile: "",
        license_number: "",
        title: "",
        occupation: "",
        experience_years: "",
        gender: "",
        qualifications: "",
      })
    }
    setPhotoFile(null)
    setLicenseCardFile(null)
    setError("")
    setDoctorDialogOpen(true)
  }

  const handleSubmitDoctor = async () => {
    try {
      setError("")
      const qualificationsArray = doctorForm.qualifications
        .split(",")
        .map((q) => q.trim())
        .filter(Boolean)

      if (editingDoctor) {
        // Update doctor data (without files)
        const requestData = {
          user_id: Number(doctorForm.user_id),
          name: doctorForm.name,
          email: doctorForm.email,
          specialty_id: Number(doctorForm.specialty_id),
          mobile: doctorForm.mobile || null,
          license_number: doctorForm.license_number || null,
          title: doctorForm.title || null,
          occupation: doctorForm.occupation || null,
          qualifications: qualificationsArray,
          experience_years: doctorForm.experience_years ? Number(doctorForm.experience_years) : null,
          gender: doctorForm.gender || null,
        }
        await updateDoctor.mutateAsync({ id: editingDoctor.id, data: requestData })

        // If photo is provided, update it separately
        if (photoFile) {
          await updateDoctorFile.mutateAsync({
            id: editingDoctor.id,
            type: "photo",
            file: photoFile,
          })
        }

        // If license card is provided, update it separately
        if (licenseCardFile) {
          await updateDoctorFile.mutateAsync({
            id: editingDoctor.id,
            type: "license_card",
            file: licenseCardFile,
          })
        }
      } else {
        // Create new doctor (with files if provided)
        const requestData: CreateDoctorRequest = {
          user_id: Number(doctorForm.user_id),
          name: doctorForm.name,
          email: doctorForm.email,
          specialty_id: Number(doctorForm.specialty_id),
          mobile: doctorForm.mobile || null,
          license_number: doctorForm.license_number || null,
          title: doctorForm.title || null,
          occupation: doctorForm.occupation || null,
          qualifications: qualificationsArray,
          experience_years: doctorForm.experience_years ? Number(doctorForm.experience_years) : null,
          gender: doctorForm.gender || null,
        }
        if (photoFile) {
          requestData.photo = photoFile
        }
        if (licenseCardFile) {
          requestData.license_card = licenseCardFile
        }
        await createDoctor.mutateAsync(requestData)
      }
      setDoctorDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save doctor"
      setError(errorMessage)
    }
  }

  const handleDeleteDoctor = async (id: number) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      try {
        await deleteDoctor.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete doctor"
        alert(errorMessage)
      }
    }
  }

  const handleAssignClinics = async (selectedClinics: Array<{ clinic_id: number; is_active: boolean }>) => {
    if (!assigningDoctor) return
    try {
      await assignDoctorToClinics.mutateAsync({
        doctorId: assigningDoctor.id,
        clinics: selectedClinics,
      })
      setAssignClinicsDialogOpen(false)
      setAssigningDoctor(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign clinics"
      alert(errorMessage)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <div className="accent-line-green" />
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Doctors Management</h1>
            <p className="text-muted-foreground mt-1">Manage healthcare doctors and their specializations</p>
          </div>
          <Button onClick={() => handleOpenDoctorDialog()} className="shadow-lg hover:shadow-secondary/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Doctors</CardTitle>
            <CardDescription>
              A list of all healthcare doctors{" "}
              {doctorsData?.meta?.total ? `(${doctorsData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id.toString()}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingDoctors ? (
              <div className="text-center py-8 text-muted-foreground">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No doctors found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getImageUrl(doctor.photo)} alt={doctor.name} />
                            <AvatarFallback>{doctor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>
                          {doctor.specialty ? (
                            <Badge variant="secondary">{doctor.specialty.name}</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{doctor.license_number || "—"}</TableCell>
                        <TableCell>
                          {doctor.experience_years
                            ? `${doctor.experience_years} years`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewDoctorDetails(doctor)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDoctorDialog(doctor)}
                              title="Edit Doctor"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setAssigningDoctor(doctor)
                                setAssignClinicsDialogOpen(true)
                              }}
                              title="Assign Clinics"
                            >
                              <Building2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDoctor(doctor.id)}
                              title="Delete Doctor"
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
                {doctorsData?.meta && (
                  <Pagination
                    currentPage={doctorsData.meta.current_page}
                    lastPage={doctorsData.meta.last_page}
                    onPageChange={setDoctorsPage}
                    total={doctorsData.meta.total}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Doctor Dialog */}
        <Dialog open={doctorDialogOpen} onOpenChange={setDoctorDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingDoctor ? "Edit Doctor" : "Create Doctor"}</DialogTitle>
              <DialogDescription>
                {editingDoctor ? "Update doctor information" : "Create a new doctor profile"}
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
                  <Label htmlFor="doctor-user">User *</Label>
                  <Select
                    value={doctorForm.user_id}
                    onValueChange={(value) => setDoctorForm({ ...doctorForm, user_id: value })}
                  >
                    <SelectTrigger id="doctor-user">
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
                  <Label htmlFor="doctor-specialty">Specialty *</Label>
                  <Select
                    value={doctorForm.specialty_id}
                    onValueChange={(value) =>
                      setDoctorForm({ ...doctorForm, specialty_id: value })
                    }
                  >
                    <SelectTrigger id="doctor-specialty">
                      <SelectValue placeholder="Select a specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id.toString()}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-name">Name *</Label>
                  <Input
                    id="doctor-name"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-email">Email *</Label>
                  <Input
                    id="doctor-email"
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-mobile">Mobile</Label>
                  <Input
                    id="doctor-mobile"
                    value={doctorForm.mobile}
                    onChange={(e) => setDoctorForm({ ...doctorForm, mobile: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-license">License Number</Label>
                  <Input
                    id="doctor-license"
                    value={doctorForm.license_number}
                    onChange={(e) => setDoctorForm({ ...doctorForm, license_number: e.target.value })}
                    placeholder="MD123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-title">Title</Label>
                  <Input
                    id="doctor-title"
                    value={doctorForm.title}
                    onChange={(e) => setDoctorForm({ ...doctorForm, title: e.target.value })}
                    placeholder="Dr."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-occupation">Occupation</Label>
                  <Input
                    id="doctor-occupation"
                    value={doctorForm.occupation}
                    onChange={(e) =>
                      setDoctorForm({ ...doctorForm, occupation: e.target.value })
                    }
                    placeholder="Cardiologist"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-experience">Experience (Years)</Label>
                  <Input
                    id="doctor-experience"
                    type="number"
                    value={doctorForm.experience_years}
                    onChange={(e) =>
                      setDoctorForm({ ...doctorForm, experience_years: e.target.value })
                    }
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-gender">Gender</Label>
                  <Select
                    value={doctorForm.gender}
                    onValueChange={(value) => setDoctorForm({ ...doctorForm, gender: value })}
                  >
                    <SelectTrigger id="doctor-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-qualifications">Qualifications (comma-separated)</Label>
                  <Input
                    id="doctor-qualifications"
                    value={doctorForm.qualifications}
                    onChange={(e) =>
                      setDoctorForm({ ...doctorForm, qualifications: e.target.value })
                    }
                    placeholder="MD, PhD"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-photo">Photo</Label>
                  <Input
                    id="doctor-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-license-card">License Card</Label>
                  <Input
                    id="doctor-license-card"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLicenseCardFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDoctorDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDoctor}
                disabled={createDoctor.isPending || updateDoctor.isPending}
              >
                {createDoctor.isPending || updateDoctor.isPending
                  ? "Saving..."
                  : editingDoctor
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={!!viewDoctorDetails} onOpenChange={(open) => !open && setViewDoctorDetails(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{viewDoctorDetails?.name} Details</DialogTitle>
              <DialogDescription>View doctor information and associated patients and clinics</DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 min-h-0 space-y-6">
              {/* Doctor Info */}
              {viewDoctorDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Doctor Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={getImageUrl(viewDoctorDetails.photo)} alt={viewDoctorDetails.name} />
                        <AvatarFallback className="text-2xl">{viewDoctorDetails.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold">{viewDoctorDetails.name}</h3>
                        <p className="text-sm text-muted-foreground">{viewDoctorDetails.email}</p>
                        {viewDoctorDetails.specialty && (
                          <Badge variant="secondary" className="mt-1">{viewDoctorDetails.specialty.name}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                        <p className="text-sm">{viewDoctorDetails.mobile || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">License Number</p>
                        <p className="text-sm">{viewDoctorDetails.license_number || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Title</p>
                        <p className="text-sm">{viewDoctorDetails.title || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                        <p className="text-sm">{viewDoctorDetails.occupation || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Experience</p>
                        <p className="text-sm">
                          {viewDoctorDetails.experience_years
                            ? `${viewDoctorDetails.experience_years} years`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Gender</p>
                        <p className="text-sm">{viewDoctorDetails.gender || "—"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patients */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <CardTitle>Patients ({patientsData?.data?.length || 0})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingPatients ? (
                    <div className="text-center py-4 text-muted-foreground">Loading patients...</div>
                  ) : !patientsData?.data || patientsData.data.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No patients found</div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Gender</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patientsData.data.map((patient) => (
                            <TableRow key={patient.id}>
                              <TableCell className="font-medium">{patient.name}</TableCell>
                              <TableCell>{patient.email || "—"}</TableCell>
                              <TableCell>{patient.mobile || "—"}</TableCell>
                              <TableCell>{patient.gender || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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

              {/* Clinics */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    <CardTitle>Clinics ({doctorClinicsData?.length || 0})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {!doctorClinicsData || doctorClinicsData.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No clinics found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {doctorClinicsData.map((clinic) => (
                          <TableRow key={clinic.id}>
                            <TableCell className="font-medium">{clinic.name}</TableCell>
                            <TableCell>{clinic.city || "—"}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{clinic.category || "—"}</Badge>
                            </TableCell>
                            <TableCell>{clinic.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button onClick={() => setViewDoctorDetails(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Clinics Dialog */}
        <AssignClinicsDialog
          open={assignClinicsDialogOpen}
          onOpenChange={setAssignClinicsDialogOpen}
          doctor={assigningDoctor}
          clinics={allClinics}
          onAssign={handleAssignClinics}
          isLoading={assignDoctorToClinics.isPending}
        />
      </div>
    </AppLayout>
  )
}

// Assign Clinics Dialog Component
function AssignClinicsDialog({
  open,
  onOpenChange,
  doctor,
  clinics,
  onAssign,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor: Doctor | null
  clinics: Clinic[]
  onAssign: (clinics: Array<{ clinic_id: number; is_active: boolean }>) => void
  isLoading: boolean
}) {
  const [selectedClinics, setSelectedClinics] = useState<Record<number, boolean>>({})

  // Load existing clinic assignments when dialog opens
  const { data: existingClinics } = useDoctorClinics(doctor?.id || 0)
  
  // Initialize selectedClinics when dialog opens or doctor changes
  useEffect(() => {
    if (open && existingClinics && existingClinics.length > 0) {
      const initial: Record<number, boolean> = {}
      existingClinics.forEach((clinic) => {
        initial[clinic.id] = true
      })
      setSelectedClinics(initial)
    } else {
      setSelectedClinics({})
    }
  }, [open, existingClinics])

  const handleToggleClinic = (clinicId: number) => {
    setSelectedClinics((prev) => ({
      ...prev,
      [clinicId]: !prev[clinicId],
    }))
  }

  const handleSubmit = () => {
    const clinicAssignments = Object.entries(selectedClinics)
      .filter(([_, isSelected]) => isSelected)
      .map(([clinicId, _]) => ({
        clinic_id: Number(clinicId),
        is_active: true,
      }))

    onAssign(clinicAssignments)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Clinics to {doctor?.name}</DialogTitle>
          <DialogDescription>
            Select the clinics where this doctor will be available
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
          {clinics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No clinics available</div>
          ) : (
            <div className="space-y-2">
              {clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                  onClick={() => handleToggleClinic(clinic.id)}
                >
                  <Checkbox
                    checked={selectedClinics[clinic.id] || false}
                    onCheckedChange={() => handleToggleClinic(clinic.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{clinic.name}</div>
                    <div className="text-sm text-muted-foreground">{clinic.category} • {clinic.city}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Assigning..." : `Assign ${Object.values(selectedClinics).filter(Boolean).length} Clinics`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

