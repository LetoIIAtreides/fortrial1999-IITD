/**
 * AAROGYA LINK FORM VALIDATION (Section 6)
 * Strict validation with inline errors and mobile number verification.
 */

export interface ReportFormValues {
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | string;
  peopleAffected: number;
  locationName?: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string;
  contactNumber?: string;
}

export interface ValidationErrors {
  category?: string;
  urgency?: string;
  peopleAffected?: string;
  location?: string;
  description?: string;
  contactNumber?: string;
}

export function validateReportForm(values: ReportFormValues): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  // Category required
  if (!values.category || !values.category.trim()) {
    errors.category = 'Emergency category is required.';
  }

  // Urgency required
  if (!values.urgency || !['Low', 'Medium', 'High', 'Critical'].includes(values.urgency)) {
    errors.urgency = 'Urgency level must be selected (Low, Medium, High).';
  }

  // People affected: 1 to 50
  if (typeof values.peopleAffected !== 'number' || values.peopleAffected < 1 || values.peopleAffected > 50) {
    errors.peopleAffected = 'People affected must be between 1 and 50.';
  }

  // Location required (either GPS or text label)
  const hasGps = typeof values.latitude === 'number' && typeof values.longitude === 'number';
  const hasTextLocation = Boolean(values.locationName && values.locationName.trim().length > 0);
  if (!hasGps && !hasTextLocation) {
    errors.location = 'Please use your GPS location or specify a landmark/ward.';
  }

  // Description up to 300 chars
  if (values.description && values.description.length > 300) {
    errors.description = `Description exceeds 300 characters (current: ${values.description.length}).`;
  }

  // 10-digit Indian mobile number validation (optional field, but if provided must match)
  if (values.contactNumber && values.contactNumber.trim().length > 0) {
    const cleanPhone = values.contactNumber.replace(/[\s\-\+]/g, '');
    const indianMobileRegex = /^(?:91)?[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleanPhone)) {
      errors.contactNumber = 'Please enter a valid 10-digit Indian mobile number.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
