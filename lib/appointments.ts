import type { Appointment } from "@/lib/supabase"

export function appointmentsByDate(appointments: Appointment[]) {
  const map: Record<string, Appointment[]> = {}
  for (const appt of appointments) {
    const key = appt.appointment_date
    if (!key) continue
    if (!map[key]) map[key] = []
    map[key].push(appt)
  }
  return map
}

