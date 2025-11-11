import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchInput } from "@/components/data-table/search-input"
import { Pagination } from "@/components/data-table/pagination"
import { useDebounce } from "@/hooks/use-debounce"
import {
  usePendingReviewDoctors,
  useReviewDoctor,
  useSpecialties,
} from "@/hooks/use-healthcare"
import { CheckCircle, XCircle, Eye, FileText, ArrowLeft } from "lucide-react"
import type { Doctor } from "@/types"
const getImageUrl = (photoPath: string | null) => {
  if (!photoPath) return ""
  if (photoPath.startsWith("http")) return photoPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${photoPath}`
}

const getLicenseCardUrl = (licenseCardPath: string | null) => {
  if (!licenseCardPath) return ""
  if (licenseCardPath.startsWith("http")) return licenseCardPath
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  return `${apiBaseUrl.replace("/api", "")}/storage/${licenseCardPath}`
}

export function ReviewDoctors() {
  const navigate = useNavigate()

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewNotes, setReviewNotes] = useState("")

  // Doctors
  const [doctorsPage, setDoctorsPage] = useState(1)
  const { data: doctorsData, isLoading: loadingDoctors } = usePendingReviewDoctors(doctorsPage, {
    search: debouncedSearch || undefined,
    specialty_id:
      specialtyFilter && specialtyFilter !== "all" ? Number(specialtyFilter) : undefined,
  })

  // Specialties for filter
  const [specialtiesPage] = useState(1)
  const { data: specialtiesData } = useSpecialties(specialtiesPage)

  const doctors = doctorsData?.data || []
  const specialties = specialtiesData?.data || []

  const reviewDoctor = useReviewDoctor()

  const handleReview = async () => {
    if (!selectedDoctor) return

    try {
      await reviewDoctor.mutateAsync({
        id: selectedDoctor.id,
        data: {
          action: reviewAction,
          review_notes: reviewNotes || undefined,
        },
      })
      setReviewDialogOpen(false)
      setSelectedDoctor(null)
      setReviewNotes("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to review doctor"
      alert(errorMessage)
    }
  }

  const openReviewDialog = (doctor: Doctor, action: 'approve' | 'reject') => {
    setSelectedDoctor(doctor)
    setReviewAction(action)
    setReviewNotes("")
    setReviewDialogOpen(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/healthcare/doctors")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doctor License Review</h1>
            <p className="text-muted-foreground">Review pending doctor license applications</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>
              Doctors awaiting license card approval{" "}
              {doctorsData?.meta?.total ? `(${doctorsData.meta.total} total)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id.toString()}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            {loadingDoctors ? (
              <div className="text-center py-8 text-muted-foreground">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending reviews</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>License Number</TableHead>
                      <TableHead>License Card</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getImageUrl(doctor.photo)} alt={doctor.name} />
                            <AvatarFallback>{doctor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>
                          {doctor.specialty ? (
                            <Badge variant="secondary">{doctor.specialty.name}</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{doctor.license_number || "—"}</TableCell>
                        <TableCell>
                          {doctor.license_card ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(getLicenseCardUrl(doctor.license_card), '_blank')}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/healthcare/doctors/${doctor.id}/details`)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openReviewDialog(doctor, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openReviewDialog(doctor, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {doctorsData?.meta && (
                  <Pagination
                    currentPage={doctorsData.meta.current_page}
                    lastPage={doctorsData.meta.last_page}
                    onPageChange={setDoctorsPage}
                    total={doctorsData.meta.total}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Doctor License
              </DialogTitle>
              <DialogDescription>
                {reviewAction === 'approve'
                  ? 'Are you sure you want to approve this doctor\'s license?'
                  : 'Are you sure you want to reject this doctor\'s license?'
                }
              </DialogDescription>
            </DialogHeader>

            {selectedDoctor && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getImageUrl(selectedDoctor.photo)} alt={selectedDoctor.name} />
                    <AvatarFallback>{selectedDoctor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedDoctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Review Notes (Optional)</label>
                  <Textarea
                    placeholder="Add any notes about this review..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={reviewDoctor.isPending}
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              >
                {reviewDoctor.isPending ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}