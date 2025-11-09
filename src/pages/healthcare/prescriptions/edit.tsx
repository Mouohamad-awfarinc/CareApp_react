import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import {
  usePrescription,
  useUpdatePrescription,
} from "@/hooks/use-healthcare";

export function EditPrescription() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: "",
  });

  const { data: prescription, isLoading } = usePrescription(Number(id));
  const updatePrescription = useUpdatePrescription();

  useEffect(() => {
    if (prescription) {
      setFormData({
        medication_name: prescription.medication_name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        notes: prescription.notes || "",
      });
    }
  }, [prescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePrescription.mutateAsync({
        id: Number(id),
        data: {
          medication_name: formData.medication_name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          duration: formData.duration,
          notes: formData.notes || undefined,
        },
      });
      navigate("/healthcare/prescriptions");
    } catch (error) {
      console.error("Failed to update prescription:", error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-8">Loading prescription...</div>
      </AppLayout>
    );
  }

  if (!prescription) {
    return (
      <AppLayout>
        <div className="text-center py-8">Prescription not found</div>
      </AppLayout>
    );
  }

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
            <h1 className="text-2xl font-bold">Edit Prescription</h1>
            <p className="text-muted-foreground">Update prescription information</p>
          </div>
        </div>

        {/* Current Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">
                  {prescription.patient ? prescription.patient.name : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">
                  {prescription.doctor ? prescription.doctor.name : "N/A"}
                </p>
              </div>
              {prescription.visit && (
                <div>
                  <p className="text-sm text-muted-foreground">Visit</p>
                  <p className="font-medium">Visit #{prescription.visit.id}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Prescription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
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
                <Button type="submit" disabled={updatePrescription.isPending}>
                  {updatePrescription.isPending ? "Updating..." : "Update Prescription"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
