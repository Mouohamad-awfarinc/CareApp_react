import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryProvider } from "./providers/query-provider"
import { ProtectedRoute } from "./components/protected-route"
import { Dashboard } from "./pages/dashboard"
import { Login } from "./pages/login"
import { Register } from "./pages/register"
import { NotFound } from "./pages/not-found"
import { Unauthorized } from "./pages/unauthorized"
import { Users } from "./pages/users"
import { CreateUser } from "./pages/users/create"
import { EditUser } from "./pages/users/edit"
import { AssignRole } from "./pages/users/assign-role"
import { AssignPermissions } from "./pages/users/assign-permissions"
import { Settings } from "./pages/settings"
import { CreateRole } from "./pages/settings/create-role"
import { EditRole } from "./pages/settings/edit-role"
import { AssignPermissionsToRole } from "./pages/settings/assign-permissions"
import { Specialties } from "./pages/healthcare/specialties"
import { CreateSpecialty } from "./pages/healthcare/specialties/create"
import { EditSpecialty } from "./pages/healthcare/specialties/edit"
import { Clinics, CreateClinic, EditClinic, ClinicDetails } from "./pages/healthcare/clinics"
import { Companies, CreateCompany, EditCompany, CompanyDetails, AssignClinic } from "./pages/healthcare/companies/exports"
import { Doctors, CreateDoctor, EditDoctor, DoctorDetails, AssignClinics as AssignDoctorClinics, ManageSchedule, ReviewDoctors } from "./pages/healthcare/doctors"
import { Patients, CreatePatient, EditPatient, PatientDetails, UploadDocument } from "./pages/healthcare/patients"
import { Appointments, CreateAppointment, EditAppointment, CancelAppointment } from "./pages/healthcare/appointments"
import { LabTests, CreateLabTest, EditLabTest, ViewLabTestResults, UploadLabTestResults } from "./pages/healthcare/lab-tests"
import { Prescriptions, CreatePrescription, EditPrescription, ViewPrescription } from "./pages/healthcare/prescriptions"
import { Visits, CreateVisit, EditVisit, VisitDetails, CompleteVisit } from "./pages/healthcare/visits"
import { Medicines } from "./pages/healthcare/medicines/index"
import { CreateMedicine } from "./pages/healthcare/medicines/create"
import { MedicineDetails } from "./pages/healthcare/medicines/details"
import { EditMedicine } from "./pages/healthcare/medicines/edit"
import { DoctorPreferredMedicines } from "./pages/healthcare/doctors/preferred-medicines"
import { MyMedicines } from "./pages/healthcare/my-medicines"
import { Toaster } from "./components/ui/toaster"

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
            path="/users/create"
            element={
              <ProtectedRoute>
                <CreateUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId/edit"
            element={
              <ProtectedRoute>
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId/assign-role"
            element={
              <ProtectedRoute>
                <AssignRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId/assign-permissions"
            element={
              <ProtectedRoute>
                <AssignPermissions />
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
            path="/settings/roles/create"
            element={
              <ProtectedRoute>
                <CreateRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/roles/:roleId/edit"
            element={
              <ProtectedRoute>
                <EditRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/roles/:roleId/assign-permissions"
            element={
              <ProtectedRoute>
                <AssignPermissionsToRole />
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
            path="/healthcare/specialties/create"
            element={
              <ProtectedRoute>
                <CreateSpecialty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/specialties/:specialtyId/edit"
            element={
              <ProtectedRoute>
                <EditSpecialty />
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
            path="/healthcare/clinics/create"
            element={
              <ProtectedRoute>
                <CreateClinic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/clinics/:id/edit"
            element={
              <ProtectedRoute>
                <EditClinic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/clinics/:id/details"
            element={
              <ProtectedRoute>
                <ClinicDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/companies"
            element={
              <ProtectedRoute>
                <Companies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/companies/create"
            element={
              <ProtectedRoute>
                <CreateCompany />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/companies/:id/edit"
            element={
              <ProtectedRoute>
                <EditCompany />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/companies/:id/details"
            element={
              <ProtectedRoute>
                <CompanyDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/companies/:id/assign-clinic"
            element={
              <ProtectedRoute>
                <AssignClinic />
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
            path="/healthcare/doctors/create"
            element={
              <ProtectedRoute>
                <CreateDoctor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/doctors/:id/edit"
            element={
              <ProtectedRoute>
                <EditDoctor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/doctors/:id/details"
            element={
              <ProtectedRoute>
                <DoctorDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/doctors/:id/assign-clinics"
            element={
              <ProtectedRoute>
                <AssignDoctorClinics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/doctors/:id/schedule"
            element={
              <ProtectedRoute>
                <ManageSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/doctors/review"
            element={
              <ProtectedRoute>
                <ReviewDoctors />
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
            path="/healthcare/patients/create"
            element={
              <ProtectedRoute>
                <CreatePatient />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/patients/:id/edit"
            element={
              <ProtectedRoute>
                <EditPatient />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/patients/:id/details"
            element={
              <ProtectedRoute>
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/patients/:id/upload-document"
            element={
              <ProtectedRoute>
                <UploadDocument />
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
            path="/healthcare/appointments/create"
            element={
              <ProtectedRoute>
                <CreateAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/appointments/:id/edit"
            element={
              <ProtectedRoute>
                <EditAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/appointments/:id/cancel"
            element={
              <ProtectedRoute>
                <CancelAppointment />
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
            path="/healthcare/prescriptions/create"
            element={
              <ProtectedRoute>
                <CreatePrescription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/prescriptions/:id/edit"
            element={
              <ProtectedRoute>
                <EditPrescription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/prescriptions/:id/view"
            element={
              <ProtectedRoute>
                <ViewPrescription />
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
          <Route
            path="/healthcare/lab-tests/create"
            element={
              <ProtectedRoute>
                <CreateLabTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/lab-tests/:id/edit"
            element={
              <ProtectedRoute>
                <EditLabTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/lab-tests/:id/view-results"
            element={
              <ProtectedRoute>
                <ViewLabTestResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/lab-tests/:id/upload-results"
            element={
              <ProtectedRoute>
                <UploadLabTestResults />
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
            path="/healthcare/visits/create"
            element={
              <ProtectedRoute>
                <CreateVisit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/visits/:id/edit"
            element={
              <ProtectedRoute>
                <EditVisit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/visits/:id/details"
            element={
              <ProtectedRoute>
                <VisitDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/visits/:id/complete"
            element={
              <ProtectedRoute>
                <CompleteVisit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/medicines"
            element={
              <ProtectedRoute>
                <Medicines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/medicines/create"
            element={
              <ProtectedRoute>
                <CreateMedicine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/medicines/:id"
            element={
              <ProtectedRoute>
                <MedicineDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/medicines/:id/edit"
            element={
              <ProtectedRoute>
                <EditMedicine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/doctors/:id/preferred-medicines"
            element={
              <ProtectedRoute>
                <DoctorPreferredMedicines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthcare/my-medicines"
            element={
              <ProtectedRoute>
                <MyMedicines />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryProvider>
  )
}

export default App
