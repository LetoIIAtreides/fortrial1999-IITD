/**
 * AAROGYA LINK DESIGN TOKENS
 * Matches the reference screenshot and Section 3 of specification:
 * Clean, modern, mobile-first Android look with rounded cards, soft shadows,
 * large touch targets (min 48px) and no decorative filler.
 */

export const tokens = {
  colors: {
    primaryBlue: '#1E5BD8',     // Report card, primary buttons, links
    navyText: '#0F2342',        // Titles and primary labels
    mutedText: '#5B6B7F',       // Descriptions and captions
    background: '#F4F6F9',      // App background
    cardGrey: '#EEF1F5',        // Secondary action cards
    paleBlue: '#E3ECFB',        // Icon circles behind blue icons
    successGreen: '#1F9D55',    // Connected banner, verified
    successBg: '#E7F7ED',       // Connected banner background
    emergencyRed: '#D92D20',    // Call 112 button, critical
    palePink: '#FDECEA',        // 112 alert card background
    warningAmber: '#B7791F',    // Risky, needs review
    warningBg: '#FFF4D6',       // Warning card background
    border: '#D8DFE8',          // Dividers, outlined buttons
    white: '#FFFFFF',
    darkNavy: '#0A182F',
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', sans-serif",
    screenTitle: {
      fontSize: '22px',
      fontWeight: 700,
      lineHeight: '28px',
    },
    cardTitle: {
      fontSize: '17px',
      fontWeight: 600,
      lineHeight: '22px',
    },
    body: {
      fontSize: '15px',
      fontWeight: 400,
      lineHeight: '20px',
    },
    caption: {
      fontSize: '13px',
      fontWeight: 500,
      lineHeight: '16px',
    },
    micro: {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '14px',
    },
  },
  radius: {
    card: '18px',
    chip: '12px',
    button: '12px',
    full: '9999px',
  },
  shadow: {
    card: '0 1px 3px rgba(15,35,66,.08), 0 4px 12px rgba(15,35,66,.06)',
    active: '0 4px 16px rgba(30,91,216,.24)',
    bottomNav: '0 -2px 10px rgba(15,35,66,.06)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  touchTargetMin: 48, // pixels
};
