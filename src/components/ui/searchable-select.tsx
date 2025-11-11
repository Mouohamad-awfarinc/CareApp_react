import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SearchableSelectProps {
  placeholder: string
  value?: string
  onSelect: (value: string) => void
  fetchData: (search: string) => Promise<{ id: string | number; name: string }[]>
  className?: string
}

export function SearchableSelect({ placeholder, value, onSelect, fetchData, className }: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [data, setData] = useState<{ id: string | number; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItemName, setSelectedItemName] = useState<string>("")

  useEffect(() => {
    const fetch = async () => {
      if (search.length > 0) {
        setLoading(true)
        try {
          const result = await fetchData(search)
          setData(result)
        } catch (error) {
          console.error("Error fetching data:", error)
          setData([])
        } finally {
          setLoading(false)
        }
      } else {
        setData([])
      }
    }

    const timeoutId = setTimeout(fetch, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [search, fetchData])

  // Fetch selected item details when value changes
  useEffect(() => {
    const fetchSelectedItem = async () => {
      if (value && !selectedItemName) {
        try {
          // Try to find the item in current data first
          const itemInData = data.find((item) => item.id.toString() === value)
          if (itemInData) {
            setSelectedItemName(itemInData.name)
            return
          }

          // If not in current data, fetch all items to find the selected one
          const result = await fetchData("")
          const selectedItem = result.find((item) => item.id.toString() === value)
          if (selectedItem) {
            setSelectedItemName(selectedItem.name)
          }
        } catch (error) {
          console.error("Error fetching selected item:", error)
        }
      } else if (!value) {
        setSelectedItemName("")
      }
    }

    fetchSelectedItem()
  }, [value, data, fetchData, selectedItemName])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedItemName || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder="Search..." value={search} onValueChange={setSearch} />
          <CommandList>
            {loading && <div className="p-2 text-sm text-muted-foreground">Loading...</div>}
            {!loading && data.length === 0 && search && <CommandEmpty>No results found.</CommandEmpty>}
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onSelect(item.id.toString())
                    setSelectedItemName(item.name)
                    setOpen(false)
                    setSearch("")
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
