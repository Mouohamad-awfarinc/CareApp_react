import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { AlertCircle, ArrowRight, Lock, Mail, User } from "lucide-react"

export function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState("")
  const { register, isLoading, registerError } = useAuth()

  useEffect(() => {
    if (registerError) {
      // Extract error message from axios error
      const errorMessage = 
        registerError instanceof Error 
          ? registerError.message 
          : "An error occurred during registration"
      setError(errorMessage)
    }
  }, [registerError])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    register({ name, email, password, password_confirmation: passwordConfirmation })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding with green gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary via-secondary/95 to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="mb-12 animate-fade-in">
            <img 
              src="/logo.png" 
              alt="Care App" 
              className="h-24 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          
          <div className="max-w-md text-center space-y-6 animate-slide-up">
            <h1 className="text-5xl font-bold leading-tight">
              Join
              <span className="block text-white drop-shadow-lg">Care App</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Healthcare Made Easy
            </p>
            <p className="text-white/80">
              Start managing your healthcare operations today with our powerful admin platform
            </p>
            
            {/* Decorative green glow elements */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="h-2 w-2 rounded-full bg-white animate-glow-pulse" />
              <div className="h-2 w-2 rounded-full bg-white animate-glow-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="h-2 w-2 rounded-full bg-white animate-glow-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-4 bg-background relative">
        <div className="absolute inset-0 bg-care-subtle-green pointer-events-none" />
        
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2">
          <img 
            src="/logo.png" 
            alt="Care App" 
            className="h-16 w-auto object-contain"
          />
        </div>
        
        <Card className="w-full max-w-md relative z-10 hover-glow-green border-secondary/20 mt-20 lg:mt-0">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent glow-green-sm" />
          
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-bold text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-base">
              Sign up to get started with Care App
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-slide-up">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-secondary" />
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-input rounded-xl bg-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-secondary" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-input rounded-xl bg-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-secondary" />
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-input rounded-xl bg-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  placeholder="Create a strong password"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password_confirmation" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-secondary" />
                  Confirm Password
                </label>
                <input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-input rounded-xl bg-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  placeholder="Confirm your password"
                />
              </div>

              <Button 
                type="submit" 
                variant="secondary"
                className="w-full h-12 text-base font-semibold group mt-6" 
                disabled={isLoading}
              >
                {isLoading ? (
                  "Creating Account..."
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-secondary hover:text-secondary/80 font-semibold hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    Sign In
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

