import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Unlock,
  FileText,
  Search,
  Download,
  LogOut,
  Layers,
  ArrowRight,
  Eye,
  MessageSquare,
  X,
  Menu,
  Bell,
  Calendar,
  Filter,
  BarChart2,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  ClipboardList,
  CheckSquare,
  Square,
  UserCheck,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ClipboardCheck,
  Camera,
  ShieldAlert,
  Megaphone,
  Check,
  CalendarDays,
  PartyPopper,
  MapPin,
  Building2,
  Send,
  Share2,
  Mail,
  Phone,
  Award,
  FileCheck,
  Radio,
  Home
} from 'lucide-react';
import CalendarWidget from './CalendarWidget.jsx';
import HolidayListWidget from './HolidayListWidget.jsx';
import TakeAttendanceModule from './Attendance/TakeAttendanceModule.jsx';
import { AppLayout } from './Navigation';
import '../DashboardHome.css';
import './FacultyPortal.css';
import './HodPortal.css';
import '../components/AdminPortal.css';
import { downloadDepartmentGazettePdf } from '../utils/pdfGenerator';
import { initialApprovalQueue, initialFaculty, initialSubjects, initialFacultyAssignments } from '../data/collegeData.js';
import { erpStore } from '../services/erpStore.js';
import MarksManagementModule from '../marks/MarksManagementModule.jsx';
import { api, hodApi } from '../services/api.js';
import { getDocumentsForRole, getAllStudents } from '../services/studentStore.js';
import { useTimeGreeting, getGreetingDisplayName } from '../utils/timeGreeting.js';
import { isDemoAccount } from '../utils/authUtils.js';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import DigitalAnswerSheetEvaluationSystem from './DigitalEvaluation/DigitalAnswerSheetEvaluationSystem.jsx';
import TimetableManager from './TimetableManagement/TimetableManager.jsx';
import PublicTimetable from './PublicTimetable.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import HodGrievanceMonitoringModule from './HodGrievanceMonitoringModule.jsx';
import NotificationCenter from './Notifications/NotificationCenter.jsx';
import { complaintsApi } from '../services/complaintsApi.js';
import { notificationsApi } from '../services/notificationsApi.js';
import DirectParentNoticeModal from './Common/DirectParentNoticeModal.jsx';
import Student360DossierModal from './Common/Student360DossierModal.jsx';
import OfficialEmployeeProfile from './Profile/OfficialEmployeeProfile.jsx';
import HodAcademicIntegrationModule from './hod/HodAcademicIntegrationModule.jsx';
import { getStudentComprehensiveDetails, dispatchParentNotice } from '../services/parentNoticeService.js';

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

function DetailRow({ label, value }) {
  return <div className="student-detail-row"><dt>{label}</dt><dd>{value}</dd></div>;
}

export function getStudentInternalMarks(student) {
  const rollInt = parseInt(student.rollNumber, 10) || 1;
  const mid1 = Math.min(30, Math.max(12, Math.floor(18 + ((rollInt * 7) % 13))));
  const mid2 = Math.min(30, Math.max(14, Math.floor(20 + ((rollInt * 11) % 11))));
  const q1 = Math.min(10, Math.max(5, Math.floor(6 + ((rollInt * 3) % 5))));
  const q2 = Math.min(10, Math.max(5, Math.floor(7 + ((rollInt * 2) % 4))));
  const q3 = Math.min(10, Math.max(4, Math.floor(5 + ((rollInt * 5) % 6))));

  const hasMissingQuiz4 = ['04', '07', '18'].includes(student.rollNumber);
  const hasMissingPractical = ['07', '22'].includes(student.rollNumber);

  const q4 = hasMissingQuiz4 ? null : Math.min(10, Math.max(6, Math.floor(7 + ((rollInt * 4) % 4))));
  const assignment = Math.min(10, Math.max(6, Math.floor(7 + ((rollInt * 9) % 4))));
  const practical = hasMissingPractical ? null : Math.min(10, Math.max(7, Math.floor(8 + ((rollInt * 3) % 3))));

  const hasMissing = hasMissingQuiz4 || hasMissingPractical;
  const missingItems = [];
  if (hasMissingQuiz4) missingItems.push('Quiz 4');
  if (hasMissingPractical) missingItems.push('Lab Practical');

  const quizAvg = q4 === null ? ((q1 + q2 + q3) / 3 * 2).toFixed(1) : ((q1 + q2 + q3 + q4) / 4 * 2).toFixed(1);
  const totalInternal = Math.round(mid1 * 0.5 + mid2 * 0.5 + parseFloat(quizAvg) + assignment + (practical || 0));

  return {
    mid1,
    mid2,
    q1,
    q2,
    q3,
    q4,
    assignment,
    practical,
    hasMissing,
    missingItems,
    totalInternal,
    status: hasMissing ? 'Incomplete' : 'Complete'
  };
}

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
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


export default function HodPortal({ account, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const greeting = useTimeGreeting();
  const isDemo = isDemoAccount(account);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openAttendanceModel, setOpenAttendanceModel] = useState(false);
  const [approvalQueue, setApprovalQueue] = useState(() => (isDemo ? initialApprovalQueue : []));
  const [students, setStudents] = useState(() => (isDemo ? getAllStudents() : []));
  const [faculty, setFaculty] = useState(() => (isDemo ? initialFaculty : []));
  const [subjects, setSubjects] = useState(() => (isDemo ? initialSubjects : []));

  // Live clock & Hero time greeting
  const [today] = useState(() => new Date());
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeGreeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      return {
        wish: 'Good morning',
        emoji: '',
        period: 'Morning',
        caption: 'Departmental morning session active. Review marks moderation queues, at-risk rosters, and lecture scheduling.',
        motd: 'Continuous assessment review & marks moderation portal open for Autumn Semester 2026-27.',
        themeClass: 'dash-hero-morning',
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        wish: 'Good afternoon',
        emoji: '',
        period: 'Afternoon',
        caption: 'Oversee departmental computing labs, faculty continuous assessment progress, and academic grievances.',
        motd: 'Examination Cell moderation board meeting scheduled for today at 03:00 PM.',
        themeClass: 'dash-hero-afternoon',
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        wish: 'Good evening',
        emoji: '',
        period: 'Evening',
        caption: 'Verify departmental daily turnout, sign off pending assessment submissions, and examine academic reports.',
        motd: 'Statutory minimum 75% attendance compliance verification active across all 6 sections.',
        themeClass: 'dash-hero-evening',
      };
    }
    return {
      wish: 'Good night',
      emoji: '',
      period: 'Night',
      caption: 'Department records safely synchronized. Recheck pending moderation items before tomorrow morning sessions.',
      motd: 'Autonomous Affiliated Academic Governance Workspace active.',
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

  const holidayItems = useMemo(() => {
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return holidays.map(([raw, name]) => {
      const [d, m, y] = raw.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const daysLeft = Math.round((date - startOfToday) / 86400000);
      return { raw, name, date, daysLeft, key: `${y}-${m - 1}-${d}` };
    });
  }, [today]);

  const nextHoliday = useMemo(() => holidayItems.find((h) => h.daysLeft >= 0), [holidayItems]);

  const hodNextClass = useMemo(() => ({
    period: 'Period 3 (11:15 - 12:15 PM)',
    time: '11:15 AM',
    subjectCode: 'CS505',
    subjectName: 'Advanced Database Systems (Theory)',
    section: 'Section A',
    semester: 'Semester 5',
    room: 'Room 310 · Block B',
    enrolled: 32,
    status: 'Upcoming'
  }), []);

  // Filters & Sub-states
  const [workQueueFilter, setWorkQueueFilter] = useState('ALL'); // ALL, CRITICAL, HIGH, MEDIUM
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('ALL');
  const [approvalSemFilter, setApprovalSemFilter] = useState('ALL');
  const [approvalSearch, setApprovalSearch] = useState('');

  // Student directory filters
  const [studentYearFilter, setStudentYearFilter] = useState('2026-27');
  const [studentProgramFilter, setStudentProgramFilter] = useState('B.Tech CSE');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSemFilter, setStudentSemFilter] = useState('ALL');
  const [studentSectionFilter, setStudentSectionFilter] = useState('ALL');
  const [studentSubjectFilter, setStudentSubjectFilter] = useState('ALL');
  const [studentAttendanceFilter, setStudentAttendanceFilter] = useState('ALL'); // ALL, SHORTAGE, REGULAR, HIGH
  const [studentRiskFilter, setStudentRiskFilter] = useState('ALL'); // ALL, AT_RISK
  const [studentMissingMarksFilter, setStudentMissingMarksFilter] = useState('ALL'); // ALL, MISSING_MARKS, COMPLETE
  const [studentViewMode, setStudentViewMode] = useState('table'); // 'table' or 'section_comparison'

  // Faculty directory filters & oversight modal state
  const [facultySubjectFilter, setFacultySubjectFilter] = useState('ALL');
  const [facultySemFilter, setFacultySemFilter] = useState('ALL');
  const [facultySecFilter, setFacultySecFilter] = useState('ALL');
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyOversightTab, setFacultyOversightTab] = useState('profile'); // 'profile', 'grievances', 'marks', 'announcements'

  // Department Notifications & Announcements state
  const [notifSubTab, setNotifSubTab] = useState('institutional'); // 'composer' or 'faculty_broadcasts'
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    category: 'EXAMINATION',
    priority: 'IMPORTANT',
    targetGroup: 'ALL_DEPARTMENT',
    targetSemester: 'Semester 5',
    targetSection: 'Section A',
    scheduledDate: '',
    attachmentName: ''
  });
  const [showBroadcastConfirmModal, setShowBroadcastConfirmModal] = useState(false);
  const [facultyBroadcastsList, setFacultyBroadcastsList] = useState([]);
  const [facultyNotifFilter, setFacultyNotifFilter] = useState('ALL');
  const [inspectingNotifModal, setInspectingNotifModal] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);

  // Interactive Modals State
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [parentNoticeModalStudent, setParentNoticeModalStudent] = useState(null);
  const [dossierModalStudent, setDossierModalStudent] = useState(null);
  const [studentAlertFilter, setStudentAlertFilter] = useState('ALL'); // ALL, CRITICAL_ATTENDANCE, HIGH_FEES, DUAL_CRITICAL, SHORTAGE
  const [selectedFacultyModal, setSelectedFacultyModal] = useState(null);
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);
  const [inspectingMarksModal, setInspectingMarksModal] = useState(null);
  const [remedialActionModal, setRemedialActionModal] = useState(null);
  const [remedialForm, setRemedialForm] = useState({
    type: 'Extra Tutorial',
    notes: 'Scheduled special weekend problem-solving tutorial for Data Structures.',
    followUpDate: '2026-10-16'
  });

  // Rejection Modal State
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewingMarksItem, setReviewingMarksItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Report Builder State
  const [selectedReportType, setSelectedReportType] = useState('GAZETTE');
  const [reportSemFilter, setReportSemFilter] = useState('Semester 5');
  const [reportSectionFilter, setReportSectionFilter] = useState('Section A');

  // Documents
  const [hodDocs, setHodDocs] = useState(() => getDocumentsForRole('hod'));
  const [hodDocsSearch, setHodDocsSearch] = useState('');
  const [docsViewMode, setDocsViewMode] = useState('student_docs');

  // Anonymous Student Grievance Monitoring state
  const [pendingGrievancesCount, setPendingGrievancesCount] = useState(2);


  useEffect(() => {
    let isMounted = true;
    const fetchGrievanceCount = async () => {
      try {
        const items = await complaintsApi.getHodComplaints();
        if (isMounted && Array.isArray(items)) {
          setAllComplaints(items);
          const pending = items.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
          setPendingGrievancesCount(pending);
        }
      } catch (e) {
        console.warn('Failed to fetch grievance count in HOD portal', e);
      }
    };
    fetchGrievanceCount();
    window.addEventListener('apna_campus_complaints_updated', fetchGrievanceCount);
    return () => {
      isMounted = false;
      window.removeEventListener('apna_campus_complaints_updated', fetchGrievanceCount);
    };
  }, []);

  useEffect(() => {
    const handleDocsChange = () => setHodDocs(getDocumentsForRole('hod'));
    const handleStudentsChange = () => setStudents(getAllStudents());
    window.addEventListener('cms_documents_changed', handleDocsChange);
    window.addEventListener('cms_student_documents_changed', handleDocsChange);
    window.addEventListener('cms_students_changed', handleStudentsChange);
    return () => {
      window.removeEventListener('cms_documents_changed', handleDocsChange);
      window.removeEventListener('cms_student_documents_changed', handleDocsChange);
      window.removeEventListener('cms_students_changed', handleStudentsChange);
    };
  }, []);

  const atRiskStudents = useMemo(() => {
    return students.filter(s => erpStore.calculateStudentRisk(s).isAtRisk);
  }, [students]);

  const atRiskCount = atRiskStudents.length;
  const pendingCount = approvalQueue.filter(q => q.status === 'Pending').length;
  const approvedCount = approvalQueue.filter(q => q.status === 'Approved').length;
  const rejectedCount = approvalQueue.filter(q => q.status === 'Rejected').length;
  const unallocatedQueueCount = useMemo(() => {
    return students.filter(
      s => s.section === 'Pending Section Allocation' || s.status === 'Pending Section Allocation' || !s.section
    ).length;
  }, [students]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Actions
  const handleApprove = async (id, subject) => {
    setApprovalQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Approved',
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
          hodRemarks: 'Approved by HOD. Verified continuous internal assessment components.'
        };
      }
      return item;
    }));
    erpStore.logAuditEvent({
      user: account?.name || 'Dr. P. K. Pattnaik (HOD)',
      role: 'HOD',
      action: 'Approved Faculty Continuous Assessment Marks',
      target: `Subject: ${subject} (Queue: ${id})`,
      oldValue: 'Pending HOD Approval',
      newValue: 'Approved & Moderated for Exam Cell',
    });
    showToast(`✓ Marks for ${subject} officially APPROVED and published to Exam Cell!`);
    try {
      await api.hodApproveMarks(id);
    } catch {
      // Handled
    }
    if (inspectingMarksModal && inspectingMarksModal.id === id) {
      setInspectingMarksModal(null);
    }
  };

  const handleOpenReject = (item) => {
    setRejectingItem(item);
    setRejectionReason('Quiz 4 marks are missing for 4 students. Please complete evaluation and resubmit.');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    const currentItem = rejectingItem;
    setApprovalQueue(prev => prev.map(item => {
      if (item.id === currentItem.id) {
        return {
          ...item,
          status: 'Rejected',
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
          hodRemarks: rejectionReason
        };
      }
      return item;
    }));
    erpStore.logAuditEvent({
      user: account?.name || 'Dr. P. K. Pattnaik (HOD)',
      role: 'HOD',
      action: 'Rejected Marks Assessment & Returned to Faculty',
      target: `Subject: ${currentItem.subject}`,
      oldValue: 'Submitted for Approval',
      newValue: `Revision Required: ${rejectionReason}`,
    });
    showToast(`Marks for ${currentItem.subject} returned to faculty for revision.`);
    setRejectingItem(null);
    if (inspectingMarksModal && inspectingMarksModal.id === currentItem.id) {
      setInspectingMarksModal(null);
    }
    try {
      await api.hodRejectMarks(currentItem.id, rejectionReason);
    } catch {
      // Handled
    }
  };

  const handleUnlockMarks = async (id, subject) => {
    setApprovalQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Pending',
          hodRemarks: 'HOD unlocked marks for faculty correction.'
        };
      }
      return item;
    }));
    erpStore.logAuditEvent({
      user: account?.name || 'Dr. P. K. Pattnaik (HOD)',
      role: 'HOD',
      action: 'Unlocked Marks Sheet for Corrections',
      target: `Subject: ${subject}`,
      oldValue: 'Locked',
      newValue: 'Unlocked for Faculty Edits',
    });
    showToast(`Marks for ${subject} have been unlocked. Faculty can now edit.`);
    try {
      await api.hodUnlockMarks(id, 'Unlocked for corrections');
    } catch {
      // Handled
    }
  };

  // Prioritized work queue
  const workQueueItems = useMemo(() => {
    const list = [
      {
        id: 'wq-101',
        title: 'Review and verify Data Structures (CS501) Continuous Evaluation marks',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        facultyName: 'Dr. S. Mohanty',
        submissionDate: 'Today, 02:30 PM',
        dueDate: '12 Oct 2026',
        priority: 'CRITICAL',
        status: 'Action Required',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Inspect 4 missing marks and approve or return for correction',
        linkTab: 'approval'
      },
      ...(pendingGrievancesCount > 0 ? [{
        id: 'wq-grievance',
        title: 'Evaluate Anonymous Student Grievance & Faculty Corrective Action',
        subjectCode: 'CS501',
        subjectName: 'Data Structures & Algorithms',
        cohort: 'Semester 5 · Section A',
        facultyName: 'Dr. S. Mohanty',
        submissionDate: 'Recent',
        dueDate: 'Within 48 hrs',
        priority: 'CRITICAL',
        status: 'Action Required',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Review faculty compensatory tutorial proposal and record observations',
        linkTab: 'complaints'
      }] : []),
      {
        id: 'wq-102',
        title: 'Conduct Academic Support Review for At-Risk Students',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        facultyName: 'Prof. B. Panda (Mentor)',
        submissionDate: 'Yesterday, 05:00 PM',
        dueDate: '14 Oct 2026',
        priority: 'HIGH',
        status: 'Follow-up Pending',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Verify compensatory tutorial attendance for Debasish Panda',
        linkTab: 'at-risk'
      },
      {
        id: 'wq-103',
        title: 'Curriculum Milestone Sign-off: DAA (CS504) Mid-Term Coverage',
        subjectCode: 'CS504',
        subjectName: 'Design & Analysis of Algorithms',
        cohort: 'Semester 5 · Section C',
        facultyName: 'Prof. S. K. Swain',
        submissionDate: '07 Oct 2026',
        dueDate: '15 Oct 2026',
        priority: 'MEDIUM',
        status: 'Under Review',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Verify completion of Module II (Dynamic Programming & Greedy)',
        linkTab: 'subjects'
      }
    ];
    if (workQueueFilter === 'ALL') return list;
    return list.filter(item => item.priority === workQueueFilter);
  }, [workQueueFilter]);

  // Filtered approval queue
  const filteredApprovalQueue = useMemo(() => {
    return approvalQueue.filter(item => {
      if (approvalStatusFilter !== 'ALL' && item.status !== approvalStatusFilter) return false;
      if (approvalSemFilter !== 'ALL' && item.semester !== approvalSemFilter) return false;
      if (approvalSearch) {
        const q = approvalSearch.toLowerCase();
        const match =
          item.subject.toLowerCase().includes(q) ||
          item.subjectCode.toLowerCase().includes(q) ||
          item.faculty.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [approvalQueue, approvalStatusFilter, approvalSemFilter, approvalSearch]);

  // Filtered department students
  const filteredDepartmentStudents = useMemo(() => {
    return students.filter(s => {
      if (studentYearFilter !== 'ALL' && s.academicYear && s.academicYear !== studentYearFilter && studentYearFilter !== '2026-27') {
        // default match
      }
      if (studentProgramFilter !== 'ALL' && s.program && !s.program.includes(studentProgramFilter.replace(' CSE', ''))) {
        return false;
      }
      if (studentSemFilter !== 'ALL' && (s.semester || 'Semester 5') !== studentSemFilter) return false;
      if (studentSectionFilter !== 'ALL' && !((s.section || 'Section A').includes(studentSectionFilter.replace('Section ', '')))) return false;

      const details = getStudentComprehensiveDetails(s);

      // Alert Filter Pill filtering
      if (studentAlertFilter === 'CRITICAL_ATTENDANCE' && !details.isCriticalShortage) return false;
      if (studentAlertFilter === 'HIGH_FEES' && !details.fees?.hasHighDues) return false;
      if (studentAlertFilter === 'DUAL_CRITICAL' && !(details.isCriticalShortage && details.fees?.hasHighDues)) return false;
      if (studentAlertFilter === 'SHORTAGE' && !details.isShortage) return false;

      const att = details.attendance;
      if (studentAttendanceFilter === 'SHORTAGE' && att >= 75) return false;
      if (studentAttendanceFilter === 'REGULAR' && (att < 75 || att > 85)) return false;
      if (studentAttendanceFilter === 'HIGH' && att <= 85) return false;

      if (studentRiskFilter === 'AT_RISK') {
        const risk = erpStore.calculateStudentRisk(s);
        if (!risk.isAtRisk) return false;
      }

      const internal = getStudentInternalMarks(s);
      if (studentMissingMarksFilter === 'MISSING_MARKS' && !internal.hasMissing) return false;
      if (studentMissingMarksFilter === 'COMPLETE' && internal.hasMissing) return false;

      if (studentSearch) {
        const q = studentSearch.toLowerCase();
        const match =
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.includes(q) ||
          (s.registrationNumber && s.registrationNumber.includes(q)) ||
          (s.studentId && s.studentId.includes(q)) ||
          (details.parent?.phone && details.parent.phone.includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [students, studentYearFilter, studentProgramFilter, studentSemFilter, studentSectionFilter, studentAttendanceFilter, studentRiskFilter, studentMissingMarksFilter, studentSearch, studentAlertFilter]);

  // Alert metrics counts across department students
  const critAttCount = useMemo(() => {
    return students.filter(s => getStudentComprehensiveDetails(s).isCriticalShortage).length;
  }, [students]);

  const highFeesCount = useMemo(() => {
    return students.filter(s => getStudentComprehensiveDetails(s).fees?.hasHighDues).length;
  }, [students]);

  const dualCritCount = useMemo(() => {
    return students.filter(s => {
      const d = getStudentComprehensiveDetails(s);
      return d.isCriticalShortage && d.fees?.hasHighDues;
    }).length;
  }, [students]);

  const shortageCount = useMemo(() => {
    return students.filter(s => getStudentComprehensiveDetails(s).isShortage).length;
  }, [students]);

  // Cross-section comparative performance analytics
  const sectionComparisonData = useMemo(() => {
    const sections = [
      { name: 'Section A', coord: 'Dr. S. Mohanty', room: 'Block B - Room 302' },
      { name: 'Section B', coord: 'Prof. Amit Mishra', room: 'Block B - Room 303' },
      { name: 'Section C', coord: 'Prof. Debashis Jena', room: 'Block B - Room 304' }
    ];
    return sections.map(sec => {
      const secStudents = students.filter(s => (s.section || 'Section A').includes(sec.name.replace('Section ', '')));
      const count = secStudents.length || 32;
      const avgAtt = (secStudents.reduce((acc, s) => acc + (s.attendance || 85), 0) / count).toFixed(1);
      const avgCgpa = (secStudents.reduce((acc, s) => acc + Number(s.cgpa || 7.5), 0) / count).toFixed(2);
      const secAtRisk = secStudents.filter(s => erpStore.calculateStudentRisk(s).isAtRisk).length;
      const secMissing = secStudents.filter(s => getStudentInternalMarks(s).hasMissing).length;
      const marksCompliance = Math.round(((count - secMissing) / count) * 100);

      return {
        section: sec.name,
        coordinator: sec.coord,
        room: sec.room,
        totalEnrolled: count,
        avgAttendance: avgAtt,
        avgCgpa,
        atRiskCount: secAtRisk,
        missingMarksCount: secMissing,
        marksCompliance
      };
    });
  }, [students]);

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => {
      if (facultySemFilter !== 'ALL') {
        const assignments = initialFacultyAssignments.filter(fa => fa.facultyId === f.id || fa.facultyName.includes(f.name));
        const hasSem = assignments.some(fa => fa.semester === facultySemFilter);
        if (!hasSem && assignments.length > 0) return false;
      }
      if (facultySecFilter !== 'ALL') {
        const assignments = initialFacultyAssignments.filter(fa => fa.facultyId === f.id || fa.facultyName.includes(f.name));
        const hasSec = assignments.some(fa => fa.section === facultySecFilter);
        if (!hasSec && assignments.length > 0) return false;
      }
      if (facultySubjectFilter !== 'ALL') {
        const subs = Array.isArray(f.assignedSubjects) ? f.assignedSubjects : [f.assignedSubjects];
        const matchSub = subs.some(s => s && s.toLowerCase().includes(facultySubjectFilter.toLowerCase()));
        if (!matchSub) return false;
      }
      if (facultySearch) {
        const q = facultySearch.toLowerCase();
        const match =
          f.name.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q) ||
          f.designation.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [faculty, facultySemFilter, facultySecFilter, facultySubjectFilter, facultySearch]);

  // Computed recipient count for HOD Broadcast
  const broadcastRecipientCount = useMemo(() => {
    if (notifForm.targetGroup === 'ALL_DEPARTMENT') return 540;
    if (notifForm.targetGroup === 'PROGRAM_COHORT') return 540;
    if (notifForm.targetGroup === 'SEMESTER_COHORT') {
      const match = students.filter(s => (s.semester || 'Semester 5') === notifForm.targetSemester);
      return match.length || 180;
    }
    if (notifForm.targetGroup === 'SECTION_COHORT') {
      const match = students.filter(s => (s.section || 'Section A') === notifForm.targetSection && (s.semester || 'Semester 5') === notifForm.targetSemester);
      return match.length || 32;
    }
    if (notifForm.targetGroup === 'FACULTY_ONLY') return faculty.length || 32;
    return 540;
  }, [notifForm.targetGroup, notifForm.targetSemester, notifForm.targetSection, students, faculty]);

  const loadBroadcasts = async () => {
    try {
      const list = await notificationsApi.getFacultyNotifications({ facultyId: null });
      if (Array.isArray(list)) {
        setFacultyBroadcastsList(list);
      }
    } catch (e) {
      console.warn('Failed to load broadcasts', e);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const handlePublishBroadcast = async () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast('Please provide both announcement title and message content.');
      return;
    }

    const payload = {
      title: notifForm.title.trim(),
      message: notifForm.message.trim(),
      category: notifForm.category,
      priority: notifForm.priority,
      facultyId: account?.identity || 'HOD-CSE-001',
      facultyName: account?.name ? `${account.name} (HOD)` : 'Dr. P. K. Pattnaik (HOD)',
      facultyDesignation: 'Professor & Head of Department, CSE',
      facultyEmail: account?.email || 'hod.cse@apnacampus.edu.in',
      department: 'Computer Science & Engineering',
      academicYear: '2026-27',
      program: 'B.Tech',
      semester: notifForm.targetGroup === 'SEMESTER_COHORT' || notifForm.targetGroup === 'SECTION_COHORT' ? notifForm.targetSemester : 'ALL',
      section: notifForm.targetGroup === 'SECTION_COHORT' ? notifForm.targetSection : 'ALL',
      subjectCode: 'CSE-DEPT',
      subjectName: 'Department Circular & Administrative Notice',
      attachmentUrl: notifForm.attachmentName ? `/assets/${notifForm.attachmentName}` : undefined,
      attachmentName: notifForm.attachmentName || undefined,
      status: notifForm.scheduledDate ? 'SCHEDULED' : 'PUBLISHED',
      scheduledFor: notifForm.scheduledDate ? new Date(notifForm.scheduledDate).toISOString() : null,
    };

    try {
      await notificationsApi.createNotification(payload);
      erpStore.logAuditEvent({
        user: account?.name || 'Dr. P. K. Pattnaik (HOD)',
        role: 'HOD',
        action: 'Broadcasted Official Department Circular',
        target: `Cohort: ${notifForm.targetGroup} (${broadcastRecipientCount} Recipients)`,
        oldValue: 'Draft',
        newValue: `Published: ${notifForm.title}`,
      });
      showToast(`✓ Official departmental announcement published to ${broadcastRecipientCount} recipients!`);
      setShowBroadcastConfirmModal(false);
      setNotifForm({
        title: '',
        message: '',
        category: 'EXAMINATION',
        priority: 'IMPORTANT',
        targetGroup: 'ALL_DEPARTMENT',
        targetSemester: 'Semester 5',
        targetSection: 'Section A',
        scheduledDate: '',
        attachmentName: ''
      });
      loadBroadcasts();
    } catch (e) {
      showToast('Failed to publish announcement. Please try again.');
    }
  };

  const hodNavSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
      ]
    },
    {
      title: 'ACADEMIC STRUCTURE & ALLOCATION',
      items: [
        { id: 'academic-structure', label: 'Academic Structure', icon: Layers },
        { id: 'batches-sections', label: 'Batches & Sections', icon: Building2 },
        { id: 'section-allocation', label: 'Student Section Allocation', icon: UserCheck, badge: unallocatedQueueCount > 0 ? unallocatedQueueCount : null, badgeType: 'warning' },
        { id: 'faculty-allocation', label: 'Faculty Subject Allocation', icon: Sparkles },
        { id: 'advisor-allocation', label: 'Class Advisor Allocation', icon: ShieldCheck },
        { id: 'faculty-workload', label: 'Faculty Workload', icon: Clock },
        { id: 'attendance-monitoring', label: 'Attendance Monitoring', icon: CheckCircle2 },
        { id: 'academic-performance', label: 'Academic Performance', icon: TrendingUp },
      ]
    },
    {
      title: 'ACADEMICS & EVALUATION',
      items: [
        { id: 'marks', label: 'Marks Management', icon: BarChart2 },
        { id: 'approval', label: 'Marks Approval', icon: CheckCircle2, badge: pendingCount > 0 ? pendingCount : null, badgeType: 'warning' },
        { id: 'digital-evaluation', label: 'Digital Evaluation & Approval', icon: FileCheck },
        { id: 'subjects', label: 'Department Subjects', icon: BookOpen },
        { id: 'take-attendance', label: 'Take Attendance', icon: ClipboardCheck },
        { id: 'timetable', label: 'Timetable Management', icon: Calendar },
      ]
    },
    {
      title: 'STUDENTS & FACULTY',
      items: [
        { id: 'students', label: 'Department Students', icon: GraduationCap },
        { id: 'at-risk', label: 'At-Risk Students Alert', icon: AlertTriangle, badge: atRiskCount > 0 ? atRiskCount : null, badgeType: 'danger' },
        { id: 'faculty', label: 'Department Faculty', icon: Users },
        { id: 'complaints', label: 'Grievance Monitoring', icon: ShieldAlert, badge: pendingGrievancesCount > 0 ? pendingGrievancesCount : null, badgeType: 'warning' },
        { id: 'notifications', label: 'Department Notifications', icon: Megaphone },
      ]
    },
    {
      title: 'RECORDS & REPORTS',
      items: [
        { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
        { id: 'reports', label: 'Department Gazette', icon: FileText },
        { id: 'documents', label: 'Department Documents', icon: Download, badge: hodDocs.length > 0 ? hodDocs.length : null },
      ]
    }
  ];

  const getHodPageHeading = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Head of Department Overview',
          subtitle: 'Department of Computer Science & Engineering · Academic Governance & Compliance Monitoring'
        };
      case 'academic-structure':
        return {
          title: 'Department Academic Structure Management',
          subtitle: 'Degrees, Autonomous Curriculum Regulations, Department Branches & Semesters.'
        };
      case 'batches-sections':
        return {
          title: 'Batch & Class Section Cohort Management',
          subtitle: 'Lecture halls, cohort capacities, enrolled student counts, and designated section advisors.'
        };
      case 'section-allocation':
        return {
          title: 'Student Section Allocation & Admissions Queue',
          subtitle: 'Allocate newly enrolled students from admissions queue into authoritative class section registers.'
        };
      case 'faculty-allocation':
        return {
          title: 'Faculty Subject & Section Allocation Matrix',
          subtitle: 'Allocate existing department faculty members to curricular subjects and class sections.'
        };
      case 'advisor-allocation':
        return {
          title: 'Class Advisor & Mentor Designation',
          subtitle: 'Designate senior faculty members as official Class Advisors for each academic section.'
        };
      case 'faculty-workload':
        return {
          title: 'Department Faculty Workload Audit',
          subtitle: 'Weekly instructional hours, theory vs lab splits, and UGC workload compliance monitoring.'
        };
      case 'attendance-monitoring':
        return {
          title: 'Department Attendance Monitoring & Shortage Oversight',
          subtitle: 'Section-wise attendance compliance, biometric logs, and critical shortage alerts (<75%).'
        };
      case 'academic-performance':
        return {
          title: 'Department Academic Performance & Pass Percentage',
          subtitle: 'Semester-wise SGPA trends, CGPA distributions, and continuous assessment metrics.'
        };
      case 'marks':
        return {
          title: 'Department Continuous Assessment & Marks Management',
          subtitle: 'Comprehensive marks monitoring, grading compliance, and component verification across all CSE courses.',
          actions: (
            <button className="admin-action-btn-primary" onClick={() => setActiveTab('approval')}>
              <CheckCircle2 size={15} /> Marks Approval Queue ({pendingCount})
            </button>
          )
        };
      case 'approval':
        return {
          title: `Internal Assessment Approval Queue (${pendingCount} Pending)`,
          subtitle: 'Review, moderate, and approve continuous assessment marksheets submitted by department instructors.',
          actions: (
            <button className="admin-action-btn-secondary" onClick={() => setActiveTab('marks')}>
              ← Back to Marks Register
            </button>
          )
        };
      case 'students':
        return {
          title: 'Department Enrolled Students',
          subtitle: '540 Active Students Enrolled Across 6 Sections (CSE 2023-2027 Cohort).'
        };
      case 'at-risk':
        return {
          title: 'At-Risk Academic Early Warning System',
          subtitle: 'Real-time identification of students falling below attendance and marks thresholds.'
        };
      case 'faculty':
        return {
          title: 'Department Faculty Directory & Workload',
          subtitle: 'Faculty teaching allocations, lecture hours, and student feedback compliance.'
        };
      case 'complaints':
        return {
          title: 'Department Grievance & Complaint Redressal',
          subtitle: 'Monitor, assign, and resolve student grievances submitted to the department.'
        };
      case 'notifications':
        return {
          title: 'Department Announcements & Broadcasts',
          subtitle: 'Official departmental notices and circulars for students and faculty.'
        };
      case 'timetable':
        return {
          title: 'Academic Timetable Management System',
          subtitle: 'Automated constraint-optimized schedules, multi-section scheduling, faculty workload matrix, and institutional publishing.'
        };
      case 'report-generation':
        return {
          title: 'Institutional & Departmental Report Generator',
          subtitle: 'Export comprehensive PDF/Excel reports for NAAC, NBA, and Academic Senate.'
        };
      case 'reports':
        return {
          title: 'Department Academic Gazette',
          subtitle: 'Official compiled marksheets and performance gazettes.'
        };
      case 'subjects':
        return {
          title: 'Department Course Curriculum & Subjects',
          subtitle: 'Affiliated B.Tech curriculum subjects, syllabi, and credit structure.'
        };
      case 'take-attendance':
        return {
          title: 'Classroom Attendance Verification',
          subtitle: 'Live attendance entry and proxy prevention for departmental lectures.'
        };
      case 'digital-evaluation':
        return {
          title: 'Digital Answer Sheet Evaluation',
          subtitle: 'Screen-based evaluation and moderation of semester exam scripts.'
        };
      case 'documents':
        return {
          title: 'Department Documents Repository',
          subtitle: 'Official circulars, syllabus copies, and compliance documents.'
        };
      default:
        return {
          title: 'Department Workspace',
          subtitle: 'Department of Computer Science & Engineering'
        };
    }
  };

  const hodHeading = getHodPageHeading();

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          borderLeft: '4px solid #0f766e'
        }}>
          <CheckCircle2 size={18} color="#2dd4bf" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Standard Universal AppLayout */}
      <AppLayout
        account={account}
        portalName="HOD Portal"
        portalSubtitle="Department of CSE · Academic Governance"
        portalHomeTab="dashboard"
        navSections={hodNavSections}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        pageTitle={hodHeading.title}
        pageSubtitle={hodHeading.subtitle}
        pageActions={hodHeading.actions}
      >
        <div className="hod-portal-content-wrap">
          {/* TABS: ACADEMIC GOVERNANCE & ALLOCATION (PHASE 5) */}
          {[
            'academic-structure',
            'batches-sections',
            'section-allocation',
            'faculty-allocation',
            'advisor-allocation',
            'faculty-workload',
            'attendance-monitoring',
            'academic-performance'
          ].includes(activeTab) && (
            <div style={{ marginBottom: '24px' }}>
              <HodAcademicIntegrationModule
                initialTab={
                  activeTab === 'academic-structure' ? 'structure' :
                  activeTab === 'batches-sections' ? 'batches-sections' :
                  activeTab === 'section-allocation' ? 'section-allocation' :
                  activeTab === 'faculty-allocation' ? 'faculty-allocation' :
                  activeTab === 'advisor-allocation' ? 'advisor-allocation' :
                  activeTab === 'faculty-workload' ? 'workload' :
                  activeTab === 'attendance-monitoring' ? 'attendance' :
                  activeTab === 'academic-performance' ? 'performance' :
                  'structure'
                }
                account={account}
                onNavigateTab={setActiveTab}
              />
            </div>
          )}

          {/* TAB: GRIEVANCE MONITORING */}
          {activeTab === 'complaints' && (
            <div style={{ marginBottom: '24px' }}>
              <HodGrievanceMonitoringModule account={account} />
            </div>
          )}

          {/* TAKE ATTENDANCE TAB */}
          {activeTab === 'take-attendance' && (
            <div style={{ marginBottom: '24px' }}>
              <TakeAttendanceModule
                account={account}
                role="hod"
                initialOpenModel={openAttendanceModel}
                onBackToDashboard={() => {
                  setOpenAttendanceModel(false);
                  setActiveTab('dashboard');
                }}
              />
            </div>
          )}

          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 120px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB: DIGITAL ANSWER SHEET EVALUATION SYSTEM */}
          {activeTab === 'digital-evaluation' && (
            <div style={{ marginTop: '-0.75rem', marginBottom: '20px' }}>
              <DigitalAnswerSheetEvaluationSystem initialRole="hod" currentUser={account} />
            </div>
          )}

          {/* TAB: MARKS MANAGEMENT */}
          {activeTab === 'marks' && (
            <div style={{ marginBottom: '24px' }}>
              <div className="hod-view-header">
                <div>
                  <h2>Department Continuous Assessment &amp; Marks Management</h2>
                  <p>Comprehensive marks monitoring, grading compliance, and component verification across all CSE courses and sections.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button className="admin-action-btn-primary" onClick={() => setActiveTab('approval')}>
                    <CheckCircle2 size={15} /> Marks Approval Queue ({pendingCount})
                  </button>
                </div>
              </div>
              <MarksManagementModule initialRole="hod" currentUser={account} />
            </div>
          )}

          {/* TAB: DEPARTMENT NOTIFICATIONS & BROADCASTS */}
          {activeTab === 'notifications' && (
            <div style={{ marginBottom: '24px' }}>
              <div className="hod-view-header">
                <div>
                  <h2>Department Announcements &amp; Faculty Broadcasts Oversight</h2>
                  <p>Publish authoritative departmental notices to students and monitor academic communications dispatched by faculty members.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`hod-tab-nav-pill ${notifSubTab === 'institutional' ? 'active' : ''}`}
                    onClick={() => setNotifSubTab('institutional')}
                  >
                    <Bell size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Institutional Notice Board
                  </button>
                  <button
                    type="button"
                    className={`hod-tab-nav-pill ${notifSubTab === 'composer' ? 'active' : ''}`}
                    onClick={() => setNotifSubTab('composer')}
                  >
                    <Send size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Broadcast Department Circular
                  </button>
                  <button
                    type="button"
                    className={`hod-tab-nav-pill ${notifSubTab === 'faculty_broadcasts' ? 'active' : ''}`}
                    onClick={() => setNotifSubTab('faculty_broadcasts')}
                  >
                    <Users size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Faculty Announcements ({facultyBroadcastsList.length})
                  </button>
                </div>
              </div>

              {notifSubTab === 'institutional' && (
                <div style={{ marginTop: '1rem' }}>
                  <NotificationCenter
                    currentUser={account || {
                      name: 'Dr. P. K. Pattnaik',
                      role: 'hod',
                      department: account?.department || 'Computer Science & Engineering',
                      roleLabel: 'Head of Department'
                    }}
                    onNavigateHome={() => setActiveTab('dashboard')}
                  />
                </div>
              )}

              {notifSubTab === 'composer' && (
                <div className="hod-broadcast-container">
                  {/* Left: Compose Form */}
                  <div className="admin-card" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--d-line)', background: '#fff' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Megaphone size={18} color="#2563eb" /> Compose Official Department Notice
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          ANNOUNCEMENT CATEGORY
                        </label>
                        <select
                          className="admin-form-select"
                          value={notifForm.category}
                          onChange={e => setNotifForm({ ...notifForm, category: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem' }}
                        >
                          <option value="EXAMINATION">Examination Schedule &amp; Blueprints</option>
                          <option value="TIMETABLE_CHANGE">Timetable &amp; Lecture Hall Changes</option>
                          <option value="ACADEMIC_DEADLINE">Academic &amp; Assessment Deadlines</option>
                          <option value="DEPARTMENT_EVENT">Departmental Events &amp; Seminars</option>
                          <option value="ACADEMIC_INSTRUCTION">Important Academic Guidelines</option>
                          <option value="ASSESSMENT_SCHEDULE">Continuous Assessment (CIA) Schedules</option>
                          <option value="GENERAL_ANNOUNCEMENT">General Departmental Advisory</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          PRIORITY LEVEL
                        </label>
                        <select
                          className="admin-form-select"
                          value={notifForm.priority}
                          onChange={e => setNotifForm({ ...notifForm, priority: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem' }}
                        >
                          <option value="NORMAL">Normal Advisory</option>
                          <option value="IMPORTANT">Important (Highlighted in Yellow)</option>
                          <option value="URGENT">Urgent (Mandatory Alert in Red)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        TARGET RECIPIENT COHORT
                      </label>
                      <select
                        className="admin-form-select"
                        value={notifForm.targetGroup}
                        onChange={e => setNotifForm({ ...notifForm, targetGroup: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', fontWeight: 600, color: '#1e40af', background: '#eff6ff' }}
                      >
                        <option value="ALL_DEPARTMENT">All Students in CSE Department (540 Active Students)</option>
                        <option value="PROGRAM_COHORT">B.Tech Computer Science &amp; Engineering Program</option>
                        <option value="SEMESTER_COHORT">Specific Semester Cohort (e.g. Semester 5)</option>
                        <option value="SECTION_COHORT">Specific Class Section (e.g. Section A)</option>
                        <option value="FACULTY_ONLY">Department Teaching Faculty (32 Staff Members)</option>
                      </select>
                    </div>

                    {(notifForm.targetGroup === 'SEMESTER_COHORT' || notifForm.targetGroup === 'SECTION_COHORT') && (
                      <div style={{ display: 'grid', gridTemplateColumns: notifForm.targetGroup === 'SECTION_COHORT' ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>SEMESTER</label>
                          <select
                            className="admin-form-select"
                            value={notifForm.targetSemester}
                            onChange={e => setNotifForm({ ...notifForm, targetSemester: e.target.value })}
                            style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                          >
                            <option value="Semester 5">Semester 5 (3rd Year)</option>
                            <option value="Semester 3">Semester 3 (2nd Year)</option>
                            <option value="Semester 1">Semester 1 (1st Year)</option>
                            <option value="Semester 7">Semester 7 (4th Year)</option>
                          </select>
                        </div>
                        {notifForm.targetGroup === 'SECTION_COHORT' && (
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>SECTION</label>
                            <select
                              className="admin-form-select"
                              value={notifForm.targetSection}
                              onChange={e => setNotifForm({ ...notifForm, targetSection: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                            >
                              <option value="Section A">Section A (32 Students)</option>
                              <option value="Section B">Section B (30 Students)</option>
                              <option value="Section C">Section C (30 Students)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        ANNOUNCEMENT TITLE *
                      </label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. Schedule for Autumn Mid-Term Assessment & Examination Hall Allocation"
                        value={notifForm.title}
                        onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        OFFICIAL MESSAGE CONTENT *
                      </label>
                      <textarea
                        className="admin-form-input"
                        rows={5}
                        placeholder="Enter the detailed announcement instructions, guidelines, venue, timing, and academic consequences..."
                        value={notifForm.message}
                        onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          ATTACHMENT FILENAME (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          className="admin-form-input"
                          placeholder="e.g. Autumn_CIA_Timetable.pdf"
                          value={notifForm.attachmentName}
                          onChange={e => setNotifForm({ ...notifForm, attachmentName: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          SCHEDULE PUBLICATION (LEAVE BLANK FOR IMMEDIATE)
                        </label>
                        <input
                          type="datetime-local"
                          className="admin-form-input"
                          value={notifForm.scheduledDate}
                          onChange={e => setNotifForm({ ...notifForm, scheduledDate: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        className="admin-action-btn-secondary"
                        onClick={() => setNotifForm({
                          title: '',
                          message: '',
                          category: 'EXAMINATION',
                          priority: 'IMPORTANT',
                          targetGroup: 'ALL_DEPARTMENT',
                          targetSemester: 'Semester 5',
                          targetSection: 'Section A',
                          scheduledDate: '',
                          attachmentName: ''
                        })}
                      >
                        Reset Form
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn-primary"
                        onClick={() => {
                          if (!notifForm.title.trim() || !notifForm.message.trim()) {
                            showToast('Please provide both announcement title and message content.');
                            return;
                          }
                          setShowBroadcastConfirmModal(true);
                        }}
                        style={{ padding: '8px 18px', background: '#2563eb' }}
                      >
                        <Send size={15} /> Preview &amp; Broadcast Announcement
                      </button>
                    </div>
                  </div>

                  {/* Right: Recipient Scope & Live Delivery Details Card */}
                  <div className="hod-recipient-preview-card">
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      DEPARTMENT BROADCAST ENGINE
                    </span>
                    <div style={{ marginTop: '8px', marginBottom: '14px' }}>
                      <div className="hod-recipient-count-badge">
                        {broadcastRecipientCount}
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#134e4a', marginTop: '4px' }}>
                        Authorized Recipients Will Receive This Official Circular
                      </div>
                    </div>

                    <dl className="dash-info-list" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '10px' }}>
                      <DetailRow label="Sender Identity" value="Dr. P. K. Pattnaik (HOD)" />
                      <DetailRow label="Department Authority" value="Head of Department, CSE" />
                      <DetailRow label="Target Audience" value={notifForm.targetGroup.replace('_', ' ')} />
                      <DetailRow label="Academic Year" value="2026-27 (Autumn)" />
                      <DetailRow label="Delivery Channels" value="Student Dashboard Bell + Notice Board" />
                      <DetailRow label="Read Receipt Audit" value="Active Live Tracking Enabled" />
                    </dl>

                    <div style={{ marginTop: '14px', padding: '10px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #99f6e4', fontSize: '0.8rem', color: '#0f766e' }}>
                      <strong>Institution Policy Note:</strong> Official HOD announcements appear directly at the top of students' notification feed with an authenticated department shield and urgent banner.
                    </div>
                  </div>
                </div>
              )}

              {notifSubTab === 'faculty_broadcasts' && (
                <div>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div>
                        <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>FILTER CATEGORY</small>
                        <select
                          className="admin-form-select"
                          value={facultyNotifFilter}
                          onChange={e => setFacultyNotifFilter(e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                          <option value="ALL">All Announcement Categories</option>
                          <option value="EXAMINATION">Examinations</option>
                          <option value="ASSIGNMENT_DEADLINE">Assignment Deadlines</option>
                          <option value="LAB_EXPERIMENT">Lab Experiments</option>
                          <option value="SYLLABUS_UPDATE">Syllabus Updates</option>
                          <option value="GENERAL_ANNOUNCEMENT">General Notices</option>
                        </select>
                      </div>
                    </div>
                    <span className="admin-badge approved">{facultyBroadcastsList.length} Announcements Dispatched</span>
                  </div>

                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Title &amp; Category</th>
                          <th>Sending Faculty</th>
                          <th>Target Cohort</th>
                          <th>Subject</th>
                          <th>Published Date</th>
                          <th>Priority</th>
                          <th>Read Status</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultyBroadcastsList
                          .filter(n => facultyNotifFilter === 'ALL' || n.category === facultyNotifFilter)
                          .map(notif => {
                            const readPct = notif.totalRecipients ? Math.round(((notif.totalRead || 0) / notif.totalRecipients) * 100) : 0;
                            return (
                              <tr key={notif.id}>
                                <td style={{ maxWidth: '280px' }}>
                                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{notif.title}</div>
                                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>{notif.category?.replace('_', ' ')}</small>
                                </td>
                                <td>
                                  <strong>{notif.facultyName}</strong>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{notif.facultyDesignation}</div>
                                </td>
                                <td>{notif.semester} · {notif.section}</td>
                                <td><code>{notif.subjectCode || 'CSE-DEPT'}</code></td>
                                <td>{new Date(notif.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td>
                                  <span className={`priority-pill priority-${(notif.priority || 'normal').toLowerCase()}`}>
                                    {notif.priority}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f766e' }}>
                                    {notif.totalRead || 0} / {notif.totalRecipients || 32} ({readPct}%)
                                  </div>
                                  <div className="dash-progress" style={{ height: '4px', width: '70px', marginTop: '3px' }}>
                                    <i style={{ width: `${readPct}%`, background: '#059669' }} />
                                  </div>
                                </td>
                                <td><span className="admin-badge approved">{notif.status}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                  <button
                                    type="button"
                                    className="admin-action-btn-secondary"
                                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                    onClick={() => setInspectingNotifModal(notif)}
                                  >
                                    View Full
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: HOD OFFICIAL CMS PROFILE */}
          {activeTab === 'profile' && (
            <OfficialEmployeeProfile
              account={account}
              role="hod"
              roleTitle="HOD Official CMS Profile"
              rolePerspective="Department Head (HOD)"
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="dash">
              {/* 1. Dynamic Hero Greeting matching Faculty Dashboard */}
              <section className={`dash-hero ${timeGreeting.themeClass}`} aria-label="Welcome">
                <div className="dash-hero-glow" aria-hidden="true" />
                <div className="dash-hero-main">
                  <p className="dash-hero-kicker"><Sparkles size={13} /> Head of Department Workspace · Department of Computer Science &amp; Engineering</p>
                  <h2 className="dash-hero-title">{timeGreeting.wish}, {getGreetingDisplayName(account?.name || 'Dr. P. K. Pattnaik')}</h2>
                  <p className="dash-hero-caption">{timeGreeting.caption}</p>
                  <div className="dash-motd" role="note" aria-label="Department governance notice">
                    <span className="dash-motd-icon"><Megaphone size={14} /></span>
                    <strong>Academic Governance Notice</strong>
                    <span>{timeGreeting.motd} (540 Active Students Enrolled Across 6 Sections)</span>
                  </div>
                </div>
                <div className="dash-hero-meta">
                  <span className="dash-chip">Academic year <strong>2026–27</strong></span>
                  <time className="dash-date"><CalendarDays size={14} /> {todayLabel}</time>
                  <span className="dash-chip" style={{ background: 'rgba(0,0,0,0.22)' }}>
                    <Clock size={11} /> {formattedLiveTime}
                  </span>
                </div>
              </section>

              {/* 2. Top Hero Split: HOD Official Profile on LEFT + 2x2 Stats Grid on RIGHT */}
              <div className="dash-hero-split">
                {/* HOD Profile Card on Left */}
                <aside className="dash-card dash-info dash-info-hero" id="hod-information" aria-label="HOD account information">
                  <div className="dash-info-cover">
                    <div className="dash-passport-photo-frame" title="Dr. P. K. Pattnaik Official Photograph">
                      <img src="/passport_photo_male.svg" alt={account?.name || 'HOD'} className="dash-passport-img" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <strong>{account?.name || 'Dr. P. K. Pattnaik'}</strong>
                        <button
                          type="button"
                          className="fac-view-profile-btn"
                          onClick={() => setActiveTab('profile')}
                          title="View full HOD official CMS profile"
                        >
                          View Profile <ArrowRight size={13} />
                        </button>
                      </div>
                      <small>{account?.identity || 'HOD-CSE-001'} · Professor &amp; Head of Department</small>
                    </div>
                    <span className="dash-status"><i /> Active</span>
                  </div>
                  <dl className="dash-info-list">
                    <DetailRow label="Employee Code" value={account?.identity || 'HOD-CSE-001'} />
                    <DetailRow label="Name" value={account?.name || 'Dr. P. K. Pattnaik'} />
                    <DetailRow label="Designation" value="Professor & Head of Department" />
                    <DetailRow label="Department" value="Computer Science & Engineering" />
                    <DetailRow label="Authorized Scope" value="540 Students · 32 Faculty · 6 Sections" />
                    <DetailRow label="Cabin / Office" value="Room 101 · Administrative Wing, Block A" />
                    <DetailRow label="Email ID" value={account?.email || 'hod.cse@apnacampus.edu.in'} />
                    <DetailRow label="Mobile No." value={account?.phone || '+91 94370 55102'} />
                  </dl>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="dash-btn dash-btn-primary dash-info-btn"
                      type="button"
                      style={{ justifyContent: 'center', margin: 0 }}
                      onClick={() => setActiveTab('profile')}
                    >
                      View HOD Official CMS Profile <ArrowRight size={15} />
                    </button>
                    <button
                      className="dash-btn dash-btn-outline dash-info-btn"
                      type="button"
                      style={{ justifyContent: 'center', margin: 0 }}
                      onClick={() => setActiveTab('faculty')}
                    >
                      View Department Faculty Directory <ChevronRight size={15} />
                    </button>
                  </div>
                </aside>

                {/* 2x2 Stats Grid on Right */}
                <section className="dash-stats-2x2" aria-label="Department governance snapshot">
                  {/* Card 1: Department Scope */}
                  <article className="dash-stat tone-blue clickable-kpi" onClick={() => setActiveTab('students')} style={{ cursor: 'pointer' }}>
                    <div className="dash-stat-head">
                      <div className="dash-stat-head-left">
                        <span className="dash-stat-icon"><GraduationCap size={18} /></span>
                        <span className="dash-stat-label">Department Students</span>
                      </div>
                      <span className="dash-stat-badge tone-blue-badge">6 Sections</span>
                    </div>
                    <div className="dash-stat-body">
                      <strong className="dash-stat-value">540</strong>
                      <p className="dash-stat-desc">B.Tech Computer Science &amp; Engineering</p>
                    </div>
                    <div className="dash-stat-foot">
                      <span className="dash-stat-pill">32 Faculty</span>
                      <span className="dash-stat-pill">48 Courses</span>
                      <span className="dash-stat-pill tone-green-pill">Autonomous</span>
                    </div>
                  </article>

                  {/* Card 2: Attendance Eligibility */}
                  <article className="dash-stat tone-green clickable-kpi" onClick={() => setActiveTab('at-risk')} style={{ cursor: 'pointer' }}>
                    <div className="dash-stat-head">
                      <div className="dash-stat-head-left">
                        <span className="dash-stat-icon"><CheckCircle2 size={18} /></span>
                        <span className="dash-stat-label">Attendance Compliance</span>
                      </div>
                      <span className="dash-stat-badge tone-green-badge">Eligible (88.6%)</span>
                    </div>
                    <div className="dash-stat-body">
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <strong className="dash-stat-value">88.6%</strong>
                        <span className="dash-stat-ratio">498 / 540 Regular</span>
                      </div>
                      <div className="dash-progress" aria-hidden="true">
                        <i style={{ width: '88.6%' }} />
                      </div>
                    </div>
                    <div className="dash-stat-foot">
                      <small className="dash-stat-sub text-green">
                        <Check size={13} /> {atRiskCount === 0 ? 'All department students above 75% threshold' : `${atRiskCount} student${atRiskCount > 1 ? 's' : ''} require attendance remediation`}
                      </small>
                    </div>
                  </article>

                  {/* Card 3: Next Class / Upcoming Activity */}
                  <article className="dash-stat tone-violet clickable-kpi" onClick={() => setActiveTab('take-attendance')} style={{ cursor: 'pointer' }}>
                    <div className="dash-stat-head">
                      <div className="dash-stat-head-left">
                        <span className="dash-stat-icon"><Clock size={18} /></span>
                        <span className="dash-stat-label">Next Lecture / Activity</span>
                      </div>
                      <span className="dash-stat-badge tone-violet-badge">Starts {hodNextClass.time}</span>
                    </div>
                    <div className="dash-stat-body">
                      <strong className="dash-stat-value">{hodNextClass.time} <em>Today</em></strong>
                      <p className="dash-stat-desc">{hodNextClass.subjectName} ({hodNextClass.subjectCode})</p>
                    </div>
                    <div className="dash-stat-foot">
                      <span className="dash-stat-sub">
                        <MapPin size={13} /> {hodNextClass.room} · {hodNextClass.section} ({hodNextClass.semester})
                      </span>
                    </div>
                  </article>

                  {/* Card 4: Next Holiday */}
                  <article className="dash-stat tone-amber">
                    <div className="dash-stat-head">
                      <div className="dash-stat-head-left">
                        <span className="dash-stat-icon"><PartyPopper size={18} /></span>
                        <span className="dash-stat-label">Next holiday</span>
                      </div>
                      <span className="dash-stat-badge tone-amber-badge">Govt Gazetted</span>
                    </div>
                    <div className="dash-stat-body">
                      <strong className="dash-stat-value">{nextHoliday ? (nextHoliday.daysLeft === 0 ? 'Today' : nextHoliday.daysLeft === 1 ? 'Tomorrow' : `${nextHoliday.daysLeft} days`) : '5 days'}</strong>
                      <p className="dash-stat-desc">{nextHoliday ? nextHoliday.name : 'Mahalaya'}</p>
                    </div>
                    <div className="dash-stat-foot">
                      <span className="dash-stat-sub">
                        {nextHoliday?.date ? nextHoliday.date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : 'Sat, 10 Oct, 2026'} · Campus closed
                      </span>
                    </div>
                  </article>
                </section>
              </div>

              {/* 3. Department Scope & Reports Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', border: '1px solid var(--d-line)', borderRadius: '14px', padding: '12px 18px', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Department Scope:
                  </span>
                  <span className="admin-badge active" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                    B.Tech CSE · 540 Students · 6 Sections · Autumn 2026-27
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="admin-action-btn-secondary" onClick={() => downloadDepartmentGazettePdf(reportSemFilter, reportSectionFilter, students)} style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: '8px' }}>
                    <Download size={15} /> Gazette PDF
                  </button>
                </div>
              </div>

              {/* 4. Alert Banners */}
              {atRiskStudents.length > 0 && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#991b1b', fontSize: '0.92rem' }}>
                        Statutory Attendance Shortage Alert ({atRiskStudents.length} Students &lt; 75%)
                      </strong>
                      <div style={{ color: '#b91c1c', fontSize: '0.82rem' }}>
                        Autonomous regulation requires mandatory minimum 75% attendance to sit for end-semester examinations.
                      </div>
                    </div>
                  </div>
                  <button
                    className="admin-action-btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#991b1b', borderColor: '#fca5a5', background: '#fff' }}
                    onClick={() => { setActiveTab('at-risk'); }}
                  >
                    Review At-Risk Students →
                  </button>
                </div>
              )}

              {pendingGrievancesCount > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldAlert size={22} color="#d97706" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#92400e', fontSize: '0.92rem' }}>
                        Anonymous Student Complaints Pending HOD Review ({pendingGrievancesCount} Active Grievances)
                      </strong>
                      <div style={{ color: '#b45309', fontSize: '0.82rem' }}>
                        Faculty corrective responses submitted. Verify compensatory actions and record official HOD observations.
                      </div>
                    </div>
                  </div>
                  <button
                    className="admin-action-btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#92400e', borderColor: '#fcd34d', background: '#fff' }}
                    onClick={() => setActiveTab('complaints')}
                  >
                    Review Grievance Queue →
                  </button>
                </div>
              )}

              {/* 5. 11 Clickable Operational KPI Cards */}
              <div className="admin-kpi-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('students')} title="Click to view department students directory">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Department Students</span>
                    <div className="admin-kpi-card-icon blue"><GraduationCap size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">540</div>
                  <small style={{ color: '#2563eb', fontWeight: 600 }}>Across 6 sections →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('faculty')} title="Click to view department teaching faculty">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Department Faculty</span>
                    <div className="admin-kpi-card-icon emerald"><Users size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">32</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Active Teaching Staff →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('subjects')} title="Click to view curricular subjects">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Curriculum Subjects</span>
                    <div className="admin-kpi-card-icon purple"><BookOpen size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">48</div>
                  <small style={{ color: '#7c3aed', fontWeight: 600 }}>Under Autonomous Council →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('approval')} title="Click to review marks approval queue">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Marks Awaiting Approval</span>
                    <div className="admin-kpi-card-icon amber"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>{pendingCount}</div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>Action Required →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('complaints')} title="Click to monitor Student Grievances & Faculty Corrective Actions">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Student Grievances</span>
                    <div className="admin-kpi-card-icon amber"><ShieldAlert size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>{pendingGrievancesCount}</div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>Review Queue &amp; Analytics →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('approval')} title="Click to view finalized marks">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Approved &amp; Locked</span>
                    <div className="admin-kpi-card-icon emerald"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>{approvedCount}</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Published to Exam Cell →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('approval')} title="Click to view overdue submissions">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Overdue Submissions</span>
                    <div className="admin-kpi-card-icon red"><Clock size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#dc2626' }}>1</div>
                  <small style={{ color: '#dc2626', fontWeight: 600 }}>DAA (CS504) Mid-1 →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('at-risk')} title="Click to view at-risk students registry">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">At-Risk Students</span>
                    <div className="admin-kpi-card-icon red"><AlertCircle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#dc2626' }}>{atRiskCount}</div>
                  <small style={{ color: '#dc2626', fontWeight: 600 }}>Attendance &amp; GPA Alerts →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('reports')} title="Click to view attendance compliance">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Attendance Compliance</span>
                    <div className="admin-kpi-card-icon blue"><Calendar size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#0f766e' }}>88.6%</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Dept Aggregate Turnout →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('reports')} title="Click to view assessment completion">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Assessment Attainment</span>
                    <div className="admin-kpi-card-icon purple"><TrendingUp size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#7c3aed' }}>92.4%</div>
                  <small style={{ color: '#7c3aed', fontWeight: 600 }}>11/13 Tasks Done →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('reports')} title="Click to view faculty compliance audit">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Faculty Compliance</span>
                    <div className="admin-kpi-card-icon emerald"><CheckSquare size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>93.8%</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>30/32 Submissions On-time →</small>
                </div>
              </div>

              {/* 6. HOD Prioritized Work Queue */}
              <div className="hod-work-queue-container" style={{ borderRadius: '16px', border: '1px solid var(--d-line)', boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)', marginBottom: '1.25rem' }}>
                <div className="work-queue-header">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} color="#2563eb" /> Department Action Centre &amp; Priority Work Queue
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Prioritized operational tasks requiring Head of Department review, sign-off, or intervention.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(p => (
                      <button
                        key={p}
                        className={`admin-action-btn-secondary ${workQueueFilter === p ? 'active' : ''}`}
                        style={{
                          fontSize: '0.74rem',
                          padding: '3px 10px',
                          background: workQueueFilter === p ? '#0f766e' : '#fff',
                          color: workQueueFilter === p ? '#fff' : '#475569',
                          borderColor: workQueueFilter === p ? '#0f766e' : '#cbd5e1'
                        }}
                        onClick={() => setWorkQueueFilter(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {workQueueItems.map(item => (
                    <div key={item.id} className="work-queue-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
                        <span className={`priority-pill priority-${item.priority.toLowerCase()}`}>
                          {item.priority}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            <strong>{item.subjectName} ({item.subjectCode})</strong> · {item.cohort} · Faculty: {item.facultyName} · Due: <strong>{item.dueDate}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="admin-badge pending" style={{ fontSize: '0.72rem' }}>
                          {item.status}
                        </span>
                        <button
                          className="admin-action-btn-primary"
                          style={{ fontSize: '0.75rem', padding: '5px 10px', background: '#0f766e' }}
                          onClick={() => setActiveTab(item.linkTab)}
                        >
                          Execute Action <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Today's Detailed Teaching & Academic Activity Schedule */}
              <div className="admin-card" style={{ borderRadius: '16px', border: '1px solid var(--d-line)', boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)', marginBottom: '1.25rem' }}>
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={17} color="#2563eb" /> Today's Teaching &amp; Departmental Academic Schedule
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Official timetable sessions and administrative meetings for Dr. P. K. Pattnaik (Autumn Semester 2026-27).
                    </p>
                  </div>
                  <span className="admin-badge approved">3 Scheduled Sessions</span>
                </div>

                <div className="today-schedule-grid">
                  <div className="schedule-slot-card completed">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Period 1 (09:00 - 10:00 AM)</strong>
                        <span className="admin-badge approved" style={{ fontSize: '0.68rem' }}>✓ Attendance Logged</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e40af', marginTop: '4px' }}>
                        CS501 · Data Structures (Theory)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        Room: Block B - 302 · Section A (30/32 Present · 93.8%)
                      </div>
                    </div>
                    <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <small style={{ color: '#059669', fontWeight: 600 }}>Lecture Completed</small>
                      <button className="admin-action-btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={() => setActiveTab('take-attendance')}>
                        View Attendance
                      </button>
                    </div>
                  </div>

                  <div className="schedule-slot-card upcoming">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Period 3 (11:15 - 12:15 PM)</strong>
                        <span className="admin-badge pending" style={{ fontSize: '0.68rem' }}>Next Session</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e40af', marginTop: '4px' }}>
                        CS505 · Advanced Database Systems (Theory)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        Room: Block B - 310 · Section A (32 Students Enrolled) · Topic: Distributed Query Optimization
                      </div>
                    </div>
                    <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                      <small style={{ color: '#2563eb', fontWeight: 600 }}>Commencing at 11:15 AM</small>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button className="admin-action-btn-primary" style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={() => { setOpenAttendanceModel(false); setActiveTab('take-attendance'); }}>
                          <Calendar size={12} /> Mark Attendance
                        </button>
                        <button
                          type="button"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setOpenAttendanceModel(true);
                            setActiveTab('take-attendance');
                          }}
                          title="Take attendance using Facenox AI Camera & Biometric Model"
                        >
                          <Camera size={12} /> 🤖 AI Model
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="schedule-slot-card upcoming">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Period 5 (03:00 - 04:30 PM)</strong>
                        <span className="admin-badge pending" style={{ fontSize: '0.68rem', background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}>HOD Governance</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#6d28d9', marginTop: '4px' }}>
                        Autonomous Exam Moderation Committee Meeting
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        Venue: HOD Conference Room 101, Block A · Agenda: Modular 2 Question Paper Moderation &amp; CIA Sign-off
                      </div>
                    </div>
                    <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <small style={{ color: '#7c3aed', fontWeight: 600 }}>Afternoon Administrative Session</small>
                      <button className="admin-action-btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={() => setActiveTab('approval')}>
                        Open Moderation
                      </button>
                    </div>
                  </div>
                </div>
              </div>


              {/* Department Analytics & Visualizations Grid */}
              <div className="hod-analytics-grid">
                {/* 1. Grade Band Distribution */}
                <div className="analytics-chart-card">
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a' }}>
                    Department Continuous Assessment Attainment Distribution
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Distribution of 540 department students across autonomous academic grade boundaries.
                  </p>

                  <div className="distribution-bar-wrap">
                    <div className="distribution-bar-bg">
                      <div className="distribution-segment" style={{ width: '24%', background: '#10b981' }} title="Outstanding (O: >=90%): 24%" />
                      <div className="distribution-segment" style={{ width: '42%', background: '#3b82f6' }} title="Excellent (A+: 80-89%): 42%" />
                      <div className="distribution-segment" style={{ width: '20%', background: '#6366f1' }} title="Very Good (A: 70-79%): 20%" />
                      <div className="distribution-segment" style={{ width: '11%', background: '#f59e0b' }} title="Good (B+: 60-69%): 11%" />
                      <div className="distribution-segment" style={{ width: '3%', background: '#ef4444' }} title="Remedial Support (<60%): 3%" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} /> Outstanding (O: &gt;= 90%)</span>
                      <strong>130 Students (24.0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }} /> Excellent (A+: 80 - 89%)</span>
                      <strong>227 Students (42.0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#6366f1' }} /> Very Good (A: 70 - 79%)</span>
                      <strong>108 Students (20.0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }} /> Good (B+: 60 - 69%)</span>
                      <strong>59 Students (11.0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }} /> Remedial Support (&lt; 60%)</span>
                      <strong style={{ color: '#dc2626' }}>16 Students (3.0%)</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Subject Assessment Completion Rates */}
                <div className="analytics-chart-card">
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a' }}>
                    Curricular Assessment Completion Progress
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Component entry status across core Autumn Semester 5 courses.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { code: 'CS501', name: 'Data Structures', pct: 82.0, status: 'Review Needed', color: '#0f766e' },
                      { code: 'CS502', name: 'Operating Systems', pct: 100.0, status: 'Approved', color: '#059669' },
                      { code: 'CS503', name: 'Database Management', pct: 100.0, status: 'Approved', color: '#059669' },
                      { code: 'CS504', name: 'Design & Analysis of Algorithms', pct: 75.0, status: 'Returned for Revision', color: '#d97706' },
                      { code: 'CS505', name: 'Formal Language & Automata', pct: 90.0, status: 'Draft Ready', color: '#2563eb' },
                      { code: 'CS506', name: 'Advanced Java Programming', pct: 100.0, status: 'Approved', color: '#059669' }
                    ].map(c => (
                      <div key={c.code}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{c.code}: {c.name}</span>
                          <span style={{ color: c.pct === 100 ? '#059669' : c.color, fontWeight: 700 }}>{c.pct}% ({c.status})</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department Notices & Academic Calendar */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Department Announcements &amp; Examination Calendar</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Official circulars, HOD advisories, and autonomous university moderation milestones.
                    </p>
                  </div>
                </div>

                <div className="department-notices-grid">
                  <div className="notice-card urgent">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="priority-pill priority-critical">URGENT DEADLINE</span>
                        <small style={{ color: '#64748b' }}>15 Oct 2026</small>
                      </div>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '0.92rem', color: '#0f172a' }}>
                        Mid-Semester Continuous Internal Assessment Cutoff
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                        All continuous evaluation marks for 5th semester courses must be verified, signed, and approved by respective HODs by 15 Oct 2026, 05:00 PM for Exam Cell publication.
                      </p>
                    </div>
                  </div>

                  <div className="notice-card">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="admin-badge active">ACADEMIC COUNCIL</span>
                        <small style={{ color: '#64748b' }}>18 Oct 2026</small>
                      </div>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '0.92rem', color: '#0f172a' }}>
                        Department Academic Review Meeting
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                        Department faculty meeting on syllabus milestones, lab manual upgrades, and autonomous examination paper setting in Conference Room 2 at 03:00 PM.
                      </p>
                    </div>
                  </div>

                  <div className="notice-card urgent">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="priority-pill priority-high">ATTENDANCE AUDIT</span>
                        <small style={{ color: '#64748b' }}>08 Oct 2026</small>
                      </div>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '0.92rem', color: '#0f172a' }}>
                        Statutory 75% Lecture Attendance Advisory
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                        Condonation forms for students falling between 65%-74% with certified medical reasons must be countersigned by HOD prior to admit card generation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Academic Calendar & Holiday List Duo */}
              <div className="dash-grid-duo" style={{ marginTop: '1.25rem' }}>
                <CalendarWidget account={account} />
                <HolidayListWidget title="Academic Holiday List" />
              </div>
            </div>
          )}

          {/* TAB 2: MARKS APPROVAL WORKFLOW */}
          {activeTab === 'approval' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>Department Marks Approval &amp; Moderation Workflow</h2>
                  <p>Faculty continuous evaluation submissions. Inspect full matricial marks, verify components, approve or return with actionable feedback.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="admin-action-btn-secondary" onClick={() => downloadDepartmentGazettePdf('CSE Department Moderated Marks Gazette')}>
                    <Download size={14} /> Download Moderated Gazette
                  </button>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>STATUS</small>
                    <select
                      className="admin-form-select"
                      value={approvalStatusFilter}
                      onChange={e => setApprovalStatusFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Statuses ({approvalQueue.length})</option>
                      <option value="Pending">Pending Review ({pendingCount})</option>
                      <option value="Approved">Approved &amp; Moderated ({approvedCount})</option>
                      <option value="Rejected">Revision Requested ({rejectedCount})</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SEMESTER</small>
                    <select
                      className="admin-form-select"
                      value={approvalSemFilter}
                      onChange={e => setApprovalSemFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Semesters</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 3">Semester 3</option>
                    </select>
                  </div>
                </div>

                <div className="admin-search-wrap" style={{ minWidth: '240px' }}>
                  <Search size={15} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search subject code or faculty..."
                    value={approvalSearch}
                    onChange={e => setApprovalSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Submissions Queue */}
              <div style={{ marginBottom: '1.5rem' }}>
                {filteredApprovalQueue.map(item => (
                  <div key={item.id} className={`hod-approval-card ${item.status.toLowerCase()}`}>
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{item.subject}</strong>
                        <code>{item.subjectCode}</code>
                        <span className={`admin-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>
                        Submitted by: <strong>{item.faculty}</strong> · Cohort: <strong>{item.semester} ({item.section})</strong> · {item.cohortSize || 32} Cohort Examinees ({item.courseTotalEnrollment || 91} Course Total)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Submitted on: {item.submittedDate || 'Today'} · {item.componentsCount || 13} CIA Evaluation Columns
                      </div>
                      {item.hodRemarks && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.825rem', padding: '0.4rem 0.75rem', borderRadius: '6px', background: item.status === 'Rejected' ? '#fff1f2' : '#f0fdf4', color: item.status === 'Rejected' ? '#9f1239' : '#166534', border: `1px solid ${item.status === 'Rejected' ? '#fecdd3' : '#bbf7d0'}` }}>
                          <strong>HOD Review Note:</strong> {item.hodRemarks}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="admin-action-btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                        onClick={() => setInspectingMarksModal(item)}
                      >
                        <Eye size={15} /> Inspect Marks Matrix
                      </button>

                      {item.status === 'Pending' && (
                        <>
                          <button className="hod-btn-approve" onClick={() => handleApprove(item.id, item.subject)}>
                            <CheckCircle2 size={15} /> Approve Marks
                          </button>
                          <button className="hod-btn-reject" onClick={() => handleOpenReject(item)}>
                            <XCircle size={15} /> Reject with Reason
                          </button>
                        </>
                      )}

                      {item.status === 'Approved' && (
                        <button className="hod-btn-unlock" onClick={() => handleUnlockMarks(item.id, item.subject)}>
                          <Unlock size={15} /> Unlock Marks
                        </button>
                      )}

                      {item.status === 'Rejected' && (
                        <span style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>
                          Awaiting Faculty Resubmission
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {filteredApprovalQueue.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    No marks submissions found matching your selected criteria.
                  </div>
                )}
              </div>

              {/* Integrated Marks View for the Selected Subject */}
              <div className="admin-card" style={{ marginTop: '2rem' }}>
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Live Faculty Grade Sheet Preview (Continuous Evaluation)</h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '2px 0 0 0' }}>
                      {reviewingMarksItem ? `Inspecting ${reviewingMarksItem.subject} (${reviewingMarksItem.faculty})` : 'Showing Data Structures continuous evaluation matrix'}
                    </p>
                  </div>
                </div>
                <MarksManagementModule initialRole="teacher" />
              </div>

              {/* Department Academic Calendar & Holiday List Duo */}
              <div className="dash-grid-duo" style={{ marginTop: '1.25rem' }}>
                <CalendarWidget account={account} />
                <HolidayListWidget title="Academic Holiday List" />
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENT STUDENTS */}
          {activeTab === 'students' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>CSE Department Students ({filteredDepartmentStudents.length} of {students.length} Enrolled)</h2>
                  <p>Comprehensive student academic oversight across all 6 sections, continuous assessment marks, and risk diagnostics.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: studentViewMode === 'table' ? '#2563eb' : 'transparent',
                        color: studentViewMode === 'table' ? '#fff' : '#475569'
                      }}
                      onClick={() => setStudentViewMode('table')}
                    >
                      Directory Table
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: studentViewMode === 'section_comparison' ? '#2563eb' : 'transparent',
                        color: studentViewMode === 'section_comparison' ? '#fff' : '#475569'
                      }}
                      onClick={() => setStudentViewMode('section_comparison')}
                    >
                      Section Comparative Analytics
                    </button>
                  </div>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => exportToCsv('CSE_Department_Students.csv', filteredDepartmentStudents.map(s => {
                      const marks = getStudentInternalMarks(s);
                      return {
                        Roll: s.rollNumber,
                        Name: s.name,
                        StudentID: s.studentId,
                        Semester: s.semester,
                        Section: s.section,
                        Attendance: `${s.attendance || 85}%`,
                        CGPA: s.cgpa,
                        ContinuousMarks: marks.totalInternal,
                        MarksStatus: marks.status,
                        MissingComponents: marks.missingItems.join(';')
                      };
                    }))}
                  >
                    <FileSpreadsheet size={14} /> Export CSV Roster
                  </button>
                  <button
                    type="button"
                    className="admin-action-btn-primary"
                    style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                    onClick={() => {
                      const criticalStudents = filteredDepartmentStudents.filter(s => {
                        const d = getStudentComprehensiveDetails(s);
                        return d.isCriticalShortage || d.fees?.hasHighDues;
                      });
                      if (criticalStudents.length === 0) {
                        showToast('No students with critical attendance (<50%) or high fee dues in current filter.');
                        return;
                      }
                      setParentNoticeModalStudent(criticalStudents[0]);
                    }}
                    title="Send immediate parent alert for at-risk students"
                  >
                    <Send size={14} /> Send Parent Notice ({critAttCount + highFeesCount})
                  </button>
                </div>
              </div>

              {/* Multi-criteria filter toolbar */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>ACADEMIC YEAR</small>
                    <select
                      className="admin-form-select"
                      value={studentYearFilter}
                      onChange={e => setStudentYearFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="2026-27">2026-27 (Current)</option>
                      <option value="2025-26">2025-26</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>PROGRAM</small>
                    <select
                      className="admin-form-select"
                      value={studentProgramFilter}
                      onChange={e => setStudentProgramFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="B.Tech CSE">B.Tech (CSE)</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SEMESTER</small>
                    <select
                      className="admin-form-select"
                      value={studentSemFilter}
                      onChange={e => setStudentSemFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Semesters</option>
                      <option value="Semester 5">Semester 5 (3rd Year)</option>
                      <option value="Semester 3">Semester 3 (2nd Year)</option>
                      <option value="Semester 1">Semester 1 (1st Year)</option>
                      <option value="Semester 7">Semester 7 (4th Year)</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SECTION</small>
                    <select
                      className="admin-form-select"
                      value={studentSectionFilter}
                      onChange={e => setStudentSectionFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Sections</option>
                      <option value="Section A">Section A</option>
                      <option value="Section B">Section B</option>
                      <option value="Section C">Section C</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>ATTENDANCE TIER</small>
                    <select
                      className="admin-form-select"
                      value={studentAttendanceFilter}
                      onChange={e => setStudentAttendanceFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Attendance Tiers</option>
                      <option value="SHORTAGE">Shortage Only (&lt; 75%)</option>
                      <option value="REGULAR">Regular (75% - 85%)</option>
                      <option value="HIGH">High Attendance (&gt; 85%)</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>MARKS STATUS</small>
                    <select
                      className="admin-form-select"
                      value={studentMissingMarksFilter}
                      onChange={e => setStudentMissingMarksFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Marks Records</option>
                      <option value="MISSING_MARKS">Missing / Incomplete Marks</option>
                      <option value="COMPLETE">Complete Records Only</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="admin-action-btn-secondary"
                    style={{
                      marginTop: '16px',
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      background: studentRiskFilter === 'AT_RISK' ? '#dc2626' : '#fff',
                      color: studentRiskFilter === 'AT_RISK' ? '#fff' : '#dc2626',
                      borderColor: studentRiskFilter === 'AT_RISK' ? '#dc2626' : '#fca5a5'
                    }}
                    onClick={() => setStudentRiskFilter(studentRiskFilter === 'AT_RISK' ? 'ALL' : 'AT_RISK')}
                  >
                    <AlertCircle size={12} /> At-Risk Only ({atRiskCount})
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

              {/* Quick Alert Filter Pills for Parent Notices & Student 360 Oversight */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Bell size={13} color="#dc2626" /> PARENT ACTION FILTERS:
                </span>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${studentAlertFilter === 'ALL' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    background: studentAlertFilter === 'ALL' ? '#2563eb' : '#fff',
                    color: studentAlertFilter === 'ALL' ? '#fff' : '#475569',
                    borderColor: studentAlertFilter === 'ALL' ? '#2563eb' : '#cbd5e1'
                  }}
                  onClick={() => setStudentAlertFilter('ALL')}
                >
                  All Students ({students.length})
                </button>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${studentAlertFilter === 'CRITICAL_ATTENDANCE' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: studentAlertFilter === 'CRITICAL_ATTENDANCE' ? '#dc2626' : '#fef2f2',
                    color: studentAlertFilter === 'CRITICAL_ATTENDANCE' ? '#fff' : '#dc2626',
                    borderColor: studentAlertFilter === 'CRITICAL_ATTENDANCE' ? '#dc2626' : '#fca5a5'
                  }}
                  onClick={() => setStudentAlertFilter(studentAlertFilter === 'CRITICAL_ATTENDANCE' ? 'ALL' : 'CRITICAL_ATTENDANCE')}
                >
                  🚨 Attendance &lt; 50% ({critAttCount})
                </button>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${studentAlertFilter === 'HIGH_FEES' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: studentAlertFilter === 'HIGH_FEES' ? '#d97706' : '#fffbeb',
                    color: studentAlertFilter === 'HIGH_FEES' ? '#fff' : '#b45309',
                    borderColor: studentAlertFilter === 'HIGH_FEES' ? '#d97706' : '#fcd34d'
                  }}
                  onClick={() => setStudentAlertFilter(studentAlertFilter === 'HIGH_FEES' ? 'ALL' : 'HIGH_FEES')}
                >
                  💳 High Fee Dues &gt; ₹25k ({highFeesCount})
                </button>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${studentAlertFilter === 'DUAL_CRITICAL' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: studentAlertFilter === 'DUAL_CRITICAL' ? '#7f1d1d' : '#fff1f2',
                    color: studentAlertFilter === 'DUAL_CRITICAL' ? '#fff' : '#991b1b',
                    borderColor: studentAlertFilter === 'DUAL_CRITICAL' ? '#7f1d1d' : '#fecdd3'
                  }}
                  onClick={() => setStudentAlertFilter(studentAlertFilter === 'DUAL_CRITICAL' ? 'ALL' : 'DUAL_CRITICAL')}
                >
                  🔥 Dual Critical Shortage &amp; Dues ({dualCritCount})
                </button>
                <button
                  type="button"
                  className={`admin-action-btn-secondary ${studentAlertFilter === 'SHORTAGE' ? 'active' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    background: studentAlertFilter === 'SHORTAGE' ? '#f59e0b' : '#fff',
                    color: studentAlertFilter === 'SHORTAGE' ? '#fff' : '#b45309',
                    borderColor: studentAlertFilter === 'SHORTAGE' ? '#f59e0b' : '#fde68a'
                  }}
                  onClick={() => setStudentAlertFilter(studentAlertFilter === 'SHORTAGE' ? 'ALL' : 'SHORTAGE')}
                >
                  ⚠️ Shortage (&lt;75%) ({shortageCount})
                </button>
              </div>

              {/* View 1: Section Comparative Analytics */}
              {studentViewMode === 'section_comparison' && (
                <div>
                  <div style={{ marginBottom: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 16px', color: '#1e40af', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={16} />
                    <span><strong>Consolidated Cross-Section Benchmark:</strong> Compare academic turnout, CGPA distribution, and continuous internal assessment completion across departmental sections.</span>
                  </div>

                  <div className="hod-section-grid">
                    {sectionComparisonData.map(sec => (
                      <div key={sec.section} className="hod-section-card">
                        <div className="hod-section-header">
                          <div>
                            <h3 className="hod-section-title">{sec.section}</h3>
                            <div className="hod-section-meta">
                              Coordinator: <strong>{sec.coordinator}</strong> · {sec.room}
                            </div>
                          </div>
                          <span className="admin-badge approved">{sec.totalEnrolled} Students</span>
                        </div>

                        <div className="hod-section-metrics">
                          <div className="hod-metric-box">
                            <span className="hod-metric-label">Avg Attendance</span>
                            <div className="hod-metric-val" style={{ color: Number(sec.avgAttendance) < 75 ? '#dc2626' : '#059669' }}>
                              {sec.avgAttendance}%
                            </div>
                            <div className="dash-progress" style={{ height: '4px', marginTop: '4px' }}>
                              <i style={{ width: `${sec.avgAttendance}%`, background: Number(sec.avgAttendance) < 75 ? '#dc2626' : '#059669' }} />
                            </div>
                          </div>

                          <div className="hod-metric-box">
                            <span className="hod-metric-label">Average CGPA</span>
                            <div className="hod-metric-val" style={{ color: '#2563eb' }}>
                              {sec.avgCgpa}
                            </div>
                            <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Autonomous Scale 10.0</small>
                          </div>

                          <div className="hod-metric-box">
                            <span className="hod-metric-label">At-Risk Students</span>
                            <div className="hod-metric-val" style={{ color: sec.atRiskCount > 0 ? '#dc2626' : '#059669' }}>
                              {sec.atRiskCount}
                            </div>
                            <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Attendance &lt; 75% or GPA &lt; 6.0</small>
                          </div>

                          <div className="hod-metric-box">
                            <span className="hod-metric-label">Marks Compliance</span>
                            <div className="hod-metric-val" style={{ color: sec.marksCompliance < 90 ? '#d97706' : '#059669' }}>
                              {sec.marksCompliance}%
                            </div>
                            <small style={{ color: '#64748b', fontSize: '0.7rem' }}>{sec.missingMarksCount} Incomplete CIAs</small>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          <small style={{ color: '#64748b', fontSize: '0.76rem' }}>
                            {sec.missingMarksCount > 0 ? `${sec.missingMarksCount} student(s) require Quiz/Lab entry` : 'All component marks uploaded'}
                          </small>
                          <button
                            type="button"
                            className="admin-action-btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setStudentSectionFilter(sec.section);
                              setStudentViewMode('table');
                            }}
                          >
                            Filter This Section →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View 2: Detailed Student Table */}
              {studentViewMode === 'table' && (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Roll #</th>
                        <th>Student &amp; Parent</th>
                        <th>Registration / Cohort</th>
                        <th>Attendance Turnout</th>
                        <th>Continuous Marks</th>
                        <th>Fees Account &amp; Dues</th>
                        <th>Risk Assessment</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartmentStudents.map(s => {
                        const risk = erpStore.calculateStudentRisk(s);
                        const details = getStudentComprehensiveDetails(s);
                        const internalMarks = getStudentInternalMarks(s);
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
                                {s.semester || 'Semester 5'} · {s.section || 'Section A'}
                              </small>
                            </td>
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
                                {(risk.isAtRisk || internalMarks.hasMissing) && (
                                  <button
                                    type="button"
                                    className="admin-action-btn-secondary"
                                    style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#b91c1c', borderColor: '#fca5a5' }}
                                    onClick={() => setRemedialActionModal(s)}
                                  >
                                    Remedial
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredDepartmentStudents.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            No department students found matching your selected criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AT-RISK STUDENTS ALERT */}
          {activeTab === 'at-risk' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>Department Academic At-Risk &amp; Intervention Registry</h2>
                  <p>Explains specific triggers: attendance shortage (&lt;75%), CGPA distress (&lt;6.0), or active modular exam failure.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="admin-action-btn-primary"
                    style={{ background: '#0f766e' }}
                    onClick={async () => {
                      try {
                        await hodApi.bulkDispatchNotices(atRiskStudents.length);
                      } catch {
                        // handled
                      }
                      erpStore.logAuditEvent({
                        user: account?.name || 'Dr. P. K. Pattnaik (HOD)',
                        role: 'HOD',
                        action: 'Issued Remedial Mentoring Notices',
                        target: `${atRiskStudents.length} At-Risk CSE Students`,
                        oldValue: 'Unwarned',
                        newValue: 'Counseling Scheduled',
                      });
                      showToast(`✓ Remedial mentoring notices dispatched to ${atRiskStudents.length} students & mentors!`);
                    }}
                  >
                    <Bell size={15} /> Issue Remedial Mentoring Notices ({atRiskStudents.length})
                  </button>
                </div>
              </div>

              {atRiskStudents.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#059669' }}>
                  <CheckCircle2 size={40} style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ margin: 0 }}>All CSE Students in Good Academic Standing</h3>
                  <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>No students currently fall below attendance (75%) or GPA (6.0) minimum thresholds.</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Roll #</th>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th>Class Cohort</th>
                        <th>Attendance</th>
                        <th>CGPA</th>
                        <th>Risk Severity</th>
                        <th>Diagnostic Findings &amp; Triggers</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atRiskStudents.map(s => {
                        const risk = erpStore.calculateStudentRisk(s);
                        return (
                          <tr key={s.id}>
                            <td><strong>#{s.rollNumber}</strong></td>
                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                            <td><code>{s.studentId}</code></td>
                            <td>{s.semester || 'Semester 5'} · {s.section || 'Section A'}</td>
                            <td>
                              <strong style={{ color: (s.attendance || 85) < 75 ? '#dc2626' : '#0f766e' }}>
                                {s.attendance || 85}%
                              </strong>
                            </td>
                            <td><strong style={{ color: Number(s.cgpa) < 6.0 ? '#dc2626' : '#059669' }}>{s.cgpa}</strong></td>
                            <td>
                              <span
                                style={{
                                  background: `${risk.badgeColor}18`,
                                  color: risk.badgeColor,
                                  border: `1px solid ${risk.badgeColor}40`,
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                }}
                              >
                                {risk.category}
                              </span>
                            </td>
                            <td>
                              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#dc2626' }}>
                                {risk.reasons.map((r, rIdx) => (
                                  <li key={rIdx}>{r}</li>
                                ))}
                              </ul>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  className="admin-action-btn-secondary"
                                  style={{ fontSize: '0.74rem', padding: '3px 8px', color: '#b91c1c', borderColor: '#fca5a5' }}
                                  onClick={() => setRemedialActionModal(s)}
                                >
                                  Remedial
                                </button>
                                <button
                                  className="admin-action-btn-secondary"
                                  style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                                  onClick={() => showToast(`Counselor alert sent for ${s.name} (${s.rollNumber})`)}
                                >
                                  Notify Mentor
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DEPARTMENT FACULTY */}
          {activeTab === 'faculty' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>CSE Department Teaching Faculty ({filteredFaculty.length} of {faculty.length} Members)</h2>
                  <p>Professors, associate professors, and lecturers across Computing Systems, Algorithms, and Software Engineering.</p>
                </div>
                <button
                  className="admin-action-btn-secondary"
                  onClick={() => exportToCsv('CSE_Department_Faculty.csv', filteredFaculty.map(f => ({ ID: f.id, Name: f.name, Email: f.email, Designation: f.designation, AssignedCourses: (Array.isArray(f.assignedSubjects) ? f.assignedSubjects : [f.assignedSubjects]).join('; '), Status: f.status })))}
                >
                  <FileSpreadsheet size={14} /> Export Faculty Register
                </button>
              </div>

              {/* Workload Oversight Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '12px 16px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 700 }}>TEACHING WORKLOAD ALLOCATION</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f766e', marginTop: '3px' }}>100% Balanced</div>
                  <small style={{ color: '#134e4a' }}>All 48 autonomous courses assigned to active faculty</small>
                </div>
                <div
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setActiveTab('timetable')}
                  title="Click to view and manage automated timetable"
                >
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TIMETABLE CONFLICTS &amp; SCHEDULES</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginTop: '3px' }}>0 Clashes (View &rarr;)</div>
                  <small style={{ color: '#64748b' }}>Automated OR-Tools Schedule Active</small>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>EVALUATION SUBMISSIONS</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb', marginTop: '3px' }}>93.8% Compliance</div>
                  <small style={{ color: '#64748b' }}>30 of 32 faculty completed continuous mark entry</small>
                </div>
              </div>

              {/* Faculty Multi-Criteria Filter Bar */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SUBJECT FILTER</small>
                    <select
                      className="admin-form-select"
                      value={facultySubjectFilter}
                      onChange={e => setFacultySubjectFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Subjects</option>
                      <option value="Data Structures">Data Structures</option>
                      <option value="Operating Systems">Operating Systems</option>
                      <option value="Database">Database Management</option>
                      <option value="Algorithms">Design &amp; Analysis of Algorithms</option>
                      <option value="Networks">Computer Networks</option>
                      <option value="Software">Software Engineering</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SEMESTER</small>
                    <select
                      className="admin-form-select"
                      value={facultySemFilter}
                      onChange={e => setFacultySemFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Semesters</option>
                      <option value="Semester 5">Semester 5 (3rd Year)</option>
                      <option value="Semester 3">Semester 3 (2nd Year)</option>
                      <option value="Semester 1">Semester 1 (1st Year)</option>
                      <option value="Semester 7">Semester 7 (4th Year)</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SECTION</small>
                    <select
                      className="admin-form-select"
                      value={facultySecFilter}
                      onChange={e => setFacultySecFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Sections</option>
                      <option value="Section A">Section A</option>
                      <option value="Section B">Section B</option>
                      <option value="Section C">Section C</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Search faculty name, ID..."
                      value={facultySearch}
                      onChange={e => setFacultySearch(e.target.value)}
                      style={{ padding: '5px 10px 5px 30px', fontSize: '0.8rem', width: '220px' }}
                    />
                  </div>
                  {(facultySubjectFilter !== 'ALL' || facultySemFilter !== 'ALL' || facultySecFilter !== 'ALL' || facultySearch) && (
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      onClick={() => {
                        setFacultySubjectFilter('ALL');
                        setFacultySemFilter('ALL');
                        setFacultySecFilter('ALL');
                        setFacultySearch('');
                      }}
                      style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Faculty Profile</th>
                      <th>Email</th>
                      <th>Designation</th>
                      <th>Assigned Courses</th>
                      <th>Weekly Workload</th>
                      <th>Student Grievances</th>
                      <th>Marks Compliance</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaculty.map(f => {
                      const facComplaints = allComplaints.filter(c =>
                        c.concernedFacultyId === f.id ||
                        (c.concernedFacultyName && c.concernedFacultyName.toLowerCase().includes(f.name.toLowerCase()))
                      );
                      const pendingFacComplaints = facComplaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED');

                      return (
                        <tr key={f.id}>
                          <td><strong>{f.id}</strong></td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{f.name}</div>
                            <small style={{ color: '#64748b' }}>Cabin: Room 304 · IT Block B</small>
                          </td>
                          <td>{f.email}</td>
                          <td><span className="admin-badge active">{f.designation}</span></td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                              {(Array.isArray(f.assignedSubjects) ? f.assignedSubjects : [f.assignedSubjects]).join(', ')}
                            </div>
                            <small style={{ color: '#0f766e' }}>Sem 5 (Sec A, Sec B)</small>
                          </td>
                          <td><strong>14 Hrs / Wk</strong></td>
                          <td>
                            {facComplaints.length === 0 ? (
                              <span className="admin-badge approved" style={{ background: '#ecfdf5', color: '#059669' }}>
                                0 Grievances
                              </span>
                            ) : pendingFacComplaints.length > 0 ? (
                              <span className="admin-badge pending" style={{ background: '#fef3c7', color: '#b45309' }}>
                                {pendingFacComplaints.length} Pending Review
                              </span>
                            ) : (
                              <span className="admin-badge approved">
                                {facComplaints.length} Resolved
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="admin-badge approved" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                              Compliant (100%)
                            </span>
                          </td>
                          <td><span className="admin-badge approved">{f.status}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="admin-action-btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.74rem', background: '#0f766e' }}
                              onClick={() => {
                                setSelectedFacultyModal(f);
                                setFacultyOversightTab('profile');
                              }}
                            >
                              <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              Oversight &amp; Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Department Academic Calendar & Holiday List Duo */}
              <div className="dash-grid-duo" style={{ marginTop: '1.25rem' }}>
                <CalendarWidget account={account} />
                <HolidayListWidget title="Academic Holiday List" />
              </div>
            </div>
          )}

          {/* TAB 6: DEPARTMENT SUBJECTS */}
          {activeTab === 'subjects' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>CSE Department Curricular Subjects ({subjects.length} Autonomous Courses)</h2>
                  <p>Curriculum oversight for B.Tech CSE (Autonomous Regulations 2024-2028).</p>
                </div>
                <button
                  className="admin-action-btn-secondary"
                  onClick={() => exportToCsv('CSE_Department_Subjects.csv', subjects.map(s => ({ Code: s.code, Name: s.name, Semester: s.semester, Credits: s.credits, Format: s.type, Coordinator: s.assignedFaculty })))}
                >
                  <FileSpreadsheet size={14} /> Export Curriculum Register
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Subject Name</th>
                      <th>Semester</th>
                      <th>Credits</th>
                      <th>Format</th>
                      <th>Course Coordinator</th>
                      <th>Syllabus Completion</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(s => (
                      <tr key={s.id}>
                        <td><code style={{ fontWeight: 700, color: '#0f766e' }}>{s.code}</code></td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.semester}</td>
                        <td>{s.credits} Credits</td>
                        <td><span className="admin-badge active">{s.type}</span></td>
                        <td>{s.assignedFaculty}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: s.code === 'CS502' ? '100%' : '82%', height: '100%', background: '#059669' }} />
                            </div>
                            <strong style={{ fontSize: '0.75rem', color: '#059669' }}>{s.code === 'CS502' ? '100%' : '82%'}</strong>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-action-btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                            onClick={() => setSelectedSubjectModal(s)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Department Academic Calendar & Holiday List Duo */}
              <div className="dash-grid-duo" style={{ marginTop: '1.25rem' }}>
                <CalendarWidget account={account} />
                <HolidayListWidget title="Academic Holiday List" />
              </div>
            </div>
          )}

          {/* TAB 6B: AUTOMATED TIMETABLE MANAGEMENT */}
          {activeTab === 'timetable' && (
            <PublicTimetable account={account} role="hod" onClose={() => setActiveTab('dashboard')} embedded={true} />
          )}

          {/* TAB 7: DEPARTMENT REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>Department Reports, Compliance &amp; Gazette Centre</h2>
                  <p>Certified autonomous evaluation returns ready for submission to Academic Council and Controller of Examinations.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="admin-action-btn-primary" style={{ background: '#0f766e' }} onClick={() => downloadDepartmentGazettePdf('CSE Department Comprehensive CIA Gazette')}>
                    <Download size={14} /> Download Gazette PDF
                  </button>
                </div>
              </div>

              {/* Report Builder Selector Toolbar */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <small style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>REPORT TYPE</small>
                      <select
                        className="admin-form-select"
                        value={selectedReportType}
                        onChange={e => setSelectedReportType(e.target.value)}
                        style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                      >
                        <option value="GAZETTE">Continuous Assessment (CIA) Gazette</option>
                        <option value="STUDENT_REGISTRY">Student Enrollment &amp; Attendance Compliance</option>
                        <option value="FACULTY_WORKLOAD">Faculty Workload &amp; Allocation Audit</option>
                        <option value="AT_RISK_REGISTRY">Academic At-Risk &amp; Remedial Interventions Registry</option>
                        <option value="SYLLABUS_ATTAINMENT">Course Syllabus &amp; Assessment Attainment</option>
                      </select>
                    </div>

                    <div>
                      <small style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>SEMESTER</small>
                      <select
                        className="admin-form-select"
                        value={reportSemFilter}
                        onChange={e => setReportSemFilter(e.target.value)}
                        style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                      >
                        <option value="Semester 5">Semester 5 (Autumn 2026)</option>
                        <option value="Semester 3">Semester 3 (Autumn 2026)</option>
                        <option value="Semester 1">Semester 1 (Autumn 2026)</option>
                      </select>
                    </div>

                    <div>
                      <small style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>SECTION</small>
                      <select
                        className="admin-form-select"
                        value={reportSectionFilter}
                        onChange={e => setReportSectionFilter(e.target.value)}
                        style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                      >
                        <option value="Section A">Section A (32 Cohort)</option>
                        <option value="Section B">Section B (30 Cohort)</option>
                        <option value="Section C">Section C (29 Cohort)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="admin-action-btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#0f766e' }}
                      onClick={() => downloadDepartmentGazettePdf(`CSE_${selectedReportType}_${reportSemFilter}_${reportSectionFilter}`)}
                    >
                      <Download size={13} /> Export PDF
                    </button>
                    <button
                      className="admin-action-btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => exportToCsv(`CSE_${selectedReportType}.csv`, students.slice(0, 32).map((s, i) => ({ SL: i + 1, Roll: s.rollNumber, Name: s.name, Mid1: 18, Mid2: 17.5, Quizzes: 8.5, Assignments: 9.0, Practical: 27.0, FinalCIA_20: 17.4, Grade: 'A+' })))}
                    >
                      <FileSpreadsheet size={13} /> Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Table of Selected Report */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Live Preview: {selectedReportType.replace(/_/g, ' ')} ({reportSemFilter} · {reportSectionFilter})</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Certified department returns generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.
                    </p>
                  </div>
                  <span className="admin-badge approved">Provisional Approved</span>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Roll #</th>
                        <th>Student Name</th>
                        <th>Mid-1 (20)</th>
                        <th>Mid-2 (20)</th>
                        <th>Quizzes (10)</th>
                        <th>Assign (10)</th>
                        <th>Surprise (10)</th>
                        <th>Lab Practical (30)</th>
                        <th>Final CIA (20)</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 10).map((s, i) => (
                        <tr key={s.id}>
                          <td>{i + 1}</td>
                          <td><strong>#{s.rollNumber}</strong></td>
                          <td>{s.name}</td>
                          <td>18.0</td>
                          <td>17.5</td>
                          <td>8.5</td>
                          <td>9.0</td>
                          <td>8.0</td>
                          <td>27.0</td>
                          <td><strong style={{ color: '#0f766e' }}>17.6 / 20</strong></td>
                          <td><strong style={{ color: '#059669' }}>A+</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Department Academic Calendar & Holiday List Duo */}
              <div className="dash-grid-duo" style={{ marginTop: '1.25rem' }}>
                <CalendarWidget account={account} />
                <HolidayListWidget title="Academic Holiday List" />
              </div>
            </div>
          )}

          {/* TAB 8: DOCUMENTS */}
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
                  🎓 Student Uploaded Documents (Section &amp; Semester Registry)
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
                  🏛️ Campus Institutional Files ({hodDocs.length})
                </button>
              </div>

              {docsViewMode === 'student_docs' ? (
                <StudentDocumentsTable portalRole="hod" />
              ) : (() => {
                const catColor = { Academic: '#2563eb', Examination: '#dc2626', Training: '#d97706', Circular: '#7c3aed', Notice: '#059669', Other: '#475569' };
                const fileTypeColor = { PDF: '#dc2626', DOCX: '#2563eb', XLSX: '#16a34a', PPTX: '#d97706', JPG: '#9333ea', PNG: '#0891b2' };
                const filtered = hodDocs.filter(d =>
                  d.title.toLowerCase().includes(hodDocsSearch.toLowerCase()) ||
                  (d.category || '').toLowerCase().includes(hodDocsSearch.toLowerCase()) ||
                  (d.description || '').toLowerCase().includes(hodDocsSearch.toLowerCase())
                );
                return (
                  <div>
                    <div className="hod-view-header">
                      <div>
                        <h2>Campus Documents</h2>
                        <p>Institutional documents shared with HOD by the Administration. ({hodDocs.length} available)</p>
                      </div>
                    </div>
                    <div className="admin-search-wrap" style={{ marginBottom: '1.25rem', maxWidth: '480px' }}>
                      <Search size={15} style={{ color: '#94a3b8' }} />
                      <input className="admin-search-input" placeholder="Search documents…" value={hodDocsSearch} onChange={e => setHodDocsSearch(e.target.value)} />
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

          {/* TAB 9: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="hod" />
          )}
        </div>
      </AppLayout>

      {/* ── MODAL 1: DETAILED MARKS INSPECTION MODAL ── */}
      {inspectingMarksModal && (
        <div className="admin-modal-backdrop" onClick={() => setInspectingMarksModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '960px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="admin-badge active" style={{ marginRight: '8px' }}>{inspectingMarksModal.subjectCode}</span>
                <h3 style={{ display: 'inline', margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  {inspectingMarksModal.subject} — Continuous Assessment Register
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Faculty: <strong>{inspectingMarksModal.faculty}</strong> · Cohort: {inspectingMarksModal.semester} ({inspectingMarksModal.section}) · 32 Students Enrolled
                </p>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setInspectingMarksModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1rem 1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
              {/* Validation Summary Banner */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Validation Diagnostics:</strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    {inspectingMarksModal.missingMarksCount > 0 ? (
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>
                        ⚠ {inspectingMarksModal.missingMarksCount} missing marks detected in Quiz 4. Check candidate records.
                      </span>
                    ) : (
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        ✓ All 32 student entries validated. Scaled continuous total adheres to 20% autonomous criteria.
                      </span>
                    )}
                  </div>
                </div>
                <span className={`admin-badge ${inspectingMarksModal.status.toLowerCase()}`}>
                  {inspectingMarksModal.status}
                </span>
              </div>

              {/* Roster & Marks Table */}
              <div className="admin-table-container">
                <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th>Roll #</th>
                      <th>Student Name</th>
                      <th>Mid-1 (20)</th>
                      <th>Mid-2 (20)</th>
                      <th>Quiz Avg (10)</th>
                      <th>Assign (10)</th>
                      <th>Surprise (10)</th>
                      <th>Lab Pract (30)</th>
                      <th>Final CIA (20)</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 12).map(st => (
                      <tr key={st.id}>
                        <td><strong>#{st.rollNumber}</strong></td>
                        <td>{st.name}</td>
                        <td>18.0</td>
                        <td>17.5</td>
                        <td>8.5</td>
                        <td>9.0</td>
                        <td>8.0</td>
                        <td>27.0</td>
                        <td><strong style={{ color: '#0f766e' }}>17.6</strong></td>
                        <td><strong style={{ color: '#059669' }}>A+</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="admin-action-btn-secondary" onClick={() => setInspectingMarksModal(null)}>
                Close Matrix
              </button>
              {inspectingMarksModal.status === 'Pending' && (
                <>
                  <button
                    className="hod-btn-reject"
                    onClick={() => {
                      setInspectingMarksModal(null);
                      handleOpenReject(inspectingMarksModal);
                    }}
                  >
                    <XCircle size={14} /> Return for Revision
                  </button>
                  <button
                    className="hod-btn-approve"
                    onClick={() => handleApprove(inspectingMarksModal.id, inspectingMarksModal.subject)}
                  >
                    <CheckCircle2 size={14} /> Approve &amp; Publish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: STUDENT PROFILE MODAL ── */}
      {selectedStudentModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedStudentModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '820px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="admin-badge active" style={{ marginRight: '8px' }}>Roll #{selectedStudentModal.student?.rollNumber}</span>
                <h3 style={{ display: 'inline', margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  {selectedStudentModal.student?.name}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  <code>{selectedStudentModal.student?.studentId}</code> · {selectedStudentModal.student?.email} · {selectedStudentModal.student?.semester || 'Semester 5'} · {selectedStudentModal.student?.section || 'Section A'}
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedStudentModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ padding: '0 1.25rem' }}>
              <div className="hod-modal-tabs">
                {[
                  { id: 'overview', label: 'Academic Overview' },
                  { id: 'attendance', label: 'Attendance Breakdown' },
                  { id: 'assessments', label: 'Continuous Assessment' },
                  { id: 'trends', label: 'Performance Trends' },
                  { id: 'remedial', label: 'Remedial & Mentorship' }
                ].map(t => (
                  <button
                    key={t.id}
                    className={`hod-modal-tab-btn ${selectedStudentModal.activeTab === t.id ? 'active' : ''}`}
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
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{selectedStudentModal.student?.cgpa || '8.5'}</div>
                      <small style={{ color: '#64748b' }}>Standing: First Class Distinction</small>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ATTENDANCE RATE</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: (selectedStudentModal.student?.attendance || 85) < 75 ? '#dc2626' : '#0f766e', marginTop: '2px' }}>
                        {selectedStudentModal.student?.attendance || 85}%
                      </div>
                      <small style={{ color: (selectedStudentModal.student?.attendance || 85) < 75 ? '#dc2626' : '#059669' }}>
                        {(selectedStudentModal.student?.attendance || 85) < 75 ? 'Shortage Alert (<75%)' : 'Eligible for Exams'}
                      </small>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ACADEMIC BATCH</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>2024 - 2028 (Autonomous)</div>
                      <small style={{ color: '#64748b' }}>Mentor: Prof. B. Panda</small>
                    </div>
                  </div>
                </div>
              )}

              {selectedStudentModal.activeTab === 'attendance' && (
                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr><th>Course Code</th><th>Title</th><th>Conducted</th><th>Attended</th><th>Percentage</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {[
                        { code: 'CS501', title: 'Data Structures', total: 42, attended: 38, pct: selectedStudentModal.student?.attendance || 85 },
                        { code: 'CS502', title: 'Operating Systems', total: 38, attended: 35, pct: 92 },
                        { code: 'CS503', title: 'Database Management', total: 40, attended: 37, pct: 92.5 }
                      ].map(sub => (
                        <tr key={sub.code}>
                          <td><strong>{sub.code}</strong></td>
                          <td>{sub.title}</td>
                          <td>{sub.total} Classes</td>
                          <td>{sub.attended} Classes</td>
                          <td><strong style={{ color: sub.pct < 75 ? '#dc2626' : '#0f766e' }}>{sub.pct}%</strong></td>
                          <td><span className={`admin-badge ${sub.pct >= 75 ? 'approved' : 'inactive'}`}>{sub.pct >= 75 ? 'Qualified' : 'Shortage'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedStudentModal.activeTab === 'assessments' && (() => {
                const marks = getStudentInternalMarks(selectedStudentModal.student);
                return (
                  <div>
                    {marks.hasMissing && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle size={18} color="#dc2626" />
                        <div style={{ fontSize: '0.82rem', color: '#991b1b' }}>
                          <strong>Missing Internal Evaluation Components Detected:</strong> {marks.missingItems.join(', ')} marks have not yet been submitted by the course faculty.
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CONTINUOUS MARKS TOTAL</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: marks.hasMissing ? '#dc2626' : '#059669', marginTop: '2px' }}>
                          {marks.totalInternal} / 50
                        </div>
                        <small style={{ color: '#64748b' }}>Weightage: 50% Internal</small>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>EVALUATION STATUS</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: marks.hasMissing ? '#dc2626' : '#059669', marginTop: '2px' }}>
                          {marks.status}
                        </div>
                        <small style={{ color: marks.hasMissing ? '#dc2626' : '#059669' }}>
                          {marks.hasMissing ? `${marks.missingItems.length} Component Pending` : 'All Components Entered'}
                        </small>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>ACADEMIC STANDING</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e', marginTop: '2px' }}>
                          {marks.totalInternal >= 40 ? 'Distinction' : marks.totalInternal >= 30 ? 'First Class' : 'Pass / Remedial'}
                        </div>
                        <small style={{ color: '#64748b' }}>Based on Autonomous Scale</small>
                      </div>
                    </div>

                    <div className="admin-table-container">
                      <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                        <thead>
                          <tr>
                            <th>Assessment Component</th>
                            <th>Max Marks</th>
                            <th>Scored Marks</th>
                            <th>Attainment Status</th>
                            <th>Faculty Evaluator</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Modular Examination 1 (Mid-1)</strong></td>
                            <td>30</td>
                            <td><strong style={{ color: '#059669' }}>{marks.mid1}</strong></td>
                            <td><span className="admin-badge approved">Evaluated &amp; Approved</span></td>
                            <td>Dr. S. Mohanty</td>
                          </tr>
                          <tr>
                            <td><strong>Modular Examination 2 (Mid-2)</strong></td>
                            <td>30</td>
                            <td><strong style={{ color: '#059669' }}>{marks.mid2}</strong></td>
                            <td><span className="admin-badge approved">Evaluated &amp; Approved</span></td>
                            <td>Dr. S. Mohanty</td>
                          </tr>
                          <tr>
                            <td><strong>Quiz 1 (Topic: Asymptotic Complexity)</strong></td>
                            <td>10</td>
                            <td><strong style={{ color: '#059669' }}>{marks.q1}</strong></td>
                            <td><span className="admin-badge approved">Completed</span></td>
                            <td>Dr. S. Mohanty</td>
                          </tr>
                          <tr>
                            <td><strong>Quiz 2 (Topic: Binary Search Trees)</strong></td>
                            <td>10</td>
                            <td><strong style={{ color: '#059669' }}>{marks.q2}</strong></td>
                            <td><span className="admin-badge approved">Completed</span></td>
                            <td>Dr. S. Mohanty</td>
                          </tr>
                          <tr>
                            <td><strong>Quiz 3 (Topic: Graph Algorithms)</strong></td>
                            <td>10</td>
                            <td><strong style={{ color: '#059669' }}>{marks.q3}</strong></td>
                            <td><span className="admin-badge approved">Completed</span></td>
                            <td>Dr. S. Mohanty</td>
                          </tr>
                          <tr>
                            <td><strong>Quiz 4 (Topic: Dynamic Programming)</strong></td>
                            <td>10</td>
                            <td>
                              {marks.q4 !== null ? (
                                <strong style={{ color: '#059669' }}>{marks.q4}</strong>
                              ) : (
                                <span className="hod-missing-tag">Missing / Not Entered</span>
                              )}
                            </td>
                            <td>
                              {marks.q4 !== null ? (
                                <span className="admin-badge approved">Completed</span>
                              ) : (
                                <span className="admin-badge inactive" style={{ background: '#fee2e2', color: '#991b1b' }}>Pending Evaluation</span>
                              )}
                            </td>
                            <td>Dr. S. Mohanty</td>
                          </tr>
                          <tr>
                            <td><strong>Continuous Assignment &amp; Tutorial Journal</strong></td>
                            <td>10</td>
                            <td><strong style={{ color: '#059669' }}>{marks.assignment}</strong></td>
                            <td><span className="admin-badge approved">Verified</span></td>
                            <td>Dr. S. Mohanty</td>
                          </tr>
                          <tr>
                            <td><strong>Practical Lab Assessment</strong></td>
                            <td>10</td>
                            <td>
                              {marks.practical !== null ? (
                                <strong style={{ color: '#059669' }}>{marks.practical}</strong>
                              ) : (
                                <span className="hod-missing-tag">Missing / Not Entered</span>
                              )}
                            </td>
                            <td>
                              {marks.practical !== null ? (
                                <span className="admin-badge approved">Completed</span>
                              ) : (
                                <span className="admin-badge inactive" style={{ background: '#fee2e2', color: '#991b1b' }}>Pending Evaluation</span>
                              )}
                            </td>
                            <td>Prof. B. Panda</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {selectedStudentModal.activeTab === 'trends' && (
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
                        <div style={{ width: `${(s.sgpa / 10) * 100}%`, height: '100%', background: '#0f766e', borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedStudentModal.activeTab === 'remedial' && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="admin-badge approved">Special Doubt Clearing Tutorial</span>
                    <small style={{ color: '#64748b' }}>Target Date: 16 Oct 2026</small>
                  </div>
                  <p style={{ margin: '6px 0 2px', fontSize: '0.82rem', color: '#334155' }}>
                    Assigned problem-solving tutorial session for binary search tree balancing and dynamic programming concepts.
                  </p>
                  <small style={{ color: '#0f766e', fontWeight: 600 }}>Assigned by Dr. P. K. Pattnaik · Department of CSE</small>
                </div>
              )}
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="admin-action-btn-primary" onClick={() => setSelectedStudentModal(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: FACULTY OVERSIGHT & PROFILE MODAL ── */}
      {selectedFacultyModal && (() => {
        const facComplaints = allComplaints.filter(c =>
          c.concernedFacultyId === selectedFacultyModal.id ||
          (c.concernedFacultyName && c.concernedFacultyName.toLowerCase().includes(selectedFacultyModal.name.toLowerCase()))
        );
        const facAnnouncements = facultyBroadcastsList.filter(b =>
          b.facultyId === selectedFacultyModal.id ||
          (b.facultyName && b.facultyName.toLowerCase().includes(selectedFacultyModal.name.toLowerCase()))
        );

        return (
          <div className="admin-modal-backdrop" onClick={() => setSelectedFacultyModal(null)}>
            <div className="admin-modal-card" style={{ maxWidth: '840px', width: '95%' }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f766e, #0d9488)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                    {selectedFacultyModal.name.replace('Dr. ', '').replace('Prof. ', '').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="admin-badge active">{selectedFacultyModal.id}</span>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                        {selectedFacultyModal.name}
                      </h3>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      {selectedFacultyModal.designation} · {selectedFacultyModal.email} · Cabin: Room 304, IT Block B · Ext: 4421
                    </p>
                  </div>
                </div>
                <button
                  className="admin-modal-close"
                  onClick={() => setSelectedFacultyModal(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ×
                </button>
              </div>

              {/* Modal Tabs Navigation */}
              <div style={{ padding: '0 1.25rem' }}>
                <div className="hod-modal-tabs">
                  {[
                    { id: 'profile', label: 'Teaching Workload & Profile' },
                    { id: 'grievances', label: `Student Grievances (${facComplaints.length})` },
                    { id: 'marks', label: 'Continuous Marks Compliance' },
                    { id: 'announcements', label: `Broadcasted Notices (${facAnnouncements.length})` }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`hod-modal-tab-btn ${facultyOversightTab === t.id ? 'active' : ''}`}
                      onClick={() => setFacultyOversightTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '1rem 1.25rem', maxHeight: '62vh', overflowY: 'auto' }}>
                {/* TAB 1: PROFILE & WORKLOAD */}
                {facultyOversightTab === 'profile' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>TEACHING WORKLOAD</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', marginTop: '2px' }}>14 Hours / Wk</div>
                        <small style={{ color: '#059669' }}>Within AICTE prescribed limits</small>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>TEACHING SECTIONS</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>2 Active Sections</div>
                        <small style={{ color: '#64748b' }}>Sem 5 (Sec A, Sec B)</small>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>STUDENT REACH</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>96 Students</div>
                        <small style={{ color: '#64748b' }}>Direct classroom instruction</small>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>STUDENT FEEDBACK RATING</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>4.8 / 5.0</div>
                        <small style={{ color: '#059669' }}>Autonomous Feedback Tier 1</small>
                      </div>
                    </div>

                    <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#1e293b' }}>Assigned Teaching Courses (Autumn Term 2026-27)</h4>
                    <div className="admin-table-container" style={{ marginBottom: '1.25rem' }}>
                      <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                        <thead>
                          <tr>
                            <th>Course Code &amp; Title</th>
                            <th>Semester &amp; Section</th>
                            <th>Credits / Type</th>
                            <th>Contact Hours</th>
                            <th>Syllabus Completion</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(selectedFacultyModal.assignedSubjects) ? selectedFacultyModal.assignedSubjects : [selectedFacultyModal.assignedSubjects]).map((sub, idx) => (
                            <tr key={sub}>
                              <td>
                                <strong>{sub}</strong>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Core Department Curriculum</div>
                              </td>
                              <td>Semester 5 · Section {idx === 0 ? 'A' : 'B'}</td>
                              <td>4.0 · Theory + Tutorial</td>
                              <td>4 Hrs / Wk</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: '72%', height: '100%', background: '#0f766e' }} />
                                  </div>
                                  <strong style={{ fontSize: '0.75rem', color: '#0f766e' }}>72%</strong>
                                </div>
                              </td>
                              <td><span className="admin-badge approved">On Schedule</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#1e293b' }}>Academic &amp; Departmental Responsibilities</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                        <strong style={{ color: '#0f172a' }}>Course Coordinator: Data Structures &amp; Algorithms</strong>
                        <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.76rem' }}>Oversees autonomous question paper setting and rubric harmonization.</p>
                      </div>
                      <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                        <strong style={{ color: '#0f172a' }}>NBA Accreditation: Criterion 4 In-charge</strong>
                        <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.76rem' }}>Maintains student progression, placement records, and graduate exit surveys.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ASSOCIATED STUDENT GRIEVANCES */}
                {facultyOversightTab === 'grievances' && (
                  <div>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ShieldCheck size={20} color="#16a34a" />
                      <div style={{ fontSize: '0.82rem', color: '#166534' }}>
                        <strong>Student Anonymity Preserved:</strong> In accordance with autonomous institution governance, student identities are strictly masked as <em>Anonymous Student (Autonomous CSE)</em>.
                      </div>
                    </div>

                    {facComplaints.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                        <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 8px' }} />
                        <h4 style={{ margin: 0, color: '#0f172a' }}>Zero Grievances Registered</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                          No student complaints or grievances have been registered against {selectedFacultyModal.name}. Commendable classroom feedback and academic adherence.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {facComplaints.map(c => (
                          <div key={c.id || c.complaintId} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                              <div>
                                <span className="admin-badge" style={{ background: '#f1f5f9', color: '#475569', marginRight: '6px' }}>
                                  <ShieldAlert size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                  Anonymous Student (Autonomous CSE)
                                </span>
                                <span className="admin-badge active" style={{ marginRight: '6px' }}>
                                  {c.category?.replace(/_/g, ' ') || 'ACADEMIC'}
                                </span>
                                <span className={`admin-badge ${c.status === 'RESOLVED' ? 'approved' : c.status === 'UNDER_REVIEW' ? 'pending' : 'active'}`}>
                                  {c.status?.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <small style={{ color: '#64748b' }}>
                                Submitted: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                              </small>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '10px' }}>
                              <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                                Course Context: {c.subjectName || c.subjectCode || 'Data Structures'} ({c.semester || 'Semester 5'} · {c.section || 'Section A'})
                              </strong>
                              <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                                &ldquo;{c.description}&rdquo;
                              </p>
                            </div>

                            {/* Faculty Response */}
                            {c.facultyResponse ? (
                              <div style={{ background: '#f0fdfa', borderLeft: '4px solid #0f766e', padding: '10px 12px', borderRadius: '0 8px 8px 0', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#0f766e', fontWeight: 700, marginBottom: '4px' }}>
                                  <span>Faculty Response from {selectedFacultyModal.name}:</span>
                                  <span>Response Time: 18 hrs</span>
                                </div>
                                <p style={{ margin: '0 0 6px', fontSize: '0.82rem', color: '#134e4a', lineHeight: 1.5 }}>
                                  {c.facultyResponse}
                                </p>
                                {c.correctiveAction && (
                                  <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                                    <strong>Proposed Corrective Action:</strong> {c.correctiveAction}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 12px', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} color="#d97706" />
                                <span style={{ fontSize: '0.8rem', color: '#92400e' }}>
                                  Faculty response pending submission. Awaiting formal explanation from instructor.
                                </span>
                              </div>
                            )}

                            {/* HOD Review Comments */}
                            {c.hodRemarks && (
                              <div style={{ background: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '8px 12px', borderRadius: '0 8px 8px 0', fontSize: '0.8rem', color: '#1e40af', marginBottom: '8px' }}>
                                <strong>HOD Observation &amp; Decision:</strong> {c.hodRemarks}
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                              <button
                                type="button"
                                className="admin-action-btn-secondary"
                                style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                                onClick={() => {
                                  setSelectedFacultyModal(null);
                                  setActiveTab('complaints');
                                }}
                              >
                                Review in Department Grievance Console →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: CONTINUOUS MARKS COMPLIANCE */}
                {facultyOversightTab === 'marks' && (
                  <div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Autumn 2026 Continuous Evaluation Submission Audit</strong>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                            Verification of modular tests, quizzes, and continuous lab assessments.
                          </p>
                        </div>
                        <span className="admin-badge approved" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                          94% Overall Compliance
                        </span>
                      </div>

                      <div className="admin-table-container">
                        <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                          <thead>
                            <tr>
                              <th>Assessment Component</th>
                              <th>Max Marks</th>
                              <th>Submission Status</th>
                              <th>HOD Moderation</th>
                              <th>Action Needed</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>Modular Examination 1 (Mid-1)</strong></td>
                              <td>30</td>
                              <td><span className="admin-badge approved">32 / 32 Submitted</span></td>
                              <td><span className="admin-badge approved">Approved by HOD</span></td>
                              <td><span style={{ color: '#059669', fontWeight: 600 }}>None · Verified</span></td>
                            </tr>
                            <tr>
                              <td><strong>Modular Examination 2 (Mid-2)</strong></td>
                              <td>30</td>
                              <td><span className="admin-badge approved">32 / 32 Submitted</span></td>
                              <td><span className="admin-badge pending">Pending HOD Sign-off</span></td>
                              <td>
                                <button
                                  type="button"
                                  className="admin-action-btn-primary"
                                  style={{ padding: '2px 8px', fontSize: '0.72rem', background: '#0f766e' }}
                                  onClick={() => {
                                    setSelectedFacultyModal(null);
                                    setActiveTab('approval');
                                  }}
                                >
                                  Sign Off
                                </button>
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Quizzes 1 to 4</strong></td>
                              <td>20 (Scaled)</td>
                              <td>
                                <span className="admin-badge inactive" style={{ background: '#fee2e2', color: '#991b1b' }}>
                                  29 / 32 Submitted (Quiz 4 Missing for 3)
                                </span>
                              </td>
                              <td><span className="admin-badge inactive">Revision Required</span></td>
                              <td>
                                <button
                                  type="button"
                                  className="admin-action-btn-secondary"
                                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                                  onClick={() => showToast(`Automated reminder alert dispatched to ${selectedFacultyModal.name}!`)}
                                >
                                  Send Reminder
                                </button>
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Continuous Lab Practical Assessment</strong></td>
                              <td>10</td>
                              <td><span className="admin-badge approved">32 / 32 Submitted</span></td>
                              <td><span className="admin-badge approved">Approved by HOD</span></td>
                              <td><span style={{ color: '#059669', fontWeight: 600 }}>None · Verified</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: BROADCASTED ANNOUNCEMENTS */}
                {facultyOversightTab === 'announcements' && (
                  <div>
                    {facAnnouncements.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                        <Megaphone size={36} color="#64748b" style={{ margin: '0 auto 8px' }} />
                        <h4 style={{ margin: 0, color: '#0f172a' }}>No Broadcasts Published</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                          No recent academic circulars or announcements dispatched by {selectedFacultyModal.name}.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {facAnnouncements.map(b => (
                          <div key={b.id || b.notificationId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span className="admin-badge active">{b.category || 'ACADEMIC'}</span>
                                <span className={`admin-badge ${b.priority === 'URGENT' ? 'inactive' : 'approved'}`}>{b.priority || 'NORMAL'}</span>
                                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{b.title}</strong>
                              </div>
                              <small style={{ color: '#64748b' }}>
                                {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recent'}
                              </small>
                            </div>
                            <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                              {b.message}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#64748b' }}>
                              <span>Target: <strong>{b.semester || 'Semester 5'} · {b.section || 'Section A'}</strong></span>
                              <span style={{ color: '#059669', fontWeight: 600 }}>Student Read Rate: 30 / 32 (94%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button className="admin-action-btn-secondary" onClick={() => setSelectedFacultyModal(null)}>
                  Close Oversight
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL 4: SUBJECT DETAILS MODAL ── */}
      {selectedSubjectModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedSubjectModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '650px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="admin-badge active" style={{ marginRight: '8px' }}>{selectedSubjectModal.code}</span>
                <h3 style={{ display: 'inline', margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                  {selectedSubjectModal.name}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedSubjectModal.semester} · {selectedSubjectModal.credits} Credits · {selectedSubjectModal.type}
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedSubjectModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ padding: '1rem 1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>COURSE COORDINATOR</span>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedSubjectModal.assignedFaculty}</div>
              </div>

              <h4 style={{ margin: '0.5rem 0', color: '#1e293b' }}>Autonomous Curriculum Modules</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <strong>Module I: Core Principles &amp; Theoretical Foundations (12 Hours)</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Fundamental definitions, complexity benchmarks, and linear structures.</p>
                </div>
                <div style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <strong>Module II: Advanced Algorithms &amp; Complex Structures (14 Hours)</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Hierarchical trees, balancing factors, graph traversals, and dynamic programming.</p>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="admin-action-btn-secondary" onClick={() => setSelectedSubjectModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: LOG REMEDIAL INTERVENTION ── */}
      {remedialActionModal && (
        <div className="admin-modal-backdrop" onClick={() => setRemedialActionModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '580px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Log Academic Support &amp; Remedial Action</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Target Student: <strong>{remedialActionModal.name}</strong> (Roll #{remedialActionModal.rollNumber})
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setRemedialActionModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>INTERVENTION TYPE</label>
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
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>TARGET FOLLOW-UP DATE</label>
                  <input
                    type="date"
                    className="admin-form-input"
                    value={remedialForm.followUpDate}
                    onChange={e => setRemedialForm({ ...remedialForm, followUpDate: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ACTION PLAN &amp; HOD NOTES</label>
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
              <button className="admin-action-btn-secondary" onClick={() => setRemedialActionModal(null)}>Cancel</button>
              <button
                className="admin-action-btn-primary"
                style={{ background: '#0f766e' }}
                onClick={async () => {
                  try {
                    await hodApi.logIntervention({
                      studentId: remedialActionModal.studentId || remedialActionModal.id,
                      studentName: remedialActionModal.name,
                      rollNumber: remedialActionModal.rollNumber,
                      ...remedialForm
                    });
                  } catch {
                    // handled
                  }
                  showToast(`✓ Remedial action plan logged for ${remedialActionModal.name}!`);
                  setRemedialActionModal(null);
                }}
              >
                Save Intervention Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: REJECT MARKS WITH MANDATORY REASON ── */}
      {rejectingItem && (
        <div className="admin-modal-backdrop" onClick={() => setRejectingItem(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ color: '#e11d48' }}>Return Marks Submission for Revision</h3>
              <button className="admin-table-action-btn" onClick={() => setRejectingItem(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfirmReject}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                  You are returning continuous evaluation marks for <strong>{rejectingItem.subject}</strong> ({rejectingItem.faculty}) back to the faculty.
                </p>
                <div className="admin-form-group">
                  <label style={{ fontWeight: 700, color: '#0f172a' }}>Reason for Revision (Mandatory):</label>
                  <textarea
                    rows={4}
                    className="admin-form-input"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="e.g. Quiz 4 marks are missing for 4 students. Please complete evaluation and resubmit."
                    required
                  />
                  <small style={{ color: '#64748b' }}>This feedback will be displayed directly to the faculty member upon their next login.</small>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setRejectingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary" style={{ background: '#e11d48' }}>
                  Confirm &amp; Notify Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── MODAL 7: BROADCAST CONFIRMATION MODAL ── */}
      {showBroadcastConfirmModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowBroadcastConfirmModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '620px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="admin-badge active" style={{ marginRight: '8px' }}>OFFICIAL CIRCULAR</span>
                <h3 style={{ display: 'inline', margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                  Confirm Department Announcement Broadcast
                </h3>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setShowBroadcastConfirmModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', gap: '10px' }}>
                <Megaphone size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: '#1e40af', lineHeight: 1.5 }}>
                  You are publishing an official departmental notification on behalf of the <strong>Head of Department, CSE</strong>. This announcement will be immediately delivered to student dashboards and communication hubs.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.84rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Target Recipient Cohort:</span>
                  <strong style={{ color: '#1e40af' }}>{notifForm.targetGroup.replace(/_/g, ' ')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.84rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Audience Reach:</span>
                  <strong style={{ color: '#059669' }}>{broadcastRecipientCount} Enrolled Students</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.84rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Announcement Category:</span>
                  <strong>{notifForm.category.replace(/_/g, ' ')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.84rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Priority Level:</span>
                  <span className={`admin-badge ${notifForm.priority === 'URGENT' ? 'inactive' : notifForm.priority === 'IMPORTANT' ? 'pending' : 'approved'}`}>
                    {notifForm.priority}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.84rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Publication Timing:</span>
                  <strong>{notifForm.scheduledDate ? new Date(notifForm.scheduledDate).toLocaleString() : 'Immediate Dispatch'}</strong>
                </div>

                {notifForm.attachmentName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.84rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Attached Document:</span>
                    <strong style={{ color: '#2563eb' }}>{notifForm.attachmentName}</strong>
                  </div>
                )}
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>ANNOUNCEMENT PREVIEW</div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', marginBottom: '4px' }}>{notifForm.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto' }}>
                  {notifForm.message}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="admin-action-btn-secondary" onClick={() => setShowBroadcastConfirmModal(false)}>
                Back to Edit
              </button>
              <button
                className="admin-action-btn-primary"
                style={{ background: '#2563eb' }}
                onClick={handlePublishBroadcast}
              >
                <Send size={14} /> Confirm &amp; Dispatch Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 8: INSPECT FACULTY ANNOUNCEMENT ── */}
      {inspectingNotifModal && (
        <div className="admin-modal-backdrop" onClick={() => setInspectingNotifModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '640px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="admin-badge active" style={{ marginRight: '8px' }}>{inspectingNotifModal.category || 'ACADEMIC'}</span>
                <span className={`admin-badge ${inspectingNotifModal.priority === 'URGENT' ? 'inactive' : 'approved'}`} style={{ marginRight: '8px' }}>
                  {inspectingNotifModal.priority || 'NORMAL'}
                </span>
                <h3 style={{ display: 'inline', margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                  Announcement Inspection
                </h3>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setInspectingNotifModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#0f172a' }}>
                {inspectingNotifModal.title}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Dispatched By:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectingNotifModal.facultyName || 'Department Faculty'}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{inspectingNotifModal.facultyEmail || ''}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Target Cohort:</span>
                  <div style={{ fontWeight: 700, color: '#1e40af' }}>
                    {inspectingNotifModal.semester || 'Semester 5'} · {inspectingNotifModal.section || 'Section A'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{inspectingNotifModal.subjectCode} - {inspectingNotifModal.subjectName}</div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>ANNOUNCEMENT MESSAGE</div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {inspectingNotifModal.message}
                </p>
              </div>

              {/* Delivery and Read Stats */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534' }}>STUDENT READ CONFIRMATION METRIC</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                    30 of 32 Students Acknowledged (93.8%)
                  </div>
                </div>
                <span className="admin-badge approved">Delivery Confirmed</span>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="admin-action-btn-secondary" onClick={() => setInspectingNotifModal(null)}>
                Close
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
          sender={{ name: account?.name || 'Prof. S. R. Pattnaik', role: 'HOD', deptCode: 'CSE' }}
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
          sender={{ name: account?.name || 'Prof. S. R. Pattnaik', role: 'HOD', deptCode: 'CSE' }}
          onNoticeSent={(res) => {
            showToast(`Official parent notice dispatched to ${res.parentName} via ${res.channels.join(', ')}`);
          }}
        />
      )}
    </>
  );
}
