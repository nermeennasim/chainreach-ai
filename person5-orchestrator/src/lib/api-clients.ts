/**
 * Mock API Clients for all 4 services
 * These will be replaced with real API calls when services are ready
 */

import type { 
  SegmentationRequest, 
  SegmentationResponse,
  ContentRequest,
  ContentResponse,
  GenerationRequest,
  GenerationResponse,
  ComplianceRequest,
  ComplianceResponse
} from '@/types';

const BASE_URLS = {
  segmentation: process.env.AGENT_1_URL || 'http://localhost:5001',
  content: process.env.AGENT_2_URL || 'http://localhost:5002',
  generation: process.env.AGENT_3_URL || 'http://localhost:5003',
  compliance: process.env.AGENT_4_URL || 'http://localhost:5004',
};

/**
 * Person 1: Segmentation Service (Port 5001)
 * POST /segment - Returns customer segment and traits
 */
export async function callSegmentationAPI(
  request: SegmentationRequest
): Promise<SegmentationResponse> {
  // Mock response for now
  await sleep(500);
  
  const segments = ['high-value', 'engaged', 'at-risk', 'new-customer'];
  const segment = segments[Math.floor(Math.random() * segments.length)];
  
  return {
    customerId: request.customerId,
    segment,
    traits: {
      purchaseFrequency: Math.random() > 0.5 ? 'high' : 'medium',
      engagementLevel: Math.random() > 0.5 ? 'active' : 'moderate',
      lifetimeValue: Math.floor(Math.random() * 10000),
      preferredChannel: ['email', 'sms', 'social'][Math.floor(Math.random() * 3)],
    },
    confidence: 0.85 + Math.random() * 0.15,
  };
  
  // Real API call (uncomment when service is ready):
  // const response = await fetch(`${BASE_URLS.segmentation}/segment`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
}

/**
 * Person 2: Content Service (Port 5002)
 * POST /retrieve - Returns content items for segment
 */
export async function callContentAPI(
  request: ContentRequest
): Promise<ContentResponse> {
  // Mock response
  await sleep(400);
  
  const templates = {
    email: [
      { id: 'e1', subject: 'Exclusive offer just for you!', body: 'Dear valued customer...' },
      { id: 'e2', subject: 'We miss you! Come back and save 20%', body: 'Hi there...' },
    ],
    sms: [
      { id: 's1', text: 'Flash sale! 30% off your favorites. Shop now!' },
      { id: 's2', text: 'Your exclusive discount code: SAVE20' },
    ],
    social: [
      { id: 'so1', platform: 'facebook', content: 'Check out our latest collection!' },
      { id: 'so2', platform: 'instagram', content: 'New arrivals are here!' },
    ],
  };
  
  const contentType = request.preferredChannel || 'email';
  const items = templates[contentType as keyof typeof templates] || templates.email;
  
  return {
    segment: request.segment,
    contentItems: items,
    totalItems: items.length,
  };
  
  // Real API call (uncomment when service is ready):
  // const response = await fetch(`${BASE_URLS.content}/retrieve`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
}

/**
 * Person 3: Generation Service (Port 5003)
 * POST /generate - Returns personalized messages
 */
export async function callGenerationAPI(
  request: GenerationRequest
): Promise<GenerationResponse> {
  // Mock response
  await sleep(600);
  
  const messages = request.templates.map((template: any, index: number) => ({
    templateId: template.id,
    personalizedContent: `Hi ${request.customerId}! ${template.subject || template.text || template.content} Personalized for ${request.segment} segment.`,
    variant: `variant-${String.fromCharCode(65 + index)}`,
    metadata: {
      tone: 'friendly',
      personalizationScore: 0.9,
    },
  }));
  
  return {
    customerId: request.customerId,
    messages,
    generatedAt: new Date().toISOString(),
  };
  
  // Real API call (uncomment when service is ready):
  // const response = await fetch(`${BASE_URLS.generation}/generate`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
}

/**
 * Person 4: Compliance Service (Port 5004)
 * POST /validate - Approves or rejects messages
 */
export async function callComplianceAPI(
  request: ComplianceRequest
): Promise<ComplianceResponse> {
  // Mock response
  await sleep(300);
  
  // 90% approval rate for mock
  const approved = Math.random() > 0.1;
  
  return {
    messageId: request.messageId,
    approved,
    issues: approved ? [] : ['Contains prohibited terms', 'Missing disclaimer'],
    suggestions: approved ? [] : ['Add unsubscribe link', 'Review compliance guidelines'],
    checkedAt: new Date().toISOString(),
  };
  
  // Real API call (uncomment when service is ready):
  // const response = await fetch(`${BASE_URLS.compliance}/validate`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
}

/**
 * Helper function to simulate API delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
