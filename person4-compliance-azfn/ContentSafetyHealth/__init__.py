import azure.functions as func
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps({
            "status": "ok",
            "service": "content-safety",
            "message": "content safety API is healthy"
        }),
        mimetype="application/json",
        status_code=200
    )
