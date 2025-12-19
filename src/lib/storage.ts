import {
    ref,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a preview image for a note
 */
export async function uploadNotePreview(
    file: File,
    noteId: string,
    index: number
): Promise<string> {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `notes/${noteId}/preview_${index}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

/**
 * Upload the main PDF/document file for a note
 */
export async function uploadNoteFile(
    file: File,
    noteId: string
): Promise<string> {
    const fileExtension = file.name.split('.').pop() || 'pdf';
    const fileName = `notes/${noteId}/document.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(
    file: File,
    userId: string
): Promise<string> {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `avatars/${userId}/avatar.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

/**
 * Get download URL for a file path
 */
export async function getFileDownloadUrl(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
}
