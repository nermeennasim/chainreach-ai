from flask import Flask, request, jsonify
from datetime import datetime
import os

app = Flask(__name__)

# Simple request counter
request_count = 0

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "compliance-checker",
        "person": "Person 4",
        "version": "0.1.0-mock",
        "mode": "MOCK",
        "requests_processed": request_count,
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route('/validate', methods=['POST'])
def validate():
    """Mock validation endpoint - Day 2 version"""
    global request_count
    request_count += 1
    
    try:
        data = request.json
        
        # Validation
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
        
        # MOCK: Approve everything for now
        results = []
        for idx, msg in enumerate(messages):
            results.append({
                'message_id': idx,
                'text': msg[:100] + '...' if len(msg) > 100 else msg,
                'approved': True,
                'reason': '✅ MOCK: Auto-approved (real Azure coming Day 4)',
                'confidence': 1.0,
                'categories': {
                    'hate': 0,
                    'sexual': 0,
                    'violence': 0,
                    'self_harm': 0
                }
            })
        
        response = {
            'success': True,
            'results': results,
            'all_approved': True,
            'total_checked': len(messages),
            'mode': 'MOCK',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        print(f"✓ Validated {len(messages)} messages (MOCK)")
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
        'uptime': 'running'
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5004))
    print("=" * 60)
    print(f"🚀 Person 4: Compliance Checker")
    print(f"📍 Port: {port}")
    print(f"🔧 Mode: MOCK (real Azure coming Day 4)")
    print(f"🔗 URL: http://localhost:{port}")
    print("=" * 60)
    print("Endpoints:")
    print(f"  GET  http://localhost:{port}/health")
    print(f"  POST http://localhost:{port}/validate")
    print(f"  GET  http://localhost:{port}/stats")
    print("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=True)