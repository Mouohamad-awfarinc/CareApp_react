import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Activity, 
  ClipboardList,
  TrendingUp,
  Heart,
  Calendar,
  Stethoscope
} from "lucide-react"

export function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header with gradient text */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gradient-mixed animate-slide-up">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome to your Care App admin panel — Healthcare made easy
          </p>
        </div>

        {/* Stats Grid with Care App branding */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          <Card className="accent-line-green overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[3rem] transition-all duration-300 group-hover:w-24 group-hover:h-24" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total Patients
              </CardTitle>
              <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-primary">1,284</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-secondary" />
                <span className="text-secondary font-medium">+12.5%</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="accent-line-green overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-[3rem] transition-all duration-300 group-hover:w-24 group-hover:h-24" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Appointments Today
              </CardTitle>
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                <Calendar className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-secondary">42</div>
              <div className="flex items-center gap-1 text-xs">
                <Activity className="h-3 w-3 text-secondary" />
                <span className="text-secondary font-medium">8 pending</span>
                <span className="text-muted-foreground">waiting confirmation</span>
              </div>
            </CardContent>
          </Card>

          <Card className="accent-line-green overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[3rem] transition-all duration-300 group-hover:w-24 group-hover:h-24" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Active Doctors
              </CardTitle>
              <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Stethoscope className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-primary">127</div>
              <div className="flex items-center gap-1 text-xs">
                <Heart className="h-3 w-3 text-destructive animate-pulse" />
                <span className="text-secondary font-medium">98% available</span>
                <span className="text-muted-foreground">online now</span>
              </div>
            </CardContent>
          </Card>

          <Card className="accent-line-green overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-[3rem] transition-all duration-300 group-hover:w-24 group-hover:h-24" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Completed Visits
              </CardTitle>
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                <ClipboardList className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-secondary">856</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-secondary" />
                <span className="text-secondary font-medium">+8.2%</span>
                <span className="text-muted-foreground">this week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full lg:col-span-2 hover-glow-green">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <Activity className="h-5 w-5" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "appointment", patient: "John Doe", doctor: "Dr. Smith", time: "10:30 AM" },
                  { type: "prescription", patient: "Jane Smith", doctor: "Dr. Johnson", time: "11:15 AM" },
                  { type: "lab", patient: "Mike Wilson", doctor: "Dr. Brown", time: "12:00 PM" },
                ].map((activity, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-accent/30 to-transparent border border-border/50 hover:border-secondary/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-secondary animate-glow-pulse" />
                      <div>
                        <p className="font-semibold text-sm">{activity.patient}</p>
                        <p className="text-xs text-muted-foreground">with {activity.doctor}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-glow-green">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground">
                  <Heart className="h-5 w-5" />
                </div>
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "API Health", status: "Operational", color: "secondary" },
                  { name: "Database", status: "Operational", color: "secondary" },
                  { name: "Services", status: "All Active", color: "secondary" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="success-badge">{item.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

