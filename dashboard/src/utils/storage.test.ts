import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from './storage';
import { EmergencyReport } from '../types';

describe('Storage Persistence & Sync Transitions (Section 6 & 10)', () => {
  beforeEach(() => {
    storage.clearAllData();
  });

  it('saves a report locally before upload with SAVED_LOCAL status', () => {
    const testReport: EmergencyReport = {
      report_id: 'rep-test-01',
      report_type: 'NEED',
      emergency_type: 'Bleeding',
      urgency: 'High',
      created_at: new Date().toISOString(),
      sync_status: 'LOCAL_PENDING',
      verification_status: 'UNVERIFIED',
    };

    storage.saveReportLocally(testReport);
    const stored = storage.getReports();
    expect(stored.length).toBe(1);
    expect(stored[0].report_id).toBe('rep-test-01');
    expect(stored[0].sync_status).toBe('LOCAL_PENDING');
  });

  it('transitions report to RECEIVED_BY_SERVER after confirmed upload', () => {
    const testReport: EmergencyReport = {
      report_id: 'rep-test-02',
      report_type: 'NEED',
      emergency_type: 'Pregnancy',
      urgency: 'Critical',
      created_at: new Date().toISOString(),
      sync_status: 'LOCAL_PENDING',
      verification_status: 'UNVERIFIED',
    };

    storage.saveReportLocally(testReport);
    storage.markReportServerReceived('rep-test-02', { verification_status: 'UNVERIFIED' });

    const stored = storage.getReports();
    expect(stored[0].sync_status).toBe('RECEIVED_BY_SERVER');
    expect(stored[0].last_synced_at).toBeDefined();
  });

  it('saves and encrypts/restores Emergency Health Card data', () => {
    storage.saveHealthCard({
      fullName: 'Vikram Singh',
      age: 42,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      chronicConditions: 'Type 1 Diabetes',
      currentMedicines: 'Insulin Glargine',
      emergencyContactName: 'Sunita Singh',
      emergencyContactPhone: '9876543210',
      shareWithReports: true,
      lastUpdated: new Date().toISOString(),
    });

    const card = storage.getHealthCard();
    expect(card).not.toBeNull();
    expect(card?.fullName).toBe('Vikram Singh');
    expect(card?.bloodGroup).toBe('O+');
  });
});
