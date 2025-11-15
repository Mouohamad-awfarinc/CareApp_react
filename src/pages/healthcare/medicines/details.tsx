import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Pill } from "lucide-react"
import { useMedicine } from "@/hooks/use-healthcare"

export function MedicineDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const medicineId = parseInt(id || "0")

  const { data: medicine, isLoading } = useMedicine(medicineId)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading medicine details...</p>
        </div>
      </AppLayout>
    )
  }

  if (!medicine) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Medicine not found</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/healthcare/medicines")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{medicine.name}</h1>
              <p className="text-muted-foreground">Medicine details and information</p>
            </div>
          </div>
          <div className="ml-auto">
            <Button onClick={() => navigate(`/healthcare/medicines/${medicine.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Medicine
            </Button>
          </div>
        </div>

        {/* Medicine Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core medicine details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm font-semibold">{medicine.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={medicine.is_active ? "default" : "secondary"}>
                    {medicine.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dosage Form</p>
                  <p className="text-sm">{medicine.dosage_form || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Strength</p>
                  <p className="text-sm">{medicine.strength || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                  <p className="text-sm">{medicine.manufacturer || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Ingredient</p>
                  {medicine.active_ingredient ? (
                    <Badge variant="secondary">{medicine.active_ingredient}</Badge>
                  ) : (
                    <p className="text-sm">—</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>Additional medicine information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {medicine.description || "No description available"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Default Serving Instructions */}
        {(medicine.default_serving_times?.length || medicine.default_duration || medicine.default_quantity) && (
          <Card>
            <CardHeader>
              <CardTitle>Default Serving Instructions</CardTitle>
              <CardDescription>Recommended usage guidelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serving Times</p>
                  <p className="text-sm">
                    {medicine.default_serving_times?.length ? medicine.default_serving_times.join(", ") : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="text-sm">{medicine.default_duration || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity per Serving</p>
                  <p className="text-sm">{medicine.default_quantity || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Metadata and timestamps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">
                  {medicine.created_at ? new Date(medicine.created_at).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">
                  {medicine.updated_at ? new Date(medicine.updated_at).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm font-mono">{medicine.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}