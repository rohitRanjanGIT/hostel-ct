import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  ShieldAlert,
  User as UserIcon,
  HardHat,
  GraduationCap,
  RotateCcw,
  Plus,
  ChevronDown,
  Building2,
  Check,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenRaiseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenRaiseModal,
}) => {
  const { currentUser, users, switchUser, switchRole, resetToDemoData } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const students = users.filter((u) => u.role === 'student');
  const admins = users.filter((u) => u.role === 'admin');
  const contractors = users.filter((u) => u.role === 'contractor');

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-600" />;
      case 'admin':
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />;
      case 'contractor':
        return <HardHat className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              HC
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Hostel Complaint Tracker
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Hall of Residence IV · IIT / Campus Estate
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview Dashboard
            </button>

            {currentUser.role === 'student' && (
              <button
                onClick={() => setCurrentTab('student_complaints')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'student_complaints'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Complaints
              </button>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('admin_triage')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    currentTab === 'admin_triage'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Triage Queue
                </button>
                <button
                  onClick={() => setCurrentTab('admin_all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    currentTab === 'admin_all'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  All Complaints
                </button>
                <button
                  onClick={() => setCurrentTab('admin_contractors')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    currentTab === 'admin_contractors'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Contractors Roster
                </button>
              </>
            )}

            {currentUser.role === 'contractor' && (
              <button
                onClick={() => setCurrentTab('contractor_jobs')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'contractor_jobs'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Assigned Jobs (Kanban)
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions & User Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Quick action: Raise Complaint */}
            {currentUser.role === 'student' && (
              <button
                onClick={onOpenRaiseModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Raise Complaint</span>
              </button>
            )}

            {/* Role & User Selector Popover */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left"
                aria-label="Switch User or Role"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-slate-500 capitalize flex items-center gap-1">
                    {getRoleIcon(currentUser.role)}
                    <span>{currentUser.role}</span>
                    {currentUser.room_number && (
                      <span className="text-slate-400">· Rm {currentUser.room_number}</span>
                    )}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Switch Role & Persona
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Test the complete workflow across all 3 roles.
                    </p>
                  </div>

                  {/* Fast role tabs */}
                  <div className="p-2 border-b border-slate-100 flex items-center gap-1 bg-slate-50/70">
                    <button
                      onClick={() => switchRole('student')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 text-xs rounded font-medium transition-colors ${
                        currentUser.role === 'student'
                          ? 'bg-white shadow-xs text-blue-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <GraduationCap className="w-3 h-3" />
                      Student
                    </button>
                    <button
                      onClick={() => switchRole('admin')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 text-xs rounded font-medium transition-colors ${
                        currentUser.role === 'admin'
                          ? 'bg-white shadow-xs text-purple-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3" />
                      Admin
                    </button>
                    <button
                      onClick={() => switchRole('contractor')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 text-xs rounded font-medium transition-colors ${
                        currentUser.role === 'contractor'
                          ? 'bg-white shadow-xs text-amber-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <HardHat className="w-3 h-3" />
                      Contractor
                    </button>
                  </div>

                  {/* Seeded Accounts List */}
                  <div className="max-h-64 overflow-y-auto py-1">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">
                      Students ({students.length})
                    </div>
                    {students.slice(0, 4).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{user.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {user.block} · Rm {user.room_number}
                          </span>
                        </div>
                        {currentUser.id === user.id && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    ))}

                    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 border-t border-slate-100 mt-1">
                      Admins ({admins.length})
                    </div>
                    {admins.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{user.name}</span>
                          <span className="text-[11px] text-slate-500">{user.email}</span>
                        </div>
                        {currentUser.id === user.id && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    ))}

                    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 border-t border-slate-100 mt-1">
                      Contractors ({contractors.length})
                    </div>
                    {contractors.slice(0, 4).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{user.name}</span>
                          <span className="text-[11px] text-slate-500 capitalize">
                            Contractor · {user.email.split('@')[0].split('.')[1] || 'General'}
                          </span>
                        </div>
                        {currentUser.id === user.id && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Reset Seed Data */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={() => {
                        setResetConfirmOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Data to Initial</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reset icon button for instant reset */}
            <button
              onClick={() => setResetConfirmOpen(true)}
              title="Reset Demo Data"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-1 py-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          {currentUser.role === 'student' && (
            <button
              onClick={() => setCurrentTab('student_complaints')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                currentTab === 'student_complaints'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              My Complaints
            </button>
          )}
          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => setCurrentTab('admin_triage')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                  currentTab === 'admin_triage'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600'
                }`}
              >
                Triage Queue
              </button>
              <button
                onClick={() => setCurrentTab('admin_all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                  currentTab === 'admin_all'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600'
                }`}
              >
                All Complaints
              </button>
              <button
                onClick={() => setCurrentTab('admin_contractors')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                  currentTab === 'admin_contractors'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600'
                }`}
              >
                Contractors
              </button>
            </>
          )}
          {currentUser.role === 'contractor' && (
            <button
              onClick={() => setCurrentTab('contractor_jobs')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                currentTab === 'contractor_jobs'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              Assigned Jobs
            </button>
          )}
          {currentUser.role === 'student' && (
            <button
              onClick={onOpenRaiseModal}
              className="ml-auto px-2.5 py-1 text-xs font-medium bg-slate-900 text-white rounded-md whitespace-nowrap flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Resetting Demo Data */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Reset Demo Seed Data?
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              This restores all sample complaints, contractors, and logs back to their initial state.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDemoData();
                  setResetConfirmOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
