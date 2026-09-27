import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { formatDate, formatRelativeTime, getStatusLabel } from '../utils/formatters';
import {
  X,
  Clock,
  User,
  HardHat,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  MessageSquare,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaintId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssignModal: (complaintId: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  isOpen,
  onClose,
  onOpenAssignModal,
}) => {
  const {
    complaints,
    contractors,
    currentUser,
    getLogsForComplaint,
    contractorRespond,
    contractorUpdateStatus,
    cancelComplaint,
  } = useApp();

  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showCancelInput, setShowCancelInput] = useState<boolean>(false);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [showResolutionInput, setShowResolutionInput] = useState<boolean>(false);

  if (!isOpen || !complaintId) return null;

  const complaint = complaints.find((c) => c.id === complaintId);
  if (!complaint) return null;

  const logs = getLogsForComplaint(complaintId);
  const assignedContractor = contractors.find((c) => c.id === complaint.assigned_contractor_id);
  const isAssignedToCurrentUser =
    currentUser.role === 'contractor' && assignedContractor?.user_id === currentUser.id;

  const handleContractorAccept = () => {
    contractorRespond(complaint.id, 'accept', 'Job accepted by contractor');
  };

  const handleContractorReject = () => {
    if (!rejectReason.trim()) return;
    contractorRespond(complaint.id, 'reject', rejectReason.trim());
    setShowRejectInput(false);
    setRejectReason('');
  };

  const handleMarkVisited = () => {
    contractorUpdateStatus(complaint.id, 'visited', 'Contractor visited room and inspected site');
  };

  const handleStartWork = () => {
    contractorUpdateStatus(complaint.id, 'in_progress', 'Repair / maintenance work commenced');
  };

  const handleMarkDone = () => {
    contractorUpdateStatus(
      complaint.id,
      'done',
      resolutionNote.trim() || 'Work completed and tested'
    );
    setShowResolutionInput(false);
    setResolutionNote('');
  };

  const handleCancelComplaint = () => {
    if (!cancelReason.trim()) return;
    cancelComplaint(complaint.id, cancelReason.trim());
    setShowCancelInput(false);
    setCancelReason('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">
                Ticket #{complaint.id.replace('cmp_', '')}
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="text-xs font-medium text-slate-700">
                {complaint.category_name}
              </span>
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {complaint.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Banner */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Current Status:</span>
            <StatusBadge status={complaint.status} />
          </div>

          <div className="text-slate-500 text-[11px]">
            Raised {formatDate(complaint.created_at)}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Details (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {/* Photo preview if present */}
            {complaint.photo_url && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Attached Issue Photo
                </h3>
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center">
                  <img
                    src={complaint.photo_url}
                    alt="Maintenance issue"
                    referrerPolicy="no-referrer"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Full Audit Trail Timeline */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Lifecycle History & Audit Trail ({logs.length})</span>
              </h3>

              <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-3 max-h-52 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-500">No logs available.</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={log.id} className="relative pl-5 text-xs text-slate-700">
                      {/* Timeline dot & line */}
                      <span
                        className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-400 ring-2 ring-white"
                        aria-hidden="true"
                      />
                      {index !== logs.length - 1 && (
                        <span
                          className="absolute left-0.75 top-3.5 w-0.5 h-full bg-slate-200"
                          aria-hidden="true"
                        />
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                        <span className="font-semibold text-slate-800">
                          {log.changed_by_user_name} ({log.changed_by_role})
                        </span>
                        <span className="tabular-nums">{formatRelativeTime(log.timestamp)}</span>
                      </div>

                      <div className="font-medium text-slate-900">
                        Status changed to{' '}
                        <span className="font-semibold">{getStatusLabel(log.new_status)}</span>
                      </div>

                      {log.note && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{log.note}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Contextual Meta & Action Controls */}
          <div className="space-y-4">
            {/* Student & Room Info */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <h4 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Student Details</span>
              </h4>
              <div className="space-y-1 text-xs">
                <div className="text-slate-800 font-medium">{complaint.student_name}</div>
                <div className="text-slate-500">
                  {complaint.block} · Room {complaint.room_number}
                </div>
                {complaint.student_phone && (
                  <div className="text-slate-500 flex items-center gap-1 pt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{complaint.student_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contractor Info */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <h4 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Contractor</span>
              </h4>
              {assignedContractor ? (
                <div className="space-y-1 text-xs">
                  <div className="text-slate-800 font-medium">{assignedContractor.name}</div>
                  <div className="text-slate-500 capitalize">
                    {assignedContractor.specialization}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1 pt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{assignedContractor.phone}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  Unassigned · Awaiting admin dispatch
                </div>
              )}
            </div>

            {/* Contextual Action Buttons depending on role */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="text-xs font-semibold text-slate-900">Workflow Actions</h4>

              {/* Admin Actions */}
              {currentUser.role === 'admin' && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAssignModal(complaint.id);
                    }}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    {complaint.assigned_contractor_id ? 'Reassign Contractor' : 'Assign Contractor'}
                  </button>

                  {complaint.status !== 'cancelled' && complaint.status !== 'done' && (
                    <>
                      {showCancelInput ? (
                        <div className="space-y-1.5 pt-1">
                          <input
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Reason for cancelling..."
                            className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={handleCancelComplaint}
                              className="flex-1 py-1 text-xs font-medium bg-rose-600 text-white rounded hover:bg-rose-700"
                            >
                              Confirm Cancel
                            </button>
                            <button
                              onClick={() => setShowCancelInput(false)}
                              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowCancelInput(true)}
                          className="w-full py-1.5 px-3 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                        >
                          Cancel Complaint
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Contractor Actions */}
              {currentUser.role === 'contractor' && (
                <div className="space-y-2">
                  {complaint.status === 'assigned' && (
                    <>
                      <button
                        onClick={handleContractorAccept}
                        className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Job</span>
                      </button>

                      {showRejectInput ? (
                        <div className="space-y-1.5 pt-1">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for declining..."
                            className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={handleContractorReject}
                              className="flex-1 py-1 text-xs font-medium bg-rose-600 text-white rounded hover:bg-rose-700"
                            >
                              Decline & Return
                            </button>
                            <button
                              onClick={() => setShowRejectInput(false)}
                              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowRejectInput(true)}
                          className="w-full py-1.5 px-3 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                        >
                          Decline Assignment
                        </button>
                      )}
                    </>
                  )}

                  {complaint.status === 'accepted' && (
                    <button
                      onClick={handleMarkVisited}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                    >
                      Mark Visited (On Site)
                    </button>
                  )}

                  {complaint.status === 'visited' && (
                    <button
                      onClick={handleStartWork}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
                    >
                      Start Work (In Progress)
                    </button>
                  )}

                  {complaint.status === 'in_progress' && (
                    <>
                      {showResolutionInput ? (
                        <div className="space-y-1.5 pt-1">
                          <input
                            type="text"
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="Resolution notes (e.g. replaced tap)..."
                            className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={handleMarkDone}
                              className="flex-1 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                              Confirm Done
                            </button>
                            <button
                              onClick={() => setShowResolutionInput(false)}
                              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowResolutionInput(true)}
                          className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Done (Resolved)</span>
                        </button>
                      )}
                    </>
                  )}

                  {complaint.status === 'done' && (
                    <div className="text-center p-2 text-xs text-emerald-800 bg-emerald-50 rounded border border-emerald-200">
                      Work completed & logged
                    </div>
                  )}
                </div>
              )}

              {/* Student View Note */}
              {currentUser.role === 'student' && (
                <div className="text-xs text-slate-600 leading-normal">
                  {complaint.status === 'done'
                    ? 'This complaint has been marked resolved. If you still encounter issues, you may raise a fresh request.'
                    : 'Your maintenance request is active. You will receive updates as the contractor progresses.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
