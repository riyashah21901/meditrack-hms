"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, AlertTriangle, Calendar, FileText, Users, Clock } from "lucide-react"
import {
  supabase,
  isSupabaseAvailable,
  localStorageHelpers,
  type Patient,
  type Appointment,
  type TestReport,
} from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reports, setReports] = useState<TestReport[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isSupabaseAvailable && supabase) {
          const [patientsRes, appointmentsRes, reportsRes] = await Promise.all([
            supabase.from("patients").select("*").order("created_at", { ascending: false }).limit(5),
            supabase.from("appointments").select("*").order("created_at", { ascending: false }).limit(4),
            supabase.from("test_reports").select("*").order("created_at", { ascending: false }),
          ])

          if (patientsRes.data) setPatients(patientsRes.data)
          if (appointmentsRes.data) setAppointments(appointmentsRes.data)
          if (reportsRes.data) setReports(reportsRes.data)
        } else {
          // Use localStorage fallback
          setPatients(localStorageHelpers.getPatients().slice(0, 5))
          setAppointments(localStorageHelpers.getAppointments().slice(0, 4))
          setReports(localStorageHelpers.getReports())
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // Fallback to localStorage on error
        setPatients(localStorageHelpers.getPatients().slice(0, 5))
        setAppointments(localStorageHelpers.getAppointments().slice(0, 4))
        setReports(localStorageHelpers.getReports())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = [
    {
      name: "Total Patients",
      value: patients.length.toString(),
      change: "+12%",
      changeType: "positive",
      icon: Users,
    },
    {
      name: "Critical Patients",
      value: patients.filter((p) => p.status === "Critical").length.toString(),
      change: "-2%",
      changeType: "negative",
      icon: AlertTriangle,
    },
    {
      name: "Today's Appointments",
      value: appointments
        .filter((a) => a.appointment_date === new Date().toISOString().split("T")[0])
        .length.toString(),
      change: "+8%",
      changeType: "positive",
      icon: Calendar,
    },
    {
      name: "Pending Reports",
      value: reports.filter((r) => r.status === "Pending").length.toString(),
      change: "+5%",
      changeType: "positive",
      icon: FileText,
    },
  ]

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Dr. Johnson. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Latest patient updates and status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                    </TableCell>
                    <TableCell>{patient.condition}</TableCell>
                    <TableCell>{patient.doctor}</TableCell>
                    <TableCell>{patient.admission_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Scheduled appointments for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointments.map((appointment, index) => (
              <div key={appointment.id} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{appointment.patient_name}</p>
                  <p className="text-sm text-gray-500">
                    {appointment.doctor} • {appointment.type}
                  </p>
                </div>
                <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Add New Patient
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
