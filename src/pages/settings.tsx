import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Shield, Key, AlertCircle, Settings2, Search } from "lucide-react"
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissions,
  useAssignPermissionsToRole,
} from "@/hooks/use-rbac"
import type { Role } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export function Settings() {
  // Roles
  const [rolesPage] = useState(1)
  const { data: rolesData, isLoading: loadingRoles } = useRoles(rolesPage)
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const assignPermissionsToRole = useAssignPermissionsToRole()

  // Permissions
  const [permissionsPage] = useState(1)
  const { data: permissionsData, isLoading: loadingPermissions } = usePermissions(permissionsPage)

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [permissionAssignDialogOpen, setPermissionAssignDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleToAssign, setRoleToAssign] = useState<Role | null>(null)
  
  // Form states
  const [roleForm, setRoleForm] = useState({ name: "", description: "" })
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [permissionSearch, setPermissionSearch] = useState("")
  const [error, setError] = useState("")

  const handleOpenRoleDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setRoleForm({ name: role.name, description: role.description || "" })
    } else {
      setEditingRole(null)
      setRoleForm({ name: "", description: "" })
    }
    setError("")
    setRoleDialogOpen(true)
  }

  const handleSubmitRole = async () => {
    try {
      setError("")
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, data: roleForm })
      } else {
        await createRole.mutateAsync(roleForm)
      }
      setRoleDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save role"
      setError(errorMessage)
    }
  }

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
  
  // Filter permissions by search
  const filteredPermissions = permissions.filter((permission) => {
    const searchLower = permissionSearch.toLowerCase()
    return (
      permission.name.toLowerCase().includes(searchLower) ||
      permission.module?.toLowerCase().includes(searchLower) ||
      permission.description?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage roles, permissions, and access control
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
              <Button onClick={() => handleOpenRoleDialog()}>
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
                            onClick={() => {
                              setRoleToAssign(role)
                              setSelectedPermissions(role.permissions?.map(p => p.id) || [])
                              setPermissionSearch("")
                              setPermissionAssignDialogOpen(true)
                            }}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenRoleDialog(role)}
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

        {/* Role Dialog */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
              <DialogDescription>
                {editingRole
                  ? "Update role information"
                  : "Create a new role for your system"}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRole}
                disabled={createRole.isPending || updateRole.isPending}
              >
                {createRole.isPending || updateRole.isPending
                  ? "Saving..."
                  : editingRole
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Permissions to Role Dialog */}
        <Dialog open={permissionAssignDialogOpen} onOpenChange={setPermissionAssignDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Assign Permissions</DialogTitle>
              <DialogDescription>
                Select permissions for role: <strong>{roleToAssign?.name}</strong>
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingPermissions ? (
                <div className="text-center py-8 text-muted-foreground">Loading permissions...</div>
              ) : filteredPermissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No permissions found</div>
              ) : (
                <div className="space-y-2">
                  {filteredPermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setSelectedPermissions((prev) =>
                          prev.includes(permission.id)
                            ? prev.filter((id) => id !== permission.id)
                            : [...prev, permission.id]
                        )
                      }}
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          setSelectedPermissions((prev) =>
                            checked
                              ? [...prev, permission.id]
                              : prev.filter((id) => id !== permission.id)
                          )
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{permission.name}</div>
                        {permission.description && (
                          <div className="text-sm text-muted-foreground">
                            {permission.description}
                          </div>
                        )}
                        {permission.module && (
                          <Badge variant="secondary" className="mt-1">
                            {permission.module}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPermissionAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setError("")
                    if (!roleToAssign) return
                    await assignPermissionsToRole.mutateAsync({
                      id: roleToAssign.id,
                      data: { permissions: selectedPermissions },
                    })
                    setPermissionAssignDialogOpen(false)
                  } catch (err) {
                    const errorMessage =
                      err instanceof Error ? err.message : "Failed to assign permissions"
                    setError(errorMessage)
                  }
                }}
                disabled={assignPermissionsToRole.isPending || !roleToAssign}
              >
                {assignPermissionsToRole.isPending ? "Assigning..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

