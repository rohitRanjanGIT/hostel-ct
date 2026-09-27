import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { SharedDashboard } from './components/SharedDashboard';
import { StudentView } from './components/StudentView';
import { AdminTriageView } from './components/AdminTriageView';
import { ContractorView } from './components/ContractorView';
import { ContractorManagementView } from './components/ContractorManagementView';
import { RaiseComplaintModal } from './components/RaiseComplaintModal';
import { AssignContractorModal } from './components/AssignContractorModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { Role } from './types';
import {
  GraduationCap,
  ShieldAlert,
  HardHat,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, switchUser, switchRole, complaints, resetToDemoData } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [selectedAssignComplaintId, setSelectedAssignComplaintId] = useState<string | null>(null);
  const [selectedDetailComplaintId, setSelectedDetailComplaintId] = useState<string | null>(null);

  // Sync tab when switching roles to maintain seamless user experience
  useEffect(() => {
    if (currentUser.role === 'student') {
      if (['admin_triage', 'admin_all', 'admin_contractors', 'contractor_jobs'].includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    } else if (currentUser.role === 'admin') {
      if (['student_complaints', 'contractor_jobs'].includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    } else if (currentUser.role === 'contractor') {
      if (['student_complaints', 'admin_triage', 'admin_all', 'admin_contractors'].includes(currentTab)) {
        setCurrentTab('contractor_jobs');
      }
    }
  }, [currentUser.role]);

  const complaintToAssign = complaints.find((c) => c.id === selectedAssignComplaintId) || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Interactive 3-Role Demo Bar */}
      <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Interactive Demo Flow:</span>
            <span className="text-slate-400 hidden sm:inline">
              1. Student raises → 2. Admin assigns → 3. Contractor resolves
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-[11px] mr-1">Quick Switch:</span>
            <button
              onClick={() => switchUser('usr_std_1')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                currentUser.id === 'usr_std_1'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Student (Aarav, Rm 204)</span>
            </button>

            <button
              onClick={() => switchUser('usr_adm_1')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                currentUser.id === 'usr_adm_1'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Admin (Warden)</span>
            </button>

            <button
              onClick={() => switchUser('usr_cnt_1')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                currentUser.id === 'usr_cnt_1'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <HardHat className="w-3 h-3" />
              <span>Contractor (Rajesh, Electric)</span>
            </button>

            <button
              onClick={() => switchUser('usr_cnt_3')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                currentUser.id === 'usr_cnt_3'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <HardHat className="w-3 h-3" />
              <span>Contractor (Ramesh, Plumber)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRaiseModal={() => setIsRaiseModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <SharedDashboard
            onOpenComplaint={(id) => setSelectedDetailComplaintId(id)}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'student_complaints' && (
          <StudentView
            onOpenRaiseModal={() => setIsRaiseModalOpen(true)}
            onOpenComplaint={(id) => setSelectedDetailComplaintId(id)}
          />
        )}

        {currentTab === 'admin_triage' && (
          <AdminTriageView
            viewMode="triage"
            onOpenAssignModal={(id) => setSelectedAssignComplaintId(id)}
            onOpenComplaint={(id) => setSelectedDetailComplaintId(id)}
          />
        )}

        {currentTab === 'admin_all' && (
          <AdminTriageView
            viewMode="all"
            onOpenAssignModal={(id) => setSelectedAssignComplaintId(id)}
            onOpenComplaint={(id) => setSelectedDetailComplaintId(id)}
          />
        )}

        {currentTab === 'admin_contractors' && <ContractorManagementView />}

        {currentTab === 'contractor_jobs' && (
          <ContractorView onOpenComplaint={(id) => setSelectedDetailComplaintId(id)} />
        )}
      </main>

      {/* Modals */}
      <RaiseComplaintModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        onComplaintRaised={(newId) => {
          setSelectedDetailComplaintId(newId);
        }}
      />

      <AssignContractorModal
        complaint={complaintToAssign}
        isOpen={Boolean(selectedAssignComplaintId)}
        onClose={() => setSelectedAssignComplaintId(null)}
        onAssigned={() => setSelectedAssignComplaintId(null)}
      />

      <ComplaintDetailModal
        complaintId={selectedDetailComplaintId}
        isOpen={Boolean(selectedDetailComplaintId)}
        onClose={() => setSelectedDetailComplaintId(null)}
        onOpenAssignModal={(id) => setSelectedAssignComplaintId(id)}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>
            Hostel Complaint Management System · Hall of Residence IV Maintenance Division
          </p>
          <div className="flex items-center gap-4">
            <span>IIT / University Campus Facilities</span>
            <span>·</span>
            <span>Estate & Works Unit</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
