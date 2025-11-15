import json
import azure.functions as func
from threading import Lock

request_count = 0
count_lock = Lock()

def main(req: func.HttpRequest) -> func.HttpResponse:
    global request_count

    response = {
        "total_requests": request_count,
        "service": "compliance-checker",
        "mode": "AZURE",
        "uptime": "running"
    }

    return func.HttpResponse(
        body=json.dumps(response),
        mimetype="application/json",
        status_code=200
    )
