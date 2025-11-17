/**
 * Core Orchestrator Module
 * 
 * This module orchestrates the full campaign pipeline across all 4 services:
 * 1. Segmentation (Person 1) - Identify customer segment
 * 2. Content (Person 2) - Retrieve relevant content templates  
 * 3. Generation (Person 3) - Generate personalized messages
 * 4. Compliance (Person 4) - Validate messages for compliance
 */

import type { CampaignRequest, CampaignResult, CampaignSummary } from '@/types';
import {
  callSegmentationAPI,
  callContentAPI,
  callGenerationAPI,
  callComplianceAPI,
} from './api-clients';

export class Orchestrator {
  /**
   * Run a complete campaign for multiple customers
   */
  async runCampaign(request: CampaignRequest): Promise<CampaignSummary> {
    const results: CampaignResult[] = [];
    const startTime = Date.now();

    for (const customerId of request.customerIds) {
      try {
        const result = await this.processCustomer(customerId);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process customer ${customerId}:`, error);
        // Continue with next customer
      }
    }

    const approvedCount = results.filter((r) => r.approved).length;
    const rejectedCount = results.length - approvedCount;
    const totalProcessingTime = Date.now() - startTime;

    return {
      totalCustomers: request.customerIds.length,
      processedCustomers: results.length,
      approvedCount,
      rejectedCount,
      successRate: (approvedCount / results.length) * 100,
      averageProcessingTime: totalProcessingTime / results.length,
      results,
    };
  }

  /**
   * Process a single customer through the entire pipeline
   */
  private async processCustomer(customerId: string): Promise<CampaignResult> {
    const customerStartTime = Date.now();

    // Step 1: Segmentation (Person 1)
    const segmentation = await callSegmentationAPI({ customerId });

    // Step 2: Content Retrieval (Person 2)
    const content = await callContentAPI({
      segment: segmentation.segment,
      preferredChannel: segmentation.traits.preferredChannel,
    });

    // Step 3: Message Generation (Person 3)
    const generation = await callGenerationAPI({
      customerId,
      segment: segmentation.segment,
      templates: content.contentItems,
      traits: segmentation.traits,
    });

    // Step 4: Compliance Check (Person 4)
    const firstMessage = generation.messages[0];
    const compliance = await callComplianceAPI({
      messageId: `${customerId}-${firstMessage.variant}`,
      content: firstMessage.personalizedContent,
      channel: segmentation.traits.preferredChannel,
      customerId,
    });

    const processingTime = Date.now() - customerStartTime;

    return {
      customerId,
      segment: segmentation.segment,
      traits: segmentation.traits,
      assignedVariant: firstMessage.variant,
      messagePreview: firstMessage.personalizedContent.substring(0, 100) + '...',
      approved: compliance.approved,
      complianceIssues: compliance.issues,
      processingTime,
    };
  }
}

export const orchestrator = new Orchestrator();
