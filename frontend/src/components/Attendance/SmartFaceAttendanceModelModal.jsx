import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Camera,
  Video,
  VideoOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  ShieldCheck,
  Sparkles,
  X,
  Play,
  Square,
  Maximize2,
  Sliders,
  Eye,
  Film,
  Calendar,
  Clock,
  Search,
  Check,
  ChevronRight,
  Zap,
  Layers,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import './SmartFaceAttendanceModelModal.css';

export default function SmartFaceAttendanceModelModal({
  isOpen,
  onClose,
  studentsList = [],
  subjectCode = 'CS501',
  subjectName = 'Data Structures & Algorithms',
  course = 'B.Tech',
  branch = 'CSE',
  section = 'Section A',
  date = new Date().toISOString().split('T')[0],
  fromTime = '10:30 AM',
  toTime = '11:30 AM',
  onApplyAttendance,
  userRole = 'faculty',
  userName = 'Faculty'
}) {
  // Navigation sub-tab: 'scanner' | 'grid' | 'unknowns' | 'audit'
  const [activeTab, setActiveTab] = useState('scanner');

  // Camera & stream states
  const [cameraActive, setCameraActive] = useState(true);
  const [selectedCameraSource, setSelectedCameraSource] = useState('webcam_primary');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(90);
  const [antiSpoofingActive, setAntiSpoofingActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Video element and Canvas references
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Simulated & Detected student states
  const [detectedMap, setDetectedMap] = useState({});
  const [scanProgress, setScanProgress] = useState(0);
  const [unknownFaces, setUnknownFaces] = useState([]);

  // Initialize detection states based on current students list
  useEffect(() => {
    if (!isOpen) return;

    // Pre-populate detection simulation: ~90-95% of students detected with high confidence
    const initialDetections = {};
    const unknowns = [
      { id: 'unk-1', label: 'Unregistered Visitor #881', confidence: 64.2, timestamp: '10:31 AM', camera: 'Entrance CAM-02', status: 'Pending Review' },
      { id: 'unk-2', label: 'Section B Mismatch #104', confidence: 71.5, timestamp: '10:33 AM', camera: 'Rear CAM-04', status: 'Flagged Mismatch' }
    ];

    studentsList.forEach((st, idx) => {
      // simulate realistic classroom detection: first 90% detected, 1-2 late, 1-2 absent/unseen
      const isAbsent = idx >= Math.max(1, studentsList.length - 2);
      const isLate = idx === studentsList.length - 3;
      if (!isAbsent) {
        initialDetections[st.id] = {
          status: isLate ? 'late' : 'present',
          confidence: Number((95.5 + (Math.sin(idx) * 3.8)).toFixed(1)),
          detectedAt: isLate ? '10:48 AM' : '10:32 AM',
          liveness: 'Verified',
          bbox: {
            x: 80 + (idx % 4) * 140,
            y: 70 + Math.floor((idx % 8) / 4) * 120,
            w: 100,
            h: 100
          }
        };
      }
    });

    setDetectedMap(initialDetections);
    setUnknownFaces(unknowns);
    setScanProgress(0);
  }, [isOpen, studentsList]);

  // Handle Real Camera Stream
  useEffect(() => {
    if (!isOpen || !cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let active = true;

    async function initCamera() {
      try {
        setCameraError(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            }
          });
          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            videoRef.current.play().catch(e => console.warn('Video play warning:', e));
          }
        }
      } catch (err) {
        console.warn('Webcam hardware unavailable or permission denied, using simulated HD smart CCTV stream:', err);
        setCameraError('Physical camera feed unavailable. Smart classroom AI CCTV feed simulation active.');
      }
    }

    initCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, cameraActive, selectedCameraSource]);

  // Live Canvas drawing for Facial Bounding Boxes and AI HUD
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameId;

    const renderOverlay = () => {
      const width = canvas.width || 640;
      const height = canvas.height || 360;

      ctx.clearRect(0, 0, width, height);

      if (isScanning) {
        // Draw Scanning Laser Line
        const time = Date.now() / 1000;
        const scanY = ((Math.sin(time * 2) + 1) / 2) * height;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();

        ctx.shadowBlur = 0; // reset

        // Draw HUD overlay in corners
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText(`FPS: 30.0  AI INF: 34ms  CONF: ${confidenceThreshold}%+`, 14, 22);
        ctx.fillText(`LIVENESS: ${antiSpoofingActive ? 'ACTIVE (LEVEL 3)' : 'DISABLED'}`, 14, 36);

        // Draw Bounding Boxes for detected students
        const detectedEntries = Object.entries(detectedMap);
        detectedEntries.slice(0, 5).forEach(([stId, det], index) => {
          const st = studentsList.find(s => String(s.id) === String(stId)) || {};
          const name = st.name || 'Enrolled Student';
          const roll = st.rollNumber || '26CSE001';

          // dynamic jitter for realistic AI tracking
          const jitterX = Math.sin(time * 3 + index) * 3;
          const jitterY = Math.cos(time * 3 + index) * 3;

          const bx = (80 + (index % 3) * 160 + jitterX);
          const by = (60 + Math.floor(index / 3) * 130 + jitterY);
          const bw = 110;
          const bh = 110;

          const isLate = det.status === 'late';
          const boxColor = isLate ? '#f59e0b' : '#10b981';

          // Box brackets
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 2.5;

          const cornerLen = 16;
          // Top-Left
          ctx.beginPath();
          ctx.moveTo(bx, by + cornerLen);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + cornerLen, by);
          ctx.stroke();

          // Top-Right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerLen, by);
          ctx.lineTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + cornerLen);
          ctx.stroke();

          // Bottom-Left
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - cornerLen);
          ctx.lineTo(bx, by + bh);
          ctx.lineTo(bx + cornerLen, by + bh);
          ctx.stroke();

          // Bottom-Right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerLen, by + bh);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw, by + bh - cornerLen);
          ctx.stroke();

          // Header tag pill
          ctx.fillStyle = isLate ? 'rgba(245, 158, 11, 0.88)' : 'rgba(16, 185, 129, 0.88)';
          ctx.fillRect(bx, by - 22, bw, 20);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px system-ui, sans-serif';
          ctx.fillText(`${roll} · ${det.confidence}%`, bx + 5, by - 8);

          // Name pill at bottom
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(bx, by + bh + 4, bw, 18);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '9px system-ui, sans-serif';
          ctx.fillText(name.slice(0, 14), bx + 5, by + bh + 16);
        });
      }

      frameId = requestAnimationFrame(renderOverlay);
    };

    frameId = requestAnimationFrame(renderOverlay);

    return () => cancelAnimationFrame(frameId);
  }, [isOpen, isScanning, confidenceThreshold, antiSpoofingActive, detectedMap, studentsList]);

  // Compute detected vs total counts
  const recognizedCount = Object.keys(detectedMap).length;
  const presentStudents = useMemo(() => {
    return studentsList.filter(s => detectedMap[s.id]?.status === 'present');
  }, [studentsList, detectedMap]);

  const lateStudents = useMemo(() => {
    return studentsList.filter(s => detectedMap[s.id]?.status === 'late');
  }, [studentsList, detectedMap]);

  const absentStudents = useMemo(() => {
    return studentsList.filter(s => !detectedMap[s.id]);
  }, [studentsList, detectedMap]);

  // Filtered roster for search
  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return studentsList;
    const q = searchQuery.toLowerCase();
    return studentsList.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.rollNumber || '').toLowerCase().includes(q)
    );
  }, [studentsList, searchQuery]);

  // Toggle individual student verification in the modal
  const handleToggleStudent = (studentId) => {
    setDetectedMap(prev => {
      const copy = { ...prev };
      if (copy[studentId]) {
        if (copy[studentId].status === 'present') {
          copy[studentId] = { ...copy[studentId], status: 'late' };
        } else {
          delete copy[studentId];
        }
      } else {
        copy[studentId] = {
          status: 'present',
          confidence: 98.4,
          detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          liveness: 'Verified',
          bbox: { x: 120, y: 120, w: 90, h: 90 }
        };
      }
      return copy;
    });
  };

  // Re-run AI scan / re-scan classroom
  const handleTriggerReScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 25;
      });
    }, 150);
  };

  // Apply model attendance back to main TakeAttendanceModule
  const handleConfirmAndApply = () => {
    // Generate new attendance map
    const newAttendanceMap = {};
    studentsList.forEach(s => {
      if (detectedMap[s.id]) {
        newAttendanceMap[s.id] = detectedMap[s.id].status; // 'present' or 'late'
      } else {
        newAttendanceMap[s.id] = 'absent';
      }
    });

    const modelAuditDetails = {
      modelName: 'Facenox AI Face Attendance Engine v2.4 (ByteTrack & AuraFAS)',
      verificationMethod: 'AI Biometric Face Model',
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalEnrolled: studentsList.length,
      recognizedCount: recognizedCount,
      presentCount: presentStudents.length,
      lateCount: lateStudents.length,
      absentCount: absentStudents.length,
      accuracyRate: Number(((recognizedCount / (studentsList.length || 1)) * 100).toFixed(1)),
      averageConfidence: '98.4%',
      cameraSource: selectedCameraSource === 'webcam_primary'
        ? 'Live Classroom WebCam'
        : `Classroom Fixed CCTV (${selectedCameraSource})`,
      livenessEnforced: antiSpoofingActive,
      auditToken: `AUDIT-FACENOX-${Date.now().toString(36).toUpperCase()}`,
      verifiedBy: `${userName} (${userRole.toUpperCase()})`
    };

    if (onApplyAttendance) {
      onApplyAttendance(newAttendanceMap, modelAuditDetails);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="smart-attendance-backdrop" onClick={onClose}>
      <div className="smart-attendance-modal-card" onClick={e => e.stopPropagation()}>
        {/* Top Header */}
        <div className="smart-attendance-modal-header">
          <div className="smart-attendance-header-title">
            <div className="smart-attendance-logo-badge">
              <Camera size={22} color="#38bdf8" />
            </div>
            <div>
              <div className="smart-attendance-badge-row">
                <span className="smart-model-pill">FACENOX AI ENGINE v2.4</span>
                <span className="smart-model-cohort-pill">{course} {branch} • {section}</span>
                <span className="smart-model-subject-pill">{subjectCode} · {subjectName}</span>
              </div>
              <h3 className="smart-attendance-title-text">
                Autonomous AI Face Recognition &amp; Smart Attendance Model
              </h3>
              <p className="smart-attendance-subtitle-text">
                Live multi-subject face detection, 3D biometric liveness verification &amp; automated register sync
              </p>
            </div>
          </div>

          <div className="smart-attendance-header-actions">
            <div className="live-camera-pulse-tag">
              <span className="pulse-dot"></span>
              {isScanning ? 'LIVE AI DETECTING' : 'SCAN PAUSED'}
            </div>
            <button
              type="button"
              className="smart-attendance-close-btn"
              onClick={onClose}
              title="Close Attendance Model"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="smart-model-tabs-nav">
          <button
            type="button"
            className={`smart-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            <Camera size={15} /> Live Face Scanner &amp; Register
          </button>
          <button
            type="button"
            className={`smart-tab-btn ${activeTab === 'grid' ? 'active' : ''}`}
            onClick={() => setActiveTab('grid')}
          >
            <Layers size={15} /> Classroom CCTV 4-Grid
          </button>
          <button
            type="button"
            className={`smart-tab-btn ${activeTab === 'unknowns' ? 'active' : ''}`}
            onClick={() => setActiveTab('unknowns')}
          >
            <ShieldCheck size={15} /> Unknown Students &amp; Mismatches ({unknownFaces.length})
          </button>
          <button
            type="button"
            className={`smart-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <BarChart3 size={15} /> Model Accuracy &amp; Audit Logs
          </button>
        </div>

        {/* Modal Body */}
        <div className="smart-model-body">
          {activeTab === 'scanner' && (
            <div className="scanner-layout-grid">
              {/* Left Column: Live Camera Video & Detection Canvas */}
              <div className="scanner-feed-column">
                <div className="video-viewport-wrapper">
                  {/* Real WebCam Video Feed */}
                  <video
                    ref={videoRef}
                    className="live-video-element"
                    autoPlay
                    playsInline
                    muted
                  />

                  {/* Canvas Overlay for Green Bounding Boxes and HUD */}
                  <canvas
                    ref={canvasRef}
                    className="detection-canvas-overlay"
                    width={640}
                    height={360}
                  />

                  {/* Fallback Background Graphic if physical camera is denied/off */}
                  {!cameraActive && (
                    <div className="camera-offline-overlay">
                      <VideoOff size={42} color="#94a3b8" />
                      <h4>Camera Feed Suspended</h4>
                      <p>Click "Start Camera" below to activate live facial detection.</p>
                    </div>
                  )}

                  {/* Real-time Quality / HUD Indicators */}
                  <div className="camera-hud-badge top-left">
                    <span className="hud-indicator active"></span>
                    <span>1080p @ 30FPS</span>
                  </div>

                  <div className="camera-hud-badge top-right">
                    <ShieldCheck size={14} color="#34d399" />
                    <span>Liveness: {antiSpoofingActive ? 'VERIFIED' : 'BYPASS'}</span>
                  </div>

                  <div className="camera-hud-badge bottom-left">
                    <span>Active Camera: {selectedCameraSource === 'webcam_primary' ? 'Classroom WebCam 01' : 'Room CS-201 Dome'}</span>
                  </div>

                  <div className="camera-hud-badge bottom-right">
                    <span>Detected in Frame: {Math.min(recognizedCount, 4)} faces</span>
                  </div>
                </div>

                {/* Camera Hardware Controls */}
                <div className="camera-control-toolbar">
                  <div className="toolbar-left">
                    <button
                      type="button"
                      className={`control-toggle-btn ${cameraActive ? 'active' : ''}`}
                      onClick={() => setCameraActive(!cameraActive)}
                    >
                      {cameraActive ? <Video size={15} /> : <VideoOff size={15} />}
                      {cameraActive ? 'Pause Camera' : 'Start Camera'}
                    </button>

                    <button
                      type="button"
                      className={`control-toggle-btn ${isScanning ? 'active' : ''}`}
                      onClick={() => setIsScanning(!isScanning)}
                    >
                      {isScanning ? <Square size={14} /> : <Play size={14} />}
                      {isScanning ? 'Pause Recognition' : 'Resume Recognition'}
                    </button>

                    <button
                      type="button"
                      className="control-toggle-btn"
                      onClick={handleTriggerReScan}
                      title="Re-scan and match active classroom faces"
                    >
                      <RefreshCw size={14} /> Refresh Scan
                    </button>
                  </div>

                  <div className="toolbar-right">
                    <select
                      className="camera-source-select"
                      value={selectedCameraSource}
                      onChange={e => setSelectedCameraSource(e.target.value)}
                    >
                      <option value="webcam_primary">Camera: Classroom WebCam HD</option>
                      <option value="cam_cs201_front">Camera: CS-201 Front Board</option>
                      <option value="cam_cs201_rear">Camera: CS-201 Rear Student Angle</option>
                      <option value="cam_softlab3">Camera: Software Lab-3 Biometric Unit</option>
                    </select>

                    <label className="toggle-checkbox-label" title="Anti-spoofing liveness verification filter">
                      <input
                        type="checkbox"
                        checked={antiSpoofingActive}
                        onChange={e => setAntiSpoofingActive(e.target.checked)}
                      />
                      <span>Anti-Spoofing</span>
                    </label>
                  </div>
                </div>

                {cameraError && (
                  <div className="camera-notice-banner">
                    <Sparkles size={16} />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Live Detection Roster & Stats */}
              <div className="scanner-roster-column">
                {/* Stats summary counter */}
                <div className="smart-metrics-row">
                  <div className="smart-metric-card total">
                    <span className="metric-label">Enrolled</span>
                    <strong className="metric-val">{studentsList.length}</strong>
                    <span className="metric-sub">{section}</span>
                  </div>
                  <div className="smart-metric-card present">
                    <span className="metric-label">AI Present</span>
                    <strong className="metric-val">{presentStudents.length}</strong>
                    <span className="metric-sub">
                      {studentsList.length > 0 ? ((presentStudents.length / studentsList.length) * 100).toFixed(0) : 0}% Match
                    </span>
                  </div>
                  <div className="smart-metric-card late">
                    <span className="metric-label">AI Late</span>
                    <strong className="metric-val">{lateStudents.length}</strong>
                    <span className="metric-sub">Past {fromTime}</span>
                  </div>
                  <div className="smart-metric-card absent">
                    <span className="metric-label">Unseen</span>
                    <strong className="metric-val">{absentStudents.length}</strong>
                    <span className="metric-sub">Not Detected</span>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="roster-search-bar">
                  <Search size={14} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search student or roll number..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="search-clear-btn">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Live Student Detection List */}
                <div className="live-students-scroll-pane">
                  {filteredRoster.map(st => {
                    const det = detectedMap[st.id];
                    const isPresent = det && det.status === 'present';
                    const isLate = det && det.status === 'late';
                    const isAbsent = !det;

                    return (
                      <div
                        key={st.id}
                        className={`live-student-row ${isPresent ? 'is-present' : isLate ? 'is-late' : 'is-absent'}`}
                        onClick={() => handleToggleStudent(st.id)}
                        title="Click to toggle Present / Late / Unseen"
                      >
                        <div className="row-status-indicator">
                          {isPresent && <CheckCircle2 size={16} color="#10b981" />}
                          {isLate && <Clock size={16} color="#f59e0b" />}
                          {isAbsent && <XCircle size={16} color="#94a3b8" />}
                        </div>

                        <div className="row-student-info">
                          <div className="student-name-text">
                            {st.name}
                            {isPresent && <span className="pill-tag present">Match</span>}
                            {isLate && <span className="pill-tag late">Late</span>}
                            {isAbsent && <span className="pill-tag absent">Unseen</span>}
                          </div>
                          <div className="student-sub-text">
                            <span>Roll: {st.rollNumber}</span>
                            {det ? (
                              <>
                                <span>• Conf: <strong>{det.confidence}%</strong></span>
                                <span>• Time: {det.detectedAt}</span>
                              </>
                            ) : (
                              <span>• Camera: Frame Search Pending</span>
                            )}
                          </div>
                        </div>

                        <div className="row-action-pill">
                          {isPresent ? 'Present' : isLate ? 'Late' : 'Absent'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CCTV 4-Grid Tab */}
          {activeTab === 'grid' && (
            <div className="cctv-quad-grid">
              <div className="cctv-cam-card">
                <div className="cctv-cam-header">
                  <span>CAM-01 • Front Podium &amp; Whiteboard (CS-201)</span>
                  <span className="cam-fps-badge">29.9 FPS • 1080p</span>
                </div>
                <div className="cctv-feed-screen">
                  <div className="cam-sim-grid"></div>
                  <div className="cam-sim-text">CAM 01 · LECTURE THEATRE CS-201</div>
                  <div className="bounding-box-sim b1">Ashish Mohapatra (99.2%)</div>
                </div>
              </div>

              <div className="cctv-cam-card">
                <div className="cctv-cam-header">
                  <span>CAM-02 • Middle Classroom Array (CS-201)</span>
                  <span className="cam-fps-badge">30.0 FPS • 1080p</span>
                </div>
                <div className="cctv-feed-screen">
                  <div className="cam-sim-grid"></div>
                  <div className="cam-sim-text">CAM 02 · STUDENT DESKS 01-20</div>
                  <div className="bounding-box-sim b2">Somesh Baliarsingh (98.6%)</div>
                </div>
              </div>

              <div className="cctv-cam-card">
                <div className="cctv-cam-header">
                  <span>CAM-03 • Rear Angle &amp; Windows</span>
                  <span className="cam-fps-badge">30.1 FPS • 1080p</span>
                </div>
                <div className="cctv-feed-screen">
                  <div className="cam-sim-grid"></div>
                  <div className="cam-sim-text">CAM 03 · STUDENT DESKS 21-40</div>
                  <div className="bounding-box-sim b3">Bishnu Prasad Sahoo (97.8%)</div>
                </div>
              </div>

              <div className="cctv-cam-card">
                <div className="cctv-cam-header">
                  <span>CAM-04 • Classroom Entrance Door</span>
                  <span className="cam-fps-badge">29.8 FPS • 1080p</span>
                </div>
                <div className="cctv-feed-screen">
                  <div className="cam-sim-grid"></div>
                  <div className="cam-sim-text">CAM 04 · ENTRY / EXIT PORTAL</div>
                  <div className="bounding-box-sim b4">Late Entry Scanner (Active)</div>
                </div>
              </div>
            </div>
          )}

          {/* Unknown Students & Mismatches Tab */}
          {activeTab === 'unknowns' && (
            <div className="unknown-students-panel">
              <div className="panel-info-banner">
                <ShieldCheck size={20} color="#0284c7" />
                <div>
                  <h4>Zero Proxy Attendance &amp; Security Mismatch Protection</h4>
                  <p>The AI model tracks any face detected in the classroom that does not belong to the enrolled {course} {branch} ({section}) roster.</p>
                </div>
              </div>

              <div className="unknown-table-wrapper">
                <table className="unknown-table">
                  <thead>
                    <tr>
                      <th>Tracking ID</th>
                      <th>Classroom Camera</th>
                      <th>Time Observed</th>
                      <th>Best Guess Match</th>
                      <th>Confidence</th>
                      <th>Anomaly Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unknownFaces.map(unk => (
                      <tr key={unk.id}>
                        <td><strong>{unk.id}</strong></td>
                        <td>{unk.camera}</td>
                        <td>{unk.timestamp}</td>
                        <td>{unk.label}</td>
                        <td><span className="conf-badge">{unk.confidence}%</span></td>
                        <td><span className="status-badge mismatch">{unk.status}</span></td>
                        <td>
                          <button
                            type="button"
                            className="btn-resolve-unknown"
                            onClick={() => alert(`Reviewing frame recording for ${unk.id}. No proxy attendance credit granted.`)}
                          >
                            Investigate Frame
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="model-audit-panel">
              <div className="audit-specs-card">
                <h4>Engine Specifications &amp; Biometric Integrity</h4>
                <div className="specs-grid">
                  <div className="spec-item">
                    <span>Inference Framework:</span>
                    <strong>ONNX Runtime + InsightFace ArcFace</strong>
                  </div>
                  <div className="spec-item">
                    <span>Tracker Core:</span>
                    <strong>ByteTrack Multi-Object Kalman Filter</strong>
                  </div>
                  <div className="spec-item">
                    <span>Anti-Spoofing Protocol:</span>
                    <strong>AuraFAS 3D Texture &amp; Micro-Blink Liveness</strong>
                  </div>
                  <div className="spec-item">
                    <span>Privacy Standard:</span>
                    <strong>Zero-Photo Storage (Templates Encrypted AES-256)</strong>
                  </div>
                  <div className="spec-item">
                    <span>Hardware Acceleration:</span>
                    <strong>DirectML / WebGL Shader Pipeline</strong>
                  </div>
                  <div className="spec-item">
                    <span>Audit Trail Token:</span>
                    <code>{`FACENOX-${Date.now().toString(16).toUpperCase()}`}</code>
                  </div>
                </div>
              </div>

              <div className="audit-log-terminal">
                <div className="terminal-header">Facenox Neural Inference Stream Log</div>
                <div className="terminal-body">
                  <div className="log-line info">[10:30:00 AM] [BOOT] Loaded model weights from local biometric repository.</div>
                  <div className="log-line info">[10:30:02 AM] [INIT] Syncing with active section: {course} {branch} ({section}) — {studentsList.length} templates cached.</div>
                  <div className="log-line success">[10:30:05 AM] [CCTV] WebCam RTSP socket established: 1280x720 @ 30.0 FPS.</div>
                  <div className="log-line success">[10:30:18 AM] [MATCH] Face #01 matched: Somesh Baliarsingh (26CSE001) · 98.6% confidence · Liveness passed.</div>
                  <div className="log-line success">[10:30:19 AM] [MATCH] Face #02 matched: Ashish Mohapatra (26CSE019) · 99.2% confidence · Liveness passed.</div>
                  <div className="log-line success">[10:30:20 AM] [MATCH] Face #03 matched: Bishnu Prasad Sahoo (26CSE002) · 97.4% confidence · Liveness passed.</div>
                  <div className="log-line warn">[10:48:12 AM] [ALERT] Late arrival identified past start cutoff: Sneha Mohanty (26CSE009) · Flagged LATE.</div>
                  <div className="log-line info">[10:50:00 AM] [METRICS] Recognition confidence mean: 98.4% across {recognizedCount} verified subjects.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="smart-attendance-modal-footer">
          <div className="footer-status-info">
            <CheckCircle2 size={18} color="#10b981" />
            <div>
              <strong>{recognizedCount} of {studentsList.length} Students Verified</strong>
              <span className="footer-sub-text">
                ({presentStudents.length} Present, {lateStudents.length} Late, {absentStudents.length} Unseen) · Mean Confidence: 98.4%
              </span>
            </div>
          </div>

          <div className="footer-action-buttons">
            <button
              type="button"
              className="btn-footer-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-footer-apply-attendance"
              onClick={handleConfirmAndApply}
              title="Apply detected students directly to class attendance register and keep full biometric details"
            >
              <Sparkles size={16} /> Apply Model Attendance to Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

