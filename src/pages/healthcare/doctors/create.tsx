import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
import { useCreateDoctor, useSpecialties } from "@/hooks/use-healthcare"
import type { CreateDoctorRequest } from "@/types"

export function CreateDoctor() {
  const navigate = useNavigate()
  const createDoctor = useCreateDoctor()

  // Fetch specialties
  const [specialtiesPage] = useState(1)
  const { data: specialtiesData } = useSpecialties(specialtiesPage)

  const specialties = specialtiesData?.data || []

  const [doctorForm, setDoctorForm] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    user_password: "",
    specialty_id: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError("")
      const qualificationsArray = doctorForm.qualifications
        .split(",")
        .map((q) => q.trim())
        .filter(Boolean)

      const requestData: CreateDoctorRequest = {
        user_name: doctorForm.user_name,
        user_email: doctorForm.user_email,
        user_phone: doctorForm.user_phone || null,
        user_password: doctorForm.user_password,
        specialty_id: Number(doctorForm.specialty_id),
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
      navigate("/healthcare/doctors")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create doctor"
      setError(errorMessage)
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Create Doctor</h1>
            <p className="text-muted-foreground">Add a new doctor to the system</p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
            <CardDescription>
              Enter the details of the new doctor. Fields marked with * are required.
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
                  <Label htmlFor="user-name">User Name *</Label>
                  <Input
                    id="user-name"
                    value={doctorForm.user_name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, user_name: e.target.value })}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">User Email *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={doctorForm.user_email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, user_email: e.target.value })}
                    placeholder="john.smith@clinic.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-phone">User Phone</Label>
                  <Input
                    id="user-phone"
                    value={doctorForm.user_phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, user_phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">User Password *</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={doctorForm.user_password}
                    onChange={(e) => setDoctorForm({ ...doctorForm, user_password: e.target.value })}
                    placeholder="Enter password"
                    required
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-license-card">License Card *</Label>
                  <Input
                    id="doctor-license-card"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setLicenseCardFile(e.target.files?.[0] || null)}
                    required
                  />
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
                  disabled={createDoctor.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {createDoctor.isPending ? "Creating..." : "Create Doctor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
