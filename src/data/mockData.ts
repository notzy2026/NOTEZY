import { Note, Review, UserProfile } from '../types';

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Advanced Mathematics Assignment Solutions',
    description: 'Complete solutions for advanced calculus and linear algebra assignments with step-by-step explanations.',
    category: 'assignment',
    price: 12.99,
    rating: 4.8,
    reviewCount: 156,
    salesCount: 523,
    previewPages: [
      'https://images.unsplash.com/photo-1604335150628-8715e06a5eec?w=800',
      'https://images.unsplash.com/photo-1588912914017-923900a34710?w=800'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1604335150628-8715e06a5eec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    uploaderId: 'user1',
    uploaderName: 'John Doe',
    uploadDate: '2024-11-15'
  },
  {
    id: '2',
    title: 'Physics PYQ Paper 2023-24',
    description: 'Previous year question papers for Physics with detailed solutions and marking scheme.',
    category: 'pyq',
    price: 8.99,
    rating: 4.9,
    reviewCount: 234,
    salesCount: 892,
    previewPages: [
      'https://images.unsplash.com/photo-1663138092250-fd936e24b873?w=800'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1663138092250-fd936e24b873?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    uploaderId: 'user2',
    uploaderName: 'Sarah Smith',
    uploadDate: '2024-10-20'
  },
  {
    id: '3',
    title: 'Data Structures & Algorithms Complete Guide',
    description: 'Comprehensive notes covering all DSA topics with code examples in Python and Java.',
    category: 'book',
    price: 24.99,
    rating: 5.0,
    reviewCount: 412,
    salesCount: 1243,
    previewPages: [
      'https://images.unsplash.com/photo-1706528010331-0f12582db334?w=800',
      'https://images.unsplash.com/photo-1761546571631-a4d61b55cd2f?w=800'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1706528010331-0f12582db334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    uploaderId: 'user3',
    uploaderName: 'Mike Johnson',
    uploadDate: '2024-09-10'
  },
  {
    id: '4',
    title: 'Chemistry Lab Report Templates',
    description: 'Professional lab report templates with examples and formatting guidelines.',
    category: 'assignment',
    price: 6.99,
    rating: 4.6,
    reviewCount: 98,
    salesCount: 345,
    previewPages: [
      'https://images.unsplash.com/photo-1588912914017-923900a34710?w=800'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1588912914017-923900a34710?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    uploaderId: 'user1',
    uploaderName: 'John Doe',
    uploadDate: '2024-11-01'
  },
  {
    id: '5',
    title: 'Computer Science PYQ 2020-2024',
    description: 'Five years of previous year questions with solutions for Computer Science.',
    category: 'pyq',
    price: 15.99,
    rating: 4.7,
    reviewCount: 187,
    salesCount: 678,
    previewPages: [
      'https://images.unsplash.com/photo-1663138092250-fd936e24b873?w=800'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1663138092250-fd936e24b873?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    uploaderId: 'user2',
    uploaderName: 'Sarah Smith',
    uploadDate: '2024-08-15'
  },
  {
    id: '6',
    title: 'Machine Learning Fundamentals',
    description: 'Complete guide to ML concepts, algorithms, and practical implementations.',
    category: 'book',
    price: 29.99,
    rating: 4.9,
    reviewCount: 321,
    salesCount: 956,
    previewPages: [
      'https://images.unsplash.com/photo-1701576766277-c6160505581d?w=800',
      'https://images.unsplash.com/photo-1706528010331-0f12582db334?w=800'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1701576766277-c6160505581d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    uploaderId: 'user3',
    uploaderName: 'Mike Johnson',
    uploadDate: '2024-07-22'
  },
  {
    id: '7',
    title: 'Biology Diagram Collection',
    description: 'High-quality labeled diagrams for all biology topics with explanations.',
    category: 'assignment',
    price: 9.99,
    rating: 4.8,
    reviewCount: 145,
    salesCount: 432,
    previewPages: [
      'https://images.unsplash.com/photo-1604335150628-8715e06a5eec?w=800'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1604335150628-8715e06a5eec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    uploaderId: 'user4',
    uploaderName: 'Emma Wilson',
    uploadDate: '2024-10-05'
  },
  {
    id: '8',
    title: 'Economics PYQ with Model Answers',
    description: 'Previous year papers with model answers and examiner comments.',
    category: 'pyq',
    price: 11.99,
    rating: 4.7,
    reviewCount: 203,
    salesCount: 589,
    previewPages: [
      'https://images.unsplash.com/photo-1663138092250-fd936e24b873?w=800'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1663138092250-fd936e24b873?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    uploaderId: 'user4',
    uploaderName: 'Emma Wilson',
    uploadDate: '2024-09-18'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    noteId: '1',
    userName: 'Alice Brown',
    rating: 5,
    comment: 'Excellent notes! Very detailed and easy to understand.',
    date: '2024-11-20'
  },
  {
    id: 'r2',
    noteId: '1',
    userName: 'Bob Chen',
    rating: 4,
    comment: 'Good quality but could use more examples.',
    date: '2024-11-18'
  }
];

export const currentUser: UserProfile = {
  id: 'user1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  totalEarnings: 6789.50,
  uploadedNotes: mockNotes.filter(note => note.uploaderId === 'user1')
};

// Mock purchased notes
export const purchasedNotes = [mockNotes[1], mockNotes[2], mockNotes[5]];

// Mock bookmarked notes
export const bookmarkedNotes = [mockNotes[0], mockNotes[3], mockNotes[6]];
