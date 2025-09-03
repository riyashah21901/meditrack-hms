"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"

type Doctor = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  created_at?: string
  updated_at?: string
}

type FormState = {
  id?: string
  first_name: string
  last_name: string
  email: string
  phone: string
}

const LS_KEY = "meditrack:doctors"

function getLocalDoctors(): Doctor[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Doctor[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setLocalDoctors(list: Doctor[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })

  // Load doctors (Supabase if available, otherwise localStorage)
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        if (isSupabaseAvailable && supabase) {
          const { data, error } = await supabase.from("doctors").select("*").order("created_at", { ascending: false })
          if (error) throw error
          if (mounted && data) {
            setDoctors(data as Doctor[])
            setLocalDoctors(data as Doctor[])
          }
        } else {
          const local = getLocalDoctors()
          if (mounted) setDoctors(local)
        }
      } catch (err) {
        console.error("Failed to load doctors:", err)
        const local = getLocalDoctors()
        if (mounted) setDoctors(local)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return doctors
    return doctors.filter((d) =>
      [d.id, d.first_name, d.last_name, d.email ?? "", d.phone ?? ""].join(" ").toLowerCase().includes(q),
    )
  }, [doctors, query])

  function openCreate() {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    })
    setOpen(true)
  }

  function openEdit(doc: Doctor) {
    setForm({
      id: doc.id,
      first_name: doc.first_name ?? "",
      last_name: doc.last_name ?? "",
      email: doc.email ?? "",
      phone: doc.phone ?? "",
    })
    setOpen(true)
  }

  function generateDoctorId(existing: Doctor[]) {
    // D + zero-padded increment based on max numeric suffix
    const nums = existing.map((d) => Number.parseInt(d.id.replace(/\D/g, ""), 10)).filter((n) => !isNaN(n))
    const next = (nums.length ? Math.max(...nums) : 0) + 1
    return `D${String(next).padStart(3, "0")}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const now = new Date().toISOString()
      if (form.id) {
        // Update
        const updated: Partial<Doctor> = {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email || null,
          phone: form.phone || null,
          updated_at: now,
        }
        if (isSupabaseAvailable && supabase) {
          const { error } = await supabase.from("doctors").update(updated).eq("id", form.id)
          if (error) throw error
        }
        setDoctors((prev) => {
          const next = prev.map((d) => (d.id === form.id ? ({ ...d, ...updated } as Doctor) : d))
          setLocalDoctors(next)
          return next
        })
      } else {
        // Create
        const newDoctor: Doctor = {
          id: generateDoctorId(doctors),
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email || null,
          phone: form.phone || null,
          created_at: now,
          updated_at: now,
        }
        if (isSupabaseAvailable && supabase) {
          const { error } = await supabase.from("doctors").insert(newDoctor)
          if (error) throw error
        }
        setDoctors((prev) => {
          const next = [newDoctor, ...prev]
          setLocalDoctors(next)
          return next
        })
      }
      setOpen(false)
    } catch (err) {
      console.error("Failed to save doctor:", err)
      alert("Failed to save doctor. Please check Supabase table and RLS policies.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this doctor? This action cannot be undone.")) return
    setDeletingId(id)
    try {
      if (isSupabaseAvailable && supabase) {
        const { error } = await supabase.from("doctors").delete().eq("id", id)
        if (error) throw error
      }
      setDoctors((prev) => {
        const next = prev.filter((d) => d.id !== id)
        setLocalDoctors(next)
        return next
      })
    } catch (err) {
      console.error("Failed to delete doctor:", err)
      alert("Failed to delete doctor. Please check Supabase table and RLS policies.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Doctors</h1>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Manage Doctors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="pl-8"
                aria-label="Search doctors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">ID</TableHead>
                  <TableHead className="whitespace-nowrap">First Name</TableHead>
                  <TableHead className="whitespace-nowrap">Last Name</TableHead>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead className="whitespace-nowrap">Phone</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      No doctors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.id}</TableCell>
                      <TableCell>{d.first_name}</TableCell>
                      <TableCell>{d.last_name}</TableCell>
                      <TableCell className="truncate">{d.email}</TableCell>
                      <TableCell className="truncate">{d.phone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(d.id)}
                            disabled={deletingId === d.id}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            {deletingId === d.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-xl">
          {/* Modal layout: header + scrollable content + sticky footer */}
          <div className="flex h-[90vh] max-h-[90vh] flex-col">
            <div className="flex-shrink-0 border-b px-6 py-4">
              <DialogHeader className="text-left">
                <DialogTitle>{form.id ? "Update Doctor" : "Add Doctor"}</DialogTitle>
              </DialogHeader>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    placeholder="e.g. Jane"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    placeholder="e.g. Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="doctor@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+1 555 123 4567"
                  />
                </div>
              </div>
            </form>

            <DialogFooter className="sticky bottom-0 z-10 flex-shrink-0 gap-2 border-t bg-background px-6 py-4">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={() => formRef.current?.requestSubmit()}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={saving}
              >
                {saving ? (form.id ? "Updating..." : "Creating...") : form.id ? "Update Doctor" : "Add Doctor"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
