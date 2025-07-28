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
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Eye, Plus, Search, Trash2, Loader2, AlertCircle } from "lucide-react"
import { supabase, isSupabaseAvailable, localStorageHelpers, type Patient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Patient>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch patients from Supabase or localStorage
  const fetchPatients = async () => {
    try {
      if (isSupabaseAvailable && supabase) {
        const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })
        if (error) throw error
        setPatients(data || [])
      } else {
        // Fallback to localStorage
        const localPatients = localStorageHelpers.getPatients()
        setPatients(localPatients)
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      // Fallback to localStorage on error
      const localPatients = localStorageHelpers.getPatients()
      setPatients(localPatients)

      if (isSupabaseAvailable) {
        toast({
          title: "Database Error",
          description: "Using local storage as fallback. Data will be saved locally.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const generatePatientId = () => {
    const lastId = patients.length > 0 ? Math.max(...patients.map((p) => Number.parseInt(p.id.substring(1)))) : 0
    return `P${String(lastId + 1).padStart(3, "0")}`
  }

  const handleAddPatient = async () => {
    if (!formData.name || !formData.age || !formData.gender) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const newPatient: Patient = {
        id: generatePatientId(),
        name: formData.name || "",
        age: formData.age || 0,
        gender: formData.gender || "",
        phone: formData.phone || "",
        email: formData.email || "",
        address: formData.address || "",
        status: (formData.status as Patient["status"]) || "Normal",
        condition: formData.condition || "",
        admission_date: new Date().toISOString().split("T")[0],
        doctor: formData.doctor || "",
        blood_group: formData.blood_group || "",
        emergency_contact: formData.emergency_contact || "",
      }

      if (isSupabaseAvailable && supabase) {
        const { error } = await supabase.from("patients").insert([newPatient])
        if (error) throw error
      } else {
        // Use localStorage
        const updatedPatients = [...patients, newPatient]
        setPatients(updatedPatients)
        localStorageHelpers.setPatients(updatedPatients)
      }

      toast({
        title: "Success",
        description: "Patient added successfully!",
      })

      setFormData({})
      setIsAddDialogOpen(false)
      if (isSupabaseAvailable) {
        fetchPatients() // Refresh from database
      }
    } catch (error) {
      console.error("Error adding patient:", error)
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPatient = async () => {
    if (!selectedPatient || !formData.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      if (isSupabaseAvailable && supabase) {
        const { error } = await supabase
          .from("patients")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedPatient.id)
        if (error) throw error
      } else {
        // Use localStorage
        const updatedPatients = patients.map((patient) =>
          patient.id === selectedPatient.id ? { ...patient, ...formData } : patient,
        )
        setPatients(updatedPatients)
        localStorageHelpers.setPatients(updatedPatients)
      }

      toast({
        title: "Success",
        description: "Patient updated successfully!",
      })

      setFormData({})
      setSelectedPatient(null)
      setIsEditDialogOpen(false)
      if (isSupabaseAvailable) {
        fetchPatients() // Refresh from database
      }
    } catch (error) {
      console.error("Error updating patient:", error)
      toast({
        title: "Error",
        description: "Failed to update patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      return
    }

    try {
      if (isSupabaseAvailable && supabase) {
        const { error } = await supabase.from("patients").delete().eq("id", patientId)
        if (error) throw error
      } else {
        // Use localStorage
        const updatedPatients = patients.filter((patient) => patient.id !== patientId)
        setPatients(updatedPatients)
        localStorageHelpers.setPatients(updatedPatients)
      }

      toast({
        title: "Success",
        description: "Patient deleted successfully!",
      })

      if (isSupabaseAvailable) {
        fetchPatients() // Refresh from database
      }
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData(patient)
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({})
    setSelectedPatient(null)
  }

  const handleOpenAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading patients...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Database Status Banner */}
      {!isSupabaseAvailable && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Demo Mode</p>
              <p className="text-sm text-yellow-700">
                Using local storage. Data will persist in this browser session only.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <Button onClick={handleOpenAddDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>Search and manage patient information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name, ID, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell>{patient.condition}</TableCell>
                  <TableCell>{patient.doctor}</TableCell>
                  <TableCell>{patient.admission_date}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openViewDialog(patient)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(patient)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePatient(patient.id)}
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

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>Enter the patient's information to create a new record.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-1">
            <div className="grid grid-cols-2 gap-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: Number.parseInt(e.target.value) })}
                  placeholder="Enter age"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Patient["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Stable">Stable</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Assigned Doctor</Label>
                <Input
                  id="doctor"
                  value={formData.doctor || ""}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  placeholder="Enter doctor name"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="condition">Condition/Diagnosis</Label>
                <Textarea
                  id="condition"
                  value={formData.condition || ""}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="Enter condition or diagnosis"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact || ""}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Enter emergency contact number"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPatient} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Complete information for {selectedPatient?.name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-1">
            {selectedPatient && (
              <div className="grid grid-cols-2 gap-4 py-4 pr-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Patient ID</Label>
                  <p className="text-sm">{selectedPatient.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="text-sm">{selectedPatient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Age</Label>
                  <p className="text-sm">{selectedPatient.age}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Gender</Label>
                  <p className="text-sm">{selectedPatient.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Blood Group</Label>
                  <p className="text-sm">{selectedPatient.blood_group}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedPatient.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedPatient.email}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">{selectedPatient.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedPatient.status)}>{selectedPatient.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Assigned Doctor</Label>
                  <p className="text-sm">{selectedPatient.doctor}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Condition/Diagnosis</Label>
                  <p className="text-sm">{selectedPatient.condition}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Admission Date</Label>
                  <p className="text-sm">{selectedPatient.admission_date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                  <p className="text-sm">{selectedPatient.emergency_contact}</p>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update patient information for {selectedPatient?.name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-1">
            <div className="grid grid-cols-2 gap-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age *</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: Number.parseInt(e.target.value) })}
                  placeholder="Enter age"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-blood_group">Blood Group</Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Patient["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Stable">Stable</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-doctor">Assigned Doctor</Label>
                <Input
                  id="edit-doctor"
                  value={formData.doctor || ""}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  placeholder="Enter doctor name"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-condition">Condition/Diagnosis</Label>
                <Textarea
                  id="edit-condition"
                  value={formData.condition || ""}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="Enter condition or diagnosis"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-emergency_contact">Emergency Contact</Label>
                <Input
                  id="edit-emergency_contact"
                  value={formData.emergency_contact || ""}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Enter emergency contact number"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPatient} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
