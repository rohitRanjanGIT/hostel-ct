import React from 'react';
import { ComplaintStatus, Priority } from '../types';
import { getStatusLabel, getStatusStyle, getPriorityStyle } from '../utils/formatters';

interface StatusBadgeProps {
  status: ComplaintStatus;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
  const style = getStatusStyle(status);
  const label = getStatusLabel(status);

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.textColor} whitespace-nowrap`}>
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${style.dotColor} shrink-0`}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const style = getPriorityStyle(priority);
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium tracking-wide uppercase rounded border ${style.bgColor} ${style.borderColor} ${style.textColor} whitespace-nowrap`}
    >
      {priority}
    </span>
  );
};
