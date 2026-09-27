import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint, Contractor, Priority } from '../types';
import { getSpecializationLabel } from '../utils/formatters';
import { X, Check, HardHat, Phone, AlertCircle, Star } from 'lucide-react';

interface AssignContractorModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

export const AssignContractorModal: React.FC<AssignContractorModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onAssigned,
}) => {
  const { contractors, categories, assignContractor, getContractorLoad } = useApp();

  const [selectedContractorId, setSelectedContractorId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>(complaint?.priority || 'medium');
  const [triageNote, setTriageNote] = useState<string>('');
  const [filterBySpecialization, setFilterBySpecialization] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !complaint) return null;

  // Determine category and default specialization
  const category = categories.find((c) => c.id === complaint.category_id);
  const targetSpec = category?.default_contractor_specialization;

  const availableContractors = contractors.filter((c) => {
    if (!c.is_active) return false;
    if (filterBySpecialization && targetSpec) {
      return c.specialization === targetSpec;
    }
    return true;
  });

  const handleAssign = () => {
    if (!selectedContractorId) {
      setError('Please select a contractor to assign this job.');
      return;
    }

    assignContractor(
      complaint.id,
      selectedContractorId,
      priority,
      triageNote.trim() || undefined
    );

    setSelectedContractorId('');
    setTriageNote('');
    setError(null);
    onClose();

    if (onAssigned) {
      onAssigned();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Assign Contractor to Job
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review current contractor loads and dispatch work order.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Complaint Snapshot */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-semibold text-slate-900">
              {complaint.block} · Room {complaint.room_number}
            </span>
            <span className="capitalize">{complaint.category_name}</span>
          </div>
          <p className="font-medium text-slate-900 line-clamp-1">{complaint.title}</p>
          <p className="text-slate-500 line-clamp-2 mt-0.5">{complaint.description}</p>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {/* Filter & Contractor list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Select Qualified Contractor *
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterBySpecialization}
                  onChange={(e) => setFilterBySpecialization(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0"
                />
                <span>Match {category?.name} specialization only</span>
              </label>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2">
              {availableContractors.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No active contractors match this specialization. Uncheck filter to view all contractors.
                </div>
              ) : (
                availableContractors.map((c) => {
                  const activeLoad = getContractorLoad(c.id);
                  const isSelected = selectedContractorId === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedContractorId(c.id);
                        setError(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                          <HardHat className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {c.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              ({getSpecializationLabel(c.specialization)})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{c.phone}</span>
                            </span>
                            {c.rating && (
                              <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{c.rating}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded ${
                              activeLoad >= 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {activeLoad} {activeLoad === 1 ? 'active job' : 'active jobs'}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Priority override */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 text-xs font-medium rounded capitalize border text-center transition-colors ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                        : p === 'medium'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                        : 'bg-slate-100 border-slate-300 text-slate-800 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Triage Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assignment Note / Instructions (Optional)
            </label>
            <input
              type="text"
              value={triageNote}
              onChange={(e) => setTriageNote(e.target.value)}
              placeholder="e.g. Student available after 3:30 PM. Inspect with voltage detector."
              className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
