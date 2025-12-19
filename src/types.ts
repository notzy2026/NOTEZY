export type NoteCategory = 'assignment' | 'pyq' | 'lecture-notes';

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
  uploaderId: string;
  uploaderName: string;
  uploadDate: string;
  isTopSelling?: boolean;
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
  totalEarnings: number;
  uploadedNotes: Note[];
  isAdmin?: boolean;
  isVerified?: boolean;
  isBlocked?: boolean;
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
