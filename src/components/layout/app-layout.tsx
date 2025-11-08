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
      <Sidebar className="border-r border-sidebar-border/50">
        <SidebarHeader className="border-b border-secondary/30 bg-gradient-to-r from-sidebar-background to-sidebar-background/95 p-4">
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="Care App" 
              className="h-12 w-auto object-contain"
            />
          </div>
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
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/medicines">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>Medicines</span>
                        </SidebarMenuSubButton>
                      )}
                    </NavLink>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <NavLink to="/healthcare/my-medicines">
                      {({ isActive }) => (
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <span>My Medicines</span>
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

        <SidebarFooter className="border-t border-secondary/30 bg-gradient-to-r from-sidebar-background/95 to-sidebar-background p-4">
          <div className="flex items-center justify-between w-full gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Logout"
              className="hover:bg-secondary/20 hover:text-secondary transition-all duration-200 hover-glow-green"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Navbar with gradient background */}
        <header className="sticky top-0 z-40 border-b border-secondary/20 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
          <div className="relative">
            {/* Enhanced gradient overlay with more green */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-transparent to-secondary/10 pointer-events-none" />
            
            <div className="relative flex h-16 items-center gap-4 px-4 sm:px-6">
              <SidebarTrigger className="hover-glow-green hover:text-secondary" />
              
              {/* Green gradient separator */}
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-secondary/40 to-transparent" />
              
              <div className="flex-1" />
              
              <div className="flex items-center gap-3">
                <ThemeToggle />
                
                {/* Green gradient separator */}
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-secondary/40 to-transparent" />
                
                <div className="flex items-center gap-3 pl-2">
                  <div className="relative">
                    <Avatar className="h-9 w-9 ring-2 ring-secondary/30 transition-all duration-200 hover:ring-secondary/60">
                      <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/80 text-white font-semibold">
                        {user?.name?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {/* Enhanced online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-secondary border-2 border-background animate-glow-pulse shadow-lg shadow-secondary/50" />
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{user?.name || "User"}</span>
                    <span className="text-xs text-secondary">{user?.email || ""}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area with subtle green background pattern */}
        <div className="relative min-h-[calc(100vh-4rem)]">
          {/* Enhanced green background pattern */}
          <div className="absolute inset-0 bg-care-subtle-green pointer-events-none" />
          
          <div className="relative container mx-auto p-6 animate-fade-in">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

