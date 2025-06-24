"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Edit, Plus, Search, Trash2, Loader2 } from "lucide-react"
import { supabase, type Appointment } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Appointment>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch appointments from Supabase
  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch appointments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const generateAppointmentId = () => {
    const lastId =
      appointments.length > 0 ? Math.max(...appointments.map((a) => Number.parseInt(a.id.substring(1)))) : 0
    return `A${String(lastId + 1).padStart(3, "0")}`
  }

  const handleAddAppointment = async () => {
    if (!formData.patient_name || !formData.doctor || !formData.appointment_date || !formData.appointment_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const newAppointment: Omit<Appointment, "created_at" | "updated_at"> = {
        id: generateAppointmentId(),
        patient_name: formData.patient_name || "",
        patient_id: formData.patient_id || "",
        doctor: formData.doctor || "",
        appointment_date: formData.appointment_date || "",
        appointment_time: formData.appointment_time || "",
        type: formData.type || "",
        status: (formData.status as Appointment["status"]) || "Scheduled",
        notes: formData.notes || "",
        duration: formData.duration || "30 minutes",
      }

      const { error } = await supabase.from("appointments").insert([newAppointment])

      if (error) throw error

      toast({
        title: "Success",
        description: "Appointment scheduled successfully!",
      })

      setFormData({})
      setIsAddDialogOpen(false)
      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error("Error adding appointment:", error)
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditAppointment = async () => {
    if (!selectedAppointment || !formData.patient_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedAppointment.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Appointment updated successfully!",
      })

      setFormData({})
      setSelectedAppointment(null)
      setIsEditDialogOpen(false)
      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("appointments").delete().eq("id", appointmentId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Appointment deleted successfully!",
      })

      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setFormData(appointment)
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading appointments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Schedule and manage patient appointments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>Create a new appointment for a patient.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Patient Name *</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name || ""}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient ID</Label>
                <Input
                  id="patient_id"
                  value={formData.patient_id || ""}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  placeholder="Enter patient ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor *</Label>
                <Select value={formData.doctor} onValueChange={(value) => setFormData({ ...formData, doctor: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
                    <SelectItem value="Dr. Wilson">Dr. Wilson</SelectItem>
                    <SelectItem value="Dr. Martinez">Dr. Martinez</SelectItem>
                    <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Checkup">Checkup</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Treatment">Treatment</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment_date">Date *</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  value={formData.appointment_date || ""}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment_time">Time *</Label>
                <Input
                  id="appointment_time"
                  type="time"
                  value={formData.appointment_time || ""}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15 minutes">15 minutes</SelectItem>
                    <SelectItem value="30 minutes">30 minutes</SelectItem>
                    <SelectItem value="45 minutes">45 minutes</SelectItem>
                    <SelectItem value="60 minutes">60 minutes</SelectItem>
                    <SelectItem value="90 minutes">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Appointment["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter appointment notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddAppointment}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter((a) => a.appointment_date === new Date().toISOString().split("T")[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.filter((a) => a.status === "Completed").length}</div>
            <p className="text-xs text-muted-foreground">Appointments completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.filter((a) => a.status === "In Progress").length}</div>
            <p className="text-xs text-muted-foreground">Currently ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.filter((a) => a.status === "Cancelled").length}</div>
            <p className="text-xs text-muted-foreground">Cancelled appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Schedule</CardTitle>
          <CardDescription>Manage and track all patient appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments by patient, doctor, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appointment ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.patient_name}</div>
                      <div className="text-sm text-gray-500">{appointment.patient_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.appointment_date}</div>
                      <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.type}</TableCell>
                  <TableCell>{appointment.duration}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(appointment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment details for {selectedAppointment?.patient_name}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-patient_name">Patient Name *</Label>
              <Input
                id="edit-patient_name"
                value={formData.patient_name || ""}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                placeholder="Enter patient name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-patient_id">Patient ID</Label>
              <Input
                id="edit-patient_id"
                value={formData.patient_id || ""}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                placeholder="Enter patient ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-doctor">Doctor *</Label>
              <Select value={formData.doctor} onValueChange={(value) => setFormData({ ...formData, doctor: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
                  <SelectItem value="Dr. Wilson">Dr. Wilson</SelectItem>
                  <SelectItem value="Dr. Martinez">Dr. Martinez</SelectItem>
                  <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Appointment Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Checkup">Checkup</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Treatment">Treatment</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-appointment_date">Date *</Label>
              <Input
                id="edit-appointment_date"
                type="date"
                value={formData.appointment_date || ""}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-appointment_time">Time *</Label>
              <Input
                id="edit-appointment_time"
                type="time"
                value={formData.appointment_time || ""}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 minutes">15 minutes</SelectItem>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="45 minutes">45 minutes</SelectItem>
                  <SelectItem value="60 minutes">60 minutes</SelectItem>
                  <SelectItem value="90 minutes">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Appointment["status"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter appointment notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditAppointment}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
