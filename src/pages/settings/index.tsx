import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Shield, Key, Settings2 } from "lucide-react"
import {
  useRoles,
  useDeleteRole,
  usePermissions,
} from "@/hooks/use-rbac"

export function Settings() {
  const navigate = useNavigate()
  
  // Roles
  const [rolesPage] = useState(1)
  const { data: rolesData, isLoading: loadingRoles } = useRoles(rolesPage)
  const deleteRole = useDeleteRole()

  // Permissions
  const [permissionsPage] = useState(1)
  const { data: permissionsData, isLoading: loadingPermissions } = usePermissions(permissionsPage)

  const handleDeleteRole = async (id: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete role"
        alert(errorMessage)
      }
    }
  }

  const roles = rolesData?.data || []
  const permissions = permissionsData?.data || []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="relative">
          <div className="accent-line-green" />
          <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Settings & Access Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage roles, permissions, and access control across the platform
          </p>
        </div>

        {/* Roles Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Roles
                </CardTitle>
                <CardDescription>Manage user roles and their permissions</CardDescription>
              </div>
              <Button onClick={() => navigate('/settings/roles/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingRoles ? (
              <div className="text-center py-8 text-muted-foreground">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No roles found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || "—"}
                      </TableCell>
                      <TableCell>{role.permissions?.length || 0} permissions</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/settings/roles/${role.id}/assign-permissions`)}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/settings/roles/${role.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Permissions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Permissions
                </CardTitle>
                <CardDescription>Manage system permissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPermissions ? (
              <div className="text-center py-8 text-muted-foreground">Loading permissions...</div>
            ) : permissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No permissions found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {permission.module || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {permission.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
