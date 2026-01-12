export type NoteCategory = 'assignment' | 'lecture-notes' | 'pyq';

export interface Note {
  id: string;
  title: string;
  description: string;
  category: NoteCategory;
  price: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  previewPages: string[];
  thumbnailUrl: string;
  pdfUrls?: string[];
  totalPages?: number;
  uploaderId: string;
  uploaderName: string;
  uploadDate: string;
  isTopSelling?: boolean;
  isVerified?: boolean;
  isDeleted?: boolean;
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  createdAt?: string;
}

export interface FreePYQ {
  id: string;
  courseCode: string;
  courseName: string;
  driveLink: string;
  driveFolderId?: string;
  addedAt: string;
  addedBy: string;
  fileName?: string;
}

export interface Review {
  id: string;
  noteId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  totalEarnings: number;
  uploadedNotes: Note[];
  isAdmin?: boolean;
  isVerified?: boolean;
  isBlocked?: boolean;
  pendingPayout?: boolean;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  upiId: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'completed';
  requestedAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  text: string;
  timestamp: string;
}

export interface SupportChat {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'open' | 'closed';
  createdAt: string;
  lastMessage: string;
  lastMessageAt: string;
}

export interface NoteRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  category: NoteCategory;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  response?: string;
  responseLink?: string;
  respondedAt?: string;
}

export type NotificationType = 'purchase' | 'review' | 'payout' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string; // Optional page to navigate to
  relatedId?: string; // Related note/payout ID
}
