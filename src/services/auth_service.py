import os
import requests
from dotenv import load_dotenv

load_dotenv()

DEFAULT_TIMEOUT_SECONDS = float(os.getenv("API_TIMEOUT_SECONDS", "10"))


def _require_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {var_name}")
    return value


def get_access_token() -> str:
    token_url = _require_env("API_TOKEN_URL")
    username = _require_env("API_USERNAME")
    password = _require_env("API_PASSWORD")
    client_id = _require_env("API_CLIENT_ID")
    client_secret = _require_env("API_CLIENT_SECRET")

    data = {
        "grant_type": "password",
        "username": username,
        "password": password,
    }

    try:
        response = requests.post(
            token_url,
            data=data,
            auth=(client_id, client_secret),
            timeout=DEFAULT_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"Failed to obtain access token: {exc}") from exc

    try:
        payload = response.json()
    except ValueError as exc:
        raise RuntimeError("Token endpoint returned a non-JSON response.") from exc

    access_token = payload.get("access_token")
    if not access_token:
        raise RuntimeError("Token endpoint response does not contain 'access_token'.")

    return access_token
