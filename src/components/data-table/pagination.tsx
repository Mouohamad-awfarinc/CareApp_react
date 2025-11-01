import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
  total?: number
  from?: number
  to?: number
}

export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  total,
  from,
  to,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {total !== undefined && from !== undefined && to !== undefined ? (
          <span>
            Showing {from} to {to} of {total} results
          </span>
        ) : (
          <span>Page {currentPage} of {lastPage}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

