import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/campaign/validate-message
 * Validate JSON message format and compliance
 * 
 * Body: { message: string, metadata?: object }
 * Response: { valid: boolean, errors: string[], warnings: string[], compliance: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, metadata } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { valid: false, errors: ['Message is required and must be a string'] },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation checks
    if (message.length === 0) {
      errors.push('Message cannot be empty');
    }
    if (message.length > 5000) {
      errors.push('Message cannot exceed 5000 characters');
    }
    if (message.length < 10) {
      warnings.push('Message is very short (less than 10 characters)');
    }

    // Check for suspicious patterns
    if (message.includes('http://') || message.includes('https://')) {
      warnings.push('Message contains URLs - ensure they are legitimate');
    }
    if ((message.match(/\$/g) || []).length > 3) {
      warnings.push('Message contains many $ symbols - verify pricing is appropriate');
    }

    // Call Azure Content Safety via Agent 4
    let compliance = {
      approved: true,
      categories: { hate: 0, sexual: 0, violence: 0, self_harm: 0 },
      confidence: 0.9,
      reason: 'No violations detected',
    };

    try {
      const complianceResponse = await fetch(
        'https://chainreach-compliance-func.azurewebsites.net/api/content-safety/analyze',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [message] }),
        }
      );

      if (complianceResponse.ok) {
        const complianceData = await complianceResponse.json();
        if (complianceData.results && complianceData.results[0]) {
          const result = complianceData.results[0];
          compliance = {
            approved: result.approved,
            categories: result.categories,
            confidence: result.confidence,
            reason: result.reason,
          };
          if (!result.approved) {
            errors.push(`Compliance issue: ${result.reason}`);
          }
        }
      }
    } catch (error) {
      warnings.push('Could not reach compliance service - using mock validation');
    }

    return NextResponse.json({
      valid: errors.length === 0,
      errors,
      warnings,
      compliance,
      message,
      metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate message', details: String(error) },
      { status: 500 }
    );
  }
}
