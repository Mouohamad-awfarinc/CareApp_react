import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { useLabTest, useUploadLabTestResult } from "@/hooks/use-healthcare";

export function UploadLabTestResults() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [resultFile, setResultFile] = useState<File | null>(null);

  const { data: labTestData, isLoading } = useLabTest(Number(id));
  const uploadLabTestResult = useUploadLabTestResult();

  const labTest = labTestData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultFile) return;

    try {
      await uploadLabTestResult.mutateAsync({
        labTestId: Number(id),
        file: resultFile,
      });

      navigate(`/healthcare/lab-tests/${id}/view-results`);
    } catch (error) {
      console.error("Failed to upload lab test result:", error);
    }
  };

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
            <h1 className="text-2xl font-bold">Upload Lab Test Results</h1>
            <p className="text-muted-foreground">
              Upload results for {labTest.test_name}
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
            </div>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Result File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="result_file">
                  Result File * (PDF, Images, or Documents)
                </Label>
                <Input
                  id="result_file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setResultFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Upload lab test results in PDF, image, or document format
                </p>
              </div>

              {resultFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected File:</p>
                  <p className="text-sm text-muted-foreground">{resultFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Size: {(resultFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/healthcare/lab-tests")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!resultFile || uploadLabTestResult.isPending}
                >
                  {uploadLabTestResult.isPending ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Results
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
