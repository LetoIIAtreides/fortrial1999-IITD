import { describe, it, expect } from 'vitest';
import { validateReportForm } from './validation';

describe('Form Validation & Error Handling (Section 6)', () => {
  it('validates a complete and correct emergency report form', () => {
    const valid = validateReportForm({
      category: 'Pregnancy',
      urgency: 'High',
      peopleAffected: 1,
      latitude: 30.556,
      longitude: 79.567,
      description: 'Acute labor pains, road blocked by silt',
      contactNumber: '9876543210',
    });

    expect(valid.isValid).toBe(true);
    expect(Object.keys(valid.errors).length).toBe(0);
  });

  it('rejects submission with missing category and missing location', () => {
    const invalid = validateReportForm({
      category: '',
      urgency: 'High',
      peopleAffected: 1,
      latitude: null,
      longitude: null,
      locationName: '',
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.category).toBeDefined();
    expect(invalid.errors.location).toBeDefined();
  });

  it('rejects description longer than 300 characters', () => {
    const longText = 'A'.repeat(305);
    const invalid = validateReportForm({
      category: 'Bleeding',
      urgency: 'High',
      peopleAffected: 1,
      locationName: 'Joshimath Ward 4',
      description: longText,
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.description).toContain('exceeds 300 characters');
  });

  it('validates 10-digit Indian mobile numbers and rejects invalid formats', () => {
    const invalidNumber = validateReportForm({
      category: 'Diabetes',
      urgency: 'Medium',
      peopleAffected: 1,
      locationName: 'Camp A',
      contactNumber: '12345', // Invalid
    });
    expect(invalidNumber.isValid).toBe(false);
    expect(invalidNumber.errors.contactNumber).toBeDefined();

    const validNumber = validateReportForm({
      category: 'Diabetes',
      urgency: 'Medium',
      peopleAffected: 1,
      locationName: 'Camp A',
      contactNumber: '9876543210', // Valid Indian mobile starting with 9
    });
    expect(validNumber.isValid).toBe(true);
  });
});
