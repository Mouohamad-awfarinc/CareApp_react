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
  Edit,
} from "lucide-react"
import {
  useUsers,
  useDeleteUser,
} from "@/hooks/use-users"
import {
  useRoles,
} from "@/hooks/use-rbac"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"

export function Users() {
  const navigate = useNavigate()
  
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
  const deleteUser = useDeleteUser()

  // RBAC
  const [rolesPage] = useState(1)
  const { data: rolesData } = useRoles(rolesPage)

  const users = usersData?.data || []
  const roles = rolesData?.data || []

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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <div className="accent-line-green" />
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Users Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your users and their permissions across the platform
            </p>
          </div>
          <Button onClick={() => navigate('/users/create')} className="shadow-lg hover:shadow-secondary/20">
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
                              onClick={() => navigate(`/users/${user.id}/edit`)}
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/users/${user.id}/assign-role`)}
                              title="Assign Role"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/users/${user.id}/assign-permissions`)}
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
      </div>
    </AppLayout>
  )
}
