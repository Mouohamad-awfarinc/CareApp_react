import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useCreatePrescription,
  useDoctors,
  usePatients,
  useVisits,
} from "@/hooks/use-healthcare";
import type { Visit } from "@/types";

export function CreatePrescription() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    visit_id: "",
    patient_id: "",
    doctor_id: "",
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: "",
  });

  const createPrescription = useCreatePrescription();
  const { data: doctorsData } = useDoctors(1, {});
  const { data: patientsData } = usePatients(1, {});
  const { data: visitsData } = useVisits(1, {});

  const doctors = doctorsData?.data || [];
  const patients = patientsData?.data || [];
  const visits = visitsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPrescription.mutateAsync({
        visit_id: formData.visit_id ? Number(formData.visit_id) : undefined,
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
        medication_name: formData.medication_name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        notes: formData.notes || undefined,
      });
      navigate("/healthcare/prescriptions");
    } catch (error) {
      console.error("Failed to create prescription:", error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/healthcare/prescriptions")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Prescription</h1>
            <p className="text-muted-foreground">Add a new prescription</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="visit_id">Visit (Optional)</Label>
                  <Select
                    value={formData.visit_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, visit_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Visit</SelectItem>
                      {visits.map((visit: Visit) => (
                        <SelectItem key={visit.id} value={visit.id.toString()}>
                          Visit #{visit.id} -{" "}
                          {new Date(visit.started_at).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medication_name">Medication Name *</Label>
                  <Input
                    id="medication_name"
                    value={formData.medication_name}
                    onChange={(e) =>
                      setFormData({ ...formData, medication_name: e.target.value })
                    }
                    placeholder="e.g., Amoxicillin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    placeholder="e.g., 3 times daily"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 7 days"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional instructions or notes..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/healthcare/prescriptions")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPrescription.isPending}>
                  {createPrescription.isPending ? "Creating..." : "Create Prescription"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
