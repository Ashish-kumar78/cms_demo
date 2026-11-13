import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Edit3,
  Eye,
  FileCheck,
  FileText,
  Filter,
  HelpCircle,
  History,
  Info,
  Layers,
  ListFilter,
  Mic,
  Plus,
  Presentation,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Square,
  Tag,
  UserCheck,
  Users,
  X,
  XCircle
} from 'lucide-react';
import { facultyApi } from '../../services/facultyApi.js';
import { SmartCctvHub } from '../cctv/SmartCctvHub.tsx';
import './TakeAttendanceModule.css';

// Academic Activity Types Configuration (Exact requirements: Regular Class, Seminar, Internal Examination, Semester Examination, Other Academic Activity)
export const ACADEMIC_ACTIVITY_TYPES = [
  {
    id: 'Regular Class',
    label: 'Regular Class',
    badge: 'Curriculum Class',
    tag: 'REGULAR',
    icon: BookOpen,
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'Standard curriculum lecture, classroom session, or laboratory tutorial',
    detailsRequired: false,
    placeholder: ''
  },
  {
    id: 'Seminar',
    label: 'Seminar',
    badge: 'Academic Seminar',
    tag: 'SEMINAR',
    icon: Mic,
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    description: 'Technical symposium, guest speaker lecture, research presentation, or academic seminar',
    detailsRequired: true,
    placeholder: 'e.g., Guest Lecture on "Distributed Graph Computing & High-Performance AI" by Dr. K. Sharma (IIT), Auditorium Hall A'
  },
  {
    id: 'Internal Examination',
    label: 'Internal Examination',
    badge: 'CIA / Modular Exam',
    tag: 'INTERNAL EXAM',
    icon: ClipboardList,
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: 'Continuous Internal Assessment (CIA-I/II), Modular Exam, Mid-Term, or Internal Lab Test',
    detailsRequired: true,
    placeholder: 'e.g., Continuous Internal Assessment 1 (CIA-I) — Units 1 & 2 (Max Marks: 30), Hall 302'
  },
  {
    id: 'Semester Examination',
    label: 'Semester Examination',
    badge: 'University / End-Term',
    tag: 'SEMESTER EXAM',
    icon: Award,
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    description: 'Autonomous end-semester theory exam slot, practical viva slot, or external university evaluation',
    detailsRequired: true,
    placeholder: 'e.g., Autumn End-Semester Theory Examination 2026 — Slot A (Paper Code: CS501)'
  },
  {
    id: 'Other Academic Activity',
    label: 'Other Academic Activity',
    badge: 'Special Activity',
    tag: 'SPECIAL ACTIVITY',
    icon: Sparkles,
    color: '#0891b2',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    description: 'Workshop, industrial visit debrief, remedial class, doubt clearing, or project milestone review',
    detailsRequired: true,
    placeholder: 'e.g., Full-Day Hands-on DevOps & Cloud CI/CD Workshop / Capstone Major Project Milestone 2 Review'
  }
];

// Fast Quick-Fill Presets for Activities
export const ACTIVITY_PRESETS = {
  'Seminar': [
    'Guest Lecture by Visiting Scientist',
    'Industry Expert Technical Seminar',
    'Departmental Research Colloquium',
    'IEEE Student Branch Symposium'
  ],
  'Internal Examination': [
    'Continuous Internal Assessment 1 (CIA-I)',
    'Continuous Internal Assessment 2 (CIA-II)',
    'Mid-Semester Modular Examination',
    'Lab Continuous Internal Evaluation'
  ],
  'Semester Examination': [
    'Autonomous End-Semester Theory Slot',
    'Autonomous Practical Lab Viva & Evaluation',
    'University External Examination Slot',
    'Supplementary / Backlog Examination Slot'
  ],
  'Other Academic Activity': [
    'Hands-on DevOps & Cloud Workshop',
    'Capstone Project Architecture Review',
    'Remedial / Doubt-Clearing Session',
    'Industrial Visit Briefing & Orientation',
    'Hackathon Mentoring & Code Sprint'
  ]
};

// Course / Program Subject Offerings
export const PROGRAM_SUBJECTS = {
  'B.Tech': [
    { code: 'CS501', name: 'Data Structures & Algorithms', branch: 'CSE' },
    { code: 'CS502', name: 'Operating Systems', branch: 'CSE' },
    { code: 'CS503', name: 'Database Management Systems', branch: 'CSE' },
    { code: 'CS504', name: 'Artificial Intelligence & Neural Nets', branch: 'CSE' },
    { code: 'CS505', name: 'Machine Learning Foundations', branch: 'CSE' },
    { code: 'CS506', name: 'Software Engineering & Agile Methods', branch: 'CSE' },
    { code: 'AI501', name: 'Deep Learning & Natural Language Processing', branch: 'CSE (AI)' },
    { code: 'EC501', name: 'Digital Signal Processing & Microcontrollers', branch: 'ECE' },
    { code: 'EE501', name: 'Power Electronics & Drive Systems', branch: 'EE' },
    { code: 'ME501', name: 'Applied Thermodynamics & Fluid Dynamics', branch: 'Mechanical' },
  ],
  'M.Tech': [
    { code: 'CS701', name: 'Advanced Algorithms & Graph Theory', branch: 'Computer Science' },
    { code: 'CS702', name: 'Cloud Architecture & Distributed Computing', branch: 'Computer Science' },
    { code: 'VL701', name: 'VLSI Subsystem Design & Verification', branch: 'VLSI & Embedded Systems' },
  ],
  'BCA': [
    { code: 'BCA101', name: 'Fundamentals of Computing & IT', branch: 'Computer Applications' },
    { code: 'BCA102', name: 'Digital Electronics & Logic Design', branch: 'Computer Applications' },
    { code: 'BCA301', name: 'Web Programming & Full-Stack Tools', branch: 'Computer Applications' },
    { code: 'BCA302', name: 'Cloud Computing Principles', branch: 'Cloud & Mobile Tech' },
  ],
  'MCA': [
    { code: 'MCA501', name: 'Enterprise Cloud Architecture & Microservices', branch: 'Software Architecture' },
    { code: 'MCA502', name: 'Advanced Big Data Analytics & Mining', branch: 'Data Science & Analytics' },
  ],
  'MBA': [
    { code: 'MBA101', name: 'Organizational Behavior & HR Dynamics', branch: 'Human Resources' },
    { code: 'MBA102', name: 'Managerial Economics & Decisions', branch: 'Finance' },
    { code: 'MBA103', name: 'Marketing Management & Strategic Positioning', branch: 'Marketing' },
  ]
};

// Academic Data Configurations
const ACADEMIC_PROGRAMS = {
  'B.Tech': {
    batches: ['2023–2027', '2024–2028', '2025–2029', '2022–2026'],
    branches: ['CSE', 'CSE (AI)', 'ECE', 'EE', 'Mechanical'],
    sections: ['Section A', 'Section B', 'Section C']
  },
  'M.Tech': {
    batches: ['2024–2026', '2025–2027'],
    branches: ['Computer Science', 'VLSI & Embedded Systems'],
    sections: ['Section A', 'Section B']
  },
  'BCA': {
    batches: ['2023–2026', '2024–2027', '2025–2028'],
    branches: ['Computer Applications', 'Cloud & Mobile Tech'],
    sections: ['Section A', 'Section B']
  },
  'MCA': {
    batches: ['2024–2026', '2025–2027'],
    branches: ['Software Architecture', 'Data Science & Analytics'],
    sections: ['Section A', 'Section B']
  },
  'MBA': {
    batches: ['2024–2026', '2025–2027'],
    branches: ['Finance', 'Marketing', 'Human Resources'],
    sections: ['Section A', 'Section B']
  }
};

// Realistic Student Roster Data
const STUDENT_NAMES_POOL = [
  'Somesh Baliarsingh', 'Ashish Mohapatra', 'Bishnu Prasad Sahoo', 'Abhijit Rout',
  'Aarav Sharma', 'Rakesh Das', 'Priya Patra', 'Amit Nayak', 'Sneha Mohanty',
  'Sourav Sahoo', 'Pooja Jena', 'Bikash Verma', 'Swati Mishra', 'Monika Rout',
  'Subham Panda', 'Ipsita Ray', 'Alok Tripathy', 'Smruti Parida', 'Chandan Swain',
  'Tanmay Mangaraj', 'Lipika Muduli', 'Manas Kar', 'Pragyan Acharya', 'Biswajit Behera',
  'Archana Pradhan', 'Gourab Samal', 'Satyajit Barik', 'Sonali Rout', 'Ashish Das',
  'Kiran Nayak', 'Pranab Sahoo', 'Niharika Patra', 'Deepak Mohanty', 'Rohit Panda'
];

function generateStudentsForSection(course, batch, branch, section) {
  if (!course || !batch || !branch || !section) return [];
  
  // Section letter determiner
  const secLetter = section.slice(-1) || 'A';
  const secOffset = secLetter === 'B' ? 30 : secLetter === 'C' ? 60 : 0;
  const count = 30; // 30 students per section
  
  const list = [];
  for (let i = 1; i <= count; i++) {
    const rollNum = 100 + secOffset + i;
    const regNum = `230101${String(rollNum).padStart(3, '0')}`;
    const nameIndex = (i - 1) % STUDENT_NAMES_POOL.length;
    list.push({
      id: `std-${course}-${branch}-${section}-${rollNum}`,
      rollNumber: String(rollNum),
      registrationNumber: regNum,
      name: STUDENT_NAMES_POOL[nameIndex],
      branch: branch
    });
  }
  return list.sort((a, b) => Number(a.rollNumber) - Number(b.rollNumber));
}

export default function TakeAttendanceModule({
  account,
  role = 'faculty',
  onBackToDashboard,
  isModal = false,
  onClose,
  initialAssignment = null,
  initialSubjectCode = null,
  initialSubjectName = null,
  initialSection = null,
  initialCourse = null,
  initialBatch = null,
  initialBranch = null,
  initialOpenModel = false,
  onAttendanceSubmitted = null
}) {
  // Navigation Tab State inside Module: 'register' | 'history'
  const [activeModuleTab, setActiveModuleTab] = useState('register');

  // AI Face & Camera Attendance Model State
  const [isFaceModelModalOpen, setIsFaceModelModalOpen] = useState(() => Boolean(initialOpenModel));
  const [modelMetadata, setModelMetadata] = useState(null);

  // Synchronize initialOpenModel if updated
  useEffect(() => {
    if (initialOpenModel) {
      setIsFaceModelModalOpen(true);
    }
  }, [initialOpenModel]);

  // Academic Activity Type State
  const [activityType, setActivityType] = useState('Regular Class');
  const [activityDetails, setActivityDetails] = useState('');

  // Subject State initialized with props or defaults
  const [subjectCode, setSubjectCode] = useState(() => initialSubjectCode || initialAssignment?.subjectCode || 'CS501');
  const [subjectName, setSubjectName] = useState(() => initialSubjectName || initialAssignment?.subjectName || 'Data Structures & Algorithms');

  // Form State initialized with props or defaults
  const [course, setCourse] = useState(() => initialCourse || initialAssignment?.assignedCourse || initialAssignment?.course || 'B.Tech');
  const [batch, setBatch] = useState(() => initialBatch || initialAssignment?.batch || '2023–2027');
  const [branch, setBranch] = useState(() => initialBranch || initialAssignment?.assignedBranch || initialAssignment?.branch || 'CSE');
  const [section, setSection] = useState(() => initialSection || initialAssignment?.section || 'Section A');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromTime, setFromTime] = useState('10:30 AM');
  const [toTime, setToTime] = useState('11:30 AM');
  const [timePickerTarget, setTimePickerTarget] = useState('from');
  const classTime = useMemo(() => {
    if (fromTime && toTime) return `${fromTime} to ${toTime}`;
    return fromTime || toTime || '';
  }, [fromTime, toTime]);
  const [topicsCovered, setTopicsCovered] = useState('Binary Search Trees, AVL Rotations & Balancing Factors');

  // Search filter inside table
  const [tableSearch, setTableSearch] = useState('');

  // Attendance Map: { [studentId]: boolean } -> Default ABSENT (false)
  const [attendanceMap, setAttendanceMap] = useState({});

  // Workflow State: 'draft' | 'confirm_modal' | 'submitted' | 'update_confirm_modal'
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Synchronize state when initial props update
  useEffect(() => {
    if (initialSubjectCode) setSubjectCode(initialSubjectCode);
    if (initialSubjectName) setSubjectName(initialSubjectName);
    if (initialSection) setSection(initialSection);
    if (initialCourse) setCourse(initialCourse);
    if (initialBatch) setBatch(initialBatch);
    if (initialBranch) setBranch(initialBranch);
  }, [initialSubjectCode, initialSubjectName, initialSection, initialCourse, initialBatch, initialBranch]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [submittedSession, setSubmittedSession] = useState(null);
  const [showViewAttendanceTable, setShowViewAttendanceTable] = useState(false);

  // Past Sessions Log State
  const [pastSessions, setPastSessions] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [historySearch, setHistorySearch] = useState('');
  const [selectedPastSession, setSelectedPastSession] = useState(null);

  // Notifications
  const [alertBanner, setAlertBanner] = useState(null);

  // Time Picker Modal State
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [clockMode, setClockMode] = useState('hours'); // 'hours' | 'minutes'
  const [draftHour, setDraftHour] = useState(10);
  const [draftMinute, setDraftMinute] = useState(30);
  const [draftAmPm, setDraftAmPm] = useState('AM');

  // Available Dropdown Options Based On Selections
  const availableBatches = useMemo(() => {
    return (course && ACADEMIC_PROGRAMS[course]?.batches) || [];
  }, [course]);

  const availableBranches = useMemo(() => {
    return (course && ACADEMIC_PROGRAMS[course]?.branches) || [];
  }, [course]);

  const availableSections = useMemo(() => {
    return (course && ACADEMIC_PROGRAMS[course]?.sections) || [];
  }, [course]);

  const availableSubjects = useMemo(() => {
    const list = PROGRAM_SUBJECTS[course] || [];
    if (!branch) return list;
    const branchMatches = list.filter(s => s.branch === branch);
    return branchMatches.length > 0 ? branchMatches : list;
  }, [course, branch]);

  // Load Past Recorded Sessions on Mount and Subject/Section change
  useEffect(() => {
    let mounted = true;
    facultyApi.getAttendanceSessions(subjectCode, section).then((sessions) => {
      if (mounted && Array.isArray(sessions)) {
        setPastSessions(sessions);
      }
    });
    return () => {
      mounted = false;
    };
  }, [subjectCode, section]);

  // Current selected activity metadata
  const currentActivityConfig = useMemo(() => {
    return ACADEMIC_ACTIVITY_TYPES.find(a => a.id === activityType) || ACADEMIC_ACTIVITY_TYPES[0];
  }, [activityType]);

  // Filtered past sessions for history view
  const filteredPastSessions = useMemo(() => {
    return pastSessions.filter(session => {
      const matchType = historyFilter === 'All' || session.activityType === historyFilter;
      if (!historySearch.trim()) return matchType;
      const q = historySearch.toLowerCase();
      const matchSearch =
        (session.subjectCode && session.subjectCode.toLowerCase().includes(q)) ||
        (session.subjectName && session.subjectName.toLowerCase().includes(q)) ||
        (session.activityType && session.activityType.toLowerCase().includes(q)) ||
        (session.activityDetails && session.activityDetails.toLowerCase().includes(q)) ||
        (session.topicsCovered && session.topicsCovered.toLowerCase().includes(q)) ||
        (session.date && session.date.includes(q)) ||
        (session.section && session.section.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [pastSessions, historyFilter, historySearch]);

  // Dependent dropdown handlers
  const handleCourseChange = (e) => {
    const val = e.target.value;
    setCourse(val);
    const batches = ACADEMIC_PROGRAMS[val]?.batches || [];
    const branches = ACADEMIC_PROGRAMS[val]?.branches || [];
    const sections = ACADEMIC_PROGRAMS[val]?.sections || [];
    const nextBranch = branches[0] || '';
    setBatch(batches[0] || '');
    setBranch(nextBranch);
    setSection(sections[0] || '');

    const subList = PROGRAM_SUBJECTS[val] || [];
    const matchedSub = subList.find(s => s.branch === nextBranch) || subList[0];
    if (matchedSub) {
      setSubjectCode(matchedSub.code);
      setSubjectName(matchedSub.name);
    }

    setAttendanceMap({});
    setIsSubmitted(false);
    setIsEditing(false);
  };

  const handleBatchChange = (e) => {
    const val = e.target.value;
    setBatch(val);
    const branches = ACADEMIC_PROGRAMS[course]?.branches || [];
    const sections = ACADEMIC_PROGRAMS[course]?.sections || [];
    const nextBranch = branches[0] || '';
    setBranch(nextBranch);
    setSection(sections[0] || '');

    const subList = PROGRAM_SUBJECTS[course] || [];
    const matchedSub = subList.find(s => s.branch === nextBranch) || subList[0];
    if (matchedSub) {
      setSubjectCode(matchedSub.code);
      setSubjectName(matchedSub.name);
    }

    setAttendanceMap({});
    setIsSubmitted(false);
    setIsEditing(false);
  };

  const handleBranchChange = (e) => {
    const val = e.target.value;
    setBranch(val);
    const sections = ACADEMIC_PROGRAMS[course]?.sections || [];
    setSection(sections[0] || '');

    const subList = PROGRAM_SUBJECTS[course] || [];
    const matchedSub = subList.find(s => s.branch === val) || subList[0];
    if (matchedSub) {
      setSubjectCode(matchedSub.code);
      setSubjectName(matchedSub.name);
    }

    setAttendanceMap({});
    setIsSubmitted(false);
    setIsEditing(false);
  };

  const handleSectionChange = (e) => {
    const val = e.target.value;
    setSection(val);
    setAttendanceMap({});
    setIsSubmitted(false);
    setIsEditing(false);
  };

  const handleSubjectChange = (e) => {
    const code = e.target.value;
    setSubjectCode(code);
    const found = availableSubjects.find(s => s.code === code);
    if (found) {
      setSubjectName(found.name);
    }
  };

  // Student list generated for the selected class cohort
  const studentsList = useMemo(() => {
    if (!course || !batch || !branch || !section) return [];
    return generateStudentsForSection(course, batch, branch, section);
  }, [course, batch, branch, section]);

  // Filtered students for quick table searching
  const filteredStudents = useMemo(() => {
    if (!tableSearch.trim()) return studentsList;
    const q = tableSearch.toLowerCase();
    return studentsList.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.registrationNumber.toLowerCase().includes(q)
    );
  }, [studentsList, tableSearch]);

  // Attendance Calculations
  const totalStudents = studentsList.length;
  const presentCount = useMemo(() => {
    return studentsList.reduce((acc, s) => (attendanceMap[s.id] ? acc + 1 : acc), 0);
  }, [studentsList, attendanceMap]);
  const absentCount = totalStudents - presentCount;

  // Toggle single student present/absent
  const handleToggleStudent = (studentId) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated = {};
    studentsList.forEach(s => {
      updated[s.id] = true;
    });
    setAttendanceMap(updated);
  };

  // Clear all (Mark all absent)
  const handleClearAll = () => {
    const updated = {};
    studentsList.forEach(s => {
      updated[s.id] = false;
    });
    setAttendanceMap(updated);
  };

  // Time Picker open helper for From / To time
  const openTimePicker = (target = 'from') => {
    setTimePickerTarget(target);
    const targetVal = target === 'from' ? fromTime : toTime;
    try {
      const parts = (targetVal || (target === 'from' ? '10:30 AM' : '11:30 AM')).split(/[: ]/);
      if (parts.length >= 3) {
        setDraftHour(parseInt(parts[0], 10) || (target === 'from' ? 10 : 11));
        setDraftMinute(parseInt(parts[1], 10) || 30);
        setDraftAmPm(parts[2].toUpperCase() === 'PM' ? 'PM' : 'AM');
      }
    } catch {
      setDraftHour(target === 'from' ? 10 : 11);
      setDraftMinute(30);
      setDraftAmPm('AM');
    }
    setClockMode('hours');
    setIsTimePickerOpen(true);
  };

  const confirmTimePicker = () => {
    const h = draftHour < 10 ? `0${draftHour}` : `${draftHour}`;
    const m = draftMinute < 10 ? `0${draftMinute}` : `${draftMinute}`;
    const formatted = `${h}:${m} ${draftAmPm}`;
    if (timePickerTarget === 'from') {
      setFromTime(formatted);
      if (!toTime) {
        const nextHour = (draftHour % 12) + 1;
        const nextAmPm = draftHour === 11 ? (draftAmPm === 'AM' ? 'PM' : 'AM') : draftAmPm;
        const nh = nextHour < 10 ? `0${nextHour}` : `${nextHour}`;
        setToTime(`${nh}:${m} ${nextAmPm}`);
      }
    } else {
      setToTime(formatted);
    }
    setIsTimePickerOpen(false);
  };

  // Quick Preset click for Activity Details
  const handleApplyActivityPreset = (presetText) => {
    if (!activityDetails) {
      setActivityDetails(presetText);
    } else if (!activityDetails.includes(presetText)) {
      setActivityDetails(`${activityDetails} · ${presetText}`);
    }
  };

  // Submit Validation and Trigger
  const handleInitiateSubmit = () => {
    if (!course || !batch || !branch || !section) {
      setAlertBanner({ type: 'error', message: 'Please select Course, Batch, Branch, and Section before submitting.' });
      return;
    }
    if (!subjectCode) {
      setAlertBanner({ type: 'error', message: 'Please select or specify a Subject for this academic session.' });
      return;
    }
    if (!date) {
      setAlertBanner({ type: 'error', message: 'Please select a valid attendance date.' });
      return;
    }
    if (!fromTime || !toTime) {
      setAlertBanner({ type: 'error', message: 'Please specify both class start time (From) and end time (To).' });
      return;
    }
    if (studentsList.length === 0) {
      setAlertBanner({ type: 'error', message: 'Cannot record attendance: Selected section contains 0 enrolled students.' });
      return;
    }

    setAlertBanner(null);
    setShowConfirmModal(true);
  };

  const handleApplyModelAttendance = (newAttendanceMap, auditDetails) => {
    setAttendanceMap(newAttendanceMap);
    setModelMetadata(auditDetails);
    setAlertBanner({
      type: 'success',
      message: `✅ AI Model Attendance Applied: ${auditDetails.presentCount} Verified Present, ${auditDetails.lateCount} Late (${auditDetails.accuracyRate}% recognition accuracy). All biometric audit details recorded.`
    });
  };

  // Final Submission Confirmed
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    const sessionRecord = {
      id: `att-${Date.now()}`,
      course,
      batch,
      branch,
      section,
      subjectCode,
      subjectName,
      activityType,
      activityDetails: activityType === 'Regular Class' ? '' : activityDetails,
      date,
      fromTime,
      toTime,
      classTime,
      period: classTime,
      topicsCovered,
      totalStudents,
      presentCount,
      absentCount,
      totalEnrolled: totalStudents,
      percentage: totalStudents > 0 ? Number(((presentCount / totalStudents) * 100).toFixed(1)) : 100,
      status: 'Finalized',
      attendanceMap: { ...attendanceMap },
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      facultyName: account?.name || 'Dr. S. Mohanty',
      modelMetadata: modelMetadata || null
    };

    setSubmittedSession(sessionRecord);
    setIsSubmitted(true);
    setIsEditing(false);
    setShowViewAttendanceTable(false);

    // Add to past sessions state
    setPastSessions(prev => [sessionRecord, ...prev.filter(s => s.id !== sessionRecord.id)]);

    // Call facultyApi to sync to backend and local storage
    try {
      await facultyApi.submitAttendanceSession({
        ...sessionRecord,
        facultyName: account?.name || 'Dr. S. Mohanty'
      });
    } catch (err) {
      console.warn('API sync warning:', err);
    }

    try {
      onAttendanceSubmitted?.(sessionRecord);
    } catch {}

    const activityLabel = activityType !== 'Regular Class' ? ` [Activity: ${activityType}]` : '';
    setAlertBanner({
      type: 'success',
      message: `Attendance & academic activity successfully recorded for ${subjectCode} (${section})${activityLabel} · ${presentCount} Present, ${absentCount} Absent.`
    });
  };

  // Enter Update Mode
  const handleStartUpdate = () => {
    setIsEditing(true);
    setIsSubmitted(false);
    setShowViewAttendanceTable(true);
    setAlertBanner({
      type: 'info',
      message: 'Editing mode active: Modify academic activity type, details, or student statuses, then click Save Changes.'
    });
  };

  // Initiate Update Confirmation
  const handleInitiateUpdateSave = () => {
    setShowUpdateConfirmModal(true);
  };

  // Confirm Update
  const handleConfirmUpdate = async () => {
    setShowUpdateConfirmModal(false);
    const updatedRecord = {
      ...submittedSession,
      course,
      batch,
      branch,
      section,
      subjectCode,
      subjectName,
      activityType,
      activityDetails: activityType === 'Regular Class' ? '' : activityDetails,
      date,
      fromTime,
      toTime,
      classTime,
      period: classTime,
      topicsCovered,
      totalStudents,
      presentCount,
      absentCount,
      totalEnrolled: totalStudents,
      percentage: totalStudents > 0 ? Number(((presentCount / totalStudents) * 100).toFixed(1)) : 100,
      attendanceMap: { ...attendanceMap },
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSubmittedSession(updatedRecord);
    setIsSubmitted(true);
    setIsEditing(false);
    setShowViewAttendanceTable(false);

    setPastSessions(prev => [updatedRecord, ...prev.filter(s => s.id !== updatedRecord.id)]);

    try {
      await facultyApi.submitAttendanceSession(updatedRecord);
    } catch {}

    try {
      onAttendanceSubmitted?.(updatedRecord);
    } catch {}

    setAlertBanner({
      type: 'success',
      message: `Attendance record updated successfully! Total Present: ${presentCount}, Absent: ${absentCount} [Activity: ${activityType}].`
    });
  };

  // Cancel Update
  const handleCancelUpdate = () => {
    if (submittedSession) {
      setAttendanceMap({ ...submittedSession.attendanceMap });
      setTopicsCovered(submittedSession.topicsCovered || '');
      setActivityType(submittedSession.activityType || 'Regular Class');
      setActivityDetails(submittedSession.activityDetails || '');
      if (submittedSession.subjectCode) setSubjectCode(submittedSession.subjectCode);
      if (submittedSession.subjectName) setSubjectName(submittedSession.subjectName);
      if (submittedSession.fromTime && submittedSession.toTime) {
        setFromTime(submittedSession.fromTime);
        setToTime(submittedSession.toTime);
      } else if (submittedSession.classTime) {
        const parts = submittedSession.classTime.split(/\s*(?:to|-|–)\s*/i);
        if (parts.length >= 2) {
          setFromTime(parts[0].trim());
          setToTime(parts[1].trim());
        } else {
          setFromTime(submittedSession.classTime);
          setToTime('11:30 AM');
        }
      }
      setDate(submittedSession.date);
    }
    setIsEditing(false);
    setIsSubmitted(true);
    setShowViewAttendanceTable(false);
    setAlertBanner(null);
  };

  // Reset to record new attendance session
  const handleRecordNewSession = () => {
    setIsSubmitted(false);
    setIsEditing(false);
    setSubmittedSession(null);
    setAttendanceMap({});
    setTopicsCovered('Binary Search Trees, AVL Rotations & Balancing Factors');
    setActivityType('Regular Class');
    setActivityDetails('');
    setAlertBanner(null);
    setShowViewAttendanceTable(true);
  };

  // Load a past session into view
  const handleLoadPastSession = (sess) => {
    if (sess.course) setCourse(sess.course);
    if (sess.batch) setBatch(sess.batch);
    if (sess.branch) setBranch(sess.branch);
    if (sess.section) setSection(sess.section);
    if (sess.subjectCode) setSubjectCode(sess.subjectCode);
    if (sess.subjectName) setSubjectName(sess.subjectName);
    if (sess.date) setDate(sess.date);
    if (sess.activityType) setActivityType(sess.activityType);
    if (sess.activityDetails) setActivityDetails(sess.activityDetails);
    if (sess.topicsCovered) setTopicsCovered(sess.topicsCovered);
    if (sess.attendanceMap) setAttendanceMap(sess.attendanceMap);

    setSubmittedSession(sess);
    setIsSubmitted(true);
    setIsEditing(false);
    setShowViewAttendanceTable(false);
    setActiveModuleTab('register');
    setAlertBanner({
      type: 'info',
      message: `Viewing past record: ${sess.subjectCode} (${sess.section}) · Activity: ${sess.activityType} on ${sess.date} (${sess.period || sess.classTime}).`
    });
  };

  // Role display label
  const roleLabel = role === 'hod' ? 'HOD Department Console' : role === 'staff' ? 'Lab & Operations Staff' : 'Faculty Classroom Workspace';

  const content = (
    <div className={`take-attendance-wrapper ${isModal ? 'take-attendance-modal-inner' : ''}`}>
      {/* Page Header */}
      <div className="take-attendance-header">
        <div className="take-attendance-title-area">
          <h2>
            <ClipboardCheck size={26} /> Take Attendance
          </h2>
          <p>Select your class and record student attendance.</p>
        </div>
        <div className="take-attendance-role-tag">
          <UserCheck size={15} /> {roleLabel}
        </div>
      </div>

      {/* Top Module Navigation: Register vs Session History vs AI Camera Model */}
      <div className="attendance-module-tabs">
        <button
          type="button"
          className={`module-tab-btn ${activeModuleTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveModuleTab('register')}
        >
          <ClipboardCheck size={16} /> Take Attendance Register
        </button>
        <button
          type="button"
          className={`module-tab-btn ${activeModuleTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveModuleTab('history')}
        >
          <History size={16} /> Academic Activity &amp; Past Sessions
          <span className="module-tab-badge">{pastSessions.length}</span>
        </button>
        <button
          type="button"
          className="module-tab-btn"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(37,99,235,0.12))',
            border: '1px solid #38bdf8',
            color: '#0369a1',
            fontWeight: 700
          }}
          onClick={() => setIsFaceModelModalOpen(true)}
          title="Open Facenox AI Camera & Biometric Model for automatic attendance"
        >
          <Camera size={16} /> 🤖 AI Camera Model
          {modelMetadata && (
            <span className="module-tab-badge" style={{ background: '#10b981', color: '#ffffff' }}>
              ✓ Verified
            </span>
          )}
        </button>
      </div>

      {/* Alert / Notification Banner */}
      {alertBanner && (
        <div className={`attendance-alert-banner ${alertBanner.type}`}>
          {alertBanner.type === 'success' && <CheckCircle2 size={18} />}
          {alertBanner.type === 'error' && <AlertCircle size={18} />}
          {alertBanner.type === 'info' && <Sparkles size={18} />}
          <span>{alertBanner.message}</span>
          <button
            type="button"
            onClick={() => setAlertBanner(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ====================================================================
          TAB 1: TAKE ATTENDANCE REGISTER
          ==================================================================== */}
      {activeModuleTab === 'register' && (
        <>
          {/* ── FINAL ATTENDANCE SUMMARY PANEL (SHOWN AFTER SUBMISSION) ── */}
          {isSubmitted && submittedSession && !isEditing && (
            <div className="final-summary-card">
              <div className="final-summary-header">
                <div className="final-summary-header-left">
                  <div className="final-summary-badge">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0 }}>Official Attendance Record Finalized</h3>
                      {/* Activity Badge Pill */}
                      <span className={`activity-badge-pill ${
                        submittedSession.activityType === 'Seminar' ? 'seminar' :
                        submittedSession.activityType === 'Internal Examination' ? 'internal' :
                        submittedSession.activityType === 'Semester Examination' ? 'semester' :
                        submittedSession.activityType === 'Other Academic Activity' ? 'other' : 'regular'
                      }`}>
                        {submittedSession.activityType || 'Regular Class'}
                      </span>
                    </div>
                    <p style={{ margin: 0 }}>
                      Submitted on {submittedSession.date} at {submittedSession.submittedAt || submittedSession.classTime}
                      {submittedSession.updatedAt ? ` (Updated at ${submittedSession.updatedAt})` : ''} · Recorded by {submittedSession.facultyName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Activity Details Callout (If non-regular class) */}
              {submittedSession.activityType && submittedSession.activityType !== 'Regular Class' && submittedSession.activityDetails && (
                <div
                  className="final-activity-callout"
                  style={{
                    backgroundColor: currentActivityConfig.bgColor,
                    borderColor: currentActivityConfig.borderColor
                  }}
                >
                  <div
                    className="final-activity-callout-icon"
                    style={{
                      backgroundColor: '#ffffff',
                      color: currentActivityConfig.color,
                      border: `1.5px solid ${currentActivityConfig.borderColor}`
                    }}
                  >
                    {React.createElement(currentActivityConfig.icon || Sparkles, { size: 18 })}
                  </div>
                  <div className="final-activity-callout-content">
                    <h4 style={{ color: currentActivityConfig.color }}>
                      Special Academic Activity: {submittedSession.activityType}
                    </h4>
                    <p><strong>Activity Details:</strong> {submittedSession.activityDetails}</p>
                  </div>
                </div>
              )}

              <div className="final-meta-grid">
                <div className="final-meta-item">
                  <span>Subject</span>
                  <strong>{submittedSession.subjectCode} — {submittedSession.subjectName}</strong>
                </div>
                <div className="final-meta-item">
                  <span>Activity Type</span>
                  <strong style={{ color: currentActivityConfig.color }}>{submittedSession.activityType || 'Regular Class'}</strong>
                </div>
                <div className="final-meta-item">
                  <span>Course</span>
                  <strong>{submittedSession.course}</strong>
                </div>
                <div className="final-meta-item">
                  <span>Batch &amp; Branch</span>
                  <strong>{submittedSession.branch} ({submittedSession.batch})</strong>
                </div>
                <div className="final-meta-item">
                  <span>Section</span>
                  <strong>{submittedSession.section}</strong>
                </div>
                <div className="final-meta-item">
                  <span>Lecture Date</span>
                  <strong>{submittedSession.date}</strong>
                </div>
                <div className="final-meta-item">
                  <span>Class Time Slot</span>
                  <strong>{submittedSession.classTime}</strong>
                </div>
                <div className="final-meta-item" style={{ gridColumn: 'span 2' }}>
                  <span>{submittedSession.activityType === 'Regular Class' ? 'Topics Covered' : 'Session Agenda / Syllabus'}</span>
                  <strong>{submittedSession.topicsCovered || 'Regular Syllabus Lecture'}</strong>
                </div>
              </div>

              {/* AI Biometric Face Recognition Audit Badge */}
              {submittedSession.modelMetadata && (
                <div
                  className="final-ai-model-audit-box"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(37,99,235,0.08))',
                    border: '1px solid #bae6fd',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#0284c7',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Camera size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0369a1' }}>
                        🤖 {submittedSession.modelMetadata.modelName || 'Facenox AI Face Biometrics'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Source: {submittedSession.modelMetadata.cameraSource || 'Classroom Smart CCTV HD'} · Token: <code style={{ fontSize: '0.75rem', color: '#0369a1' }}>{submittedSession.modelMetadata.auditToken}</code>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Recognition Accuracy</div>
                      <strong style={{ fontSize: '1rem', color: '#059669' }}>{submittedSession.modelMetadata.accuracyRate}%</strong>
                    </div>
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={13} /> Biometric Verified
                    </span>
                  </div>
                </div>
              )}

              {/* Statistics Progress Bar */}
              <div className="final-stats-bar">
                <div className="final-stats-bar-header">
                  <span style={{ color: '#16a34a' }}>
                    Present: {submittedSession.presentCount} ({totalStudents > 0 ? ((submittedSession.presentCount / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                  <span style={{ color: '#64748b' }}>
                    Total Enrolled: {totalStudents}
                  </span>
                  <span style={{ color: '#dc2626' }}>
                    Absent: {submittedSession.absentCount} ({totalStudents > 0 ? ((submittedSession.absentCount / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="final-progress-track">
                  <div
                    className="final-progress-present"
                    style={{ width: `${totalStudents > 0 ? (submittedSession.presentCount / totalStudents) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="final-actions-row">
                <button
                  type="button"
                  className="btn-view-attendance"
                  onClick={() => setShowViewAttendanceTable(prev => !prev)}
                >
                  <Eye size={16} />
                  {showViewAttendanceTable ? 'Hide Attendance List' : 'View Attendance List'}
                </button>
                <button
                  type="button"
                  className="btn-update-attendance"
                  onClick={handleStartUpdate}
                >
                  <Edit3 size={16} />
                  Update Attendance
                </button>
                <button
                  type="button"
                  className="btn-new-attendance"
                  onClick={handleRecordNewSession}
                >
                  <RotateCcw size={16} />
                  Record New Attendance
                </button>
              </div>
            </div>
          )}

          {/* ── CLASS DETAILS, SUBJECT & SCHEDULE ── */}
          {(!isSubmitted || isEditing) && (
            <div className="attendance-card">
              <div className="attendance-card-header">
                <div>
                  <h3>
                    <BookOpen size={18} color="#2563eb" /> Class Details, Subject &amp; Schedule
                  </h3>
                  <p>Configure subject, cohort, section, time slot, academic activity, and syllabus topics.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`activity-badge-pill ${
                    activityType === 'Seminar' ? 'seminar' :
                    activityType === 'Internal Examination' ? 'internal' :
                    activityType === 'Semester Examination' ? 'semester' :
                    activityType === 'Other Academic Activity' ? 'other' : 'regular'
                  }`}>
                    {React.createElement(currentActivityConfig.icon || BookOpen, { size: 14 })}
                    {activityType}
                  </span>
                  {isEditing && (
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                      EDITING SESSION
                    </span>
                  )}
                </div>
              </div>
              <div className="attendance-card-body">
                <div className="class-details-grid">
                  {/* Subject Selection */}
                  <div className="form-group form-group-subject" style={{ gridColumn: 'span 2' }}>
                    <label>
                      Subject / Course Paper <span className="required-star">*</span>
                    </label>
                    <select
                      className="form-control-select"
                      value={subjectCode}
                      onChange={handleSubjectChange}
                    >
                      {availableSubjects.map((sub) => (
                        <option key={sub.code} value={sub.code}>
                          {sub.code} — {sub.name} ({sub.branch || 'Core'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course */}
                  <div className="form-group">
                    <label>Course <span className="required-star">*</span></label>
                    <select
                      className="form-control-select"
                      value={course}
                      onChange={handleCourseChange}
                    >
                      {Object.keys(ACADEMIC_PROGRAMS).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Batch */}
                  <div className="form-group">
                    <label>Batch <span className="required-star">*</span></label>
                    <select
                      className="form-control-select"
                      value={batch}
                      onChange={handleBatchChange}
                    >
                      {availableBatches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Branch */}
                  <div className="form-group">
                    <label>Branch <span className="required-star">*</span></label>
                    <select
                      className="form-control-select"
                      value={branch}
                      onChange={handleBranchChange}
                    >
                      {availableBranches.map(br => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section */}
                  <div className="form-group">
                    <label>Section <span className="required-star">*</span></label>
                    <select
                      className="form-control-select"
                      value={section}
                      onChange={handleSectionChange}
                    >
                      {availableSections.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="form-group">
                    <label>Date <span className="required-star">*</span></label>
                    <input
                      type="date"
                      className="form-control-input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  {/* Class Time - From Time and To Time */}
                  <div className="form-group">
                    <label>Class Time (From) <span className="required-star">*</span></label>
                    <button
                      type="button"
                      className="form-control-time-btn"
                      onClick={() => openTimePicker('from')}
                      title="Click to select lecture Start Time (From)"
                    >
                      <span className={fromTime ? 'time-val' : 'time-placeholder'}>
                        {fromTime || 'Select From Time'}
                      </span>
                      <Clock size={16} color="#2563eb" />
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Class Time (To) <span className="required-star">*</span></label>
                    <button
                      type="button"
                      className="form-control-time-btn"
                      onClick={() => openTimePicker('to')}
                      title="Click to select lecture End Time (To)"
                    >
                      <span className={toTime ? 'time-val' : 'time-placeholder'}>
                        {toTime || 'Select To Time'}
                      </span>
                      <Clock size={16} color="#2563eb" />
                    </button>
                  </div>

                  {/* Academic Activity Type Dropdown (Right beside Class Time To) */}
                  <div className="form-group">
                    <label>
                      Academic Activity Type <span className="required-star">*</span>
                    </label>
                    <select
                      className="form-control-select"
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                    >
                      <option value="Regular Class">Regular Class</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Internal Examination">Internal Examination</option>
                      <option value="Semester Examination">Semester Examination</option>
                      <option value="Other Academic Activity">Other Academic Activity</option>
                    </select>
                  </div>

                  {/* Specification Box for Special Activities (Seminar, Internal Exam, Semester Exam, Other) */}
                  {activityType !== 'Regular Class' && (
                    <div
                      className="special-activity-details-panel"
                      style={{
                        gridColumn: '1 / -1',
                        backgroundColor: currentActivityConfig.bgColor,
                        borderColor: currentActivityConfig.borderColor,
                        marginTop: '4px',
                        marginBottom: '6px'
                      }}
                    >
                      <div className="special-activity-details-header">
                        <h4 style={{ color: currentActivityConfig.color }}>
                          {React.createElement(currentActivityConfig.icon || Sparkles, { size: 16 })}
                          Specify {activityType} Details
                        </h4>
                        <span className="special-activity-hint">
                          Recorded against {subjectCode} on {date} ({classTime})
                        </span>
                      </div>

                      <input
                        type="text"
                        className="form-control-input"
                        placeholder={currentActivityConfig.placeholder || `Enter ${activityType.toLowerCase()} details, agenda, or topics...`}
                        value={activityDetails}
                        onChange={(e) => setActivityDetails(e.target.value)}
                        style={{
                          borderColor: currentActivityConfig.borderColor,
                          backgroundColor: '#ffffff'
                        }}
                      />

                      {/* Quick-Fill Preset Chips */}
                      {ACTIVITY_PRESETS[activityType] && (
                        <div className="activity-presets-row" style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                            Quick Presets:
                          </span>
                          {ACTIVITY_PRESETS[activityType].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              className="activity-preset-chip"
                              onClick={() => handleApplyActivityPreset(preset)}
                              title="Click to populate details"
                            >
                              <Plus size={12} /> {preset}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Topics Covered / Session Agenda */}
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>
                    {activityType === 'Regular Class'
                      ? 'Topics Covered / Syllabus Taught'
                      : activityType === 'Seminar'
                      ? 'Seminar Agenda & Key Learning Outcomes'
                      : activityType === 'Internal Examination'
                      ? 'Examination Units & Syllabus Evaluated'
                      : activityType === 'Semester Examination'
                      ? 'Autonomous Paper Syllabus Scope'
                      : 'Special Activity Agenda & Objectives'}{' '}
                    <span className="required-star">*</span>
                  </label>
                  <textarea
                    className="form-control-textarea"
                    rows={2}
                    placeholder={
                      activityType === 'Seminar'
                        ? 'e.g., Key discussion topics, guest speaker presentation slides, Q&A points...'
                        : activityType === 'Internal Examination'
                        ? 'e.g., Modules 1 & 2 Question Paper, Section A (Short) & Section B (Long Answer)...'
                        : activityType === 'Semester Examination'
                        ? 'e.g., Autonomous End-Semester Theory Paper Units 1 to 5, Invigilation Report...'
                        : activityType === 'Other Academic Activity'
                        ? 'e.g., Hands-on lab exercises, project milestone verification, student participation...'
                        : 'Enter lecture topics taught during this session (e.g., Binary Search Trees, AVL Rotations & Balancing Factors)...'
                    }
                    value={topicsCovered}
                    onChange={(e) => setTopicsCovered(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 3. LIVE ATTENDANCE SUMMARY CARDS ── */}
          {studentsList.length > 0 && (!isSubmitted || isEditing || showViewAttendanceTable) && (
            <div className="attendance-summary-deck">
              {/* Total Students */}
              <div className="summary-card total">
                <div className="summary-card-copy">
                  <span>Total Students</span>
                  <strong>{totalStudents}</strong>
                  <small>Enrolled in {section}</small>
                </div>
                <div className="summary-card-icon">
                  <Users size={22} />
                </div>
              </div>

              {/* Present */}
              <div className="summary-card present">
                <div className="summary-card-copy">
                  <span>Present</span>
                  <strong>{presentCount}</strong>
                  <small>
                    {totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0}% Attendance Rate
                  </small>
                </div>
                <div className="summary-card-icon">
                  <CheckCircle2 size={24} />
                </div>
              </div>

              {/* Absent */}
              <div className="summary-card absent">
                <div className="summary-card-copy">
                  <span>Absent</span>
                  <strong>{absentCount}</strong>
                  <small>
                    {totalStudents > 0 ? ((absentCount / totalStudents) * 100).toFixed(1) : 0}% Absent Rate
                  </small>
                </div>
                <div className="summary-card-icon">
                  <XCircle size={24} />
                </div>
              </div>
            </div>
          )}

          {/* ── 4 & 5. STUDENT ATTENDANCE TABLE ── */}
          {studentsList.length === 0 ? (
            <div className="attendance-card">
              <div className="attendance-empty-state">
                <AlertCircle size={40} />
                <h4>No Class Selected</h4>
                <p>Please select Course, Batch, Branch, and Section above to generate the student attendance roster.</p>
              </div>
            </div>
          ) : (!isSubmitted || isEditing || showViewAttendanceTable) ? (
            <div className="attendance-card">
              <div className="attendance-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3>
                      <Users size={18} color="#2563eb" />
                      Student Roster · {course} {branch} ({section}) · {subjectCode}
                    </h3>
                    <span className={`activity-badge-pill ${
                      activityType === 'Seminar' ? 'seminar' :
                      activityType === 'Internal Examination' ? 'internal' :
                      activityType === 'Semester Examination' ? 'semester' :
                      activityType === 'Other Academic Activity' ? 'other' : 'regular'
                    }`}>
                      {activityType}
                    </span>
                    {modelMetadata && (
                      <span className="badge-ai-model-verified" title={`Verified by ${modelMetadata.modelName} (${modelMetadata.accuracyRate}% confidence)`}>
                        <Sparkles size={13} /> AI Model Verified ({modelMetadata.accuracyRate}%)
                      </span>
                    )}
                  </div>
                  <p>Default status is ABSENT. Check student box to mark PRESENT (green tick), or run AI Model.</p>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  {isSubmitted && !isEditing ? 'ReadOnly Attendance Record' : 'Live Interactive Draft'}
                </span>
              </div>

              <div className="attendance-card-body">
                {/* Table Toolbar (Mark All / Clear All / Search) */}
                {(!isSubmitted || isEditing) && (
                  <div className="attendance-toolbar">
                    <div className="attendance-quick-buttons">
                      <button
                        type="button"
                        className="btn-mark-all-present"
                        onClick={handleMarkAllPresent}
                        title="Mark all students present"
                      >
                        <Check size={16} /> Mark All Present
                      </button>
                      <button
                        type="button"
                        className="btn-clear-all"
                        onClick={handleClearAll}
                        title="Clear all checkboxes (mark all absent)"
                      >
                        <RotateCcw size={15} /> Clear All
                      </button>
                      <button
                        type="button"
                        className="btn-ai-attendance-model"
                        onClick={() => setIsFaceModelModalOpen(true)}
                        title="Take attendance using Facenox AI Camera & Face Recognition Model"
                      >
                        <Camera size={16} /> 🤖 AI Model Attendance
                      </button>
                    </div>

                    <div className="attendance-search-box">
                      <input
                        type="text"
                        placeholder="Search name or roll no..."
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                      />
                      {tableSearch && (
                        <button
                          type="button"
                          onClick={() => setTableSearch('')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="attendance-table-container">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th className="col-present">Present</th>
                        <th>Sl. No. / Roll No.</th>
                        <th>Registration No.</th>
                        <th>Student Name</th>
                        <th>Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                            No students match your filter "{tableSearch}".
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((std) => {
                          const isPresent = Boolean(attendanceMap[std.id]);
                          const isDisabled = isSubmitted && !isEditing;
                          return (
                            <tr
                              key={std.id}
                              className={isPresent ? 'row-present' : ''}
                              onClick={() => {
                                if (!isDisabled) handleToggleStudent(std.id);
                              }}
                            >
                              {/* Present Column - Square Checkbox with Green Tick */}
                              <td className="col-present" onClick={(e) => e.stopPropagation()}>
                                <div className="att-checkbox-wrapper">
                                  <button
                                    type="button"
                                    className={`att-square-checkbox ${isPresent ? 'checked' : ''}`}
                                    disabled={isDisabled}
                                    onClick={() => handleToggleStudent(std.id)}
                                    aria-label={`Mark ${std.name} as ${isPresent ? 'absent' : 'present'}`}
                                    title={isPresent ? 'Click to mark Absent' : 'Click to mark Present'}
                                  >
                                    {isPresent && <Check size={16} strokeWidth={3} />}
                                  </button>
                                </div>
                              </td>

                              {/* Roll Number */}
                              <td>
                                <strong>{std.rollNumber}</strong>
                              </td>

                              {/* Registration Number */}
                              <td style={{ fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>
                                {std.registrationNumber}
                              </td>

                              {/* Student Name */}
                              <td>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{std.name}</span>
                              </td>

                              {/* Branch */}
                              <td>
                                <span style={{ color: '#64748b' }}>{std.branch}</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Submit / Save Actions Footer */}
                {!isSubmitted && (
                  <div className="attendance-submit-footer">
                    <button
                      type="button"
                      className="btn-submit-attendance"
                      onClick={handleInitiateSubmit}
                    >
                      <Send size={18} /> Submit Attendance
                    </button>
                  </div>
                )}

                {isEditing && (
                  <div className="attendance-submit-footer">
                    <button
                      type="button"
                      className="btn-clear-all"
                      onClick={handleCancelUpdate}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-submit-attendance"
                      onClick={handleInitiateUpdateSave}
                      style={{ background: '#16a34a' }}
                    >
                      <CheckCircle2 size={18} /> Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* ====================================================================
          TAB 2: ACADEMIC ACTIVITY & PAST SESSIONS LOG
          ==================================================================== */}
      {activeModuleTab === 'history' && (
        <div className="attendance-card">
          <div className="attendance-card-header">
            <div>
              <h3>
                <History size={18} color="#2563eb" /> Academic Activity &amp; Attendance Records
              </h3>
              <p>Historical audit log of regular classes, seminars, internal exams, and special activities.</p>
            </div>
            <button
              type="button"
              className="btn-new-attendance"
              onClick={() => {
                handleRecordNewSession();
                setActiveModuleTab('register');
              }}
            >
              <RotateCcw size={15} /> Record New Session
            </button>
          </div>

          <div className="attendance-card-body">
            {/* Filter Bar */}
            <div className="history-filters-bar">
              <div className="history-filter-chips">
                {[
                  { id: 'All', label: 'All Activities' },
                  { id: 'Regular Class', label: 'Regular Classes', chipClass: 'chip-regular' },
                  { id: 'Seminar', label: 'Seminars', chipClass: 'chip-seminar' },
                  { id: 'Internal Examination', label: 'Internal Exams', chipClass: 'chip-internal' },
                  { id: 'Semester Examination', label: 'Semester Exams', chipClass: 'chip-semester' },
                  { id: 'Other Academic Activity', label: 'Special Activities', chipClass: 'chip-other' }
                ].map((flt) => {
                  const count = flt.id === 'All'
                    ? pastSessions.length
                    : pastSessions.filter(s => s.activityType === flt.id).length;
                  const isAct = historyFilter === flt.id;
                  return (
                    <button
                      key={flt.id}
                      type="button"
                      className={`history-filter-chip ${isAct ? `active ${flt.chipClass || ''}` : ''}`}
                      onClick={() => setHistoryFilter(flt.id)}
                    >
                      {flt.label}
                      <span className="history-filter-badge">{count}</span>
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                className="history-search-input"
                placeholder="Search subject, activity, date..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>

            {/* Sessions Grid */}
            {filteredPastSessions.length === 0 ? (
              <div className="attendance-empty-state" style={{ padding: '40px 20px' }}>
                <FileText size={40} color="#94a3b8" />
                <h4>No Sessions Found</h4>
                <p>No academic activity sessions match the filter "{historyFilter}".</p>
              </div>
            ) : (
              <div className="past-sessions-grid">
                {filteredPastSessions.map((sess) => {
                  const actClass =
                    sess.activityType === 'Seminar' ? 'seminar' :
                    sess.activityType === 'Internal Examination' ? 'internal' :
                    sess.activityType === 'Semester Examination' ? 'semester' :
                    sess.activityType === 'Other Academic Activity' ? 'other' : 'regular';
                  const total = sess.totalEnrolled || 32;
                  const pres = sess.presentCount || 0;
                  const pct = total > 0 ? ((pres / total) * 100).toFixed(1) : 0;

                  return (
                    <div key={sess.id} className="past-session-card">
                      <div>
                        <div className="past-session-card-header">
                          <div>
                            <h4 className="past-session-card-title">
                              {sess.subjectCode} — {sess.subjectName || 'Course Paper'}
                            </h4>
                            <div className="past-session-card-cohort">
                              {sess.course || 'B.Tech'} {sess.branch || 'CSE'} ({sess.section || 'Section A'})
                            </div>
                          </div>
                          <span className={`activity-badge-pill ${actClass}`}>
                            {sess.activityType || 'Regular Class'}
                          </span>
                        </div>

                        {/* Special Activity Details Box */}
                        {sess.activityDetails && (
                          <div className="past-session-details-box">
                            <strong>Activity Details:</strong>
                            {sess.activityDetails}
                          </div>
                        )}

                        <div className="past-session-meta-row">
                          <span className="past-session-meta-item">
                            <Calendar size={13} /> {sess.date}
                          </span>
                          <span className="past-session-meta-item">
                            <Clock size={13} /> {sess.period || sess.classTime}
                          </span>
                        </div>

                        {sess.topicsCovered && (
                          <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.35 }}>
                            <strong>Agenda:</strong> {sess.topicsCovered}
                          </p>
                        )}

                        {/* Attendance Bar */}
                        <div className="past-session-stats-row">
                          <span style={{ color: '#16a34a' }}>
                            {pres} Present / {total} Total
                          </span>
                          <span style={{ color: '#2563eb' }}>
                            {pct}% Rate
                          </span>
                        </div>
                        <div className="past-session-progress-bar">
                          <div
                            className="past-session-progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="past-session-footer">
                        <span>Recorded by {sess.recordedBy || 'Faculty'}</span>
                        <button
                          type="button"
                          className="past-session-load-btn"
                          onClick={() => handleLoadPastSession(sess)}
                        >
                          <Eye size={13} /> View Roster
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. INTERACTIVE CLOCK-STYLE TIME PICKER MODAL ── */}
      {isTimePickerOpen && (
        <div className="attendance-modal-backdrop" onClick={() => setIsTimePickerOpen(false)}>
          <div className="attendance-modal-card clock-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="attendance-modal-header">
              <h3>
                <Clock size={18} color="#2563eb" /> Select Class {timePickerTarget === 'from' ? 'Start Time (From)' : 'End Time (To)'}
              </h3>
              <button
                type="button"
                className="attendance-modal-close"
                onClick={() => setIsTimePickerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="attendance-modal-body" style={{ textAlign: 'center' }}>
              {/* Digital Readout */}
              <div className="clock-digital-readout">
                <button
                  type="button"
                  className={`clock-unit-btn ${clockMode === 'hours' ? 'active' : ''}`}
                  onClick={() => setClockMode('hours')}
                  title="Switch to Hours selection"
                >
                  {draftHour < 10 ? `0${draftHour}` : draftHour}
                </button>
                <span className="clock-colon">:</span>
                <button
                  type="button"
                  className={`clock-unit-btn ${clockMode === 'minutes' ? 'active' : ''}`}
                  onClick={() => setClockMode('minutes')}
                  title="Switch to Minutes selection"
                >
                  {draftMinute < 10 ? `0${draftMinute}` : draftMinute}
                </button>
                <div className="clock-ampm-group">
                  <button
                    type="button"
                    className={`clock-ampm-btn ${draftAmPm === 'AM' ? 'active' : ''}`}
                    onClick={() => setDraftAmPm('AM')}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={`clock-ampm-btn ${draftAmPm === 'PM' ? 'active' : ''}`}
                    onClick={() => setDraftAmPm('PM')}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Radial Clock Face */}
              <div className="clock-dial-container">
                <ClockFace
                  mode={clockMode}
                  hour={draftHour}
                  minute={draftMinute}
                  onSelectHour={(h) => {
                    setDraftHour(h);
                    setClockMode('minutes'); // Auto advance to minutes
                  }}
                  onSelectMinute={(m) => setDraftMinute(m)}
                />
              </div>

              {/* Quick Minutes Chips */}
              <div className="clock-quick-chips">
                {[0, 15, 30, 45].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`clock-chip ${draftMinute === m ? 'active' : ''}`}
                    onClick={() => {
                      setDraftMinute(m);
                      setClockMode('minutes');
                    }}
                  >
                    :{m < 10 ? `0${m}` : m}
                  </button>
                ))}
              </div>
            </div>

            <div className="attendance-modal-footer">
              <button
                type="button"
                className="btn-clear-all"
                onClick={() => setIsTimePickerOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit-attendance"
                style={{ padding: '8px 20px', fontSize: '0.88rem' }}
                onClick={confirmTimePicker}
              >
                Confirm {timePickerTarget === 'from' ? 'From Time' : 'To Time'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. SUBMIT ATTENDANCE CONFIRMATION DIALOG ── */}
      {showConfirmModal && (
        <div className="attendance-modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="attendance-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="attendance-modal-header">
              <h3>
                <CheckCircle2 size={20} color="#2563eb" /> Confirm Attendance &amp; Academic Activity
              </h3>
              <button
                type="button"
                className="attendance-modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="attendance-modal-body">
              <p style={{ margin: '0 0 16px 0', fontSize: '0.92rem', color: '#475569' }}>
                Are you sure you want to submit the attendance for this session? Review the session details below:
              </p>

              <div className="final-meta-grid" style={{ marginBottom: '16px' }}>
                <div className="final-meta-item">
                  <span>Academic Activity</span>
                  <strong style={{ color: currentActivityConfig.color }}>
                    {activityType}
                  </strong>
                </div>
                <div className="final-meta-item">
                  <span>Subject</span>
                  <strong>{subjectCode} — {subjectName}</strong>
                </div>
                <div className="final-meta-item">
                  <span>Class Cohort</span>
                  <strong>{course} · {branch}</strong>
                </div>
                <div className="final-meta-item">
                  <span>Section &amp; Batch</span>
                  <strong>{section} ({batch})</strong>
                </div>
                <div className="final-meta-item">
                  <span>Date &amp; Time Slot</span>
                  <strong>{date} at {classTime}</strong>
                </div>
                <div className="final-meta-item">
                  <span>{activityType === 'Regular Class' ? 'Topics' : 'Session Agenda'}</span>
                  <strong style={{ fontSize: '0.84rem' }}>{topicsCovered || 'Syllabus Session'}</strong>
                </div>
                {activityType !== 'Regular Class' && activityDetails && (
                  <div className="final-meta-item" style={{ gridColumn: 'span 2' }}>
                    <span>Activity Details</span>
                    <strong style={{ fontSize: '0.84rem', color: currentActivityConfig.color }}>
                      {activityDetails}
                    </strong>
                  </div>
                )}
              </div>

              {/* Counts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>TOTAL</div>
                  <strong style={{ fontSize: '1.4rem', color: '#1e3a8a' }}>{totalStudents}</strong>
                </div>
                <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>PRESENT</div>
                  <strong style={{ fontSize: '1.4rem', color: '#15803d' }}>{presentCount}</strong>
                </div>
                <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b' }}>ABSENT</div>
                  <strong style={{ fontSize: '1.4rem', color: '#b91c1c' }}>{absentCount}</strong>
                </div>
              </div>

              {modelMetadata && (
                <div style={{ marginTop: '12px', padding: '8px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '0.82rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#059669" />
                  <span><strong>AI Model Verification Attached:</strong> {modelMetadata.modelName} ({modelMetadata.accuracyRate}% confidence)</span>
                </div>
              )}
            </div>

            <div className="attendance-modal-footer">
              <button
                type="button"
                className="btn-clear-all"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit-attendance"
                onClick={handleConfirmSubmit}
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. UPDATE ATTENDANCE CONFIRMATION DIALOG ── */}
      {showUpdateConfirmModal && (
        <div className="attendance-modal-backdrop" onClick={() => setShowUpdateConfirmModal(false)}>
          <div className="attendance-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="attendance-modal-header">
              <h3>
                <Edit3 size={20} color="#f59e0b" /> Confirm Attendance &amp; Activity Update
              </h3>
              <button
                type="button"
                className="attendance-modal-close"
                onClick={() => setShowUpdateConfirmModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="attendance-modal-body">
              <p style={{ margin: '0 0 16px 0', fontSize: '0.92rem', color: '#475569' }}>
                Save updated record for <strong>{subjectCode} · {course} {branch} ({section})</strong> [Activity: <strong>{activityType}</strong>]?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '14px' }}>
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>TOTAL</div>
                  <strong style={{ fontSize: '1.3rem', color: '#1e3a8a' }}>{totalStudents}</strong>
                </div>
                <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>NEW PRESENT</div>
                  <strong style={{ fontSize: '1.3rem', color: '#15803d' }}>{presentCount}</strong>
                </div>
                <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b' }}>NEW ABSENT</div>
                  <strong style={{ fontSize: '1.3rem', color: '#b91c1c' }}>{absentCount}</strong>
                </div>
              </div>
            </div>

            <div className="attendance-modal-footer">
              <button
                type="button"
                className="btn-clear-all"
                onClick={() => setShowUpdateConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit-attendance"
                style={{ background: '#16a34a' }}
                onClick={handleConfirmUpdate}
              >
                Confirm &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. EXACT FACENOX SMART CCTV ATTENDANCE MODEL HUB FROM REPO ── */}
      <SmartCctvHub
        isOpen={isFaceModelModalOpen}
        onClose={() => setIsFaceModelModalOpen(false)}
        userRole={role === 'hod' ? 'hod' : 'faculty'}
        initialTab={role === 'hod' ? 'hod' : 'faculty'}
        onApplyAttendance={(newAttendanceMap, auditDetails) => {
          handleApplyModelAttendance(newAttendanceMap, auditDetails);
          setIsFaceModelModalOpen(false);
        }}
      />
    </div>
  );

  if (isModal) {
    return (
      <div className="admin-modal-backdrop take-attendance-modal-backdrop" style={{ zIndex: 10000 }} onClick={onClose}>
        <div className="take-attendance-modal-card-window" onClick={(e) => e.stopPropagation()}>
          <div className="take-attendance-modal-header-bar">
            <div className="take-attendance-modal-title">
              <ClipboardCheck size={20} color="#2563eb" />
              <span>Record Class Attendance &amp; Academic Session Details</span>
            </div>
            <button
              type="button"
              className="take-attendance-modal-close-btn"
              onClick={onClose}
              aria-label="Close Attendance Modal"
            >
              <X size={20} />
            </button>
          </div>
          <div className="take-attendance-modal-scroll-body">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
}

// --------------------------------------------------------------------------
// Circular Clock Face Component
// --------------------------------------------------------------------------
function ClockFace({ mode, hour, minute, onSelectHour, onSelectMinute }) {
  const clockRef = useRef(null);
  const RADIUS = 92;
  const CENTER = 125;

  // Calculate angle for the hand
  const currentAngle = mode === 'hours'
    ? ((hour % 12) / 12) * 360
    : (minute / 60) * 360;

  const rad = (currentAngle - 90) * (Math.PI / 180);
  const handEndX = CENTER + RADIUS * Math.cos(rad);
  const handEndY = CENTER + RADIUS * Math.sin(rad);

  // Numbers to display
  const numbers = mode === 'hours'
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const handleDialClick = (e) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER;
    const y = e.clientY - rect.top - CENTER;
    let angleDeg = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angleDeg < 0) angleDeg += 360;

    if (mode === 'hours') {
      let h = Math.round(angleDeg / 30);
      if (h === 0) h = 12;
      onSelectHour(h);
    } else {
      let m = Math.round(angleDeg / 6);
      if (m === 60) m = 0;
      onSelectMinute(m);
    }
  };

  return (
    <div
      ref={clockRef}
      className="clock-face"
      onClick={handleDialClick}
    >
      {/* Center Pivot */}
      <div className="clock-center-dot" />

      {/* Hand Line & Tip Knob */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        <line
          x1={CENTER}
          y1={CENTER}
          x2={handEndX}
          y2={handEndY}
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <div
        className="clock-hand-knob"
        style={{
          left: `${handEndX}px`,
          top: `${handEndY}px`
        }}
      />

      {/* Radial Numbers */}
      {numbers.map((val) => {
        const itemAngle = mode === 'hours'
          ? ((val % 12) / 12) * 360
          : (val / 60) * 360;
        const itemRad = (itemAngle - 90) * (Math.PI / 180);
        const x = CENTER + RADIUS * Math.cos(itemRad);
        const y = CENTER + RADIUS * Math.sin(itemRad);
        const isSelected = mode === 'hours'
          ? (val === 12 ? (hour === 12 || hour === 0) : hour === val)
          : Math.abs(minute - val) <= 1;

        return (
          <div
            key={val}
            className={`clock-number-item ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${x}px`,
              top: `${y}px`
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (mode === 'hours') {
                onSelectHour(val);
              } else {
                onSelectMinute(val);
              }
            }}
          >
            {mode === 'minutes' && val < 10 ? `0${val}` : val}
          </div>
        );
      })}
    </div>
  );
}
