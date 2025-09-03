"use client"

import type React from "react"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

type Doctor = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  created_at?: string
  updated_at?: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [isPending, startTransition] = useTransition()

  const initialForm: Doctor = useMemo(
    () => ({
      id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    }),
    [],
  )

  const [form, setForm] = useState<Doctor>(initialForm)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/doctors", { cache: "no-store" })
        const json = await res.json()
        setDoctors(json.data ?? [])
      } catch (e: any) {
        console.error(e)
        toast({ title: "Failed to load doctors", description: e?.message ?? "Unknown error" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return doctors
    const q = query.toLowerCase()
    return doctors.filter(
      (d) =>
        d.first_name.toLowerCase().includes(q) ||
        d.last_name.toLowerCase().includes(q) ||
        (d.email ?? "").toLowerCase().includes(q) ||
        (d.phone ?? "").toLowerCase().includes(q),
    )
  }, [doctors, query])

  function openCreate() {
    setEditing(null)
    setForm(initialForm)
    setOpen(true)
  }

  function openEdit(doc: Doctor) {
    setEditing(doc)
    setForm({ ...doc })
    setOpen(true)
  }

  function closeDialog() {
    setOpen(false)
    setEditing(null)
    setForm(initialForm)
  }

  function onChange<K extends keyof Doctor>(key: K, val: Doctor[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast({ title: "First and Last Name are required" })
      return
    }

    startTransition(async () => {
      try {
        if (editing) {
          const res = await fetch(`/api/doctors/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              first_name: form.first_name.trim(),
              last_name: form.last_name.trim(),
              email: form.email?.toString().trim() || null,
              phone: form.phone?.toString().trim() || null,
            }),
          })
          const json = await res.json()
          if (!res.ok) throw new Error(json.error || "Update failed")
          setDoctors((list) => list.map((d) => (d.id === editing.id ? json.data : d)))
          toast({ title: "Doctor updated" })
        } else {
          const res = await fetch("/api/doctors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              first_name: form.first_name.trim(),
              last_name: form.last_name.trim(),
              email: form.email?.toString().trim() || null,
              phone: form.phone?.toString().trim() || null,
            }),
          })
          const json = await res.json()
          if (!res.ok) throw new Error(json.error || "Create failed")
          setDoctors((list) => [json.data, ...list])
          toast({ title: "Doctor added" })
        }
        closeDialog()
      } catch (e: any) {
        console.error(e)
        toast({ title: "Action failed", description: e?.message ?? "Unknown error" })
      }
    })
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this doctor?")
    if (!ok) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Delete failed")
        setDoctors((list) => list.filter((d) => d.id !== id))
        toast({ title: "Doctor deleted" })
      } catch (e: any) {
        console.error(e)
        toast({ title: "Delete failed", description: e?.message ?? "Unknown error" })
      }
    })
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl md:text-2xl">Doctors</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                className="pl-8 w-[200px] md:w-[280px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.first_name}</TableCell>
                      <TableCell>{d.last_name}</TableCell>
                      <TableCell>{d.email}</TableCell>
                      <TableCell>{d.phone}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(d.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeDialog())}>
        <DialogContent className="max-w-2xl p-0">
          <div className="h-[80vh] md:h-auto md:max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 p-6 pb-4 border-b">
              <DialogHeader>
                <DialogTitle>{editing ? "Update Doctor" : "Add Doctor"}</DialogTitle>
                <DialogDescription>Only First Name, Last Name, Email, and Phone are required.</DialogDescription>
              </DialogHeader>
            </div>

            {/* Scrollable content */}
            <form className="flex-1 overflow-y-auto p-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={form.first_name}
                    onChange={(e) => onChange("first_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={form.last_name}
                    onChange={(e) => onChange("last_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email ?? ""}
                    onChange={(e) => onChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 555 000 0000"
                    value={form.phone ?? ""}
                    onChange={(e) => onChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Footer (fixed) */}
              <div className="flex-shrink-0 p-4 border-t flex items-center justify-end gap-2 sticky bottom-0 bg-background">
                <Button type="button" variant="outline" onClick={closeDialog} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {editing ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
