def analyze_message(text: str):
    # Mock analyzer for local/offline testing
    return {
        "approved": True,
        "categories": {
            "hate": 0,
            "sexual": 0,
            "violence": 0,
            "self_harm": 0
        },
        "reason": "Mock evaluation - LOCAL",
        "confidence": 1.0
    }
