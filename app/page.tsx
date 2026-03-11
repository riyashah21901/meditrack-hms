"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Shield, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"doctor" | "patient">("doctor")
  const [patientId, setPatientId] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "doctor") {
      // Simple demo login - in real app, this would validate credentials
      if (email && password) {
        localStorage.setItem("meditrack-auth", "true")
        localStorage.setItem("meditrack-role", "doctor")
        localStorage.setItem("meditrack-user-email", email)
        router.push("/dashboard")
      }
    } else {
      // Patient login - link by patient ID
      if (patientId.trim()) {
        localStorage.setItem("meditrack-auth", "true")
        localStorage.setItem("meditrack-role", "patient")
        localStorage.setItem("meditrack-patient-id", patientId.trim())
        router.push("/patient")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/40 to-accent/20 flex items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl md:grid-cols-[1.1fr_0.9fr]">
        {/* Form side */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/40">
              <Heart className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">MediTrack</h1>
              <p className="text-sm text-muted-foreground sm:text-[0.9rem]">Connected care. Clear insights.</p>
            </div>
          </div>

          <Card className="border-0 bg-background/80 shadow-none">
            <CardHeader className="space-y-1 px-0 pt-0">
              <CardTitle className="text-2xl sm:text-3xl font-semibold">Welcome back</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Sign in as a doctor to manage the hospital dashboard or as a patient to view your appointments.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-6">
              <div className="mb-4 inline-flex rounded-full bg-muted/60 p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMode("doctor")}
                  className={`flex-1 rounded-full px-4 py-1.5 transition ${
                    mode === "doctor" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setMode("patient")}
                  className={`flex-1 rounded-full px-4 py-1.5 transition ${
                    mode === "patient" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Patient
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {mode === "doctor" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Doctor Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="doctor@meditrack.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl border-input bg-background/80 shadow-[0_0_0_1px_rgba(148,163,184,0.15)] focus-visible:ring-primary/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 rounded-xl border-input bg-background/80 shadow-[0_0_0_1px_rgba(148,163,184,0.15)] focus-visible:ring-primary/70"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="patient-id">Patient ID</Label>
                      <Input
                        id="patient-id"
                        placeholder="e.g. P001"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        required
                        className="h-11 rounded-xl border-input bg-background/80 shadow-[0_0_0_1px_rgba(148,163,184,0.15)] focus-visible:ring-primary/70"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use the Patient ID provided by your hospital to securely view your scheduled appointments.
                    </p>
                  </>
                )}
                <Button
                  type="submit"
                  className="mt-2 h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:-translate-y-[1px] hover:bg-primary/90"
                >
                  {mode === "doctor" ? "Sign in as Doctor" : "Sign in as Patient"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs sm:text-sm">
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Patient-first</span>
              <span className="text-[0.7rem] text-muted-foreground">Unified records across the hospital.</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Secure</span>
              <span className="text-[0.7rem] text-muted-foreground">Role-based access with audit trails.</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Heart className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Reliable</span>
              <span className="text-[0.7rem] text-muted-foreground">Always-on monitoring and alerts.</span>
            </div>
          </div>
        </div>

        {/* Illustration / Story side */}
        <div className="relative hidden h-full items-stretch bg-gradient-to-br from-primary via-accent to-emerald-500/90 p-8 text-primary-foreground md:flex">
          <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light">
            <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl" />
            <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Live hospital overview
              </div>
              <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
                A calmer command center
                <br />
                for every ward.
              </h2>
              <p className="max-w-xs text-sm text-primary-foreground/80">
                Track admissions, critical cases, and lab results in one place. Designed for doctors, nurses, and
                administrators who need clarity at a glance.
              </p>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl bg-black/10 p-4 text-sm backdrop-blur">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-black/10 px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[0.75rem] uppercase tracking-wide text-primary-foreground/70">Today</span>
                  <span className="text-sm font-semibold">Critical cases monitored</span>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-50">
                  12 wards
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-black/5 px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[0.75rem] uppercase tracking-wide text-primary-foreground/70">
                    Response time
                  </span>
                  <span className="text-sm font-semibold">Code blue readiness</span>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-primary-foreground">
                  &lt; 90 seconds
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[0.75rem] uppercase tracking-wide text-primary-foreground/70">
                    Data integrity
                  </span>
                  <span className="text-sm font-semibold">End-to-end encrypted</span>
                </div>
                <span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground">
                  HIPAA-ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
