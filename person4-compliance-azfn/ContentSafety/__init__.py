import azure.functions as func
import json
import logging
from shared.contentsafety import analyze_message

logger = logging.getLogger("content-safety")

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        logger.info("Received request")
        body = req.get_json()
        logger.info(f"Request body: {body}")
    except Exception as e:
        logger.error(f"JSON parse error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON", "details": str(e)}),
            mimetype="application/json",
            status_code=400
        )

    messages = body.get("messages")

    if not messages or not isinstance(messages, list):
        logger.error(f"Invalid messages: {messages}")
        return func.HttpResponse(
            json.dumps({
                "error": "messages must be a non-empty array",
                "example": {"messages": ["text1", "text2"]}
            }),
            mimetype="application/json",
            status_code=400
        )

    results = []
    try:
        for i, text in enumerate(messages):
            logger.info(f"Analyzing message {i}: {text[:50]}...")
            analysis = analyze_message(text)
            results.append({
                "id": i,
                "text": text,
                "approved": analysis["approved"],
                "reason": analysis["reason"],
                "confidence": analysis["confidence"],
                "categories": analysis["categories"]
            })
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}", exc_info=True)
        return func.HttpResponse(
            json.dumps({
                "error": "Analysis failed",
                "details": str(e),
                "message": "Check Azure Content Safety credentials or service status"
            }),
            mimetype="application/json",
            status_code=500
        )

    try:
        response_body = json.dumps({
            "success": True,
            "total": len(results),
            "all_approved": all(r["approved"] for r in results),
            "results": results
        })
        logger.info(f"Returning {len(results)} results")
        return func.HttpResponse(
            response_body,
            mimetype="application/json",
            status_code=200
        )
    except Exception as e:
        logger.error(f"Response serialization error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Response serialization failed", "details": str(e)}),
            mimetype="application/json",
            status_code=500
        )
