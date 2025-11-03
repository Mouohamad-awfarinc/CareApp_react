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
import { AlertCircle, ArrowLeft } from "lucide-react"
import {
  useCreateUser,
} from "@/hooks/use-users"
import {
  useRoles,
} from "@/hooks/use-rbac"
import type { CreateUserRequest } from "@/types"

export function CreateUser() {
  const navigate = useNavigate()
  const createUser = useCreateUser()

  // RBAC
  const [rolesPage] = useState(1)
  const { data: rolesData } = useRoles(rolesPage)
  const roles = rolesData?.data || []

  // Form states
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    status: "active",
    role_id: undefined as number | undefined,
  })
  const [error, setError] = useState("")

  const handleSubmitUser = async () => {
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
      
      // Build request data (only include optional fields if they have values)
      const requestData: CreateUserRequest = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        password_confirmation: userForm.password_confirmation,
        status: userForm.status as "active" | "inactive",
        ...(userForm.phone && { phone: userForm.phone }),
        ...(userForm.role_id && { role_id: userForm.role_id }),
      }
      
      await createUser.mutateAsync(requestData)
      navigate('/users')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save user"
      setError(errorMessage)
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
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Create User</h1>
            <p className="text-muted-foreground mt-1">
              Add a new user to the system
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Fill in the details to create a new user
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
              <div className="space-y-2">
                <Label htmlFor="user-status">Status</Label>
                <Select
                  value={userForm.status}
                  onValueChange={(value) => setUserForm({ ...userForm, status: value })}
                >
                  <SelectTrigger id="user-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role">Role</Label>
                <Select
                  value={userForm.role_id?.toString() || "none"}
                  onValueChange={(value) =>
                    setUserForm({ ...userForm, role_id: value === "none" ? undefined : Number(value) })
                  }
                >
                  <SelectTrigger id="user-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => navigate('/users')}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitUser}
                disabled={createUser.isPending}
              >
                {createUser.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
