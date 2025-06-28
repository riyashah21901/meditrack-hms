"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, FileText, UserPlus, CalendarPlus, FileBarChart, AlertTriangle, Clock } from "lucide-react"
import {
  supabase,
  isSupabaseAvailable,
  localStorageHelpers,
  type Patient,
  type Appointment,
  type TestReport,
} from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPatients: 0,
    criticalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
  })
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      let patients: Patient[] = []
      let appointments: Appointment[] = []
      let reports: TestReport[] = []

      if (isSupabaseAvailable && supabase) {
        // Fetch from Supabase
        const [patientsRes, appointmentsRes, reportsRes] = await Promise.all([
          supabase.from("patients").select("*").order("created_at", { ascending: false }),
          supabase.from("appointments").select("*").order("created_at", { ascending: false }),
          supabase.from("test_reports").select("*").order("created_at", { ascending: false }),
        ])

        patients = patientsRes.data || []
        appointments = appointmentsRes.data || []
        reports = reportsRes.data || []
      } else {
        // Fallback to localStorage
        patients = localStorageHelpers.getPatients()
        appointments = localStorageHelpers.getAppointments()
        reports = localStorageHelpers.getTestReports()
      }

      // Calculate stats
      const today = new Date().toISOString().split("T")[0]
      const criticalPatients = patients.filter((p) => p.status.toLowerCase() === "critical").length
      const todayAppts = appointments.filter((a) => a.date === today)
      const pendingReports = reports.filter((r) => r.status.toLowerCase() === "pending").length

      setStats({
        totalPatients: patients.length,
        criticalPatients,
        todayAppointments: todayAppts.length,
        pendingReports,
      })

      // Set recent data
      setRecentPatients(patients.slice(0, 5))
      setTodayAppointments(todayAppts.slice(0, 5))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "normal":
        return "bg-green-100 text-green-800 border-green-200"
      case "stable":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAppointmentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to MediTrack Hospital Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Active patient records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalPatients}</div>
            <p className="text-xs text-muted-foreground">Patients requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-16 flex items-center justify-start space-x-3 bg-transparent"
              onClick={() => router.push("/dashboard/patients")}
            >
              <UserPlus className="h-5 w-5" />
              <span>Add New Patient</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex items-center justify-start space-x-3 bg-transparent"
              onClick={() => router.push("/dashboard/appointments")}
            >
              <CalendarPlus className="h-5 w-5" />
              <span>Schedule Appointment</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex items-center justify-start space-x-3 bg-transparent"
              onClick={() => router.push("/dashboard/reports")}
            >
              <FileBarChart className="h-5 w-5" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Latest patient registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.length > 0 ? (
                recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-500">
                        ID: {patient.id} • Age: {patient.age}
                      </p>
                    </div>
                    <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent patients</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-500">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {appointment.time} • Dr. {appointment.doctor}
                      </p>
                    </div>
                    <Badge className={getAppointmentStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No appointments scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
