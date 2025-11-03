import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useCreatePatient } from "@/hooks/use-healthcare"
import { useUsers } from "@/hooks/use-users"

export function CreatePatient() {
  const navigate = useNavigate()
  const createPatient = useCreatePatient()
  const { data: usersData } = useUsers(1, {})

  const users = usersData?.data || []

  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.gender) {
      setError("Please fill in all required fields")
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestData: any = {
        user_id: formData.user_id ? Number(formData.user_id) : undefined,
        name: formData.name,
        mobile: formData.mobile || null,
        email: formData.email || null,
        work_phone: formData.work_phone || null,
        home_phone: formData.home_phone || null,
        country: formData.country || null,
        city: formData.city || null,
        district: formData.district || null,
        area: formData.area || null,
        address: formData.address || null,
        gender: formData.gender,
        national_id: formData.national_id || null,
        birth_date: formData.birth_date || null,
        title: formData.title || null,
        occupation: formData.occupation || null,
        height: formData.height || null,
        weight: formData.weight || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_mobile: formData.emergency_contact_mobile || null,
        longitude: formData.longitude || null,
        latitude: formData.latitude || null,
        photo: photoFile || undefined,
      }

      await createPatient.mutateAsync(requestData)
      navigate("/healthcare/patients")
    } catch (err) {
      setError("Failed to create patient")
      console.error(err)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/healthcare/patients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Patient</h1>
            <p className="text-muted-foreground">Add a new patient to the system</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Enter patient details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* User Selection (Optional) */}
              <div className="grid gap-2">
                <Label htmlFor="user_id">User Account (Optional)</Label>
                <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
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

              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="work_phone">Work Phone</Label>
                  <Input
                    id="work_phone"
                    value={formData.work_phone}
                    onChange={(e) => setFormData({ ...formData, work_phone: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="home_phone">Home Phone</Label>
                  <Input
                    id="home_phone"
                    value={formData.home_phone}
                    onChange={(e) => setFormData({ ...formData, home_phone: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="national_id">National ID</Label>
                  <Input
                    id="national_id"
                    value={formData.national_id}
                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  />
                </div>
              </div>

              {/* Address Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Medical Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emergency_contact_mobile">Emergency Contact Mobile</Label>
                  <Input
                    id="emergency_contact_mobile"
                    value={formData.emergency_contact_mobile}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_mobile: e.target.value })}
                  />
                </div>
              </div>

              {/* Location Coordinates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="grid gap-2">
                <Label htmlFor="photo">Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/healthcare/patients")}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPatient.isPending}>
              {createPatient.isPending ? "Creating..." : "Create Patient"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
