import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import {
  useCreateLabTest,
  useDoctors,
  usePatients,
  useVisits,
} from "@/hooks/use-healthcare";
import type { Visit } from "@/types";

export function CreateLabTest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    visit_id: "",
    patient_id: "",
    doctor_id: "",
    test_name: "",
    status: "pending",
  });

  const createLabTest = useCreateLabTest();
  const { data: doctorsData } = useDoctors(1, {});
  const { data: patientsData } = usePatients(1, {});
  const { data: visitsData } = useVisits(1, {});

  const doctors = doctorsData?.data || [];
  const patients = patientsData?.data || [];
  const visits = visitsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLabTest.mutateAsync({
        visit_id: Number(formData.visit_id),
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
        test_name: formData.test_name,
        status: formData.status,
      });
      navigate("/healthcare/lab-tests");
    } catch (error) {
      console.error("Failed to create lab test:", error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/healthcare/lab-tests")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Lab Test</h1>
            <p className="text-muted-foreground">
              Add a new laboratory test request
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lab Test Information</CardTitle>
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
                        <SelectItem
                          key={patient.id}
                          value={patient.id.toString()}
                        >
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
                  <Label htmlFor="test_name">Test Name *</Label>
                  <Input
                    id="test_name"
                    value={formData.test_name}
                    onChange={(e) =>
                      setFormData({ ...formData, test_name: e.target.value })
                    }
                    placeholder="e.g., Complete Blood Count"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/healthcare/lab-tests")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLabTest.isPending}>
                  {createLabTest.isPending ? "Creating..." : "Create Lab Test"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
