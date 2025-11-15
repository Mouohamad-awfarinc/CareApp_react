/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { healthcareService, companyService } from "@/services/healthcare"
import type {
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
  DoctorPreferredMedicine,
} from "@/types"

// Specialties hooks
export function useSpecialties(page: number = 1, filters?: { search?: string }) {
  return useQuery({
    queryKey: ["specialties", page, filters],
    queryFn: () => healthcareService.getSpecialties(page, filters),
  })
}

export function useSpecialty(id: number) {
  return useQuery({
    queryKey: ["specialty", id],
    queryFn: () => healthcareService.getSpecialtyById(id),
    enabled: !!id,
  })
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSpecialtyRequest) => healthcareService.createSpecialty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] })
    },
  })
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSpecialtyRequest }) =>
      healthcareService.updateSpecialty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] })
      queryClient.invalidateQueries({ queryKey: ["specialty", variables.id] })
    },
  })
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.deleteSpecialty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] })
    },
  })
}

// Clinics hooks
export function useClinics(
  page: number = 1,
  filters?: {
    search?: string
    city?: string
    category?: string
    is_active?: boolean
    per_page?: number
  }
) {
  return useQuery({
    queryKey: ["clinics", page, filters],
    queryFn: () => healthcareService.getClinics(page, filters),
  })
}

export function useClinic(id: number) {
  return useQuery({
    queryKey: ["clinic", id],
    queryFn: () => healthcareService.getClinicById(id),
    enabled: !!id,
  })
}

export function useCreateClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClinicRequest) => healthcareService.createClinic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] })
    },
  })
}

export function useUpdateClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClinicRequest }) =>
      healthcareService.updateClinic(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] })
      queryClient.invalidateQueries({ queryKey: ["clinic", variables.id] })
    },
  })
}

export function useUpdateClinicPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, photo }: { id: number; photo: File }) =>
      healthcareService.updateClinicPhoto(id, photo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] })
      queryClient.invalidateQueries({ queryKey: ["clinic", variables.id] })
    },
  })
}

export function useDeleteClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.deleteClinic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] })
    },
  })
}

export function useClinicDoctors(id: number, page: number = 1) {
  return useQuery({
    queryKey: ["clinic-doctors", id, page],
    queryFn: () => healthcareService.getClinicDoctors(id, page),
    enabled: !!id,
  })
}

export function useClinicPatients(id: number, page: number = 1) {
  return useQuery({
    queryKey: ["clinic-patients", id, page],
    queryFn: () => healthcareService.getClinicPatients(id, page),
    enabled: !!id,
  })
}

// Doctors hooks
export function useDoctors(
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
) {
  return useQuery({
    queryKey: ["doctors", page, filters],
    queryFn: () => healthcareService.getDoctors(page, filters),
  })
}

export function useDoctor(id: number) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => healthcareService.getDoctorById(id),
    enabled: !!id,
  })
}

export function useCreateDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDoctorRequest) => healthcareService.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
    },
  })
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDoctorRequest }) =>
      healthcareService.updateDoctor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.id] })
    },
  })
}

export function useUpdateDoctorFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, type, file }: { id: number; type: "photo" | "license_card"; file: File }) =>
      healthcareService.updateDoctorFile(id, type, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.id] })
    },
  })
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
    },
  })
}

// Doctor Review hooks
export function usePendingReviewDoctors(
  page: number = 1,
  filters?: {
    search?: string
    specialty_id?: number
  }
) {
  return useQuery({
    queryKey: ["pending-review-doctors", page, filters],
    queryFn: () => healthcareService.getPendingReviewDoctors(page, filters),
  })
}

export function useReviewDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewDoctorRequest }) =>
      healthcareService.reviewDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
      queryClient.invalidateQueries({ queryKey: ["pending-review-doctors"] })
    },
  })
}

export function useDoctorPatients(id: number, page: number = 1) {
  return useQuery({
    queryKey: ["doctor-patients", id, page],
    queryFn: () => healthcareService.getDoctorPatients(id, page),
    enabled: !!id,
  })
}

export function useDoctorClinics(id: number) {
  return useQuery({
    queryKey: ["doctor-clinics", id],
    queryFn: () => healthcareService.getDoctorClinics(id),
    enabled: !!id,
  })
}

export function useAssignDoctorToClinics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorId, clinics }: { doctorId: number; clinics: Array<{ clinic_id: number; is_active?: boolean }> }) =>
      healthcareService.assignDoctorsToClinic(doctorId, clinics),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.doctorId] })
      queryClient.invalidateQueries({ queryKey: ["doctor-clinics", variables.doctorId] })
    },
  })
}

// Doctor-Clinic CRUD hooks
export function useAllDoctorClinics(
  page: number = 1,
  filters?: {
    doctor_id?: number
    clinic_id?: number
    active?: boolean
  }
) {
  return useQuery({
    queryKey: ["all-doctor-clinics", page, filters],
    queryFn: () => healthcareService.getAllDoctorClinics(page, filters),
  })
}

export function useDoctorClinic(id: number) {
  return useQuery({
    queryKey: ["doctor-clinic", id],
    queryFn: () => healthcareService.getDoctorClinicById(id),
    enabled: !!id,
  })
}

export function useCreateDoctorClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => healthcareService.createDoctorClinic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-doctor-clinics"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-clinics"] })
    },
  })
}

export function useUpdateDoctorClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      healthcareService.updateDoctorClinic(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-doctor-clinics"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-clinics"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-clinic", variables.id] })
    },
  })
}

export function useDeleteDoctorClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.deleteDoctorClinic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-doctor-clinics"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-clinics"] })
    },
  })
}

export function useToggleDoctorClinicStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.toggleDoctorClinicStatus(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-doctor-clinics"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-clinics"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-clinic", variables] })
    },
  })
}

// Patients hooks
export function usePatients(
  page: number = 1,
  filters?: {
    search?: string
    gender?: string
    clinic_id?: number
    doctor_id?: number
    per_page?: number
  }
) {
  return useQuery({
    queryKey: ["patients", page, filters],
    queryFn: () => healthcareService.getPatients(page, filters),
  })
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => healthcareService.getPatientById(id),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePatientRequest) => healthcareService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePatientRequest }) =>
      healthcareService.updatePatient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      queryClient.invalidateQueries({ queryKey: ["patient", variables.id] })
    },
  })
}

export function useUpdatePatientFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, type, file }: { id: number; type: "photo"; file: File }) =>
      healthcareService.updatePatientFile(id, type, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      queryClient.invalidateQueries({ queryKey: ["patient", variables.id] })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}

export function usePatientProfiles(id: number) {
  return useQuery({
    queryKey: ["patient-profiles", id],
    queryFn: () => healthcareService.getPatientProfiles(id),
    enabled: !!id,
  })
}

export function usePatientLatestProfile(id: number) {
  return useQuery({
    queryKey: ["patient-latest-profile", id],
    queryFn: () => healthcareService.getPatientLatestProfile(id),
    enabled: !!id,
  })
}

// Doctor Schedule hooks
export function useDoctorSchedule(doctorId: number, clinicId?: number) {
  return useQuery({
    queryKey: ["doctor-schedule", doctorId, clinicId],
    queryFn: () => healthcareService.getDoctorSchedule(doctorId, clinicId),
    enabled: !!doctorId,
  })
}

export function useUpdateDoctorSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorId, schedules }: { doctorId: number; schedules: any[] }) =>
      healthcareService.updateDoctorSchedule(doctorId, schedules),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-schedule", variables.doctorId] })
      queryClient.invalidateQueries({ queryKey: ["doctor-clinic-schedules"] })
    },
  })
}

// Patient Appointments hooks
export function usePatientAppointments(patientId: number, filters?: any) {
  return useQuery({
    queryKey: ["patient-appointments", patientId, filters],
    queryFn: () => healthcareService.getPatientAppointments(patientId, filters),
    enabled: !!patientId,
  })
}

// Patient Visits hooks
export function usePatientVisits(patientId: number, filters?: any) {
  return useQuery({
    queryKey: ["patient-visits", patientId, filters],
    queryFn: () => healthcareService.getPatientVisits(patientId, filters),
    enabled: !!patientId,
  })
}

// Patient Prescriptions hooks
export function usePatientPrescriptions(patientId: number, filters?: any) {
  return useQuery({
    queryKey: ["patient-prescriptions", patientId, filters],
    queryFn: () => healthcareService.getPatientPrescriptions(patientId, filters),
    enabled: !!patientId,
  })
}

// Patient Documents hooks
export function usePatientDocuments(patientId: number, filters?: any) {
  return useQuery({
    queryKey: ["patient-documents", patientId, filters],
    queryFn: () => healthcareService.getPatientDocuments(patientId, filters),
    enabled: !!patientId,
  })
}

export function useUploadPatientDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ patientId, file, documentType, visitId }: { 
      patientId: number
      file: File
      documentType: string
      visitId?: number 
    }) => healthcareService.uploadPatientDocument(patientId, file, documentType, visitId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents", variables.patientId] })
    },
  })
}

export function useDeletePatientDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: number) => healthcareService.deletePatientDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents"] })
    },
  })
}

// Patient Profile hooks
export function useCreatePatientProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => healthcareService.createPatientProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profiles"] })
      queryClient.invalidateQueries({ queryKey: ["patient-latest-profile"] })
    },
  })
}

export function useUpdatePatientProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ profileId, data }: { profileId: number; data: any }) =>
      healthcareService.updatePatientProfile(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profiles"] })
      queryClient.invalidateQueries({ queryKey: ["patient-latest-profile"] })
    },
  })
}

// Doctor Clinic Schedules hooks
export function useDoctorClinicSchedules(filters?: any) {
  return useQuery({
    queryKey: ["doctor-clinic-schedules", filters],
    queryFn: () => healthcareService.getDoctorClinicSchedules(filters),
  })
}

export function useCreateDoctorClinicSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => healthcareService.createDoctorClinicSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-clinic-schedules"] })
    },
  })
}

export function useUpdateDoctorClinicSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      healthcareService.updateDoctorClinicSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-clinic-schedules"] })
    },
  })
}

export function useDeleteDoctorClinicSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.deleteDoctorClinicSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-clinic-schedules"] })
    },
  })
}

// Appointments hooks
export function useAppointments(page: number = 1, filters?: any) {
  return useQuery({
    queryKey: ["appointments", page, filters],
    queryFn: () => healthcareService.getAppointments(page, filters),
  })
}

export function useAppointment(id: number) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => healthcareService.getAppointmentById(id),
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => healthcareService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] })
    },
  })
}

export function useAvailableSlots(doctorId: number, clinicId: number, date: string) {
  return useQuery({
    queryKey: ["available-slots", doctorId, clinicId, date],
    queryFn: () => healthcareService.getAvailableSlots(doctorId, clinicId, date),
    enabled: !!doctorId && !!clinicId && !!date,
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      healthcareService.updateAppointment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["appointment", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      healthcareService.updateAppointmentStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["appointment", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      healthcareService.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] })
    },
  })
}

// Visits hooks
export function useVisits(page: number = 1, filters?: any) {
  return useQuery({
    queryKey: ["visits", page, filters],
    queryFn: () => healthcareService.getVisits(page, filters),
  })
}

export function useVisit(id: number) {
  return useQuery({
    queryKey: ["visit", id],
    queryFn: () => healthcareService.getVisitById(id),
    enabled: !!id,
  })
}

export function useCreateVisit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => healthcareService.createVisit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] })
      queryClient.invalidateQueries({ queryKey: ["patient-visits"] })
    },
  })
}

export function useUpdateVisit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      healthcareService.updateVisit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visits"] })
      queryClient.invalidateQueries({ queryKey: ["visit", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["patient-visits"] })
    },
  })
}

export function useCompleteVisit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.completeVisit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] })
      queryClient.invalidateQueries({ queryKey: ["patient-visits"] })
    },
  })
}

export function useVisitPrescriptions(visitId: number) {
  return useQuery({
    queryKey: ["visit-prescriptions", visitId],
    queryFn: () => healthcareService.getVisitPrescriptions(visitId),
    enabled: !!visitId,
  })
}

export function useVisitLabTests(visitId: number) {
  return useQuery({
    queryKey: ["visit-lab-tests", visitId],
    queryFn: () => healthcareService.getVisitLabTests(visitId),
    enabled: !!visitId,
  })
}

// Prescriptions hooks
export function usePrescriptions(page: number = 1, filters?: any) {
  return useQuery({
    queryKey: ["prescriptions", page, filters],
    queryFn: () => healthcareService.getPrescriptions(page, filters),
  })
}

export function usePrescription(id: number) {
  return useQuery({
    queryKey: ["prescription", id],
    queryFn: () => healthcareService.getPrescriptionById(id),
    enabled: !!id,
  })
}

export function useCreatePrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => healthcareService.createPrescription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      queryClient.invalidateQueries({ queryKey: ["visit-prescriptions"] })
      queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] })
    },
  })
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      healthcareService.updatePrescription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      queryClient.invalidateQueries({ queryKey: ["prescription", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["visit-prescriptions"] })
      queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] })
    },
  })
}

export function useDeletePrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.deletePrescription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      queryClient.invalidateQueries({ queryKey: ["visit-prescriptions"] })
      queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] })
    },
  })
}

// Lab Tests hooks
export function useLabTests(page: number = 1, filters?: any) {
  return useQuery({
    queryKey: ["lab-tests", page, filters],
    queryFn: () => healthcareService.getLabTests(page, filters),
  })
}

export function useLabTest(id: number) {
  return useQuery({
    queryKey: ["lab-test", id],
    queryFn: () => healthcareService.getLabTestById(id),
    enabled: !!id,
  })
}

export function useCreateLabTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => healthcareService.createLabTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] })
      queryClient.invalidateQueries({ queryKey: ["visit-lab-tests"] })
    },
  })
}

export function useUpdateLabTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      healthcareService.updateLabTest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] })
      queryClient.invalidateQueries({ queryKey: ["lab-test", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["visit-lab-tests"] })
    },
  })
}

export function useUploadLabTestResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ labTestId, file, result }: { labTestId: number; file: File; result?: string }) =>
      healthcareService.uploadLabTestResult(labTestId, file, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] })
      queryClient.invalidateQueries({ queryKey: ["visit-lab-tests"] })
    },
  })
}

export function useDeleteLabTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.deleteLabTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] })
      queryClient.invalidateQueries({ queryKey: ["visit-lab-tests"] })
    },
  })
}

// Medicines hooks
export function useMedicines(
  page: number = 1,
  filters?: {
    search?: string
    active_ingredient?: string
    dosage_form?: string
    manufacturer?: string
    is_active?: boolean
  }
) {
  return useQuery({
    queryKey: ["medicines", page, filters],
    queryFn: () => healthcareService.getMedicines(page, filters),
  })
}

export function useMedicine(id: number) {
  return useQuery({
    queryKey: ["medicine", id],
    queryFn: () => healthcareService.getMedicineById(id),
    enabled: !!id,
  })
}

export function useCreateMedicine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMedicineRequest) => healthcareService.createMedicine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] })
    },
  })
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMedicineRequest }) =>
      healthcareService.updateMedicine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] })
      queryClient.invalidateQueries({ queryKey: ["medicine", variables.id] })
    },
  })
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => healthcareService.deleteMedicine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] })
    },
  })
}

// Doctor Preferred Medicines hooks
export function useDoctorPreferredMedicines(doctorId: number) {
  return useQuery({
    queryKey: ["doctor-preferred-medicines", doctorId],
    queryFn: () => healthcareService.getDoctorPreferredMedicines(doctorId),
    enabled: !!doctorId,
  })
}

export function useUpdateDoctorPreferredMedicines() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: number; data: DoctorPreferredMedicine[] }) =>
      healthcareService.updateDoctorPreferredMedicines(doctorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-preferred-medicines", variables.doctorId] })
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.doctorId] })
    },
  })
}

export function useAddDoctorPreferredMedicine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorId, medicineId }: { doctorId: number; medicineId: number }) =>
      healthcareService.addDoctorPreferredMedicine(doctorId, medicineId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-preferred-medicines", variables.doctorId] })
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.doctorId] })
    },
  })
}

export function useRemoveDoctorPreferredMedicine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorId, medicineId }: { doctorId: number; medicineId: number }) =>
      healthcareService.removeDoctorPreferredMedicine(doctorId, medicineId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-preferred-medicines", variables.doctorId] })
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.doctorId] })
    },
  })
}

// Companies hooks
export function useCompanies(
  page: number = 1,
  filters?: {
    search?: string
    city?: string
    is_active?: boolean
  }
) {
  return useQuery({
    queryKey: ["companies", page, filters],
    queryFn: () => companyService.getCompanies(page, filters),
  })
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => companyService.getCompanyById(id),
    enabled: !!id,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => companyService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyRequest }) =>
      companyService.updateCompany(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] })
    },
  })
}

export function useUpdateCompanyLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, logo }: { id: number; logo: File }) =>
      companyService.updateCompanyLogo(id, logo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => companyService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}

export function useToggleCompanyStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => companyService.toggleCompanyStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}

export function useCompanyClinics(id: number, page: number = 1) {
  return useQuery({
    queryKey: ["company-clinics", id, page],
    queryFn: () => companyService.getCompanyClinics(id, page),
    enabled: !!id,
  })
}

export function useAssignClinicToCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ companyId, clinicId }: { companyId: number; clinicId: number }) =>
      companyService.assignClinicToCompany(companyId, clinicId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["company", variables.companyId] })
      queryClient.invalidateQueries({ queryKey: ["company-clinics", variables.companyId] })
      queryClient.invalidateQueries({ queryKey: ["clinics"] })
    },
  })
}

export function useUnassignClinicFromCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ companyId, clinicId }: { companyId: number; clinicId: number }) =>
      companyService.unassignClinicFromCompany(companyId, clinicId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["company", variables.companyId] })
      queryClient.invalidateQueries({ queryKey: ["company-clinics", variables.companyId] })
      queryClient.invalidateQueries({ queryKey: ["clinics"] })
    },
  })
}

// Searchable select hooks for appointment creation
export function useSearchablePatients(search: string) {
  return useQuery({
    queryKey: ["searchable-patients", search],
    queryFn: () => healthcareService.getPatients(1, { search, per_page: 50 }),
    enabled: search.length > 0,
  })
}

export function useSearchableClinics(search: string) {
  return useQuery({
    queryKey: ["searchable-clinics", search],
    queryFn: () => healthcareService.getClinics(1, { search, per_page: 50 }),
    enabled: search.length > 0,
  })
}

export function useSearchableDoctors(search: string, clinicId?: number) {
  return useQuery({
    queryKey: ["searchable-doctors", search, clinicId],
    queryFn: () => healthcareService.getDoctors(1, {
      search,
      clinic_id: clinicId,
      per_page: 50
    }),
    enabled: search.length > 0,
  })
}


