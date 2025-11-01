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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Trash2,
  Shield,
  Key,
  AlertCircle,
} from "lucide-react"
import {
  useUsers,
  useCreateUser,
  useDeleteUser,
} from "@/hooks/use-users"
import {
  useRoles,
  usePermissions,
  useAssignRoleToUser,
  useAssignPermissionsToUser,
} from "@/hooks/use-rbac"
import { useDebounce } from "@/hooks/use-debounce"
import type { User, Permission, CreateUserRequest } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"

export function Users() {
  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  // Build filters object for backend
  const filters = {
    search: debouncedSearch || undefined,
    role_id: roleFilter !== "all" && roleFilter !== "no-role" ? Number(roleFilter) : undefined,
    status: statusFilter !== "all" && statusFilter !== "no-status" ? statusFilter : undefined,
  }
  
  // Users
  const [usersPage, setUsersPage] = useState(1)
  const { data: usersData, isLoading: loadingUsers } = useUsers(usersPage, filters)
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

  // RBAC
  const [rolesPage] = useState(1)
  const { data: rolesData } = useRoles(rolesPage)
  const [permissionsPage] = useState(1)
  const { data: permissionsData } = usePermissions(permissionsPage)
  const assignRoleToUser = useAssignRoleToUser()
  const assignPermissionsToUser = useAssignPermissionsToUser()

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [roleAssignDialogOpen, setRoleAssignDialogOpen] = useState(false)
  const [permissionAssignDialogOpen, setPermissionAssignDialogOpen] = useState(false)
  const [userToAssign, setUserToAssign] = useState<User | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<
    Array<{ id: number; allowed: boolean }>
  >([])

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

  const users = usersData?.data || []
  const roles = rolesData?.data || []
  const permissions = permissionsData?.data || []

  // Get permissions that are NOT in the user's role
  const getNonRolePermissions = (user: User, allPermissions: Permission[]): Permission[] => {
    if (!user.role || !user.role.permissions) {
      return allPermissions
    }
    const rolePermissionIds = user.role.permissions.map((p) => p.id)
    return allPermissions.filter((p) => !rolePermissionIds.includes(p.id))
  }

  const handleOpenUserDialog = () => {
    setUserForm({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone: "",
      status: "active",
      role_id: undefined,
    })
    setError("")
    setUserDialogOpen(true)
  }

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
      setUserDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save user"
      setError(errorMessage)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete user"
        alert(errorMessage)
      }
    }
  }

  const handleOpenRoleAssignDialog = (user: User) => {
    setUserToAssign(user)
    setSelectedRoleId(user.role?.id || null)
    setRoleAssignDialogOpen(true)
  }

  const handleOpenPermissionAssignDialog = (user: User) => {
    setUserToAssign(user)
    const userPerms = user.permissions.map((p) => ({
      id: p.id,
      allowed: p.pivot?.allowed !== false,
    }))
    setSelectedUserPermissions(userPerms)
    setPermissionAssignDialogOpen(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage your users and their permissions
            </p>
          </div>
          <Button onClick={handleOpenUserDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              A list of all users in the system {usersData?.meta?.total ? `(${usersData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value)
                  setUsersPage(1) // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setUsersPage(1) // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingUsers ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role ? (
                            <Badge variant="secondary">{user.role.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">No role</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.permissions?.length > 0
                            ? `${user.permissions.length} permissions`
                            : "No permissions"}
                        </TableCell>
                        <TableCell>
                          {user.status ? (
                            <Badge variant={user.status === "active" ? "default" : "secondary"}>
                              {user.status}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenRoleAssignDialog(user)}
                              title="Assign Role"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenPermissionAssignDialog(user)}
                              title="Assign Permissions"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {usersData?.meta && (
                  <Pagination
                    currentPage={usersData.meta.current_page}
                    lastPage={usersData.meta.last_page}
                    onPageChange={setUsersPage}
                    total={usersData.meta.total}
                    from={usersData.meta.from || undefined}
                    to={usersData.meta.to || undefined}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Assign Role to User Dialog */}
        <Dialog open={roleAssignDialogOpen} onOpenChange={setRoleAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
              <DialogDescription>
                Select a role for user: <strong>{userToAssign?.name}</strong>
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setError("")
                    if (!userToAssign) return

                    if (!selectedRoleId) {
                      alert("Cannot remove role - please assign a different role")
                      return
                    }

                    await assignRoleToUser.mutateAsync({
                      userId: userToAssign.id,
                      data: { role_id: selectedRoleId },
                    })
                    setRoleAssignDialogOpen(false)
                  } catch (err) {
                    const errorMessage =
                      err instanceof Error ? err.message : "Failed to assign role"
                    setError(errorMessage)
                  }
                }}
                disabled={assignRoleToUser.isPending || !userToAssign}
              >
                {assignRoleToUser.isPending ? "Assigning..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Permissions to User Dialog */}
        <Dialog open={permissionAssignDialogOpen} onOpenChange={setPermissionAssignDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Assign Permissions</DialogTitle>
              <DialogDescription>
                Select permissions for user: <strong>{userToAssign?.name}</strong>
                {userToAssign?.role && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Note: Permissions already granted by role "{userToAssign.role.name}" are not shown
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
              {loadingUsers ? (
                <div className="text-center py-8 text-muted-foreground">Loading permissions...</div>
              ) : !userToAssign ? (
                <div className="text-center py-8 text-muted-foreground">No user selected</div>
              ) : getNonRolePermissions(userToAssign, permissions).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  All permissions are already granted by the user's role
                </div>
              ) : (
                <div className="space-y-2">
                  {getNonRolePermissions(userToAssign, permissions).map((permission) => {
                    const userPermission = selectedUserPermissions.find(
                      (up) => up.id === permission.id
                    )
                    const isAllowed = userPermission?.allowed || false
                    const isChecked = userPermission !== undefined

                    return (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent"
                      >
                        <Checkbox
                          checked={isChecked && isAllowed}
                          onCheckedChange={(checked) => {
                            setSelectedUserPermissions((prev) => {
                              if (checked) {
                                const filtered = prev.filter((up) => up.id !== permission.id)
                                return [...filtered, { id: permission.id, allowed: true }]
                              } else {
                                return prev.filter((up) => up.id !== permission.id)
                              }
                            })
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
                    )
                  })}
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
                    if (!userToAssign) return
                    await assignPermissionsToUser.mutateAsync({
                      userId: userToAssign.id,
                      data: { permissions: selectedUserPermissions },
                    })
                    setPermissionAssignDialogOpen(false)
                  } catch (err) {
                    const errorMessage =
                      err instanceof Error ? err.message : "Failed to assign permissions"
                    setError(errorMessage)
                  }
                }}
                disabled={assignPermissionsToUser.isPending || !userToAssign}
              >
                {assignPermissionsToUser.isPending ? "Assigning..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>
                Create a new user for your system
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
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
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitUser}
                disabled={createUser.isPending}
              >
                {createUser.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
