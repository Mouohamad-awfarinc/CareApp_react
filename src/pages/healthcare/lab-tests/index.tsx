import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, Pencil, Trash2, Upload } from "lucide-react";
import {
  useLabTests,
  useDeleteLabTest,
  useDoctors,
  usePatients,
} from "@/hooks/use-healthcare";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/data-table/search-input";
import { Pagination } from "@/components/data-table/pagination";
import type { LabTest } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
};

export function LabTests() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [patientFilter, setPatientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState(1);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLabTest, setDeletingLabTest] = useState<LabTest | null>(null);

  // Fetch data
  const { data: labTestsData, isLoading } = useLabTests(page, {
    doctor_id: doctorFilter !== "all" ? Number(doctorFilter) : undefined,
    patient_id: patientFilter !== "all" ? Number(patientFilter) : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  const { data: doctorsData } = useDoctors(1, {});
  const { data: patientsData } = usePatients(1, {});

  const deleteLabTest = useDeleteLabTest();

  const labTests = labTestsData?.data || [];
  const doctors = doctorsData?.data || [];
  const patients = patientsData?.data || [];
  const meta = labTestsData?.meta;

  const handleDelete = async () => {
    if (!deletingLabTest) return;
    try {
      await deleteLabTest.mutateAsync(deletingLabTest.id);
      setDeleteDialogOpen(false);
      setDeletingLabTest(null);
    } catch (error) {
      console.error("Failed to delete lab test:", error);
    }
  };

  const openDeleteDialog = (labTest: LabTest) => {
    setDeletingLabTest(labTest);
    setDeleteDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Doctor</label>
                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Patient</label>
                <Select value={patientFilter} onValueChange={setPatientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Patients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by test name or code..."
                />
              </div>
              <Button onClick={() => navigate("/healthcare/lab-tests/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lab Test
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading lab tests...</div>
            ) : labTests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No lab tests found
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Has Results</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labTests.map((labTest: LabTest) => (
                      <TableRow key={labTest.id}>
                        <TableCell className="font-medium">
                          {labTest.test_name}
                        </TableCell>
                        <TableCell>
                          {labTest.patient ? labTest.patient.name : "N/A"}
                        </TableCell>
                        <TableCell>
                          {labTest.doctor ? labTest.doctor.name : "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(labTest.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(labTest.status)}>
                            {labTest.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {labTest.result_file_path ? (
                            <Badge className="bg-green-500">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/healthcare/lab-tests/${labTest.id}/view-results`)
                              }
                              title="View Results"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/healthcare/lab-tests/${labTest.id}/edit`)
                              }
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {labTest.status === "pending" && !labTest.result_file_path && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  navigate(`/healthcare/lab-tests/${labTest.id}/upload-results`)
                                }
                                title="Upload Results"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(labTest)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {meta && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={meta.current_page}
                      lastPage={meta.last_page}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lab Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingLabTest?.test_name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
