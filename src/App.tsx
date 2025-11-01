import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryProvider } from "./providers/query-provider"
import { ProtectedRoute } from "./components/protected-route"
import { Dashboard } from "./pages/dashboard"
import { Login } from "./pages/login"
import { Register } from "./pages/register"
import { NotFound } from "./pages/not-found"
import { Unauthorized } from "./pages/unauthorized"
import { Users } from "./pages/users"
import { Settings } from "./pages/settings"
import { Specialties } from "./pages/healthcare/specialties"
import { Clinics } from "./pages/healthcare/clinics"
import { Doctors } from "./pages/healthcare/doctors"
import { Patients } from "./pages/healthcare/patients"
import { Appointments } from "./pages/healthcare/appointments"
import { Visits } from "./pages/healthcare/visits"
import { Prescriptions } from "./pages/healthcare/prescriptions"
import { LabTests } from "./pages/healthcare/lab-tests"

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/specialties"
            element={
              <ProtectedRoute>
                <Specialties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/clinics"
            element={
              <ProtectedRoute>
                <Clinics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/doctors"
            element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/patients"
            element={
              <ProtectedRoute>
                <Patients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/appointments"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/visits"
            element={
              <ProtectedRoute>
                <Visits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/prescriptions"
            element={
              <ProtectedRoute>
                <Prescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/lab-tests"
            element={
              <ProtectedRoute>
                <LabTests />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App
