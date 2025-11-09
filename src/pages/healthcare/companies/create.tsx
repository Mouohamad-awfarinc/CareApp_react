import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useCreateCompany } from "@/hooks/use-healthcare"
import type { CreateCompanyRequest } from "@/types"
import { CountryDropdown, RegionDropdown } from "react-country-region-selector"

export function CreateCompany() {
  const navigate = useNavigate()
  const createCompany = useCreateCompany()

  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    mobile: "",
    website: "",
    description: "",
    country: "",
    city: "",
    district: "",
    area: "",
    address: "",
    longitude: "",
    latitude: "",
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError("")

      const requestData: CreateCompanyRequest = {
        ...companyForm,
        phone: companyForm.phone || null,
        mobile: companyForm.mobile || null,
        website: companyForm.website || null,
        description: companyForm.description || null,
        country: companyForm.country || null,
        city: companyForm.city || null,
        district: companyForm.district || null,
        area: companyForm.area || null,
        address: companyForm.address || null,
        longitude: companyForm.longitude || null,
        latitude: companyForm.latitude || null,
      }

      if (logoFile) {
        requestData.logo = logoFile
      }

      await createCompany.mutateAsync(requestData)
      navigate("/healthcare/companies")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create company"
      setError(errorMessage)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/healthcare/companies")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Company</h1>
            <p className="text-muted-foreground">Add a new healthcare company to the system</p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Enter the details of the new company. Fields marked with * are required.
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
                  <Label htmlFor="company-name">Name *</Label>
                  <Input
                    id="company-name"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="ABC Healthcare Group"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email *</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    placeholder="contact@company.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-mobile">Mobile</Label>
                  <Input
                    id="company-mobile"
                    value={companyForm.mobile}
                    onChange={(e) => setCompanyForm({ ...companyForm, mobile: e.target.value })}
                    placeholder="+1234567891"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    placeholder="https://www.company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-country">Country</Label>
                  <div className="w-full">
                    <CountryDropdown
                      value={companyForm.country}
                      onChange={(val) => setCompanyForm({ ...companyForm, country: val })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-city">City</Label>
                  <div className="w-full">
                    <RegionDropdown
                      country={companyForm.country}
                      value={companyForm.city}
                      onChange={(val) => setCompanyForm({ ...companyForm, city: val })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-district">District</Label>
                  <Input
                    id="company-district"
                    value={companyForm.district}
                    onChange={(e) => setCompanyForm({ ...companyForm, district: e.target.value })}
                    placeholder="Manhattan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-area">Area</Label>
                  <Input
                    id="company-area"
                    value={companyForm.area}
                    onChange={(e) => setCompanyForm({ ...companyForm, area: e.target.value })}
                    placeholder="Midtown"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Input
                    id="company-address"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    placeholder="123 Business St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-longitude">Longitude</Label>
                  <Input
                    id="company-longitude"
                    value={companyForm.longitude}
                    onChange={(e) => setCompanyForm({ ...companyForm, longitude: e.target.value })}
                    placeholder="-74.0060"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-latitude">Latitude</Label>
                  <Input
                    id="company-latitude"
                    value={companyForm.latitude}
                    onChange={(e) => setCompanyForm({ ...companyForm, latitude: e.target.value })}
                    placeholder="40.7128"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company-description">Description</Label>
                  <Textarea
                    id="company-description"
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    placeholder="Brief description of the company..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company-logo">Logo</Label>
                  <Input
                    id="company-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/healthcare/companies")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCompany.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {createCompany.isPending ? "Creating..." : "Create Company"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}