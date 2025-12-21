import { User, Edit, Mail, Calendar, Camera, FileText } from 'lucide-react';
import { UserProfile, Note } from '../types';
import { NoteCard } from './NoteCard';
import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadUserAvatar } from '../lib/storage';
import { updateUserProfile } from '../lib/firestore';

interface ProfilePageProps {
  user: UserProfile;
  onPreview: (note: Note) => void;
}

export function ProfilePage({ user, onPreview }: ProfilePageProps) {
  const { user: authUser, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedBio, setEditedBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!authUser) return;

    try {
      await updateUserProfile(authUser.uid, {
        name: editedName,
        avatarUrl: avatarUrl,
        bio: editedBio,
      });
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !authUser) return;

    const file = e.target.files[0];
    setUploadingAvatar(true);

    try {
      const url = await uploadUserAvatar(file, authUser.uid);
      setAvatarUrl(url);
      // Update profile with new avatar
      await updateUserProfile(authUser.uid, { avatarUrl: url });
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Camera overlay for changing avatar */}
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center rounded-2xl transition-all cursor-pointer group"
              >
                <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-lg border-4 border-white dark:border-gray-900"></div>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">Name</label>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">Email</label>
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">Bio</label>
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      maxLength={200}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{editedBio.length}/200 characters</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(user.name);
                        setEditedEmail(user.email);
                        setEditedBio(user.bio || '');
                        setAvatarUrl(user.avatarUrl);
                      }}
                      className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-gray-900 dark:text-white mb-2">{user.name}</h1>
                  {user.bio && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3 italic">"{user.bio}"</p>
                  )}
                  <div className="flex flex-col gap-2 text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Member since 2024</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </>
              )}
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 text-center shadow-xl">
              <div className="text-white text-opacity-90 text-sm mb-1">Total Earnings</div>
              <div className="text-white text-3xl">₹{user.totalEarnings.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Uploaded Notes */}
        <div>
          <h2 className="text-gray-900 dark:text-white mb-6">My Uploaded Notes ({user.uploadedNotes.length})</h2>

          {user.uploadedNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {user.uploadedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPreview={onPreview}
                  isPurchased={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <User className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <h3 className="text-gray-900 dark:text-white mb-2">No Uploaded Notes</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start uploading notes to build your collection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}