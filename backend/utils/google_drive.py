import logging
from datetime import datetime

from cryptography.fernet import Fernet
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

from config import settings

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/drive"]


def encrypt_token(token: str) -> str:
    if not settings.drive_encryption_key:
        raise RuntimeError("DRIVE_ENCRYPTION_KEY is not configured")
    f = Fernet(settings.drive_encryption_key.encode())
    return f.encrypt(token.encode()).decode()


def decrypt_token(encrypted: str) -> str:
    if not settings.drive_encryption_key:
        raise RuntimeError("DRIVE_ENCRYPTION_KEY is not configured")
    f = Fernet(settings.drive_encryption_key.encode())
    return f.decrypt(encrypted.encode()).decode()


class GoogleDriveClient:
    def __init__(self, refresh_token: str):
        self._creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            scopes=SCOPES,
        )
        self._service = build("drive", "v3", credentials=self._creds)

    @classmethod
    def _build_flow(cls) -> Flow:
        return Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
            redirect_uri=settings.google_drive_redirect_uri,
        )

    @classmethod
    def get_authorization_url(cls, state: str) -> str:
        flow = cls._build_flow()
        url, _ = flow.authorization_url(
            access_type="offline",
            prompt="consent",
            state=state,
        )
        return url

    @classmethod
    def exchange_code(cls, code: str) -> dict:
        flow = cls._build_flow()
        flow.fetch_token(code=code)
        creds = flow.credentials
        return {
            "refresh_token": creds.refresh_token,
            "access_token": creds.token,
            "expiry": creds.expiry,
        }

    def list_folders(self) -> list[dict]:
        results = self._service.files().list(
            q="mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields="files(id, name)",
            pageSize=200,
        ).execute()
        return [{"id": f["id"], "name": f["name"]} for f in results.get("files", [])]

    def list_new_images(self, folder_id: str, since: datetime | None) -> list[dict]:
        mime_filter = (
            "(mimeType='image/jpeg' or mimeType='image/png' "
            "or mimeType='image/webp' or mimeType='image/heic')"
        )
        q = f"'{folder_id}' in parents and trashed=false and {mime_filter}"
        if since:
            ts = since.strftime("%Y-%m-%dT%H:%M:%S")
            q += f" and modifiedTime > '{ts}'"
        results = self._service.files().list(
            q=q,
            fields="files(id, name, mimeType, modifiedTime)",
            pageSize=100,
        ).execute()
        return results.get("files", [])

    def download_file(self, file_id: str) -> bytes:
        return self._service.files().get_media(fileId=file_id).execute()

    def get_or_create_cropped_folder(self, parent_folder_id: str) -> str:
        results = self._service.files().list(
            q=(
                f"'{parent_folder_id}' in parents "
                "and mimeType='application/vnd.google-apps.folder' "
                "and name='cropped' and trashed=false"
            ),
            fields="files(id)",
            pageSize=1,
        ).execute()
        files = results.get("files", [])
        if files:
            return files[0]["id"]
        folder = self._service.files().create(
            body={
                "name": "cropped",
                "mimeType": "application/vnd.google-apps.folder",
                "parents": [parent_folder_id],
            },
            fields="id",
        ).execute()
        return folder["id"]

    def upload_file(self, folder_id: str, filename: str, content: bytes) -> str:
        import io
        media = MediaIoBaseUpload(io.BytesIO(content), mimetype="image/png")
        uploaded = self._service.files().create(
            body={"name": filename, "parents": [folder_id]},
            media_body=media,
            fields="id",
        ).execute()
        return uploaded["id"]
