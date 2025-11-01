import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"

export function NotFound() {
  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <FileQuestion className="h-24 w-24 text-muted-foreground" />
            </div>
            <CardTitle className="text-4xl font-bold">404</CardTitle>
            <CardDescription className="text-lg mt-2">
              Page Not Found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/dashboard">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

