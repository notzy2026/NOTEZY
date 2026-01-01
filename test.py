import os
import io
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseUpload
import pickle

# Optional GUI file dialog for interactive mode (tkinter)
try:
    import tkinter as tk
    from tkinter import filedialog, messagebox
except Exception:
    tk = None

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/drive.file']

class DriveFileOrganizer:
    def __init__(self):
        self.service = None
        self.authenticate()
    
    def authenticate(self):
        """Authenticate with Google Drive API"""
        creds = None

        print("Authenticating with Google Drive API...")
        # Token file stores user's access and refresh tokens
        if os.path.exists('token.pickle'):
            try:
                with open('token.pickle', 'rb') as token:
                    creds = pickle.load(token)
                print("✓ Loaded existing credentials from token.pickle")
            except Exception as e:
                print(f"✗ Failed to read token.pickle: {e}")
                creds = None

        # If no valid credentials, let user log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    print("✓ Refreshed expired credentials")
                except Exception as e:
                    print(f"✗ Failed to refresh credentials: {e}")
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                try:
                    creds = flow.run_local_server(port=0)
                except Exception as e:
                    print(f"✗ run_local_server failed: {e}")
                    print("Falling back to console-based auth (paste URL/Code). If you're on a server, consider using a service account.")
                    creds = flow.run_console()

            # Save credentials for next run
            try:
                with open('token.pickle', 'wb') as token:
                    pickle.dump(creds, token)
                print("✓ Saved credentials to token.pickle")
            except Exception as e:
                print(f"✗ Failed to save token.pickle: {e}")

        if not creds:
            raise RuntimeError("Authentication failed. No credentials available.")

        self.service = build('drive', 'v3', credentials=creds)
        print("✓ Successfully authenticated with Google Drive")
    
    def find_folder(self, folder_name):
        """Search for folder by name, return folder ID if exists"""
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        
        results = self.service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name)'
        ).execute()
        
        folders = results.get('files', [])
        
        if folders:
            return folders[0]['id']
        return None
    
    def create_folder(self, folder_name):
        """Create a new folder in Google Drive"""
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        
        folder = self.service.files().create(
            body=file_metadata,
            fields='id'
        ).execute()
        
        print(f"✓ Created new folder: {folder_name}")
        return folder.get('id')
    
    def get_or_create_folder(self, subject):
        """Get folder ID for subject, create if doesn't exist"""
        folder_id = self.find_folder(subject)
        
        if folder_id:
            print(f"✓ Found existing folder: {subject}")
            return folder_id
        else:
            return self.create_folder(subject)
    
    def upload_file(self, file_path, file_name, category):
        """Upload file to appropriate subject folder"""
        try:
            # Get or create folder for the category
            folder_id = self.get_or_create_folder(category)
            
            # File metadata
            file_metadata = {
                'name': file_name,
                'parents': [folder_id]
            }
            
            # Upload file
            media = MediaFileUpload(file_path, resumable=True)
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink'
            ).execute()
            
            print(f"✓ File uploaded successfully!")
            print(f"  Name: {file.get('name')}")
            print(f"  ID: {file.get('id')}")
            print(f"  Link: {file.get('webViewLink')}")
            
            return file
            
        except Exception as e:
            print(f"✗ Error uploading file: {str(e)}")
            return None
    
    def upload_file_content(self, file_content, file_name, category, mime_type='text/plain'):
        """Upload file from content (for testing without actual files)"""
        try:
            folder_id = self.get_or_create_folder(category)
            
            file_metadata = {
                'name': file_name,
                'parents': [folder_id]
            }
            
            # Create file-like object from content
            fh = io.BytesIO(file_content.encode() if isinstance(file_content, str) else file_content)
            media = MediaIoBaseUpload(fh, mimetype=mime_type, resumable=True)
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink'
            ).execute()
            
            print(f"✓ File uploaded successfully!")
            print(f"  Name: {file.get('name')}")
            print(f"  Category: {category}")
            print(f"  Link: {file.get('webViewLink')}")
            
            return file
            
        except Exception as e:
            print(f"✗ Error uploading file: {str(e)}")
            return None


def test_upload():
    """Test function to demonstrate usage"""
    print("=" * 60)
    print("Google Drive File Organizer - Testing")
    print("=" * 60)
    print()
    
    # Initialize organizer
    organizer = DriveFileOrganizer()
    print()
    
    # Test cases
    test_files = [
        {
            'content': 'This is a sample Mathematics paper about algebra and calculus.',
            'name': 'Algebra_Notes.txt',
            'category': 'Maths'
        },
        {
            'content': 'Physics notes on Newton\'s laws and motion.',
            'name': 'Physics_Chapter1.txt',
            'category': 'Science'
        },
        {
            'content': 'Chemistry periodic table and chemical reactions.',
            'name': 'Chemistry_Basics.txt',
            'category': 'Science'
        },
        {
            'content': 'Advanced calculus and differential equations.',
            'name': 'Calculus_Advanced.txt',
            'category': 'Maths'
        }
    ]
    
    # Upload test files
    print("\nUploading test files...")
    print("-" * 60)
    
    for idx, file_data in enumerate(test_files, 1):
        print(f"\n[{idx}/{len(test_files)}] Uploading: {file_data['name']}")
        organizer.upload_file_content(
            file_content=file_data['content'],
            file_name=file_data['name'],
            category=file_data['category']
        )
        print()
    
    print("=" * 60)
    print("Testing completed!")
    print("=" * 60)


def interactive_mode():
    """Interactive mode for manual file uploads (supports GUI file picker)"""
    organizer = DriveFileOrganizer()
    
    print("\n" + "=" * 60)
    print("Interactive Upload Mode")
    print("=" * 60)
    
    while True:
        try:
            print("\nOptions:")
            print("1. Upload file(s) using file picker (GUI)")
            print("2. Upload a file by entering path manually")
            print("3. Exit")
            
            choice = input("\nEnter choice (1-3): ").strip()
            
            if choice == '1':
                if tk is None:
                    print("✗ tkinter is not available on this system; please choose option 2 for manual input.")
                    continue
                # Open file dialog to select one or more files in a separate thread to avoid blocking
                import threading, queue

                file_queue = queue.Queue()

                def open_dialog(q):
                    root = None
                    try:
                        root = tk.Tk()
                        root.withdraw()
                        paths = filedialog.askopenfilenames(title="Select file(s) to upload")
                        q.put(paths)
                    except Exception as e:
                        q.put(e)
                    finally:
                        if root is not None:
                            try:
                                root.destroy()
                            except Exception:
                                pass

                threading.Thread(target=open_dialog, args=(file_queue,), daemon=True).start()

                print("Opening file picker... it may appear behind other windows. Waiting up to 20s for selection.")
                try:
                    result = file_queue.get(timeout=20)
                except queue.Empty:
                    print("✗ File picker did not respond within 20 seconds.")
                    retry = input("Press 'r' to retry, 'm' to use manual path, or Enter to wait longer: ").strip().lower()
                    if retry == 'r':
                        continue
                    elif retry == 'm':
                        file_path = input("Enter file path: ").strip()
                        if not os.path.exists(file_path):
                            print("✗ File not found!")
                            continue
                        file_name = input("Enter file name (or press Enter to use original): ").strip()
                        if not file_name:
                            file_name = os.path.basename(file_path)
                        print("\nAvailable categories: Maths, Science, English, History, etc.")
                        category = input("Enter category/subject: ").strip()
                        if not category:
                            print("✗ Category is required!")
                            continue
                        organizer.upload_file(file_path, file_name, category)
                        continue
                    else:
                        print("Waiting an additional 60 seconds...")
                        try:
                            result = file_queue.get(timeout=60)
                        except queue.Empty:
                            print("✗ File picker still did not respond. Please use manual option (2).")
                            continue

                if isinstance(result, Exception):
                    print(f"✗ File dialog error: {result}")
                    print("Please use option 2 to enter file path manually.")
                    continue

                file_paths = list(result)

                if not file_paths:
                    print("✗ No file selected!")
                    continue
                for path in file_paths:
                    if not os.path.exists(path):
                        print(f"✗ File not found: {path}")
                        continue
                    file_name = os.path.basename(path)
                    custom_name = input(f"Enter file name for '{file_name}' (or press Enter to use original): ").strip()
                    if custom_name:
                        file_name = custom_name
                    print("\nAvailable categories: Maths, Science, English, History, etc.")
                    category = input("Enter category/subject: ").strip()
                    if not category:
                        print("✗ Category is required! Skipping this file.")
                        continue
                    organizer.upload_file(path, file_name, category)
                
            elif choice == '2':
                file_path = input("Enter file path: ").strip()
                if not os.path.exists(file_path):
                    print("✗ File not found!")
                    continue
                file_name = input("Enter file name (or press Enter to use original): ").strip()
                if not file_name:
                    file_name = os.path.basename(file_path)
                print("\nAvailable categories: Maths, Science, English, History, etc.")
                category = input("Enter category/subject: ").strip()
                if not category:
                    print("✗ Category is required!")
                    continue
                organizer.upload_file(file_path, file_name, category)
                
            elif choice == '3':
                print("\nGoodbye!")
                break
            else:
                print("✗ Invalid choice!")
        except KeyboardInterrupt:
            print("\n\n✗ Interrupted by user. Exiting interactive mode.")
            break


if __name__ == "__main__":
    print("Google Drive File Organizer")
    print("\nBefore running, make sure you have:")
    print("1. credentials.json file from Google Cloud Console")
    print("2. Installed required packages: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    print()
    
    mode = input("Choose mode:\n1. Test mode (demo)\n2. Interactive mode\n\nEnter choice (1-2): ").strip()
    
    if mode == '1':
        test_upload()
    elif mode == '2':
        interactive_mode()
    else:
        print("Invalid choice!")