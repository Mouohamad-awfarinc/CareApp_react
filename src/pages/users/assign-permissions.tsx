import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, ChevronDown, FolderOpen } from "lucide-react"
import {
  useUsers,
} from "@/hooks/use-users"
import {
  usePermissions,
  useAssignPermissionsToUser,
} from "@/hooks/use-rbac"
import type { Permission } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function AssignPermissions() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  
  const { data: usersData } = useUsers(1, {})
  const [permissionsPage] = useState(1)
  const { data: permissionsData } = usePermissions(permissionsPage)
  const assignPermissionsToUser = useAssignPermissionsToUser()

  const permissions = permissionsData?.data || []
  const user = usersData?.data?.find(u => u.id === Number(userId))

  const [selectedUserPermissions, setSelectedUserPermissions] = useState<
    Array<{ id: number; allowed: boolean }>
  >([])
  const [error, setError] = useState("")
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user?.permissions) {
      const userPerms = user.permissions.map((p) => ({
        id: p.id,
        allowed: p.pivot?.allowed !== false,
      }))
      setSelectedUserPermissions(userPerms)
    }
  }, [user])

  // Get permissions that are NOT in the user's role
  const getNonRolePermissions = (): Permission[] => {
    if (!user) return []
    if (!user.role || !user.role.permissions) {
      return permissions
    }
    const rolePermissionIds = user.role.permissions.map((p) => p.id)
    return permissions.filter((p) => !rolePermissionIds.includes(p.id))
  }

  // Group permissions by module
  const groupPermissionsByModule = (permissions: Permission[]) => {
    const grouped: Record<string, Permission[]> = {}
    
    permissions.forEach((permission) => {
      const module = permission.module || 'General'
      if (!grouped[module]) {
        grouped[module] = []
      }
      grouped[module].push(permission)
    })
    
    return grouped
  }

  const toggleModule = (module: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(module)) {
        newSet.delete(module)
      } else {
        newSet.add(module)
      }
      return newSet
    })
  }

  const handleSubmit = async () => {
    try {
      setError("")
      if (!userId) return
      await assignPermissionsToUser.mutateAsync({
        userId: Number(userId),
        data: { permissions: selectedUserPermissions },
      })
      navigate('/users')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to assign permissions"
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

  const nonRolePermissions = getNonRolePermissions()
  const groupedPermissions = groupPermissionsByModule(nonRolePermissions)

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
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Assign Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Assign permissions to: <strong>{user.name}</strong>
            </p>
            {user.role && (
              <p className="text-xs text-muted-foreground mt-1">
                Note: Permissions already granted by role "{user.role.name}" are not shown
              </p>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permission Assignment</CardTitle>
            <CardDescription>
              Select additional permissions for this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              {nonRolePermissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  All permissions are already granted by the user's role
                </div>
              ) : (
                Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <Collapsible
                    key={module}
                    open={expandedModules.has(module)}
                    onOpenChange={() => toggleModule(module)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-lg">{module}</h3>
                            <p className="text-sm text-muted-foreground">
                              {modulePermissions.length} permission{modulePermissions.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {modulePermissions.map((permission) => {
                        const userPermission = selectedUserPermissions.find(
                          (up) => up.id === permission.id
                        )
                        const isAllowed = userPermission?.allowed || false
                        const isChecked = userPermission !== undefined

                        return (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer ml-8 border-l-2 border-muted"
                            onClick={() => {
                              setSelectedUserPermissions((prev) => {
                                if (isChecked && isAllowed) {
                                  return prev.filter((up) => up.id !== permission.id)
                                } else {
                                  const filtered = prev.filter((up) => up.id !== permission.id)
                                  return [...filtered, { id: permission.id, allowed: true }]
                                }
                              })
                            }}
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
                            </div>
                          </div>
                        )
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))
              )}

            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => navigate('/users')}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={assignPermissionsToUser.isPending || !user}
              >
                {assignPermissionsToUser.isPending ? "Assigning..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
