export type Role = 'student' | 'admin' | 'contractor';

export type Specialization = 'electrical' | 'plumbing' | 'carpentry' | 'cleaning' | 'general';

export type ComplaintStatus =
  | 'raised'
  | 'assigned'
  | 'accepted'
  | 'rejected'
  | 'visited'
  | 'in_progress'
  | 'done'
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  room_number?: string;
  block?: string;
  phone: string;
  created_at: string;
}

export interface Contractor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  specialization: Specialization;
  is_active: boolean;
  rating?: number;
  completed_jobs_count?: number;
}

export interface Category {
  id: string;
  name: string;
  default_contractor_specialization: Specialization;
  iconName: string;
}

export interface Complaint {
  id: string;
  student_id: string;
  student_name: string;
  student_phone?: string;
  category_id: string;
  category_name: string;
  title: string;
  description: string;
  photo_url?: string;
  room_number: string;
  block: string;
  status: ComplaintStatus;
  priority: Priority;
  assigned_contractor_id: string | null;
  assigned_contractor_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplaintStatusLog {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  changed_by_user_id: string;
  changed_by_user_name: string;
  changed_by_role: Role;
  note?: string;
  timestamp: string;
}

export interface ComplaintFilters {
  status?: string;
  category_id?: string;
  priority?: string;
  contractor_id?: string;
  block?: string;
  search?: string;
}
