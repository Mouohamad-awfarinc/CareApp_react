import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePrescription } from "@/hooks/use-healthcare";

export function ViewPrescription() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: prescriptionData, isLoading } = usePrescription(Number(id));

  const prescription = prescriptionData?.data;

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
            <h1 className="text-2xl font-bold">Prescription Details</h1>
            <p className="text-muted-foreground">View prescription information</p>
          </div>
        </div>

        {/* Prescription Information */}
        <Card>
          <CardHeader>
            <CardTitle>Prescription Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medication Name</p>
                <p className="font-medium text-lg">{prescription.medication_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dosage</p>
                <p className="font-medium text-lg">{prescription.dosage}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frequency</p>
                <p className="font-medium">{prescription.frequency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-medium">{prescription.duration}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient & Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient & Doctor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Patient</p>
                <p className="font-medium">
                  {prescription.patient ? prescription.patient.name : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Doctor</p>
                <p className="font-medium">
                  {prescription.doctor ? prescription.doctor.name : "N/A"}
                </p>
              </div>
              {prescription.visit && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Associated Visit</p>
                  <p className="font-medium">Visit #{prescription.visit.id}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {prescription.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{prescription.notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/healthcare/prescriptions")}
          >
            Back to Prescriptions
          </Button>
          <Button
            onClick={() => navigate(`/healthcare/prescriptions/${id}/edit`)}
          >
            Edit Prescription
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
