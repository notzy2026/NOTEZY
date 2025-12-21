# Notezy - Notes Selling Platform

A modern platform for students to buy, sell, and share academic notes, assignments, and PYQ papers.

## Features

### For Students
- 📚 **Browse Notes** - Search and filter notes by category (Assignments, PYQs, Lecture Notes)
- 🛒 **Purchase Notes** - Secure payment via Razorpay
- 📖 **Preview Notes** - View first 4 pages before purchasing
- 📌 **Bookmarks** - Save notes for later
- ⬆️ **Upload Notes** - Share your notes and earn money (PDF auto-preview extraction)
- 📝 **Request Notes** - Request specific notes you need
- 💰 **Earnings** - Track and withdraw your earnings via UPI

### For Guests
- 👀 **Browse as Guest** - View notes without logging in
- 🔒 **Protected Actions** - Login required for purchases, downloads, bookmarks

### For Admins
- 📊 **Dashboard** - Overview of platform activity
- 👥 **User Management** - View and manage users
- 📄 **Notes Management** - Approve/reject uploaded notes
- 📋 **Free PYQs** - Add free PYQ papers with Google Drive links
- 💳 **Payouts** - Process user payout requests
- 📬 **Note Requests** - Respond to user note requests
- 💬 **Support Chats** - Customer support messaging

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Payments**: Razorpay
- **PDF Processing**: PDF.js

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project
- Razorpay account (for payments)

### Installation

1. Clone the repository
```bash
git clone https://github.com/notzy2026/notezy.git
cd notezy
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file with your Firebase and Razorpay credentials
```

4. Start the development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

## Project Structure

```
src/
├── components/     # React components
├── contexts/       # Auth and Theme contexts
├── hooks/          # Custom React hooks
├── lib/            # Firebase, storage, and utility functions
└── types.ts        # TypeScript type definitions
```

## License

MIT