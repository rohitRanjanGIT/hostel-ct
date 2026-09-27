import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Contractor,
  Category,
  Complaint,
  ComplaintStatusLog,
  Role,
  ComplaintStatus,
  Priority,
} from '../types';
import {
  SEED_USERS,
  SEED_CONTRACTORS,
  SEED_CATEGORIES,
  SEED_COMPLAINTS,
  SEED_STATUS_LOGS,
} from '../data/seedData';

interface AppContextType {
  currentUser: User;
  users: User[];
  contractors: Contractor[];
  categories: Category[];
  complaints: Complaint[];
  statusLogs: ComplaintStatusLog[];
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  switchUser: (userId: string) => void;
  switchRole: (role: Role) => void;
  raiseComplaint: (data: {
    category_id: string;
    title: string;
    description: string;
    photo_url?: string;
    room_number: string;
    block: string;
    priority: Priority;
  }) => string;
  assignContractor: (
    complaintId: string,
    contractorId: string,
    priority?: Priority,
    note?: string
  ) => void;
  contractorUpdateStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    note?: string
  ) => void;
  contractorRespond: (
    complaintId: string,
    action: 'accept' | 'reject',
    reason?: string
  ) => void;
  cancelComplaint: (complaintId: string, reason: string) => void;
  toggleContractorActive: (contractorId: string) => void;
  addContractor: (data: {
    name: string;
    email: string;
    phone: string;
    specialization: Contractor['specialization'];
  }) => void;
  getContractorLoad: (contractorId: string) => number;
  getLogsForComplaint: (complaintId: string) => ComplaintStatusLog[];
  resetToDemoData: () => void;
}

const STORAGE_KEY = 'hostel_complaints_data_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      return saved ? JSON.parse(saved) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  const [contractors, setContractors] = useState<Contractor[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_contractors`);
      return saved ? JSON.parse(saved) : SEED_CONTRACTORS;
    } catch {
      return SEED_CONTRACTORS;
    }
  });

  const [categories] = useState<Category[]>(SEED_CATEGORIES);

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_complaints`);
      return saved ? JSON.parse(saved) : SEED_COMPLAINTS;
    } catch {
      return SEED_COMPLAINTS;
    }
  });

  const [statusLogs, setStatusLogs] = useState<ComplaintStatusLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
      return saved ? JSON.parse(saved) : SEED_STATUS_LOGS;
    } catch {
      return SEED_STATUS_LOGS;
    }
  });

  // Current logged in user (default to first student Aarav Sharma)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
      return saved || SEED_USERS[0].id;
    } catch {
      return SEED_USERS[0].id;
    }
  });

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_contractors`, JSON.stringify(contractors));
      localStorage.setItem(`${STORAGE_KEY}_complaints`, JSON.stringify(complaints));
      localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(statusLogs));
      localStorage.setItem(`${STORAGE_KEY}_current_user`, currentUserId);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [users, contractors, complaints, statusLogs, currentUserId]);

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
    }
  };

  const switchRole = (role: Role) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
    }
  };

  const getContractorLoad = (contractorId: string): number => {
    return complaints.filter(
      (c) =>
        c.assigned_contractor_id === contractorId &&
        ['assigned', 'accepted', 'visited', 'in_progress'].includes(c.status)
    ).length;
  };

  const getLogsForComplaint = (complaintId: string): ComplaintStatusLog[] => {
    return statusLogs
      .filter((l) => l.complaint_id === complaintId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const raiseComplaint = (data: {
    category_id: string;
    title: string;
    description: string;
    photo_url?: string;
    room_number: string;
    block: string;
    priority: Priority;
  }): string => {
    const category = categories.find((c) => c.id === data.category_id);
    const newId = `cmp_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newComplaint: Complaint = {
      id: newId,
      student_id: currentUser.id,
      student_name: currentUser.name,
      student_phone: currentUser.phone,
      category_id: data.category_id,
      category_name: category ? category.name : 'General',
      title: data.title,
      description: data.description,
      photo_url: data.photo_url,
      room_number: data.room_number || currentUser.room_number || '101',
      block: data.block || currentUser.block || 'Block A',
      status: 'raised',
      priority: data.priority,
      assigned_contractor_id: null,
      assigned_contractor_name: null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const newLog: ComplaintStatusLog = {
      id: `log_${Date.now()}`,
      complaint_id: newId,
      old_status: null,
      new_status: 'raised',
      changed_by_user_id: currentUser.id,
      changed_by_user_name: currentUser.name,
      changed_by_role: currentUser.role,
      note: 'Complaint raised by student',
      timestamp,
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    setStatusLogs((prev) => [...prev, newLog]);
    return newId;
  };

  const assignContractor = (
    complaintId: string,
    contractorId: string,
    priority?: Priority,
    note?: string
  ) => {
    const contractor = contractors.find((c) => c.id === contractorId);
    if (!contractor) return;

    const timestamp = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const oldStatus = c.status;
          const updated: Complaint = {
            ...c,
            status: 'assigned',
            assigned_contractor_id: contractor.id,
            assigned_contractor_name: contractor.name,
            priority: priority || c.priority,
            updated_at: timestamp,
          };

          const log: ComplaintStatusLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            complaint_id: complaintId,
            old_status: oldStatus,
            new_status: 'assigned',
            changed_by_user_id: currentUser.id,
            changed_by_user_name: currentUser.name,
            changed_by_role: currentUser.role,
            note: note || `Assigned to ${contractor.name} (${contractor.specialization})`,
            timestamp,
          };
          setStatusLogs((logs) => [...logs, log]);

          return updated;
        }
        return c;
      })
    );
  };

  const contractorRespond = (
    complaintId: string,
    action: 'accept' | 'reject',
    reason?: string
  ) => {
    const timestamp = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const oldStatus = c.status;
          const newStatus: ComplaintStatus = action === 'accept' ? 'accepted' : 'rejected';

          const updated: Complaint = {
            ...c,
            status: action === 'accept' ? 'accepted' : 'raised', // reject sends back to admin triage queue!
            assigned_contractor_id: action === 'accept' ? c.assigned_contractor_id : null,
            assigned_contractor_name: action === 'accept' ? c.assigned_contractor_name : null,
            updated_at: timestamp,
          };

          const log: ComplaintStatusLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            complaint_id: complaintId,
            old_status: oldStatus,
            new_status: newStatus,
            changed_by_user_id: currentUser.id,
            changed_by_user_name: currentUser.name,
            changed_by_role: currentUser.role,
            note:
              action === 'accept'
                ? reason || 'Job accepted by contractor'
                : `Job declined by contractor: ${reason || 'Schedule conflict'}. Returned to admin for reassignment.`,
            timestamp,
          };
          setStatusLogs((logs) => [...logs, log]);

          return updated;
        }
        return c;
      })
    );
  };

  const contractorUpdateStatus = (
    complaintId: string,
    newStatus: ComplaintStatus,
    note?: string
  ) => {
    const timestamp = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const oldStatus = c.status;
          const updated: Complaint = {
            ...c,
            status: newStatus,
            updated_at: timestamp,
          };

          const log: ComplaintStatusLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            complaint_id: complaintId,
            old_status: oldStatus,
            new_status: newStatus,
            changed_by_user_id: currentUser.id,
            changed_by_user_name: currentUser.name,
            changed_by_role: currentUser.role,
            note: note || `Status progressed to ${newStatus}`,
            timestamp,
          };
          setStatusLogs((logs) => [...logs, log]);

          return updated;
        }
        return c;
      })
    );
  };

  const cancelComplaint = (complaintId: string, reason: string) => {
    const timestamp = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const oldStatus = c.status;
          const updated: Complaint = {
            ...c,
            status: 'cancelled',
            updated_at: timestamp,
          };

          const log: ComplaintStatusLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            complaint_id: complaintId,
            old_status: oldStatus,
            new_status: 'cancelled',
            changed_by_user_id: currentUser.id,
            changed_by_user_name: currentUser.name,
            changed_by_role: currentUser.role,
            note: `Cancelled: ${reason}`,
            timestamp,
          };
          setStatusLogs((logs) => [...logs, log]);

          return updated;
        }
        return c;
      })
    );
  };

  const toggleContractorActive = (contractorId: string) => {
    setContractors((prev) =>
      prev.map((c) => (c.id === contractorId ? { ...c, is_active: !c.is_active } : c))
    );
  };

  const addContractor = (data: {
    name: string;
    email: string;
    phone: string;
    specialization: Contractor['specialization'];
  }) => {
    const newUserId = `usr_cnt_${Date.now()}`;
    const newContractorId = `cnt_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newUser: User = {
      id: newUserId,
      name: data.name,
      email: data.email,
      role: 'contractor',
      phone: data.phone,
      created_at: timestamp,
    };

    const newContractor: Contractor = {
      id: newContractorId,
      user_id: newUserId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialization: data.specialization,
      is_active: true,
      rating: 5.0,
      completed_jobs_count: 0,
    };

    setUsers((prev) => [...prev, newUser]);
    setContractors((prev) => [...prev, newContractor]);
  };

  const resetToDemoData = () => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_users`);
      localStorage.removeItem(`${STORAGE_KEY}_contractors`);
      localStorage.removeItem(`${STORAGE_KEY}_complaints`);
      localStorage.removeItem(`${STORAGE_KEY}_logs`);
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    } catch {}

    setUsers(SEED_USERS);
    setContractors(SEED_CONTRACTORS);
    setComplaints(SEED_COMPLAINTS);
    setStatusLogs(SEED_STATUS_LOGS);
    setCurrentUserId(SEED_USERS[0].id);
    setSelectedComplaintId(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        contractors,
        categories,
        complaints,
        statusLogs,
        selectedComplaintId,
        setSelectedComplaintId,
        switchUser,
        switchRole,
        raiseComplaint,
        assignContractor,
        contractorUpdateStatus,
        contractorRespond,
        cancelComplaint,
        toggleContractorActive,
        addContractor,
        getContractorLoad,
        getLogsForComplaint,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
