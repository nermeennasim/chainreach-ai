import azure.functions as func
import json
from datetime import datetime
from shared.contentsafety import analyze_message
from threading import Lock
import logging
import os

logger = logging.getLogger("validate")

request_count = 0
count_lock = Lock()

def main(req: func.HttpRequest) -> func.HttpResponse:
    global request_count

    with count_lock:
        request_count += 1

    try:
        body = req.get_json()
    except:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON"}),
            mimetype="application/json",
            status_code=400
        )

    if "messages" not in body:
        return func.HttpResponse(
            json.dumps({
                "error": "Missing required field: messages",
                "example": {"messages": ["text1", "text2"]}
            }),
            mimetype="application/json",
            status_code=400
        )

    messages = body["messages"]

    if not isinstance(messages, list) or len(messages) == 0:
        return func.HttpResponse(
            json.dumps({"error": "messages must be a non-empty array"}),
            mimetype="application/json",
            status_code=400
        )

    results = []
    for i, text in enumerate(messages):
        analysis = analyze_message(text)
        results.append({
            "message_id": i,
            "text": text,
            "approved": analysis["approved"],
            "reason": analysis["reason"],
            "confidence": analysis["confidence"],
            "categories": analysis["categories"]
        })

    response = {
        "success": True,
        "results": results,
        "all_approved": all(r["approved"] for r in results),
        "total_checked": len(results),
        "mode": "AZURE" if os.environ.get("AZURE_CONTENT_SAFETY_KEY") else "LOCAL-MOCK",
        "timestamp": datetime.utcnow().isoformat()
    }

    return func.HttpResponse(
        body=json.dumps(response),
        mimetype="application/json",
        status_code=200
    )
