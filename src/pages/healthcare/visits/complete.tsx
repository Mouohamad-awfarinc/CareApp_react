import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useVisit, useCompleteVisit } from "@/hooks/use-healthcare";

export function CompleteVisit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: visitData, isLoading } = useVisit(Number(id));
  const completeVisit = useCompleteVisit();

  const visit = visitData?.data;

  const handleComplete = async () => {
    try {
      await completeVisit.mutateAsync(Number(id));
      navigate("/healthcare/visits");
    } catch (error) {
      console.error("Failed to complete visit:", error);
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

  if (visit.status === "completed") {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">This visit is already completed</p>
          <Button className="mt-4" onClick={() => navigate("/healthcare/visits")}>
            Back to Visits
          </Button>
        </div>
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
            <h1 className="text-2xl font-bold">Complete Visit</h1>
            <p className="text-muted-foreground">Mark visit as completed</p>
          </div>
        </div>

        <Card className="border-yellow-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Confirm Completion</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You are about to mark this visit as completed. This action will finalize the visit
              record.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit Information</CardTitle>
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
                <p className="font-medium">{new Date(visit.started_at).toLocaleString()}</p>
              </div>
              {visit.diagnosis && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="font-medium">{visit.diagnosis}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate("/healthcare/visits")}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={completeVisit.isPending}>
            {completeVisit.isPending ? "Completing..." : "Complete Visit"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
