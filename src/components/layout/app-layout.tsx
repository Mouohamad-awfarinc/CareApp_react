import { type ReactNode, useState } from "react"
import {
  SidebarProvider,
  SidebarInset,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Stethoscope,
  ChevronDown,
} from "lucide-react"
import { NavLink } from "react-router-dom"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { logout, user } = useAuth()
  const [isHealthcareOpen, setIsHealthcareOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-bold">Care App Admin</h2>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink to="/dashboard">
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive}>
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <NavLink to="/users">
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive}>
                      <Users />
                      <span>Users</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <Collapsible
              open={isHealthcareOpen}
              onOpenChange={setIsHealthcareOpen}
              className="group/collapsible"
            >
              <SidebarMenu>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Healthcare">
                      <Stethoscope />
                      <span>Healthcare</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
              </SidebarMenu>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/specialties">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>Specialties</span>
                        </SidebarMenuSubButton>
                      )}
                    </NavLink>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/clinics">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>Clinics</span>
                        </SidebarMenuSubButton>
                      )}
                    </NavLink>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/doctors">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>Doctors</span>
                        </SidebarMenuSubButton>
                      )}
                    </NavLink>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/patients">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>Patients</span>
                        </SidebarMenuSubButton>
                      )}
                    </NavLink>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/appointments">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>Appointments</span>
                        </SidebarMenuSubButton>
                      )}
                    </NavLink>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/visits">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>Visits</span>
                        </SidebarMenuSubButton>
                      )}
                    </NavLink>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/prescriptions">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>Prescriptions</span>
                        </SidebarMenuSubButton>
                      )}
                    </NavLink>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/lab-tests">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>Lab Tests</span>
                        </SidebarMenuSubButton>
                      )}
                    </NavLink>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink to="/settings">
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive}>
                      <Settings />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center justify-between w-full">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Navbar */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="flex items-center gap-2 ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-medium">{user?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email || ""}</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

