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
import { useClinic, useUpdateClinic, useUpdateClinicPhoto } from "@/hooks/use-healthcare"
import { CountryDropdown, RegionDropdown } from "react-country-region-selector"
import { LocationPickerWrapper } from "@/components/location-picker-wrapper"

export function EditClinic() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const clinicId = parseInt(id || "0")
  
  const { data: clinic, isLoading } = useClinic(clinicId)
  const updateClinic = useUpdateClinic()
  const updateClinicPhoto = useUpdateClinicPhoto()

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
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const handleLocationChange = (lat: number, lng: number) => {
    setClinicForm(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }))
  }

  // Populate form when clinic data is loaded
  useEffect(() => {
    if (clinic) {
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
      })
    }
  }, [clinic])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setError("")
      
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
      }
      
      await updateClinic.mutateAsync({ id: clinicId, data: requestData })
      
      // If photo is provided, update it separately
      if (photoFile) {
        await updateClinicPhoto.mutateAsync({ id: clinicId, photo: photoFile })
      }
      
      navigate("/healthcare/clinics")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update clinic"
      setError(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading clinic...</p>
        </div>
      </AppLayout>
    )
  }

  if (!clinic) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Clinic not found</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/healthcare/clinics")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Clinic</h1>
            <p className="text-muted-foreground">Update clinic information</p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
            <CardDescription>
              Update the details of the clinic. Fields marked with * are required.
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
                  <Label htmlFor="clinic-name">Name *</Label>
                  <Input
                    id="clinic-name"
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                    placeholder="City Medical Center"
                    required
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
                    required
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
                      <SelectItem value="none">None</SelectItem>
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
                  <div className="w-full">
                    <CountryDropdown
                      value={clinicForm.country}
                      onChange={(val) => setClinicForm({ ...clinicForm, country: val })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-city">City</Label>
                  <div className="w-full">
                    <RegionDropdown
                      country={clinicForm.country}
                      value={clinicForm.city}
                      onChange={(val) => setClinicForm({ ...clinicForm, city: val })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
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
                <div className="space-y-2 md:col-span-2">
                  <Label>Location</Label>
                  <LocationPickerWrapper
                    latitude={clinicForm.latitude ? parseFloat(clinicForm.latitude) : undefined}
                    longitude={clinicForm.longitude ? parseFloat(clinicForm.longitude) : undefined}
                    onChange={handleLocationChange}
                    placeholder="Search for clinic location..."
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
                  {clinic.photo && (
                    <p className="text-sm text-muted-foreground">
                      Current photo: {clinic.photo}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/healthcare/clinics")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateClinic.isPending || updateClinicPhoto.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {updateClinic.isPending || updateClinicPhoto.isPending ? "Updating..." : "Update Clinic"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
