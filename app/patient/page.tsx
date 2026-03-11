"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, LogOut, Stethoscope } from "lucide-react"
import { supabase, type Appointment } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type DoctorRow = {
  id: string
  first_name: string
  last_name: string
  available: boolean | null
}

export default function PatientPortalPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const id = localStorage.getItem("meditrack-patient-id")
    const auth = localStorage.getItem("meditrack-auth")
    const role = localStorage.getItem("meditrack-role")

    if (!auth || role !== "patient" || !id) {
      router.push("/")
      return
    }

    setPatientId(id)

    const fetchAppointments = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        const [apptsRes, doctorsRes] = await Promise.all([
          supabase.from("appointments").select("*").eq("patient_id", id).order("appointment_date", { ascending: true }),
          supabase.from("doctors").select("id, first_name, last_name, available"),
        ])

        if (apptsRes.error) throw apptsRes.error
        setAppointments(apptsRes.data || [])

        if (!doctorsRes.error) {
          setDoctors((doctorsRes.data as DoctorRow[]) || [])
        }
      } catch (error) {
        console.error("Error loading patient appointments:", error)
        toast({
          title: "Error",
          description: "Failed to load your appointments. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [router, toast])

  const doctorAvailabilityLookup = useMemo(() => {
    // Create a lookup by last_name and "first last" for fuzzy matching against appointment.doctor strings like "Dr. Johnson"
    const map = new Map<string, boolean>()
    for (const d of doctors) {
      const available = d.available ?? true
      const last = (d.last_name || "").toLowerCase().trim()
      const full = `${(d.first_name || "").toLowerCase().trim()} ${last}`.trim()
      if (last) map.set(last, available)
      if (full) map.set(full, available)
    }
    return map
  }, [doctors])

  const getDoctorAvailableForAppointment = (doctorLabel: string | null | undefined, fallback?: boolean) => {
    if (!doctorLabel) return fallback ?? true
    const label = doctorLabel.toLowerCase()

    // Prefer matching "first last" first
    for (const [key, value] of doctorAvailabilityLookup.entries()) {
      if (key.includes(" ") && label.includes(key)) return value
    }
    // Then match last name
    for (const [key, value] of doctorAvailabilityLookup.entries()) {
      if (!key.includes(" ") && label.includes(key)) return value
    }

    return fallback ?? true
  }

  const handleLogout = () => {
    localStorage.removeItem("meditrack-auth")
    localStorage.removeItem("meditrack-role")
    localStorage.removeItem("meditrack-patient-id")
    router.push("/")
  }

  const today = new Date().toISOString().split("T")[0]
  const upcoming = appointments.filter((a) => a.appointment_date >= today)
  const past = appointments.filter((a) => a.appointment_date < today)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/40 to-accent/20 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">Patient Portal</h1>
              <p className="text-xs text-muted-foreground sm:text-[0.8rem]">
                View your upcoming and past appointments.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {patientId && <span className="rounded-full bg-muted/60 px-3 py-1 text-[0.75rem]">ID: {patientId}</span>}
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-destructive/50 text-[0.75rem] text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-1 h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="mr-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading your appointments...</span>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
            {/* Upcoming */}
            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Calendar className="h-4 w-4 text-primary" />
                  Upcoming appointments
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  These are your scheduled visits and procedures.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                    You have no upcoming appointments scheduled.
                  </p>
                ) : (
                  upcoming.map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-xs sm:text-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-medium text-primary">
                            <Calendar className="mr-1 h-3 w-3" />
                            {appt.appointment_date}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-secondary/60 px-2 py-0.5 text-[0.7rem] font-medium text-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {appt.appointment_time?.slice(0, 5) || "--:--"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
                          {appt.doctor && <span>With {appt.doctor}</span>}
                          <Badge
                            variant="outline"
                            className={`rounded-full text-[0.65rem] font-medium ${
                              getDoctorAvailableForAppointment(appt.doctor, appt.doctor_available)
                                ? "border-emerald-300 bg-emerald-500/10 text-emerald-700"
                                : "border-red-300 bg-red-500/10 text-red-700"
                            }`}
                          >
                            {getDoctorAvailableForAppointment(appt.doctor, appt.doctor_available)
                              ? "Doctor available"
                              : "Doctor unavailable"}
                          </Badge>
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
                        </div>
                        {appt.notes && (
                          <p className="mt-1 line-clamp-2 text-[0.7rem] text-muted-foreground">{appt.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Past */}
            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Past appointments</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  A quick history of your completed visits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {past.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                    No past appointments found.
                  </p>
                ) : (
                  past.map((appt) => (
                    <div
                      key={appt.id}
                      className="rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[0.75rem] font-medium text-foreground">
                          {appt.appointment_date} • {appt.appointment_time?.slice(0, 5) || "--:--"}
                        </span>
                        <Badge
                          variant="outline"
                          className="rounded-full border-border/80 bg-muted/40 text-[0.65rem] font-normal"
                        >
                          {appt.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[0.7rem] text-muted-foreground">
                        {appt.type} {appt.doctor ? `with ${appt.doctor}` : ""}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

