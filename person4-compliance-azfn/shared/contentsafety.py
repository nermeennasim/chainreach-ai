import os
import logging
import re
from typing import Any, Union, List
from pathlib import Path

# Load environment variables from .env file BEFORE importing Azure
from dotenv import load_dotenv

# Try to load .env from the parent directory
env_paths = [
    Path(__file__).parent.parent / ".env",  # parent of shared/
    Path.cwd() / ".env",  # current working directory
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        break

from azure.core.credentials import AzureKeyCredential
from azure.core.exceptions import AzureError

try:
    from azure.ai.contentsafety import ContentSafetyClient
    from azure.ai.contentsafety.models import AnalyzeTextOptions
except Exception:  # pragma: no cover - optional dependency during development
    ContentSafetyClient = None
    AnalyzeTextOptions = None

logger = logging.getLogger("compliance")

# Load env vars
endpoint = os.environ.get("AZURE_CONTENT_SAFETY_ENDPOINT")
key = os.environ.get("AZURE_CONTENT_SAFETY_KEY")
# New: allow forcing mock mode for testing
force_mock = str(os.environ.get("AZURE_CONTENT_SAFETY_FORCE_MOCK", "false")).lower() in ("1", "true", "yes")

client = None
if not force_mock and ContentSafetyClient and endpoint and key:
    try:
        client = ContentSafetyClient(endpoint, AzureKeyCredential(key))
        logger.info("Azure Content Safety client initialized")
    except Exception as e:
        client = None
        logger.error("Failed to initialize Azure Content Safety client: %s", e)
else:
    if force_mock:
        logger.info("Force mock mode enabled via AZURE_CONTENT_SAFETY_FORCE_MOCK")
    else:
        logger.warning("Azure Content Safety KEY or ENDPOINT missing or SDK unavailable - running mock mode.")


def _extract_score(value: Any) -> float:
    """Try to extract a numeric score from different SDK shapes.

    Returns a score in the range 0..1 when possible, or an integer-like severity.
    """
    if value is None:
        return 0.0
    # numeric values
    if isinstance(value, (int, float)):
        return float(value)
    # common attribute names on classification objects
    for attr in ("score", "probability", "severity", "value", "category_score"):
        if hasattr(value, attr):
            try:
                return float(getattr(value, attr))
            except Exception:
                continue
    # last resort: try to coerce to float
    try:
        return float(value)
    except Exception:
        return 0.0


def analyze_message(text: Union[str, List[str], dict]):
    """Analyze text using Azure Content Safety.

    Accept string, list of strings, or dict with 'text'/'message'/'messages' keys.
    """
    global client, force_mock

    # Normalize input to single string
    normalized = ""
    if isinstance(text, dict):
        # Prefer 'message' if present, then 'text', then 'messages'
        if "message" in text and isinstance(text["message"], str):
            normalized = text["message"]
        elif "text" in text and isinstance(text["text"], str):
            normalized = text["text"]
        elif "messages" in text and isinstance(text["messages"], (list, tuple)):
            for t in text["messages"]:
                if isinstance(t, str) and t.strip():
                    normalized = t.strip()
                    break
    elif isinstance(text, (list, tuple)):
        for t in text:
            if isinstance(t, str) and t.strip():
                normalized = t.strip()
                break
    elif isinstance(text, str):
        normalized = text
    normalized = (normalized or "").strip()

    logger.info(f"[ANALYZE] Using client: {client is not None}, force_mock: {force_mock}, preview: '{normalized[:80]}'")

    # Mock mode if no client or force_mock requested
    if client is None or force_mock:
        # Use word-boundary regex to avoid substring false positives
        pattern = re.compile(r"\b(hate|kill|die|murder|slur|suicide|f\*{1,3}|fuck)\b", flags=re.IGNORECASE)
        contains_bad = bool(pattern.search(normalized))
        logger.info(f"[MOCK MODE] contains_bad={contains_bad}")
        return {
            "approved": not contains_bad,
            "categories": {"hate": 1.0 if contains_bad else 0.0, "sexual": 0.0, "violence": 1.0 if contains_bad else 0.0, "self_harm": 1.0 if bool(re.search(r"\b(suicide|kill yourself)\b", normalized, flags=re.IGNORECASE)) else 0.0},
            "reason": "Mock evaluation (Azure key missing or force_mock enabled)",
            "confidence": 0.9 if contains_bad else 0.1
        }

    # Real Azure client path
    try:
        request = AnalyzeTextOptions(text=normalized)
        result = client.analyze_text(request)
        logger.info(f"[AZURE] Raw result: {result}")

        # Parse categories_analysis from Azure SDK response
        category_scores = {"hate": 0.0, "sexual": 0.0, "violence": 0.0, "self_harm": 0.0}
        
        if hasattr(result, "categories_analysis") and result.categories_analysis:
            # categories_analysis is a list of dicts: [{"category": "Hate", "severity": 2}, ...]
            for category_item in result.categories_analysis:
                if isinstance(category_item, dict):
                    cat_name = category_item.get("category", "").lower()
                    severity = category_item.get("severity", 0)
                else:
                    cat_name = getattr(category_item, "category", "").lower()
                    severity = getattr(category_item, "severity", 0)
                
                # Map Azure category names to our keys
                if cat_name == "hate":
                    category_scores["hate"] = float(severity)
                elif cat_name == "sexual":
                    category_scores["sexual"] = float(severity)
                elif cat_name == "violence":
                    category_scores["violence"] = float(severity)
                elif cat_name == "selfharm":
                    category_scores["self_harm"] = float(severity)
                
                logger.debug(f"[AZURE] Category '{cat_name}': {severity}")

        # Determine approval with robust threshold handling
        # Azure Content Safety severity: 0 = safe, 1 = low, 2 = medium, 3 = high
        def is_violation(s: float) -> bool:
            if s >= 2:  # medium severity or higher
                return True
            return False

        approved = not any(is_violation(s) for s in category_scores.values())
        logger.info(f"[AZURE] approved={approved}, categories={category_scores}")

        return {
            "approved": approved,
            "categories": category_scores,
            "reason": "Azure Content Safety",
            "confidence": 1.0
        }

    except AzureError as e:
        logger.error("Azure Content Safety error: %s", e)
        return {
            "approved": False,
            "categories": {},
            "reason": f"Azure error: {str(e)}",
            "confidence": 0.0
        }
