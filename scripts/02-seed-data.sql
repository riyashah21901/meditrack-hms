-- Insert sample patients
INSERT INTO patients (id, name, age, gender, phone, email, address, status, condition, admission_date, doctor, blood_group, emergency_contact) VALUES
('P001', 'John Smith', 45, 'Male', '+1 (555) 123-4567', 'john.smith@email.com', '123 Main St, New York, NY 10001', 'Critical', 'Cardiac Arrest', '2024-01-10', 'Dr. Johnson', 'O+', '+1 (555) 987-6543'),
('P002', 'Emily Davis', 32, 'Female', '+1 (555) 234-5678', 'emily.davis@email.com', '456 Oak Ave, Los Angeles, CA 90210', 'Normal', 'Regular Checkup', '2024-01-15', 'Dr. Wilson', 'A+', '+1 (555) 876-5432'),
('P003', 'Michael Brown', 58, 'Male', '+1 (555) 345-6789', 'michael.brown@email.com', '789 Pine St, Chicago, IL 60601', 'Critical', 'Pneumonia', '2024-01-12', 'Dr. Johnson', 'B+', '+1 (555) 765-4321'),
('P004', 'Sarah Wilson', 28, 'Female', '+1 (555) 456-7890', 'sarah.wilson@email.com', '321 Elm St, Houston, TX 77001', 'Normal', 'Pregnancy Checkup', '2024-01-14', 'Dr. Martinez', 'AB+', '+1 (555) 654-3210'),
('P005', 'Robert Taylor', 67, 'Male', '+1 (555) 567-8901', 'robert.taylor@email.com', '654 Maple Ave, Phoenix, AZ 85001', 'Stable', 'Diabetes Management', '2024-01-11', 'Dr. Johnson', 'O-', '+1 (555) 543-2109'),
('P006', 'Lisa Anderson', 34, 'Female', '+1 (555) 678-9012', 'lisa.anderson@email.com', '987 Cedar St, Miami, FL 33101', 'Normal', 'Annual Physical', '2024-01-16', 'Dr. Wilson', 'A-', '+1 (555) 432-1098'),
('P007', 'David Martinez', 52, 'Male', '+1 (555) 789-0123', 'david.martinez@email.com', '246 Birch Ave, Seattle, WA 98101', 'Stable', 'Hypertension', '2024-01-13', 'Dr. Martinez', 'B-', '+1 (555) 321-0987'),
('P008', 'Jennifer Lee', 29, 'Female', '+1 (555) 890-1234', 'jennifer.lee@email.com', '135 Spruce St, Denver, CO 80201', 'Critical', 'Appendicitis', '2024-01-17', 'Dr. Johnson', 'AB-', '+1 (555) 210-9876');

-- Insert sample appointments
INSERT INTO appointments (id, patient_name, patient_id, doctor, appointment_date, appointment_time, type, status, notes, duration) VALUES
('A001', 'John Smith', 'P001', 'Dr. Johnson', '2024-01-16', '09:00', 'Consultation', 'Scheduled', 'Follow-up for cardiac condition', '30 minutes'),
('A002', 'Emily Davis', 'P002', 'Dr. Wilson', '2024-01-16', '10:30', 'Checkup', 'Completed', 'Regular health checkup', '45 minutes'),
('A003', 'Michael Brown', 'P003', 'Dr. Johnson', '2024-01-16', '14:00', 'Treatment', 'In Progress', 'Pneumonia treatment session', '60 minutes'),
('A004', 'Sarah Wilson', 'P004', 'Dr. Martinez', '2024-01-17', '11:00', 'Consultation', 'Scheduled', 'Pregnancy consultation', '30 minutes'),
('A005', 'Robert Taylor', 'P005', 'Dr. Johnson', '2024-01-17', '15:30', 'Follow-up', 'Scheduled', 'Diabetes management follow-up', '30 minutes'),
('A006', 'Lisa Anderson', 'P006', 'Dr. Wilson', '2024-01-18', '09:30', 'Physical', 'Scheduled', 'Annual physical examination', '60 minutes'),
('A007', 'David Martinez', 'P007', 'Dr. Martinez', '2024-01-18', '13:00', 'Follow-up', 'Scheduled', 'Blood pressure monitoring', '30 minutes'),
('A008', 'Jennifer Lee', 'P008', 'Dr. Johnson', '2024-01-19', '08:00', 'Surgery', 'Scheduled', 'Appendectomy procedure', '120 minutes');

-- Insert sample test reports
INSERT INTO test_reports (id, patient_name, patient_id, test_type, test_date, report_date, status, doctor, technician, results, notes, priority) VALUES
('R001', 'John Smith', 'P001', 'Blood Test', '2024-01-14', '2024-01-15', 'Completed', 'Dr. Johnson', 'Tech. Sarah', 'Hemoglobin: 12.5 g/dL (Normal), White Blood Cells: 7,200/μL (Normal), Platelets: 250,000/μL (Normal)', 'All values within normal range. Continue current medication.', 'Normal'),
('R002', 'Emily Davis', 'P002', 'X-Ray', '2024-01-15', '2024-01-15', 'Completed', 'Dr. Wilson', 'Tech. Mike', 'Chest X-ray shows clear lungs with no signs of infection or abnormalities.', 'Normal chest X-ray. No follow-up required.', 'Normal'),
('R003', 'Michael Brown', 'P003', 'CT Scan', '2024-01-14', '2024-01-16', 'In Review', 'Dr. Johnson', 'Tech. Lisa', 'CT scan of chest shows signs of pneumonia in lower right lobe.', 'Requires immediate treatment. Patient has been notified.', 'Critical'),
('R004', 'Sarah Wilson', 'P004', 'Ultrasound', '2024-01-15', NULL, 'Pending', 'Dr. Martinez', 'Tech. Anna', '', 'Routine pregnancy ultrasound scheduled.', 'Normal'),
('R005', 'Robert Taylor', 'P005', 'Blood Sugar Test', '2024-01-13', '2024-01-14', 'Completed', 'Dr. Johnson', 'Tech. Sarah', 'Fasting glucose: 145 mg/dL (Elevated), HbA1c: 7.2% (Elevated)', 'Blood sugar levels elevated. Adjust medication dosage.', 'Urgent'),
('R006', 'Lisa Anderson', 'P006', 'Blood Test', '2024-01-16', '2024-01-17', 'Completed', 'Dr. Wilson', 'Tech. Sarah', 'Complete Blood Count: All values normal. Cholesterol: 180 mg/dL (Normal)', 'Excellent health markers. Continue current lifestyle.', 'Normal'),
('R007', 'David Martinez', 'P007', 'ECG', '2024-01-13', '2024-01-14', 'Completed', 'Dr. Martinez', 'Tech. John', 'ECG shows normal sinus rhythm. No signs of arrhythmia.', 'Heart rhythm normal. Continue blood pressure medication.', 'Normal'),
('R008', 'Jennifer Lee', 'P008', 'CT Scan', '2024-01-17', NULL, 'Pending', 'Dr. Johnson', 'Tech. Lisa', '', 'Pre-operative CT scan for appendectomy.', 'Urgent');
