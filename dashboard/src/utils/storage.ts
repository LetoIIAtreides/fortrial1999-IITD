/**
 * AAROGYA LINK LOCAL PERSISTENCE & SYNC (Sections 6 & 10)
 * Stores reports locally before attempting upload (SAVED_LOCAL).
 * Updates to RECEIVED_BY_SERVER upon confirmed server response.
 * Handles offline retry and idempotent submissions.
 */

import { EmergencyReport } from '../types';

const REPORTS_KEY = 'aarogya_reports_v2';
const HEALTH_CARD_KEY = 'aarogya_health_card_v2';

const memStore: Record<string, string> = {};
function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key: string) => memStore[key] || null,
    setItem: (key: string, val: string) => { memStore[key] = val; },
    removeItem: (key: string) => { delete memStore[key]; },
    clear: () => { Object.keys(memStore).forEach((k) => delete memStore[k]); },
  };
}

function safeBtoa(str: string): string {
  if (typeof btoa === 'function') {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
    } catch {
      return btoa(str);
    }
  }
  const g = globalThis as any;
  if (g.Buffer) return g.Buffer.from(str, 'utf-8').toString('base64');
  return str;
}

function safeAtob(str: string): string {
  if (typeof atob === 'function') {
    try {
      return decodeURIComponent(Array.prototype.map.call(atob(str), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } catch {
      return atob(str);
    }
  }
  const g = globalThis as any;
  if (g.Buffer) return g.Buffer.from(str, 'base64').toString('utf-8');
  return str;
}

export interface HealthCardData {
  fullName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  currentMedicines: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  shareWithReports: boolean;
  lastUpdated: string;
}

export const storage = {
  // Reports storage
  getReports(): EmergencyReport[] {
    try {
      const data = getStorage().getItem(REPORTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveReportLocally(report: EmergencyReport): void {
    const list = this.getReports();
    const existingIndex = list.findIndex((r) => r.report_id === report.report_id);
    if (existingIndex >= 0) {
      list[existingIndex] = report;
    } else {
      list.unshift(report);
    }
    getStorage().setItem(REPORTS_KEY, JSON.stringify(list));
  },

  markReportServerReceived(reportId: string, serverData?: Partial<EmergencyReport>): void {
    const list = this.getReports();
    const index = list.findIndex((r) => r.report_id === reportId);
    if (index >= 0) {
      list[index] = {
        ...list[index],
        sync_status: 'RECEIVED_BY_SERVER',
        last_synced_at: new Date().toISOString(),
        ...(serverData || {}),
      };
      getStorage().setItem(REPORTS_KEY, JSON.stringify(list));
    }
  },

  deleteReport(reportId: string): void {
    const list = this.getReports().filter((r) => r.report_id !== reportId);
    getStorage().setItem(REPORTS_KEY, JSON.stringify(list));
  },

  clearAllData(): void {
    getStorage().removeItem(REPORTS_KEY);
    getStorage().removeItem(HEALTH_CARD_KEY);
  },

  // Emergency Health Card storage
  getHealthCard(): HealthCardData | null {
    try {
      const encoded = getStorage().getItem(HEALTH_CARD_KEY);
      if (!encoded) return null;
      const json = safeAtob(encoded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  saveHealthCard(data: HealthCardData): void {
    try {
      const json = JSON.stringify(data);
      const encoded = safeBtoa(json);
      getStorage().setItem(HEALTH_CARD_KEY, encoded);
    } catch {}
  },
};
