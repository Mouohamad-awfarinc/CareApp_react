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
import { AlertCircle, ArrowLeft } from "lucide-react"
import {
  useUsers,
  useUpdateUser,
} from "@/hooks/use-users"
import {
  useRoles,
} from "@/hooks/use-rbac"
import type { UpdateUserRequest } from "@/types"

export function EditUser() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const updateUser = useUpdateUser()

  const { data: usersData } = useUsers(1, {})
  const user = usersData?.data?.find(u => u.id === Number(userId))

  // RBAC
  const [rolesPage] = useState(1)
  const { data: rolesData } = useRoles(rolesPage)
  const roles = rolesData?.data || []

  // Form states
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    role_id: undefined as number | undefined,
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setUserForm({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        status: user.status || "active",
        role_id: user.role?.id,
      })
    }
  }, [user])

  const handleSubmitUser = async () => {
    try {
      setError("")
      if (!userId) return
      
      // Validate required fields
      if (!userForm.name || !userForm.email) {
        setError("Name and email are required")
        return
      }
      
      // Build request data - UpdateUserRequest only supports email and name
      const requestData: UpdateUserRequest = {
        name: userForm.name,
        email: userForm.email,
      }
      
      await updateUser.mutateAsync({ id: Number(userId), data: requestData })
      navigate('/users')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user"
      setError(errorMessage)
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-muted-foreground">User not found</div>
      </AppLayout>
    )
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
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Edit User</h1>
            <p className="text-muted-foreground mt-1">
              Update user information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Update the details for this user
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
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? "Updating..." : "Update User"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
