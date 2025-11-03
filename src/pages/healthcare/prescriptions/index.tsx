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
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import {
  usePrescriptions,
  useDeletePrescription,
  useDoctors,
  usePatients,
} from "@/hooks/use-healthcare";
import { SearchInput } from "@/components/data-table/search-input";
import { Pagination } from "@/components/data-table/pagination";
import type { Prescription } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Prescriptions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [patientFilter, setPatientFilter] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState(1);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPrescription, setDeletingPrescription] = useState<Prescription | null>(null);

  // Fetch data
  const { data: prescriptionsData, isLoading } = usePrescriptions(page, {
    doctor_id: doctorFilter !== "all" ? Number(doctorFilter) : undefined,
    patient_id: patientFilter !== "all" ? Number(patientFilter) : undefined,
    search: searchQuery || undefined,
  });

  const { data: doctorsData } = useDoctors(1, {});
  const { data: patientsData } = usePatients(1, {});

  const deletePrescription = useDeletePrescription();

  const prescriptions = prescriptionsData?.data || [];
  const doctors = doctorsData?.data || [];
  const patients = patientsData?.data || [];
  const meta = prescriptionsData?.meta;

  const handleDelete = async () => {
    if (!deletingPrescription) return;
    try {
      await deletePrescription.mutateAsync(deletingPrescription.id);
      setDeleteDialogOpen(false);
      setDeletingPrescription(null);
    } catch (error) {
      console.error("Failed to delete prescription:", error);
    }
  };

  const openDeleteDialog = (prescription: Prescription) => {
    setDeletingPrescription(prescription);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Search by medication name..."
                />
              </div>
              <Button onClick={() => navigate("/healthcare/prescriptions/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Prescription
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading prescriptions...</div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No prescriptions found
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((prescription: Prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell className="font-medium">
                          {prescription.medication_name}
                        </TableCell>
                        <TableCell>
                          {prescription.patient ? prescription.patient.name : "N/A"}
                        </TableCell>
                        <TableCell>
                          {prescription.doctor ? prescription.doctor.name : "N/A"}
                        </TableCell>
                        <TableCell>{prescription.dosage}</TableCell>
                        <TableCell>{prescription.frequency}</TableCell>
                        <TableCell>{prescription.duration}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/healthcare/prescriptions/${prescription.id}/view`)
                              }
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/healthcare/prescriptions/${prescription.id}/edit`)
                              }
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(prescription)}
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
            <DialogTitle>Delete Prescription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the prescription for "
              {deletingPrescription?.medication_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
