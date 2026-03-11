import { isSupabaseAvailable, localStorageHelpers, supabase, type Appointment, type Patient } from "@/lib/supabase"

type DoctorSeed = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  available: boolean
  created_at?: string
  updated_at?: string
}

function isoDate(daysFromToday: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return d.toISOString().split("T")[0]
}

export async function seedDemoData() {
  const now = new Date().toISOString()
  // Use high IDs to avoid collisions with existing rows.
  const doctors: DoctorSeed[] = [
    {
      id: "D101",
      first_name: "Aarav",
      last_name: "Mehta",
      email: "aarav.mehta@hospital.test",
      phone: "+91 90000 0101",
      available: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: "D102",
      first_name: "Isha",
      last_name: "Kapoor",
      email: "isha.kapoor@hospital.test",
      phone: "+91 90000 0102",
      available: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: "D103",
      first_name: "Rohan",
      last_name: "Singh",
      email: "rohan.singh@hospital.test",
      phone: "+91 90000 0103",
      available: false,
      created_at: now,
      updated_at: now,
    },
    {
      id: "D104",
      first_name: "Neha",
      last_name: "Sharma",
      email: "neha.sharma@hospital.test",
      phone: "+91 90000 0104",
      available: true,
      created_at: now,
      updated_at: now,
    },
  ]

  const patients: Patient[] = [
    {
      id: "P101",
      name: "Rahul Verma",
      age: 41,
      gender: "Male",
      phone: "+91 98888 11001",
      email: "rahul.verma@patient.test",
      address: "12 Lakeview Rd, Pune",
      status: "Stable",
      condition: "Hypertension follow-up",
      admission_date: isoDate(-3),
      doctor: "Dr. Mehta",
      blood_group: "B+",
      emergency_contact: "+91 98888 91001",
    },
    {
      id: "P102",
      name: "Ananya Gupta",
      age: 29,
      gender: "Female",
      phone: "+91 98888 11002",
      email: "ananya.gupta@patient.test",
      address: "55 Green Park, Delhi",
      status: "Normal",
      condition: "Annual health checkup",
      admission_date: isoDate(-1),
      doctor: "Dr. Kapoor",
      blood_group: "A+",
      emergency_contact: "+91 98888 91002",
    },
    {
      id: "P103",
      name: "Kunal Iyer",
      age: 52,
      gender: "Male",
      phone: "+91 98888 11003",
      email: "kunal.iyer@patient.test",
      address: "9 Sunrise Blvd, Bengaluru",
      status: "Critical",
      condition: "Chest pain observation",
      admission_date: isoDate(0),
      doctor: "Dr. Singh",
      blood_group: "O+",
      emergency_contact: "+91 98888 91003",
    },
    {
      id: "P104",
      name: "Priya Nair",
      age: 35,
      gender: "Female",
      phone: "+91 98888 11004",
      email: "priya.nair@patient.test",
      address: "3 Riverside St, Kochi",
      status: "Normal",
      condition: "Diabetes review",
      admission_date: isoDate(-2),
      doctor: "Dr. Sharma",
      blood_group: "AB+",
      emergency_contact: "+91 98888 91004",
    },
    {
      id: "P105",
      name: "Siddharth Joshi",
      age: 47,
      gender: "Male",
      phone: "+91 98888 11005",
      email: "siddharth.joshi@patient.test",
      address: "88 Hillcrest, Jaipur",
      status: "Stable",
      condition: "Respiratory check & spirometry",
      admission_date: isoDate(-5),
      doctor: "Dr. Kapoor",
      blood_group: "A-",
      emergency_contact: "+91 98888 91005",
    },
  ]

  const appointments: Appointment[] = [
    {
      id: "A101",
      patient_name: patients[0].name,
      patient_id: patients[0].id,
      doctor: "Dr. Mehta",
      appointment_date: isoDate(0),
      appointment_time: "10:00",
      type: "Follow-up",
      status: "Scheduled",
      notes: "BP log review and medication adjustment.",
      duration: "30 minutes",
      doctor_available: true,
    },
    {
      id: "A102",
      patient_name: patients[1].name,
      patient_id: patients[1].id,
      doctor: "Dr. Kapoor",
      appointment_date: isoDate(1),
      appointment_time: "11:30",
      type: "Checkup",
      status: "Scheduled",
      notes: "Vitals, CBC, and wellness counseling.",
      duration: "45 minutes",
      doctor_available: true,
    },
    {
      id: "A103",
      patient_name: patients[2].name,
      patient_id: patients[2].id,
      doctor: "Dr. Singh",
      appointment_date: isoDate(0),
      appointment_time: "14:00",
      type: "Consultation",
      status: "In Progress",
      notes: "ECG and cardiac enzymes evaluation.",
      duration: "60 minutes",
      doctor_available: false,
    },
    {
      id: "A104",
      patient_name: patients[3].name,
      patient_id: patients[3].id,
      doctor: "Dr. Sharma",
      appointment_date: isoDate(2),
      appointment_time: "09:30",
      type: "Follow-up",
      status: "Scheduled",
      notes: "HbA1c review and diet plan update.",
      duration: "30 minutes",
      doctor_available: true,
    },
    {
      id: "A105",
      patient_name: patients[4].name,
      patient_id: patients[4].id,
      doctor: "Dr. Kapoor",
      appointment_date: isoDate(3),
      appointment_time: "16:00",
      type: "Treatment",
      status: "Scheduled",
      notes: "Pulmonary function test and review.",
      duration: "45 minutes",
      doctor_available: true,
    },
  ]

  // Compute doctor availability per slot in seeded appointments
  for (const appt of appointments) {
    const hasConflict = appointments.some(
      (other) =>
        other.id !== appt.id &&
        other.doctor === appt.doctor &&
        other.appointment_date === appt.appointment_date &&
        other.appointment_time === appt.appointment_time &&
        other.status !== "Cancelled",
    )
    appt.doctor_available = !hasConflict
  }

  if (isSupabaseAvailable && supabase) {
    // Upsert to avoid duplicates across runs.
    const doctorsRes = await supabase.from("doctors").upsert(doctors, { onConflict: "id" })
    if (doctorsRes.error) throw doctorsRes.error

    const patientsRes = await supabase.from("patients").upsert(patients, { onConflict: "id" })
    if (patientsRes.error) throw patientsRes.error

    const apptsRes = await supabase.from("appointments").upsert(appointments, { onConflict: "id" })
    if (apptsRes.error) throw apptsRes.error

    return
  }

  // Local storage fallback
  const nextPatients = [
    ...patients,
    ...localStorageHelpers.getPatients().filter((p) => !patients.some((x) => x.id === p.id)),
  ]
  localStorageHelpers.setPatients(nextPatients)

  const nextAppointments = [
    ...appointments,
    ...localStorageHelpers.getAppointments().filter((a) => !appointments.some((x) => x.id === a.id)),
  ]
  localStorageHelpers.setAppointments(nextAppointments)
}

