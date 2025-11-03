import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
} from "@/hooks/use-users"
import {
  useRoles,
  useAssignRoleToUser,
} from "@/hooks/use-rbac"

export function AssignRole() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  
  const { data: usersData } = useUsers(1, {})
  const [rolesPage] = useState(1)
  const { data: rolesData } = useRoles(rolesPage)
  const assignRoleToUser = useAssignRoleToUser()

  const roles = rolesData?.data || []
  const user = usersData?.data?.find(u => u.id === Number(userId))

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user?.role?.id) {
      setSelectedRoleId(user.role.id)
    }
  }, [user])

  const handleSubmit = async () => {
    try {
      setError("")
      if (!userId) return

      if (!selectedRoleId) {
        alert("Cannot remove role - please assign a different role")
        return
      }

      await assignRoleToUser.mutateAsync({
        userId: Number(userId),
        data: { role_id: selectedRoleId },
      })
      navigate('/users')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to assign role"
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
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Assign Role</h1>
            <p className="text-muted-foreground mt-1">
              Assign a role to: <strong>{user.name}</strong>
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Assignment</CardTitle>
            <CardDescription>
              Select a role for this user
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
                <Label>Role</Label>
                <Select
                  value={selectedRoleId?.toString() || "none"}
                  onValueChange={(value) =>
                    setSelectedRoleId(value === "none" ? null : Number(value))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name} - {role.description || ""}
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
                onClick={handleSubmit}
                disabled={assignRoleToUser.isPending || !user}
              >
                {assignRoleToUser.isPending ? "Assigning..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
