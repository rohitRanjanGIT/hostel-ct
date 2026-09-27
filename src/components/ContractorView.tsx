import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import {
  Kanban,
  List,
  CheckCircle2,
  XCircle,
  Phone,
  Eye,
  ArrowRight,
  HardHat,
  Search,
  MessageSquare,
} from 'lucide-react';

interface ContractorViewProps {
  onOpenComplaint: (id: string) => void;
}

export const ContractorView: React.FC<ContractorViewProps> = ({ onOpenComplaint }) => {
  const {
    currentUser,
    contractors,
    complaints,
    contractorRespond,
    contractorUpdateStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [doneModalId, setDoneModalId] = useState<string | null>(null);
  const [doneNote, setDoneNote] = useState<string>('');

  // Find the contractor profile associated with this user
  const currentContractor = contractors.find((c) => c.user_id === currentUser.id);

  // Scoped complaints assigned to this contractor
  const myJobs = useMemo(() => {
    if (!currentContractor) return [];
    return complaints.filter((c) => c.assigned_contractor_id === currentContractor.id);
  }, [complaints, currentContractor]);

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return myJobs;
    const q = searchQuery.toLowerCase();
    return myJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.room_number.toLowerCase().includes(q)
    );
  }, [myJobs, searchQuery]);

  // Kanban column buckets
  const assignedJobs = filteredJobs.filter((j) => j.status === 'assigned');
  const acceptedJobs = filteredJobs.filter((j) => j.status === 'accepted');
  const visitedJobs = filteredJobs.filter((j) => j.status === 'visited');
  const inProgressJobs = filteredJobs.filter((j) => j.status === 'in_progress');
  const doneJobs = filteredJobs.filter((j) => j.status === 'done');

  const handleAccept = (complaintId: string) => {
    contractorRespond(complaintId, 'accept', 'Job accepted by contractor');
  };

  const handleConfirmReject = () => {
    if (!rejectModalId || !rejectReason.trim()) return;
    contractorRespond(rejectModalId, 'reject', rejectReason.trim());
    setRejectModalId(null);
    setRejectReason('');
  };

  const handleMarkVisited = (complaintId: string) => {
    contractorUpdateStatus(complaintId, 'visited', 'On site inspection complete');
  };

  const handleStartWork = (complaintId: string) => {
    contractorUpdateStatus(complaintId, 'in_progress', 'Started repair work');
  };

  const handleConfirmDone = () => {
    if (!doneModalId) return;
    contractorUpdateStatus(
      doneModalId,
      'done',
      doneNote.trim() || 'Work completed and tested'
    );
    setDoneModalId(null);
    setDoneNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">
              {currentContractor?.specialization || 'Maintenance Specialist'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.phone}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Assigned Work Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="font-semibold text-slate-800">
              {assignedJobs.length + acceptedJobs.length + visitedJobs.length + inProgressJobs.length} active jobs
            </span>{' '}
            in queue · {doneJobs.length} completed.
          </p>
        </div>

        {/* View Toggle & Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board Layout */}
      {activeTab === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {/* Column 1: Assigned */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col min-w-[240px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">1. Assigned (New)</span>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-semibold">
                {assignedJobs.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {assignedJobs.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-slate-400">
                  No pending assignments
                </div>
              ) : (
                assignedJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onOpenComplaint(job.id)}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {job.block} · Rm {job.room_number}
                      </span>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {job.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{job.description}</p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>{job.student_name}</span>
                      <span>{formatRelativeTime(job.created_at)}</span>
                    </div>

                    {/* Contractor Decision Actions */}
                    <div
                      className="flex gap-1.5 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleAccept(job.id)}
                        className="flex-1 py-1 px-2 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors text-center"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          setRejectModalId(job.id);
                          setRejectReason('');
                        }}
                        className="py-1 px-2 text-[11px] text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Accepted */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col min-w-[240px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">2. Accepted</span>
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[11px] font-semibold">
                {acceptedJobs.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {acceptedJobs.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-slate-400">
                  No accepted jobs
                </div>
              ) : (
                acceptedJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onOpenComplaint(job.id)}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {job.block} · Rm {job.room_number}
                      </span>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {job.title}
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{job.student_phone || job.student_name}</span>
                    </div>

                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMarkVisited(job.id)}
                        className="w-full py-1 text-[11px] font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-center"
                      >
                        Mark Visited
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Visited */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col min-w-[240px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">3. Visited (On Site)</span>
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[11px] font-semibold">
                {visitedJobs.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {visitedJobs.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-slate-400">
                  No visited jobs
                </div>
              ) : (
                visitedJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onOpenComplaint(job.id)}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {job.block} · Rm {job.room_number}
                      </span>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {job.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{job.description}</p>

                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleStartWork(job.id)}
                        className="w-full py-1 text-[11px] font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded transition-colors text-center"
                      >
                        Start Repair Work
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 4: In Progress */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col min-w-[240px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">4. In Progress</span>
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-[11px] font-semibold">
                {inProgressJobs.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {inProgressJobs.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-slate-400">
                  No jobs currently active
                </div>
              ) : (
                inProgressJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onOpenComplaint(job.id)}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {job.block} · Rm {job.room_number}
                      </span>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {job.title}
                    </p>

                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setDoneModalId(job.id);
                          setDoneNote('');
                        }}
                        className="w-full py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 5: Done */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col min-w-[240px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">5. Done / Completed</span>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-semibold">
                {doneJobs.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {doneJobs.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-slate-400">
                  No completed jobs yet
                </div>
              ) : (
                doneJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onOpenComplaint(job.id)}
                    className="p-3 bg-white/80 rounded-lg border border-slate-200 opacity-90 hover:opacity-100 transition-opacity cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {job.block} · Rm {job.room_number}
                      </span>
                      <span className="text-emerald-700 font-medium">Done</span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-1">
                      {job.title}
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Closed {formatRelativeTime(job.updated_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No jobs assigned to this contractor profile.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onOpenComplaint(job.id)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900">
                      {job.block} · Rm {job.room_number}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Student: {job.student_name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatRelativeTime(job.created_at)}</span>
                    <PriorityBadge priority={job.priority} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{job.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{job.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={job.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenComplaint(job.id);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Assignment Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Decline Job Assignment?
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Provide a reason. The ticket will immediately return to the Admin Triage Queue for reassignment.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Schedule full, missing spare parts, wrong specialization"
              className="w-full text-xs p-2 border border-slate-200 rounded mt-3 focus:outline-hidden focus:border-slate-400"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Back
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded disabled:opacity-50"
              >
                Decline & Return to Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Done Modal */}
      {doneModalId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Mark Job Resolved (Done)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Add a completion note explaining the fix (visible to student & admin):
            </p>
            <textarea
              rows={3}
              value={doneNote}
              onChange={(e) => setDoneNote(e.target.value)}
              placeholder="e.g. Replaced faulty circuit breaker with 16A unit. Verified socket earthing."
              className="w-full text-xs p-2 border border-slate-200 rounded mt-3 focus:outline-hidden focus:border-slate-400"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setDoneModalId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDone}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
