-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    status TEXT CHECK (status IN ('Critical', 'Normal', 'Stable')) DEFAULT 'Normal',
    condition TEXT,
    admission_date DATE DEFAULT CURRENT_DATE,
    doctor TEXT,
    blood_group TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_id TEXT,
    doctor TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type TEXT NOT NULL,
    status TEXT CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'In Progress')) DEFAULT 'Scheduled',
    notes TEXT,
    duration TEXT DEFAULT '30 minutes',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_reports table
CREATE TABLE IF NOT EXISTS test_reports (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_id TEXT,
    test_type TEXT NOT NULL,
    test_date DATE NOT NULL,
    report_date DATE,
    status TEXT CHECK (status IN ('Pending', 'Completed', 'In Review')) DEFAULT 'Pending',
    doctor TEXT,
    technician TEXT,
    results TEXT,
    notes TEXT,
    priority TEXT CHECK (priority IN ('Normal', 'Urgent', 'Critical')) DEFAULT 'Normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON test_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON test_reports(priority);
