import { ComplaintStatus, Priority, Specialization } from '../types';

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getStatusLabel(status: ComplaintStatus): string {
  switch (status) {
    case 'raised':
      return 'Raised (Unassigned)';
    case 'assigned':
      return 'Assigned';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'visited':
      return 'Visited';
    case 'in_progress':
      return 'In Progress';
    case 'done':
      return 'Resolved';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function getStatusStyle(status: ComplaintStatus): {
  dotColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
} {
  switch (status) {
    case 'raised':
      return {
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-800',
        bgColor: 'bg-amber-50/70',
        borderColor: 'border-amber-200',
      };
    case 'assigned':
      return {
        dotColor: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgColor: 'bg-blue-50/70',
        borderColor: 'border-blue-200',
      };
    case 'accepted':
      return {
        dotColor: 'bg-indigo-500',
        textColor: 'text-indigo-800',
        bgColor: 'bg-indigo-50/70',
        borderColor: 'border-indigo-200',
      };
    case 'visited':
      return {
        dotColor: 'bg-purple-500',
        textColor: 'text-purple-800',
        bgColor: 'bg-purple-50/70',
        borderColor: 'border-purple-200',
      };
    case 'in_progress':
      return {
        dotColor: 'bg-sky-500',
        textColor: 'text-sky-800',
        bgColor: 'bg-sky-50/70',
        borderColor: 'border-sky-200',
      };
    case 'done':
      return {
        dotColor: 'bg-emerald-600',
        textColor: 'text-emerald-800',
        bgColor: 'bg-emerald-50/70',
        borderColor: 'border-emerald-200',
      };
    case 'rejected':
    case 'cancelled':
      return {
        dotColor: 'bg-rose-500',
        textColor: 'text-rose-800',
        bgColor: 'bg-rose-50/70',
        borderColor: 'border-rose-200',
      };
    default:
      return {
        dotColor: 'bg-slate-400',
        textColor: 'text-slate-700',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
      };
  }
}

export function getPriorityStyle(priority: Priority): {
  textColor: string;
  borderColor: string;
  bgColor: string;
} {
  switch (priority) {
    case 'high':
      return {
        textColor: 'text-rose-700',
        borderColor: 'border-rose-200',
        bgColor: 'bg-rose-50',
      };
    case 'medium':
      return {
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        bgColor: 'bg-amber-50',
      };
    case 'low':
      return {
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        bgColor: 'bg-slate-50',
      };
  }
}

export function getSpecializationLabel(spec: Specialization): string {
  switch (spec) {
    case 'electrical':
      return 'Electrician';
    case 'plumbing':
      return 'Plumber';
    case 'carpentry':
      return 'Carpenter';
    case 'cleaning':
      return 'Sanitation & Cleaning';
    case 'general':
      return 'General Maintenance';
  }
}
