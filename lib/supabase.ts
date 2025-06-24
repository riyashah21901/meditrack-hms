import { createClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Flag to check if Supabase is available
export const isSupabaseAvailable = !!supabase

// Types for our database tables
export interface Patient {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  email: string
  address: string
  status: "Critical" | "Normal" | "Stable"
  condition: string
  admission_date: string
  doctor: string
  blood_group: string
  emergency_contact: string
  created_at?: string
  updated_at?: string
}

export interface Appointment {
  id: string
  patient_name: string
  patient_id: string
  doctor: string
  appointment_date: string
  appointment_time: string
  type: string
  status: "Scheduled" | "Completed" | "Cancelled" | "In Progress"
  notes: string
  duration: string
  created_at?: string
  updated_at?: string
}

export interface TestReport {
  id: string
  patient_name: string
  patient_id: string
  test_type: string
  test_date: string
  report_date: string | null
  status: "Pending" | "Completed" | "In Review"
  doctor: string
  technician: string
  results: string
  notes: string
  priority: "Normal" | "Urgent" | "Critical"
  created_at?: string
  updated_at?: string
}

// Local storage helpers for fallback
export const localStorageHelpers = {
  getPatients: (): Patient[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("meditrack-patients")
    return stored ? JSON.parse(stored) : getDefaultPatients()
  },

  setPatients: (patients: Patient[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("meditrack-patients", JSON.stringify(patients))
  },

  getAppointments: (): Appointment[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("meditrack-appointments")
    return stored ? JSON.parse(stored) : getDefaultAppointments()
  },

  setAppointments: (appointments: Appointment[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("meditrack-appointments", JSON.stringify(appointments))
  },

  getReports: (): TestReport[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("meditrack-reports")
    return stored ? JSON.parse(stored) : getDefaultReports()
  },

  setReports: (reports: TestReport[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("meditrack-reports", JSON.stringify(reports))
  },
}

// Default data for demo purposes
function getDefaultPatients(): Patient[] {
  return [
    {
      id: "P001",
      name: "John Smith",
      age: 45,
      gender: "Male",
      phone: "+1 (555) 123-4567",
      email: "john.smith@email.com",
      address: "123 Main St, New York, NY 10001",
      status: "Critical",
      condition: "Cardiac Arrest",
      admission_date: "2024-01-10",
      doctor: "Dr. Johnson",
      blood_group: "O+",
      emergency_contact: "+1 (555) 987-6543",
    },
    {
      id: "P002",
      name: "Emily Davis",
      age: 32,
      gender: "Female",
      phone: "+1 (555) 234-5678",
      email: "emily.davis@email.com",
      address: "456 Oak Ave, Los Angeles, CA 90210",
      status: "Normal",
      condition: "Regular Checkup",
      admission_date: "2024-01-15",
      doctor: "Dr. Wilson",
      blood_group: "A+",
      emergency_contact: "+1 (555) 876-5432",
    },
    {
      id: "P003",
      name: "Michael Brown",
      age: 58,
      gender: "Male",
      phone: "+1 (555) 345-6789",
      email: "michael.brown@email.com",
      address: "789 Pine St, Chicago, IL 60601",
      status: "Critical",
      condition: "Pneumonia",
      admission_date: "2024-01-12",
      doctor: "Dr. Johnson",
      blood_group: "B+",
      emergency_contact: "+1 (555) 765-4321",
    },
    {
      id: "P004",
      name: "Sarah Wilson",
      age: 28,
      gender: "Female",
      phone: "+1 (555) 456-7890",
      email: "sarah.wilson@email.com",
      address: "321 Elm St, Houston, TX 77001",
      status: "Normal",
      condition: "Pregnancy Checkup",
      admission_date: "2024-01-14",
      doctor: "Dr. Martinez",
      blood_group: "AB+",
      emergency_contact: "+1 (555) 654-3210",
    },
    {
      id: "P005",
      name: "Robert Taylor",
      age: 67,
      gender: "Male",
      phone: "+1 (555) 567-8901",
      email: "robert.taylor@email.com",
      address: "654 Maple Ave, Phoenix, AZ 85001",
      status: "Stable",
      condition: "Diabetes Management",
      admission_date: "2024-01-11",
      doctor: "Dr. Johnson",
      blood_group: "O-",
      emergency_contact: "+1 (555) 543-2109",
    },
  ]
}

function getDefaultAppointments(): Appointment[] {
  return [
    {
      id: "A001",
      patient_name: "John Smith",
      patient_id: "P001",
      doctor: "Dr. Johnson",
      appointment_date: "2024-01-16",
      appointment_time: "09:00",
      type: "Consultation",
      status: "Scheduled",
      notes: "Follow-up for cardiac condition",
      duration: "30 minutes",
    },
    {
      id: "A002",
      patient_name: "Emily Davis",
      patient_id: "P002",
      doctor: "Dr. Wilson",
      appointment_date: "2024-01-16",
      appointment_time: "10:30",
      type: "Checkup",
      status: "Completed",
      notes: "Regular health checkup",
      duration: "45 minutes",
    },
    {
      id: "A003",
      patient_name: "Michael Brown",
      patient_id: "P003",
      doctor: "Dr. Johnson",
      appointment_date: "2024-01-16",
      appointment_time: "14:00",
      type: "Treatment",
      status: "In Progress",
      notes: "Pneumonia treatment session",
      duration: "60 minutes",
    },
    {
      id: "A004",
      patient_name: "Sarah Wilson",
      patient_id: "P004",
      doctor: "Dr. Martinez",
      appointment_date: "2024-01-17",
      appointment_time: "11:00",
      type: "Consultation",
      status: "Scheduled",
      notes: "Pregnancy consultation",
      duration: "30 minutes",
    },
    {
      id: "A005",
      patient_name: "Robert Taylor",
      patient_id: "P005",
      doctor: "Dr. Johnson",
      appointment_date: "2024-01-17",
      appointment_time: "15:30",
      type: "Follow-up",
      status: "Scheduled",
      notes: "Diabetes management follow-up",
      duration: "30 minutes",
    },
  ]
}

function getDefaultReports(): TestReport[] {
  return [
    {
      id: "R001",
      patient_name: "John Smith",
      patient_id: "P001",
      test_type: "Blood Test",
      test_date: "2024-01-14",
      report_date: "2024-01-15",
      status: "Completed",
      doctor: "Dr. Johnson",
      technician: "Tech. Sarah",
      results: "Hemoglobin: 12.5 g/dL (Normal), White Blood Cells: 7,200/μL (Normal), Platelets: 250,000/μL (Normal)",
      notes: "All values within normal range. Continue current medication.",
      priority: "Normal",
    },
    {
      id: "R002",
      patient_name: "Emily Davis",
      patient_id: "P002",
      test_type: "X-Ray",
      test_date: "2024-01-15",
      report_date: "2024-01-15",
      status: "Completed",
      doctor: "Dr. Wilson",
      technician: "Tech. Mike",
      results: "Chest X-ray shows clear lungs with no signs of infection or abnormalities.",
      notes: "Normal chest X-ray. No follow-up required.",
      priority: "Normal",
    },
    {
      id: "R003",
      patient_name: "Michael Brown",
      patient_id: "P003",
      test_type: "CT Scan",
      test_date: "2024-01-14",
      report_date: "2024-01-16",
      status: "In Review",
      doctor: "Dr. Johnson",
      technician: "Tech. Lisa",
      results: "CT scan of chest shows signs of pneumonia in lower right lobe.",
      notes: "Requires immediate treatment. Patient has been notified.",
      priority: "Critical",
    },
    {
      id: "R004",
      patient_name: "Sarah Wilson",
      patient_id: "P004",
      test_type: "Ultrasound",
      test_date: "2024-01-15",
      report_date: null,
      status: "Pending",
      doctor: "Dr. Martinez",
      technician: "Tech. Anna",
      results: "",
      notes: "Routine pregnancy ultrasound scheduled.",
      priority: "Normal",
    },
    {
      id: "R005",
      patient_name: "Robert Taylor",
      patient_id: "P005",
      test_type: "Blood Sugar Test",
      test_date: "2024-01-13",
      report_date: "2024-01-14",
      status: "Completed",
      doctor: "Dr. Johnson",
      technician: "Tech. Sarah",
      results: "Fasting glucose: 145 mg/dL (Elevated), HbA1c: 7.2% (Elevated)",
      notes: "Blood sugar levels elevated. Adjust medication dosage.",
      priority: "Urgent",
    },
  ]
}
