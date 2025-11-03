import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useRoles, useUpdateRole } from "@/hooks/use-rbac"

export function EditRole() {
  const navigate = useNavigate()
  const { roleId } = useParams<{ roleId: string }>()
  const { data: rolesData } = useRoles(1)
  const updateRole = useUpdateRole()

  const role = rolesData?.data?.find(r => r.id === Number(roleId))

  const [roleForm, setRoleForm] = useState({ name: "", description: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    if (role) {
      setRoleForm({ name: role.name, description: role.description || "" })
    }
  }, [role])

  const handleSubmitRole = async () => {
    try {
      setError("")
      if (!roleId) return
      await updateRole.mutateAsync({ id: Number(roleId), data: roleForm })
      navigate('/settings')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update role"
      setError(errorMessage)
    }
  }

  if (!role) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-muted-foreground">Role not found</div>
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
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <div className="accent-line-green" />
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Edit Role</h1>
            <p className="text-muted-foreground mt-1">
              Update role information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>
              Update the details for this role
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
                <Label htmlFor="role-name">Name</Label>
                <Input
                  id="role-name"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="admin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Input
                  id="role-description"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Administrator role with full access"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => navigate('/settings')}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRole}
                disabled={updateRole.isPending}
              >
                {updateRole.isPending ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
