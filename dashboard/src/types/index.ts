export type ReportType = 'NEED' | 'OFFER';

export type EmergencyType =
  | 'Pregnancy'
  | 'Diabetes'
  | 'Bleeding'
  | 'Fever'
  | 'Injury'
  | 'Medicine needed'
  | 'Insulin'
  | 'Medicines'
  | 'First aid'
  | 'Clean water'
  | 'Food'
  | 'Blankets'
  | 'Oxygen'
  | 'Transport';

export type UrgencyLevel = 'Critical' | 'Urgent' | 'Can wait' | 'High' | 'Medium' | 'Low';

export type SyncStatus =
  | 'LOCAL_PENDING'
  | 'SYNCING'
  | 'RECEIVED_BY_SERVER'
  | 'SYNC_FAILED';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'RESOLVED'
  | 'FLAGGED';

export interface EmergencyReport {
  report_id: string;
  report_type?: ReportType;
  emergency_type: EmergencyType | string;
  urgency: UrgencyLevel;
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  ward?: string | null;
  people_affected?: number | null;
  description?: string | null;
  evidence_type?: 'photo' | 'voice' | 'none';
  evidence_url?: string | null;
  water_depth?: string | null;
  trust_score?: number | null;
  ai_check_status?: string | null;
  device_fingerprint?: string | null;
  flagged_reason?: string | null;
  nearby_match?: string | null;
  assigned_to?: string | null;
  action_status?: string | null;
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

export interface RoadSegment {
  road_id: string;
  road_name: string;
  status: 'OPEN' | 'RISKY' | 'BLOCKED';
  hazard_details?: string | null;
  travel_time?: string | null;
  destination?: string | null;
  distance_km?: number | null;
  last_reported_at: string;
  reported_by?: string | null;
}

export interface TransportOption {
  option_id: string;
  transport_type: string;
  badge: string;
  status: 'OPEN' | 'RISKY' | 'BLOCKED' | 'WAITING';
  description: string;
  is_available: boolean;
}

export interface TransportRequest {
  request_id: string;
  transport_type: string;
  pickup_location: string;
  destination?: string | null;
  people_count: number;
  urgency: string;
  status: string;
  notes?: string | null;
  created_at: string;
}

export interface DashboardSummary {
  open_requests: number;
  needs_count: number;
  offers_count: number;
  verified_count: number;
  unverified_count: number;
  resolved_count: number;
  flagged_count: number;
  affected_area_km2: number;
  impact_zone: string;
  sample_note: string;
}

export interface HeatmapCategorySplit {
  category: string;
  victim_people: number;
  victim_reports: number;
  rescuer_units: number;
  rescuer_reports: number;
  supply_gap: number;
}

export interface HeatmapCell {
  cell_id: string;
  latitude: number;
  longitude: number;
  victim_people: number;
  victim_reports: number;
  rescuer_units: number;
  rescuer_reports: number;
  supply_gap: number;
  flagged_reports: number;
  top_category: string | null;
  categories: HeatmapCategorySplit[];
  recommended_action: string;
}

export interface HeatmapFacility {
  facility_id: string;
  name: string;
  facility_type: string;
  latitude: number;
  longitude: number;
  is_operational: boolean;
}

export interface HeatmapResponse {
  cells: HeatmapCell[];
  facilities: HeatmapFacility[];
  reports_with_location: number;
  unlocated_reports: number;
  victim_people_total: number;
  rescuer_units_total: number;
  grid_size_meters: number;
  last_updated: string;
  privacy_note: string;
  sample_note: string;
  contains_demo_data: boolean;
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
