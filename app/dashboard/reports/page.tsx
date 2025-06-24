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
import { Download, Eye, FileText, Plus, Search, Loader2 } from "lucide-react"
import { supabase, type TestReport } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const [reports, setReports] = useState<TestReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<TestReport>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch reports from Supabase
  const fetchReports = async () => {
    try {
      const { data, error } = await supabase.from("test_reports").select("*").order("test_date", { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch test reports. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const filteredReports = reports.filter(
    (report) =>
      report.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.test_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "normal":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const generateReportId = () => {
    const lastId = reports.length > 0 ? Math.max(...reports.map((r) => Number.parseInt(r.id.substring(1)))) : 0
    return `R${String(lastId + 1).padStart(3, "0")}`
  }

  const handleAddReport = async () => {
    if (!formData.patient_name || !formData.test_type || !formData.test_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const newReport: Omit<TestReport, "created_at" | "updated_at"> = {
        id: generateReportId(),
        patient_name: formData.patient_name || "",
        patient_id: formData.patient_id || "",
        test_type: formData.test_type || "",
        test_date: formData.test_date || "",
        report_date: formData.report_date || null,
        status: (formData.status as TestReport["status"]) || "Pending",
        doctor: formData.doctor || "",
        technician: formData.technician || "",
        results: formData.results || "",
        notes: formData.notes || "",
        priority: (formData.priority as TestReport["priority"]) || "Normal",
      }

      const { error } = await supabase.from("test_reports").insert([newReport])

      if (error) throw error

      toast({
        title: "Success",
        description: "Test report added successfully!",
      })

      setFormData({})
      setIsAddDialogOpen(false)
      fetchReports() // Refresh the list
    } catch (error) {
      console.error("Error adding report:", error)
      toast({
        title: "Error",
        description: "Failed to add test report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openViewDialog = (report: TestReport) => {
    setSelectedReport(report)
    setIsViewDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading test reports...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Reports</h1>
          <p className="text-gray-600">Manage and review patient test results</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Test Report</DialogTitle>
              <DialogDescription>Create a new test report for a patient.</DialogDescription>
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
                <Label htmlFor="test_type">Test Type *</Label>
                <Select
                  value={formData.test_type}
                  onValueChange={(value) => setFormData({ ...formData, test_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blood Test">Blood Test</SelectItem>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="CT Scan">CT Scan</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                    <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                    <SelectItem value="ECG">ECG</SelectItem>
                    <SelectItem value="Blood Sugar Test">Blood Sugar Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as TestReport["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test_date">Test Date *</Label>
                <Input
                  id="test_date"
                  type="date"
                  value={formData.test_date || ""}
                  onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report_date">Report Date</Label>
                <Input
                  id="report_date"
                  type="date"
                  value={formData.report_date || ""}
                  onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Input
                  id="doctor"
                  value={formData.doctor || ""}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  placeholder="Enter doctor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technician">Technician</Label>
                <Input
                  id="technician"
                  value={formData.technician || ""}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  placeholder="Enter technician name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as TestReport["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="results">Results</Label>
                <Textarea
                  id="results"
                  value={formData.results || ""}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  placeholder="Enter test results"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReport} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">All test reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter((r) => r.status === "Pending").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting results</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter((r) => r.status === "In Review").length}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter((r) => r.priority === "Critical").length}</div>
            <p className="text-xs text-muted-foreground">Critical priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Test Reports</CardTitle>
          <CardDescription>View and manage all patient test reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports by patient, test type, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test Type</TableHead>
                <TableHead>Test Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.patient_name}</div>
                      <div className="text-sm text-gray-500">{report.patient_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{report.test_type}</TableCell>
                  <TableCell>{report.test_date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
                  </TableCell>
                  <TableCell>{report.doctor}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openViewDialog(report)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Test Report Details</DialogTitle>
            <DialogDescription>Complete test report for {selectedReport?.patient_name}</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Report ID</Label>
                  <p className="text-sm">{selectedReport.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Patient Name</Label>
                  <p className="text-sm">{selectedReport.patient_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Patient ID</Label>
                  <p className="text-sm">{selectedReport.patient_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Test Type</Label>
                  <p className="text-sm">{selectedReport.test_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Test Date</Label>
                  <p className="text-sm">{selectedReport.test_date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Report Date</Label>
                  <p className="text-sm">{selectedReport.report_date || "Not completed"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Doctor</Label>
                  <p className="text-sm">{selectedReport.doctor}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Technician</Label>
                  <p className="text-sm">{selectedReport.technician}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <Badge className={getPriorityColor(selectedReport.priority)}>{selectedReport.priority}</Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Test Results</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedReport.results || "Results pending"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Notes</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedReport.notes || "No additional notes"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
