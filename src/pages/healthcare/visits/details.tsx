import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useVisit,
  useVisitPrescriptions,
  useVisitLabTests,
} from "@/hooks/use-healthcare";
import type { LabTest, Prescription } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    in_progress: "bg-yellow-500",
    completed: "bg-green-500",
  };
  return colors[status] || "bg-gray-500";
};

export function VisitDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: visitData, isLoading } = useVisit(Number(id));
  const { data: prescriptionsData } = useVisitPrescriptions(Number(id));
  const { data: labTestsData } = useVisitLabTests(Number(id));

  const visit = visitData?.data;
  const prescriptions = prescriptionsData?.data || [];
  const labTests = labTestsData?.data || [];

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
            <h1 className="text-2xl font-bold">Visit Details #{visit.id}</h1>
            <p className="text-muted-foreground">View complete visit information</p>
          </div>
        </div>

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
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(visit.status)}>
                  {visit.status.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Started At</p>
                <p className="font-medium">{new Date(visit.started_at).toLocaleString()}</p>
              </div>
              {visit.ended_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Ended At</p>
                  <p className="font-medium">{new Date(visit.ended_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {visit.diagnosis && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{visit.diagnosis}</p>
            </CardContent>
          </Card>
        )}

        {visit.doctor_notes && (
          <Card>
            <CardHeader>
              <CardTitle>Doctor Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{visit.doctor_notes}</p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList>
            <TabsTrigger value="prescriptions">
              Prescriptions ({prescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="lab-tests">Lab Tests ({labTests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No prescriptions found for this visit
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((prescription: Prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell>{prescription.medication_name}</TableCell>
                          <TableCell>{prescription.dosage}</TableCell>
                          <TableCell>{prescription.frequency}</TableCell>
                          <TableCell>{prescription.duration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab-tests">
            <Card>
              <CardHeader>
                <CardTitle>Lab Tests</CardTitle>
              </CardHeader>
              <CardContent>
                {labTests.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No lab tests found for this visit
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Test Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labTests.map((labTest: LabTest) => (
                        <TableRow key={labTest.id}>
                          <TableCell>{labTest.test_name}</TableCell>
                          <TableCell>{labTest.test_code}</TableCell>
                          <TableCell>
                            <Badge>{labTest.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(labTest.requested_date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate("/healthcare/visits")}>
            Back to Visits
          </Button>
          <Button onClick={() => navigate(`/healthcare/visits/${id}/edit`)}>Edit Visit</Button>
        </div>
      </div>
    </AppLayout>
  );
}
