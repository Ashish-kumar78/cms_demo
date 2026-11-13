import { useState, useEffect } from 'react';

// Default academic groups for Apna Campus
const DEFAULT_GROUPS = [
  { id: 'btech-cse-5a', name: 'B.Tech CSE - Section A (Sem 5)', department: 'CSE', section: 'A' },
  { id: 'btech-cse-5b', name: 'B.Tech CSE - Section B (Sem 5)', department: 'CSE', section: 'B' },
  { id: 'btech-cse-3a', name: 'B.Tech CSE - Section A (Sem 3)', department: 'CSE', section: 'A' },
  { id: 'btech-it-5a', name: 'B.Tech IT - Section A (Sem 5)', department: 'IT', section: 'A' },
  { id: 'btech-ece-5a', name: 'B.Tech ECE - Section A (Sem 5)', department: 'ECE', section: 'A' },
];

let globalGroup = DEFAULT_GROUPS[0];
let globalGroups = [...DEFAULT_GROUPS];
let globalActiveCameraId: string | null = 'cam-cs-301';
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

export function useAttendanceStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const cb = () => setTick((t) => t + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  return {
    currentGroup: globalGroup,
    attendanceGroups: globalGroups,
    groupMembers: [],
    recentAttendance: [],
    setCurrentGroup: (g: any) => {
      globalGroup = g;
      notify();
    },
    setAttendanceGroups: (groups: any[]) => {
      globalGroups = groups;
      notify();
    },
  };
}

export function useDetectionStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const cb = () => setTick((t) => t + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  return {
    activeCctvCameraId: globalActiveCameraId,
    setActiveCctvCameraId: (id: string | null) => {
      globalActiveCameraId = id;
      notify();
    },
    cctvAlerts: [],
    headcountSummary: { total: 32, present: 28, late: 2, absent: 2 },
    imageQuality: { score: 96, status: 'green' },
  };
}

