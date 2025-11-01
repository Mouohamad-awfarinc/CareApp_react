import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Home, LogIn } from "lucide-react"

export function Unauthorized() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-24 w-24 text-destructive" />
          </div>
          <CardTitle className="text-4xl font-bold">401</CardTitle>
          <CardDescription className="text-lg mt-2">
            Unauthorized Access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your session has expired or you don't have permission to access this resource.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleLogout} variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              Login Again
            </Button>
            <Link to="/dashboard">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

