import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import {
  Plus,
  Search,
  Filter,
  Inbox,
  Clock,
  CheckCircle2,
  HardHat,
  ChevronRight,
  Phone,
  Layers,
} from 'lucide-react';

interface StudentViewProps {
  onOpenRaiseModal: () => void;
  onOpenComplaint: (id: string) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  onOpenRaiseModal,
  onOpenComplaint,
}) => {
  const { currentUser, complaints, categories } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const myComplaints = useMemo(() => {
    return complaints.filter((c) => c.student_id === currentUser.id);
  }, [complaints, currentUser.id]);

  const filtered = useMemo(() => {
    return myComplaints.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && c.category_id !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.description.toLowerCase().includes(q) &&
          !c.category_name.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [myComplaints, statusFilter, categoryFilter, searchQuery]);

  const activeCount = myComplaints.filter((c) =>
    ['raised', 'assigned', 'accepted', 'visited', 'in_progress'].includes(c.status)
  ).length;
  const doneCount = myComplaints.filter((c) => c.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.block}</span>
            <span aria-hidden="true">·</span>
            <span>Room {currentUser.room_number || '204'}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            My Maintenance Complaints
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You have <span className="font-semibold text-slate-800">{activeCount} active</span> and{' '}
            <span className="font-semibold text-emerald-700">{doneCount} resolved</span> complaints.
          </p>
        </div>

        <button
          onClick={onOpenRaiseModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Complaint</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your complaints by title or description..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Statuses ({myComplaints.length})</option>
              <option value="raised">Raised (Unassigned)</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>

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
          </div>
        </div>

        {/* Complaints List Cards */}
        <div className="divide-y divide-slate-100 pt-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">No complaints found</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {myComplaints.length === 0
                  ? 'You have not raised any complaints yet. Click "Raise New Complaint" above.'
                  : 'Try changing your search or filters.'}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              // Calculate progress step index (0=raised, 1=assigned, 2=visited/in_progress, 3=done)
              let step = 0;
              if (item.status === 'assigned' || item.status === 'accepted') step = 1;
              if (item.status === 'visited' || item.status === 'in_progress') step = 2;
              if (item.status === 'done') step = 3;

              return (
                <div
                  key={item.id}
                  onClick={() => onOpenComplaint(item.id)}
                  className="py-4 hover:bg-slate-50/80 -mx-4 px-4 transition-colors cursor-pointer group flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-900">
                          {item.category_name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{formatRelativeTime(item.created_at)}</span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-950">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1.5 shrink-0">
                      <StatusBadge status={item.status} />
                      <span className="text-[11px] text-slate-400">
                        Ticket #{item.id.replace('cmp_', '')}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Lifecycle Step Bar */}
                  {item.status !== 'cancelled' && (
                    <div className="pt-1">
                      <div className="grid grid-cols-4 gap-1 text-[11px]">
                        <div
                          className={`h-1.5 rounded-full ${
                            step >= 0 ? 'bg-amber-500' : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-1.5 rounded-full ${
                            step >= 1 ? 'bg-blue-500' : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-1.5 rounded-full ${
                            step >= 2 ? 'bg-sky-500' : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-1.5 rounded-full ${
                            step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span className={step >= 0 ? 'text-slate-700 font-medium' : ''}>
                          1. Raised
                        </span>
                        <span className={step >= 1 ? 'text-slate-700 font-medium' : ''}>
                          2. Assigned
                        </span>
                        <span className={step >= 2 ? 'text-slate-700 font-medium' : ''}>
                          3. In Work
                        </span>
                        <span className={step >= 3 ? 'text-emerald-700 font-medium' : ''}>
                          4. Resolved
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Assigned contractor footer note */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {item.assigned_contractor_name ? (
                        <>
                          <HardHat className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Assigned to{' '}
                            <span className="font-semibold text-slate-800">
                              {item.assigned_contractor_name}
                            </span>
                          </span>
                        </>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          Awaiting warden assignment
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-700 font-medium group-hover:text-slate-900">
                      <span>View Timeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
