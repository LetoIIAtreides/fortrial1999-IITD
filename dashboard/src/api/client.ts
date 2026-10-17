import {
  EmergencyReport,
  HealthcareFacility,
  VerificationAuditLog,
  UserProfile,
  VerificationStatus,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aarogya_token');
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
    report_id: string;
    emergency_type: string;
    urgency: string;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
    description?: string | null;
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
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ items: EmergencyReport[]; total: number; page: number; pages: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.urgency) query.append('urgency', params.urgency);
    if (params?.verification_status) query.append('verification_status', params.verification_status);
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
    notes?: string
  ): Promise<EmergencyReport> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/verification`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        verification_status: status,
        notes: notes || undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Verification update failed. Check responder credentials.');
    }
    return res.json();
  },

  async getAuditLogs(reportId: string): Promise<VerificationAuditLog[]> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/audit-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async getFacilities(district?: string): Promise<HealthcareFacility[]> {
    const url = `${API_BASE}/facilities${district ? `?district=${encodeURIComponent(district)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch facilities');
    return res.json();
  },
};
