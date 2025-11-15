import os
from azure.ai.contentsafety import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions
from azure.core.credentials import AzureKeyCredential
from azure.core.exceptions import AzureError
import logging

logger = logging.getLogger("compliance")

# Load env vars
endpoint = os.environ.get("AZURE_CONTENT_SAFETY_ENDPOINT")
key = os.environ.get("AZURE_CONTENT_SAFETY_KEY")

client = None

if endpoint and key:
    try:
        client = ContentSafetyClient(endpoint, AzureKeyCredential(key))
    except Exception as e:
        logger.error("Failed to initialize Azure Content Safety client: %s", e)
else:
    logger.warning("Azure Content Safety KEY or ENDPOINT missing — running mock mode.")

def analyze_message(text: str):
    """
    If Azure key exists → use Azure Content Safety.
    Otherwise → fallback to mock.
    """
    global client

    # Mock fallback
    if client is None:
        return {
            "approved": True,
            "categories": {"hate": 0, "sexual": 0, "violence": 0, "self_harm": 0},
            "reason": "Mock evaluation (Azure key missing)",
            "confidence": 1.0
        }

    try:
        request = AnalyzeTextOptions(text=text)
        result = client.analyze_text(request)

        categories = {
            "hate": result.hate.result,
            "sexual": result.sexual.result,
            "violence": result.violence.result,
            "self_harm": result.self_harm.result
        }

        approved = all(value == 0 for value in categories.values())

        return {
            "approved": approved,
            "categories": categories,
            "reason": "Azure Content Safety",
            "confidence": 1.0
        }

    except AzureError as e:
        logger.error("Azure Content Safety error: %s", e)
        return {
            "approved": False,
            "categories": {"hate": 1, "sexual": 0, "violence": 0, "self_harm": 0},
            "reason": "Azure Content Safety Error",
            "confidence": 0.0
        }
