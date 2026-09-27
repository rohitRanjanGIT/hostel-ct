import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight,
  Filter,
  Layers,
  Wrench,
  Search,
  Eye,
} from 'lucide-react';

interface SharedDashboardProps {
  onOpenComplaint: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const SharedDashboard: React.FC<SharedDashboardProps> = ({
  onOpenComplaint,
  onNavigateToTab,
}) => {
  const { currentUser, complaints, statusLogs, categories, contractors } = useApp();

  // Filters for dashboard
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Determine scoped dataset based on active role
  const roleScopedComplaints = useMemo(() => {
    if (currentUser.role === 'student') {
      return complaints.filter((c) => c.student_id === currentUser.id);
    }
    if (currentUser.role === 'contractor') {
      // Find contractor profile linked to this user
      const contractor = contractors.find((cnt) => cnt.user_id === currentUser.id);
      if (contractor) {
        return complaints.filter((c) => c.assigned_contractor_id === contractor.id);
      }
      return [];
    }
    // Admin sees all complaints
    return complaints;
  }, [currentUser, complaints, contractors]);

  // Filtered dataset for charts and table
  const filteredComplaints = useMemo(() => {
    return roleScopedComplaints.filter((c) => {
      if (selectedCategory !== 'all' && c.category_id !== selectedCategory) return false;
      if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
      if (selectedPriority !== 'all' && c.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesRoom = c.room_number.toLowerCase().includes(query);
        const matchesBlock = c.block.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesRoom && !matchesBlock && !matchesDesc) return false;
      }
      return true;
    });
  }, [roleScopedComplaints, selectedCategory, selectedStatus, selectedPriority, searchQuery]);

  // Key KPI stats
  const totalCount = roleScopedComplaints.length;
  const raisedCount = roleScopedComplaints.filter((c) => c.status === 'raised').length;
  const inProgressCount = roleScopedComplaints.filter((c) =>
    ['assigned', 'accepted', 'visited', 'in_progress'].includes(c.status)
  ).length;
  const doneCount = roleScopedComplaints.filter((c) => c.status === 'done').length;
  const highPriorityCount = roleScopedComplaints.filter(
    (c) => c.priority === 'high' && c.status !== 'done' && c.status !== 'cancelled'
  ).length;

  // Status breakdown calculations
  const statusCounts: Record<ComplaintStatus, number> = {
    raised: 0,
    assigned: 0,
    accepted: 0,
    visited: 0,
    in_progress: 0,
    done: 0,
    rejected: 0,
    cancelled: 0,
  };

  roleScopedComplaints.forEach((c) => {
    if (statusCounts[c.status] !== undefined) {
      statusCounts[c.status]++;
    }
  });

  // Recent activity logs scoped to role
  const recentLogs = useMemo(() => {
    const complaintIds = new Set(roleScopedComplaints.map((c) => c.id));
    return statusLogs
      .filter((l) => complaintIds.has(l.complaint_id))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [roleScopedComplaints, statusLogs]);

  // Urgent attention list
  const urgentComplaints = useMemo(() => {
    return roleScopedComplaints
      .filter((c) => c.priority === 'high' && c.status !== 'done' && c.status !== 'cancelled')
      .slice(0, 4);
  }, [roleScopedComplaints]);

  return (
    <div className="space-y-6">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {currentUser.role === 'admin'
              ? 'Hostel Maintenance Command Center'
              : currentUser.role === 'student'
              ? `Student Portal · Room ${currentUser.room_number || '204'}`
              : `Contractor Job Console · ${currentUser.name}`}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.role === 'admin'
              ? 'Real-time overview of maintenance complaints across all blocks and contractor teams.'
              : currentUser.role === 'student'
              ? 'Track resolution progress of your room maintenance requests.'
              : 'Assigned repair work orders, site visits, and completion tracking.'}
          </p>
        </div>

        {/* Quick Jump Action */}
        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' && (
            <button
              onClick={() => onNavigateToTab('admin_triage')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              <span>Review Triage Queue ({raisedCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {currentUser.role === 'contractor' && (
            <button
              onClick={() => onNavigateToTab('contractor_jobs')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              <span>View Kanban Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards Grid (Single-Elevation, Hairline borders, Tabular nums) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total complaints */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Complaints</span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-500">all time</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {currentUser.role === 'admin' ? 'Across 3 hostel blocks' : 'Logged under this account'}
          </div>
        </div>

        {/* Card 2: Open / Raised */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Awaiting Triage</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {raisedCount}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Needs assignment</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {raisedCount === 0 ? 'No unassigned tickets' : 'Pending admin triage'}
          </div>
        </div>

        {/* Card 3: In Progress / Active */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active In Work</span>
            <Wrench className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {inProgressCount}
            </span>
            <span className="text-[11px] text-sky-700 font-medium">Contractor assigned</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Visited, accepted or in progress
          </div>
        </div>

        {/* Card 4: Resolved */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Resolved & Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {doneCount}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              {totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}% success
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Fixed and verified
          </div>
        </div>
      </div>

      {/* Main Grid: Status Distribution Bar + Urgent Attention / Category split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Visual Status Distribution + Live Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Breakdown Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Complaint Lifecycle Distribution
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                {totalCount} total tickets
              </span>
            </div>

            {/* Proportion Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
              {totalCount > 0 ? (
                <>
                  <div
                    style={{ width: `${(statusCounts.raised / totalCount) * 100}%` }}
                    className="bg-amber-400 transition-all"
                    title={`Raised: ${statusCounts.raised}`}
                  />
                  <div
                    style={{ width: `${(statusCounts.assigned / totalCount) * 100}%` }}
                    className="bg-blue-400 transition-all"
                    title={`Assigned: ${statusCounts.assigned}`}
                  />
                  <div
                    style={{
                      width: `${
                        ((statusCounts.accepted + statusCounts.visited + statusCounts.in_progress) /
                          totalCount) *
                        100
                      }%`,
                    }}
                    className="bg-sky-500 transition-all"
                    title={`In Action: ${
                      statusCounts.accepted + statusCounts.visited + statusCounts.in_progress
                    }`}
                  />
                  <div
                    style={{ width: `${(statusCounts.done / totalCount) * 100}%` }}
                    className="bg-emerald-500 transition-all"
                    title={`Resolved: ${statusCounts.done}`}
                  />
                  <div
                    style={{
                      width: `${
                        ((statusCounts.rejected + statusCounts.cancelled) / totalCount) * 100
                      }%`,
                    }}
                    className="bg-rose-400 transition-all"
                    title={`Cancelled/Rejected: ${statusCounts.rejected + statusCounts.cancelled}`}
                  />
                </>
              ) : (
                <div className="w-full bg-slate-200" />
              )}
            </div>

            {/* Segment Key Legend (Clean unboxed text) */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-slate-600">Raised / New</span>
                <span className="font-semibold text-slate-900 tabular-nums ml-auto">
                  {statusCounts.raised}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                <span className="text-slate-600">Assigned</span>
                <span className="font-semibold text-slate-900 tabular-nums ml-auto">
                  {statusCounts.assigned}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-slate-600">In Progress</span>
                <span className="font-semibold text-slate-900 tabular-nums ml-auto">
                  {statusCounts.accepted + statusCounts.visited + statusCounts.in_progress}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-600">Resolved</span>
                <span className="font-semibold text-slate-900 tabular-nums ml-auto">
                  {statusCounts.done}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Complaints Table with Filters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Filters Header */}
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Complaints Register
                  </h3>
                  <span className="text-xs text-slate-500 tabular-nums">
                    ({filteredComplaints.length})
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, room, desc..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              {/* Filter controls row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Category filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 text-xs focus:outline-hidden"
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

                {/* Priority filter */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {(selectedCategory !== 'all' ||
                  selectedStatus !== 'all' ||
                  selectedPriority !== 'all' ||
                  searchQuery.trim()) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                      setSelectedPriority('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 font-medium"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* High Density Complaints List */}
            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {filteredComplaints.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No complaints match the selected filter criteria.
                </div>
              ) : (
                filteredComplaints.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenComplaint(item.id)}
                    className="p-3.5 sm:px-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-900">
                          {item.block} · Rm {item.room_number}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category_name}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatRelativeTime(item.created_at)}</span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xl">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <StatusBadge status={item.status} />
                        {item.assigned_contractor_name && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.assigned_contractor_name}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenComplaint(item.id);
                        }}
                        className="p-1 text-slate-400 group-hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Urgent Items & Recent Activity Log */}
        <div className="space-y-6">
          {/* Urgent Attention Needed */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-semibold text-slate-900">High Priority Attention</h3>
              </div>
              <span className="text-xs font-semibold text-rose-700 tabular-nums">
                {highPriorityCount} open
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {urgentComplaints.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No high priority complaints pending. All normal.
                </div>
              ) : (
                urgentComplaints.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenComplaint(item.id)}
                    className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-rose-900">
                        {item.block} · Rm {item.room_number}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs font-medium text-slate-900 mt-1 truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{item.category_name}</span>
                      <span>{formatRelativeTime(item.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-time Activity Feed (ComplaintStatusLog) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-900">Recent Status Changes</h3>
              </div>
              <span className="text-[11px] text-slate-400">Audit Trail</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {recentLogs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No status activity recorded yet.
                </div>
              ) : (
                recentLogs.map((log) => {
                  const complaint = complaints.find((c) => c.id === log.complaint_id);
                  return (
                    <div
                      key={log.id}
                      onClick={() => onOpenComplaint(log.complaint_id)}
                      className="py-2.5 first:pt-0 last:pb-0 hover:bg-slate-50/60 rounded px-1 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs">
                          <span className="font-semibold text-slate-900">
                            {log.changed_by_user_name}
                          </span>{' '}
                          <span className="text-slate-500">
                            marked{' '}
                            <span className="font-medium text-slate-700">
                              {complaint ? `Room ${complaint.room_number}` : 'ticket'}
                            </span>{' '}
                            as
                          </span>{' '}
                          <StatusBadge status={log.new_status} showDot={false} />
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>

                      {log.note && (
                        <p className="text-[11px] text-slate-600 italic mt-0.5 line-clamp-1">
                          "{log.note}"
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
