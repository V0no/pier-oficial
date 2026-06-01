import os
import re
import requests
from dotenv import load_dotenv

try:
    from .auth_service import DEFAULT_TIMEOUT_SECONDS, get_access_token
except ImportError:
    from auth_service import DEFAULT_TIMEOUT_SECONDS, get_access_token

load_dotenv()


def _get_env_any(*names: str) -> str:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    raise RuntimeError(f"Missing required environment variable. Tried: {', '.join(names)}")


def _auth_headers() -> dict:
    access_token = get_access_token()
    return {"Authorization": f"Bearer {access_token}"}


def _format_error_response(response: requests.Response) -> str:
    try:
        body = response.json()
    except ValueError:
        body = response.text.strip()
    return f"status={response.status_code}, body={body}"


def normalize_plate(plate: str) -> str:
    if not plate:
        raise RuntimeError("Plate value is empty.")
    return re.sub(r"[^A-Za-z0-9]", "", plate).upper()


def build_vehicle_lookup_payload(plate: str, extra_payload: dict | None = None) -> dict:
    plate_field = os.getenv("API_VEHICLE_LOOKUP_PLATE_FIELD", "license_plate")
    payload = {plate_field: normalize_plate(plate)}

    default_lat = os.getenv("API_DEFAULT_LATITUDE")
    default_lng = os.getenv("API_DEFAULT_LONGITUDE")
    if default_lat and default_lng:
        payload["geolocation"] = {
            "latitude": float(default_lat),
            "longitude": float(default_lng),
        }

    if extra_payload:
        payload.update(extra_payload)
    return payload


def create_vehicle_lookup(payload: dict) -> dict:
    url = _get_env_any("API_VEHICLE_LOOKUPS", "API_vehicle_lookups")
    try:
        response = requests.post(
            url,
            json=payload,
            headers=_auth_headers(),
            timeout=DEFAULT_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        if getattr(exc, "response", None) is not None:
            details = _format_error_response(exc.response)
            raise RuntimeError(f"Vehicle lookup request failed: {details}") from exc
        raise RuntimeError(f"Vehicle lookup request failed: {exc}") from exc
    return response.json()


def confirm_vehicle_lookup(payload: dict) -> dict:
    url = _get_env_any("API_VEHICLE_LOOKUPS_ID", "API_vehicle_lookups_id")
    try:
        response = requests.post(
            url,
            json=payload,
            headers=_auth_headers(),
            timeout=DEFAULT_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        if getattr(exc, "response", None) is not None:
            details = _format_error_response(exc.response)
            raise RuntimeError(f"Vehicle lookup confirmation failed: {details}") from exc
        raise RuntimeError(f"Vehicle lookup confirmation failed: {exc}") from exc
    return response.json()


def lookup_vehicle_by_plate(plate: str, extra_payload: dict | None = None) -> dict:
    payload = build_vehicle_lookup_payload(plate, extra_payload=extra_payload)
    return create_vehicle_lookup(payload)
