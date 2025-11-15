import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, AlertCircle } from "lucide-react"
import {
  useDoctor,
  useUpdateDoctor,
  useUpdateDoctorFile,
  useSpecialties,
} from "@/hooks/use-healthcare"
import { useUsers } from "@/hooks/use-users"

export function EditDoctor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const doctorId = parseInt(id || "0")

  const { data: doctor, isLoading } = useDoctor(doctorId)
  const updateDoctor = useUpdateDoctor()
  const updateDoctorFile = useUpdateDoctorFile()

  // Fetch specialties and users
  const [specialtiesPage] = useState(1)
  const { data: specialtiesData } = useSpecialties(specialtiesPage)
  const [usersPage] = useState(1)
  const { data: usersData } = useUsers(usersPage, {})

  const specialties = specialtiesData?.data || []
  const users = usersData?.data || []

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

  // Populate form when doctor data is loaded
  useEffect(() => {
    if (doctor) {
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
        qualifications: Array.isArray(doctor.qualifications) ? doctor.qualifications.join(", ") : doctor.qualifications || "",
      })
    }
  }, [doctor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError("")
      const qualificationsArray = doctorForm.qualifications
        .split(",")
        .map((q) => q.trim())
        .filter(Boolean)

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

      await updateDoctor.mutateAsync({ id: doctorId, data: requestData })

      // If photo is provided, update it separately
      if (photoFile) {
        await updateDoctorFile.mutateAsync({ id: doctorId, type: "photo", file: photoFile })
      }
      // If license card is provided, update it separately
      if (licenseCardFile) {
        await updateDoctorFile.mutateAsync({
          id: doctorId,
          type: "license_card",
          file: licenseCardFile,
        })
      }

      navigate("/healthcare/doctors")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update doctor"
      setError(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading doctor...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Doctor</h1>
            <p className="text-muted-foreground">Update doctor information</p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
            <CardDescription>
              Update the details of the doctor. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

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
                  <Label htmlFor="doctor-name">Name *</Label>
                  <Input
                    id="doctor-name"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-email">Email</Label>
                  <Input
                    id="doctor-email"
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    placeholder="doctor@hospital.com"
                  />
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
                    onChange={(e) =>
                      setDoctorForm({ ...doctorForm, license_number: e.target.value })
                    }
                    placeholder="LIC123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-title">Title</Label>
                  <Input
                    id="doctor-title"
                    value={doctorForm.title}
                    onChange={(e) => setDoctorForm({ ...doctorForm, title: e.target.value })}
                    placeholder="Chief Surgeon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-occupation">Occupation</Label>
                  <Input
                    id="doctor-occupation"
                    value={doctorForm.occupation}
                    onChange={(e) => setDoctorForm({ ...doctorForm, occupation: e.target.value })}
                    placeholder="Cardiologist"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-experience">Experience Years</Label>
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
                    value={doctorForm.gender || "none"}
                    onValueChange={(value) =>
                      setDoctorForm({ ...doctorForm, gender: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger id="doctor-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
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
                    placeholder="MD, MBBS, Fellowship in Cardiology"
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
                  {doctor.photo && (
                    <p className="text-sm text-muted-foreground">Current photo: {doctor.photo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-license-card">License Card</Label>
                  <Input
                    id="doctor-license-card"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setLicenseCardFile(e.target.files?.[0] || null)}
                  />
                  {doctor.license_card && (
                    <p className="text-sm text-muted-foreground">
                      Current license card: {doctor.license_card}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/healthcare/doctors")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateDoctor.isPending || updateDoctorFile.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {updateDoctor.isPending || updateDoctorFile.isPending
                    ? "Updating..."
                    : "Update Doctor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
