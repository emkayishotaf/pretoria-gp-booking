import { Appointment, ClinicSettings } from './types';
import { DEFAULT_CLINIC_SETTINGS } from './constants';

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

// Parse Postgres connection URL for Neon HTTP fallback
function parsePostgresUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.replace(/^\//, ''),
      port: parsed.port || '5432',
    };
  } catch (e) {
    return null;
  }
}

// Cached pool instance across serverless invocations
let cachedPool: any = null;

async function getVercelPool(connectionString: string) {
  if (cachedPool) return cachedPool;

  try {
    const mod: any = await import('@vercel/postgres');
    if (mod.createPool) {
      cachedPool = mod.createPool({ connectionString });
    } else if (mod.default?.createPool) {
      cachedPool = mod.default.createPool({ connectionString });
    } else {
      cachedPool = mod;
    }
    return cachedPool;
  } catch (err) {
    return null;
  }
}

// Universal query runner: attempts @vercel/postgres, falls back to Neon HTTP endpoint
export async function queryPostgres(sqlText: string, params: any[] = []): Promise<any[]> {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('No Postgres connection string found in environment variables');
  }

  // 1. Try @vercel/postgres with cached pool
  try {
    const pool = await getVercelPool(connectionString);
    if (pool && typeof pool.query === 'function') {
      const result = await pool.query(sqlText, params);
      return result.rows || [];
    }
  } catch (err: any) {
    console.warn('Vercel postgres pool query error, falling back to HTTP:', err?.message || err);
  }

  // 2. Fall back to Neon SQL HTTP endpoint
  const parsed = parsePostgresUrl(connectionString);
  if (!parsed) {
    throw new Error('Could not parse Postgres connection string');
  }

  const neonHttpUrl = `https://${parsed.host}/sql`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Neon-Connection-String': connectionString,
  };

  if (parsed.password) {
    headers['Authorization'] = `Bearer ${parsed.password}`;
  }

  const res = await fetch(neonHttpUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: sqlText,
      params,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Postgres query failed via HTTP: ${res.status} ${errBody}`);
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.rows)) {
    return data.rows;
  }
  return [];
}

// Convert database snake_case row to TypeScript Appointment
export function mapRowToAppointment(row: any): Appointment {
  return {
    id: row.id,
    reference: row.reference,
    patientName: row.patient_name,
    patientEmail: row.patient_email,
    patientPhone: row.patient_phone,
    idNumber: row.id_number,
    dob: row.dob || undefined,
    gender: row.gender || undefined,
    serviceId: row.service_id,
    serviceName: row.service_name,
    serviceDuration: Number(row.service_duration),
    servicePrice: Number(row.service_price),
    paymentType: row.payment_type,
    medicalAidScheme: row.medical_aid_scheme || undefined,
    medicalAidNumber: row.medical_aid_number || undefined,
    medicalAidDependentCode: row.medical_aid_dependent_code || undefined,
    date: row.date,
    timeSlot: row.time_slot,
    status: row.status,
    reasonForVisit: row.reason_for_visit,
    isFirstVisit: Boolean(row.is_first_visit),
    doctorNotes: row.doctor_notes || undefined,
    cancellationReason: row.cancellation_reason || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

let initialized = false;

export async function initPostgresSchema(): Promise<void> {
  if (initialized || !isPostgresConfigured()) return;

  try {
    // 1. Create Tables
    await queryPostgres(`
      CREATE TABLE IF NOT EXISTS clinic_settings (
        id INT PRIMARY KEY DEFAULT 1,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await queryPostgres(`
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
    `);

    // 2. Ensure initial settings row exists
    const settingsRows = await queryPostgres('SELECT id FROM clinic_settings WHERE id = 1');
    if (settingsRows.length === 0) {
      await queryPostgres(
        'INSERT INTO clinic_settings (id, data, updated_at) VALUES (1, $1, NOW()) ON CONFLICT (id) DO NOTHING',
        [JSON.stringify(DEFAULT_CLINIC_SETTINGS)]
      );
    }

    initialized = true;
  } catch (err) {
    console.warn('Could not initialize Postgres schema:', err);
  }
}
