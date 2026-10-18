/**
 * AAROGYA LINK REGIONAL & SYSTEM CONFIGURATION
 * Section 5: Regional phone numbers and tile configuration in one file.
 */

export const config = {
  appName: 'AAROGYA LINK',
  tagline: 'Share Help. Save Lives.',
  emergencyNumbers: {
    nationalEmergency: '112',
    ambulance: '108',
  },
  map: {
    tileProviderUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    defaultCenter: [30.5564, 79.5662] as [number, number], // Joshimath, Uttarakhand
    defaultZoom: 14,
  },
  nearbyRadiusKm: 10,
  staleDataThresholdMinutes: 10,
  reportExpirationHours: 24,
  demoMode: false,
};

export const isDemoMode = config.demoMode;
