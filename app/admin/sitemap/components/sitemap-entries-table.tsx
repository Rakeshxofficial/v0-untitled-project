"use client"

import { useState } from "react"
import { deleteCustomSitemapEntry, updateCustomSitemapEntry, type SitemapEntry } from "@/app/actions/sitemap-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Edit, MoreHorizontal, Trash2, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface SitemapEntriesTableProps {
  entries: SitemapEntry[]
  onEntryChange: () => void
}

export default function SitemapEntriesTable({ entries, onEntryChange }: SitemapEntriesTableProps) {
  const [editingEntry, setEditingEntry] = useState<SitemapEntry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = (entry: SitemapEntry) => {
    setEditingEntry({ ...entry })
  }

  const handleDelete = (id: number) => {
    setEntryToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!entryToDelete) return

    setIsSubmitting(true)
    try {
      const result = await deleteCustomSitemapEntry(entryToDelete)

      if (result.success) {
        toast({
          title: "Success",
          description: "Sitemap entry deleted successfully",
        })
        onEntryChange()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete sitemap entry",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting sitemap entry:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
      setEntryToDelete(null)
    }
  }

  const saveEditedEntry = async () => {
    if (!editingEntry || !editingEntry.id) return

    setIsSubmitting(true)
    try {
      const result = await updateCustomSitemapEntry(editingEntry.id, {
        ...editingEntry,
        last_modified: new Date().toISOString(),
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Sitemap entry updated successfully",
        })
        onEntryChange()
        setEditingEntry(null)
      } else {
        toast({
          title: "Error",
          description: "Failed to update sitemap entry",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating sitemap entry:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleIncludeInSitemap = async (id: number, currentValue: boolean) => {
    try {
      const result = await updateCustomSitemapEntry(id, {
        include_in_sitemap: !currentValue,
        last_modified: new Date().toISOString(),
      })

      if (result.success) {
        toast({
          title: "Success",
          description: `URL ${currentValue ? "excluded from" : "included in"} sitemap`,
        })
        onEntryChange()
      } else {
        toast({
          title: "Error",
          description: "Failed to update sitemap entry",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating sitemap entry:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No custom sitemap entries found
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium max-w-[300px] truncate">
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:underline"
                  >
                    {entry.url}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>{entry.priority}</TableCell>
                <TableCell className="capitalize">{entry.change_frequency}</TableCell>
                <TableCell>
                  <Badge variant={entry.include_in_sitemap ? "default" : "outline"}>
                    {entry.include_in_sitemap ? "Included" : "Excluded"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(entry)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleIncludeInSitemap(entry.id!, entry.include_in_sitemap)}>
                        <Switch className="mr-2" checked={entry.include_in_sitemap} />
                        {entry.include_in_sitemap ? "Exclude" : "Include"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(entry.id!)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Sitemap Entry</DialogTitle>
              <DialogDescription>Make changes to the sitemap entry. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="url" className="text-sm font-medium">
                  URL
                </label>
                <Input
                  id="url"
                  value={editingEntry.url}
                  onChange={(e) => setEditingEntry({ ...editingEntry, url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editingEntry.priority}
                    onChange={(e) => setEditingEntry({ ...editingEntry, priority: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="change_frequency" className="text-sm font-medium">
                    Change Frequency
                  </label>
                  <Select
                    value={editingEntry.change_frequency}
                    onValueChange={(value: any) => setEditingEntry({ ...editingEntry, change_frequency: value })}
                  >
                    <SelectTrigger id="change_frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="include_in_sitemap"
                  checked={editingEntry.include_in_sitemap}
                  onCheckedChange={(checked) => setEditingEntry({ ...editingEntry, include_in_sitemap: checked })}
                />
                <label htmlFor="include_in_sitemap" className="text-sm font-medium">
                  Include in sitemap
                </label>
              </div>
              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  value={editingEntry.notes || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                  placeholder="Optional notes about this entry"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingEntry(null)}>
                Cancel
              </Button>
              <Button onClick={saveEditedEntry} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sitemap entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
