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
  UserCheck,
  Camera,
  Map as MapIcon,
  PlusCircle,
  HeartHandshake,
  Layers,
  Flame
} from 'lucide-react';
import { api } from './api/client';
import { EmergencyReport, HealthcareFacility, UserProfile, VerificationStatus } from './types';
import { EmergencyMapScreen } from './components/MapScreen';
import { AddNeedOfferScreen } from './components/NeedOfferScreen';
import { LiveCameraScreen } from './components/CameraScreen';
import { RoadsTransportScreen } from './components/RoadsScreen';
import { ResponderConsoleScreen } from './components/ConsoleScreen';
import { FacilitiesList } from './components/FacilityList';
import { LoginModal } from './components/LoginModal';
import { ReportDetailModal } from './components/DetailModal';
import { HeatmapScreen } from './components/HeatmapScreen';

export const App: React.FC = () => {
  // Navigation & Current Screen
  const [currentScreen, setCurrentScreen] = useState<
    | 'home'
    | 'report_categories'
    | 'report_details'
    | 'report_result'
    | 'my_reports'
    | 'emergency_map'
    | 'add_need_offer'
    | 'live_camera'
    | 'roads_transport'
    | 'facilities'
    | 'help_info'
    | 'responder_console'
    | 'supply_heatmap'
  >('home');

  // Need/Offer initial mode
  const [needOfferMode, setNeedOfferMode] = useState<'NEED' | 'OFFER'>('NEED');

  // Backend Health & Connectivity
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastHealthChecked, setLastHealthChecked] = useState<Date>(new Date());

  // Language state ('en' | 'hi')
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Form State for Report Emergency triage
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
      const saved = localStorage.getItem('medlink_local_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [backendReports, setBackendReports] = useState<EmergencyReport[]>([]);
  const [backendReportsError, setBackendReportsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Responder Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [selectedReportForModal, setSelectedReportForModal] = useState<EmergencyReport | null>(null);

  // Save reports to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('medlink_local_reports', JSON.stringify(localReports));
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

      // Detailed reports contain sensitive health and location data; only load them for responders.
      if (user) {
        try {
          const repList = await api.getReports({ page_size: 50 });
          setBackendReports(repList.items);
          setBackendReportsError(null);
          setLocalReports((prev) =>
            prev.map((loc) => {
              const serverMatch = repList.items.find((serverReport) => serverReport.report_id === loc.report_id);
              return serverMatch
                ? {
                    ...loc,
                    sync_status: 'RECEIVED_BY_SERVER',
                    verification_status: serverMatch.verification_status,
                    verified_by: serverMatch.verified_by,
                    verification_notes: serverMatch.verification_notes,
                    last_synced_at: serverMatch.last_synced_at,
                  }
                : loc;
            })
          );
        } catch {
          setBackendReportsError('Could not load reports. Refresh or sign in again to retry.');
        }
      } else {
        setBackendReports([]);
        setBackendReportsError(null);
      }
    } catch {
      setIsOnline(false);
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('medlink_token');
    if (token) {
      api.getMe().then(setUser).catch(() => {
        localStorage.removeItem('medlink_token');
      });
    }
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

  // Submit Emergency Report (Screen 2/3)
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
      report_type: 'NEED',
      emergency_type: selectedCategory,
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

    // Save locally first
    setLocalReports((prev) => [newReport, ...prev]);

    // Send to backend
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

  // Combined reports (backend reports + pending locals)
  const allReportsMap = new Map<string, EmergencyReport>();
  backendReports.forEach((r) => allReportsMap.set(r.report_id, r));
  localReports.forEach((r) => allReportsMap.set(r.report_id, r));
  const combinedReports = Array.from(allReportsMap.values());

  // Render Full Responder Console if selected
  if (currentScreen === 'supply_heatmap') {
    return (
      <div className="desktop-viewport">
        <HeatmapScreen
          user={user}
          onNavigateHome={() => setCurrentScreen('home')}
          onLoginClick={() => setShowLoginModal(true)}
          onUserRestored={setUser}
        />
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSuccess={(loggedInUser: UserProfile) => {
              setUser(loggedInUser);
              setShowLoginModal(false);
              checkHealthAndSync();
            }}
          />
        )}
      </div>
    );
  }

  if (currentScreen === 'responder_console') {
    return (
      <div className="desktop-viewport">
        <ResponderConsoleScreen
          reports={combinedReports}
          reportsError={backendReportsError}
          user={user}
          onNavigateHome={() => setCurrentScreen('home')}
          onLoginClick={() => setShowLoginModal(true)}
          onOpenHeatmap={() => setCurrentScreen('supply_heatmap')}
        />
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSuccess={(loggedInUser: UserProfile) => {
              setUser(loggedInUser);
              setShowLoginModal(false);
              checkHealthAndSync();
            }}
          />
        )}
      </div>
    );
  }

  // Render Mobile-First Viewport
  return (
    <div className="app-viewport">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-box" onClick={() => setCurrentScreen('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper">
            <HeartPulse size={24} />
          </div>
          <div>
            <div className="brand-title-text">MED-LINK</div>
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
                  ? 'मेड-लिंक। आपातकालीन स्वास्थ्य रिपोर्टिंग और सहायता पोर्टल।'
                  : 'MED-LINK. Emergency healthcare reporting and response portal.'
              )
            }
            className="tts-btn"
            title="Read aloud"
          >
            <Volume2 size={18} />
          </button>

          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="lang-btn"
          >
            {lang === 'en' ? 'हिन्दी' : 'EN'}
          </button>

          <button
            onClick={() => setCurrentScreen('supply_heatmap')}
            className="tts-btn"
            style={{ color: '#dc2626' }}
            title="Authority victim population tracker"
            aria-label="Open authority victim population tracker"
          >
            <Flame size={18} />
          </button>

          <button
            onClick={() => setCurrentScreen('responder_console')}
            className="tts-btn"
            style={{ color: user ? '#16a34a' : '#2563eb' }}
            title="Responder Console"
          >
            <ShieldCheck size={18} />
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="screen-container">
        {/* ================= SCREEN 1: HOME ================= */}
        {currentScreen === 'home' && (
          <div>
            {/* Status Banner */}
            <div className="status-banner">
              <div className="status-text">
                <span className="status-dot" style={{ background: isOnline ? '#16a34a' : '#dc2626' }} />
                <span>
                  {isOnline
                    ? (lang === 'hi' ? 'ऑनलाइन · सर्वर जुड़ा हुआ है' : 'Online · Server Connected')
                    : (lang === 'hi' ? 'ऑफ़लाइन · स्थानीय संग्रहण सक्रिय' : 'Offline · Local Persistence Active')}
                </span>
              </div>
            </div>

            {/* 112 Call Card */}
            <div className="emergency-call-card">
              <div className="emergency-call-header">
                <AlertTriangle size={20} />
                <div className="emergency-call-title">
                  {lang === 'hi'
                    ? 'यदि आपके पास फोन सिग्नल है और तत्काल सहायता चाहिए, तो पहले 112 पर कॉल करें।'
                    : 'If you have a working phone signal and need urgent help, call 112 first.'}
                </div>
              </div>
              <a href="tel:112" style={{ textDecoration: 'none' }}>
                <button className="btn-call-112">
                  <PhoneCall size={18} />
                  <span>{lang === 'hi' ? '112 पर कॉल करें' : 'Call 112'}</span>
                </button>
              </a>
            </div>

            {/* Primary Action: Report Emergency */}
            <button
              className="primary-action-card"
              onClick={() => setCurrentScreen('report_categories')}
            >
              <div className="primary-card-icon-box">
                <BellRing size={24} />
              </div>
              <div>
                <div className="primary-card-title">
                  {lang === 'hi' ? 'आपातकाल रिपोर्ट करें' : 'Report Emergency'}
                </div>
                <div className="primary-card-desc">
                  {lang === 'hi' ? 'तत्काल चिकित्सा सहायता का अनुरोध करें' : 'Request immediate medical assistance'}
                </div>
              </div>
            </button>

            {/* Red / Green Quick Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => {
                  setNeedOfferMode('NEED');
                  setCurrentScreen('add_need_offer');
                }}
                style={{
                  height: 48,
                  background: '#b91c1c',
                  color: '#ffffff',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  boxShadow: '0 4px 10px rgba(185, 28, 28, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                ● I Need Help
              </button>

              <button
                onClick={() => {
                  setNeedOfferMode('OFFER');
                  setCurrentScreen('add_need_offer');
                }}
                style={{
                  height: 48,
                  background: '#15803d',
                  color: '#ffffff',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  boxShadow: '0 4px 10px rgba(21, 128, 61, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                ■ I Can Give Help
              </button>
            </div>

            {/* 4 Secondary Action Cards */}
            <div className="secondary-actions-stack">
              {/* My Reports */}
              <div
                className="secondary-action-card"
                onClick={() => setCurrentScreen('my_reports')}
              >
                <div className="secondary-card-icon-box">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'मेरी रिपोर्टें' : 'My Reports'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi' ? 'प्रस्तुत रिपोर्टों की स्थिति देखें' : 'View status of submitted reports'}
                  </div>
                </div>
              </div>

              {/* Emergency Map */}
              <div
                className="secondary-action-card"
                onClick={() => setCurrentScreen('emergency_map')}
              >
                <div className="secondary-card-icon-box">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'आपातकालीन मानचित्र' : 'Emergency Map'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi' ? 'क्षेत्रीय घटनाओं और परिचालन जानकारी देखें' : 'View regional incidents and operational information'}
                  </div>
                </div>
              </div>

              {/* Roads and Transport */}
              <div
                className="secondary-action-card"
                onClick={() => setCurrentScreen('roads_transport')}
              >
                <div className="secondary-card-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
                  <Navigation size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'सड़कें और परिवहन' : 'Roads and Transport'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi' ? 'बाढ़ मार्ग स्थिति और नाव/एंबुलेंस अनुरोध' : 'Flood route accessibility and transit options'}
                  </div>
                </div>
              </div>

              {/* Supply heatmap */}
              <div
                className="secondary-action-card"
                onClick={() => setCurrentScreen('supply_heatmap')}
              >
                <div className="secondary-card-icon-box" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                  <Flame size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'आपूर्ति हीटमैप' : 'Supply Heatmap'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi'
                      ? 'पीड़ितों और बचावकर्मियों का क्षेत्रीय घनत्व देखें'
                      : 'See where victims and rescuers cluster so supplies can be sent there'}
                  </div>
                </div>
              </div>

              {/* Healthcare Facilities */}
              <div
                className="secondary-action-card"
                onClick={() => setCurrentScreen('facilities')}
              >
                <div className="secondary-card-icon-box">
                  <Building2 size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'स्वास्थ्य सुविधाएं' : 'Healthcare Facilities'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi' ? 'जिला अस्पतालों, सामुदायिक स्वास्थ्य केंद्रों की निर्देशिका' : 'Directory of district hospitals, CHCs, and other facilities'}
                  </div>
                </div>
              </div>

              {/* Help & Information */}
              <div
                className="secondary-action-card"
                onClick={() => setCurrentScreen('help_info')}
              >
                <div className="secondary-card-icon-box">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <div className="secondary-card-title">
                    {lang === 'hi' ? 'सहायता और जानकारी' : 'Help & Information'}
                  </div>
                  <div className="secondary-card-desc">
                    {lang === 'hi' ? 'प्राथमिक चिकित्सा मार्गदर्शन और आपातकालीन संपर्क' : 'First aid guidance and emergency contact information'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 2: REPORT CATEGORIES ================= */}
        {currentScreen === 'report_categories' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => setCurrentScreen('home')}
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={18} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>
                {lang === 'hi' ? 'आपको किस प्रकार की सहायता चाहिए?' : 'What kind of help do you need?'}
              </h2>
            </div>

            <div className="category-grid">
              {[
                { id: 'Pregnancy', label: lang === 'hi' ? 'गर्भावस्था' : 'Pregnancy', icon: '🤰' },
                { id: 'Diabetes', label: lang === 'hi' ? 'मधुमेह' : 'Diabetes', icon: '🩺' },
                { id: 'Bleeding', label: lang === 'hi' ? 'रक्तस्राव' : 'Bleeding', icon: '🩸' },
                { id: 'Fever', label: lang === 'hi' ? 'बुखार' : 'Fever', icon: '🌡️' },
                { id: 'Injury', label: lang === 'hi' ? 'चोट' : 'Injury', icon: '🩹' },
                { id: 'Medicine needed', label: lang === 'hi' ? 'दवा की आवश्यकता' : 'Medicine needed', icon: '💊' },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`category-tile ${selectedCategory === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(item.id)}
                >
                  <span className="category-tile-icon">{item.icon}</span>
                  <span className="category-tile-label">{item.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (!selectedCategory) {
                  alert('Please choose an emergency category');
                  return;
                }
                setCurrentScreen('report_details');
              }}
              className="btn-primary-action"
              style={{ marginTop: 14 }}
            >
              Continue to Details
            </button>
          </div>
        )}

        {/* ================= SCREEN 3: REPORT DETAILS ================= */}
        {currentScreen === 'report_details' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => setCurrentScreen('report_categories')}
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={18} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Incident Details</h2>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Level</label>
              <div className="urgency-selector-row">
                {['High', 'Medium', 'Low'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`urgency-btn ${lvl.toLowerCase()} ${selectedUrgency === lvl ? 'selected' : ''}`}
                    onClick={() => setSelectedUrgency(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location / Ward</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ward 4, Near Helipad, Relief Tent 3"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medical Details / Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Patient condition, symptoms, access challenges..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 12,
              color: '#92400e',
              marginBottom: 16
            }}>
              <strong>Notice:</strong> Saving a report locally does not guarantee server delivery until connection is confirmed.
            </div>

            <button
              onClick={handleSubmitReport}
              disabled={isSubmitting}
              className="btn-primary-action"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Emergency Report'}
            </button>
          </div>
        )}

        {/* ================= SCREEN 4: SUBMISSION CONFIRMATION ================= */}
        {currentScreen === 'report_result' && submissionResultReport && (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: submissionSuccess ? '#dcfce7' : '#fee2e2',
              color: submissionSuccess ? '#15803d' : '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              {submissionSuccess ? <CheckCircle2 size={38} /> : <AlertTriangle size={38} />}
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {submissionSuccess ? 'Server Received' : 'Saved Locally (Not Sent)'}
            </h2>

            <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
              {submissionSuccess
                ? 'Your emergency report has been confirmed by the MED-LINK server. Authorized responders in your sector have been alerted.'
                : 'Could not connect to the server. Your report is preserved locally and will retry transmission when connectivity is restored.'}
            </p>

            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 14,
              padding: 16,
              margin: '20px 0',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Report ID</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{submissionResultReport.report_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Category</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{submissionResultReport.emergency_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Status</span>
                <span className={`badge-pill ${submissionSuccess ? 'received' : 'failed'}`}>
                  {submissionResultReport.sync_status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('my_reports')}
              className="btn-primary-action"
            >
              View My Reports
            </button>
          </div>
        )}

        {/* ================= SCREEN 5: MY REPORTS ================= */}
        {currentScreen === 'my_reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setCurrentScreen('home')}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 style={{ fontSize: 19, fontWeight: 800 }}>My Reports</h2>
              </div>

              <button
                onClick={checkHealthAndSync}
                style={{
                  background: '#f1f5f9',
                  padding: '6px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {localReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                <ClipboardList size={40} style={{ opacity: 0.4, margin: '0 auto 10px auto' }} />
                <p style={{ fontSize: 14, fontWeight: 600 }}>No reports submitted yet on this device.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {localReports.map((rep) => (
                  <div
                    key={rep.report_id}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 14,
                      padding: 14,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                          {rep.emergency_type}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {new Date(rep.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span className={`badge-pill ${rep.urgency.toLowerCase()}`}>
                        {rep.urgency}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: '#334155', margin: '8px 0' }}>
                      {rep.location_name || rep.description || 'No additional details provided'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 4 }}>
                      <span className={`badge-pill ${rep.verification_status.toLowerCase()}`}>
                        {rep.verification_status}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        {rep.sync_status === 'RECEIVED_BY_SERVER' ? '✓ Synced with Server' : '⏳ Pending Sync'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SCREEN 6: EMERGENCY MAP ================= */}
        {currentScreen === 'emergency_map' && (
          <EmergencyMapScreen
            reports={combinedReports}
            isOnline={isOnline}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectReportForDetails={(rep) => setSelectedReportForModal(rep)}
            onOfferHelp={(rep) => {
              setNeedOfferMode('OFFER');
              setCurrentScreen('add_need_offer');
            }}
          />
        )}

        {/* ================= SCREEN 7: ADD A NEED OR OFFER ================= */}
        {currentScreen === 'add_need_offer' && (
          <AddNeedOfferScreen
            initialMode={needOfferMode}
            onNavigateBack={() => setCurrentScreen('home')}
            onReportCreated={(newRep) => {
              setLocalReports(prev => [newRep, ...prev]);
              setSubmissionResultReport(newRep);
              setSubmissionSuccess(newRep.sync_status === 'RECEIVED_BY_SERVER');
              setCurrentScreen('report_result');
            }}
            onOpenLiveCamera={() => setCurrentScreen('live_camera')}
          />
        )}

        {/* ================= SCREEN 8: LIVE INCIDENT CAMERA ================= */}
        {currentScreen === 'live_camera' && (
          <LiveCameraScreen
            isOnline={isOnline}
            onClose={() => setCurrentScreen('add_need_offer')}
            onPhotoCaptured={(photo) => {
              alert(`Photo captured with estimated waterline (${photo.waterDepth}) at ${photo.coordinates}`);
              setCurrentScreen('add_need_offer');
            }}
            onSendTextOnly={() => setCurrentScreen('add_need_offer')}
          />
        )}

        {/* ================= SCREEN 9: ROADS AND TRANSPORT ================= */}
        {currentScreen === 'roads_transport' && (
          <RoadsTransportScreen
            onNavigateBack={() => setCurrentScreen('home')}
            onRequestBoat={() => {}}
          />
        )}

        {/* ================= SCREEN 10: HEALTHCARE FACILITIES ================= */}
        {currentScreen === 'facilities' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => setCurrentScreen('home')}
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={18} />
              </button>
              <h2 style={{ fontSize: 19, fontWeight: 800 }}>Healthcare Facilities</h2>
            </div>
            <FacilitiesList facilities={facilities} />
          </div>
        )}

        {/* ================= SCREEN 11: HELP & INFORMATION ================= */}
        {currentScreen === 'help_info' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => setCurrentScreen('home')}
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={18} />
              </button>
              <h2 style={{ fontSize: 19, fontWeight: 800 }}>Help & Information</h2>
            </div>

            {/* Helplines Card */}
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Emergency Helplines</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'National Unified Emergency', number: '112' },
                  { label: 'Disaster Ambulance Service', number: '108' },
                  { label: 'Maternal & Child Health', number: '102' },
                  { label: 'State Disaster Management (SDMA)', number: '1070' },
                ].map((hl) => (
                  <div key={hl.number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 13, color: '#334155' }}>{hl.label}</span>
                    <a href={`tel:${hl.number}`} style={{ textDecoration: 'none' }}>
                      <span style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: 13, padding: '4px 10px', borderRadius: 8 }}>
                        {hl.number}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Flood First-Aid Protocols */}
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>First Aid Guidance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                <div>
                  <strong style={{ color: '#0f172a' }}>• Severe Bleeding:</strong> Apply firm, direct pressure using a clean cloth. Elevate the wounded limb above heart level. Do not remove saturated cloths; layer fresh ones on top.
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>• Hypothermia:</strong> Remove wet clothing immediately. Wrap patient in dry blankets or foil space blankets. Provide warm sweet drinks if conscious.
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>• Fractures:</strong> Immobilize the limb using a rigid splint or rolled cardboard. Do not attempt to straighten broken bones.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar (on Map, Needs/Offers, Roads, and Home) */}
      <nav className="bottom-nav-bar">
        <button
          className={`bottom-nav-item ${currentScreen === 'emergency_map' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('emergency_map')}
        >
          <MapIcon size={20} />
          <span>Map</span>
        </button>

        <button
          className={`bottom-nav-item ${currentScreen === 'add_need_offer' && needOfferMode === 'NEED' ? 'active' : ''}`}
          onClick={() => {
            setNeedOfferMode('NEED');
            setCurrentScreen('add_need_offer');
          }}
        >
          <span style={{ color: '#dc2626', fontSize: 18, lineHeight: '20px' }}>●</span>
          <span>Needs</span>
        </button>

        {/* Center Circular Camera Button */}
        <button
          className="center-camera-btn"
          onClick={() => setCurrentScreen('live_camera')}
          title="Open Live Camera"
        >
          <Camera size={24} />
        </button>

        <button
          className={`bottom-nav-item ${currentScreen === 'add_need_offer' && needOfferMode === 'OFFER' ? 'active' : ''}`}
          onClick={() => {
            setNeedOfferMode('OFFER');
            setCurrentScreen('add_need_offer');
          }}
        >
          <span style={{ color: '#16a34a', fontSize: 16, lineHeight: '20px' }}>■</span>
          <span>Offers</span>
        </button>

        <button
          className={`bottom-nav-item ${currentScreen === 'my_reports' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('my_reports')}
        >
          <ClipboardList size={20} />
          <span>Me</span>
        </button>
      </nav>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={(loggedInUser: UserProfile) => {
            setUser(loggedInUser);
            setShowLoginModal(false);
            checkHealthAndSync();
          }}
        />
      )}

      {selectedReportForModal && (
        <ReportDetailModal
          report={selectedReportForModal}
          user={user}
          onClose={() => setSelectedReportForModal(null)}
          onUpdated={() => {
            setSelectedReportForModal(null);
            checkHealthAndSync();
          }}
          onPromptLogin={() => setShowLoginModal(true)}
        />
      )}
    </div>
  );
};
