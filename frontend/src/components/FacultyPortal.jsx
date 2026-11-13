import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from './Navigation';
import {
  BookOpen, Users, GraduationCap, Layers, BarChart2, FileText,
  AlertCircle, CheckCircle2, ArrowRight, LogOut, Download,
  Calendar, Clock, Search, Sparkles, ClipboardList, Plus,
  Timer, X, ChevronDown, ShieldCheck, Eye, Flag, Trash2,
  MessageSquare, Menu, CheckSquare, Square, FileSpreadsheet,
  ArrowUpRight, HelpCircle, Send, Share2, HeartHandshake,
  BookOpenCheck, UserCheck, ClipboardCheck, Camera,
  ChevronRight, ChevronLeft, PartyPopper, MapPin, Megaphone,
  Check, CalendarDays, ShieldAlert, TrendingUp, TrendingDown, Settings as SettingsIcon, Bell, Home
} from 'lucide-react';
import CalendarWidget from './CalendarWidget.jsx';
import HolidayListWidget from './HolidayListWidget.jsx';
import TakeAttendanceModule from './Attendance/TakeAttendanceModule.jsx';
import './FacultyPortal.css';
import '../DashboardHome.css';
import '../components/AdminPortal.css';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import AwaitingVerificationSection from './CampusConnect/AwaitingVerificationSection.jsx';
import { downloadDepartmentGazettePdf } from '../utils/pdfGenerator';
import { generateAllStudents } from '../data/collegeData.js';
import { erpStore } from '../services/erpStore.js';
import { facultyApi } from '../services/facultyApi.js';
import { api } from '../services/api.js';
import MarksManagementModule from '../marks/MarksManagementModule.jsx';
import { notesApi } from '../services/notesApi.js';
import { getDocumentsForRole, getAllStudents, saveStudent } from '../services/studentStore.js';
import { useTimeGreeting, getGreetingDisplayName } from '../utils/timeGreeting.js';
import { isDemoAccount } from '../utils/authUtils.js';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import DigitalAnswerSheetEvaluationSystem from './DigitalEvaluation/DigitalAnswerSheetEvaluationSystem.jsx';
import TimetableManager from './TimetableManagement/TimetableManager.jsx';
import PublicTimetable from './PublicTimetable.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import FacultyClassSelector from './FacultyClassSelector.jsx';
import FacultyComplaintsModule from './FacultyComplaintsModule.jsx';
import FacultyNotificationsModule from './FacultyNotificationsModule.jsx';
import NotificationCenter from './Notifications/NotificationCenter.jsx';
import FacultyNoteSharingModule from './Notes/FacultyNoteSharingModule.jsx';
import DirectParentNoticeModal from './Common/DirectParentNoticeModal.jsx';
import Student360DossierModal from './Common/Student360DossierModal.jsx';
import OfficialEmployeeProfile from './Profile/OfficialEmployeeProfile.jsx';
import { getStudentComprehensiveDetails, dispatchParentNotice } from '../services/parentNoticeService.js';

// CSV Export Helper
function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const holidays = [
  [
    '14-01-2026',
    'Makar Sankranti'
  ],
  [
    '23-01-2026',
    'Netaji Subas Bose Jayanti/ Saraswati Puja'
  ],
  [
    '26-01-2026',
    'Republic Day'
  ],
  [
    '03-03-2026',
    'Dola Purnami'
  ],
  [
    '04-03-2026',
    'Holi'
  ],
  [
    '21-03-2026',
    'Eid-Ul Fitar'
  ],
  [
    '27-03-2026',
    'Ram Navami'
  ],
  [
    '01-04-2026',
    'Utkal Divas'
  ],
  [
    '03-04-2026',
    'Good Friday'
  ],
  [
    '14-04-2026',
    'Maha Vishubha Sankranti'
  ],
  [
    '16-05-2026',
    'Sabitri Amavasya'
  ],
  [
    '28-05-2026',
    'Eid-Ul Zuha'
  ],
  [
    '15-06-2026',
    'Raja Sankrati'
  ],
  [
    '26-06-2026',
    'Muharram'
  ],
  [
    '16-07-2026',
    'Ratha Yatra'
  ],
  [
    '15-08-2026',
    'Independence Day'
  ],
  [
    '26-08-2026',
    'Prophet Muhammad Birthday'
  ],
  [
    '27-08-2026',
    'Jhulana Purnami'
  ],
  [
    '04-09-2026',
    'Janmastami'
  ],
  [
    '14-09-2026',
    'Ganesh Puja'
  ],
  [
    '15-09-2026',
    'Nuakhai'
  ],
  [
    '16-09-2026',
    'Day Following Nuakhai'
  ],
  [
    '02-10-2026',
    'Gandhi Jayanti'
  ],
  [
    '10-10-2026',
    'Mahalaya'
  ],
  [
    '17-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '18-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '19-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '20-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '21-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '22-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '23-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '24-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '09-11-2026',
    'Prathamastami'
  ],
  [
    '24-11-2026',
    'Rahasa Purnima'
  ],
  [
    '25-12-2026',
    'Christmas'
  ]
];

function createCalendarDays(month, today) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return {
      key,
      day: date.getDate(),
      inMonth: date.getMonth() === month.getMonth(),
      isToday: date.toDateString() === today.toDateString(),
      isSunday: date.getDay() === 0,
    };
  });
}

function DetailRow({ label, value }) {
  return <div className="student-detail-row"><dt>{label}</dt><dd>{value}</dd></div>;
}

export default function FacultyPortal({ account, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [facultyNotifMode, setFacultyNotifMode] = useState('board'); // 'board' or 'broadcast'
  const [selectedSubject, setSelectedSubject] = useState('Data Structures');
  const [allStudents, setAllStudents] = useState(() => getAllStudents());
  const [studentSearch, setStudentSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL'); // ALL, SHORTAGE, GOOD, HIGH
  const [riskFilter, setRiskFilter] = useState('ALL'); // ALL, AT_RISK

  // Live clock, hero time greeting, and calendar state
  const [today] = useState(() => new Date());
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeGreeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      return {
        wish: 'Good morning',
        emoji: '',
        period: 'Morning',
        caption: 'Rise and shine! Have an inspiring, energetic, and productive academic day ahead.',
        motd: 'Morning lectures commence at 09:00 AM. Check your class timetable for room assignments.',
        themeClass: 'dash-hero-morning',
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        wish: 'Good afternoon',
        emoji: '',
        period: 'Afternoon',
        caption: 'Keep up the strong teaching momentum in your afternoon lectures, lab practicals, and assessments.',
        motd: 'Computing lab facilities and evaluation center remain open till 06:00 PM.',
        themeClass: 'dash-hero-afternoon',
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        wish: 'Good evening',
        emoji: '',
        period: 'Evening',
        caption: 'Review today’s lecture coverage, verify attendance entries, and enjoy your evening.',
        motd: 'Continuous assessment evaluation marks entry deadline is active.',
        themeClass: 'dash-hero-evening',
      };
    }
    return {
      wish: 'Good night',
      emoji: '',
      period: 'Night',
      caption: 'Rest well tonight and recharge your energy for tomorrow’s classes.',
      motd: 'Campus quiet hours are in effect. Ensure evaluation grades are saved.',
      themeClass: 'dash-hero-night',
    };
  }, [currentTime]);

  const formattedLiveTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentTime]);

  const todayLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric',
  }).format(today);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthLabel = new Intl.DateTimeFormat('en-IN', {
    month: 'long', year: 'numeric',
  }).format(currentMonth);

  const [holidayView, setHolidayView] = useState('all');

  const calendarDays = useMemo(() => createCalendarDays(currentMonth, today), [currentMonth, today]);

  const holidayItems = useMemo(() => {
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return holidays.map(([raw, name]) => {
      const [d, m, y] = raw.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const daysLeft = Math.round((date - startOfToday) / 86400000);
      return { raw, name, date, daysLeft, key: `${y}-${m - 1}-${d}` };
    });
  }, [today]);

  const displayedHolidays = useMemo(() => {
    if (holidayView === 'upcoming') {
      return holidayItems.filter((h) => h.daysLeft >= 0);
    }
    return holidayItems;
  }, [holidayView, holidayItems]);

  const holidayMap = useMemo(() => Object.fromEntries(holidayItems.map((h) => [h.key, h.name])), [holidayItems]);
  const nextHoliday = useMemo(() => holidayItems.find((h) => h.daysLeft >= 0), [holidayItems]);

  function updateMonth(direction) {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + direction, 1));
  }

  const facultyPhoto = useMemo(() => {
    if (account?.photo && !account.photo.includes('female')) return account.photo;
    return '/passport_photo_male.svg';
  }, [account]);

  const todayTeachingSchedule = useMemo(() => [
    {
      id: 'sched-1',
      period: 'Period 1 (09:00 - 10:00 AM)',
      time: '09:00 AM',
      subjectCode: 'CS501',
      subjectName: 'Data Structures (Theory)',
      section: 'Section A',
      semester: 'Semester 5',
      room: 'Block B - 302',
      status: 'Completed',
      attendanceLogged: true,
      stats: '30/32 Present · 93.8%',
    },
    {
      id: 'sched-2',
      period: 'Period 3 (11:15 - 12:15 PM)',
      time: '11:15 AM',
      subjectCode: 'CS502',
      subjectName: 'Operating Systems (Theory)',
      section: 'Section A',
      semester: 'Semester 5',
      room: 'Block B - 304',
      status: 'Next Session',
      topic: 'Virtual Memory & Inverted Page Tables',
      attendanceLogged: false,
      isNext: true,
    },
    {
      id: 'sched-3',
      period: 'Period 5 & 6 (02:00 - 04:00 PM)',
      time: '02:00 PM',
      subjectCode: 'CS501',
      subjectName: 'Data Structures Lab (Practical)',
      section: 'Section A (Batch A1: 16 Students)',
      semester: 'Semester 5',
      room: 'Computing Lab 3',
      status: 'Lab Practical',
      topic: 'Lab Work Assessment 4',
      attendanceLogged: false,
    },
  ], []);

  const nextClass = useMemo(() => {
    return todayTeachingSchedule.find(s => s.isNext) || todayTeachingSchedule[0];
  }, [todayTeachingSchedule]);

  // Interactive Modals State
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null); // subject obj + modal active tab
  const [selectedStudentModal, setSelectedStudentModal] = useState(null); // student obj + modal active tab
  const [parentNoticeModalStudent, setParentNoticeModalStudent] = useState(null);
  const [dossierModalStudent, setDossierModalStudent] = useState(null);
  const [facultyAlertFilter, setFacultyAlertFilter] = useState('ALL'); // ALL, CRITICAL_ATTENDANCE, HIGH_FEES, DUAL_CRITICAL, SHORTAGE
  const [remedialActionModal, setRemedialActionModal] = useState(null); // student obj
  const [remedialForm, setRemedialForm] = useState({
    type: 'Extra Tutorial',
    notes: 'Scheduled special weekend problem-solving tutorial for Data Structures.',
    followUpDate: '2026-10-16'
  });

  // Work Queue filter
  const [workQueueFilter, setWorkQueueFilter] = useState('ALL'); // ALL, CRITICAL, HIGH, MEDIUM

  // Performance drilldown filter
  const [performanceDrilldownFilter, setPerformanceDrilldownFilter] = useState('ALL');

  // Attendance History
  const [attendanceHistory, setAttendanceHistory] = useState([
    {
      id: 'att-sess-1',
      date: '2026-10-09',
      period: 'Period 1 (09:00 - 10:00 AM)',
      subjectCode: 'CS501',
      section: 'Section A',
      totalEnrolled: 32,
      presentCount: 30,
      absentCount: 2,
      percentage: 93.8,
      status: 'Finalized',
      recordedBy: 'Dr. S. Mohanty'
    },
    {
      id: 'att-sess-2',
      date: '2026-10-08',
      period: 'Period 2 (10:00 - 11:00 AM)',
      subjectCode: 'CS501',
      section: 'Section A',
      totalEnrolled: 32,
      presentCount: 29,
      absentCount: 3,
      percentage: 90.6,
      status: 'Finalized',
      recordedBy: 'Dr. S. Mohanty'
    }
  ]);

  // Faculty Assigned Classes & Subject Scoping
  const [backendAssignments, setBackendAssignments] = useState(null);
  const [backendScopedStudents, setBackendScopedStudents] = useState(null);

  // Sync real assignments from backend API
  useEffect(() => {
    let active = true;
    api.getFacultyAssignments()
      .then((res) => {
        if (active && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setBackendAssignments(res.data);
        }
      })
      .catch((err) => {
        console.warn('Faculty assignments backend sync notice:', err?.message);
      });
    return () => { active = false; };
  }, [account]);

  const isDemo = isDemoAccount(account);

  const facultyAssignments = useMemo(() => {
    if (backendAssignments && Array.isArray(backendAssignments) && backendAssignments.length > 0) {
      return backendAssignments;
    }
    if (isDemo) {
      return erpStore.getFacultyAssignedClasses('Dr. S. Mohanty');
    }
    return [];
  }, [backendAssignments, account, isDemo]);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(() => {
    if (isDemo) {
      const list = erpStore.getFacultyAssignedClasses('Dr. S. Mohanty');
      return list[0]?.id || 'fa-1';
    }
    return '';
  });

  const currentAssignment = useMemo(() => {
    if (facultyAssignments.length > 0) {
      return facultyAssignments.find(fa => fa.id === selectedAssignmentId) || facultyAssignments[0];
    }
    return isDemo ? {
      program: 'B.Tech',
      assignedCourse: 'B.Tech',
      deptCode: 'CSE',
      assignedBranch: 'CSE',
      semester: 'Semester 5',
      assignedSemester: 'Semester 5',
      section: 'Section A',
      assignedSection: 'Section A',
      subjectName: 'Data Structures & Algorithms',
      assignedSubject: 'CS501 - Data Structures & Algorithms',
      subjectCode: 'CS501',
      room: 'Block B - 302',
      totalEnrolledStudents: 32,
      todayScheduledClasses: '10:00 AM – 11:00 AM (Room B-302)'
    } : null;
  }, [facultyAssignments, selectedAssignmentId, isDemo]);

  const [isConsolidatedScope, setIsConsolidatedScope] = useState(false);

  // Automatically fetch enrolled student roster from backend when subject/section changes
  useEffect(() => {
    let active = true;
    if (!currentAssignment?.semester || !currentAssignment?.section) return;

    api.getFacultyScopedStudents({
      academicYear: currentAssignment.academicYear || '2026-27',
      semester: currentAssignment.semester,
      section: currentAssignment.section,
      subjectCode: currentAssignment.subjectCode,
      isConsolidated: isConsolidatedScope
    })
      .then((res) => {
        if (active && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setBackendScopedStudents(res.data);
        }
      })
      .catch((err) => {
        console.warn('Faculty scoped students live sync note:', err?.message);
      });
    return () => { active = false; };
  }, [currentAssignment?.semester, currentAssignment?.section, currentAssignment?.subjectCode, isConsolidatedScope]);

  const [facultyLeaveBalance, setFacultyLeaveBalance] = useState({ cl: 8, el: 15, ml: 10 });
  const [facultyLeavesList, setFacultyLeavesList] = useState([
    { id: 'FL-2026-01', type: 'Casual Leave (CL)', from: '12 Oct 2026', to: '13 Oct 2026', days: 2, reason: 'Family Function / Personal', status: 'Approved', approvedBy: 'Dr. P. K. Pattnaik (HOD)' },
    { id: 'FL-2026-02', type: 'Duty Leave (DL)', from: '02 Sep 2026', to: '04 Sep 2026', days: 3, reason: 'IEEE International Conference Presentation', status: 'Approved', approvedBy: 'Principal' }
  ]);
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [applyLeaveForm, setApplyLeaveForm] = useState({
    type: 'Casual Leave (CL)',
    fromDate: '',
    toDate: '',
    reason: '',
    substituteFaculty: 'Dr. Debabrata Singh (CSE)'
  });


  // Scoped strictly to the faculty's assigned class cohort or consolidated across assigned classes
  const scopedStudents = useMemo(() => {
    if (backendScopedStudents && Array.isArray(backendScopedStudents) && backendScopedStudents.length > 0) {
      return backendScopedStudents;
    }

    if (isConsolidatedScope) {
      const matching = allStudents.filter(s => {
        return facultyAssignments.some(fa => {
          const semMatch = (s.semester || '').toLowerCase() === fa.semester.toLowerCase();
          const secLetter = fa.section.replace('Section ', '').trim().toUpperCase();
          const studentSecLetter = (s.section || '').replace('Section ', '').trim().toUpperCase();
          const secMatch = studentSecLetter === secLetter;
          const yrMatch = !fa.academicYear || s.academicYear === fa.academicYear;
          return semMatch && secMatch && yrMatch;
        });
      });
      // Deduplicate by student id or rollNumber
      const seen = new Set();
      return matching.filter(s => {
        const key = s.id || s.studentId || s.rollNumber;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const sem = currentAssignment.semester || 'Semester 5';
    const secLetter = (currentAssignment.section || 'Section A').replace('Section ', '').trim().toUpperCase();
    const yr = currentAssignment.academicYear || '2026-27';

    return allStudents.filter(s => {
      const semMatch = (s.semester || '').toLowerCase() === sem.toLowerCase();
      const studentSecLetter = (s.section || '').replace('Section ', '').trim().toUpperCase();
      const secMatch = studentSecLetter === secLetter;
      const yrMatch = !s.academicYear || s.academicYear === yr;
      return semMatch && secMatch && yrMatch;
    });
  }, [backendScopedStudents, allStudents, facultyAssignments, currentAssignment, isConsolidatedScope]);

  const atRiskStudents = useMemo(() => {
    return scopedStudents.filter(s => erpStore.calculateStudentRisk(s).isAtRisk);
  }, [scopedStudents]);

  // Daily Attendance Session State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [openModelOnAttendanceModal, setOpenModelOnAttendanceModal] = useState(false);
  const [activeAttendanceTarget, setActiveAttendanceTarget] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendancePeriod, setAttendancePeriod] = useState('Period 2 (10:00 - 11:00 AM)');
  const [attendanceMap, setAttendanceMap] = useState({});

  // Class Notes Moderation State
  const [moderationNotesList, setModerationNotesList] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [viewingNote, setViewingNote] = useState(null);

  // Documents
  const [campusDocs, setCampusDocs] = useState(() => getDocumentsForRole('faculty'));
  const [docsSearch, setDocsSearch] = useState('');
  const [docsViewMode, setDocsViewMode] = useState('student_docs');

  useEffect(() => {
    const handleDocsChange = () => setCampusDocs(getDocumentsForRole('faculty'));
    const handleStudentsChange = () => setAllStudents(getAllStudents());
    window.addEventListener('cms_documents_changed', handleDocsChange);
    window.addEventListener('cms_student_documents_changed', handleDocsChange);
    window.addEventListener('cms_students_changed', handleStudentsChange);
    return () => {
      window.removeEventListener('cms_documents_changed', handleDocsChange);
      window.removeEventListener('cms_student_documents_changed', handleDocsChange);
      window.removeEventListener('cms_students_changed', handleStudentsChange);
    };
  }, []);


  // ── QUIZ MANAGEMENT STATE ──────────────────────────────────────────────────
  const makeBlankQuestions = () =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      question: '',
      options: ['', '', '', ''],
      correct: 0,
    }));

  const [quizList, setQuizList] = useState([]);
  const [quizLoadError, setQuizLoadError] = useState('');

  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [viewQuiz, setViewQuiz] = useState(null);
  const [quizStep, setQuizStep] = useState(1); // 1=meta, 2=questions
  const [quizMeta, setQuizMeta] = useState({
    title: '', subject: 'Data Structures', section: 'Section A',
    date: '', time: 30, totalMarks: 10, status: 'Draft'
  });
  const [quizQuestions, setQuizQuestions] = useState(() => makeBlankQuestions());
  const [quizFormError, setQuizFormError] = useState('');

  const updateQuestion = (idx, field, value) => {
    setQuizQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };
  const updateOption = (qIdx, oIdx, value) => {
    setQuizQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options]; opts[oIdx] = value;
      return { ...q, options: opts };
    }));
  };
  const handleAddQuizSubmit = async () => {
    if (!quizMeta.title.trim()) { setQuizFormError('Quiz title is required.'); return; }
    if (!quizMeta.date) { setQuizFormError('Please set the quiz date.'); return; }
    const incomplete = quizQuestions.findIndex(q => !q.question.trim() || q.options.some(o => !o.trim()));
    if (incomplete !== -1) { setQuizFormError(`Question ${incomplete + 1} is incomplete. Fill all options.`); return; }
    const subjectAssignment = facultyAssignments.find((assignment) =>
      assignment.subjectName?.toLowerCase() === quizMeta.subject.toLowerCase(),
    );
    const newQuiz = {
      ...quizMeta,
      subjectCode: subjectAssignment?.subjectCode || currentAssignment.subjectCode || 'CS501',
      semester: subjectAssignment?.semester || currentAssignment.semester || 'Semester 5',
      attempts: 0,
      createdAt: new Date().toISOString().split('T')[0],
      questions: quizQuestions.map((q, i) => ({ ...q, id: i + 1 }))
    };
    try {
      const response = await api.createFacultyQuiz(newQuiz);
      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'The quiz was not saved.');
      }
      setQuizList((previous) => [response.data, ...previous.filter((quiz) => quiz.id !== response.data.id)]);
      triggerToast('Quiz saved to the backend.');
      setQuizLoadError('');
    } catch (error) {
      setQuizFormError(error.message || 'Could not save this quiz.');
      return;
    }
    setShowAddQuiz(false);
    setQuizStep(1);
    setQuizMeta({ title:'', subject:'Data Structures', section:'Section A', date:'', time:30, totalMarks:10, status:'Draft' });
    setQuizQuestions(makeBlankQuestions());
    setQuizFormError('');
  };

  useEffect(() => {
    let active = true;
    api.getFacultyQuizzes()
      .then((response) => {
        if (!response?.success || !Array.isArray(response.data)) {
          throw new Error(response?.message || 'The quiz list response was invalid.');
        }
        if (active) {
          setQuizList(response.data);
          setQuizLoadError('');
        }
      })
      .catch((error) => {
        if (active) setQuizLoadError(error.message || 'Could not load faculty quizzes.');
      });
    return () => {
      active = false;
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  React.useEffect(() => {
    loadModerationNotes();
  }, []);

  const loadModerationNotes = async () => {
    try {
      const list = await notesApi.getPendingPeerNotes();
      setModerationNotesList(list.map((note) => ({
        ...note,
        date: note.lectureDate,
        fileUrl: note.fileData,
        uploadedBy: {
          name: note.student?.name,
          rollNumber: note.student?.rollNumber,
        },
        reports: [],
        isFacultyVerified: false,
      })));
    } catch (error) {
      triggerToast(error.message || 'Could not load student notes for review.');
    }
  };

  const handleVerifyNote = async (id) => {
    try {
      const res = await notesApi.reviewPeerNote(id, 'VERIFIED');
      if (!res?.success) throw new Error(res?.message || 'Could not approve this note.');
      triggerToast('Class note verified and published to students.');
      await loadModerationNotes();
    } catch (error) {
      triggerToast(error.message || 'Could not approve this note.');
    }
  };

  const handleHideNote = async (id) => {
    try {
      const res = await notesApi.reviewPeerNote(id, 'REJECTED');
      if (!res?.success) throw new Error(res?.message || 'Could not reject this note.');
      triggerToast('Class note rejected.');
      await loadModerationNotes();
    } catch (error) {
      triggerToast(error.message || 'Could not reject this note.');
    }
  };


  const assignedSubjects = [
    {
      code: 'CS501',
      name: 'Data Structures',
      studentsCount: 91,
      cohort: 'Semester 5 - Section A',
      completion: 82,
      pendingAssessments: 2,
      status: 'In Progress',
      lastUpdated: 'Today, 04:30 PM'
    },
    {
      code: 'CS502',
      name: 'Operating Systems',
      studentsCount: 91,
      cohort: 'Semester 5 - Section A',
      completion: 100,
      pendingAssessments: 0,
      status: 'Finalized · Awaiting HOD',
      lastUpdated: 'Yesterday, 06:10 PM'
    }
  ];

  const workQueueItems = useMemo(() => {
    const list = [
      {
        id: 'wq-1',
        title: 'Review and verify Quiz 3 & 4 Continuous Evaluation marks',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        deadline: '12 Oct 2026',
        priority: 'CRITICAL',
        status: 'Action Required',
        nextAction: 'Enter missing marks for 4 borderline candidates',
        linkTab: 'marks'
      },
      {
        id: 'wq-2',
        title: 'Log Period 2 Attendance for Operating Systems',
        subjectCode: 'CS502',
        subjectName: 'Operating Systems',
        cohort: 'Semester 5 · Section A',
        deadline: 'Today, 04:00 PM',
        priority: 'HIGH',
        status: 'Pending Submission',
        nextAction: 'Record student attendance and log period',
        linkTab: 'students'
      },
      {
        id: 'wq-3',
        title: 'Moderate student-uploaded notes for "AVL Trees & Self Balancing"',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5',
        deadline: '14 Oct 2026',
        priority: 'MEDIUM',
        status: 'Awaiting Review',
        nextAction: 'Check academic syllabus accuracy and approve',
        linkTab: 'notes-moderation'
      },
      {
        id: 'wq-4',
        title: 'Verify student learning resource: "Paging & Memory Virtualization"',
        subjectCode: 'CS502',
        subjectName: 'Operating Systems',
        cohort: 'Semester 5',
        deadline: '15 Oct 2026',
        priority: 'MEDIUM',
        status: 'Pending Verification',
        nextAction: 'Verify document validity and publish to repository',
        linkTab: 'awaiting-verification'
      },
      {
        id: 'wq-5',
        title: 'Submit Data Structures CIA register to HOD for moderation lock',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        deadline: '18 Oct 2026',
        priority: 'HIGH',
        status: 'Draft Ready',
        nextAction: 'Perform final validation check and submit to HOD',
        linkTab: 'marks'
      }
    ];

    if (workQueueFilter === 'ALL') return list;
    return list.filter(item => item.priority === workQueueFilter);
  }, [workQueueFilter]);

  // Parent Alert metric counts across scoped faculty students
  const critAttCount = useMemo(() => {
    return scopedStudents.filter(s => getStudentComprehensiveDetails(s).isCriticalShortage).length;
  }, [scopedStudents]);

  const highFeesCount = useMemo(() => {
    return scopedStudents.filter(s => getStudentComprehensiveDetails(s).fees?.hasHighDues).length;
  }, [scopedStudents]);

  const dualCritCount = useMemo(() => {
    return scopedStudents.filter(s => {
      const d = getStudentComprehensiveDetails(s);
      return d.isCriticalShortage && d.fees?.hasHighDues;
    }).length;
  }, [scopedStudents]);

  const shortageCount = useMemo(() => {
    return scopedStudents.filter(s => getStudentComprehensiveDetails(s).isShortage).length;
  }, [scopedStudents]);

  const filteredStudents = useMemo(() => {
    return scopedStudents.filter(s => {
      const details = getStudentComprehensiveDetails(s);

      // Alert Filter Pill filtering
      if (facultyAlertFilter === 'CRITICAL_ATTENDANCE' && !details.isCriticalShortage) return false;
      if (facultyAlertFilter === 'HIGH_FEES' && !details.fees?.hasHighDues) return false;
      if (facultyAlertFilter === 'DUAL_CRITICAL' && !(details.isCriticalShortage && details.fees?.hasHighDues)) return false;
      if (facultyAlertFilter === 'SHORTAGE' && !details.isShortage) return false;

      const matchSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNumber.includes(studentSearch) ||
        (s.registrationNumber && s.registrationNumber.includes(studentSearch)) ||
        (details.parent?.phone && details.parent.phone.includes(studentSearch));
      if (!matchSearch) return false;

      const att = details.attendance;
      if (attendanceFilter === 'SHORTAGE' && att >= 75) return false;
      if (attendanceFilter === 'GOOD' && (att < 75 || att > 85)) return false;
      if (attendanceFilter === 'HIGH' && att <= 85) return false;

      if (riskFilter === 'AT_RISK') {
        const risk = erpStore.calculateStudentRisk(s);
        if (!risk.isAtRisk) return false;
      }

      return true;
    });
  }, [scopedStudents, studentSearch, attendanceFilter, riskFilter, facultyAlertFilter]);

  const handleOpenAttendanceModal = (targetAssignment, openModel = false) => {
    if (targetAssignment?.id) {
      setSelectedAssignmentId(targetAssignment.id);
      setActiveAttendanceTarget(targetAssignment);
    } else if (targetAssignment) {
      setActiveAttendanceTarget(targetAssignment);
    } else {
      setActiveAttendanceTarget(currentAssignment || facultyAssignments[0] || null);
    }
    const initialMap = {};
    scopedStudents.forEach(s => {
      initialMap[s.rollNumber] = true; // default present
    });
    setAttendanceMap(initialMap);
    setOpenModelOnAttendanceModal(Boolean(openModel));
    setIsAttendanceModalOpen(true);
  };

  const handleToggleAttendance = (roll) => {
    setAttendanceMap(prev => ({
      ...prev,
      [roll]: !prev[roll]
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    scopedStudents.forEach(s => { updated[s.rollNumber] = true; });
    setAttendanceMap(updated);
  };

  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    const presentCount = Object.values(attendanceMap).filter(Boolean).length;
    const totalCount = scopedStudents.length;
    const pct = totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(1)) : 100;

    // Update students cumulative attendance records in store
    const updatedStudents = allStudents.map(st => {
      if (attendanceMap[st.rollNumber] !== undefined) {
        const isPresent = !!attendanceMap[st.rollNumber];
        const prevAtt = Number(st.attendance) || 85;
        const newAtt = isPresent ? Math.min(100, Math.round(prevAtt * 0.98 + 2)) : Math.max(30, Math.round(prevAtt * 0.96));
        const updated = { ...st, attendance: newAtt };
        try { saveStudent(updated); } catch {}
        return updated;
      }
      return st;
    });
    setAllStudents(updatedStudents);

    // Add session to history
    const newSession = {
      id: `att-sess-${Date.now()}`,
      date: attendanceDate,
      period: attendancePeriod,
      subjectCode: currentAssignment.subjectCode,
      section: currentAssignment.section,
      totalEnrolled: totalCount,
      presentCount,
      absentCount: totalCount - presentCount,
      percentage: pct,
      status: 'Finalized',
      recordedBy: account?.name || 'Dr. S. Mohanty'
    };
    setAttendanceHistory(prev => [newSession, ...prev]);

    // Send to backend API
    facultyApi.submitAttendanceSession({
      subjectCode: currentAssignment.subjectCode,
      subjectName: currentAssignment.subjectName,
      course: currentAssignment.assignedCourse || currentAssignment.course || 'Bachelor of Technology',
      branch: currentAssignment.assignedBranch || currentAssignment.branch || 'CSE',
      batch: currentAssignment.batch || '2023–2027',
      academicSession: currentAssignment.assignedAcademicSession || '2026-27',
      section: currentAssignment.section,
      date: attendanceDate,
      period: attendancePeriod,
      attendanceMap,
      facultyName: account?.name || 'Dr. S. Mohanty'
    });

    // Log the attendance event in ERP central audit store
    erpStore.logAuditEvent({
      user: account?.name || currentAssignment.facultyName,
      role: 'FACULTY',
      action: 'Recorded Subject Period Attendance',
      target: `${currentAssignment.subjectName} (${currentAssignment.subjectCode}) · ${currentAssignment.semester} ${currentAssignment.section}`,
      oldValue: 'Unrecorded Period',
      newValue: `${presentCount} Present / ${totalCount} Enrolled (${attendanceDate})`,
    });

    setIsAttendanceModalOpen(false);
    triggerToast(`✓ Attendance submitted: ${presentCount}/${totalCount} students present (${pct}%) for ${currentAssignment.subjectCode}!`);
  };


  const facultyNavSections = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Faculty Dashboard', icon: Layers },
      ]
    },
    {
      title: 'TEACHING & CLASSES',
      items: [
        { id: 'take-attendance', label: 'Take Attendance', icon: ClipboardCheck },
        { id: 'timetable', label: 'My Timetable', icon: Calendar },
        { id: 'subjects', label: 'My Subjects', icon: BookOpen },
        { id: 'students', label: `My Students (${scopedStudents.length || 150})`, icon: GraduationCap },
      ]
    },
    {
      title: 'ASSESSMENT',
      items: [
        { id: 'marks', label: 'Marks Management', icon: BarChart2 },
        { id: 'digital-evaluation', label: 'Answer Sheet Evaluation', icon: FileText },
        { id: 'assignments', label: 'Assignment Management', icon: FileSpreadsheet, badge: 'CIA' },
        { id: 'quiz', label: 'Quiz Management', icon: ClipboardList },
        { id: 'performance', label: 'Class Performance', icon: Sparkles },
        { id: 'reports', label: 'Grade Reports', icon: FileText },
        { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
      ]
    },
    {
      title: 'ACADEMIC RESOURCES',
      items: [
        { id: 'note-sharing', label: 'Notes & Study Materials', icon: FileText, badge: 'Active' },
        { id: 'awaiting-verification', label: 'Resources Awaiting Verification', icon: ShieldCheck, badge: atRiskStudents.length > 0 ? atRiskStudents.length : null },
        { id: 'notes-moderation', label: 'Notes Moderation', icon: ShieldCheck },
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { id: 'campus-connect', label: 'Campus Connect (WhatsApp)', icon: MessageSquare, badge: 'Live' },
        { id: 'complaints', label: 'Student Grievances', icon: ShieldAlert },
        { id: 'notifications', label: 'Notifications & Announcements', icon: Megaphone },
        { id: 'documents', label: 'Official Documents', icon: Download, badge: campusDocs.length || 3 },
      ]
    },
    {
      title: 'PERSONAL',
      items: [
        { id: 'profile', label: 'Faculty Official Profile', icon: UserCheck },
        { id: 'leave-management', label: 'Leave Management', icon: CalendarDays },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
        { id: 'help-support', label: 'Help & Support', icon: HelpCircle },
      ]
    }
  ];

  const getFacultyHeading = () => {
    switch (activeTab) {
      case 'profile':
        return {
          title: 'Faculty Official CMS Profile',
          subtitle: 'Comprehensive autonomous faculty service book, credentials dossier, and administrative profile.',
          breadcrumbs: [
            { label: 'Campus Home', tab: 'dashboard' },
            { label: 'Personal', tab: 'profile' },
            { label: 'Official Profile', active: true }
          ]
        };
      case 'assignments':
        return {
          title: 'Assignment Management & Continuous Evaluation',
          subtitle: 'Track student assignment submissions, download attachments, and award Continuous Internal Evaluation (CIA) marks.',
          breadcrumbs: [
            { label: 'Campus Home', tab: 'dashboard' },
            { label: 'Assessment', tab: 'assignments' },
            { label: 'Assignment Management', active: true }
          ]
        };
      case 'leave-management':
        return {
          title: 'Faculty Leave Management',
          subtitle: 'Review Casual, Earned, and Medical leave quotas, view past leaves, and submit leave requests to HOD & Dean.',
          breadcrumbs: [
            { label: 'Campus Home', tab: 'dashboard' },
            { label: 'Personal', tab: 'leave-management' },
            { label: 'Leave Management', active: true }
          ]
        };
      case 'settings':
        return {
          title: 'Faculty Academic & Profile Settings',
          subtitle: 'Configure consultation hours, office location, notifications, and grading preferences.',
          breadcrumbs: [
            { label: 'Campus Home', tab: 'dashboard' },
            { label: 'Personal', tab: 'settings' },
            { label: 'Settings', active: true }
          ]
        };
      case 'help-support':
        return {
          title: 'Faculty ERP Knowledge & IT Support Desk',
          subtitle: 'Direct support from Autonomous Examination Cell, ERP System Engineers, and Academic Guidelines.',
          breadcrumbs: [
            { label: 'Campus Home', tab: 'dashboard' },
            { label: 'Personal', tab: 'help-support' },
            { label: 'Help & Support', active: true }
          ]
        };

      case 'note-sharing':
        return {
          title: 'Faculty Study Material & Note Sharing',
          subtitle: 'Upload, manage, and distribute lecture notes, syllabus materials, question papers, and presentations to students.'
        };
      case 'dashboard':
        return {
          title: `Welcome, ${getGreetingDisplayName(account?.name || 'Professor')}`,
          subtitle: `Faculty Portal · ${account?.deptCode || 'CSE'} Department · Academic Session 2026`
        };
      case 'take-attendance':
        return {
          title: 'Daily Class Attendance Register',
          subtitle: 'Mark attendance for assigned sections with real-time biometric and ERP sync.'
        };
      case 'digital-evaluation':
        return {
          title: 'Autonomous Digital Answer Sheet Evaluation',
          subtitle: 'Secure on-screen marking with rubric scoring, step marking, and live audit.'
        };
      case 'marks':
        return {
          title: 'Continuous Assessment & Internal Marks',
          subtitle: 'Record and submit internal exam, lab, and assignment scores.'
        };
      case 'timetable':
        return {
          title: 'Faculty Teaching Timetable',
          subtitle: 'Weekly lecture schedule, lab sessions, and classroom allocations.'
        };
      default:
        return {
          title: (activeTab || 'Faculty Portal').replace(/-/g, ' ').toUpperCase(),
          subtitle: `Faculty Teaching Operations · ${account?.deptCode || 'Engineering'}`
        };
    }
  };

  const facultyHeading = getFacultyHeading();
  return (
    <>
      {/* Standard Universal AppLayout */}
      <AppLayout
        account={account}
        portalName="Faculty Portal"
        portalSubtitle={`${account?.deptCode || 'Academic'} Department · Faculty`}
        portalHomeTab="dashboard"
        navSections={facultyNavSections}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        pageTitle={facultyHeading.title}
        pageSubtitle={facultyHeading.subtitle}
      >
        <div className="faculty-portal-content-wrap">
          {/* NOTE SHARING & STUDY MATERIALS TAB */}
          {activeTab === 'note-sharing' && (
            <div style={{ marginBottom: '24px' }}>
              <FacultyNoteSharingModule account={account} />
            </div>
          )}

          {/* STUDENT COMPLAINTS TAB */}
          {activeTab === 'complaints' && (
            <div style={{ marginBottom: '24px' }}>
              <FacultyComplaintsModule account={account} />
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} style={{ color: '#4f46e5' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                      Faculty Notice Board & Institutional Bulletins
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                      Official campus circulars, departmental directives, and class announcements
                    </p>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setFacultyNotifMode('board')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: facultyNotifMode === 'board' ? '#4f46e5' : 'transparent',
                      color: facultyNotifMode === 'board' ? '#ffffff' : '#475569',
                      boxShadow: facultyNotifMode === 'board' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Institutional Notice Board
                  </button>
                  <button
                    type="button"
                    onClick={() => setFacultyNotifMode('broadcast')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: facultyNotifMode === 'broadcast' ? '#4f46e5' : 'transparent',
                      color: facultyNotifMode === 'broadcast' ? '#ffffff' : '#475569',
                      boxShadow: facultyNotifMode === 'broadcast' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Class Announcements Outbox
                  </button>
                </div>
              </div>

              {facultyNotifMode === 'board' ? (
                <NotificationCenter
                  currentUser={account || {
                    name: 'Faculty Member',
                    role: 'faculty',
                    department: account?.department || 'Academic Department',
                    roleLabel: 'Faculty Member'
                  }}
                  onNavigateHome={() => setActiveTab('dashboard')}
                />
              ) : (
                <FacultyNotificationsModule account={account} />
              )}
            </div>
          )}

          {/* TAKE ATTENDANCE TAB */}
          {activeTab === 'take-attendance' && (
            <div style={{ marginBottom: '24px' }}>
              <TakeAttendanceModule
                account={account}
                role="faculty"
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            </div>
          )}

          {/* CAMPUS CONNECT TAB */}
          {activeTab === 'campus-connect' && (
            <div style={{ marginBottom: '20px' }}>
              <CampusConnect account={account} initialConversationId="conv-ds" />
            </div>
          )}

          {/* RESOURCES AWAITING VERIFICATION TAB */}
          {activeTab === 'awaiting-verification' && (
            <div style={{ marginBottom: '20px' }}>
              <AwaitingVerificationSection account={account} />
            </div>
          )}

          {/* DIGITAL ANSWER SHEET EVALUATION SYSTEM */}
          {activeTab === 'digital-evaluation' && (
            <div style={{ marginTop: '-0.75rem', marginBottom: '20px' }}>
              <DigitalAnswerSheetEvaluationSystem initialRole="faculty" currentUser={account} />
            </div>
          )}

          {/* FACULTY OFFICIAL CMS PROFILE */}
          {activeTab === 'profile' && (
            <OfficialEmployeeProfile
              account={account}
              role="faculty"
              roleTitle="Faculty Official CMS Profile"
              rolePerspective="Faculty Member / Assistant Professor"
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="fac-dash-wrapper">
              {/* 1. Welcome Banner */}
              <div className="fac-welcome-banner">
                <div className="fac-banner-content">
                  <h1 className="fac-banner-title">
                    Good evening, {account?.name || 'Dr. S. Mohanty'} 👋
                  </h1>
                  <p className="fac-banner-tagline">
                    Keep inspiring, keep teaching! — Together for a better campus.
                  </p>
                  <div className="fac-banner-notice-badge">
                    <span className="fac-notice-tag">
                      <Megaphone size={13} /> Academic Notice:
                    </span>
                    <span className="fac-notice-text">
                      Data Structures exam schedule (CSE301) has been published.
                    </span>
                  </div>
                </div>
                <div className="fac-banner-datetime-card">
                  <div className="fac-datetime-line">
                    <Calendar size={14} className="fac-datetime-icon" />
                    <span>{todayLabel}</span>
                  </div>
                  <div className="fac-datetime-line fac-time-accent">
                    <Clock size={14} className="fac-datetime-icon" />
                    <span>{formattedLiveTime}</span>
                  </div>
                </div>
              </div>

              {/* 2. Faculty Profile + 4 KPI Cards Row */}
              <div className="fac-profile-kpi-row">
                {/* Faculty Profile Card */}
                <div className="fac-profile-card">
                  <div className="fac-profile-header">
                    <div className="fac-avatar-wrap">
                      <img src={facultyPhoto} alt={account?.name || 'Faculty'} className="fac-profile-img" />
                    </div>
                    <div className="fac-profile-intro">
                      <div className="fac-profile-name-row">
                        <h3 className="fac-profile-name">{account?.name || 'Dr. S. Mohanty'}</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="fac-action-solid-btn"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                            }}
                            onClick={() => handleOpenAttendanceModal()}
                            title="Take attendance and record academic session details"
                          >
                            <ClipboardCheck size={14} /> Take Attendance
                          </button>
                          <button
                            type="button"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                            }}
                            onClick={() => handleOpenAttendanceModal(null, true)}
                            title="Take attendance using Facenox AI Camera & Biometric Model"
                          >
                            <Camera size={14} /> 🤖 AI Model Attendance
                          </button>
                          <button
                            type="button"
                            className="fac-view-profile-btn"
                            onClick={() => setActiveTab('profile')}
                            title="View full faculty official CMS profile"
                          >
                            View Profile <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="fac-profile-id-pill">
                        Faculty ID: {account?.identity || 'FAC037'}
                      </div>
                    </div>
                  </div>

                  <div className="fac-profile-details-grid">
                    <div className="fac-profile-detail-item">
                      <span className="fac-detail-label">Designation</span>
                      <span className="fac-detail-value">Assistant Professor</span>
                    </div>
                    <div className="fac-profile-detail-item">
                      <span className="fac-detail-label">Department</span>
                      <span className="fac-detail-value">{account?.department || 'Computer Science & Engineering'}</span>
                    </div>
                    <div className="fac-profile-detail-item">
                      <span className="fac-detail-label">Assigned Subjects</span>
                      <span className="fac-detail-value">{facultyAssignments.length || 4} Subjects</span>
                    </div>
                    <div className="fac-profile-detail-item">
                      <span className="fac-detail-label">Email</span>
                      <span className="fac-detail-value fac-detail-email" title={account?.email || 's.mohanty@apnacampus.edu.in'}>
                        {account?.email || 's.mohanty@apnacampus.edu.in'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Summary KPI Cards Grid */}
                <div className="fac-kpis-grid">
                  {/* KPI 1: My Students */}
                  <div className="fac-kpi-card tone-blue">
                    <div className="fac-kpi-top">
                      <div className="fac-kpi-icon-wrap bg-blue">
                        <Users size={19} />
                      </div>
                      <div className="fac-kpi-trend trend-up">
                        <TrendingUp size={12} /> +5%
                      </div>
                    </div>
                    <div className="fac-kpi-body">
                      <span className="fac-kpi-label">My Students</span>
                      <div className="fac-kpi-number">{scopedStudents.length || 150}</div>
                    </div>
                    <div className="fac-kpi-sparkline">
                      <svg viewBox="0 0 120 30" preserveAspectRatio="none" className="spark-svg">
                        <defs>
                          <linearGradient id="blueSpark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,24 Q30,22 60,15 T120,6 L120,30 L0,30 Z" fill="url(#blueSpark)" />
                        <path d="M0,24 Q30,22 60,15 T120,6" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* KPI 2: Classes Today */}
                  <div className="fac-kpi-card tone-green">
                    <div className="fac-kpi-top">
                      <div className="fac-kpi-icon-wrap bg-green">
                        <Calendar size={19} />
                      </div>
                      <div className="fac-kpi-trend trend-up">
                        <TrendingUp size={12} /> +0%
                      </div>
                    </div>
                    <div className="fac-kpi-body">
                      <span className="fac-kpi-label">Classes Today</span>
                      <div className="fac-kpi-number">2</div>
                    </div>
                    <div className="fac-kpi-sparkline">
                      <svg viewBox="0 0 120 30" preserveAspectRatio="none" className="spark-svg">
                        <defs>
                          <linearGradient id="greenSpark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,18 Q30,22 60,14 T120,12 L120,30 L0,30 Z" fill="url(#greenSpark)" />
                        <path d="M0,18 Q30,22 60,14 T120,12" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* KPI 3: Pending Marks */}
                  <div className="fac-kpi-card tone-orange">
                    <div className="fac-kpi-top">
                      <div className="fac-kpi-icon-wrap bg-orange">
                        <ClipboardList size={19} />
                      </div>
                      <div className="fac-kpi-trend trend-down">
                        <TrendingDown size={12} /> -8%
                      </div>
                    </div>
                    <div className="fac-kpi-body">
                      <span className="fac-kpi-label">Pending Marks</span>
                      <div className="fac-kpi-number">45</div>
                    </div>
                    <div className="fac-kpi-sparkline">
                      <svg viewBox="0 0 120 30" preserveAspectRatio="none" className="spark-svg">
                        <defs>
                          <linearGradient id="orangeSpark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,8 Q30,12 60,20 T120,26 L120,30 L0,30 Z" fill="url(#orangeSpark)" />
                        <path d="M0,8 Q30,12 60,20 T120,26" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* KPI 4: Notices */}
                  <div className="fac-kpi-card tone-purple">
                    <div className="fac-kpi-top">
                      <div className="fac-kpi-icon-wrap bg-purple">
                        <Bell size={19} />
                      </div>
                      <div className="fac-kpi-trend trend-up">
                        <TrendingUp size={12} /> +2%
                      </div>
                    </div>
                    <div className="fac-kpi-body">
                      <span className="fac-kpi-label">Notices</span>
                      <div className="fac-kpi-number">12</div>
                    </div>
                    <div className="fac-kpi-sparkline">
                      <svg viewBox="0 0 120 30" preserveAspectRatio="none" className="spark-svg">
                        <defs>
                          <linearGradient id="purpleSpark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,24 Q30,22 60,16 T120,8 L120,30 L0,30 Z" fill="url(#purpleSpark)" />
                        <path d="M0,24 Q30,22 60,16 T120,8" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ROW 1 (2 cards): My Courses | Today's Teaching & Assessment Schedule ── */}
              <div className="fac-dashboard-row-2col">
                {/* Card 1: My Courses */}
                <div className="fac-card fac-courses-card">
                  <div className="fac-card-header">
                    <div className="fac-card-title-wrap">
                      <BookOpen size={18} className="fac-card-title-icon text-blue" />
                      <h3 className="fac-card-title">My Courses</h3>
                    </div>
                    <button type="button" className="fac-view-all-link" onClick={() => setActiveTab('subjects')}>
                      View All →
                    </button>
                  </div>
                  <div className="fac-courses-grid">
                    <div className="fac-course-pill-card">
                      <div className="course-icon-badge text-blue bg-blue-soft">&lt; / &gt;</div>
                      <div className="course-name-row">Data Structures</div>
                      <div className="course-code-row">(CSE-301)</div>
                      <div className="course-progress-bar">
                        <div className="course-progress-fill bg-blue" style={{ width: '80%' }} />
                      </div>
                      <div className="course-pct-label">80%</div>
                    </div>

                    <div className="fac-course-pill-card">
                      <div className="course-icon-badge text-purple bg-purple-soft">🧠</div>
                      <div className="course-name-row">Machine Learning</div>
                      <div className="course-code-row">(CSE-302)</div>
                      <div className="course-progress-bar">
                        <div className="course-progress-fill bg-purple" style={{ width: '68%' }} />
                      </div>
                      <div className="course-pct-label">68%</div>
                    </div>

                    <div className="fac-course-pill-card">
                      <div className="course-icon-badge text-cyan bg-cyan-soft">🌐</div>
                      <div className="course-name-row">Web Technologies</div>
                      <div className="course-code-row">(CSE-303)</div>
                      <div className="course-progress-bar">
                        <div className="course-progress-fill bg-blue" style={{ width: '75%' }} />
                      </div>
                      <div className="course-pct-label">75%</div>
                    </div>

                    <div className="fac-course-pill-card">
                      <div className="course-icon-badge text-indigo bg-indigo-soft">⚙️</div>
                      <div className="course-name-row">Operating Systems</div>
                      <div className="course-code-row">(CSE-304)</div>
                      <div className="course-progress-bar">
                        <div className="course-progress-fill bg-blue" style={{ width: '70%' }} />
                      </div>
                      <div className="course-pct-label">70%</div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Today's Teaching & Assessment Schedule */}
                <div className="fac-card fac-schedule-table-card">
                  <div className="fac-card-header">
                    <div className="fac-card-title-wrap">
                      <ClipboardCheck size={18} className="fac-card-title-icon text-blue" />
                      <h3 className="fac-card-title">Today's Teaching &amp; Assessment Schedule</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="fac-action-solid-btn"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => handleOpenAttendanceModal()}
                        title="Take class attendance"
                      >
                        <ClipboardCheck size={13} /> Take Attendance
                      </button>
                      <button type="button" className="fac-view-all-link" onClick={() => setActiveTab('timetable')}>
                        View All →
                      </button>
                    </div>
                  </div>
                  <div className="fac-table-responsive">
                    <table className="fac-mini-schedule-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Subject</th>
                          <th>Semester</th>
                          <th>Section</th>
                          <th>Room</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="time-cell">09:00 - 10:00</td>
                          <td className="sub-cell">Data Structures</td>
                          <td>3</td>
                          <td>A</td>
                          <td className="room-cell">Block A - 301</td>
                          <td>
                            <span className="fac-status-pill pill-completed">Completed</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="fac-action-outline-btn"
                                onClick={() => { setSelectedSubject('Data Structures'); setActiveTab('subjects'); }}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="fac-action-solid-btn"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleOpenAttendanceModal({ subjectCode: 'CS501', subjectName: 'Data Structures', section: 'Section A', course: 'B.Tech', semester: 'Semester 3', time: '09:00 - 10:00' })}
                              >
                                Take
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="time-cell highlight-cell">11:15 - 12:15</td>
                          <td className="sub-cell">Operating Systems</td>
                          <td>5</td>
                          <td>B</td>
                          <td className="room-cell">Block B - 204</td>
                          <td>
                            <span className="fac-status-pill pill-ongoing">Ongoing</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="fac-action-solid-btn"
                              onClick={() => handleOpenAttendanceModal({ subjectCode: 'CS502', subjectName: 'Operating Systems', section: 'Section B', course: 'B.Tech', semester: 'Semester 5', time: '11:15 - 12:15' })}
                            >
                              Take Attendance
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="time-cell">02:00 - 03:00</td>
                          <td className="sub-cell">Web Technologies</td>
                          <td>3</td>
                          <td>C</td>
                          <td className="room-cell">Block A - 302</td>
                          <td>
                            <span className="fac-status-pill pill-upcoming">Upcoming</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="fac-action-outline-btn"
                                onClick={() => { setSelectedSubject('Web Technologies'); setActiveTab('subjects'); }}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="fac-action-solid-btn"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleOpenAttendanceModal({ subjectCode: 'CS503', subjectName: 'Web Technologies', section: 'Section C', course: 'B.Tech', semester: 'Semester 3', time: '02:00 - 03:00' })}
                              >
                                Take
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ── ROW 3 (2 cards): Academic Calendar | Holiday & Recess List ── */}
              <div className="fac-dashboard-row-2col">
                <CalendarWidget account={account} className="fac-calendar-widget-card" />
                <HolidayListWidget title="Holiday & Recess List" />
              </div>
</div>
          )}

          {/* TAB: ASSIGNMENTS (ASSESSMENT GROUP) */}
          {activeTab === 'assignments' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Assignment Management &amp; Continuous Internal Evaluation (CIA)</h2>
                  <p>Curricular coursework assignments, digital submissions, and CIA weightage grading for assigned cohorts.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => triggerToast('✓ New coursework assignment drafted.')}>
                  <Plus size={15} /> Post New Coursework Assignment
                </button>
              </div>

              <div className="admin-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem', background: '#ffffff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700 }}>CS501 · Data Structures</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>Assignment 1: Trees &amp; Graphs</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Deadline: 20 Oct 2026 · Weight: 10 Marks</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="admin-badge approved">30/32 Submitted</span>
                      <span className="admin-badge active">28 Evaluated</span>
                      <button
                        type="button"
                        style={{ marginLeft: 'auto', background: '#25d366', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '3px 9px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        onClick={() => {
                          setActiveTab('campus-connect');
                          window.location.hash = 'campus-connect';
                        }}
                        title="Open Data Structures Class WhatsApp group"
                      >
                        <MessageSquare size={11} /> WhatsApp Group
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: '#f5f3ff', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 700 }}>CS502 · Operating Systems</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4c1d95', marginTop: '4px' }}>Assignment 2: Semaphore Synchronization</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Deadline: 30 Oct 2026 · Weight: 10 Marks</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <span className="admin-badge pending">24/32 Submitted</span>
                      <span className="admin-badge pending">Awaiting Grading</span>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>CS503 · Machine Learning</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064e3b', marginTop: '4px' }}>Assignment 1: Linear Regression &amp; Scikit</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Deadline: 05 Nov 2026 · Weight: 10 Marks</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <span className="admin-badge active">Active Submission Window</span>
                    </div>
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Roll No.</th>
                        <th>Student Name</th>
                        <th>Course</th>
                        <th>Assignment</th>
                        <th>Submitted At</th>
                        <th>Attachment</th>
                        <th>Score (Max 10)</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scopedStudents.slice(0, 8).map((st, i) => (
                        <tr key={st.rollNumber}>
                          <td><strong>{st.rollNumber}</strong></td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{st.name}</div>
                            <small style={{ color: '#64748b' }}>{st.department}</small>
                          </td>
                          <td>CS501</td>
                          <td>Assignment 1 (Graph Algorithms)</td>
                          <td>{i % 2 === 0 ? '19 Oct 2026, 04:30 PM' : '20 Oct 2026, 11:15 AM'}</td>
                          <td>
                            <span style={{ color: '#2563eb', fontSize: '0.76rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Download size={13} /> graph_sol_{st.rollNumber}.pdf
                            </span>
                          </td>
                          <td><strong>{i % 3 === 0 ? '9.5' : i % 3 === 1 ? '8.0' : '9.0'} / 10</strong></td>
                          <td>
                            <span className="admin-badge approved">Evaluated</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="admin-action-btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                              onClick={() => triggerToast(`Grading score confirmed for ${st.name}.`)}
                            >
                              Edit Score
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LEAVE MANAGEMENT (PERSONAL GROUP) */}
          {activeTab === 'leave-management' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Faculty Academic &amp; Institutional Leave Management</h2>
                  <p>Track leave quotas, view past applications, and submit official leave requests to Head of Department &amp; Dean.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setIsApplyLeaveModalOpen(true)}>
                  <Plus size={15} /> Apply for Faculty Leave
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <div className="admin-stat-value">{facultyLeaveBalance.cl} / 12</div>
                    <div className="admin-stat-label">Casual Leaves (CL) Available</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="admin-stat-value">{facultyLeaveBalance.el} / 20</div>
                    <div className="admin-stat-label">Earned Leaves (EL) Available</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <HeartHandshake size={24} />
                  </div>
                  <div>
                    <div className="admin-stat-value">{facultyLeaveBalance.ml} / 10</div>
                    <div className="admin-stat-label">Medical Leaves (ML) Available</div>
                  </div>
                </div>
              </div>

              <div className="admin-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', background: '#ffffff' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>My Recent Leave Applications</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Application Ref</th>
                        <th>Leave Type</th>
                        <th>Dates</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Sanction Status</th>
                        <th>Approving Authority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyLeavesList.map(fl => (
                        <tr key={fl.id}>
                          <td><strong>{fl.id}</strong></td>
                          <td><span className="admin-badge active">{fl.type}</span></td>
                          <td>{fl.from} — {fl.to}</td>
                          <td><strong>{fl.days} Day(s)</strong></td>
                          <td>{fl.reason}</td>
                          <td><span className="admin-badge approved">{fl.status}</span></td>
                          <td>{fl.approvedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Apply Leave Modal */}
              {isApplyLeaveModalOpen && (
                <div className="admin-modal-backdrop" onClick={() => setIsApplyLeaveModalOpen(false)}>
                  <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
                    <div className="admin-modal-header">
                      <h3>Submit Faculty Leave Application</h3>
                      <button className="admin-table-action-btn" onClick={() => setIsApplyLeaveModalOpen(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={e => {
                      e.preventDefault();
                      setFacultyLeavesList(prev => [
                        {
                          id: `FL-2026-${String(prev.length + 1).padStart(2, '0')}`,
                          type: applyLeaveForm.type,
                          from: applyLeaveForm.fromDate || 'Tomorrow',
                          to: applyLeaveForm.toDate || 'Day after Tomorrow',
                          days: 2,
                          reason: applyLeaveForm.reason,
                          status: 'Pending HOD Approval',
                          approvedBy: 'Dr. P. K. Pattnaik (Pending)'
                        },
                        ...prev
                      ]);
                      setIsApplyLeaveModalOpen(false);
                      triggerToast('✓ Leave application submitted successfully to HOD!');
                    }}>
                      <div className="admin-modal-body">
                        <div className="admin-form-group">
                          <label>Leave Category *</label>
                          <select
                            className="admin-form-select"
                            value={applyLeaveForm.type}
                            onChange={e => setApplyLeaveForm({ ...applyLeaveForm, type: e.target.value })}
                            required
                          >
                            <option value="Casual Leave (CL)">Casual Leave (CL) — {facultyLeaveBalance.cl} Left</option>
                            <option value="Earned Leave (EL)">Earned Leave (EL) — {facultyLeaveBalance.el} Left</option>
                            <option value="Medical Leave (ML)">Medical Leave (ML) — {facultyLeaveBalance.ml} Left</option>
                            <option value="Duty Leave (DL)">Duty Leave (DL) / Conference</option>
                          </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="admin-form-group">
                            <label>From Date *</label>
                            <input
                              type="date"
                              className="admin-form-input"
                              value={applyLeaveForm.fromDate}
                              onChange={e => setApplyLeaveForm({ ...applyLeaveForm, fromDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="admin-form-group">
                            <label>To Date *</label>
                            <input
                              type="date"
                              className="admin-form-input"
                              value={applyLeaveForm.toDate}
                              onChange={e => setApplyLeaveForm({ ...applyLeaveForm, toDate: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label>Class Substitution / Lecture Arrangement *</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={applyLeaveForm.substituteFaculty}
                            onChange={e => setApplyLeaveForm({ ...applyLeaveForm, substituteFaculty: e.target.value })}
                            placeholder="Name of faculty colleague taking charge of your lectures"
                            required
                          />
                        </div>

                        <div className="admin-form-group">
                          <label>Reason for Leave *</label>
                          <textarea
                            className="admin-form-input"
                            rows={3}
                            value={applyLeaveForm.reason}
                            onChange={e => setApplyLeaveForm({ ...applyLeaveForm, reason: e.target.value })}
                            placeholder="State reason for absence and academic contingency plan..."
                            required
                          />
                        </div>
                      </div>
                      <div className="admin-modal-footer">
                        <button type="button" className="admin-action-btn-secondary" onClick={() => setIsApplyLeaveModalOpen(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="admin-action-btn-primary">
                          Submit Application
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SETTINGS (PERSONAL GROUP) */}
          {activeTab === 'settings' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Faculty Academic &amp; Profile Settings</h2>
                  <p>Manage office location, consultation hours, syllabus pacing reminders, and communication channels.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <div className="admin-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', background: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Office &amp; Consultation Hours</h3>
                  <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                    <label>Faculty Cabin Location</label>
                    <input type="text" className="admin-form-input" defaultValue="Block B · Room 312 (School of Computing)" />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                    <label>Weekly Student Consultation Hours</label>
                    <input type="text" className="admin-form-input" defaultValue="Mon &amp; Thu: 03:00 PM - 05:00 PM" />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                    <label>Institutional Contact Number</label>
                    <input type="text" className="admin-form-input" defaultValue="+91 94370 12844" />
                  </div>
                  <button className="admin-action-btn-primary" onClick={() => triggerToast('✓ Office details updated.')}>
                    Save Office Details
                  </button>
                </div>

                <div className="admin-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', background: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Academic Notification Preferences</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Send SMS / Email alerts when student attendance falls below 75%</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Notify when autonomous exam datesheets or moderation notices are issued</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Instant alerts for new student grievances routed to School of Computing</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Enable dark mode theme synchronization across classroom projector devices</span>
                    </label>
                  </div>
                  <button className="admin-action-btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => triggerToast('✓ Notification preferences saved.')}>
                    Update Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HELP & SUPPORT (PERSONAL GROUP) */}
          {activeTab === 'help-support' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Faculty ERP Knowledge &amp; IT Helpdesk</h2>
                  <p>Autonomous College Management System assistance, exam cell guidelines, and technical support.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                <div className="admin-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', background: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={18} color="#2563eb" /> Autonomous Exam Guidelines
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                    Download official university evaluation blueprints, CIA scaling criteria, and question paper submission protocol.
                  </p>
                  <button className="admin-action-btn-secondary" style={{ marginTop: '0.75rem' }} onClick={() => alert('Downloading Autonomous Faculty Manual PDF...')}>
                    <Download size={14} /> Download Faculty Manual PDF
                  </button>
                </div>

                <div className="admin-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', background: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#059669" /> Autonomous Examination Cell
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                    For marks moderation, gazette errors, and re-totaling queries, contact Controller of Examinations (COE).
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, marginTop: '0.5rem' }}>
                    📞 Extension: 204 · Email: coe@apnacampus.edu.in
                  </div>
                </div>

                <div className="admin-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', background: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={18} color="#7c3aed" /> Campus IT Helpdesk
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                    Smart classroom projector issues, faculty WiFi authentication, or LMS access tickets.
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, marginTop: '0.5rem' }}>
                    📞 Support Desk: +91 94370 00112 · it.support@apnacampus.edu.in
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Assigned Teaching Subjects ({facultyAssignments.length} Courses)</h2>
                  <p>Curricular subjects assigned by Head of Department for Continuous Evaluation &amp; Autonomous Grading.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button className="admin-action-btn-primary" onClick={handleOpenAttendanceModal}>
                    <Calendar size={14} /> Record Period Attendance
                  </button>
                  <button className="admin-action-btn-secondary" onClick={() => setActiveTab('marks')}>
                    <BarChart2 size={14} /> Marks Matrix
                  </button>
                </div>
                {quizLoadError && (
                  <div role="alert" style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: '#fff1f2', color: '#b91c1c' }}>
                    {quizLoadError}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {facultyAssignments.map((sub) => (
                  <div key={sub.id || `${sub.subjectCode}-${sub.section}`} className="faculty-subject-card">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="admin-badge active">{sub.subjectCode}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span
                            className="admin-badge"
                            style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
                          >
                            {sub.section || 'Section A'}
                          </span>
                          <span className={`admin-badge ${sub.marksCompletion === 100 ? 'approved' : 'pending'}`}>
                            {sub.approvalStatus || 'Active'}
                          </span>
                        </div>
                      </div>
                      <h3 style={{ margin: '0.5rem 0 0.25rem 0', color: '#0f172a', fontSize: '1.18rem', fontWeight: 800 }}>
                        {sub.subjectName}
                      </h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>
                        {sub.program || sub.assignedCourse || 'B.Tech'} ({sub.deptCode || sub.assignedBranch || 'CSE'}) · {sub.semester} · {sub.credits} Credits · {sub.type}
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', fontSize: '0.83rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: '#64748b' }}>Assigned Academic Session:</span>
                        <strong>{sub.academicYear || sub.assignedAcademicSession || '2026-27'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: '#64748b' }}>Assigned Course &amp; Branch:</span>
                        <strong>{sub.program || sub.assignedCourse || 'B.Tech'} ({sub.deptCode || sub.assignedBranch || 'CSE'})</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: '#64748b' }}>Assigned Semester &amp; Section:</span>
                        <strong style={{ color: '#1e40af' }}>{sub.semester} · {sub.section}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: '#64748b' }}>Total Enrolled Students:</span>
                        <strong style={{ color: '#059669' }}>{sub.sectionEnrollment || sub.totalEnrolledStudents || 32} Students</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: '#64748b' }}>Today's Scheduled Classes:</span>
                        <strong style={{ color: '#d97706' }}>
                          {sub.todayScheduledClasses || `${sub.room || 'Block B - 302'} · 10:00 AM – 11:00 AM`}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Venue &amp; Room:</span>
                        <span>{sub.room} {sub.labRoom ? `| ${sub.labRoom}` : ''}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="admin-action-btn-primary"
                        style={{ flex: 1, padding: '7px 10px', fontSize: '0.8rem', justifyContent: 'center' }}
                        onClick={() => {
                          setSelectedAssignmentId(sub.id);
                          setSelectedSubject(sub.subjectName);
                          setIsConsolidatedScope(false);
                          setActiveTab('students');
                        }}
                        title="View enrolled students register for this section"
                      >
                        <Users size={14} /> Open Class Register
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn-secondary"
                        style={{ padding: '7px 10px', fontSize: '0.8rem', background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}
                        onClick={() => {
                          setActiveTab('campus-connect');
                          window.location.hash = 'campus-connect';
                        }}
                        title={`Open WhatsApp class communication channel for ${sub.subjectName}`}
                      >
                        <MessageSquare size={14} /> Class WhatsApp
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn-secondary"
                        style={{ padding: '7px 10px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setSelectedAssignmentId(sub.id);
                          handleOpenAttendanceModal(sub);
                        }}
                        title="Record attendance for this section"
                      >
                        <Calendar size={14} /> Attendance
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn-secondary"
                        style={{ padding: '7px 10px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setSelectedAssignmentId(sub.id);
                          setSelectedSubject(sub.subjectName);
                          setActiveTab('marks');
                        }}
                        title="Enter marks for this section"
                      >
                        <BarChart2 size={14} /> Marks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MARKS MANAGEMENT (FULL MATRIX) */}
          {activeTab === 'marks' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Continuous Assessment Marks Entry</h2>
                  <p>Entering and finalizing marks for {selectedSubject} · 91 Students in Section A.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select
                    className="admin-select"
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    style={{ fontWeight: 600 }}
                  >
                    <option value="Data Structures">Data Structures (CS501)</option>
                    <option value="Operating Systems">Operating Systems (CS502)</option>
                  </select>
                </div>
              </div>

              {/* Renders the full fast inline matrix table with keyboard navigation, tabs, CSV upload and Save Draft/Finalize */}
              <MarksManagementModule initialRole="teacher" allowStudentView={false} />
            </div>
          )}

          {/* TAB 4: MY STUDENTS */}
          {activeTab === 'students' && (
            <div>
              {/* Class-Selection Interface at Top of My Students (Requirement 1, 4, 5) */}
              <FacultyClassSelector
                assignments={facultyAssignments}
                selectedAssignmentId={selectedAssignmentId}
                onSelectAssignment={(asgn) => {
                  setSelectedAssignmentId(asgn.id);
                  setIsConsolidatedScope(false);
                }}
                isConsolidated={isConsolidatedScope}
                onToggleConsolidated={(val) => setIsConsolidatedScope(val)}
                totalStudentsCount={scopedStudents.length}
                pendingMarksCount={atRiskStudents.length}
                moduleTitle="My Students Roster"
                moduleSubtitle="Class-wise, section-wise, semester-wise and subject-wise student categorization"
                actions={
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      onClick={() =>
                        exportToCsv(
                          `${isConsolidatedScope ? 'All_Assigned_Classes' : currentAssignment.subjectCode}_Class_Roster.csv`,
                          filteredStudents.map((s) => ({
                            Roll: s.rollNumber,
                            Name: s.name,
                            Registration: s.registrationNumber || s.studentId,
                            Semester: s.semester || currentAssignment.semester,
                            Section: s.section || currentAssignment.section,
                            Subject: s.subjectCode || currentAssignment.subjectCode,
                            Attendance: `${s.attendance || 85}%`,
                            CGPA: s.cgpa,
                          })),
                        )
                      }
                    >
                      <FileSpreadsheet size={14} /> Export CSV Roster
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn-primary"
                      onClick={handleOpenAttendanceModal}
                    >
                      <Calendar size={14} /> Record Attendance
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn-primary"
                      style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                      onClick={() => {
                        const criticalStudents = filteredStudents.filter(s => {
                          const d = getStudentComprehensiveDetails(s);
                          return d.isCriticalShortage || d.fees?.hasHighDues;
                        });
                        if (criticalStudents.length === 0) {
                          triggerToast('No students with critical attendance (<50%) or high fee dues in current selection.');
                          return;
                        }
                        setParentNoticeModalStudent(criticalStudents[0]);
                      }}
                      title="Send immediate parent notice for at-risk students"
                    >
                      <Send size={14} /> Send Parent Notice ({critAttCount + highFeesCount})
                    </button>
                  </div>
                }
              />

              {/* Quick Alert Filter Pills for Parent Notices & Student 360 Oversight */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Bell size={13} color="#dc2626" /> PARENT ACTION FILTERS:
                </span>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${facultyAlertFilter === 'ALL' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    background: facultyAlertFilter === 'ALL' ? '#2563eb' : '#fff',
                    color: facultyAlertFilter === 'ALL' ? '#fff' : '#475569',
                    borderColor: facultyAlertFilter === 'ALL' ? '#2563eb' : '#cbd5e1'
                  }}
                  onClick={() => setFacultyAlertFilter('ALL')}
                >
                  All Assigned ({scopedStudents.length})
                </button>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${facultyAlertFilter === 'CRITICAL_ATTENDANCE' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: facultyAlertFilter === 'CRITICAL_ATTENDANCE' ? '#dc2626' : '#fef2f2',
                    color: facultyAlertFilter === 'CRITICAL_ATTENDANCE' ? '#fff' : '#dc2626',
                    borderColor: facultyAlertFilter === 'CRITICAL_ATTENDANCE' ? '#dc2626' : '#fca5a5'
                  }}
                  onClick={() => setFacultyAlertFilter(facultyAlertFilter === 'CRITICAL_ATTENDANCE' ? 'ALL' : 'CRITICAL_ATTENDANCE')}
                >
                  🚨 Attendance &lt; 50% ({critAttCount})
                </button>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${facultyAlertFilter === 'HIGH_FEES' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: facultyAlertFilter === 'HIGH_FEES' ? '#d97706' : '#fffbeb',
                    color: facultyAlertFilter === 'HIGH_FEES' ? '#fff' : '#b45309',
                    borderColor: facultyAlertFilter === 'HIGH_FEES' ? '#d97706' : '#fcd34d'
                  }}
                  onClick={() => setFacultyAlertFilter(facultyAlertFilter === 'HIGH_FEES' ? 'ALL' : 'HIGH_FEES')}
                >
                  💳 High Fee Dues &gt; ₹25k ({highFeesCount})
                </button>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${facultyAlertFilter === 'DUAL_CRITICAL' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: facultyAlertFilter === 'DUAL_CRITICAL' ? '#7f1d1d' : '#fff1f2',
                    color: facultyAlertFilter === 'DUAL_CRITICAL' ? '#fff' : '#991b1b',
                    borderColor: facultyAlertFilter === 'DUAL_CRITICAL' ? '#7f1d1d' : '#fecdd3'
                  }}
                  onClick={() => setFacultyAlertFilter(facultyAlertFilter === 'DUAL_CRITICAL' ? 'ALL' : 'DUAL_CRITICAL')}
                >
                  🔥 Dual Critical ({dualCritCount})
                </button>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${facultyAlertFilter === 'SHORTAGE' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    background: facultyAlertFilter === 'SHORTAGE' ? '#f59e0b' : '#fff',
                    color: facultyAlertFilter === 'SHORTAGE' ? '#fff' : '#b45309',
                    borderColor: facultyAlertFilter === 'SHORTAGE' ? '#f59e0b' : '#fde68a'
                  }}
                  onClick={() => setFacultyAlertFilter(facultyAlertFilter === 'SHORTAGE' ? 'ALL' : 'SHORTAGE')}
                >
                  ⚠️ Shortage (&lt;75%) ({shortageCount})
                </button>
              </div>

              {/* Filters Bar */}
              <div style={{ display: 'flex', gap: '10px', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>ATTENDANCE:</span>
                  {[
                    { id: 'ALL', label: 'All Students' },
                    { id: 'SHORTAGE', label: 'Shortage (< 75%)' },
                    { id: 'GOOD', label: 'Good (75-85%)' },
                    { id: 'HIGH', label: 'High (> 85%)' }
                  ].map(b => (
                    <button
                      key={b.id}
                      type="button"
                      className={`admin-action-btn-secondary ${attendanceFilter === b.id ? 'active' : ''}`}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.74rem',
                        background: attendanceFilter === b.id ? '#2563eb' : '#fff',
                        color: attendanceFilter === b.id ? '#fff' : '#475569',
                        borderColor: attendanceFilter === b.id ? '#2563eb' : '#cbd5e1'
                      }}
                      onClick={() => setAttendanceFilter(b.id)}
                    >
                      {b.label}
                    </button>
                  ))}

                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginLeft: '8px' }}>ACADEMIC RISK:</span>
                  <button
                    type="button"
                    className={`admin-action-btn-secondary ${riskFilter === 'AT_RISK' ? 'active' : ''}`}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.74rem',
                      background: riskFilter === 'AT_RISK' ? '#dc2626' : '#fff',
                      color: riskFilter === 'AT_RISK' ? '#fff' : '#dc2626',
                      borderColor: riskFilter === 'AT_RISK' ? '#dc2626' : '#fca5a5'
                    }}
                    onClick={() => setRiskFilter(riskFilter === 'AT_RISK' ? 'ALL' : 'AT_RISK')}
                  >
                    <AlertCircle size={12} /> At-Risk Only ({atRiskStudents.length})
                  </button>
                </div>

                <div className="admin-search-wrap" style={{ minWidth: '240px' }}>
                  <Search size={15} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search name, roll, or ID..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Roll #</th>
                      <th>Student &amp; Parent</th>
                      <th>Registration / Cohort</th>
                      {isConsolidatedScope && <th>Assigned Subject</th>}
                      <th>Attendance Turnout</th>
                      <th>Continuous Marks</th>
                      <th>Fees Account &amp; Dues</th>
                      <th>Risk Assessment</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(s => {
                      const risk = erpStore.calculateStudentRisk(s);
                      const details = getStudentComprehensiveDetails(s);
                      const isCritAtt = details.isCriticalShortage; // < 50%
                      const hasHighFees = details.fees?.hasHighDues; // >= 25k

                      return (
                        <tr key={s.id} style={{ background: isCritAtt && hasHighFees ? '#fff1f2' : isCritAtt ? '#fef2f2' : hasHighFees ? '#fffbeb' : 'transparent' }}>
                          <td><strong>#{s.rollNumber}</strong></td>
                          <td style={{ fontWeight: 600 }}>
                            <div>{s.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Parent: <strong>{details.parent?.fatherName}</strong>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#0369a1' }}>
                              📞 {details.parent?.phone}
                            </div>
                          </td>
                          <td>
                            <div><code>{s.registrationNumber || s.studentId}</code></div>
                            <small style={{ color: '#64748b', fontSize: '0.72rem' }}>
                              {s.semester || currentAssignment.semester} · {s.section || currentAssignment.section}
                            </small>
                          </td>
                          {isConsolidatedScope && (
                            <td>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                                {s.subjectCode || currentAssignment.subjectCode} ({s.subjectName || currentAssignment.subjectName})
                              </span>
                            </td>
                          )}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '0.92rem', color: isCritAtt ? '#b91c1c' : details.isShortage ? '#d97706' : '#0f766e' }}>
                                {details.attendance}%
                              </strong>
                              <small style={{ color: '#64748b', fontSize: '0.72rem' }}>({details.attendedLectures}/{details.totalLectures})</small>
                            </div>
                            {isCritAtt ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '4px', background: '#dc2626', color: '#fff', fontSize: '0.66rem', fontWeight: 800, marginTop: '2px' }}>
                                🚨 CRITICAL &lt;50% DEBARMENT
                              </span>
                            ) : details.isShortage ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.66rem', fontWeight: 700, marginTop: '2px' }}>
                                ⚠️ Shortage &lt;75%
                              </span>
                            ) : (
                              <span style={{ display: 'inline-block', fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                                ✓ Eligible (Exam Cleared)
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: '#059669', fontSize: '0.88rem' }}>{details.marks.cgpa} CGPA</strong>
                              <span style={{ color: '#64748b', fontSize: '0.74rem' }}>| CIA: <strong>{details.marks.totalInternal}</strong>/100</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                              Mid 1: {details.marks.mid1}/30 · Mid 2: {details.marks.mid2}/30
                              {details.marks.backlogCount > 0 && (
                                <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: '4px' }}>
                                  · {details.marks.backlogCount} Backlog
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            {details.fees.dueFees > 0 ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <strong style={{ color: hasHighFees ? '#dc2626' : '#d97706', fontSize: '0.88rem' }}>
                                    ₹{details.fees.dueFees.toLocaleString('en-IN')} Due
                                  </strong>
                                </div>
                                {hasHighFees ? (
                                  <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '0.66rem', fontWeight: 800, marginTop: '2px' }}>
                                    💳 High Dues Pending
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                    Paid: ₹{details.fees.paidFees.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="admin-badge approved" style={{ fontSize: '0.7rem' }}>
                                  ✓ Cleared (₹0 Due)
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                background: `${risk.badgeColor}15`,
                                color: risk.badgeColor,
                                border: `1px solid ${risk.badgeColor}35`,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={risk.reasons.length > 0 ? risk.reasons.join(' | ') : 'Academic performance in good standing'}
                            >
                              {risk.isAtRisk && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: risk.badgeColor }} />}
                              {risk.category}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                              <button
                                type="button"
                                className="admin-action-btn-secondary"
                                style={{
                                  padding: '3px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: isCritAtt || hasHighFees ? '#dc2626' : '#fff',
                                  color: isCritAtt || hasHighFees ? '#fff' : '#b91c1c',
                                  borderColor: isCritAtt || hasHighFees ? '#dc2626' : '#fca5a5'
                                }}
                                onClick={() => setParentNoticeModalStudent(s)}
                                title={`Dispatch official parent notice (${isCritAtt ? 'Critical Attendance < 50%' : hasHighFees ? 'High Fee Dues' : 'Direct Parent Notice'})`}
                              >
                                📩 Notice to Parent
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '0.72rem', fontWeight: 600 }}
                                onClick={() => setDossierModalStudent(s)}
                                title="Open Student 360 Full Academic, Attendance & Fee Dossier"
                              >
                                360° Profile
                              </button>
                              {risk.isAtRisk && (
                                <button
                                  type="button"
                                  className="admin-action-btn-secondary"
                                  style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#b91c1c', borderColor: '#fca5a5' }}
                                  onClick={() => setRemedialActionModal(s)}
                                  title="Log Remedial Intervention"
                                >
                                  Remedial
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={isConsolidatedScope ? 9 : 8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                          <AlertCircle size={28} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
                          <strong>No students found in this category</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>
                            No student records match the selected class, section, semester, and filter criteria.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TEACHING TIMETABLE */}
          {activeTab === 'timetable' && (
            <PublicTimetable account={account} role="faculty" onClose={() => setActiveTab('dashboard')} embedded={true} />
          )}

          {/* TAB 5: CLASS PERFORMANCE & ANALYTICS */}
          {activeTab === 'performance' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Cohort Assessment Analytics &amp; Performance Distribution</h2>
                  <p>
                    Statistical evaluation for <strong>{currentAssignment.subjectName} ({currentAssignment.subjectCode})</strong> · {currentAssignment.semester} · {currentAssignment.section}.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button className="admin-action-btn-secondary" onClick={() => exportToCsv(`${currentAssignment.subjectCode}_Performance_Analytics.csv`, scopedStudents.map(s => ({ Roll: s.rollNumber, Name: s.name, Attendance: `${s.attendance || 85}%`, CGPA: s.cgpa })))}>
                    <FileSpreadsheet size={14} /> Export CSV Analytics
                  </button>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="admin-kpi-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-label">Class Average Score</span>
                  <div className="admin-kpi-val" style={{ color: '#2563eb' }}>82.4%</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Above Autonomous Minimum (40%)</small>
                </div>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-label">Highest Score</span>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>96.0%</div>
                  <small style={{ color: '#64748b' }}>Rakesh Das (Roll 01)</small>
                </div>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-label">Lowest Score</span>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>58.5%</div>
                  <small style={{ color: '#dc2626' }}>1 Student under Remedial Plan</small>
                </div>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-label">Internal Pass Rate</span>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>96.9%</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>31 / 32 Passed CIA Threshold</small>
                </div>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-label">Assessment Completion</span>
                  <div className="admin-kpi-val" style={{ color: '#7c3aed' }}>88.2%</div>
                  <small style={{ color: '#64748b' }}>11 of 13 Components Completed</small>
                </div>
              </div>

              {/* Distribution & Components Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* Score Distribution Card */}
                <div className="analytics-chart-card">
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a' }}>
                    Continuous Assessment Grade Band Distribution
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Distribution of enrolled examinees according to autonomous grade boundaries.
                  </p>

                  <div className="distribution-bar-wrap">
                    <div className="distribution-bar-bg">
                      <div className="distribution-segment" style={{ width: '25%', background: '#10b981' }} title="Outstanding (O: >=90%): 8 Students (25%)" />
                      <div className="distribution-segment" style={{ width: '43.8%', background: '#3b82f6' }} title="Excellent (A+: 80-89%): 14 Students (43.8%)" />
                      <div className="distribution-segment" style={{ width: '18.8%', background: '#6366f1' }} title="Very Good (A: 70-79%): 6 Students (18.8%)" />
                      <div className="distribution-segment" style={{ width: '9.4%', background: '#f59e0b' }} title="Good (B+: 60-69%): 3 Students (9.4%)" />
                      <div className="distribution-segment" style={{ width: '3.1%', background: '#ef4444' }} title="Support Required (<60%): 1 Student (3.1%)" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
                        Outstanding (O: &gt;= 90%)
                      </span>
                      <strong>8 Students (25.0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6' }} />
                        Excellent (A+: 80 - 89%)
                      </span>
                      <strong>14 Students (43.8%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6366f1' }} />
                        Very Good (A: 70 - 79%)
                      </span>
                      <strong>6 Students (18.8%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
                        Good (B+: 60 - 69%)
                      </span>
                      <strong>3 Students (9.4%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }} />
                        Remedial Support (&lt; 60%)
                      </span>
                      <strong style={{ color: '#dc2626' }}>1 Student (3.1%)</strong>
                    </div>
                  </div>
                </div>

                {/* Assessment Components Breakdown */}
                <div className="analytics-chart-card">
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a' }}>
                    Component-wise Average Performance
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Average cohort attainment across each continuous assessment component.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { name: 'Modular 1 (20 Marks)', score: 16.4, max: 20, pct: 82 },
                      { name: 'Modular 2 (20 Marks)', score: 15.8, max: 20, pct: 79 },
                      { name: 'Quizzes Average (10 Marks)', score: 8.6, max: 10, pct: 86 },
                      { name: 'Assignments (10 Marks)', score: 8.9, max: 10, pct: 89 },
                      { name: 'Surprise Tests (10 Marks)', score: 7.8, max: 10, pct: 78 },
                      { name: 'Lab Practical (30 Marks)', score: 26.2, max: 30, pct: 87.3 }
                    ].map(c => (
                      <div key={c.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{c.name}</span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>{c.score} / {c.max} ({c.pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.pct}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attendance vs Performance Correlation */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Attendance vs. Continuous Evaluation Attainment Correlation</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Demonstrating impact of lecture attendance on continuous evaluation scores.
                    </p>
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Attendance Tier</th>
                        <th>Student Count</th>
                        <th>Average CIA Score</th>
                        <th>Passing Probability</th>
                        <th>Regulatory Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong style={{ color: '#059669' }}>&gt;= 90% High Attendance</strong></td>
                        <td>18 Examinees</td>
                        <td><strong>88.2%</strong> (High Distinction)</td>
                        <td><span className="admin-badge approved">100% Pass</span></td>
                        <td>Eligible for Honors &amp; Distinction Citation</td>
                      </tr>
                      <tr>
                        <td><strong style={{ color: '#2563eb' }}>80% - 89% Regular Attendance</strong></td>
                        <td>10 Examinees</td>
                        <td><strong>81.5%</strong> (First Class)</td>
                        <td><span className="admin-badge approved">100% Pass</span></td>
                        <td>Eligible for standard examination clearance</td>
                      </tr>
                      <tr>
                        <td><strong style={{ color: '#d97706' }}>75% - 79% Borderline Attendance</strong></td>
                        <td>3 Examinees</td>
                        <td><strong>73.0%</strong> (Second Class)</td>
                        <td><span className="admin-badge pending">100% Pass</span></td>
                        <td>Advisory issued; mandatory attendance in revision classes</td>
                      </tr>
                      <tr>
                        <td><strong style={{ color: '#dc2626' }}>&lt; 75% Statutory Shortage</strong></td>
                        <td>1 Examinee (Debasish Panda)</td>
                        <td><strong style={{ color: '#dc2626' }}>58.5%</strong></td>
                        <td><span className="admin-badge inactive" style={{ background: '#fee2e2', color: '#b91c1c' }}>Risk Alert</span></td>
                        <td>Requires condonation or compensatory tutorial clearance</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS & GAZETTE SHEETS */}
          {activeTab === 'reports' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Faculty Continuous Assessment (CIA) Gazette Sheets</h2>
                  <p>Certified autonomous evaluation returns ready for submission to Head of Department &amp; Exam Cell.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="admin-action-btn-secondary" onClick={() => downloadDepartmentGazettePdf('Data Structures (CS501) CIA Gazette')}>
                    <Download size={14} /> Download PDF Gazette
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => exportToCsv('CS501_CIA_Gazette.csv', scopedStudents.map((s, i) => ({ SL: i + 1, RollNumber: s.rollNumber, StudentName: s.name, Modular1: 17, Modular2: 18, Quiz1: 9, Quiz2: 8, Quiz3: 9, Quiz4: 9, Quiz5: 8, Quiz6: 9, Assignment1: 9, Assignment2: 9, SurpriseTest1: 8, SurpriseTest2: 8, LabPractical: 27, TotalScore: 166, FinalCIA_20: 17.2, Grade: 'A+' })))}>
                    <FileSpreadsheet size={14} /> Export CSV Register
                  </button>
                </div>
              </div>

              {/* Subject Selection Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="admin-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="admin-badge active">CS501</span>
                    <span className="admin-badge approved">Ready for HOD</span>
                  </div>
                  <h3 className="admin-card-title" style={{ marginTop: '6px' }}>Data Structures (CS501) CIA Gazette</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 1rem 0' }}>
                    Official grade breakdown for 32 enrolled cohort examinees across all 13 components.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="admin-action-btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => downloadDepartmentGazettePdf('Data Structures (CS501) CIA Gazette')}>
                      <Download size={13} /> Official PDF
                    </button>
                    <button className="admin-action-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => exportToCsv('CS501_CIA_Gazette.csv', scopedStudents.map((s, i) => ({ SL: i + 1, Roll: s.rollNumber, Name: s.name, FinalCIA: '17.4', Grade: 'A+' })))}>
                      <FileSpreadsheet size={13} /> CSV Sheet
                    </button>
                  </div>
                </div>

                <div className="admin-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="admin-badge active">CS502</span>
                    <span className="admin-badge approved">100% Certified</span>
                  </div>
                  <h3 className="admin-card-title" style={{ marginTop: '6px' }}>Operating Systems (CS502) CIA Gazette</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 1rem 0' }}>
                    100% completed internal assessment register signed by course evaluator.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="admin-action-btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => downloadDepartmentGazettePdf('Operating Systems (CS502) CIA Gazette')}>
                      <Download size={13} /> Official PDF
                    </button>
                    <button className="admin-action-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => exportToCsv('CS502_CIA_Gazette.csv', scopedStudents.map((s, i) => ({ SL: i + 1, Roll: s.rollNumber, Name: s.name, FinalCIA: '18.1', Grade: 'O' })))}>
                      <FileSpreadsheet size={13} /> CSV Sheet
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Gazette Preview Table */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Live CIA Register Preview (CS501 Data Structures · Section A)</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Continuous internal evaluation weightage: 20% scaled from modulars, quizzes, assignments, and practicals.
                    </p>
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Roll #</th>
                        <th>Examinee Name</th>
                        <th>Mid-1 (20)</th>
                        <th>Mid-2 (20)</th>
                        <th>Quizzes (10)</th>
                        <th>Assign (10)</th>
                        <th>Surprise (10)</th>
                        <th>Lab (30)</th>
                        <th>Final CIA (20)</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scopedStudents.slice(0, 10).map((s, i) => (
                        <tr key={s.id}>
                          <td>{i + 1}</td>
                          <td><strong>{s.rollNumber}</strong></td>
                          <td>{s.name}</td>
                          <td>18.0</td>
                          <td>17.5</td>
                          <td>8.5</td>
                          <td>9.0</td>
                          <td>8.0</td>
                          <td>27.0</td>
                          <td><strong style={{ color: '#2563eb' }}>17.6 / 20</strong></td>
                          <td><strong style={{ color: '#059669' }}>A+</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CLASS NOTES MODERATION (FEATURE 2) */}
          {activeTab === 'notes-moderation' && (
            <div>
              {toastMsg && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#0f172a', color: '#fff', padding: '12px 18px', borderRadius: '8px', zIndex: 9999 }}>
                  {toastMsg}
                </div>
              )}

              <div className="admin-view-header">
                <div>
                  <h2>Class Notes & Peer Material Moderation Desk</h2>
                  <p>Review student-uploaded handwritten notes, verify academic accuracy, and moderate reported content.</p>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Subject & Topic</th>
                        <th>Lecture Date</th>
                        <th>Uploaded By</th>
                        <th>Status</th>
                        <th>Reports</th>
                        <th style={{ textAlign: 'center' }}>View</th>
                        <th style={{ textAlign: 'right' }}>Faculty Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moderationNotesList.map((n) => (
                        <tr key={n.id}>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{n.topic}</strong>
                            <div style={{ fontSize: '0.78rem', color: '#4338ca', fontWeight: 600 }}>{n.subject}</div>
                          </td>
                          <td>{n.date}</td>
                          <td>
                            <div>{n.uploadedBy?.name}</div>
                            <small style={{ color: '#64748b' }}>Roll {n.uploadedBy?.rollNumber}</small>
                          </td>
                          <td>
                            {n.isFacultyVerified ? (
                              <span className="admin-badge approved">✓ Faculty Verified</span>
                            ) : n.status === 'HIDDEN' ? (
                              <span className="admin-badge inactive">Hidden</span>
                            ) : (
                              <span className="admin-badge pending">Student Uploaded</span>
                            )}
                          </td>
                          <td>
                            {n.reports?.length > 0 ? (
                              <span style={{ fontSize: '0.78rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                <Flag size={12} /> {n.reports.length} Reports
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.78rem', background: '#ecfdf5', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>✓ Clean</span>
                            )}
                          </td>
                          {/* VIEW COLUMN */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="admin-table-action-btn"
                              style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '6px', border: '1px solid #c7d2fe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => setViewingNote(n)}
                            >
                              <Eye size={14} /> View
                            </button>
                          </td>
                          {/* FACULTY ACTIONS COLUMN */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              {!n.isFacultyVerified && (
                                <button
                                  type="button"
                                  className="admin-table-action-btn"
                                  style={{ background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '6px', border: '1px solid #86efac' }}
                                  onClick={() => handleVerifyNote(n.id)}
                                >
                                  <ShieldCheck size={14} /> Verify Note
                                </button>
                              )}
                              {n.status !== 'HIDDEN' && (
                                <button
                                  type="button"
                                  className="admin-table-action-btn"
                                  style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fca5a5' }}
                                  onClick={() => handleHideNote(n.id)}
                                >
                                  <Trash2 size={14} /> Hide Note
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: QUIZ MANAGEMENT */}
          {activeTab === 'quiz' && (
            <div>
              {/* Toast */}
              {toastMsg && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '10px', zIndex: 9999, fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  <CheckCircle2 size={16} color="#34d399" /> {toastMsg}
                </div>
              )}

              {/* Header */}
              <div className="admin-view-header">
                <div>
                  <h2>Quiz Management</h2>
                  <p>Create, schedule and manage multiple-choice quizzes for your students. Each quiz has 10 MCQ questions with answer keys.</p>
                </div>
                <button
                  className="admin-action-btn-primary"
                  onClick={() => { setShowAddQuiz(true); setQuizStep(1); setQuizFormError(''); }}
                >
                  <Plus size={15} /> Add Quiz
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Quizzes', val: quizList.length, color: '#3b82f6', bg: '#eff6ff' },
                  { label: 'Live Now', val: quizList.filter(q => q.status === 'Live').length, color: '#059669', bg: '#ecfdf5' },
                  { label: 'Scheduled', val: quizList.filter(q => q.status === 'Scheduled').length, color: '#d97706', bg: '#fffbeb' },
                  { label: 'Completed', val: quizList.filter(q => q.status === 'Completed').length, color: '#7c3aed', bg: '#f5f3ff' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: stat.bg, border: `1.5px solid ${stat.color}30`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.val}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quiz Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {quizList.map((quiz) => {
                  const statusStyles = {
                    'Live':      { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
                    'Scheduled': { bg: '#fef9c3', color: '#854d0e', dot: '#d97706' },
                    'Completed': { bg: '#f5f3ff', color: '#5b21b6', dot: '#7c3aed' },
                    'Draft':     { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
                  };
                  const ss = statusStyles[quiz.status] || statusStyles['Draft'];

                  return (
                    <div key={quiz.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'box-shadow 0.2s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                    >
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{quiz.id} · {quiz.subject}</div>
                          <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.3 }}>{quiz.title}</h3>
                        </div>
                        <span style={{ flexShrink: 0, fontSize: '0.72rem', fontWeight: 700, background: ss.bg, color: ss.color, padding: '3px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px', marginLeft: '8px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ss.dot, display: 'inline-block' }} />
                          {quiz.status}
                        </span>
                      </div>

                      {/* Meta info */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="#94a3b8" />
                          <span>{quiz.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Timer size={13} color="#94a3b8" />
                          <span>{quiz.time} minutes</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Users size={13} color="#94a3b8" />
                          <span>{quiz.section}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ClipboardList size={13} color="#94a3b8" />
                          <span>{quiz.questionsCount ?? quiz.questions?.length ?? 0} Questions · {quiz.totalMarks} Marks</span>
                        </div>
                      </div>

                      {/* Progress bar for attempts */}
                      {quiz.status !== 'Draft' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                            <span>Attempts</span>
                            <strong style={{ color: '#0f172a' }}>{quiz.attempts} students</strong>
                          </div>
                          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, (quiz.attempts / 91) * 100)}%`, background: quiz.status === 'Completed' ? '#7c3aed' : quiz.status === 'Live' ? '#16a34a' : '#f59e0b', borderRadius: '99px', transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          type="button"
                          style={{ flex: 1, padding: '6px 0', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                          onClick={() => setViewQuiz(quiz)}
                        >
                          <Eye size={13} /> View Questions
                        </button>
                        {quiz.status === 'Draft' && (
                          <button
                            type="button"
                            style={{ flex: 1, padding: '6px 0', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            onClick={async () => {
                              try {
                                const response = await api.createFacultyQuiz({ ...quiz, status: 'Scheduled' });
                                if (!response?.success || !response.data) throw new Error(response?.message || 'Quiz schedule was not saved.');
                                setQuizList((previous) => previous.map((item) => item.id === quiz.id ? response.data : item));
                                triggerToast('Quiz scheduled successfully.');
                              } catch (error) {
                                setQuizLoadError(error.message || 'Could not schedule this quiz.');
                              }
                            }}
                          >
                            <CheckCircle2 size={13} /> Publish
                          </button>
                        )}
                        {quiz.status === 'Scheduled' && (
                          <button
                            type="button"
                            style={{ flex: 1, padding: '6px 0', background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            onClick={async () => {
                              try {
                                const response = await api.publishFacultyQuiz(quiz.id);
                                if (!response?.success) throw new Error(response?.message || 'Quiz could not be published.');
                                setQuizList((previous) => previous.map((item) => item.id === quiz.id ? { ...item, status: 'Live' } : item));
                                triggerToast('Quiz is now live for students.');
                              } catch (error) {
                                setQuizLoadError(error.message || 'Could not publish this quiz.');
                              }
                            }}
                          >
                            ● Go Live
                          </button>
                        )}
                        <button
                          type="button"
                          style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                          onClick={async () => {
                            try {
                              const response = await api.deleteFacultyQuiz(quiz.id);
                              if (!response?.success) throw new Error(response?.message || 'Quiz could not be deleted.');
                              setQuizList((previous) => previous.filter((item) => item.id !== quiz.id));
                              triggerToast('Quiz deleted.');
                            } catch (error) {
                              setQuizLoadError(error.message || 'Could not delete this quiz.');
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {quizList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <ClipboardList size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <h3 style={{ color: '#334155', margin: '0 0 8px', fontWeight: 700 }}>No quizzes yet</h3>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>Click "Add Quiz" to create your first quiz.</p>
                </div>
              )}
            </div>
          )}

    {/* ── NOTE VIEWER MODAL ── */}
    {viewingNote && (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
        onClick={() => setViewingNote(null)}
      >
        <div
          style={{ background: '#ffffff', borderRadius: '18px', maxWidth: '680px', width: '100%', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={() => setViewingNote(null)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >×</button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '44px', height: '44px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', flexShrink: 0 }}>
              <FileText size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{viewingNote.subject}</div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', lineHeight: 1.3 }}>{viewingNote.topic}</h3>
              <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                Lecture Date: <strong>{viewingNote.date}</strong> &nbsp;·&nbsp;
                Uploaded by: <strong>{viewingNote.uploadedBy?.name}</strong>
                <span style={{ color: '#64748b', marginLeft: '4px', fontWeight: 500 }}>(Roll {viewingNote.uploadedBy?.rollNumber})</span>
              </div>
            </div>
            {viewingNote.isFacultyVerified ? (
              <span style={{ flexShrink: 0, fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #86efac' }}>
                <ShieldCheck size={13} /> Verified
              </span>
            ) : (
              <span style={{ flexShrink: 0, fontSize: '0.75rem', background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, border: '1px solid #fde68a' }}>Pending</span>
            )}
          </div>

          {/* Note Content */}
          <div style={{ background: '#0f172a', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {viewingNote.fileType === 'application/pdf' ? (
              <div style={{ color: '#ffffff', padding: '20px' }}>
                <FileText size={56} style={{ color: '#818cf8', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 600 }}>{viewingNote.fileName || 'Class_Notes.pdf'}</div>
                <a
                  href={viewingNote.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', fontSize: '0.82rem', marginTop: '10px', display: 'inline-block' }}
                >
                  Open PDF in New Tab ↗
                </a>
              </div>
            ) : (
              <img
                src={viewingNote.fileUrl}
                alt={viewingNote.topic}
                style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '8px', display: 'block', margin: '0 auto' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          {/* Description */}
          {viewingNote.description && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
              <strong style={{ display: 'block', marginBottom: '4px', color: '#0f172a' }}>Summary / Description</strong>
              {viewingNote.description}
            </div>
          )}

          {/* Reports alert */}
          {viewingNote.reports?.length > 0 && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Flag size={16} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.84rem', color: '#7f1d1d' }}>
                <strong>{viewingNote.reports.length} report(s) filed</strong> — Review content before verifying.
                {viewingNote.reports.map((r, i) => (
                  <div key={i} style={{ marginTop: '4px', fontSize: '0.78rem' }}>• {r.reason}</div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              style={{ padding: '8px 18px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setViewingNote(null)}
            >Close</button>
            {!viewingNote.isFacultyVerified && (
              <button
                type="button"
                style={{ padding: '8px 18px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={async () => {
                  await handleVerifyNote(viewingNote.id);
                  setViewingNote(null);
                }}
              >
                <ShieldCheck size={15} /> Verify This Note
              </button>
            )}
          </div>
        </div>
      </div>
    )}

    {/* ── ADD QUIZ MODAL ── */}
    {showAddQuiz && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}
        onClick={() => setShowAddQuiz(false)}
      >
        <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '820px', width: '100%', padding: '32px', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', position: 'relative', marginTop: '20px', marginBottom: '20px' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Modal close */}
          <button onClick={() => setShowAddQuiz(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>

          {/* Modal header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg,#4338ca,#7c3aed)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>Create New Quiz</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Step {quizStep} of 2 — {quizStep === 1 ? 'Quiz Details & Settings' : '10 Multiple Choice Questions'}</p>
            </div>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: '4px', borderRadius: '99px', background: s <= quizStep ? '#4338ca' : '#e2e8f0', transition: 'background 0.3s' }} />
            ))}
          </div>

          {/* Error banner */}
          {quizFormError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {quizFormError}
            </div>
          )}

          {/* STEP 1: Quiz Meta */}
          {quizStep === 1 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Quiz Title <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
                    placeholder="e.g. Data Structures – Quiz 3: Trees & Graphs"
                    value={quizMeta.title}
                    onChange={e => setQuizMeta({ ...quizMeta, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Subject <span style={{ color: '#dc2626' }}>*</span></label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', boxSizing: 'border-box' }}
                    value={quizMeta.subject} onChange={e => setQuizMeta({ ...quizMeta, subject: e.target.value })}>
                    <option>Data Structures</option>
                    <option>Operating Systems</option>
                    <option>Computer Networks</option>
                    <option>Artificial Intelligence</option>
                    <option>Machine Learning</option>
                    <option>Compiler Design</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Section <span style={{ color: '#dc2626' }}>*</span></label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', boxSizing: 'border-box' }}
                    value={quizMeta.section} onChange={e => setQuizMeta({ ...quizMeta, section: e.target.value })}>
                    <option>Section A</option>
                    <option>Section B</option>
                    <option>Section C</option>
                    <option>All Sections</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Quiz Date <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="date" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    value={quizMeta.date} onChange={e => setQuizMeta({ ...quizMeta, date: e.target.value })} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Time Limit (minutes) <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="number" min={5} max={120} style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    value={quizMeta.time} onChange={e => setQuizMeta({ ...quizMeta, time: Number(e.target.value) })} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Total Marks</label>
                  <input type="number" min={1} max={100} style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    value={quizMeta.totalMarks} onChange={e => setQuizMeta({ ...quizMeta, totalMarks: Number(e.target.value) })} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Initial Status</label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', boxSizing: 'border-box' }}
                    value={quizMeta.status} onChange={e => setQuizMeta({ ...quizMeta, status: e.target.value })}>
                    <option value="Draft">Draft (save for later)</option>
                    <option value="Scheduled">Scheduled (publish on date)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  style={{ padding: '9px 22px', background: '#4338ca', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    if (!quizMeta.title.trim()) { setQuizFormError('Quiz title is required.'); return; }
                    if (!quizMeta.date) { setQuizFormError('Please set the quiz date.'); return; }
                    setQuizFormError(''); setQuizStep(2);
                  }}
                >
                  Next: Add Questions →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Questions Builder */}
          {quizStep === 2 && (
            <div>
              <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {quizQuestions.map((q, qi) => (
                  <div key={q.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    {/* Question number + question text */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ flexShrink: 0, width: '26px', height: '26px', background: '#4338ca', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, marginTop: '2px' }}>Q{qi + 1}</span>
                      <input
                        type="text"
                        style={{ flex: 1, padding: '7px 11px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
                        placeholder={`Question ${qi + 1} — e.g. What is the time complexity of...`}
                        value={q.question}
                        onChange={e => updateQuestion(qi, 'question', e.target.value)}
                      />
                    </div>

                    {/* 4 Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginLeft: '36px' }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', border: q.correct === oi ? '2px solid #16a34a' : '2px solid #cbd5e1', background: q.correct === oi ? '#dcfce7' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800, color: q.correct === oi ? '#16a34a' : '#94a3b8', title: 'Mark as correct answer' }}
                            onClick={() => updateQuestion(qi, 'correct', oi)}
                          >
                            {String.fromCharCode(65 + oi)}
                          </label>
                          <input
                            type="text"
                            style={{ flex: 1, padding: '6px 10px', border: q.correct === oi ? '1.5px solid #86efac' : '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.82rem', background: q.correct === oi ? '#f0fdf4' : '#fff', outline: 'none' }}
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                            value={opt}
                            onChange={e => updateOption(qi, oi, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginLeft: '36px', marginTop: '6px', fontSize: '0.72rem', color: '#64748b' }}>
                      ✓ Click the circle letter to mark the correct answer
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #e2e8f0', marginTop: '14px' }}>
                <button type="button" style={{ padding: '9px 18px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => { setQuizStep(1); setQuizFormError(''); }}>
                  ← Back
                </button>
                <button type="button" style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#4338ca,#7c3aed)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}
                  onClick={handleAddQuizSubmit}>
                  <CheckCircle2 size={16} /> Save Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

          {/* TAB: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div>
              {/* Sub-tab switcher */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                <button
                  type="button"
                  onClick={() => setDocsViewMode('student_docs')}
                  style={{
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '7px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: docsViewMode === 'student_docs' ? '#ffffff' : 'transparent',
                    color: docsViewMode === 'student_docs' ? '#1e293b' : '#64748b',
                    boxShadow: docsViewMode === 'student_docs' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  🎓 Student Uploaded Documents (Section & Semester Registry)
                </button>
                <button
                  type="button"
                  onClick={() => setDocsViewMode('campus_docs')}
                  style={{
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '7px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: docsViewMode === 'campus_docs' ? '#ffffff' : 'transparent',
                    color: docsViewMode === 'campus_docs' ? '#1e293b' : '#64748b',
                    boxShadow: docsViewMode === 'campus_docs' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  🏛️ Campus Circulars &amp; Notices ({campusDocs.length})
                </button>
              </div>

              {docsViewMode === 'student_docs' ? (
                <StudentDocumentsTable portalRole="faculty" />
              ) : (() => {
                const catColor = { Academic: '#2563eb', Examination: '#dc2626', Training: '#d97706', Circular: '#7c3aed', Notice: '#059669', Other: '#475569' };
                const fileTypeColor = { PDF: '#dc2626', DOCX: '#2563eb', XLSX: '#16a34a', PPTX: '#d97706', JPG: '#9333ea', PNG: '#0891b2' };
                const filtered = campusDocs.filter(d =>
                  d.title.toLowerCase().includes(docsSearch.toLowerCase()) ||
                  (d.category || '').toLowerCase().includes(docsSearch.toLowerCase()) ||
                  (d.description || '').toLowerCase().includes(docsSearch.toLowerCase())
                );
                return (
                  <div>
                    <div className="admin-view-header">
                      <div>
                        <h2>Campus Documents</h2>
                        <p>Institutional documents shared with Faculty by the Administration. ({campusDocs.length} available)</p>
                      </div>
                    </div>

                    <div className="admin-search-wrap" style={{ marginBottom: '1.25rem', maxWidth: '480px' }}>
                      <Search size={15} style={{ color: '#94a3b8' }} />
                      <input
                        className="admin-search-input"
                        placeholder="Search documents…"
                        value={docsSearch}
                        onChange={e => setDocsSearch(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                      {filtered.map(doc => (
                        <div key={doc.id} className="admin-card" style={{ marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: catColor[doc.category] || '#2563eb' }} />
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: catColor[doc.category] || '#64748b', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{doc.category}</span>
                            <span style={{ background: fileTypeColor[doc.fileType] || '#64748b', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{doc.fileType || 'FILE'}</span>
                          </div>
                          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.3 }}>{doc.title}</h3>
                          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>{doc.description || 'No description.'}</p>
                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', fontSize: '0.72rem', color: '#64748b' }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>{doc.uploadedBy}</span> · {doc.fileSize || '—'} · {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      ))}
                      {filtered.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                          <FileText size={40} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                          <p style={{ margin: 0, fontWeight: 600 }}>No documents available</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="faculty" />
          )}
        </div>
      </AppLayout>

    {/* ── VIEW QUIZ QUESTIONS MODAL ── */}
    {viewQuiz && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}
        onClick={() => setViewQuiz(null)}>
        <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '740px', width: '100%', padding: '30px', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', position: 'relative', marginTop: '20px', marginBottom: '20px' }}
          onClick={e => e.stopPropagation()}>
          <button onClick={() => setViewQuiz(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{viewQuiz.id} · {viewQuiz.subject} · {viewQuiz.section}</div>
            <h2 style={{ margin: '4px 0 6px', color: '#0f172a', fontSize: '1.3rem' }}>{viewQuiz.title}</h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#64748b' }}>
              <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{viewQuiz.date}</span>
              <span><Timer size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{viewQuiz.time} mins</span>
              <span><ClipboardList size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{viewQuiz.totalMarks} Marks</span>
            </div>
          </div>

          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {viewQuiz.questions.map((q, qi) => (
              <div key={q.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ flexShrink: 0, width: '24px', height: '24px', background: '#4338ca', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>Q{qi + 1}</span>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.4 }}>{q.question || <em style={{ color: '#64748b' }}>Question not set</em>}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginLeft: '34px' }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 10px', borderRadius: '8px', background: q.correct === oi ? '#dcfce7' : '#ffffff', border: q.correct === oi ? '1.5px solid #86efac' : '1px solid #e2e8f0', fontSize: '0.83rem', color: q.correct === oi ? '#15803d' : '#334155', fontWeight: q.correct === oi ? 700 : 400 }}>
                      <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: q.correct === oi ? '#16a34a' : '#e2e8f0', color: q.correct === oi ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{String.fromCharCode(65 + oi)}</span>
                      {opt || <em style={{ color: '#cbd5e1' }}>Empty</em>}
                      {q.correct === oi && <CheckCircle2 size={13} color="#16a34a" style={{ marginLeft: 'auto' }} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'right', paddingTop: '16px', borderTop: '1px solid #e2e8f0', marginTop: '16px' }}>
            <button type="button" style={{ padding: '9px 22px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setViewQuiz(null)}>Close</button>
          </div>
        </div>
      </div>
    )}
    {/* COMPREHENSIVE ATTENDANCE MODAL (CLASS ATTENDANCE & ACADEMIC ACTIVITY SYSTEM) */}
    {isAttendanceModalOpen && (
      <TakeAttendanceModule
        account={account}
        role="faculty"
        isModal={true}
        initialOpenModel={openModelOnAttendanceModal}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setOpenModelOnAttendanceModal(false);
        }}
        initialAssignment={activeAttendanceTarget || currentAssignment}
        initialSubjectCode={activeAttendanceTarget?.subjectCode || currentAssignment?.subjectCode || 'CS501'}
        initialSubjectName={activeAttendanceTarget?.subjectName || currentAssignment?.subjectName || 'Data Structures & Algorithms'}
        initialSection={activeAttendanceTarget?.section || currentAssignment?.section || 'Section A'}
        initialCourse={activeAttendanceTarget?.assignedCourse || activeAttendanceTarget?.course || currentAssignment?.course || 'B.Tech'}
        initialBatch={activeAttendanceTarget?.batch || currentAssignment?.batch || '2023–2027'}
        initialBranch={activeAttendanceTarget?.assignedBranch || activeAttendanceTarget?.branch || currentAssignment?.branch || 'CSE'}
        onAttendanceSubmitted={(submittedSession) => {
          triggerToast(`✓ Attendance and ${submittedSession.activityType} details recorded successfully!`);
          setIsAttendanceModalOpen(false);
        }}
      />
    )}

    {/* MODAL 1: SUBJECT DETAILS MODAL (6 TABS) */}
    {selectedSubjectModal && (
      <div className="admin-modal-overlay" onClick={() => setSelectedSubjectModal(null)}>
        <div className="admin-modal-card" style={{ maxWidth: '850px', width: '95%' }} onClick={e => e.stopPropagation()}>
          <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="admin-badge active" style={{ marginRight: '8px' }}>
                {selectedSubjectModal.subjectCode || selectedSubjectModal.code}
              </span>
              <h3 style={{ display: 'inline', margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                {selectedSubjectModal.subjectName || selectedSubjectModal.name}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {selectedSubjectModal.program || 'B.Tech'} · {selectedSubjectModal.semester || 'Semester 5'} · {selectedSubjectModal.section || 'Section A'} · {selectedSubjectModal.credits || 4} Credits · {selectedSubjectModal.type || 'Theory & Practical'}
              </p>
            </div>
            <button
              className="admin-modal-close"
              onClick={() => setSelectedSubjectModal(null)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '0 1.25rem' }}>
            <div className="faculty-modal-tabs">
              {[
                { id: 'overview', label: 'Course Overview' },
                { id: 'students', label: `Cohort Students (${scopedStudents.length})` },
                { id: 'attendance', label: 'Attendance Records' },
                { id: 'assessments', label: 'Assessments Scheme (13)' },
                { id: 'resources', label: 'Curricular Materials' },
                { id: 'reports', label: 'Gazette & Reports' }
              ].map(t => (
                <button
                  key={t.id}
                  className={`faculty-modal-tab-btn ${selectedSubjectModal.activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedSubjectModal({ ...selectedSubjectModal, activeTab: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '1rem 1.25rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {selectedSubjectModal.activeTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LECTURE VENUE</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedSubjectModal.room || 'Block B - Room 302'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LABORATORY</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedSubjectModal.labRoom || 'Advanced Computing Lab 2'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ENROLLMENT SCOPE</span>
                    <div style={{ fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>32 Cohort (91 Course Total)</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>HOD APPROVAL</span>
                    <div style={{ fontWeight: 700, color: '#059669', marginTop: '2px' }}>Approved by Prof. B. Panda</div>
                  </div>
                </div>

                <h4 style={{ margin: '1rem 0 0.5rem', color: '#1e293b' }}>Approved Autonomous Syllabus Modules</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                    <strong>Module I: Linear Data Structures (12 Hours)</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Arrays, multi-dimensional structures, singly &amp; doubly linked lists, stacks, queues, circular buffers.</p>
                  </div>
                  <div style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                    <strong>Module II: Hierarchical Structures &amp; Non-Linear Models (14 Hours)</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Binary trees, BST operations, AVL balance factors, heaps, graph representation (adjacency list &amp; matrix).</p>
                  </div>
                  <div style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                    <strong>Module III: Search, Sort &amp; Hashing Algorithms (14 Hours)</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Merge sort, quick sort, heap sort, hash functions, collision resolution (chaining &amp; open addressing).</p>
                  </div>
                </div>
              </div>
            )}

            {selectedSubjectModal.activeTab === 'students' && (
              <div className="admin-table-container">
                <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Roll #</th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Attendance %</th>
                      <th>CGPA</th>
                      <th>CIA Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedStudents.map(st => (
                      <tr key={st.id}>
                        <td><strong>#{st.rollNumber}</strong></td>
                        <td>{st.name}</td>
                        <td><code>{st.registrationNumber || st.studentId}</code></td>
                        <td style={{ color: (st.attendance || 85) < 75 ? '#dc2626' : '#2563eb', fontWeight: 700 }}>
                          {st.attendance || 85}%
                        </td>
                        <td><strong style={{ color: '#059669' }}>{st.cgpa}</strong></td>
                        <td><span className="admin-badge approved">Up-to-date</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedSubjectModal.activeTab === 'attendance' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <strong>Recent Attendance Sessions Logged</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Authoritative attendance registers for {selectedSubjectModal.subjectCode || selectedSubjectModal.code}.</p>
                  </div>
                  <button className="admin-action-btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => { setSelectedSubjectModal(null); handleOpenAttendanceModal(); }}>
                    <Calendar size={13} /> Log New Session
                  </button>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Period</th>
                        <th>Enrolled</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Turnout %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map(ah => (
                        <tr key={ah.id}>
                          <td><strong>{ah.date}</strong></td>
                          <td>{ah.period}</td>
                          <td>{ah.totalEnrolled}</td>
                          <td style={{ color: '#059669', fontWeight: 600 }}>{ah.presentCount}</td>
                          <td style={{ color: '#dc2626', fontWeight: 600 }}>{ah.absentCount}</td>
                          <td><strong>{ah.percentage}%</strong></td>
                          <td><span className="admin-badge approved">{ah.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedSubjectModal.activeTab === 'assessments' && (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>13 Continuous Internal Assessment (CIA) Components</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Scaled to 20% CIA contribution towards official autonomous university grading.</p>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Component Name</th>
                        <th>Category</th>
                        <th>Max Marks</th>
                        <th>Weightage</th>
                        <th>Deadline</th>
                        <th>Workflow Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Modular Examination 1', cat: 'Modular', max: 20, w: '20%', dl: '05 Oct 2026', st: 'Completed & Locked' },
                        { name: 'Modular Examination 2', cat: 'Modular', max: 20, w: '20%', dl: '28 Oct 2026', st: 'Scheduled' },
                        { name: 'Quiz 1 to 6 (Average)', cat: 'Continuous', max: 10, w: '10%', dl: '15 Oct 2026', st: 'In Progress (4 Done)' },
                        { name: 'Assignment 1 & 2', cat: 'Submission', max: 10, w: '10%', dl: '20 Oct 2026', st: 'Evaluated' },
                        { name: 'Surprise Test 1 & 2', cat: 'Unannounced', max: 10, w: '10%', dl: '18 Oct 2026', st: 'Completed' },
                        { name: 'Lab Practical & Viva', cat: 'Laboratory', max: 30, w: '30%', dl: '25 Oct 2026', st: 'Ongoing' }
                      ].map(c => (
                        <tr key={c.name}>
                          <td><strong>{c.name}</strong></td>
                          <td><span className="admin-badge active">{c.cat}</span></td>
                          <td>{c.max}</td>
                          <td><strong>{c.w}</strong></td>
                          <td>{c.dl}</td>
                          <td><span className="admin-badge approved">{c.st}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedSubjectModal.activeTab === 'resources' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { title: 'Official Autonomous Curriculum Syllabus Document', type: 'PDF', size: '1.4 MB', date: '01 Aug 2026' },
                  { title: 'Lecture Notes: Non-Linear Trees & AVL Balance', type: 'PDF', size: '3.8 MB', date: '25 Sep 2026' },
                  { title: 'Laboratory Manual: Graph Algorithms & Minimum Spanning Tree', type: 'PDF', size: '2.1 MB', date: '10 Sep 2026' },
                  { title: 'Previous Year Autonomous Question Paper Bank (2023-2025)', type: 'ZIP', size: '8.4 MB', date: '02 Oct 2026' }
                ].map(r => (
                  <div key={r.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="#2563eb" />
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{r.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.type} · {r.size} · Uploaded {r.date}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => triggerToast(`Downloading ${r.title}...`)}
                    >
                      <Download size={12} /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedSubjectModal.activeTab === 'reports' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>Continuous Assessment (CIA) Department Gazette PDF</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Official certified gazette return for HOD verification and Controller of Examinations.</p>
                  </div>
                  <button
                    className="admin-action-btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={() => downloadDepartmentGazettePdf(`${selectedSubjectModal.subjectCode || selectedSubjectModal.code} CIA Gazette`)}
                  >
                    <Download size={13} /> Download PDF
                  </button>
                </div>
                <div style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>Complete Student Marks Register (CSV)</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Raw export of all entered grades across all 13 assessment columns.</p>
                  </div>
                  <button
                    className="admin-action-btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={() => exportToCsv(`${selectedSubjectModal.subjectCode || selectedSubjectModal.code}_Marks_Register.csv`, scopedStudents.map((s, i) => ({ Roll: s.rollNumber, Name: s.name, FinalCIA: '17.4', Grade: 'A+' })))}
                  >
                    <FileSpreadsheet size={13} /> Export CSV
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="admin-action-btn-secondary" onClick={() => setSelectedSubjectModal(null)}>
              Close Window
            </button>
          </div>
        </div>
      </div>
    )}

    {/* MODAL 2: STUDENT PROFILE MODAL (5 TABS) */}
    {selectedStudentModal && (
      <div className="admin-modal-overlay" onClick={() => setSelectedStudentModal(null)}>
        <div className="admin-modal-card" style={{ maxWidth: '820px', width: '95%' }} onClick={e => e.stopPropagation()}>
          <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="admin-badge active">Roll #{selectedStudentModal.student?.rollNumber}</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  {selectedStudentModal.student?.name}
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                <code>{selectedStudentModal.student?.registrationNumber || selectedStudentModal.student?.studentId}</code> · {selectedStudentModal.student?.email} · {selectedStudentModal.student?.semester || 'Semester 5'} · {selectedStudentModal.student?.section || 'Section A'}
              </p>
            </div>
            <button
              className="admin-modal-close"
              onClick={() => setSelectedStudentModal(null)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '0 1.25rem' }}>
            <div className="faculty-modal-tabs">
              {[
                { id: 'overview', label: 'Academic Overview' },
                { id: 'attendance', label: 'Attendance Breakdown' },
                { id: 'assessments', label: 'Continuous Assessment' },
                { id: 'trends', label: 'Performance Trends' },
                { id: 'remedial', label: 'Remedial & Mentorship' }
              ].map(t => (
                <button
                  key={t.id}
                  className={`faculty-modal-tab-btn ${selectedStudentModal.activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedStudentModal({ ...selectedStudentModal, activeTab: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '1rem 1.25rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {selectedStudentModal.activeTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CUMULATIVE CGPA</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                      {selectedStudentModal.student?.cgpa || '8.5'}
                    </div>
                    <small style={{ color: '#64748b' }}>Autonomous Standing: First Class with Distinction</small>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ATTENDANCE RATE</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: (selectedStudentModal.student?.attendance || 85) < 75 ? '#dc2626' : '#2563eb', marginTop: '2px' }}>
                      {selectedStudentModal.student?.attendance || 85}%
                    </div>
                    <small style={{ color: (selectedStudentModal.student?.attendance || 85) < 75 ? '#dc2626' : '#059669' }}>
                      {(selectedStudentModal.student?.attendance || 85) < 75 ? 'Shortage Alert (<75%)' : 'Eligible for Exams'}
                    </small>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ACADEMIC BATCH</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>2024 - 2028 (Autonomous)</div>
                    <small style={{ color: '#64748b' }}>Assigned Mentor: Prof. B. Panda</small>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CIA STATUS</span>
                    <div style={{ fontWeight: 700, color: '#059669', marginTop: '4px' }}>Qualified (17.4 / 20)</div>
                    <small style={{ color: '#64748b' }}>All 13 components evaluated</small>
                  </div>
                </div>

                <h4 style={{ margin: '0.5rem 0', color: '#1e293b' }}>Institutional Contact &amp; Registry Details</h4>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div><strong>Program:</strong> B.Tech in Computer Science &amp; Engineering</div>
                    <div><strong>Current Semester:</strong> Semester 5 (Autumn 2026)</div>
                    <div><strong>Registration Number:</strong> {selectedStudentModal.student?.registrationNumber || '2201210045'}</div>
                    <div><strong>Official Email:</strong> {selectedStudentModal.student?.email}</div>
                    <div><strong>Hostel Residence:</strong> Aryabhatta Hall of Residence, Room 214</div>
                    <div><strong>Library Clearance:</strong> Cleared (0 Overdue)</div>
                  </div>
                </div>
              </div>
            )}

            {selectedStudentModal.activeTab === 'attendance' && (
              <div>
                <h4 style={{ margin: '0 0 0.75rem', color: '#1e293b' }}>Subject-wise Lecture Attendance Breakdown</h4>
                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Title</th>
                        <th>Conducted</th>
                        <th>Attended</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { code: 'CS501', title: 'Data Structures', total: 42, attended: Math.round(42 * ((selectedStudentModal.student?.attendance || 85) / 100)), pct: selectedStudentModal.student?.attendance || 85 },
                        { code: 'CS502', title: 'Operating Systems', total: 38, attended: 35, pct: 92 },
                        { code: 'CS503', title: 'Database Management Systems', total: 40, attended: 37, pct: 92.5 },
                        { code: 'CS504', title: 'Design & Analysis of Algorithms', total: 36, attended: 32, pct: 88.9 }
                      ].map(sub => (
                        <tr key={sub.code}>
                          <td><strong>{sub.code}</strong></td>
                          <td>{sub.title}</td>
                          <td>{sub.total} Classes</td>
                          <td>{sub.attended} Classes</td>
                          <td><strong style={{ color: sub.pct < 75 ? '#dc2626' : '#2563eb' }}>{sub.pct}%</strong></td>
                          <td>
                            <span className={`admin-badge ${sub.pct >= 75 ? 'approved' : 'inactive'}`}>
                              {sub.pct >= 75 ? 'Qualified' : 'Shortage'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedStudentModal.activeTab === 'assessments' && (
              <div>
                <h4 style={{ margin: '0 0 0.75rem', color: '#1e293b' }}>Data Structures (CS501) Continuous Evaluation Score Sheet</h4>
                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Max Marks</th>
                        <th>Scored Marks</th>
                        <th>Scaled Attainment</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { comp: 'Modular Examination 1', max: 20, scored: 18.0, scaled: '18 / 20', rem: 'High Distinction' },
                        { comp: 'Modular Examination 2', max: 20, scored: 17.5, scaled: '17.5 / 20', rem: 'Good Performance' },
                        { comp: 'Quiz 1 to 6 (Average)', max: 10, scored: 8.5, scaled: '8.5 / 10', rem: 'Consistently Strong' },
                        { comp: 'Assignments 1 & 2', max: 10, scored: 9.0, scaled: '9.0 / 10', rem: 'Submitted on time' },
                        { comp: 'Surprise Tests 1 & 2', max: 10, scored: 8.0, scaled: '8.0 / 10', rem: 'Satisfactory' },
                        { comp: 'Lab Practical & Viva', max: 30, scored: 27.0, scaled: '27.0 / 30', rem: 'Excellent code execution' }
                      ].map(c => (
                        <tr key={c.comp}>
                          <td><strong>{c.comp}</strong></td>
                          <td>{c.max}</td>
                          <td><strong style={{ color: '#059669' }}>{c.scored}</strong></td>
                          <td>{c.scaled}</td>
                          <td><small style={{ color: '#64748b' }}>{c.rem}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedStudentModal.activeTab === 'trends' && (
              <div>
                <h4 style={{ margin: '0 0 0.75rem', color: '#1e293b' }}>Semester-wise SGPA Progression</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { sem: 'Semester 1', sgpa: 8.4 },
                    { sem: 'Semester 2', sgpa: 8.6 },
                    { sem: 'Semester 3', sgpa: 8.5 },
                    { sem: 'Semester 4', sgpa: 8.8 },
                    { sem: 'Semester 5 (Mid-Term Forecast)', sgpa: selectedStudentModal.student?.cgpa || 8.9 }
                  ].map(s => (
                    <div key={s.sem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                        <strong>{s.sem}</strong>
                        <span style={{ color: '#059669', fontWeight: 700 }}>{s.sgpa} SGPA</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(s.sgpa / 10) * 100}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStudentModal.activeTab === 'remedial' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <strong>Academic Support &amp; Remedial Interventions</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Recorded support sessions and mentor follow-ups.</p>
                  </div>
                  <button
                    className="admin-action-btn-primary"
                    style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                    onClick={() => {
                      setRemedialActionModal(selectedStudentModal.student);
                      setSelectedStudentModal(null);
                    }}
                  >
                    + Log New Remedial Action
                  </button>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="admin-badge approved">Special Doubt Clearing Tutorial</span>
                    <small style={{ color: '#64748b' }}>Target Date: 16 Oct 2026</small>
                  </div>
                  <p style={{ margin: '6px 0 2px', fontSize: '0.82rem', color: '#334155' }}>
                    Assigned problem-solving tutorial session for binary search tree balancing and dynamic programming concepts.
                  </p>
                  <small style={{ color: '#2563eb', fontWeight: 600 }}>Logged by Dr. S. Mohanty · Department of CSE</small>
                </div>
              </div>
            )}
          </div>

          <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              className="admin-action-btn-secondary"
              onClick={() => {
                setRemedialActionModal(selectedStudentModal.student);
                setSelectedStudentModal(null);
              }}
            >
              Remedial Intervention
            </button>
            <button className="admin-action-btn-primary" onClick={() => setSelectedStudentModal(null)}>
              Close Profile
            </button>
          </div>
        </div>
      </div>
    )}

    {/* MODAL 3: REMEDIAL INTERVENTION LOGGING MODAL */}
    {remedialActionModal && (
      <div className="admin-modal-overlay" onClick={() => setRemedialActionModal(null)}>
        <div className="admin-modal-card" style={{ maxWidth: '580px', width: '95%' }} onClick={e => e.stopPropagation()}>
          <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Log Remedial Intervention</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Target Student: <strong>{remedialActionModal.name}</strong> (Roll #{remedialActionModal.rollNumber})
              </p>
            </div>
            <button
              className="admin-modal-close"
              onClick={() => setRemedialActionModal(null)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', marginBottom: '1rem', fontSize: '0.8rem', color: '#991b1b' }}>
              <strong>Early-Warning Trigger:</strong> Attendance record is {remedialActionModal.attendance || 85}%, triggering autonomous remedial tracking and mentor notification.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  INTERVENTION TYPE
                </label>
                <select
                  className="admin-form-select"
                  value={remedialForm.type}
                  onChange={e => setRemedialForm({ ...remedialForm, type: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Extra Tutorial">Extra Tutorial / Doubt Clearing Session</option>
                  <option value="Academic Counselling">Academic Counselling &amp; Mentoring</option>
                  <option value="Guardian Notice">Formal Guardian Notice &amp; Attendance Advisory</option>
                  <option value="Departmental Referral">Departmental Referral to HOD / Faculty Advisor</option>
                  <option value="Peer Study Group">Peer Study Group &amp; Lab Practice Assignment</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  TARGET FOLLOW-UP DATE
                </label>
                <input
                  type="date"
                  className="admin-form-input"
                  value={remedialForm.followUpDate}
                  onChange={e => setRemedialForm({ ...remedialForm, followUpDate: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  ACTION PLAN &amp; FACULTY NOTES
                </label>
                <textarea
                  className="admin-form-input"
                  rows={3}
                  value={remedialForm.notes}
                  onChange={e => setRemedialForm({ ...remedialForm, notes: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button className="admin-action-btn-secondary" onClick={() => setRemedialActionModal(null)}>
              Cancel
            </button>
            <button
              className="admin-action-btn-primary"
              onClick={async () => {
                try {
                  await facultyApi.logRemedialIntervention({
                    studentId: remedialActionModal.studentId || remedialActionModal.id,
                    studentName: remedialActionModal.name,
                    rollNumber: remedialActionModal.rollNumber,
                    ...remedialForm
                  });
                } catch (err) {
                  // fallback handled
                }
                triggerToast(`✓ Remedial action logged for ${remedialActionModal.name}!`);
                setRemedialActionModal(null);
              }}
            >
              Confirm &amp; Log Intervention
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 360 Student Dossier Modal */}
    {dossierModalStudent && (
      <Student360DossierModal
        isOpen={!!dossierModalStudent}
        student={dossierModalStudent}
        onClose={() => setDossierModalStudent(null)}
        sender={{ name: account?.name || 'Dr. A. K. Nayak', role: 'Faculty', deptCode: 'CSE' }}
        onOpenParentNoticeModal={(st) => {
          setDossierModalStudent(null);
          setParentNoticeModalStudent(st);
        }}
      />
    )}

    {/* Direct Parent Notice Dispatcher Modal */}
    {parentNoticeModalStudent && (
      <DirectParentNoticeModal
        isOpen={!!parentNoticeModalStudent}
        student={parentNoticeModalStudent}
        onClose={() => setParentNoticeModalStudent(null)}
        sender={{ name: account?.name || 'Dr. A. K. Nayak', role: 'Faculty', deptCode: 'CSE' }}
        onNoticeSent={(res) => {
          triggerToast(`Official parent notice dispatched to ${res.parentName} via ${res.channels.join(', ')}`);
        }}
      />
    )}
  </>
  );
}
