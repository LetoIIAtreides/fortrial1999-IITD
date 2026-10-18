import { describe, it, expect } from 'vitest';
import { computeTrustScore } from './trustScoring';

describe('Rule-Based Trust Scoring Function (Section 9)', () => {
  it('assigns "Likely genuine" (>= 70) to a verified report with photo and corroboration', () => {
    const result = computeTrustScore({
      inImpactZone: 'PASS',
      hasLivePhoto: true,
      photoGpsMatched: true,
      independentReportsCount: 2,
      deviceHistory: 'NORMAL',
      isPlausible: true,
      aiServiceConfigured: false,
    });

    // 20 base + 20 impact + 20 photo + 20 reports + 15 device + 15 plausibility = 100 max clamped
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.label).toBe('Likely genuine');
    expect(result.reasons.length).toBe(5);
    expect(result.reasons.find((r) => r.checkName === 'Impact Zone')?.status).toBe('PASS');
    expect(result.reasons.find((r) => r.checkName === 'Live Capture')?.status).toBe('PASS');
  });

  it('assigns "Needs review" (40-69) to a new device without photo in neutral zone', () => {
    const result = computeTrustScore({
      inImpactZone: 'UNKNOWN',
      hasLivePhoto: false,
      independentReportsCount: 1,
      deviceHistory: 'NEW',
      isPlausible: true,
      aiServiceConfigured: false,
    });

    // 20 base + 0 impact + 0 photo + 10 report + 0 device + 15 plausibility = 45
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(70);
    expect(result.label).toBe('Needs review');
  });

  it('assigns "Low confidence" (< 40) when location is flagged and device is flagged', () => {
    const result = computeTrustScore({
      inImpactZone: 'FLAG',
      hasLivePhoto: false,
      independentReportsCount: 0,
      deviceHistory: 'FLAGGED',
      isPlausible: false,
      aiServiceConfigured: false,
    });

    // 20 base - 15 impact + 0 photo + 0 report - 20 device - 15 plausibility = -30 -> clamped to 0
    expect(result.score).toBeLessThan(40);
    expect(result.label).toBe('Low confidence');
    expect(result.label).not.toBe('false'); // Explicit rule: Never label as 'false'
  });

  it('proves a missing AI service shows "Not checked" and does not invent scores', () => {
    const result = computeTrustScore({
      inImpactZone: 'PASS',
      hasLivePhoto: true,
      independentReportsCount: 0,
      deviceHistory: 'NEW',
      isPlausible: true,
      aiServiceConfigured: false, // AI NOT configured
    });

    expect(result.aiAssisted).toBe(false);
    expect(result.aiNote).toContain('Not checked');
  });
});
