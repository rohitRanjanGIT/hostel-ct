import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Priority } from '../types';
import { SAMPLE_COMPLAINT_PHOTOS } from '../data/seedData';
import { X, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';

interface RaiseComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintRaised?: (id: string) => void;
}

export const RaiseComplaintModal: React.FC<RaiseComplaintModalProps> = ({
  isOpen,
  onClose,
  onComplaintRaised,
}) => {
  const { currentUser, categories, raiseComplaint } = useApp();

  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_electrical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roomNumber, setRoomNumber] = useState(currentUser.room_number || '204');
  const [block, setBlock] = useState(currentUser.block || 'Block A');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a brief title describing the problem.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide detailed description of the maintenance issue.');
      return;
    }
    if (!roomNumber.trim()) {
      setError('Please provide your room number.');
      return;
    }

    const photoToUse = customPhotoUrl.trim() || selectedPhotoUrl || undefined;

    const newId = raiseComplaint({
      category_id: categoryId,
      title: title.trim(),
      description: description.trim(),
      photo_url: photoToUse,
      room_number: roomNumber.trim(),
      block,
      priority,
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setSelectedPhotoUrl('');
    setCustomPhotoUrl('');
    setError(null);
    onClose();

    if (onComplaintRaised) {
      onComplaintRaised(newId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Raise Maintenance Complaint
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your request directly to hostel administration and maintenance crews.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-400"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency Priority *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 px-2 text-xs font-medium rounded capitalize border text-center transition-colors ${
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
          </div>

          {/* Location details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hostel Block *
              </label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-400"
              >
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
                <option value="Block D">Block D</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 204"
                className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Summary Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bathroom washbasin faucet leaking continuously"
              className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain where the problem is located, when it started, and any symptoms (sparks, noises, leaks, water accumulation)..."
              className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          {/* Photo attachment (Preset sample photos or URL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Attach Issue Photo (Optional)</span>
              </label>
              {selectedPhotoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhotoUrl('');
                    setCustomPhotoUrl('');
                  }}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  Clear Photo
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mb-2">
              Select a matching sample photo or paste an image URL to help the contractor diagnose:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {SAMPLE_COMPLAINT_PHOTOS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setSelectedPhotoUrl(sample.url);
                    setCustomPhotoUrl('');
                  }}
                  className={`relative rounded-lg overflow-hidden border text-left transition-all ${
                    selectedPhotoUrl === sample.url
                      ? 'border-slate-900 ring-2 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-16 object-cover"
                  />
                  <div className="p-1 bg-white">
                    <p className="text-[10px] text-slate-700 truncate leading-tight">
                      {sample.label}
                    </p>
                  </div>
                  {selectedPhotoUrl === sample.url && (
                    <div className="absolute top-1 right-1 bg-slate-900 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <input
              type="url"
              value={customPhotoUrl}
              onChange={(e) => {
                setCustomPhotoUrl(e.target.value);
                setSelectedPhotoUrl('');
              }}
              placeholder="Or paste an image link (https://...)"
              className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
