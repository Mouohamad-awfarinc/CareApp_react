import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
  useCreateUser,
} from "@/hooks/use-users"
import {
  useRoles,
} from "@/hooks/use-rbac"
import type { CreateUserRequest } from "@/types"

export function CreateReceptionist() {
  const navigate = useNavigate()
  const createUser = useCreateUser()

  // Get receptionist role
  const [rolesPage] = useState(1)
  const { data: rolesData } = useRoles(rolesPage)
  const roles = rolesData?.data || []
  const receptionistRole = roles.find(role => role.name === 'reception')

  // Form states
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    status: "active",
    role_id: receptionistRole?.id,
    clinic_id: "",
  })
  const [error, setError] = useState("")

  const handleSubmitReceptionist = async () => {
    try {
      setError("")
      // Validate required fields
      if (!userForm.name || !userForm.email || !userForm.password || !userForm.password_confirmation) {
        setError("Name, email, password, and password confirmation are required")
        return
      }
      if (userForm.password !== userForm.password_confirmation) {
        setError("Password and password confirmation do not match")
        return
      }
      if (!userForm.clinic_id) {
        setError("Clinic selection is required")
        return
      }

      // Build request data
      const requestData: CreateUserRequest = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        password_confirmation: userForm.password_confirmation,
        status: userForm.status as "active" | "inactive",
        role_id: userForm.role_id,
        ...(userForm.phone && { phone: userForm.phone }),
        clinic_ids: [parseInt(userForm.clinic_id)], // Convert single clinic_id to array for backend
      }

      await createUser.mutateAsync(requestData)
      navigate('/users')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create receptionist"
      setError(errorMessage)
    }
  }

  // Function to fetch clinics for searchable select
  const fetchClinics = async (search: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
      const response = await fetch(`${API_BASE_URL}/healthcare/clinics?search=${encodeURIComponent(search)}&per_page=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch clinics')
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching clinics:', error)
      return []
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/users')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <div className="accent-line-green" />
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Create Receptionist</h1>
            <p className="text-muted-foreground mt-1">
              Add a new receptionist user and assign them to clinics
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Receptionist Information</CardTitle>
            <CardDescription>
              Fill in the details to create a new receptionist user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Name *</Label>
                <Input
                  id="user-name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Password *</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password-confirmation">Confirm Password *</Label>
                <Input
                  id="user-password-confirmation"
                  type="password"
                  value={userForm.password_confirmation}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password_confirmation: e.target.value })
                  }
                  placeholder="Confirm password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-phone">Phone</Label>
                <Input
                  id="user-phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              {/* Clinic Assignment */}
              <div className="space-y-2">
                <Label>Assign Clinic *</Label>
                <SearchableSelect
                  placeholder="Search and select a clinic..."
                  value={userForm.clinic_id}
                  onSelect={(value) => setUserForm({ ...userForm, clinic_id: value })}
                  fetchData={fetchClinics}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => navigate('/users')}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReceptionist}
                disabled={createUser.isPending}
              >
                {createUser.isPending ? "Creating..." : "Create Receptionist"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}