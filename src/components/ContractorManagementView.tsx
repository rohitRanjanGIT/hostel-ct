import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Contractor, Specialization } from '../types';
import { getSpecializationLabel } from '../utils/formatters';
import {
  HardHat,
  Plus,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const ContractorManagementView: React.FC = () => {
  const { contractors, toggleContractorActive, addContractor, getContractorLoad } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState<Specialization>('electrical');
  const [error, setError] = useState<string | null>(null);

  const handleAddContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill all required contractor details.');
      return;
    }

    addContractor({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      specialization,
    });

    setName('');
    setEmail('');
    setPhone('');
    setError(null);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Contractor & Vendor Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage trade contractors, verify on-duty availability, and monitor real-time job loads.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Contractor</span>
        </button>
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contractors.map((c) => {
          const activeLoad = getContractorLoad(c.id);

          return (
            <div
              key={c.id}
              className={`p-4 rounded-xl border bg-white shadow-xs transition-colors flex flex-col justify-between ${
                c.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                      <HardHat className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500">
                        {getSpecializationLabel(c.specialization)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                      c.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <span>{c.is_active ? 'Active' : 'Off-duty'}</span>
                  </span>
                </div>

                <div className="space-y-1.5 py-2 text-xs text-slate-600 border-y border-slate-100 my-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 text-center text-xs">
                  <div className="bg-slate-50 rounded p-1.5">
                    <span className="block font-bold text-slate-900 tabular-nums">
                      {activeLoad}
                    </span>
                    <span className="text-[10px] text-slate-500">Active Jobs</span>
                  </div>
                  <div className="bg-slate-50 rounded p-1.5">
                    <span className="block font-bold text-slate-900 tabular-nums">
                      {c.completed_jobs_count ?? 20}
                    </span>
                    <span className="text-[10px] text-slate-500">Resolved</span>
                  </div>
                  <div className="bg-slate-50 rounded p-1.5">
                    <span className="block font-bold text-amber-700 tabular-nums">
                      {c.rating ?? 4.8} ★
                    </span>
                    <span className="text-[10px] text-slate-500">Rating</span>
                  </div>
                </div>
              </div>

              {/* Status Toggle Action */}
              <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">Availability:</span>
                <button
                  onClick={() => toggleContractorActive(c.id)}
                  className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
                    c.is_active
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {c.is_active ? 'Set Off-duty' : 'Set Active'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Contractor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Enroll New Contractor
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddContractor} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Kulkarni"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialization *
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value as Specialization)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-hidden focus:border-slate-400"
                >
                  <option value="electrical">Electrician</option>
                  <option value="plumbing">Plumber</option>
                  <option value="carpentry">Carpenter</option>
                  <option value="cleaning">Cleaning & Sanitation</option>
                  <option value="general">General Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hostelcontractors.in"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
                >
                  Save Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
