import React, { useState, useEffect, useCallback } from 'react';
import {
  HeartPulse,
  PhoneCall,
  AlertCircle,
  BellRing,
  ClipboardList,
  MapPin,
  Building2,
  HelpCircle,
  ArrowLeft,
  Volume2,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Home,
  AlertTriangle,
  Send,
  UserCheck
} from 'lucide-react';
import { api } from './api/client';
import { EmergencyReport, HealthcareFacility, UserProfile, VerificationStatus } from './types';
import L from 'leaflet';

export const App: React.FC = () => {
  // Navigation & Current Screen
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'report_categories' | 'report_details' | 'report_result' | 'my_reports' | 'map' | 'facilities' | 'help' | 'responder_portal'
  >('home');

  // Backend Health & Connectivity
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastHealthChecked, setLastHealthChecked] = useState<Date>(new Date());

  // Language state ('en' | 'hi')
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Form State for Emergency Reporting
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('High');
  const [locationName, setLocationName] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResultReport, setSubmissionResultReport] = useState<EmergencyReport | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(true);

  // Local Persistent Reports & Backend Data
  const [localReports, setLocalReports] = useState<EmergencyReport[]>(() => {
    try {
      const saved = localStorage.getItem('aarogya_local_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [backendReports, setBackendReports] = useState<EmergencyReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Responder Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [responderLoginUser, setResponderLoginUser] = useState('responder_ravi');
  const [responderLoginPass, setResponderLoginPass] = useState('Responder@12345');
  const [responderNotes, setResponderNotes] = useState('');
  const [selectedReportForAction, setSelectedReportForAction] = useState<EmergencyReport | null>(null);

  // Save reports to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('aarogya_local_reports', JSON.stringify(localReports));
    } catch {}
  }, [localReports]);

  // Periodic health check and data polling
  const checkHealthAndSync = useCallback(async () => {
    try {
      await api.checkHealth();
      setIsOnline(true);
      setLastHealthChecked(new Date());

      // Fetch facilities
      const facList = await api.getFacilities().catch(() => []);
      if (facList.length > 0) setFacilities(facList);

      // Fetch backend reports
      const repList = await api.getReports({ page_size: 50 }).catch(() => ({ items: [] }));
      if (repList.items) {
        setBackendReports(repList.items);

        // Update local reports if verification status changed on server
        setLocalReports((prev) =>
          prev.map((loc) => {
            const serverMatch = repList.items.find((s) => s.report_id === loc.report_id);
            if (serverMatch) {
              return {
                ...loc,
                sync_status: 'RECEIVED_BY_SERVER',
                verification_status: serverMatch.verification_status,
                verified_by: serverMatch.verified_by,
                verification_notes: serverMatch.verification_notes,
                last_synced_at: serverMatch.last_synced_at
              };
            }
            return loc;
          })
        );
      }
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkHealthAndSync();
    const interval = setInterval(checkHealthAndSync, 10000);
    return () => clearInterval(interval);
  }, [checkHealthAndSync]);

  // Spoken labels via Web SpeechSynthesis API
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // GPS Location handler
  const handleGetGpsLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocationName(
            `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
          );
        },
        () => {
          setLocationName('GPS permission not available. Enter manually.');
        }
      );
    }
  };

  // Submit Emergency Report
  const handleSubmitReport = async () => {
    if (!selectedCategory) {
      alert('Please select an emergency category.');
      return;
    }

    setIsSubmitting(true);
    const newReportId = `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();

    const newReport: EmergencyReport = {
      report_id: newReportId,
      emergency_type: selectedCategory as any,
      urgency: selectedUrgency as any,
      created_at: nowIso,
      latitude: latitude,
      longitude: longitude,
      location_name: locationName.trim() || null,
      description: description.trim() || null,
      sync_status: 'LOCAL_PENDING',
      verification_status: 'UNVERIFIED',
      last_synced_at: nowIso
    };

    // 1. Save locally first
    const updatedLocals = [newReport, ...localReports];
    setLocalReports(updatedLocals);

    // 2. Submit to backend
    try {
      const serverResponse = await api.createReport({
        report_id: newReport.report_id,
        emergency_type: newReport.emergency_type,
        urgency: newReport.urgency,
        latitude: newReport.latitude,
        longitude: newReport.longitude,
        location_name: newReport.location_name,
        description: newReport.description,
        created_at: newReport.created_at
      });

      const syncedReport: EmergencyReport = {
        ...newReport,
        sync_status: 'RECEIVED_BY_SERVER',
        verification_status: serverResponse?.verification_status || 'UNVERIFIED',
        last_synced_at: new Date().toISOString()
      };

      setLocalReports((prev) =>
        prev.map((r) => (r.report_id === newReportId ? syncedReport : r))
      );
      setSubmissionResultReport(syncedReport);
      setSubmissionSuccess(true);
    } catch {
      // Failed to upload -> preserved locally as SYNC_FAILED
      const failedReport: EmergencyReport = {
        ...newReport,
        sync_status: 'SYNC_FAILED'
      };
      setLocalReports((prev) =>
        prev.map((r) => (r.report_id === newReportId ? failedReport : r))
      );
      setSubmissionResultReport(failedReport);
      setSubmissionSuccess(false);
    } finally {
      setIsSubmitting(false);
      setCurrentScreen('report_result');
    }
  };

  // Responder Login & Verification
  const handleResponderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.login(responderLoginUser, responderLoginPass);
      localStorage.setItem('aarogya_token', res.access_token);
      setUser(res.user);
      checkHealthAndSync();
    } catch (err: any) {
      alert(err.message || 'Login failed');
    }
  };

  const handleVerifyReport = async (reportId: string, status: VerificationStatus) => {
    try {
      const updated = await api.updateVerification(reportId, status, responderNotes);
      setBackendReports((prev) =>
        prev.map((r) => (r.report_id === reportId ? updated : r))
      );
      setLocalReports((prev) =>
        prev.map((r) => (r.report_id === reportId ? updated : r))
      );
      setSelectedReportForAction(null);
      setResponderNotes('');
      alert(`Report marked as ${status}`);
    } catch (err: any) {
      alert(err.message || 'Verification update failed. Check credentials.');
    }
  };

  return (
    <div className="app-viewport">
      {/* A. Top App Header */}
      <header className="app-header">
        <div className="brand-box">
          <div className="brand-icon-wrapper">
            <HeartPulse size={24} />
          </div>
          <div>
            <div className="brand-title-text">AAROGYA LINK</div>
            <div className="brand-tagline-text">
              {lang === 'hi' ? 'मदद साझा करें। जीवन बचाएं।' : 'Share Help. Save Lives.'}
            </div>
          </div>
        </div>

        <div className="header-controls">
          <button
            onClick={() =>
              speak(
                lang === 'hi'
                  ? 'आरोग्य लिंक। आपातकालीन स्वास्थ्य रिपोर्टिंग और सहायता पोर्टल।'
                  : 'Aarogya Link. Emergency healthcare reporting and response portal.'
              )
            }
            className="tts-btn"
            title="Read aloud"
            aria-label="Read aloud"
          >
            <Volume2 size={18} />
          </button>

          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="lang-btn"
          >
            {lang === 'en' ? 'हिन्दी' : 'EN'}
          </button>

          {/* Responder Access Icon */}
          <button
            onClick={() =>
              setCurrentScreen(
                currentScreen === 'responder_portal' ? 'home' : 'responder_portal'
              )
            }
            className="tts-btn"
            style={{ color: user ? '#16a34a' : '#2563eb' }}
            title={user ? `Responder: ${user.full_name}` : 'Responder Login'}
            aria-label="Responder Portal"
          >
            <ShieldCheck size={18} />
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="screen-container">
        {/* ========================================================
            SCREEN 1 — HOME
        ======================================================== */}
        {currentScreen === 'home' && (
          <div>
            {/* B. Connectivity Status Banner */}
            <div className={`connectivity-banner ${isOnline ? 'online' : 'offline'}`}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="status-indicator-dot" />
                <span>
                  {isOnline
                    ? lang === 'hi'
                      ? 'ऑनलाइन • सर्वर कनेक्टेड'
                      : 'Online • Server Connected'
                    : lang === 'hi'
                    ? 'सर्वर अनुपलब्ध • स्थानीय रूप से सुरक्षित'
                    : 'Server Unavailable • Saved Locally'}
                </span>
              </div>
              <button
                onClick={checkHealthAndSync}
                style={{ background: 'transparent', color: 'inherit', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
              >
                <RefreshCw size={12} />
                <span>Sync</span>
              </button>
            </div>

            {/* C. Emergency Contact Card (Red Alert) */}
            <div className="emergency-alert-card">
              <div className="emergency-alert-header">
                <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                <div className="emergency-alert-text">
                  {lang === 'hi'
                    ? 'यदि आपके पास फोन सिग्नल है और तुरंत मदद चाहिए, तो पहले 112 पर कॉल करें।'
                    : 'If you have a working phone signal and need urgent help, call 112 first.'}
                </div>
              </div>
              <a href="tel:112" className="btn-call-112">
                <PhoneCall size={18} />
                <span>{lang === 'hi' ? '112 पर कॉल करें' : 'Call 112'}</span>
              </a>
            </div>

            {/* D. Primary Action Card (Blue Report Emergency) */}
            <button
              onClick={() => {
                setSelectedCategory('');
                setCurrentScreen('report_categories');
              }}
              className="primary-action-card"
            >
              <div className="primary-card-icon">
                <BellRing size={26} />
              </div>
              <div>
                <div className="primary-card-title">
                  {lang === 'hi' ? 'आपातकाल रिपोर्ट करें' : 'Report Emergency'}
                </div>
                <div className="primary-card-desc">
                  {lang === 'hi'
                    ? 'तत्काल चिकित्सा सहायता या आवश्यक दवाएं मांगें'
                    : 'Request immediate medical assistance'}
                </div>
              </div>
            </button>

            {/* E. Secondary Action Cards (4 Light Grey Cards) */}
            <div className="secondary-cards-list">
              {/* 1. My Reports */}
              <div
                onClick={() => setCurrentScreen('my_reports')}
                className="secondary-action-card"
              >
                <div className="secondary-card-icon-box">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'मेरी रिपोर्ट्स' : 'My Reports'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi'
                      ? 'अपनी सबमिट की गई रिपोर्ट्स की स्थिति देखें'
                      : 'View status of submitted reports'}
                  </div>
                </div>
              </div>

              {/* 2. Emergency Map */}
              <div
                onClick={() => setCurrentScreen('map')}
                className="secondary-action-card"
              >
                <div className="secondary-card-icon-box">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'आपातकालीन मानचित्र' : 'Emergency Map'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi'
                      ? 'क्षेत्रीय घटनाएं और चालू स्वास्थ्य केंद्र देखें'
                      : 'View regional incidents and operational information'}
                  </div>
                </div>
              </div>

              {/* 3. Healthcare Facilities */}
              <div
                onClick={() => setCurrentScreen('facilities')}
                className="secondary-action-card"
              >
                <div className="secondary-card-icon-box">
                  <Building2 size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'स्वास्थ्य सुविधाएं' : 'Healthcare Facilities'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi'
                      ? 'जिला अस्पतालों, सीएचसी और क्लीनिकों की सूची'
                      : 'Directory of district hospitals, CHCs, and other facilities'}
                  </div>
                </div>
              </div>

              {/* 4. Help & Information */}
              <div
                onClick={() => setCurrentScreen('help')}
                className="secondary-action-card"
              >
                <div className="secondary-card-icon-box">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'सहायता और जानकारी' : 'Help & Information'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi'
                      ? 'प्राथमिक उपचार निर्देश और आपातकालीन संपर्क'
                      : 'First aid guidance and emergency contact information'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 2 — REPORT EMERGENCY: CATEGORY SELECTION
        ======================================================== */}
        {currentScreen === 'report_categories' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => setCurrentScreen('home')}
                style={{ background: 'transparent', padding: 6, display: 'flex' }}
              >
                <ArrowLeft size={22} color="#0f172a" />
              </button>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'hi' ? 'आपको किस प्रकार की सहायता चाहिए?' : 'What kind of help do you need?'}
                </h2>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {lang === 'hi' ? 'एक आपातकालीन श्रेणी चुनें' : 'Select an emergency category below'}
                </div>
              </div>
            </div>

            <div className="category-grid">
              {[
                { key: 'Pregnancy', icon: '🤰', en: 'Pregnancy', hi: 'गर्भावस्था / प्रसव' },
                { key: 'Bleeding', icon: '🩸', en: 'Bleeding', hi: 'गंभीर रक्तस्राव' },
                { key: 'Diabetes', icon: '🩺', en: 'Diabetes', hi: 'मधुमेह' },
                { key: 'Fever', icon: '🌡️', en: 'Fever', hi: 'तेज बुखार' },
                { key: 'Injury', icon: '🩹', en: 'Injury', hi: 'चोट / फ्रैक्चर' },
                { key: 'Medicine needed', icon: '💊', en: 'Medicine needed', hi: 'दवा की आवश्यकता' }
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => {
                    setSelectedCategory(item.key);
                    speak(lang === 'hi' ? item.hi : item.en);
                  }}
                  className={`category-tile ${selectedCategory === item.key ? 'selected' : ''}`}
                >
                  <div className="category-tile-icon">{item.icon}</div>
                  <div className="category-tile-label">
                    {lang === 'hi' ? item.hi : item.en}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (!selectedCategory) {
                  alert('Please select an emergency category');
                  return;
                }
                setCurrentScreen('report_details');
              }}
              className="btn-primary-action"
              style={{ marginTop: 12 }}
            >
              <span>{lang === 'hi' ? 'आगे बढ़ें: तात्कालिकता और स्थान' : 'Next: Urgency & Location'}</span>
            </button>
          </div>
        )}

        {/* ========================================================
            SCREEN 3 — REPORT DETAILS AND CONFIRMATION
        ======================================================== */}
        {currentScreen === 'report_details' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => setCurrentScreen('report_categories')}
                style={{ background: 'transparent', padding: 6, display: 'flex' }}
              >
                <ArrowLeft size={22} color="#0f172a" />
              </button>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'hi' ? 'आपातकालीन विवरण' : 'Emergency Details'}
                </h2>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Category: <strong>{selectedCategory}</strong>
                </div>
              </div>
            </div>

            {/* Urgency Selection */}
            <div className="form-group">
              <label className="form-label">
                {lang === 'hi' ? 'तात्कालिकता स्तर' : 'Urgency Level'}
              </label>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                Urgency is self-reported by community, not a clinical diagnosis.
              </div>
              <div className="urgency-selector-row">
                {['High', 'Medium', 'Low'].map((lvl) => (
                  <div
                    key={lvl}
                    onClick={() => setSelectedUrgency(lvl)}
                    className={`urgency-btn ${lvl.toLowerCase()} ${
                      selectedUrgency === lvl ? 'selected' : ''
                    }`}
                  >
                    {lvl}
                  </div>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            <div className="form-group">
              <label className="form-label">
                {lang === 'hi' ? 'स्थान विवरण' : 'Location Details'}
              </label>
              <button
                type="button"
                onClick={handleGetGpsLocation}
                className="btn-secondary-action"
                style={{ marginBottom: 8 }}
              >
                <Navigation size={16} color="#2563eb" />
                <span>
                  {latitude
                    ? `GPS: ${latitude.toFixed(4)}, ${longitude?.toFixed(4)}`
                    : 'Get Current GPS Location'}
                </span>
              </button>
              <input
                type="text"
                placeholder="e.g. Near Joshimath Helipad, Tent 4"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                {lang === 'hi' ? 'लक्षण या विवरण (वैकल्पिक)' : 'Notes / Description (Optional)'}
              </label>
              <textarea
                rows={3}
                placeholder="Describe patient age, condition, road blockage, or supplies needed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
              />
            </div>

            {/* Warning Card */}
            <div
              style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 12,
                color: '#92400e',
                marginBottom: 16
              }}
            >
              <strong>Notice:</strong> Saving a report locally preserves it safely on this device, but does not prove server delivery until server response is confirmed.
            </div>

            {/* Submit Action */}
            <button
              onClick={handleSubmitReport}
              disabled={isSubmitting}
              className="btn-primary-action"
              style={{ background: '#dc2626' }}
            >
              <Send size={18} />
              <span>
                {isSubmitting
                  ? 'Submitting...'
                  : lang === 'hi'
                  ? 'समीक्षा करें और भेजें'
                  : 'Confirm and Submit Report'}
              </span>
            </button>
          </div>
        )}

        {/* ========================================================
            SCREEN 4 — SUBMISSION RESULT
        ======================================================== */}
        {currentScreen === 'report_result' && submissionResultReport && (
          <div style={{ textAlign: 'center', padding: '16px 4px' }}>
            {submissionSuccess ? (
              <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <CheckCircle2 size={56} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#16a34a', marginBottom: 6 }}>
                  Report Received by Server
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                  Your emergency report has been validated and recorded on the disaster response server. Authorized responders in this grid have been alerted.
                </p>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, textAlign: 'left', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Report ID</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                    {submissionResultReport.report_id}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Category</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{submissionResultReport.emergency_type}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Urgency</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>{submissionResultReport.urgency}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Status</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>RECEIVED</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => setCurrentScreen('my_reports')}
                    className="btn-primary-action"
                  >
                    <span>View in My Reports</span>
                  </button>
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="btn-secondary-action"
                  >
                    <span>Back to Home</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <AlertTriangle size={56} color="#d97706" style={{ margin: '0 auto 12px' }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#d97706', marginBottom: 6 }}>
                  Saved Locally — Not Yet Received by Server
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                  The backend service was unreachable. Your report has been preserved securely on this device. It will automatically retry syncing when connection is restored.
                </p>

                <button
                  onClick={handleSubmitReport}
                  className="btn-primary-action"
                  style={{ marginBottom: 10 }}
                >
                  <RefreshCw size={16} />
                  <span>Retry Online Upload</span>
                </button>
                <button
                  onClick={() => setCurrentScreen('my_reports')}
                  className="btn-secondary-action"
                >
                  <span>Go to My Reports</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SCREEN 5 — MY REPORTS
        ======================================================== */}
        {currentScreen === 'my_reports' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setCurrentScreen('home')}
                  style={{ background: 'transparent', padding: 6, display: 'flex' }}
                >
                  <ArrowLeft size={22} color="#0f172a" />
                </button>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'hi' ? 'मेरी रिपोर्ट्स' : 'My Reports'}
                </h2>
              </div>
              <button
                onClick={checkHealthAndSync}
                style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RefreshCw size={14} />
                <span>Sync</span>
              </button>
            </div>

            {localReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <ClipboardList size={40} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>No Reports Submitted Yet</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Any emergency reports you create will be preserved locally and listed here.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {localReports.map((report) => (
                  <div
                    key={report.report_id}
                    style={{ background: '#ffffff', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                          {report.emergency_type}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          ID: {report.report_id.slice(0, 14)}... • {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span className={`badge-pill ${report.urgency.toLowerCase()}`}>
                        {report.urgency}
                      </span>
                    </div>

                    {report.location_name && (
                      <div style={{ fontSize: 12, color: '#334155', marginTop: 8 }}>
                        📍 {report.location_name}
                      </div>
                    )}

                    {report.description && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        {report.description}
                      </div>
                    )}

                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge-pill ${report.sync_status === 'RECEIVED_BY_SERVER' ? 'received' : 'failed'}`}>
                        {report.sync_status === 'RECEIVED_BY_SERVER' ? 'Received by Server' : 'Pending Upload'}
                      </span>

                      <span className={`badge-pill ${report.verification_status === 'VERIFIED' ? 'verified' : 'pending'}`}>
                        {report.verification_status === 'VERIFIED' ? 'Verified by Responder' : report.verification_status}
                      </span>
                    </div>

                    {report.verification_notes && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: '#166534', marginTop: 8 }}>
                        <strong>Responder ({report.verified_by || 'Disaster Team'}): </strong>
                        {report.verification_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SCREEN 6 — EMERGENCY MAP
        ======================================================== */}
        {currentScreen === 'map' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <button
                onClick={() => setCurrentScreen('home')}
                style={{ background: 'transparent', padding: 6, display: 'flex' }}
              >
                <ArrowLeft size={22} color="#0f172a" />
              </button>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'hi' ? 'आपातकालीन मानचित्र' : 'Emergency Map'}
                </h2>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Last updated: {lastHealthChecked.toLocaleTimeString()} • Coarse public locations
                </div>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: 14, padding: 14, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>
                  ● {facilities.length} Healthcare Facilities
                </span>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>
                  ● {backendReports.length} Active Incident Hotspots
                </span>
              </div>

              {/* Map Canvas */}
              <div
                id="interactive-map"
                className="map-display-box"
                ref={(el) => {
                  if (el && !el.dataset.initialized) {
                    el.dataset.initialized = 'true';
                    const map = L.map(el, { center: [30.41, 79.32], zoom: 9 });
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                      attribution: '&copy; OpenStreetMap'
                    }).addTo(map);

                    facilities.forEach((fac) => {
                      if (fac.latitude && fac.longitude) {
                        L.circleMarker([fac.latitude, fac.longitude], {
                          radius: 8,
                          fillColor: '#2563eb',
                          color: '#ffffff',
                          weight: 2,
                          fillOpacity: 0.9
                        })
                          .addTo(map)
                          .bindPopup(`<strong>${fac.name}</strong><br/>${fac.phone}`);
                      }
                    });

                    backendReports.forEach((rep) => {
                      if (rep.latitude && rep.longitude) {
                        L.circleMarker([rep.latitude, rep.longitude], {
                          radius: 8,
                          fillColor: '#dc2626',
                          color: '#ffffff',
                          weight: 2,
                          fillOpacity: 0.9
                        })
                          .addTo(map)
                          .bindPopup(`<strong>${rep.emergency_type}</strong><br/>Urgency: ${rep.urgency}`);
                      }
                    });
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 7 — HEALTHCARE FACILITIES
        ======================================================== */}
        {currentScreen === 'facilities' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <button
                onClick={() => setCurrentScreen('home')}
                style={{ background: 'transparent', padding: 6, display: 'flex' }}
              >
                <ArrowLeft size={22} color="#0f172a" />
              </button>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'hi' ? 'स्वास्थ्य सुविधाएं' : 'Healthcare Facilities'}
                </h2>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Regional District Hospitals & Primary Health Centers
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {facilities.map((fac) => (
                <div
                  key={fac.facility_id}
                  style={{ background: '#ffffff', borderRadius: 14, padding: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                    {fac.facility_type}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '2px 0 4px' }}>
                    {fac.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569' }}>📍 {fac.address}, {fac.district}</div>
                  <div style={{ background: '#eff6ff', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#1e40af', margin: '6px 0' }}>
                    <strong>Capacity:</strong> {fac.emergency_capacity}
                  </div>
                  <a
                    href={`tel:${fac.phone}`}
                    className="btn-call-112"
                    style={{ background: '#2563eb', height: 38, fontSize: 13, textDecoration: 'none' }}
                  >
                    <PhoneCall size={14} />
                    <span>Call {fac.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 8 — HELP & INFORMATION
        ======================================================== */}
        {currentScreen === 'help' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => setCurrentScreen('home')}
                style={{ background: 'transparent', padding: 6, display: 'flex' }}
              >
                <ArrowLeft size={22} color="#0f172a" />
              </button>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'hi' ? 'सहायता और जानकारी' : 'Help & Information'}
                </h2>
                <div style={{ fontSize: 11, color: '#64748b' }}>Emergency Contacts & First Aid Guides</div>
              </div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>
                Important Reminder
              </div>
              <div style={{ fontSize: 12, color: '#991b1b' }}>
                If you have mobile signal and need urgent help, call 112 first. This application assists community disaster tracking and coordination.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {[
                { num: '112', title: 'National Emergency Service' },
                { num: '108', title: 'Disaster Ambulance & Medical Rescue' },
                { num: '102', title: 'Free Pregnancy Ambulance' },
                { num: '1070', title: 'State Disaster Management (SDMA)' }
              ].map((h) => (
                <div
                  key={h.num}
                  style={{ background: '#ffffff', borderRadius: 12, padding: '12px 14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{h.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Toll Free 24x7</div>
                  </div>
                  <a
                    href={`tel:${h.num}`}
                    style={{ background: '#2563eb', color: '#ffffff', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                  >
                    Call {h.num}
                  </a>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Emergency First Aid Tips
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 12, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <strong style={{ color: '#dc2626' }}>Bleeding:</strong> Press firmly on the wound with clean cloth. Elevate limb above heart. Do not remove soaked cloth.
              </div>
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 12, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <strong style={{ color: '#2563eb' }}>Pregnancy:</strong> Keep patient calm and resting on left side. Prepare boiled water and warm towels.
              </div>
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 12, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <strong style={{ color: '#d97706' }}>Fracture:</strong> Do not attempt to straighten limb. Splint with rigid stick or rolled blanket.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 9 — RESPONDER OPERATIONS PORTAL
        ======================================================== */}
        {currentScreen === 'responder_portal' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setCurrentScreen('home')}
                  style={{ background: 'transparent', padding: 6, display: 'flex' }}
                >
                  <ArrowLeft size={22} color="#0f172a" />
                </button>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  Responder Command
                </h2>
              </div>
              {user && (
                <button
                  onClick={() => {
                    localStorage.removeItem('aarogya_token');
                    setUser(null);
                  }}
                  style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}
                >
                  Logout
                </button>
              )}
            </div>

            {!user ? (
              <form onSubmit={handleResponderLogin} style={{ background: '#ffffff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                  Authorized Responder Login
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={responderLoginUser}
                    onChange={(e) => setResponderLoginUser(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={responderLoginPass}
                    onChange={(e) => setResponderLoginPass(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="btn-primary-action">
                  Sign In as Responder
                </button>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 10, textAlign: 'center' }}>
                  Demo: responder_ravi / Responder@12345
                </div>
              </form>
            ) : (
              <div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 13, color: '#166534' }}>
                  Logged in as: <strong>{user.full_name}</strong> ({user.badge_number || user.role})
                </div>

                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  Incoming Community Reports ({backendReports.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {backendReports.map((r) => (
                    <div
                      key={r.report_id}
                      style={{ background: '#ffffff', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{r.emergency_type}</strong>
                        <span className={`badge-pill ${r.urgency.toLowerCase()}`}>{r.urgency}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', margin: '4px 0' }}>
                        {r.location_name || 'No GPS'} • Status: <strong>{r.verification_status}</strong>
                      </div>
                      {r.description && <div style={{ fontSize: 12, color: '#334155', marginBottom: 8 }}>{r.description}</div>}

                      {selectedReportForAction?.report_id === r.report_id ? (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                          <input
                            type="text"
                            placeholder="Enter dispatch notes / triage action..."
                            value={responderNotes}
                            onChange={(e) => setResponderNotes(e.target.value)}
                            className="form-input"
                            style={{ marginBottom: 8 }}
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleVerifyReport(r.report_id, 'VERIFIED')}
                              style={{ flex: 1, background: '#16a34a', color: '#ffffff', padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerifyReport(r.report_id, 'RESOLVED')}
                              style={{ flex: 1, background: '#0891b2', color: '#ffffff', padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => setSelectedReportForAction(null)}
                              style={{ background: '#f1f5f9', color: '#64748b', padding: '8px 12px', borderRadius: 6, fontSize: 12 }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReportForAction(r);
                            setResponderNotes('');
                          }}
                          style={{ width: '100%', background: '#eff6ff', color: '#2563eb', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 700, marginTop: 4 }}
                        >
                          Review & Verify
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav-bar">
        <button
          onClick={() => setCurrentScreen('home')}
          className={`bottom-nav-item ${currentScreen === 'home' ? 'active' : ''}`}
        >
          <Home size={19} />
          <span>Home</span>
        </button>
        <button
          onClick={() => {
            setSelectedCategory('');
            setCurrentScreen('report_categories');
          }}
          className={`bottom-nav-item ${
            currentScreen === 'report_categories' || currentScreen === 'report_details'
              ? 'active'
              : ''
          }`}
        >
          <BellRing size={19} />
          <span>Report</span>
        </button>
        <button
          onClick={() => setCurrentScreen('my_reports')}
          className={`bottom-nav-item ${currentScreen === 'my_reports' ? 'active' : ''}`}
        >
          <ClipboardList size={19} />
          <span>My Reports</span>
        </button>
        <button
          onClick={() => setCurrentScreen('facilities')}
          className={`bottom-nav-item ${currentScreen === 'facilities' ? 'active' : ''}`}
        >
          <Building2 size={19} />
          <span>Facilities</span>
        </button>
        <button
          onClick={() => setCurrentScreen('map')}
          className={`bottom-nav-item ${currentScreen === 'map' ? 'active' : ''}`}
        >
          <MapPin size={19} />
          <span>Map</span>
        </button>
      </nav>
    </div>
  );
};
