export type EmergencyType =
  | 'Pregnancy'
  | 'Diabetes'
  | 'Bleeding'
  | 'Fever'
  | 'Injury'
  | 'Medicine needed';

export type UrgencyLevel = 'Low' | 'Medium' | 'High';

export type SyncStatus =
  | 'LOCAL_PENDING'
  | 'SYNCING'
  | 'RECEIVED_BY_SERVER'
  | 'SYNC_FAILED';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'RESOLVED';

export interface EmergencyReport {
  report_id: string;
  emergency_type: EmergencyType;
  urgency: UrgencyLevel;
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  description?: string | null;
  sync_status: SyncStatus;
  verification_status: VerificationStatus;
  verified_at?: string | null;
  verified_by?: string | null;
  verification_notes?: string | null;
  last_synced_at: string;
}

export interface HealthcareFacility {
  facility_id: string;
  name: string;
  facility_type: string;
  address: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergency_capacity: string;
  is_operational: boolean;
  last_updated_at: string;
}

export interface VerificationAuditLog {
  log_id: string;
  report_id: string;
  responder_id: string;
  responder_username: string;
  previous_status: string;
  new_status: string;
  notes?: string | null;
  timestamp: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  role: 'responder' | 'admin' | 'public';
  full_name: string;
  badge_number?: string | null;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}
