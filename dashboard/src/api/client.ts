import {
  EmergencyReport,
  HealthcareFacility,
  VerificationAuditLog,
  UserProfile,
  VerificationStatus,
  RoadSegment,
  TransportOption,
  TransportRequest,
  DashboardSummary,
  HeatmapResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('medlink_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async checkHealth(): Promise<{ status: string; database: string; database_engine: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
    return res.json();
  },

  async login(username: string, password: string): Promise<{ access_token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid credentials');
    }
    return res.json();
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  async createReport(payload: {
    report_id?: string;
    report_type?: string;
    emergency_type: string;
    urgency: string;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
    ward?: string | null;
    people_affected?: number | null;
    description?: string | null;
    evidence_type?: string | null;
    evidence_url?: string | null;
    water_depth?: string | null;
    created_at?: string;
  }): Promise<EmergencyReport> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Report submission failed');
    return res.json();
  },

  async getReports(params?: {
    category?: string;
    urgency?: string;
    verification_status?: string;
    report_type?: string;
    ward?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ items: EmergencyReport[]; total: number; page: number; pages: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.urgency) query.append('urgency', params.urgency);
    if (params?.verification_status) query.append('verification_status', params.verification_status);
    if (params?.report_type) query.append('report_type', params.report_type);
    if (params?.ward) query.append('ward', params.ward);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());

    const url = `${API_BASE}/reports${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async getReport(reportId: string): Promise<EmergencyReport> {
    const res = await fetch(`${API_BASE}/reports/${reportId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  async updateVerification(
    reportId: string,
    status: VerificationStatus,
    notes?: string,
    assignedTo?: string
  ): Promise<EmergencyReport> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/verification`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        verification_status: status,
        notes: notes || null,
        assigned_to: assignedTo || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update verification');
    }
    return res.json();
  },

  async requestMoreInfo(reportId: string, notes?: string): Promise<EmergencyReport> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/request-info`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes: notes || 'Responder requested additional information.' }),
    });
    if (!res.ok) throw new Error('Failed to request info');
    return res.json();
  },

  async getAuditLogs(reportId: string): Promise<VerificationAuditLog[]> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/audit-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getFacilities(): Promise<HealthcareFacility[]> {
    const res = await fetch(`${API_BASE}/facilities`);
    if (!res.ok) throw new Error('Failed to fetch facilities');
    return res.json();
  },

  async getRoads(): Promise<RoadSegment[]> {
    const res = await fetch(`${API_BASE}/roads`);
    if (!res.ok) throw new Error('Failed to fetch roads');
    return res.json();
  },

  async reportRoad(payload: {
    road_name: string;
    status: string;
    hazard_details?: string;
    reported_by?: string;
  }): Promise<RoadSegment> {
    const res = await fetch(`${API_BASE}/roads/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to report road');
    return res.json();
  },

  async getTransportOptions(): Promise<TransportOption[]> {
    const res = await fetch(`${API_BASE}/transport/options`);
    if (!res.ok) throw new Error('Failed to fetch transport options');
    return res.json();
  },

  async requestTransport(payload: {
    transport_type: string;
    pickup_location: string;
    destination?: string;
    people_count?: number;
    urgency?: string;
    notes?: string;
  }): Promise<TransportRequest> {
    const res = await fetch(`${API_BASE}/transport/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to request transport');
    return res.json();
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  async getHeatmap(params?: {
    category?: string;
    urgency?: string;
    hide_flagged?: boolean;
    include_resolved?: boolean;
  }): Promise<HeatmapResponse> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.urgency) query.append('urgency', params.urgency);
    if (params?.hide_flagged) query.append('hide_flagged', 'true');
    if (params?.include_resolved) query.append('include_resolved', 'true');
    const url = `${API_BASE}/dashboard/heatmap${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.status === 401 || res.status === 403) {
      throw new Error('Responder login is required to view the supply heatmap.');
    }
    if (!res.ok) throw new Error('Failed to fetch heatmap');
    return res.json();
  },
};
