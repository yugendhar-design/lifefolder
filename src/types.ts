export type DeadlineStatus = 'Overdue' | 'Due today' | 'Approaching' | 'Upcoming';

export type CategoryType = 
  | 'Identity / Govt'
  | 'Insurance'
  | 'Healthcare'
  | 'Vehicle'
  | 'Financial'
  | 'Subscription'
  | 'Other';

export interface DeadlineAttachment {
  name: string;
  size: number;
  type: string;
  path?: string;
  dataUrl?: string; // for local preview or storage
  uploadedAt: string;
}

export interface Deadline {
  id: string;
  user_id: string;
  name: string;
  category: CategoryType;
  deadline_date: string; // YYYY-MM-DD
  identifier?: string;
  reminder_days: number; // 60, 30, 15, 7, 1
  attachment?: DeadlineAttachment;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string; // 'Vault Owner'
  created_at: string;
}

export type ViewScreen = 
  | 'overview'
  | 'all-deadlines'
  | 'add-deadline'
  | 'edit-deadline'
  | 'deadline-details'
  | 'settings'
  | 'help';
