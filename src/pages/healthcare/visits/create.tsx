import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import {
  useCreateVisit,
  useAppointments,
  usePatients,
  useDoctors,
  useClinics,
} from "@/hooks/use-healthcare";
import type { Appointment } from "@/types";

export function CreateVisit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    appointment_id: "",
    patient_id: "",
    doctor_id: "",
    clinic_id: "",
    diagnosis: "",
    doctor_notes: "",
  });

  const createVisit = useCreateVisit();
  const { data: appointmentsData } = useAppointments(1, { status: "confirmed" });
  const { data: patientsData } = usePatients(1, {});
  const { data: doctorsData } = useDoctors(1, {});
  const { data: clinicsData } = useClinics(1, {});

  const appointments = appointmentsData?.data || [];
  const patients = patientsData?.data || [];
  const doctors = doctorsData?.data || [];
  const clinics = clinicsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVisit.mutateAsync({
        appointment_id: Number(formData.appointment_id),
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
        clinic_id: Number(formData.clinic_id),
        diagnosis: formData.diagnosis || undefined,
        doctor_notes: formData.doctor_notes || undefined,
      });
      navigate("/healthcare/visits");
    } catch (error) {
      console.error("Failed to create visit:", error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/healthcare/visits")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Visit</h1>
            <p className="text-muted-foreground">Add a new patient visit</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visit Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment_id">Appointment *</Label>
                  <Select
                    value={formData.appointment_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, appointment_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointments.map((appointment: Appointment) => (
                        <SelectItem
                          key={appointment.id}
                          value={appointment.id.toString()}
                        >
                          Appointment #{appointment.id} -{" "}
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient_id">Patient *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, patient_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor_id">Doctor *</Label>
                  <Select
                    value={formData.doctor_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, doctor_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinic_id">Clinic *</Label>
                  <Select
                    value={formData.clinic_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clinic_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id.toString()}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosis: e.target.value })
                    }
                    placeholder="Enter diagnosis..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor_notes">Doctor Notes</Label>
                  <Textarea
                    id="doctor_notes"
                    value={formData.doctor_notes}
                    onChange={(e) =>
                      setFormData({ ...formData, doctor_notes: e.target.value })
                    }
                    placeholder="Enter doctor notes..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/healthcare/visits")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createVisit.isPending}>
                  {createVisit.isPending ? "Creating..." : "Create Visit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
