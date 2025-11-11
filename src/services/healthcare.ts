/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "./api"
import type {
  Specialty,
  Clinic,
  Doctor,
  Patient,
  PatientProfile,
  Medicine,
  Company,
  DoctorClinic,
  CreateSpecialtyRequest,
  UpdateSpecialtyRequest,
  CreateClinicRequest,
  UpdateClinicRequest,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  ReviewDoctorRequest,
  CreatePatientRequest,
  UpdatePatientRequest,
  CreateMedicineRequest,
  UpdateMedicineRequest,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CreateDoctorClinicRequest,
  UpdateDoctorClinicRequest,
  DoctorPreferredMedicine,
  HealthcarePaginatedResponse,
} from "@/types"

// Helper function to convert FormData or object to FormData for file uploads
const toFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    const value = data[key]
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value)
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item)
        })
      } else {
        formData.append(key, value.toString())
      }
    }
  })
  return formData
}

export const companyService = {
  // Companies
  getCompanies: async (
    page: number = 1,
    filters?: {
      search?: string
      is_active?: boolean
      city?: string
    }
  ): Promise<HealthcarePaginatedResponse<Company>> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.search && filters.search !== "") {
      params.append("search", filters.search)
    }
    if (filters?.is_active !== undefined) {
      params.append("is_active", filters.is_active.toString())
    }
    if (filters?.city) {
      params.append("city", filters.city)
    }
    const response = await apiClient.get<HealthcarePaginatedResponse<Company>>(
      `/healthcare/companies?${params.toString()}`
    )
    return response.data
  },

  getCompanyById: async (id: number): Promise<Company> => {
    const response = await apiClient.get<{ success: boolean; data: Company }>(
      `/healthcare/companies/${id}`
    )
    return response.data.data
  },

  createCompany: async (data: CreateCompanyRequest): Promise<Company> => {
    const formData = toFormData(data as unknown as Record<string, unknown>)
    const response = await apiClient.post<{ success: boolean; data: Company }>(
      "/healthcare/companies",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data.data
  },

  updateCompany: async (id: number, data: UpdateCompanyRequest): Promise<Company> => {
    // Remove logo from data as it needs to be uploaded separately
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { logo, ...companyData } = data
    const response = await apiClient.put<{ success: boolean; data: Company }>(
      `/healthcare/companies/${id}`,
      companyData
    )
    return response.data.data
  },

  updateCompanyLogo: async (id: number, logo: File): Promise<Company> => {
    const formData = new FormData()
    formData.append("logo", logo)
    const response = await apiClient.post<{ success: boolean; data: Company }>(
      `/healthcare/companies/${id}/logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data.data
  },

  deleteCompany: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/companies/${id}`
    )
    return response.data
  },

  toggleCompanyStatus: async (id: number): Promise<Company> => {
    const response = await apiClient.patch<{ success: boolean; data: Company }>(
      `/healthcare/companies/${id}/toggle-status`
    )
    return response.data.data
  },

  getCompanyClinics: async (id: number, page: number = 1): Promise<HealthcarePaginatedResponse<Clinic>> => {
    const response = await apiClient.get<HealthcarePaginatedResponse<Clinic>>(
      `/healthcare/companies/${id}/clinics?page=${page}`
    )
    return response.data
  },

  assignClinicToCompany: async (companyId: number, clinicId: number): Promise<{ message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/healthcare/companies/${companyId}/assign-clinic/${clinicId}`
    )
    return response.data
  },

  unassignClinicFromCompany: async (companyId: number, clinicId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/companies/${companyId}/unassign-clinic/${clinicId}`
    )
    return response.data
  },
}

export const healthcareService = {
  // Specialties
  getSpecialties: async (
    page: number = 1,
    filters?: {
      search?: string
    }
  ): Promise<HealthcarePaginatedResponse<Specialty>> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.search && filters.search !== "") {
      params.append("search", filters.search)
    }
    const response = await apiClient.get<HealthcarePaginatedResponse<Specialty>>(
      `/healthcare/specialties?${params.toString()}`
    )
    return response.data
  },

  getSpecialtyById: async (id: number): Promise<Specialty> => {
    const response = await apiClient.get<{ success: boolean; data: Specialty }>(
      `/healthcare/specialties/${id}`
    )
    return response.data.data
  },

  createSpecialty: async (data: CreateSpecialtyRequest): Promise<Specialty> => {
    const response = await apiClient.post<{ success: boolean; data: Specialty }>(
      "/healthcare/specialties",
      data
    )
    return response.data.data
  },

  updateSpecialty: async (id: number, data: UpdateSpecialtyRequest): Promise<Specialty> => {
    const response = await apiClient.put<{ success: boolean; data: Specialty }>(
      `/healthcare/specialties/${id}`,
      data
    )
    return response.data.data
  },

  deleteSpecialty: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/specialties/${id}`
    )
    return response.data
  },

  // Clinics
  getClinics: async (
    page: number = 1,
    filters?: {
      search?: string
      city?: string
      category?: string
      is_active?: boolean
      per_page?: number
    }
  ): Promise<HealthcarePaginatedResponse<Clinic>> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.search && filters.search !== "") {
      params.append("search", filters.search)
    }
    if (filters?.city) {
      params.append("city", filters.city)
    }
    if (filters?.category) {
      params.append("category", filters.category)
    }
    if (filters?.is_active !== undefined) {
      params.append("is_active", filters.is_active.toString())
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString())
    }
    const response = await apiClient.get<HealthcarePaginatedResponse<Clinic>>(
      `/healthcare/clinics?${params.toString()}`
    )
    return response.data
  },

  getClinicById: async (id: number): Promise<Clinic> => {
    const response = await apiClient.get<{ success: boolean; data: Clinic }>(
      `/healthcare/clinics/${id}`
    )
    return response.data.data
  },

  createClinic: async (data: CreateClinicRequest): Promise<Clinic> => {
    const formData = toFormData(data as unknown as Record<string, unknown>)
    const response = await apiClient.post<{ success: boolean; data: Clinic }>(
      "/healthcare/clinics",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data.data
  },

  updateClinic: async (id: number, data: UpdateClinicRequest): Promise<Clinic> => {
    // Remove photo from data as it needs to be uploaded separately
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { photo, ...clinicData } = data
    const response = await apiClient.put<{ success: boolean; data: Clinic }>(
      `/healthcare/clinics/${id}`,
      clinicData
    )
    return response.data.data
  },

  updateClinicPhoto: async (id: number, photo: File): Promise<Clinic> => {
    const formData = new FormData()
    formData.append("photo", photo)
    const response = await apiClient.post<{ success: boolean; data: Clinic }>(
      `/healthcare/clinics/${id}/photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data.data
  },

  deleteClinic: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/clinics/${id}`
    )
    return response.data
  },

  getClinicDoctors: async (id: number, page: number = 1): Promise<HealthcarePaginatedResponse<Doctor>> => {
    const response = await apiClient.get<HealthcarePaginatedResponse<Doctor>>(
      `/healthcare/clinics/${id}/doctors?page=${page}`
    )
    return response.data
  },

  getClinicPatients: async (id: number, page: number = 1): Promise<HealthcarePaginatedResponse<Patient>> => {
    const response = await apiClient.get<HealthcarePaginatedResponse<Patient>>(
      `/healthcare/clinics/${id}/patients?page=${page}`
    )
    return response.data
  },

  // Doctors
  getDoctors: async (
    page: number = 1,
    filters?: {
      search?: string
      specialty_id?: number
      clinic_id?: number
      city?: string
      is_verified?: boolean
      review_status?: string
      per_page?: number
    }
  ): Promise<HealthcarePaginatedResponse<Doctor>> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.search && filters.search !== "") {
      params.append("search", filters.search)
    }
    if (filters?.specialty_id) {
      params.append("specialty_id", filters.specialty_id.toString())
    }
    if (filters?.clinic_id) {
      params.append("clinic_id", filters.clinic_id.toString())
    }
    if (filters?.city) {
      params.append("city", filters.city)
    }
    if (filters?.is_verified !== undefined) {
      params.append("is_verified", filters.is_verified.toString())
    }
    if (filters?.review_status) {
      params.append("review_status", filters.review_status)
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString())
    }
    const response = await apiClient.get<HealthcarePaginatedResponse<Doctor>>(
      `/healthcare/doctors?${params.toString()}`
    )
    return response.data
  },

  getDoctorById: async (id: number): Promise<Doctor> => {
    const response = await apiClient.get<{ success: boolean; data: Doctor }>(
      `/healthcare/doctors/${id}`
    )
    return response.data.data
  },

  createDoctor: async (data: CreateDoctorRequest): Promise<Doctor> => {
    const formData = toFormData(data as unknown as Record<string, unknown>)
    const response = await apiClient.post<{ success: boolean; data: Doctor }>(
      "/healthcare/doctors",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data.data
  },

  updateDoctor: async (id: number, data: UpdateDoctorRequest): Promise<Doctor> => {
    // Remove files from data as they need to be uploaded separately
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { photo, license_card, ...doctorData } = data
    const response = await apiClient.put<{ success: boolean; data: Doctor }>(
      `/healthcare/doctors/${id}`,
      doctorData
    )
    return response.data.data
  },

  updateDoctorFile: async (id: number, type: "photo" | "license_card", file: File): Promise<Doctor> => {
    const formData = new FormData()
    formData.append("type", type)
    formData.append("file", file)
    const response = await apiClient.post<{ success: boolean; data: Doctor }>(
      `/healthcare/doctors/${id}/file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data.data
  },

  deleteDoctor: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/doctors/${id}`
    )
    return response.data
  },

  getDoctorPatients: async (id: number, page: number = 1): Promise<HealthcarePaginatedResponse<Patient>> => {
    const response = await apiClient.get<HealthcarePaginatedResponse<Patient>>(
      `/healthcare/doctors/${id}/patients?page=${page}`
    )
    return response.data
  },

  getDoctorClinics: async (id: number): Promise<Clinic[]> => {
    const response = await apiClient.get<{ success: boolean; data: Clinic[] }>(
      `/healthcare/doctors/${id}/clinics`
    )
    return response.data.data
  },

  assignDoctorsToClinic: async (doctorId: number, clinics: Array<{ clinic_id: number; is_active?: boolean }>): Promise<Doctor> => {
    const response = await apiClient.post<{ success: boolean; data: Doctor }>(
      `/healthcare/doctors/${doctorId}/assign-clinics`,
      { clinics }
    )
    return response.data.data
  },

  // Doctor-Clinic CRUD operations
  getAllDoctorClinics: async (
    page: number = 1,
    filters?: {
      doctor_id?: number
      clinic_id?: number
      active?: boolean
    }
  ): Promise<HealthcarePaginatedResponse<DoctorClinic>> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.doctor_id) params.append("doctor_id", filters.doctor_id.toString())
    if (filters?.clinic_id) params.append("clinic_id", filters.clinic_id.toString())
    if (filters?.active !== undefined) params.append("active", filters.active.toString())

    const response = await apiClient.get<HealthcarePaginatedResponse<DoctorClinic>>(
      `/healthcare/doctor-clinics?${params.toString()}`
    )
    return response.data
  },

  getDoctorClinicById: async (id: number): Promise<DoctorClinic> => {
    const response = await apiClient.get<{ success: boolean; data: DoctorClinic }>(
      `/healthcare/doctor-clinics/${id}`
    )
    return response.data.data
  },

  createDoctorClinic: async (data: CreateDoctorClinicRequest): Promise<DoctorClinic> => {
    const response = await apiClient.post<{ success: boolean; data: DoctorClinic }>(
      "/healthcare/doctor-clinics",
      data
    )
    return response.data.data
  },

  updateDoctorClinic: async (id: number, data: UpdateDoctorClinicRequest): Promise<DoctorClinic> => {
    const response = await apiClient.put<{ success: boolean; data: DoctorClinic }>(
      `/healthcare/doctor-clinics/${id}`,
      data
    )
    return response.data.data
  },

  deleteDoctorClinic: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/doctor-clinics/${id}`
    )
    return response.data
  },

  toggleDoctorClinicStatus: async (id: number): Promise<DoctorClinic> => {
    const response = await apiClient.patch<{ success: boolean; data: DoctorClinic }>(
      `/healthcare/doctor-clinics/${id}/toggle-status`
    )
    return response.data.data
  },

  // Patients
  getPatients: async (
    page: number = 1,
    filters?: {
      search?: string
      gender?: string
      clinic_id?: number
      doctor_id?: number
      per_page?: number
    }
  ): Promise<HealthcarePaginatedResponse<Patient>> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.search && filters.search !== "") {
      params.append("search", filters.search)
    }
    if (filters?.gender && filters.gender !== "all") {
      params.append("gender", filters.gender)
    }
    if (filters?.clinic_id) {
      params.append("clinic_id", filters.clinic_id.toString())
    }
    if (filters?.doctor_id) {
      params.append("doctor_id", filters.doctor_id.toString())
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString())
    }
    const response = await apiClient.get<HealthcarePaginatedResponse<Patient>>(
      `/healthcare/patients?${params.toString()}`
    )
    return response.data
  },

  getPatientById: async (id: number): Promise<Patient> => {
    const response = await apiClient.get<{ success: boolean; data: Patient }>(
      `/healthcare/patients/${id}`
    )
    return response.data.data
  },

  createPatient: async (data: CreatePatientRequest): Promise<Patient> => {
    const formData = toFormData(data as unknown as Record<string, unknown>)
    const response = await apiClient.post<{ success: boolean; data: Patient }>(
      "/healthcare/patients",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data.data
  },

  updatePatient: async (id: number, data: UpdatePatientRequest): Promise<Patient> => {
    // Remove photo from data as it needs to be uploaded separately
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { photo, ...patientData } = data
    const response = await apiClient.put<{ success: boolean; data: Patient }>(
      `/healthcare/patients/${id}`,
      patientData
    )
    return response.data.data
  },

  updatePatientFile: async (id: number, type: "photo", file: File): Promise<Patient> => {
    const formData = new FormData()
    formData.append("type", type)
    formData.append("file", file)
    const response = await apiClient.post<{ success: boolean; data: Patient }>(
      `/healthcare/patients/${id}/file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data.data
  },

  deletePatient: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/patients/${id}`
    )
    return response.data
  },

  getPatientProfiles: async (id: number): Promise<PatientProfile[]> => {
    const response = await apiClient.get<{ success: boolean; data: PatientProfile[] }>(
      `/healthcare/patients/${id}/profiles`
    )
    return response.data.data
  },

  getPatientLatestProfile: async (id: number): Promise<PatientProfile> => {
    const response = await apiClient.get<{ success: boolean; data: PatientProfile }>(
      `/healthcare/patients/${id}/latest-profile`
    )
    return response.data.data
  },

  // Doctor Schedule
  getDoctorSchedule: async (doctorId: number, clinicId?: number): Promise<{ schedules: any[] }> => {
    const params = new URLSearchParams()
    if (clinicId) {
      params.append("clinic_id", clinicId.toString())
    }
    const url = `/healthcare/doctors/${doctorId}/schedule${params.toString() ? `?${params.toString()}` : ""}`
    const response = await apiClient.get<{ success: boolean; data: { schedules: any[] } }>(url)
    return response.data.data
  },

  updateDoctorSchedule: async (doctorId: number, schedules: any[]): Promise<{ schedules: any[] }> => {
    const response = await apiClient.put<{ success: boolean; data: { schedules: any[] } }>(
      `/healthcare/doctors/${doctorId}/schedule`,
      { schedules }
    )
    return response.data.data
  },

  // Patient Appointments
  getPatientAppointments: async (
    patientId: number,
    filters?: {
      status?: string
      per_page?: number
    }
  ): Promise<any> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.per_page) params.append("per_page", filters.per_page.toString())
    
    const response = await apiClient.get(
      `/healthcare/patients/${patientId}/appointments?${params.toString()}`
    )
    return response.data
  },

  // Patient Visits
  getPatientVisits: async (
    patientId: number,
    filters?: {
      status?: string
      per_page?: number
    }
  ): Promise<any> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.per_page) params.append("per_page", filters.per_page.toString())
    
    const response = await apiClient.get(
      `/healthcare/patients/${patientId}/visits?${params.toString()}`
    )
    return response.data
  },

  // Patient Prescriptions
  getPatientPrescriptions: async (
    patientId: number,
    filters?: {
      status?: string
      per_page?: number
    }
  ): Promise<any> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.per_page) params.append("per_page", filters.per_page.toString())
    
    const response = await apiClient.get(
      `/healthcare/patients/${patientId}/prescriptions?${params.toString()}`
    )
    return response.data
  },

  // Patient Documents
  getPatientDocuments: async (
    patientId: number,
    filters?: {
      document_type?: string
      per_page?: number
    }
  ): Promise<any> => {
    const params = new URLSearchParams()
    if (filters?.document_type) params.append("document_type", filters.document_type)
    if (filters?.per_page) params.append("per_page", filters.per_page.toString())
    
    const response = await apiClient.get(
      `/healthcare/patients/${patientId}/documents?${params.toString()}`
    )
    return response.data
  },

  uploadPatientDocument: async (patientId: number, file: File, documentType: string, visitId?: number): Promise<any> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("document_type", documentType)
    if (visitId) {
      formData.append("visit_id", visitId.toString())
    }
    
    const response = await apiClient.post(
      `/healthcare/patients/${patientId}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data
  },

  deletePatientDocument: async (documentId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/patient-documents/${documentId}`
    )
    return response.data
  },

  // Patient Profiles
  createPatientProfile: async (data: any): Promise<any> => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      "/healthcare/patient-profiles",
      data
    )
    return response.data.data
  },

  updatePatientProfile: async (profileId: number, data: any): Promise<any> => {
    const response = await apiClient.put<{ success: boolean; data: any }>(
      `/healthcare/patient-profiles/${profileId}`,
      data
    )
    return response.data.data
  },

  // Doctor Clinic Schedules
  getDoctorClinicSchedules: async (
    filters?: {
      doctor_clinic_id?: number
      doctor_id?: number
      clinic_id?: number
      day_of_week?: number
      per_page?: number
    }
  ): Promise<any> => {
    const params = new URLSearchParams()
    if (filters?.doctor_clinic_id) params.append("doctor_clinic_id", filters.doctor_clinic_id.toString())
    if (filters?.doctor_id) params.append("doctor_id", filters.doctor_id.toString())
    if (filters?.clinic_id) params.append("clinic_id", filters.clinic_id.toString())
    if (filters?.day_of_week !== undefined) params.append("day_of_week", filters.day_of_week.toString())
    if (filters?.per_page) params.append("per_page", filters.per_page.toString())
    
    const response = await apiClient.get(
      `/healthcare/doctor-clinic-schedules?${params.toString()}`
    )
    return response.data
  },

  createDoctorClinicSchedule: async (data: any): Promise<any> => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      "/healthcare/doctor-clinic-schedules",
      data
    )
    return response.data.data
  },

  updateDoctorClinicSchedule: async (id: number, data: any): Promise<any> => {
    const response = await apiClient.put<{ success: boolean; data: any }>(
      `/healthcare/doctor-clinic-schedules/${id}`,
      data
    )
    return response.data.data
  },

  deleteDoctorClinicSchedule: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/doctor-clinic-schedules/${id}`
    )
    return response.data
  },

  // Appointments
  getAppointments: async (
    page: number = 1,
    filters?: {
      clinic_id?: number
      doctor_id?: number
      patient_id?: number
      status?: string
      search?: string
      per_page?: number
    }
  ): Promise<any> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.clinic_id) params.append("clinic_id", filters.clinic_id.toString())
    if (filters?.doctor_id) params.append("doctor_id", filters.doctor_id.toString())
    if (filters?.patient_id) params.append("patient_id", filters.patient_id.toString())
    if (filters?.status) params.append("status", filters.status)
    if (filters?.search && filters.search !== "") params.append("search", filters.search)
    if (filters?.per_page) params.append("per_page", filters.per_page.toString())
    
    const response = await apiClient.get(
      `/healthcare/appointments?${params.toString()}`
    )
    return response.data
  },

  getAppointmentById: async (id: number): Promise<any> => {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/healthcare/appointments/${id}`
    )
    return response.data.data
  },

  getAvailableSlots: async (
    doctorId: number,
    clinicId: number,
    date: string
  ): Promise<{ success: boolean; data: { time: string; available: boolean }[] }> => {
    const response = await apiClient.get<{ success: boolean; data: { time: string; available: boolean }[] }>(
      `/healthcare/doctors/${doctorId}/clinics/${clinicId}/available-slots?date=${date}`
    )
    return response.data
  },

  createAppointment: async (data: any): Promise<any> => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      "/healthcare/appointments",
      data
    )
    return response.data.data
  },

  updateAppointment: async (id: number, data: any): Promise<any> => {
    const response = await apiClient.put<{ success: boolean; data: any }>(
      `/healthcare/appointments/${id}`,
      data
    )
    return response.data.data
  },

  updateAppointmentStatus: async (id: number, status: string): Promise<any> => {
    const response = await apiClient.patch<{ success: boolean; data: any }>(
      `/healthcare/appointments/${id}/status`,
      { status }
    )
    return response.data.data
  },

  cancelAppointment: async (id: number, reason?: string): Promise<any> => {
    const response = await apiClient.patch<{ success: boolean; data: any }>(
      `/healthcare/appointments/${id}/cancel`,
      { cancellation_reason: reason }
    )
    return response.data.data
  },

  // Visits
  getVisits: async (
    page: number = 1,
    filters?: {
      patient_id?: number
      doctor_id?: number
      clinic_id?: number
      status?: string
      per_page?: number
    }
  ): Promise<any> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.patient_id) params.append("patient_id", filters.patient_id.toString())
    if (filters?.doctor_id) params.append("doctor_id", filters.doctor_id.toString())
    if (filters?.clinic_id) params.append("clinic_id", filters.clinic_id.toString())
    if (filters?.status) params.append("status", filters.status)
    if (filters?.per_page) params.append("per_page", filters.per_page.toString())
    
    const response = await apiClient.get(
      `/healthcare/visits?${params.toString()}`
    )
    return response.data
  },

  getVisitById: async (id: number): Promise<any> => {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/healthcare/visits/${id}`
    )
    return response.data.data
  },

  createVisit: async (data: any): Promise<any> => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      "/healthcare/visits",
      data
    )
    return response.data.data
  },

  updateVisit: async (id: number, data: any): Promise<any> => {
    const response = await apiClient.put<{ success: boolean; data: any }>(
      `/healthcare/visits/${id}`,
      data
    )
    return response.data.data
  },

  completeVisit: async (id: number): Promise<any> => {
    const response = await apiClient.patch<{ success: boolean; data: any }>(
      `/healthcare/visits/${id}/complete`
    )
    return response.data.data
  },

  getVisitPrescriptions: async (visitId: number): Promise<any> => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(
      `/healthcare/visits/${visitId}/prescriptions`
    )
    return response.data.data
  },

  getVisitLabTests: async (visitId: number): Promise<any> => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(
      `/healthcare/visits/${visitId}/lab-tests`
    )
    return response.data.data
  },

  // Prescriptions
  getPrescriptions: async (
    page: number = 1,
    filters?: {
      patient_id?: number
      doctor_id?: number
      visit_id?: number
      per_page?: number
    }
  ): Promise<any> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.patient_id) params.append("patient_id", filters.patient_id.toString())
    if (filters?.doctor_id) params.append("doctor_id", filters.doctor_id.toString())
    if (filters?.visit_id) params.append("visit_id", filters.visit_id.toString())
    if (filters?.per_page) params.append("per_page", filters.per_page.toString())
    
    const response = await apiClient.get(
      `/healthcare/prescriptions?${params.toString()}`
    )
    return response.data
  },

  getPrescriptionById: async (id: number): Promise<any> => {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/healthcare/prescriptions/${id}`
    )
    return response.data.data
  },

  createPrescription: async (data: any): Promise<any> => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      "/healthcare/prescriptions",
      data
    )
    return response.data.data
  },

  updatePrescription: async (id: number, data: any): Promise<any> => {
    const response = await apiClient.put<{ success: boolean; data: any }>(
      `/healthcare/prescriptions/${id}`,
      data
    )
    return response.data.data
  },

  deletePrescription: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/prescriptions/${id}`
    )
    return response.data
  },

  // Lab Tests
  getLabTests: async (
    page: number = 1,
    filters?: {
      patient_id?: number
      doctor_id?: number
      visit_id?: number
      status?: string
      per_page?: number
    }
  ): Promise<any> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.patient_id) params.append("patient_id", filters.patient_id.toString())
    if (filters?.doctor_id) params.append("doctor_id", filters.doctor_id.toString())
    if (filters?.visit_id) params.append("visit_id", filters.visit_id.toString())
    if (filters?.status) params.append("status", filters.status)
    if (filters?.per_page) params.append("per_page", filters.per_page.toString())
    
    const response = await apiClient.get(
      `/healthcare/lab-tests?${params.toString()}`
    )
    return response.data
  },

  getLabTestById: async (id: number): Promise<any> => {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/healthcare/lab-tests/${id}`
    )
    return response.data.data
  },

  createLabTest: async (data: any): Promise<any> => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      "/healthcare/lab-tests",
      data
    )
    return response.data.data
  },

  updateLabTest: async (id: number, data: any): Promise<any> => {
    const response = await apiClient.put<{ success: boolean; data: any }>(
      `/healthcare/lab-tests/${id}`,
      data
    )
    return response.data.data
  },

  uploadLabTestResult: async (labTestId: number, file: File, result?: string): Promise<any> => {
    const formData = new FormData()
    formData.append("result_file", file)
    if (result) {
      formData.append("result", result)
    }
    
    const response = await apiClient.patch(
      `/healthcare/lab-tests/${labTestId}/upload-result`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data.data
  },

  deleteLabTest: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/lab-tests/${id}`
    )
    return response.data
  },

  // Medicines
  getMedicines: async (
    page: number = 1,
    filters?: {
      search?: string
      category?: string
      dosage_form?: string
      manufacturer?: string
      is_active?: boolean
    }
  ): Promise<HealthcarePaginatedResponse<Medicine>> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.search && filters.search !== "") {
      params.append("search", filters.search)
    }
    if (filters?.category) {
      params.append("category", filters.category)
    }
    if (filters?.dosage_form) {
      params.append("dosage_form", filters.dosage_form)
    }
    if (filters?.manufacturer) {
      params.append("manufacturer", filters.manufacturer)
    }
    if (filters?.is_active !== undefined) {
      params.append("is_active", filters.is_active.toString())
    }
    const response = await apiClient.get<HealthcarePaginatedResponse<Medicine>>(
      `/healthcare/medicines?${params.toString()}`
    )
    return response.data
  },

  getMedicineById: async (id: number): Promise<Medicine> => {
    const response = await apiClient.get<{ success: boolean; data: Medicine }>(
      `/healthcare/medicines/${id}`
    )
    return response.data.data
  },

  createMedicine: async (data: CreateMedicineRequest): Promise<Medicine> => {
    const response = await apiClient.post<{ success: boolean; data: Medicine }>(
      "/healthcare/medicines",
      data
    )
    return response.data.data
  },

  updateMedicine: async (id: number, data: UpdateMedicineRequest): Promise<Medicine> => {
    const response = await apiClient.put<{ success: boolean; data: Medicine }>(
      `/healthcare/medicines/${id}`,
      data
    )
    return response.data.data
  },

  deleteMedicine: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/medicines/${id}`
    )
    return response.data
  },

  // Doctor Preferred Medicines
  getDoctorPreferredMedicines: async (doctorId: number): Promise<Medicine[]> => {
    const response = await apiClient.get<{ success: boolean; data: Medicine[] }>(
      `/healthcare/doctors/${doctorId}/preferred-medicines`
    )
    return response.data.data
  },

  updateDoctorPreferredMedicines: async (
    doctorId: number,
    data: DoctorPreferredMedicine[]
  ): Promise<Doctor> => {
    const response = await apiClient.post<{ success: boolean; data: Doctor }>(
      `/healthcare/doctors/${doctorId}/preferred-medicines`,
      data
    )
    return response.data.data
  },

  addDoctorPreferredMedicine: async (
    doctorId: number,
    medicineId: number
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/healthcare/doctors/${doctorId}/preferred-medicines/${medicineId}`
    )
    return response.data
  },

  removeDoctorPreferredMedicine: async (
    doctorId: number,
    medicineId: number
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/healthcare/doctors/${doctorId}/preferred-medicines/${medicineId}`
    )
    return response.data
  },

  // Doctor Review
  getPendingReviewDoctors: async (
    page: number = 1,
    filters?: {
      search?: string
      specialty_id?: number
    }
  ): Promise<HealthcarePaginatedResponse<Doctor>> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (filters?.search && filters.search !== "") {
      params.append("search", filters.search)
    }
    if (filters?.specialty_id) {
      params.append("specialty_id", filters.specialty_id.toString())
    }
    const response = await apiClient.get<HealthcarePaginatedResponse<Doctor>>(
      `/healthcare/doctors/pending-review?${params.toString()}`
    )
    return response.data
  },

  reviewDoctor: async (id: number, data: ReviewDoctorRequest): Promise<Doctor> => {
    const response = await apiClient.post<{ success: boolean; data: Doctor }>(
      `/healthcare/doctors/${id}/review`,
      data
    )
    return response.data.data
  },
}


