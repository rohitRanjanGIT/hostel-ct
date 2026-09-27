import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint, ComplaintStatus, Priority } from '../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { formatRelativeTime, formatDate } from '../utils/formatters';
import {
  Inbox,
  UserCheck,
  Filter,
  Search,
  AlertTriangle,
  ArrowRight,
  Eye,
  XCircle,
  HardHat,
  CheckCircle2,
} from 'lucide-react';

interface AdminTriageViewProps {
  viewMode: 'triage' | 'all';
  onOpenAssignModal: (complaintId: string) => void;
  onOpenComplaint: (id: string) => void;
}

export const AdminTriageView: React.FC<AdminTriageViewProps> = ({
  viewMode,
  onOpenAssignModal,
  onOpenComplaint,
}) => {
  const { complaints, categories, contractors, cancelComplaint } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>(viewMode === 'triage' ? 'raised' : 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [contractorFilter, setContractorFilter] = useState<string>('all');
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // Triage queue specifically looks at 'raised' complaints
  const raisedComplaints = useMemo(() => {
    return complaints
      .filter((c) => c.status === 'raised')
      .sort((a, b) => {
        // High priority first, then latest
        const priorityOrder: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [complaints]);

  // All complaints with filters
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (viewMode === 'triage') {
        if (c.status !== 'raised') return false;
      } else {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      }
      if (categoryFilter !== 'all' && c.category_id !== categoryFilter) return false;
      if (contractorFilter !== 'all' && c.assigned_contractor_id !== contractorFilter) return false;
      if (blockFilter !== 'all' && c.block !== blockFilter) return false;
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        const matchesRoom = c.room_number.toLowerCase().includes(q);
        const matchesStudent = c.student_name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesRoom && !matchesStudent) return false;
      }
      return true;
    });
  }, [
    complaints,
    viewMode,
    statusFilter,
    categoryFilter,
    contractorFilter,
    blockFilter,
    priorityFilter,
    searchQuery,
  ]);

  const handleConfirmCancel = () => {
    if (!cancelModalId || !cancelReason.trim()) return;
    cancelComplaint(cancelModalId, cancelReason.trim());
    setCancelModalId(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {viewMode === 'triage' ? 'Incoming Triage Queue' : 'All Maintenance Complaints'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewMode === 'triage'
              ? `${raisedComplaints.length} unassigned tickets awaiting contractor dispatch.`
              : `Complete administrative ledger of all ${complaints.length} hostel complaints.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredComplaints.length}</span> records
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, student, room..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'all' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="raised">Raised (Unassigned)</option>
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="visited">Visited</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Resolved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Blocks</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
              <option value="Block D">Block D</option>
            </select>

            {viewMode === 'all' && (
              <select
                value={contractorFilter}
                onChange={(e) => setContractorFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Contractors</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specialization})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* View Mode: Triage Cards Queue */}
        {viewMode === 'triage' ? (
          <div className="space-y-3 pt-2">
            {filteredComplaints.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-900">
                  Triage Queue is Clean!
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  All incoming maintenance complaints have been assigned to contractors.
                </p>
              </div>
            ) : (
              filteredComplaints.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-900">
                        {item.block} · Room {item.room_number}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Student: {item.student_name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category_name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatRelativeTime(item.created_at)}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenComplaint(item.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        setCancelModalId(item.id);
                        setCancelReason('');
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors"
                    >
                      Reject / Cancel
                    </button>
                    <button
                      onClick={() => onOpenAssignModal(item.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assign Contractor</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* View Mode: High Density Table of All Complaints */
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Ticket / Room</th>
                  <th className="py-2.5 px-3">Title & Category</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Contractor</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      No complaints match the filter parameters.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => onOpenComplaint(c.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {c.block} · Rm {c.room_number}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          #{c.id.replace('cmp_', '')}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={c.priority} />
                          <span className="font-medium text-slate-900 truncate max-w-xs">
                            {c.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {c.category_name} · Raised {formatRelativeTime(c.created_at)}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{c.student_name}</div>
                        <div className="text-[11px] text-slate-500">{c.student_phone || '—'}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {c.assigned_contractor_name ? (
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <HardHat className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.assigned_contractor_name}</span>
                          </div>
                        ) : (
                          <span className="text-amber-700 text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onOpenAssignModal(c.id)}
                            className="px-2 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200"
                            title="Assign or reassign"
                          >
                            {c.assigned_contractor_id ? 'Reassign' : 'Assign'}
                          </button>
                          <button
                            onClick={() => onOpenComplaint(c.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject / Cancel Confirmation Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Cancel / Reject Complaint?
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Provide an administrative reason (e.g. duplicate, invalid report, student resolved).
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full text-xs p-2 border border-slate-200 rounded mt-3 focus:outline-hidden focus:border-slate-400"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setCancelModalId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Back
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded disabled:opacity-50"
              >
                Cancel Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
