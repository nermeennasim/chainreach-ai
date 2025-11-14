from flask import Flask, request, jsonify
from datetime import datetime
from azure.ai.contentsafety import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
import os

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Azure Content Safety configuration
endpoint = os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT")
key = os.getenv("AZURE_CONTENT_SAFETY_KEY")

if not endpoint or not key:
    raise ValueError("ERROR: Missing Azure Content Safety endpoint or key in environment variables.")

cs_client = ContentSafetyClient(endpoint, AzureKeyCredential(key))

# Simple request counter
request_count = 0


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "compliance-checker",
        "person": "Person 4",
        "version": "1.0.0-azure",
        "mode": "AZURE",
        "requests_processed": request_count,
        "timestamp": datetime.utcnow().isoformat()
    })


@app.route('/validate', methods=['POST'])
def validate():
    """Validation endpoint using Azure Content Safety"""
    global request_count
    request_count += 1

    try:
        data = request.json

        # Input validation
        if not data or 'messages' not in data:
            return jsonify({
                'error': 'Missing required field: messages',
                'example': {'messages': ['text1', 'text2']}
            }), 400

        messages = data.get('messages', [])

        if not isinstance(messages, list):
            return jsonify({'error': 'messages must be an array'}), 400

        if len(messages) == 0:
            return jsonify({'error': 'messages array cannot be empty'}), 400

        # Process each message using Azure Content Safety
        results = []

        for idx, msg in enumerate(messages):
            try:
                analysis = cs_client.text.analyze_text(
                    AnalyzeTextOptions(text=msg)
                )

                categories = {
                    "hate": analysis.hate_result.severity if analysis.hate_result else 0,
                    "sexual": analysis.sexual_result.severity if analysis.sexual_result else 0,
                    "violence": analysis.violence_result.severity if analysis.violence_result else 0,
                    "self_harm": analysis.self_harm_result.severity if analysis.self_harm_result else 0
                }

                # Approval rule (threshold: < 2 = low severity)
                approved = all(v < 2 for v in categories.values())

                results.append({
                    "message_id": idx,
                    "text": msg,
                    "approved": approved,
                    "reason": "Evaluated using Azure Content Safety",
                    "confidence": 1.0,
                    "categories": categories
                })

            except Exception as e:
                results.append({
                    "message_id": idx,
                    "text": msg,
                    "approved": False,
                    "reason": f"Azure error: {str(e)}",
                    "categories": {}
                })

        response = {
            "success": True,
            "results": results,
            "all_approved": all(r["approved"] for r in results),
            "total_checked": len(messages),
            "mode": "AZURE",
            "timestamp": datetime.utcnow().isoformat()
        }

        print(f"✓ Checked {len(messages)} messages using Azure")
        return jsonify(response)

    except Exception as e:
        print(f"✗ Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/stats', methods=['GET'])
def stats():
    """Simple stats endpoint"""
    return jsonify({
        'total_requests': request_count,
        'service': 'compliance-checker',
        'mode': 'AZURE',
        'uptime': 'running'
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5004))
    print("=" * 60)
    print(f"🚀 Person 4: Compliance Checker (Azure Mode)")
    print(f"📍 Port: {port}")
    print(f"🔧 Mode: AZURE")
    print(f"🔗 URL: http://localhost:{port}")
    print("=" * 60)
    print("Endpoints:")
    print(f"  GET  http://localhost:{port}/health")
    print(f"  POST http://localhost:{port}/validate")
    print(f"  GET  http://localhost:{port}/stats")
    print("=" * 60)

    app.run(host='0.0.0.0', port=port, debug=True)
