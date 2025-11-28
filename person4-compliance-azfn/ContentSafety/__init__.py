import azure.functions as func
import json
from shared.contentsafety import analyze_message

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON"}),
            mimetype="application/json",
            status_code=400
        )

    messages = body.get("messages")

    if not messages or not isinstance(messages, list):
        return func.HttpResponse(
            json.dumps({
                "error": "messages must be a non-empty array",
                "example": {"messages": ["text1", "text2"]}
            }),
            mimetype="application/json",
            status_code=400
        )

    results = []
    for i, text in enumerate(messages):
        analysis = analyze_message(text)
        results.append({
            "id": i,
            "text": text,
            "approved": analysis["approved"],
            "reason": analysis["reason"],
            "confidence": analysis["confidence"],
            "categories": analysis["categories"]
        })

    return func.HttpResponse(
        json.dumps({
            "success": True,
            "total": len(results),
            "all_approved": all(r["approved"] for r in results),
            "results": results
        }),
        mimetype="application/json",
        status_code=200
    )
