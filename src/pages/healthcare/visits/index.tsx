import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Eye, Pencil, CheckCircle } from "lucide-react";
import {
  useVisits,
  useClinics,
  useDoctors,
  usePatients,
} from "@/hooks/use-healthcare";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/data-table/search-input";
import { Pagination } from "@/components/data-table/pagination";
import type { Visit } from "@/types";

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    in_progress: "bg-yellow-500",
    completed: "bg-green-500",
  };
  return colors[status] || "bg-gray-500";
};

export function Visits() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [patientFilter, setPatientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(1);

  // Fetch data
  const { data: visitsData, isLoading } = useVisits(page, {
    clinic_id: clinicFilter !== "all" ? Number(clinicFilter) : undefined,
    doctor_id: doctorFilter !== "all" ? Number(doctorFilter) : undefined,
    patient_id: patientFilter !== "all" ? Number(patientFilter) : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    date_from: dateFromFilter || undefined,
    date_to: dateToFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: clinicsData } = useClinics(1, {});
  const { data: doctorsData } = useDoctors(1, {});
  const { data: patientsData } = usePatients(1, {});

  const visits = visitsData?.data || [];
  const clinics = clinicsData?.data || [];
  const doctors = doctorsData?.data || [];
  const patients = patientsData?.data || [];
  const meta = visitsData?.meta;

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
                <label className="text-sm font-medium">Clinic</label>
                <Select value={clinicFilter} onValueChange={setClinicFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Clinics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clinics</SelectItem>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id.toString()}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date From</label>
                <Input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date To</label>
                <Input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
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
                  placeholder="Search visits..."
                />
              </div>
              <Button onClick={() => navigate("/healthcare/visits/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Visit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading visits...</div>
            ) : visits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No visits found
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visit ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Started At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((visit: Visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">#{visit.id}</TableCell>
                        <TableCell>
                          {visit.patient ? visit.patient.name : "N/A"}
                        </TableCell>
                        <TableCell>
                          {visit.doctor ? visit.doctor.name : "N/A"}
                        </TableCell>
                        <TableCell>
                          {visit.clinic ? visit.clinic.name : "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(visit.started_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/healthcare/visits/${visit.id}/details`)
                              }
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/healthcare/visits/${visit.id}/edit`)
                              }
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {visit.status === "in_progress" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  navigate(`/healthcare/visits/${visit.id}/complete`)
                                }
                                title="Complete Visit"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
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
    </AppLayout>
  );
}
