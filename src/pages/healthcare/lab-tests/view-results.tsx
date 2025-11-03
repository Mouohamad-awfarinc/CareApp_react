import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { useLabTest } from "@/hooks/use-healthcare";

// Helper function to get full file URL
const getFileUrl = (filePath: string | null) => {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  return `${apiBaseUrl.replace("/api", "")}/storage/${filePath}`;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
};

export function ViewLabTestResults() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: labTestData, isLoading } = useLabTest(Number(id));

  const labTest = labTestData?.data;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-8">Loading lab test...</div>
      </AppLayout>
    );
  }

  if (!labTest) {
    return (
      <AppLayout>
        <div className="text-center py-8">Lab test not found</div>
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
            onClick={() => navigate("/healthcare/lab-tests")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Lab Test Results</h1>
            <p className="text-muted-foreground">
              View laboratory test details and results
            </p>
          </div>
        </div>

        {/* Test Information */}
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Test Name</p>
                <p className="font-medium">{labTest.test_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Test Code</p>
                <p className="font-medium">{labTest.test_code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">
                  {labTest.patient ? labTest.patient.name : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">
                  {labTest.doctor ? labTest.doctor.name : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested Date</p>
                <p className="font-medium">
                  {new Date(labTest.requested_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(labTest.status)}>
                  {labTest.status.replace("_", " ")}
                </Badge>
              </div>
              {labTest.visit && (
                <div>
                  <p className="text-sm text-muted-foreground">Associated Visit</p>
                  <p className="font-medium">Visit #{labTest.visit.id}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Test Results</CardTitle>
              {!labTest.result_file_path && (
                <Button
                  onClick={() =>
                    navigate(`/healthcare/lab-tests/${id}/upload-results`)
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Results
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {labTest.result_file_path ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Result File</p>
                    <p className="text-sm text-muted-foreground">
                      Click to download or view the test results
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                  >
                    <a
                      href={getFileUrl(labTest.result_file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>

                {/* Display if it's an image */}
                {labTest.result_file_path.match(/\.(jpg|jpeg|png|gif)$/i) && (
                  <div className="mt-4">
                    <img
                      src={getFileUrl(labTest.result_file_path)}
                      alt="Lab Test Result"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}

                {/* Display if it's a PDF */}
                {labTest.result_file_path.match(/\.pdf$/i) && (
                  <div className="mt-4">
                    <iframe
                      src={getFileUrl(labTest.result_file_path)}
                      className="w-full h-[600px] border rounded-lg"
                      title="Lab Test Result PDF"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No results uploaded yet</p>
                <Button
                  className="mt-4"
                  onClick={() =>
                    navigate(`/healthcare/lab-tests/${id}/upload-results`)
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/healthcare/lab-tests")}
          >
            Back to Lab Tests
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
