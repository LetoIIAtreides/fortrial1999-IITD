import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Mic,
  MicOff,
  Trash2,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Loader2,
  MapPin,
  Users,
  Clock,
  Play,
  Square,
  RefreshCw,
  Home,
  Check,
} from 'lucide-react';
import { tokens } from '../tokens';
import { EmergencyCategoryTile } from './common/EmergencyCategoryTile';
import { UrgencyChips } from './common/UrgencyChips';
import { EmergencyReport } from '../types';
import { validateReportForm, ValidationErrors } from '../utils/validation';
import { storage } from '../utils/storage';
import { api } from '../api/client';
import { Language, translations } from '../i18n/translations';

interface ReportFlowProps {
  initialCategory?: string;
  onNavigateHome?: () => void;
  onBack?: () => void;
  onNavigateToReport?: (reportId: string) => void;
  onViewReport?: (reportId: string) => void;
  onComplete?: (report: EmergencyReport) => void;
  lang: Language;
}

export const ReportFlow: React.FC<ReportFlowProps> = ({
  initialCategory = '',
  onNavigateHome,
  onBack,
  onNavigateToReport,
  onViewReport,
  onComplete,
  lang,
}) => {
  const handleBack = onBack || onNavigateHome || (() => {});
  const handleViewReport = onViewReport || onNavigateToReport || (() => {});
  const t = translations[lang];

  // Screen Sub-step: 'choose_category' | 'details_confirm' | 'result'
  const [step, setStep] = useState<'choose_category' | 'details_confirm' | 'result'>(
    initialCategory ? 'details_confirm' : 'choose_category'
  );

  // Form State
  const [category, setCategory] = useState<string>(initialCategory);
  const [urgency, setUrgency] = useState<string>('High');
  const [peopleAffected, setPeopleAffected] = useState<number>(1);
  const [locationName, setLocationName] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');

  // Live Photo (HTML5 Canvas / Camera Capture)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Voice Note (HTML5 MediaRecorder)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceSeconds, setVoiceSeconds] = useState<number>(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submissionResult, setSubmissionResult] = useState<{
    report: EmergencyReport;
    isServerConfirmed: boolean;
  } | null>(null);

  const categories = [
    { id: 'Pregnancy', label: t.categoryPregnancy },
    { id: 'Diabetes', label: t.categoryDiabetes },
    { id: 'Bleeding', label: t.categoryBleeding },
    { id: 'Fever', label: t.categoryFever },
    { id: 'Injury', label: t.categoryInjury },
    { id: 'Medicine needed', label: t.categoryMedicine },
    { id: 'Something else', label: t.categoryOther },
  ];

  // Speech read-aloud via Web Speech API
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // GPS Location handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setLocationName(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (±${Math.round(pos.coords.accuracy)}m)`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Location permission was denied. Please enter your landmark or ward manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Camera handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setIsCameraActive(false);
      alert('Unable to access device camera.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoDataUrl(dataUrl);
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setVoiceSeconds(0);

      timerRef.current = setInterval(() => {
        setVoiceSeconds((prev) => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert('Microphone access was denied or is not supported.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Submit report following Section 6 rules
  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double taps

    // Form validation
    const validation = validateReportForm({
      category,
      urgency,
      peopleAffected,
      locationName,
      latitude,
      longitude,
      description,
      contactNumber,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const reportUuid = `rep-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const nowIso = new Date().toISOString();

    const localReport: EmergencyReport = {
      report_id: reportUuid,
      report_type: 'NEED',
      emergency_type: category,
      urgency: urgency as any,
      created_at: nowIso,
      latitude,
      longitude,
      location_name: locationName.trim() || null,
      ward: 'Ward 4',
      people_affected: peopleAffected,
      description: description.trim() || null,
      evidence_type: photoDataUrl ? 'photo' : (audioBlobUrl ? 'voice' : 'none'),
      evidence_url: photoDataUrl || audioBlobUrl || undefined,
      sync_status: 'LOCAL_PENDING',
      verification_status: 'UNVERIFIED',
      trust_score: photoDataUrl ? 85 : 75,
    };

    // 1. Save locally first (SAVED_LOCAL)
    storage.saveReportLocally(localReport);

    // 2. Upload to backend
    try {
      const serverResponse = await api.createReport({
        report_id: reportUuid,
        report_type: 'NEED',
        emergency_type: category,
        urgency,
        latitude,
        longitude,
        location_name: locationName.trim() || null,
        people_affected: peopleAffected,
        description: description.trim() || null,
        evidence_type: photoDataUrl ? 'photo' : 'none',
        created_at: nowIso,
      });

      // 3. Mark received by server on success
      storage.markReportServerReceived(reportUuid, {
        sync_status: 'RECEIVED_BY_SERVER',
        verification_status: serverResponse.verification_status,
      });

      const confirmedReport: EmergencyReport = { ...localReport, sync_status: 'RECEIVED_BY_SERVER' };
      setSubmissionResult({
        report: confirmedReport,
        isServerConfirmed: true,
      });
      onComplete?.(confirmedReport);
      setStep('result');
    } catch {
      // 4. Failed upload -> keep SAVED_LOCAL, show honest result
      setSubmissionResult({
        report: localReport,
        isServerConfirmed: false,
      });
      onComplete?.(localReport);
      setStep('result');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= STEP A: CHOOSE CATEGORY =================
  if (step === 'choose_category') {
    return (
      <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>
        {/* Back and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={handleBack}
            aria-label="Back"
            style={{
              width: 40,
              height: 40,
              borderRadius: tokens.radius.chip,
              border: `1px solid ${tokens.colors.border}`,
              backgroundColor: tokens.colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} color={tokens.colors.navyText} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: tokens.colors.navyText, margin: 0 }}>
            {t.categoryPrompt}
          </h1>
        </div>

        {/* Categories Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {categories.map((cat) => (
            <EmergencyCategoryTile
              key={cat.id}
              id={cat.id}
              label={cat.label}
              isSelected={category === cat.id}
              onSelect={() => setCategory(cat.id)}
              onSpeak={handleSpeak}
            />
          ))}
        </div>

        {/* Continue Button */}
        <button
          disabled={!category}
          onClick={() => setStep('details_confirm')}
          style={{
            width: '100%',
            minHeight: 48,
            borderRadius: tokens.radius.button,
            backgroundColor: category ? tokens.colors.primaryBlue : tokens.colors.border,
            color: tokens.colors.white,
            border: 'none',
            fontSize: 16,
            fontWeight: 700,
            cursor: category ? 'pointer' : 'not-allowed',
            boxShadow: category ? tokens.shadow.active : 'none',
          }}
        >
          {t.continueBtn}
        </button>
      </div>
    );
  }

  // ================= STEP B: DETAILS AND CONFIRM =================
  if (step === 'details_confirm') {
    return (
      <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 90 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => setStep('choose_category')}
            aria-label="Change category"
            style={{
              width: 40,
              height: 40,
              borderRadius: tokens.radius.chip,
              border: `1px solid ${tokens.colors.border}`,
              backgroundColor: tokens.colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} color={tokens.colors.navyText} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: tokens.colors.mutedText, fontWeight: 500 }}>
              {t.reportEmergency}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: tokens.colors.navyText }}>
              {category} · <span onClick={() => setStep('choose_category')} style={{ color: tokens.colors.primaryBlue, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>{t.changeCategory}</span>
            </div>
          </div>
        </div>

        {/* 1. Urgency Level */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 8 }}>
            {t.urgencyLabel} *
          </label>
          <UrgencyChips selectedUrgency={urgency} onSelect={setUrgency} />
          {errors.urgency && (
            <div style={{ color: tokens.colors.emergencyRed, fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={14} /> {errors.urgency}
            </div>
          )}
        </div>

        {/* 2. People Affected Stepper */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 8 }}>
            {t.peopleAffectedLabel}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="button"
              onClick={() => setPeopleAffected(Math.max(1, peopleAffected - 1))}
              style={{
                width: 44,
                height: 44,
                borderRadius: tokens.radius.chip,
                border: `1.5px solid ${tokens.colors.border}`,
                backgroundColor: tokens.colors.cardGrey,
                fontSize: 20,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              -
            </button>
            <span style={{ fontSize: 18, fontWeight: 800, color: tokens.colors.navyText, minWidth: 32, textAlign: 'center' }}>
              {peopleAffected}
            </span>
            <button
              type="button"
              onClick={() => setPeopleAffected(Math.min(50, peopleAffected + 1))}
              style={{
                width: 44,
                height: 44,
                borderRadius: tokens.radius.chip,
                border: `1.5px solid ${tokens.colors.border}`,
                backgroundColor: tokens.colors.cardGrey,
                fontSize: 20,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* 3. Location */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 8 }}>
            {t.locationLabel} *
          </label>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            style={{
              width: '100%',
              minHeight: 44,
              borderRadius: tokens.radius.chip,
              backgroundColor: tokens.colors.paleBlue,
              color: tokens.colors.primaryBlue,
              border: `1px solid ${tokens.colors.primaryBlue}`,
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
            <span>{isLocating ? 'Acquiring GPS...' : t.useMyLocation}</span>
          </button>

          <input
            type="text"
            placeholder={t.manualLocationPlaceholder}
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            style={{
              width: '100%',
              minHeight: 46,
              borderRadius: tokens.radius.chip,
              border: errors.location ? `2px solid ${tokens.colors.emergencyRed}` : `1px solid ${tokens.colors.border}`,
              padding: '0 12px',
              fontSize: 14,
              backgroundColor: tokens.colors.white,
              color: tokens.colors.navyText,
              boxSizing: 'border-box',
            }}
          />
          {gpsAccuracy !== null && (
            <div style={{ fontSize: 12, color: tokens.colors.successGreen, fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} /> {t.gpsAccuracy}: ±{gpsAccuracy}m
            </div>
          )}
          {errors.location && (
            <div style={{ color: tokens.colors.emergencyRed, fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={14} /> {errors.location}
            </div>
          )}
        </div>

        {/* 4. Short description */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: tokens.colors.navyText }}>
              {t.descriptionLabel}
            </label>
            <span style={{ fontSize: 12, color: description.length > 300 ? tokens.colors.emergencyRed : tokens.colors.mutedText }}>
              {description.length}/300
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={350}
            placeholder={t.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              borderRadius: tokens.radius.chip,
              border: errors.description ? `2px solid ${tokens.colors.emergencyRed}` : `1px solid ${tokens.colors.border}`,
              padding: '10px 12px',
              fontSize: 14,
              backgroundColor: tokens.colors.white,
              color: tokens.colors.navyText,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
          {errors.description && (
            <div style={{ color: tokens.colors.emergencyRed, fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={14} /> {errors.description}
            </div>
          )}
        </div>

        {/* 5. Contact number */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 6 }}>
            {t.contactLabel}
          </label>
          <input
            type="tel"
            maxLength={14}
            placeholder={t.contactPlaceholder}
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            style={{
              width: '100%',
              minHeight: 46,
              borderRadius: tokens.radius.chip,
              border: errors.contactNumber ? `2px solid ${tokens.colors.emergencyRed}` : `1px solid ${tokens.colors.border}`,
              padding: '0 12px',
              fontSize: 14,
              backgroundColor: tokens.colors.white,
              color: tokens.colors.navyText,
              boxSizing: 'border-box',
            }}
          />
          {errors.contactNumber && (
            <div style={{ color: tokens.colors.emergencyRed, fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={14} /> {errors.contactNumber}
            </div>
          )}
        </div>

        {/* 6. Live Photo Capture (P1) */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 6 }}>
            {t.livePhotoLabel}
          </label>

          {!photoDataUrl && !isCameraActive && (
            <button
              type="button"
              onClick={startCamera}
              style={{
                width: '100%',
                minHeight: 46,
                borderRadius: tokens.radius.chip,
                backgroundColor: tokens.colors.cardGrey,
                border: `1px dashed ${tokens.colors.border}`,
                color: tokens.colors.navyText,
                fontWeight: 600,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Camera size={18} />
              <span>{t.takePhoto}</span>
            </button>
          )}

          {isCameraActive && (
            <div style={{ backgroundColor: '#000', borderRadius: tokens.radius.chip, padding: 8, textAlign: 'center' }}>
              <video ref={videoRef} playsInline style={{ width: '100%', maxHeight: 220, borderRadius: 8 }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={capturePhoto}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    borderRadius: tokens.radius.chip,
                    backgroundColor: tokens.colors.primaryBlue,
                    color: tokens.colors.white,
                    border: 'none',
                    fontWeight: 700,
                  }}
                >
                  Capture
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  style={{
                    minHeight: 44,
                    padding: '0 16px',
                    borderRadius: tokens.radius.chip,
                    backgroundColor: '#374151',
                    color: tokens.colors.white,
                    border: 'none',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {photoDataUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, backgroundColor: tokens.colors.cardGrey, borderRadius: tokens.radius.chip }}>
              <img src={photoDataUrl} alt="Incident preview" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
              <div style={{ flex: 1, fontSize: 13, color: tokens.colors.navyText, fontWeight: 600 }}>
                Live photo captured with geotag
              </div>
              <button
                type="button"
                onClick={() => setPhotoDataUrl(null)}
                style={{ background: 'none', border: 'none', color: tokens.colors.emergencyRed, cursor: 'pointer', padding: 6 }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>

        {/* 7. Voice Note Recording (P1) */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 6 }}>
            {t.voiceNoteLabel}
          </label>

          {!audioBlobUrl && !isRecording && (
            <button
              type="button"
              onClick={startRecording}
              style={{
                width: '100%',
                minHeight: 46,
                borderRadius: tokens.radius.chip,
                backgroundColor: tokens.colors.cardGrey,
                border: `1px dashed ${tokens.colors.border}`,
                color: tokens.colors.navyText,
                fontWeight: 600,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Mic size={18} />
              <span>{t.recordVoice}</span>
            </button>
          )}

          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#FEF2F2', borderRadius: tokens.radius.chip, border: '1px solid #FCA5A5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tokens.colors.emergencyRed, fontWeight: 700, fontSize: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: tokens.colors.emergencyRed, display: 'inline-block' }} />
                Recording ({voiceSeconds}s / 30s)
              </div>
              <button
                type="button"
                onClick={stopRecording}
                style={{
                  padding: '6px 14px',
                  borderRadius: tokens.radius.chip,
                  backgroundColor: tokens.colors.emergencyRed,
                  color: tokens.colors.white,
                  border: 'none',
                  fontWeight: 700,
                }}
              >
                Stop
              </button>
            </div>
          )}

          {audioBlobUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, backgroundColor: tokens.colors.cardGrey, borderRadius: tokens.radius.chip }}>
              <audio controls src={audioBlobUrl} style={{ flex: 1, height: 36 }} />
              <button
                type="button"
                onClick={() => setAudioBlobUrl(null)}
                style={{ background: 'none', border: 'none', color: tokens.colors.emergencyRed, cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Life danger notice */}
        <div style={{ textAlign: 'center', fontSize: 13, color: tokens.colors.emergencyRed, fontWeight: 600, marginBottom: 12 }}>
          {t.lifeDangerCall112}
        </div>

        {/* Confirm and Submit button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
          style={{
            width: '100%',
            minHeight: 50,
            borderRadius: tokens.radius.button,
            backgroundColor: tokens.colors.primaryBlue,
            color: tokens.colors.white,
            border: 'none',
            fontSize: 16,
            fontWeight: 800,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: tokens.shadow.active,
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Submitting report...</span>
            </>
          ) : (
            <span>{t.confirmAndSubmit}</span>
          )}
        </button>
      </div>
    );
  }

  // ================= STEP C: RESULT =================
  if (step === 'result' && submissionResult) {
    const { report, isServerConfirmed } = submissionResult;

    return (
      <div style={{ padding: '24px 16px', maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        {isServerConfirmed ? (
          /* Server confirmed success */
          <div
            style={{
              backgroundColor: tokens.colors.successBg,
              border: `1.5px solid ${tokens.colors.successGreen}`,
              borderRadius: tokens.radius.card,
              padding: '24px 16px',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: tokens.radius.full,
                backgroundColor: tokens.colors.successGreen,
                color: tokens.colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Check size={32} strokeWidth={3} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: tokens.colors.navyText, margin: '0 0 8px 0' }}>
              {t.serverConfirmed}
            </h2>
            <div style={{ fontSize: 13, color: tokens.colors.mutedText, marginBottom: 14 }}>
              {t.serverConfirmedDesc}
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.colors.navyText, backgroundColor: tokens.colors.white, padding: '8px 12px', borderRadius: tokens.radius.chip, display: 'inline-block' }}>
              {t.reportId}: <code>{report.report_id}</code>
            </div>
          </div>
        ) : (
          /* Saved locally only (offline) */
          <div
            style={{
              backgroundColor: tokens.colors.warningBg,
              border: `1.5px solid ${tokens.colors.warningAmber}`,
              borderRadius: tokens.radius.card,
              padding: '24px 16px',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: tokens.radius.full,
                backgroundColor: tokens.colors.warningAmber,
                color: tokens.colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <AlertCircle size={32} strokeWidth={2.5} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: tokens.colors.warningAmber, margin: '0 0 8px 0' }}>
              {t.savedLocallyTitle}
            </h2>
            <div style={{ fontSize: 14, color: '#78350F', lineHeight: '20px', marginBottom: 16 }}>
              {t.savedLocallyDesc}
            </div>

            <a href="tel:112" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  width: '100%',
                  minHeight: 46,
                  borderRadius: tokens.radius.chip,
                  backgroundColor: tokens.colors.emergencyRed,
                  color: tokens.colors.white,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <PhoneCall size={18} />
                <span>Call 112 directly</span>
              </button>
            </a>
          </div>
        )}

        {/* Result Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => handleViewReport(report.report_id)}
            style={{
              width: '100%',
              minHeight: 48,
              borderRadius: tokens.radius.button,
              backgroundColor: tokens.colors.primaryBlue,
              color: tokens.colors.white,
              border: 'none',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {t.viewReport}
          </button>

          <button
            onClick={handleBack}
            style={{
              width: '100%',
              minHeight: 46,
              borderRadius: tokens.radius.button,
              backgroundColor: tokens.colors.cardGrey,
              color: tokens.colors.navyText,
              border: `1px solid ${tokens.colors.border}`,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  return null;
};
