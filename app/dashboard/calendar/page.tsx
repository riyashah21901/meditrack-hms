"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Loader2, Plus, Trash2 } from "lucide-react"
import { supabase, type Appointment } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { appointmentsByDate as buildAppointmentsByDate } from "@/lib/appointments"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateKey(new Date()))
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Appointment>>({})
  const { toast } = useToast()

  const fetchAppointments = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

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
        description: "Failed to load calendar appointments from Supabase.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleString("default", { month: "long", year: "numeric" })
  }, [currentMonth])

  const daysMatrix = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    const startWeekday = startOfMonth.getDay()
    const totalDays = endOfMonth.getDate()

    const cells: { date: Date; inCurrentMonth: boolean }[] = []

    // Leading days from previous month
    for (let i = 0; i < startWeekday; i++) {
      const date = new Date(startOfMonth)
      date.setDate(startOfMonth.getDate() - (startWeekday - i))
      cells.push({ date, inCurrentMonth: false })
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d), inCurrentMonth: true })
    }

    // Trailing days to fill 6 weeks (6 * 7 = 42)
    while (cells.length < 42) {
      const last = cells[cells.length - 1]!.date
      const next = new Date(last)
      next.setDate(last.getDate() + 1)
      cells.push({ date: next, inCurrentMonth: false })
    }

    // Chunk into weeks
    const weeks: typeof cells[] = []
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }

    return weeks
  }, [currentMonth])

  const appointmentsByDate = useMemo(() => buildAppointmentsByDate(appointments), [appointments])

  const selectedDateAppointments = useMemo(() => {
    return appointmentsByDate[selectedDate] || []
  }, [appointmentsByDate, selectedDate])

  const isDoctorAvailable = (appointment: Appointment) => {
    if (!appointment.doctor) return true
    return !appointments.some(
      (other) =>
        other.id !== appointment.id &&
        other.doctor === appointment.doctor &&
        other.appointment_date === appointment.appointment_date &&
        other.appointment_time === appointment.appointment_time &&
        other.status !== "Cancelled",
    )
  }

  const generateAppointmentId = () => {
    const lastId =
      appointments.length > 0 ? Math.max(...appointments.map((a) => Number.parseInt(a.id.substring(1)))) : 0
    return `A${String(lastId + 1).padStart(3, "0")}`
  }

  const openAddDialogForDate = (dateKey: string) => {
    setSelectedDate(dateKey)
    setFormData({
      appointment_date: dateKey,
      appointment_time: "",
      status: "Scheduled",
      duration: "30 minutes",
      type: "Consultation",
    } as Partial<Appointment>)
    setIsAddDialogOpen(true)
  }

  const handleAddAppointment = async () => {
    if (!formData.patient_name || !formData.doctor || !formData.appointment_date || !formData.appointment_time) {
      toast({
        title: "Missing details",
        description: "Please fill in patient, doctor, date, and time.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      if (!supabase) {
        throw new Error("Supabase client is not configured")
      }

      const tempAppointment: Appointment = {
        id: generateAppointmentId(),
        patient_name: formData.patient_name || "",
        patient_id: formData.patient_id || "",
        doctor: formData.doctor || "",
        appointment_date: formData.appointment_date || "",
        appointment_time: formData.appointment_time || "",
        type: formData.type || "Consultation",
        status: (formData.status as Appointment["status"]) || "Scheduled",
        notes: formData.notes || "",
        duration: formData.duration || "30 minutes",
        doctor_available: true,
      }

      const hasConflict = appointments.some(
        (other) =>
          other.doctor === tempAppointment.doctor &&
          other.appointment_date === tempAppointment.appointment_date &&
          other.appointment_time === tempAppointment.appointment_time &&
          other.status !== "Cancelled",
      )

      const newAppointment: Omit<Appointment, "created_at" | "updated_at"> = {
        ...tempAppointment,
        doctor_available: !hasConflict,
      }

      const { error } = await supabase.from("appointments").insert([newAppointment])
      if (error) throw error

      toast({
        title: "Appointment created",
        description: "The appointment has been added to the calendar.",
      })

      setFormData({})
      setIsAddDialogOpen(false)
      fetchAppointments()
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
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
      if (!supabase) {
        throw new Error("Supabase client is not configured")
      }

      const { error } = await supabase.from("appointments").delete().eq("id", appointmentId)
      if (error) throw error

      toast({
        title: "Appointment deleted",
        description: "The appointment has been removed from the calendar.",
      })

      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId))
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(formatDateKey(today))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading calendar...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Visualize, create, and manage appointments across the hospital.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[160px] rounded-full border border-border bg-card/80 px-4 py-1 text-center text-sm font-medium">
            {monthLabel}
          </div>
          <Button variant="outline" size="icon" className="rounded-full" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="ml-2 rounded-full text-xs sm:text-sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1.1fr]">
        {/* Calendar grid */}
        <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="border-b border-border/70 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Month overview
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Click a day to see appointments or add a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground sm:text-[0.75rem]">
              {WEEKDAYS.map((day) => (
                <div key={day} className="pb-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm">
              {daysMatrix.map((week, rowIndex) =>
                week.map(({ date, inCurrentMonth }, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`
                  const dateKey = formatDateKey(date)
                  const dayAppointments = appointmentsByDate[dateKey] || []
                  const isToday = dateKey === formatDateKey(new Date())
                  const isSelected = dateKey === selectedDate

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(dateKey)}
                      className={[
                        "group flex min-h-[70px] flex-col rounded-xl border px-2 py-1 text-left transition-colors",
                        inCurrentMonth ? "bg-card hover:bg-secondary/60" : "bg-muted/30 text-muted-foreground/70",
                        isToday ? "border-primary/60" : "border-border/70",
                        isSelected ? "ring-2 ring-primary/60 ring-offset-0" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <span
                          className={[
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                            isToday
                              ? "bg-primary text-primary-foreground"
                              : isSelected
                                ? "bg-primary/10 text-primary"
                                : "text-foreground",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {date.getDate()}
                        </span>
                        {dayAppointments.length > 0 && (
                          <span className="rounded-full bg-primary/10 px-2 text-[0.65rem] font-medium text-primary">
                            {dayAppointments.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((appt) => (
                          <div
                            key={appt.id}
                            className="flex items-center gap-1 rounded-lg bg-primary/5 px-1.5 py-0.5 text-[0.65rem]"
                          >
                            <span className="text-[0.65rem] font-medium text-primary">
                              {appt.appointment_time?.slice(0, 5) || "--:--"}
                            </span>
                            <span className="truncate text-[0.65rem] text-muted-foreground">
                              {appt.patient_name}
                            </span>
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-[0.65rem] text-muted-foreground">
                            +{dayAppointments.length - 2} more
                          </div>
                        )}
                      </div>
                      <div className="mt-auto pt-1 text-right">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 rounded-full bg-transparent text-primary opacity-0 transition group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            openAddDialogForDate(dateKey)
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </button>
                  )
                }),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected day details */}
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="border-b border-border/70 pb-3">
            <CardTitle className="flex items-center justify-between text-base font-semibold">
              <span>Day details</span>
              {/* <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 text-xs font-medium">
                {selectedDate}
              </Badge> */}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Manage all appointments for the selected date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{selectedDateAppointments.length} appointments</span>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full bg-primary px-3 text-xs hover:bg-primary/90">
                    <Plus className="mr-1 h-3 w-3" />
                    Add appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-0 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-xl">
                  <DialogHeader>
                    <div className="border-b border-border/70 px-6 pb-4 pt-5">
                      <DialogTitle className="text-xl font-semibold">New appointment</DialogTitle>
                      <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Create an appointment on <span className="font-medium text-foreground">{selectedDate}</span>.
                      </DialogDescription>
                    </div>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-6 px-6 py-5">
                    <div className="space-y-2">
                      <Label htmlFor="patient_name_calendar">Patient Name *</Label>
                      <Input
                        id="patient_name_calendar"
                        value={formData.patient_name || ""}
                        onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                        placeholder="Enter patient name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient_id_calendar">Patient ID</Label>
                      <Input
                        id="patient_id_calendar"
                        value={formData.patient_id || ""}
                        onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                        placeholder="Enter patient ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor_calendar">Doctor *</Label>
                      <Select
                        value={formData.doctor}
                        onValueChange={(value) => setFormData({ ...formData, doctor: value })}
                      >
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
                      <Label htmlFor="type_calendar">Appointment Type *</Label>
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
                      <Label htmlFor="appointment_date_calendar">Date *</Label>
                      <Input
                        id="appointment_date_calendar"
                        type="date"
                        value={formData.appointment_date || selectedDate}
                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment_time_calendar">Time *</Label>
                      <Input
                        id="appointment_time_calendar"
                        type="time"
                        value={formData.appointment_time || ""}
                        onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration_calendar">Duration</Label>
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
                      <Label htmlFor="status_calendar">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value as Appointment["status"] })
                        }
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
                      <Label htmlFor="notes_calendar">Notes</Label>
                      <Textarea
                        id="notes_calendar"
                        value={formData.notes || ""}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Enter appointment notes"
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-2 border-t border-border/70 bg-card/80 px-6 py-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        setFormData({})
                      }}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddAppointment}
                      disabled={submitting}
                      className="rounded-xl bg-primary px-5 hover:bg-primary/90"
                    >
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create appointment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {selectedDateAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                No appointments for this date yet. Use{" "}
                <span className="font-medium text-primary">“Add appointment”</span> to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateAppointments.map((appt) => {
                  const available = isDoctorAvailable(appt)
                  return (
                    <div
                      key={appt.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-xs sm:text-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-medium text-primary">
                            {appt.appointment_time?.slice(0, 5) || "--:--"}
                          </span>
                          <span className="font-medium text-foreground">{appt.patient_name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
                          {appt.doctor && <span>With {appt.doctor}</span>}
                          {appt.type && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-primary/20 bg-primary/5 text-[0.65rem]"
                            >
                              {appt.type}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="rounded-full border-border/80 bg-muted/40 text-[0.65rem] font-normal"
                          >
                            {appt.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`rounded-full text-[0.65rem] font-medium ${
                              available
                                ? "border-emerald-300 bg-emerald-500/10 text-emerald-600"
                                : "border-red-300 bg-red-500/10 text-red-600"
                            }`}
                          >
                            {available ? "Doctor available" : "Doctor busy"}
                          </Badge>
                        </div>
                        {appt.notes && (
                          <p className="mt-1 line-clamp-2 text-[0.7rem] text-muted-foreground">{appt.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-1 h-7 w-7 rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteAppointment(appt.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

