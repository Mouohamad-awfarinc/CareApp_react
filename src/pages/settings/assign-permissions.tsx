import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowLeft, Search, ChevronDown, FolderOpen } from "lucide-react"
import { useRoles, usePermissions, useAssignPermissionsToRole } from "@/hooks/use-rbac"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function AssignPermissionsToRole() {
  const navigate = useNavigate()
  const { roleId } = useParams<{ roleId: string }>()
  
  const { data: rolesData } = useRoles(1)
  const [permissionsPage] = useState(1)
  const { data: permissionsData } = usePermissions(permissionsPage)
  const assignPermissionsToRole = useAssignPermissionsToRole()

  const role = rolesData?.data?.find(r => r.id === Number(roleId))
  const permissions = permissionsData?.data || []

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [permissionSearch, setPermissionSearch] = useState("")
  const [error, setError] = useState("")
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (role?.permissions) {
      setSelectedPermissions(role.permissions.map(p => p.id))
    }
  }, [role])

  // Filter permissions by search
  const filteredPermissions = permissions.filter((permission) => {
    const searchLower = permissionSearch.toLowerCase()
    return (
      permission.name.toLowerCase().includes(searchLower) ||
      permission.module?.toLowerCase().includes(searchLower) ||
      permission.description?.toLowerCase().includes(searchLower)
    )
  })

  // Group permissions by module
  const groupPermissionsByModule = (permissions: typeof filteredPermissions) => {
    const grouped: Record<string, typeof filteredPermissions> = {}
    
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
      if (!roleId) return
      await assignPermissionsToRole.mutateAsync({
        id: Number(roleId),
        data: { permissions: selectedPermissions },
      })
      navigate('/settings')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign permissions"
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

  const groupedPermissions = groupPermissionsByModule(filteredPermissions)

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
            <h1 className="text-3xl font-bold tracking-tight text-gradient-mixed">Assign Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Select permissions for role: <strong>{role.name}</strong>
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permission Assignment</CardTitle>
            <CardDescription>
              Select which permissions this role should have
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {filteredPermissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No permissions found</div>
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
                        {modulePermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer ml-8 border-l-2 border-muted"
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
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => navigate('/settings')}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={assignPermissionsToRole.isPending || !role}
              >
                {assignPermissionsToRole.isPending ? "Assigning..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
