import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useVisit, useUpdateVisit } from "@/hooks/use-healthcare";

export function EditVisit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    diagnosis: "",
    doctor_notes: "",
    status: "in_progress",
  });

  const { data: visitData, isLoading } = useVisit(Number(id));
  const updateVisit = useUpdateVisit();

  const visit = visitData;

  useEffect(() => {
    if (visit) {
      setFormData({
        diagnosis: visit.diagnosis || "",
        doctor_notes: visit.doctor_notes || "",
        status: visit.status,
      });
    }
  }, [visit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateVisit.mutateAsync({
        id: Number(id),
        data: {
          diagnosis: formData.diagnosis || undefined,
          doctor_notes: formData.doctor_notes || undefined,
          status: formData.status as "in_progress" | "completed",
        },
      });
      navigate("/healthcare/visits");
    } catch (error) {
      console.error("Failed to update visit:", error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-8">Loading visit...</div>
      </AppLayout>
    );
  }

  if (!visit) {
    return (
      <AppLayout>
        <div className="text-center py-8">Visit not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/healthcare/visits")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Visit</h1>
            <p className="text-muted-foreground">Update visit information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{visit.patient ? visit.patient.name : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">{visit.doctor ? visit.doctor.name : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clinic</p>
                <p className="font-medium">{visit.clinic ? visit.clinic.name : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Started At</p>
                <p className="font-medium">{visit.started_at ? new Date(visit.started_at).toLocaleString() : "Not started"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Enter diagnosis..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor_notes">Doctor Notes</Label>
                <Textarea
                  id="doctor_notes"
                  value={formData.doctor_notes}
                  onChange={(e) => setFormData({ ...formData, doctor_notes: e.target.value })}
                  placeholder="Enter doctor notes..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate("/healthcare/visits")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateVisit.isPending}>
                  {updateVisit.isPending ? "Updating..." : "Update Visit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
