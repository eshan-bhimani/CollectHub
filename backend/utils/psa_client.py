import logging
from urllib.parse import urljoin

import requests

from config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://api.psacard.com/publicapi/"

_cert_cache: dict[str, dict] = {}
_image_cache: dict[str, dict] = {}


class PSAAuthError(Exception):
    pass


class PSACertNotFoundError(Exception):
    pass


class PSARateLimitError(Exception):
    pass


class PSAClient:
    def __init__(self, bearer_token: str):
        self._token = bearer_token
        self._session = requests.Session()
        self._session.headers["Authorization"] = f"Bearer {self._token}"

    @classmethod
    def get_token(cls, email: str, password: str) -> dict:
        resp = requests.post(
            urljoin(BASE_URL, "token"),
            data={
                "grant_type": "password",
                "username": email,
                "password": password,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        if resp.status_code == 401:
            raise PSAAuthError("Invalid PSA email or password")
        if resp.status_code == 429:
            raise PSARateLimitError("PSA API rate limit exceeded")
        resp.raise_for_status()
        data = resp.json()
        return {
            "access_token": data["access_token"],
            "expires_in": data.get("expires_in", 3600),
        }

    def _get(self, path: str) -> dict:
        resp = self._session.get(urljoin(BASE_URL, path), timeout=15)
        if resp.status_code == 401:
            raise PSAAuthError("PSA token expired or invalid")
        if resp.status_code == 404:
            raise PSACertNotFoundError(f"Cert not found: {path}")
        if resp.status_code == 429:
            raise PSARateLimitError("PSA API rate limit exceeded")
        resp.raise_for_status()
        return resp.json()

    def get_cert(self, cert_number: str) -> dict:
        if cert_number in _cert_cache:
            return _cert_cache[cert_number]
        data = self._get(f"cert/GetByCertNumber/{cert_number}")
        _cert_cache[cert_number] = data
        return data

    def get_cert_images(self, cert_number: str) -> dict:
        if cert_number in _image_cache:
            return _image_cache[cert_number]
        data = self._get(f"cert/GetImagesByCertNumber/{cert_number}")
        _image_cache[cert_number] = data
        return data
