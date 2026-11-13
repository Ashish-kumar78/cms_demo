import { useState } from "react"
import {
  BarChart3,
  CalendarClock,
  Camera,
  ClipboardCheck,
  Film,
  GraduationCap,
  ShieldAlert,
  X,
} from "lucide-react"
import type { SmartCctvTab } from "./CctvStatusHud"
import { FacultyDashboard } from "./FacultyDashboard"
import { FacultyPlaybackReview } from "./FacultyPlaybackReview"
import { UnknownStudentsPanel } from "./UnknownStudentsPanel"
import { AdminCctvDashboard } from "./AdminCctvDashboard"
import { TimetableSectionsPanel } from "./TimetableSectionsPanel"
import { HodReportsPanel, StudentPortalPanel } from "./HodStudentViews"
import "./CctvHub.css"

type UserRole = "faculty" | "admin" | "hod" | "student"

interface SmartCctvHubProps {
  isOpen: boolean
  initialTab?: SmartCctvTab
  onClose: () => void
  userRole?: UserRole
  onApplyAttendance?: (attendanceMap: Record<string, boolean>, auditDetails: any) => void
}

const ROLE_DEFAULT_TAB: Record<UserRole, SmartCctvTab> = {
  faculty: "faculty",
  admin: "admin",
  hod: "hod",
  student: "student",
}

const TABS: {
  id: SmartCctvTab
  label: string
  roles: UserRole[]
  icon: typeof Camera
}[] = [
  { id: "faculty", label: "Faculty Monitor", roles: ["faculty", "admin"], icon: ClipboardCheck },
  { id: "playback", label: "Class Playback & Review", roles: ["faculty", "admin"], icon: Film },
  { id: "unknowns", label: "Unknown Students", roles: ["faculty", "admin"], icon: ShieldAlert },
  { id: "admin", label: "CCTV & V-LASER Grid", roles: ["admin"], icon: Camera },
  { id: "timetable", label: "Timetable & Profiles", roles: ["admin", "faculty"], icon: CalendarClock },
  { id: "hod", label: "HOD Reports & Audit", roles: ["hod", "admin"], icon: BarChart3 },
  { id: "student", label: "Student Self-View", roles: ["student", "admin"], icon: GraduationCap },
]

export function SmartCctvHub({
  isOpen,
  initialTab = "faculty",
  onClose,
  userRole = "faculty",
  onApplyAttendance,
}: SmartCctvHubProps) {
  const [role, setRole] = useState<UserRole>(userRole)
  const [activeTab, setActiveTab] = useState<SmartCctvTab>(initialTab || ROLE_DEFAULT_TAB[userRole] || "faculty")

  if (!isOpen) return null

  const visibleTabs = TABS.filter((t) => t.roles.includes(role))
  const currentTab = visibleTabs.some((t) => t.id === activeTab) ? activeTab : visibleTabs[0].id

  return (
    <div
      role="dialog"
      aria-label="APNA CAMPUS Smart CCTV Attendance Hub"
      className="cctv-hub-dialog-overlay"
      onClick={onClose}>
      <div className="cctv-hub-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cctv-hub-header">
          <div>
            <h2>
              <Camera className="size-4 text-cyan-400" />
              APNA CAMPUS ERP • Smart CCTV Attendance & Recovery Hub
            </h2>
            <p>
              Centralized 10-Factor Biometric Verification, Camera Fault Recovery & Governance
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Role Switcher */}
            <div className="cctv-role-switcher">
              {(["faculty", "admin", "hod", "student"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r)
                    setActiveTab(ROLE_DEFAULT_TAB[r])
                  }}
                  className={`cctv-role-btn ${role === r ? "active" : ""}`}>
                  {r === "hod" ? "HOD" : r}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Smart CCTV Hub"
              className="cctv-hub-close-btn">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="cctv-nav-tabs-bar">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            const isSelected = currentTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`cctv-nav-tab ${isSelected ? "active" : ""}`}>
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Active Panel Content */}
        <div className="cctv-hub-scroll-body">
          {currentTab === "faculty" && <FacultyDashboard onApplyAttendance={onApplyAttendance} />}
          {currentTab === "playback" && <FacultyPlaybackReview />}
          {currentTab === "unknowns" && <UnknownStudentsPanel />}
          {currentTab === "admin" && <AdminCctvDashboard />}
          {currentTab === "timetable" && <TimetableSectionsPanel />}
          {currentTab === "hod" && <HodReportsPanel />}
          {currentTab === "student" && <StudentPortalPanel />}
        </div>
      </div>
    </div>
  )
}

