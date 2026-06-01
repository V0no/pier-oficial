from pathlib import Path
import sys
from typing import Any

SRC_DIR = Path(__file__).resolve().parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.append(str(SRC_DIR))

from services.vehicle_service import lookup_vehicle_by_plate, normalize_plate


def extract_plates_from_notebook_dict(placas: dict[str, dict[str, Any]]) -> list[str]:
    extracted: list[str] = []
    for _, item in placas.items():
        plate = item.get("placa")
        if plate:
            extracted.append(str(plate))
    return extracted


def verify_plates_with_api(
    plates: list[str],
    extra_payload: dict | None = None,
) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []

    for plate in plates:
        normalized = normalize_plate(plate)
        try:
            api_response = lookup_vehicle_by_plate(
                normalized, extra_payload=extra_payload
            )
            results.append(
                {
                    "input_plate": plate,
                    "normalized_plate": normalized,
                    "ok": True,
                    "response": api_response,
                }
            )
        except Exception as exc:
            results.append(
                {
                    "input_plate": plate,
                    "normalized_plate": normalized,
                    "ok": False,
                    "error": str(exc),
                }
            )

    return results


def verify_notebook_plates_with_api(
    placas: dict[str, dict[str, Any]],
    extra_payload: dict | None = None,
) -> list[dict[str, Any]]:
    plates = extract_plates_from_notebook_dict(placas)
    return verify_plates_with_api(plates, extra_payload=extra_payload)
