-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    phone TEXT NOT NULL,
    email TEXT UNIQUE,
    address TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Critical', 'Normal', 'Stable')),
    condition TEXT NOT NULL,
    admission_date DATE NOT NULL,
    doctor TEXT NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    emergency_contact TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'In Progress')),
    notes TEXT,
    duration TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_reports table
CREATE TABLE IF NOT EXISTS test_reports (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL,
    test_date DATE NOT NULL,
    report_date DATE,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Completed', 'In Review')),
    doctor TEXT NOT NULL,
    technician TEXT NOT NULL,
    results TEXT,
    notes TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('Normal', 'Urgent', 'Critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor);
CREATE INDEX IF NOT EXISTS idx_patients_admission_date ON patients(admission_date);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_reports_patient_id ON test_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON test_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON test_reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_test_date ON test_reports(test_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_reports_updated_at BEFORE UPDATE ON test_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_reports ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all operations on test_reports" ON test_reports FOR ALL USING (true);
