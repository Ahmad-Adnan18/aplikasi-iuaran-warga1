// Role definitions
export type UserRole = 'admin' | 'warga';

// User type
export interface User {
  id: string; // Clerk user ID
  name: string;
  email: string;
  phone_number?: string;
  role: UserRole;
  block_number?: string;
  created_at: string;
  updated_at: string;
}

// IPL Bill types
export type IPLStatus = 'pending' | 'paid' | 'overdue';

export interface IPLBill {
  id: string;
  user_id: string;
  month: number;
  year: number;
  amount: number;
  status: IPLStatus;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// Transaction types
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  user_id: string;
  amount_paid: number;
  status: TransactionStatus;
  payment_method: string;
  external_id: string; // ID from Midtrans
  payment_time?: string;
  created_at: string;
}

export interface TransactionBillDetail {
  id: string;
  transaction_id: string;
  ipl_bill_id: string;
}

export interface TransactionFee {
  id: string;
  transaction_id: string;
  fee_type: string;
  amount: number;
  created_at: string;
}

// Letter types
export type LetterStatus = 'pending' | 'processed' | 'ready_to_collect' | 'rejected';

export interface UserLetter {
  id: string;
  user_id: string;
  letter_type: string;
  purpose: string;
  status: LetterStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

// SOS types
export type SOSType = 'kebakaran' | 'medis' | 'keamanan';

export interface SOSLog {
  id: string;
  user_id: string;
  type: SOSType;
  created_at: string;
}

// Announcement types
export interface Announcement {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

// Suggestion types
export interface UserSuggestion {
  id: string;
  user_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Forum types
export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ForumPost {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Poll types
export interface Poll {
  id: string;
  user_id: string;
  question: string;
  expires_at?: string;
  created_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  poll_option_id: string;
  user_id: string;
  created_at: string;
}

// Report ticket types
export type ReportStatus = 'baru' | 'ditangani' | 'selesai';
export type ReportCategory = 'kebersihan' | 'keamanan' | 'penerangan' | 'fasilitas' | 'lainnya';

export interface ReportTicket {
  id: string;
  user_id: string;
  category: ReportCategory;
  description: string;
  location_detail?: string;
  image_url?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

// Facility types
export interface Facility {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  requires_approval: boolean;
  is_active: boolean;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface FacilityBooking {
  id: string;
  facility_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
}

// User session info
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}