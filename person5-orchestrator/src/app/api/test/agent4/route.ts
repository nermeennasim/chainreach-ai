/**
 * GET /api/test/agent4
 * 
 * Test Agent 4 connectivity and functionality
 */

import { NextResponse } from 'next/server';
import { ComplianceAgentClient } from '@/lib/agents/agent-4-compliance';

export async function GET() {
  const results: any = {
    agent: 'Agent 4 - Compliance',
    url: process.env.AGENT_4_URL || 'Not configured',
    tests: [],
  };

  const agent4 = new ComplianceAgentClient();

  // Test 1: Health Check
  try {
    const isHealthy = await agent4.healthCheck();
    results.tests.push({
      test: 'Health Check (/Health)',
      status: isHealthy ? 'PASSED ✅' : 'FAILED ❌',
      success: isHealthy,
    });
  } catch (error: any) {
    results.tests.push({
      test: 'Health Check (/Health)',
      status: 'FAILED ❌',
      success: false,
      error: error.message,
    });
  }

  // Test 2: Content Safety Health
  try {
    const isHealthy = await agent4.contentSafetyHealthCheck();
    results.tests.push({
      test: 'Content Safety Health (/content-safety/health)',
      status: isHealthy ? 'PASSED ✅' : 'FAILED ❌',
      success: isHealthy,
    });
  } catch (error: any) {
    results.tests.push({
      test: 'Content Safety Health (/content-safety/health)',
      status: 'FAILED ❌',
      success: false,
      error: error.message,
    });
  }

  // Test 3: Message Analysis
  try {
    const testMessages = [
      'Welcome to ChainReach! Your summer sale is here.',
      'I hate you',
    ];

    const analysisResults = await agent4.analyzeMessages(testMessages);
    
    results.tests.push({
      test: 'Message Analysis (/content-safety/analyze)',
      status: 'PASSED ✅',
      success: true,
      data: {
        total: analysisResults.results.length,
        safe: analysisResults.results.filter(r => r.is_safe).length,
        unsafe: analysisResults.results.filter(r => !r.is_safe).length,
        results: analysisResults.results,
      },
    });
  } catch (error: any) {
    results.tests.push({
      test: 'Message Analysis (/content-safety/analyze)',
      status: 'FAILED ❌',
      success: false,
      error: error.message,
    });
  }

  // Test 4: Validate Messages
  try {
    const mockAgent3Output = {
      customer_id: 'TEST_CUST_123',
      message_variants: [
        {
          variant_id: 'var-1',
          template_id: 'tmpl-1',
          content: 'Thank you for your purchase!',
          tone: 'friendly',
          channel: 'email',
        },
        {
          variant_id: 'var-2',
          template_id: 'tmpl-1',
          content: 'I hate your service!',
          tone: 'aggressive',
          channel: 'email',
        },
      ],
      generated_at: new Date().toISOString(),
    };

    const validationResults = await agent4.validate(mockAgent3Output);

    results.tests.push({
      test: 'Validate Messages (/validate or fallback)',
      status: 'PASSED ✅',
      success: true,
      data: {
        customer_id: validationResults.customer_id,
        total_checked: validationResults.total_checked,
        approved: validationResults.total_approved,
        rejected: validationResults.total_rejected,
        message: validationResults.message,
        approved_messages: validationResults.approved_messages,
        rejected_messages: validationResults.rejected_messages,
      },
    });
  } catch (error: any) {
    results.tests.push({
      test: 'Validate Messages (/validate or fallback)',
      status: 'FAILED ❌',
      success: false,
      error: error.message,
    });
  }

  // Test 5: Stats
  try {
    const stats = await agent4.getStats();
    results.tests.push({
      test: 'Get Stats (/Stats)',
      status: 'PASSED ✅',
      success: true,
      data: stats,
    });
  } catch (error: any) {
    results.tests.push({
      test: 'Get Stats (/Stats)',
      status: 'FAILED ❌',
      success: false,
      error: error.message,
    });
  }

  // Summary
  const passedTests = results.tests.filter((t: any) => t.success).length;
  const totalTests = results.tests.length;

  results.summary = {
    passed: passedTests,
    failed: totalTests - passedTests,
    total: totalTests,
    success_rate: `${Math.round((passedTests / totalTests) * 100)}%`,
  };

  return NextResponse.json(results, { 
    status: passedTests === totalTests ? 200 : 207 // 207 = Multi-Status
  });
}
