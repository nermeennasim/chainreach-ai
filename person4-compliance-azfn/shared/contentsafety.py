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
        logger.info("Azure Content Safety client initialized")
    except Exception as e:
        logger.error("Failed to initialize Azure Content Safety client: %s", e)
else:
    logger.warning("Azure Content Safety KEY or ENDPOINT missing - running mock mode.")

def analyze_message(text: str):
    """
    Analyze text using Azure Content Safety.
    Fallback to mock if client not initialized.
    """
    global client

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

        # ✅ Compatible with SDK terbaru
        categories = getattr(result, "categories", {})
        category_scores = {
            "hate": categories.get("hate", 0),
            "sexual": categories.get("sexual", 0),
            "violence": categories.get("violence", 0),
            "self_harm": categories.get("self_harm", 0)
        }

        approved = all(value < 2 for value in category_scores.values())

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
