// Common API Response types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Permission types
export interface Permission {
  id: number
  name: string
  module: string | null
  description: string | null
  allowed?: boolean // Used in user permissions context
  pivot?: {
    allowed: boolean
  }
  created_at: string
  updated_at: string
}

// Role types
export interface Role {
  id: number
  name: string
  slug?: string
  description: string | null
  permissions: Permission[]
  created_at: string
  updated_at: string
}

// User types
export interface User {
  id: number
  email: string
  name: string
  phone: string | null
  status: string | null
  role: Role | null
  permissions: Permission[]
  clinics?: Array<{
    id: number
    name: string
    pivot: {
      role: string
      active: boolean
    }
  }>
  created_at: string
  updated_at: string
}

// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LogoutResponse {
  message: string
}

// Request and Response types
export interface CreateUserRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  status: "active" | "inactive"
  role_id?: number
  clinic_ids?: number[]
}

export interface UpdateUserRequest {
  email?: string
  name?: string
}

// RBAC Request types
export interface CreateRoleRequest {
  name: string
  description?: string | null
}

export interface UpdateRoleRequest {
  name?: string
  description?: string | null
}

export interface CreatePermissionRequest {
  name: string
  module?: string | null
  description?: string | null
}

export interface UpdatePermissionRequest {
  name?: string
  module?: string | null
  description?: string | null
}

export interface AssignPermissionsToRoleRequest {
  permissions: number[]
}

export interface AssignRoleToUserRequest {
  role_id: number
}

export interface AssignPermissionsToUserRequest {
  permissions: Array<{
    id: number
    allowed?: boolean
  }>
}

// Laravel Pagination types
export interface LaravelPaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

// Healthcare types
export interface Company {
  id: number
  name: string
  description: string | null
  logo: string | null
  email: string
  phone: string | null
  mobile: string | null
  website: string | null
  country: string | null
  city: string | null
  district: string | null
  area: string | null
  address: string | null
  longitude: string | null
  latitude: string | null
  is_active: boolean
  clinics_count?: number
  active_clinics_count?: number
  clinics?: Clinic[]
  created_at: string
  updated_at: string
}

export interface Specialty {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
  doctors?: Doctor[]
}

export interface Medicine {
  id: number
  name: string
  description: string | null
  dosage_form: string | null
  strength: string | null
  manufacturer: string | null
  active_ingredient: string | null
  default_serving_times: string[] | null
  default_duration: string | null
  default_quantity: string | null
  is_active: boolean
  doctors_count?: number
  preferred_doctors_count?: number
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: number
  company_id: number | null
  company?: Company
  name: string
  category: string | null
  photo: string | null
  mobile: string | null
  phone: string | null
  email: string | null
  country: string | null
  city: string | null
  district: string | null
  area: string | null
  address: string | null
  longitude: string | null
  latitude: string | null
  verification_code: string | null
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: number
  user_id: number | null
  user?: User
  name: string
  photo: string | null
  mobile: string | null
  email: string | null
  specialty_id: number | null
  specialty?: Specialty
  license_number: string | null
  license_card: string | null
  title: string | null
  occupation: string | null
  qualifications: string[]
  experience_years: number | null
  gender: string | null
  review_status: 'pending' | 'approved' | 'rejected'
  reviewer?: User
  reviewed_at?: string | null
  review_notes?: string | null
  created_at: string
  updated_at: string
}

export interface Patient {
  id: number
  user_id: number | null
  user?: User
  name: string
  photo: string | null
  mobile: string | null
  email: string | null
  work_phone: string | null
  home_phone: string | null
  country: string | null
  city: string | null
  district: string | null
  area: string | null
  address: string | null
  gender: string | null
  national_id: string | null
  birth_date: string | null
  title: string | null
  occupation: string | null
  height: string | null
  weight: string | null
  emergency_contact_name: string | null
  emergency_contact_mobile: string | null
  longitude: string | null
  latitude: string | null
  created_at: string
  updated_at: string
}

export interface PatientProfile {
  id: number
  patient_id: number
  clinic_id: number
  clinic?: Clinic
  profile_type: string
  medical_history: string[]
  allergies: string[]
  medications: string[]
  chronic_conditions: string[]
  blood_type: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Healthcare Request types
export interface CreateCompanyRequest {
  name: string
  description?: string | null
  logo?: File
  email: string
  phone?: string | null
  mobile?: string | null
  website?: string | null
  country?: string | null
  city?: string | null
  district?: string | null
  area?: string | null
  address?: string | null
  longitude?: string | null
  latitude?: string | null
  is_active?: boolean
}

export interface UpdateCompanyRequest {
  name?: string
  description?: string | null
  logo?: File
  email?: string
  phone?: string | null
  mobile?: string | null
  website?: string | null
  country?: string | null
  city?: string | null
  district?: string | null
  area?: string | null
  address?: string | null
  longitude?: string | null
  latitude?: string | null
  is_active?: boolean
}

export interface CreateSpecialtyRequest {
  name: string
  description?: string | null
}

export interface UpdateSpecialtyRequest {
  name?: string
  description?: string | null
}

export interface CreateClinicRequest {
  name: string
  email: string
  category?: string | null
  company_id?: number | null
  photo?: File
  mobile?: string | null
  phone?: string | null
  country?: string | null
  city?: string | null
  district?: string | null
  area?: string | null
  address?: string | null
  longitude?: string | null
  latitude?: string | null
}

export interface UpdateClinicRequest {
  name?: string
  email?: string
  category?: string | null
  company_id?: number | null
  photo?: File
  mobile?: string | null
  phone?: string | null
  country?: string | null
  city?: string | null
  district?: string | null
  area?: string | null
  address?: string | null
  longitude?: string | null
  latitude?: string | null
}

export interface CreateDoctorRequest {
  user_name: string
  user_email: string
  user_phone?: string | null
  user_password: string
  specialty_id: number
  photo?: File
  license_number?: string | null
  license_card?: File
  title?: string | null
  occupation?: string | null
  qualifications?: string[]
  experience_years?: number | null
  gender?: string | null
}

export interface UpdateDoctorRequest {
  user_id?: number
  name?: string
  email?: string
  specialty_id?: number
  photo?: File
  mobile?: string | null
  license_number?: string | null
  license_card?: File
  title?: string | null
  occupation?: string | null
  qualifications?: string[]
  experience_years?: number | null
  gender?: string | null
}

export interface ReviewDoctorRequest {
  action: 'approve' | 'reject'
  review_notes?: string
}

export interface CreatePatientRequest {
  name: string
  email: string
  password: string
  phone?: string | null
  photo?: File
  work_phone?: string | null
  home_phone?: string | null
  country?: string | null
  city?: string | null
  district?: string | null
  area?: string | null
  address?: string | null
  gender?: string | null
  national_id?: string | null
  birth_date?: string | null
  title?: string | null
  occupation?: string | null
  height?: string | null
  weight?: string | null
  emergency_contact_name?: string | null
  emergency_contact_mobile?: string | null
  longitude?: string | null
  latitude?: string | null
}

export interface UpdatePatientRequest {
  user_id?: number
  name?: string
  photo?: File
  mobile?: string | null
  email?: string | null
  work_phone?: string | null
  home_phone?: string | null
  country?: string | null
  city?: string | null
  district?: string | null
  area?: string | null
  address?: string | null
  gender?: string | null
  national_id?: string | null
  birth_date?: string | null
  title?: string | null
  occupation?: string | null
  height?: string | null
  weight?: string | null
  emergency_contact_name?: string | null
  emergency_contact_mobile?: string | null
  longitude?: string | null
  latitude?: string | null
}

export interface CreateMedicineRequest {
  name: string
  description?: string | null
  dosage_form?: string | null
  strength?: string | null
  manufacturer?: string | null
  active_ingredient?: string | null
  default_serving_times?: string[]
  default_duration?: string | null
  default_quantity?: string | null
  is_active?: boolean
}

export interface UpdateMedicineRequest {
  name?: string
  description?: string | null
  dosage_form?: string | null
  strength?: string | null
  manufacturer?: string | null
  active_ingredient?: string | null
  default_serving_times?: string[]
  default_duration?: string | null
  default_quantity?: string | null
  is_active?: boolean
}

export interface DoctorPreferredMedicine {
  medicine_id: number
  notes?: string | null
}

export interface CreateDoctorClinicRequest {
  doctor_id: number
  clinic_id: number
  fees?: number | null
  consultation_fees?: number | null
  active?: boolean
}

export interface UpdateDoctorClinicRequest {
  fees?: number | null
  consultation_fees?: number | null
  active?: boolean
}

// Healthcare Response types
export interface HealthcarePaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Doctor Schedule types
export interface DoctorClinic {
  id: number
  doctor?: {
    id: number
    name: string
    specialty?: {
      id: number
      name: string
    } | null
  }
  clinic?: {
    id: number
    name: string
    category: string | null
    address?: string | null
    phone?: string | null
    city?: string | null
  }
  fees: number | null
  consultation_fees: number | null
  active: boolean
  full_name?: string
  schedules_count?: number
  created_at: string
  updated_at: string
}

export interface DoctorSchedule {
  id: number
  doctor_clinic: {
    id: number
    doctor?: {
      id: number
      name: string
    }
    clinic?: {
      id: number
      name: string
    }
  }
  day_of_week: string
  day_name?: string
  start_time: string
  end_time: string
  slot_duration_minutes: number
  duration_minutes?: number
  created_at: string
  updated_at: string
}

export interface ScheduleInput {
  doctor_clinic_id: number
  day_of_week: string
  start_time: string
  end_time: string
  slot_duration_minutes?: number
}

export interface UpdateDoctorScheduleRequest {
  schedules: ScheduleInput[]
}

export interface DoctorScheduleResponse {
  success: boolean
  data: {
    schedules: DoctorSchedule[]
  }
}

// Appointment types
export interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  clinic_id: number
  doctor_clinic_id: number
  type: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  status: "booked" | "confirmed" | "arrived" | "in_progress" | "completed" | "cancelled" | "no_show"
  notes: string | null
  cancellation_reason: string | null
  patient?: Patient
  doctor?: Doctor
  clinic?: Clinic
  doctor_clinic?: DoctorClinic
  created_at: string
  updated_at: string
}

export interface CreateAppointmentRequest {
  patient_id: number
  doctor_id: number
  clinic_id: number
  doctor_clinic_id: number
  type: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  notes?: string | null
  status?: string
}

export interface UpdateAppointmentRequest {
  appointment_date?: string
  status?: string
  notes?: string | null
  cancellation_reason?: string | null
}

export interface AppointmentFilters {
  clinic_id?: number
  doctor_id?: number
  patient_id?: number
  status?: string
  date_from?: string
  date_to?: string
  per_page?: number
}

// Visit types
export interface Visit {
  id: number
  appointment_id: number
  patient_id: number
  doctor_id: number
  clinic_id: number
  diagnosis: string | null
  doctor_notes: string | null
  status: "in_progress" | "completed"
  started_at: string
  ended_at: string | null
  appointment?: Appointment
  patient?: Patient
  doctor?: Doctor
  clinic?: Clinic
  created_at: string
  updated_at: string
}

export interface CreateVisitRequest {
  appointment_id: number
  patient_id: number
  doctor_id: number
  clinic_id: number
  diagnosis?: string | null
  doctor_notes?: string | null
}

export interface UpdateVisitRequest {
  diagnosis?: string | null
  doctor_notes?: string | null
  status?: "in_progress" | "completed"
}

export interface VisitFilters {
  status?: string
  date_from?: string
  date_to?: string
  per_page?: number
}

// Prescription types
export interface Prescription {
  id: number
  visit_id: number
  patient_id: number
  doctor_id: number
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  notes: string | null
  visit?: Visit
  patient?: Patient
  doctor?: Doctor
  created_at: string
  updated_at: string
}

export interface CreatePrescriptionRequest {
  visit_id: number
  patient_id: number
  doctor_id: number
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  notes?: string | null
}

export interface UpdatePrescriptionRequest {
  medication_name?: string
  dosage?: string
  frequency?: string
  duration?: string
  notes?: string | null
}

export interface PrescriptionFilters {
  status?: string
  date_from?: string
  date_to?: string
  per_page?: number
}

// Lab Test types
export interface LabTest {
  id: number
  visit_id: number
  patient_id: number
  doctor_id: number
  test_name: string
  result: string | null
  status: "pending" | "in_progress" | "completed" | "cancelled"
  result_file_path: string | null
  visit?: Visit
  patient?: Patient
  doctor?: Doctor
  is_pending: boolean
  is_completed: boolean
  has_result: boolean
  created_at: string
  updated_at: string
}

export interface CreateLabTestRequest {
  visit_id: number
  patient_id: number
  doctor_id: number
  test_name: string
  status: string
}

export interface UpdateLabTestRequest {
  test_name?: string
  status?: string
}

export interface UploadLabTestResultRequest {
  result_file: File
  result?: string
}

// Patient Document types
export interface PatientDocument {
  id: number
  patient_id: number
  visit_id: number | null
  file_path: string
  document_type: "medical_record" | "lab_result" | "prescription" | "insurance" | "consent_form" | "other"
  uploaded_by: number
  uploaded_at: string
  patient?: Patient
  visit?: Visit
  uploader?: User
  created_at: string
  updated_at: string
}

export interface UploadPatientDocumentRequest {
  file: File
  document_type: "medical_record" | "lab_result" | "prescription" | "insurance" | "consent_form" | "other"
  visit_id?: number
}

export interface PatientDocumentFilters {
  document_type?: string
  per_page?: number
}

// Patient Profile Request types
export interface MedicalHistoryItem {
  condition: string
  diagnosed_date: string
  status: string
}

export interface MedicationItem {
  name: string
  dosage: string
  frequency: string
}

export interface CreatePatientProfileRequest {
  patient_id: number
  clinic_id: number
  profile_type?: string
  medical_history?: MedicalHistoryItem[]
  allergies?: string[]
  medications?: MedicationItem[]
  chronic_conditions?: string[]
  blood_type?: string | null
  notes?: string | null
}

export interface UpdatePatientProfileRequest {
  medical_history?: MedicalHistoryItem[]
  allergies?: string[]
  medications?: MedicationItem[]
  chronic_conditions?: string[]
  blood_type?: string | null
  notes?: string | null
}

// Add more entity types as needed based on your backend
export interface CommonEntity {
  id: number
  created_at: string
  updated_at: string
}

