import logging
import azure.functions as func
import json
from datetime import datetime
from threading import Lock

request_count = 0
count_lock = Lock()

def main(req: func.HttpRequest) -> func.HttpResponse:
    global request_count

    with count_lock:
        request_count += 1

    response = {
        "status": "healthy",
        "service": "compliance-checker",
        "person": "Person 4",
        "version": "1.0.0-local",
        "mode": "LOCAL-MOCK",
        "requests_processed": request_count,
        "timestamp": datetime.utcnow().isoformat()
    }

    return func.HttpResponse(
        body=json.dumps(response),
        mimetype="application/json",
        status_code=200
    )
