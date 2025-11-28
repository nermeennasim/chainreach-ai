// Flexible AI Client - Works with both Azure OpenAI and OpenAI
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Detect which service to use
const useAzure = process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY;
const useOpenAI = process.env.OPENAI_API_KEY;

let aiClient: OpenAI | null = null;
let modelName = 'gpt-3.5-turbo';

if (useAzure) {
  // Azure OpenAI
  console.log('✅ Using Azure OpenAI');
  aiClient = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
  });
  modelName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-35-turbo';
} else if (useOpenAI) {
  // Standard OpenAI
  console.log('✅ Using OpenAI');
  aiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  modelName = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
} else {
  console.log('⚠️  No AI service configured');
}

export const isAIAvailable = () => aiClient !== null;
export const getModelName = () => modelName;

export async function generateAISegments(customerSummary: string, existingSegments: string[]): Promise<any[]> {
  if (!aiClient) {
    throw new Error('AI service not configured. Please set OPENAI_API_KEY or Azure OpenAI credentials.');
  }

  const prompt = `You are an expert marketing analyst. Analyze customer data and suggest 3-5 optimal customer segments.

Customer Data Summary:
${customerSummary}

Existing Segments:
${existingSegments.join(', ') || 'None'}

Suggest NEW segments (different from existing) that would be valuable for targeted marketing.

For each segment provide:
1. name: Short descriptive name (e.g., "High-Value Tech Buyers")
2. description: Why this segment matters for marketing
3. criteria: Specific rules (min_total_purchases, min_engagement_score, industries, etc.)
4. marketing_strategy: How to market to this segment
5. estimated_size_percentage: Estimated % of customers

Return ONLY a valid JSON array. Example:
[
  {
    "name": "Premium Enterprise Customers",
    "description": "Large companies with consistent high-value purchases",
    "criteria": {
      "min_total_purchases": 10000,
      "min_engagement_score": 70,
      "min_purchase_count": 10
    },
    "marketing_strategy": "Offer dedicated account managers and premium support packages",
    "estimated_size_percentage": 12
  }
]`;

  try {
    const response = await aiClient.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: 'You are an AI marketing analyst. Always return valid JSON arrays only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '[]';
    
    // Clean markdown formatting if present
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/, '').replace(/```\n?$/, '');
    }
    
    const segments = JSON.parse(jsonStr);
    return Array.isArray(segments) ? segments : [segments];
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

export async function generateMarketingMessage(segmentName: string, segmentDescription: string): Promise<string> {
  if (!aiClient) {
    throw new Error('AI service not configured');
  }

  const prompt = `Create a personalized marketing email message for customers in this segment:

Segment: ${segmentName}
Description: ${segmentDescription}

Create a compelling, professional marketing message (200-300 words) that:
1. Addresses their specific needs
2. Highlights relevant benefits
3. Includes a clear call-to-action
4. Uses a warm, professional tone

Return only the message text, no subject line or extra formatting.`;

  try {
    const response = await aiClient.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: 'You are a professional marketing copywriter specializing in B2B communications.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Message generation error:', error);
    throw error;
  }
}

export { aiClient };
