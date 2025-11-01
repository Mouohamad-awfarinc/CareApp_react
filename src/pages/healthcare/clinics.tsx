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
import { Plus, Edit, Trash2, AlertCircle, Eye, UserPlus, Stethoscope } from "lucide-react"
import {
  useClinics,
  useCreateClinic,
  useUpdateClinic,
  useUpdateClinicPhoto,
  useDeleteClinic,
  useClinicDoctors,
  useClinicPatients,
} from "@/hooks/use-healthcare"
import { useDebounce } from "@/hooks/use-debounce"
import type { Clinic, CreateClinicRequest } from "@/types"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Helper function to get full image URL
const getImageUrl = (photoPath: string | null) => {
  if (!photoPath) return ""
  if (photoPath.startsWith("http")) return photoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${photoPath}`
}

export function Clinics() {
  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [cityFilter, setCityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Clinics
  const [clinicsPage, setClinicsPage] = useState(1)
  const { data: clinicsData, isLoading: loadingClinics } = useClinics(clinicsPage, {
    search: debouncedSearch || undefined,
    city: cityFilter && cityFilter !== "all" ? cityFilter : undefined,
    category: categoryFilter && categoryFilter !== "all" ? categoryFilter : undefined,
  })
  const createClinic = useCreateClinic()
  const updateClinic = useUpdateClinic()
  const updateClinicPhoto = useUpdateClinicPhoto()
  const deleteClinic = useDeleteClinic()

  // Dialog states
  const [clinicDialogOpen, setClinicDialogOpen] = useState(false)
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)
  const [viewClinicDetails, setViewClinicDetails] = useState<Clinic | null>(null)
  const [doctorsPage, setDoctorsPage] = useState(1)
  const [patientsPage, setPatientsPage] = useState(1)

  // Clinic details data
  const { data: doctorsData, isLoading: loadingDoctors } = useClinicDoctors(
    viewClinicDetails?.id || 0,
    doctorsPage
  )
  const { data: patientsData, isLoading: loadingPatients } = useClinicPatients(
    viewClinicDetails?.id || 0,
    patientsPage
  )

  // Form states
  const [clinicForm, setClinicForm] = useState({
    name: "",
    email: "",
    category: "",
    mobile: "",
    phone: "",
    country: "",
    city: "",
    district: "",
    area: "",
    address: "",
    longitude: "",
    latitude: "",
    fees: "",
    consultation_fees: "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const clinics = clinicsData?.data || []

  // Get unique cities and categories for filters
  const cities = Array.from(new Set(clinics.map((c) => c.city).filter(Boolean))) as string[]
  const categories = Array.from(new Set(clinics.map((c) => c.category).filter(Boolean))) as string[]

  const handleOpenClinicDialog = (clinic?: Clinic) => {
    if (clinic) {
      setEditingClinic(clinic)
      setClinicForm({
        name: clinic.name,
        email: clinic.email || "",
        category: clinic.category || "",
        mobile: clinic.mobile || "",
        phone: clinic.phone || "",
        country: clinic.country || "",
        city: clinic.city || "",
        district: clinic.district || "",
        area: clinic.area || "",
        address: clinic.address || "",
        longitude: clinic.longitude || "",
        latitude: clinic.latitude || "",
        fees: clinic.fees || "",
        consultation_fees: clinic.consultation_fees || "",
      })
    } else {
      setEditingClinic(null)
      setClinicForm({
        name: "",
        email: "",
        category: "",
        mobile: "",
        phone: "",
        country: "",
        city: "",
        district: "",
        area: "",
        address: "",
        longitude: "",
        latitude: "",
        fees: "",
        consultation_fees: "",
      })
    }
    setPhotoFile(null)
    setError("")
    setClinicDialogOpen(true)
  }

  const handleSubmitClinic = async () => {
    try {
      setError("")
      
      if (editingClinic) {
        // Update clinic data (without photo)
        const requestData = {
          ...clinicForm,
          category: clinicForm.category || null,
          mobile: clinicForm.mobile || null,
          phone: clinicForm.phone || null,
          country: clinicForm.country || null,
          city: clinicForm.city || null,
          district: clinicForm.district || null,
          area: clinicForm.area || null,
          address: clinicForm.address || null,
          longitude: clinicForm.longitude || null,
          latitude: clinicForm.latitude || null,
          fees: clinicForm.fees || null,
          consultation_fees: clinicForm.consultation_fees || null,
        }
        await updateClinic.mutateAsync({ id: editingClinic.id, data: requestData })
        
        // If photo is provided, update it separately
        if (photoFile) {
          await updateClinicPhoto.mutateAsync({ id: editingClinic.id, photo: photoFile })
        }
      } else {
        // Create new clinic (with photo if provided)
        const requestData: CreateClinicRequest = {
          ...clinicForm,
          category: clinicForm.category || null,
          mobile: clinicForm.mobile || null,
          phone: clinicForm.phone || null,
          country: clinicForm.country || null,
          city: clinicForm.city || null,
          district: clinicForm.district || null,
          area: clinicForm.area || null,
          address: clinicForm.address || null,
          longitude: clinicForm.longitude || null,
          latitude: clinicForm.latitude || null,
          fees: clinicForm.fees || null,
          consultation_fees: clinicForm.consultation_fees || null,
        }
        if (photoFile) {
          requestData.photo = photoFile
        }
        await createClinic.mutateAsync(requestData)
      }
      setClinicDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save clinic"
      setError(errorMessage)
    }
  }

  const handleDeleteClinic = async (id: number) => {
    if (confirm("Are you sure you want to delete this clinic?")) {
      try {
        await deleteClinic.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete clinic"
        alert(errorMessage)
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clinics</h1>
            <p className="text-muted-foreground">Manage healthcare clinics</p>
          </div>
          <Button onClick={() => handleOpenClinicDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Clinic
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Clinics</CardTitle>
            <CardDescription>
              A list of all healthcare clinics{" "}
              {clinicsData?.meta?.total ? `(${clinicsData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search clinics..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingClinics ? (
              <div className="text-center py-8 text-muted-foreground">Loading clinics...</div>
            ) : clinics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No clinics found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinics.map((clinic) => (
                      <TableRow key={clinic.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getImageUrl(clinic.photo)} alt={clinic.name} />
                            <AvatarFallback>{clinic.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{clinic.name}</TableCell>
                        <TableCell>{clinic.email}</TableCell>
                        <TableCell>{clinic.city || "—"}</TableCell>
                        <TableCell>{clinic.category || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewClinicDetails(clinic)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenClinicDialog(clinic)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClinic(clinic.id)}
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
                {clinicsData?.meta && (
                  <Pagination
                    currentPage={clinicsData.meta.current_page}
                    lastPage={clinicsData.meta.last_page}
                    onPageChange={setClinicsPage}
                    total={clinicsData.meta.total}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Clinic Dialog */}
        <Dialog open={clinicDialogOpen} onOpenChange={setClinicDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingClinic ? "Edit Clinic" : "Create Clinic"}</DialogTitle>
              <DialogDescription>
                {editingClinic ? "Update clinic information" : "Create a new healthcare clinic"}
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
                  <Label htmlFor="clinic-name">Name *</Label>
                  <Input
                    id="clinic-name"
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                    placeholder="City Medical Center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-email">Email *</Label>
                  <Input
                    id="clinic-email"
                    type="email"
                    value={clinicForm.email}
                    onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                    placeholder="contact@clinic.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-category">Category</Label>
                  <Select
                    value={clinicForm.category || "none"}
                    onValueChange={(value) =>
                      setClinicForm({ ...clinicForm, category: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger id="clinic-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="diagnostic_center">Diagnostic Center</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-mobile">Mobile</Label>
                  <Input
                    id="clinic-mobile"
                    value={clinicForm.mobile}
                    onChange={(e) => setClinicForm({ ...clinicForm, mobile: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-phone">Phone</Label>
                  <Input
                    id="clinic-phone"
                    value={clinicForm.phone}
                    onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                    placeholder="+1234567891"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-country">Country</Label>
                  <Input
                    id="clinic-country"
                    value={clinicForm.country}
                    onChange={(e) => setClinicForm({ ...clinicForm, country: e.target.value })}
                    placeholder="USA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-city">City</Label>
                  <Input
                    id="clinic-city"
                    value={clinicForm.city}
                    onChange={(e) => setClinicForm({ ...clinicForm, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-district">District</Label>
                  <Input
                    id="clinic-district"
                    value={clinicForm.district}
                    onChange={(e) => setClinicForm({ ...clinicForm, district: e.target.value })}
                    placeholder="Manhattan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-area">Area</Label>
                  <Input
                    id="clinic-area"
                    value={clinicForm.area}
                    onChange={(e) => setClinicForm({ ...clinicForm, area: e.target.value })}
                    placeholder="Midtown"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="clinic-address">Address</Label>
                  <Input
                    id="clinic-address"
                    value={clinicForm.address}
                    onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                    placeholder="123 Medical St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-longitude">Longitude</Label>
                  <Input
                    id="clinic-longitude"
                    value={clinicForm.longitude}
                    onChange={(e) => setClinicForm({ ...clinicForm, longitude: e.target.value })}
                    placeholder="-74.0060"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-latitude">Latitude</Label>
                  <Input
                    id="clinic-latitude"
                    value={clinicForm.latitude}
                    onChange={(e) => setClinicForm({ ...clinicForm, latitude: e.target.value })}
                    placeholder="40.7128"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-fees">Fees</Label>
                  <Input
                    id="clinic-fees"
                    type="number"
                    value={clinicForm.fees}
                    onChange={(e) => setClinicForm({ ...clinicForm, fees: e.target.value })}
                    placeholder="50.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-consultation-fees">Consultation Fees</Label>
                  <Input
                    id="clinic-consultation-fees"
                    type="number"
                    value={clinicForm.consultation_fees}
                    onChange={(e) =>
                      setClinicForm({ ...clinicForm, consultation_fees: e.target.value })
                    }
                    placeholder="100.00"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="clinic-photo">Photo</Label>
                  <Input
                    id="clinic-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setClinicDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitClinic}
                disabled={createClinic.isPending || updateClinic.isPending}
              >
                {createClinic.isPending || updateClinic.isPending
                  ? "Saving..."
                  : editingClinic
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={!!viewClinicDetails} onOpenChange={(open) => !open && setViewClinicDetails(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{viewClinicDetails?.name} Details</DialogTitle>
              <DialogDescription>View doctors and patients associated with this clinic</DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 min-h-0 space-y-6">
              {/* Clinic Info */}
              {viewClinicDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Clinic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={getImageUrl(viewClinicDetails.photo)} alt={viewClinicDetails.name} />
                        <AvatarFallback className="text-2xl">{viewClinicDetails.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold">{viewClinicDetails.name}</h3>
                        <p className="text-sm text-muted-foreground">{viewClinicDetails.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">City</p>
                        <p className="text-sm">{viewClinicDetails.city || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                        <Badge variant="secondary">{viewClinicDetails.category || "—"}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                        <p className="text-sm">{viewClinicDetails.mobile || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-sm">{viewClinicDetails.phone || "—"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Doctors */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    <CardTitle>Doctors ({doctorsData?.data?.length || 0})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingDoctors ? (
                    <div className="text-center py-4 text-muted-foreground">Loading doctors...</div>
                  ) : !doctorsData?.data || doctorsData.data.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No doctors found</div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>Mobile</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doctorsData.data.map((doctor) => (
                            <TableRow key={doctor.id}>
                              <TableCell className="font-medium">{doctor.name}</TableCell>
                              <TableCell>{doctor.email}</TableCell>
                              <TableCell>
                                {doctor.specialty ? (
                                  <Badge variant="secondary">{doctor.specialty.name}</Badge>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell>{doctor.mobile || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
            </div>

            <DialogFooter>
              <Button onClick={() => setViewClinicDetails(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

