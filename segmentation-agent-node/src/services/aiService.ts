import { client, deploymentName, isAIEnabled } from '../config/azure';
import { Customer } from '../models/Customer';
import { Segment, AISegmentSuggestion } from '../models/Segment';

class AIService {
  /**
   * Analyze customers and suggest segments using Azure OpenAI
   */
  async analyzeCustomersForSegmentation(
    customers: Customer[],
    existingSegments: Segment[] = []
  ): Promise<AISegmentSuggestion[]> {
    if (!isAIEnabled() || !client) {
      throw new Error('Azure OpenAI is not configured. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY.');
    }

    try {
      const customerSummary = this.prepareCustomerSummary(customers);
      
      const prompt = `You are an expert marketing analyst. Analyze the following customer data and suggest optimal customer segments for targeted marketing campaigns.

Customer Data Summary:
${customerSummary}

Existing Segments:
${existingSegments.map(s => `- ${s.name}: ${s.description}`).join('\n') || 'None'}

Please suggest 3-5 distinct customer segments that would be valuable for marketing campaigns. For each segment, provide:
1. Segment Name (short and descriptive)
2. Description (why this segment matters for marketing)
3. Criteria (specific rules to identify customers)
4. Recommended Marketing Strategy
5. Estimated segment size percentage

Return ONLY a JSON array with this exact structure (no markdown, no explanation):
[
  {
    "name": "High-Value Tech Buyers",
    "description": "Technology companies with high engagement and purchase history",
    "criteria": {
      "min_total_purchases": 5000,
      "min_engagement_score": 60,
      "industries": ["Technology", "Software"]
    },
    "marketing_strategy": "Premium product offerings with enterprise support packages",
    "estimated_size_percentage": 15
  }
]`;

      const messages = [
        { role: 'system', content: 'You are an AI marketing analyst specializing in B2B customer segmentation. Always return valid JSON arrays only.' },
        { role: 'user', content: prompt }
      ];

      const result = await client.getChatCompletions(deploymentName, messages, {
        maxTokens: 2000,
        temperature: 0.7,
      });

      const response = result.choices[0]?.message?.content || '[]';
      const segments = this.parseAIResponse(response);
      
      return segments;
    } catch (error) {
      console.error('AI segmentation error:', error);
      throw new Error(`Failed to analyze customers with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate personalized marketing message for a segment
   */
  async generateSegmentMessage(segment: Segment, campaignType: string = 'email'): Promise<string> {
    if (!isAIEnabled() || !client) {
      throw new Error('Azure OpenAI is not configured');
    }

    try {
      const prompt = `Create a personalized marketing message for the following customer segment:

Segment: ${segment.name}
Description: ${segment.description}
Campaign Type: ${campaignType}
Target Audience Size: ${segment.customer_count || 'Unknown'} customers

Generate a compelling marketing message with:
1. Subject line (for email) or headline
2. Main message body (150-200 words)
3. Strong call-to-action
4. Tone: Professional yet engaging

Make it specific to this segment and campaign type.`;

      const messages = [
        { role: 'system', content: 'You are an expert marketing copywriter specializing in B2B campaigns.' },
        { role: 'user', content: prompt }
      ];

      const result = await client.getChatCompletions(deploymentName, messages, {
        maxTokens: 500,
        temperature: 0.8,
      });

      return result.choices[0]?.message?.content || 'Failed to generate message';
    } catch (error) {
      console.error('Message generation error:', error);
      throw new Error('Failed to generate marketing message');
    }
  }

  private prepareCustomerSummary(customers: Customer[]): string {
    const stats = {
      total: customers.length,
      avgPurchaseValue: this.average(customers.map(c => c.total_purchases || 0)),
      avgEngagement: this.average(customers.map(c => c.engagement_score || 0)),
      avgPurchaseCount: this.average(customers.map(c => c.purchase_count || 0)),
      industries: [...new Set(customers.map(c => c.industry).filter(Boolean))],
      countries: [...new Set(customers.map(c => c.country).filter(Boolean))],
      companiesWithRevenue: customers.filter(c => c.revenue && c.revenue > 0).length,
    };

    return `
Total Customers: ${stats.total}
Average Purchase Value: $${stats.avgPurchaseValue.toFixed(2)}
Average Purchase Count: ${stats.avgPurchaseCount.toFixed(1)} orders
Average Engagement Score: ${stats.avgEngagement.toFixed(2)}%
Companies with Revenue Data: ${stats.companiesWithRevenue}
Industries Represented: ${stats.industries.slice(0, 10).join(', ')}${stats.industries.length > 10 ? '...' : ''}
Countries: ${stats.countries.slice(0, 10).join(', ')}${stats.countries.length > 10 ? '...' : ''}
    `.trim();
  }

  private parseAIResponse(response: string): AISegmentSuggestion[] {
    try {
      // Remove markdown code blocks if present
      let jsonString = response.trim();
      const jsonMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      
      // Parse JSON
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to parse AI response:', response);
      throw new Error('Invalid AI response format - expected JSON array');
    }
  }

  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
}

export default new AIService();
