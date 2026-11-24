-- Vercel Postgres Schema for Dr. Kgomotso Mokoena Practice
-- Automatically executed on first run, or runnable in Vercel Storage -> Postgres -> Query console

CREATE TABLE IF NOT EXISTS clinic_settings (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(255) PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(50) NOT NULL,
  id_number VARCHAR(50) NOT NULL,
  dob VARCHAR(50),
  gender VARCHAR(20),
  service_id VARCHAR(100) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  service_duration INT NOT NULL DEFAULT 30,
  service_price INT NOT NULL DEFAULT 650,
  payment_type VARCHAR(50) NOT NULL,
  medical_aid_scheme VARCHAR(100),
  medical_aid_number VARCHAR(100),
  medical_aid_dependent_code VARCHAR(20),
  date VARCHAR(20) NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  reason_for_visit TEXT,
  is_first_visit BOOLEAN DEFAULT FALSE,
  doctor_notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy queries by date and status
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON appointments(reference);
