import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  useLabTest,
  useUpdateLabTest,
} from "@/hooks/use-healthcare";

export function EditLabTest() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    test_name: "",
    test_code: "",
    status: "pending",
  });

  const { data: labTestData, isLoading } = useLabTest(Number(id));
  const updateLabTest = useUpdateLabTest();

  const labTest = labTestData?.data;

  useEffect(() => {
    if (labTest) {
      setFormData({
        test_name: labTest.test_name,
        test_code: labTest.test_code,
        status: labTest.status,
      });
    }
  }, [labTest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLabTest.mutateAsync({
        id: Number(id),
        data: {
          test_name: formData.test_name,
          test_code: formData.test_code,
          status: formData.status,
        },
      });
      navigate("/healthcare/lab-tests");
    } catch (error) {
      console.error("Failed to update lab test:", error);
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
            <h1 className="text-2xl font-bold">Edit Lab Test</h1>
            <p className="text-muted-foreground">
              Update laboratory test information
            </p>
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
              {labTest.result_file_path && (
                <div>
                  <p className="text-sm text-muted-foreground">Results</p>
                  <p className="font-medium text-green-600">Available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Lab Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="test_code">Test Code *</Label>
                  <Input
                    id="test_code"
                    value={formData.test_code}
                    onChange={(e) =>
                      setFormData({ ...formData, test_code: e.target.value })
                    }
                    placeholder="e.g., CBC"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
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
                <Button type="submit" disabled={updateLabTest.isPending}>
                  {updateLabTest.isPending ? "Updating..." : "Update Lab Test"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
