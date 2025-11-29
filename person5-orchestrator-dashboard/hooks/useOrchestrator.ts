/**
 * ChainReach AI - Campaign Orchestration Hook
 * Manages 5-agent workflow state and execution
 */

'use client';

import { useState, useCallback } from 'react';
import { CampaignState, AgentStatus, ComplianceResult, Customer } from '@/lib/types/campaign';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_CONFIG } from '@/lib/api/config';
import { getCustomers, getSegments, type Segment } from '@/lib/api/segmentation';
import { searchContent, type SearchResponse } from '@/lib/api/rag';

const initialAgentState: AgentStatus[] = [
  { agent_id: 1, agent_name: 'Segmentation', status: 'waiting', progress: 0 },
  { agent_id: 2, agent_name: 'Content Retrieval', status: 'waiting', progress: 0 },
  { agent_id: 3, agent_name: 'Message Generation', status: 'waiting', progress: 0 },
  { agent_id: 4, agent_name: 'Compliance Check', status: 'waiting', progress: 0 },
  { agent_id: 5, agent_name: 'Send Orchestration', status: 'waiting', progress: 0 },
];

export function useOrchestrator() {
  const [campaignState, setCampaignState] = useState<CampaignState>({
    campaign_id: `CAMP-${Date.now()}`,
    status: 'idle',
    agents: initialAgentState,
    results: [],
  });

  const updateAgentStatus = useCallback((
    agentId: number,
    updates: Partial<AgentStatus>
  ) => {
    setCampaignState((prev) => ({
      ...prev,
      agents: prev.agents.map((agent) =>
        agent.agent_id === agentId
          ? { ...agent, ...updates }
          : agent
      ),
    }));
  }, []);

  const validateMessages = async (messages: string[]): Promise<{
    results: Array<{
      status: 'APPROVED' | 'REJECTED';
      safety_scores: {
        hate: number;
        violence: number;
        sexual: number;
        self_harm: number;
      };
      reason: string;
    }>;
  }> => {
    try {
      const response = await axios.post(
        API_CONFIG.agent4.url,
        { messages },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );

      // Validate and ensure response has required structure
      if (!response.data || !response.data.results) {
        throw new Error('Invalid response format from compliance API');
      }

      // Ensure each result has required fields with fallbacks
      const validatedResults = response.data.results.map((result: any, index: number) => ({
        status: result?.status || 'REJECTED',
        safety_scores: result?.safety_scores || {
          hate: 0,
          violence: 0,
          sexual: 0,
          self_harm: 0
        },
        reason: result?.reason || 'No reason provided'
      }));

      return { results: validatedResults };
    } catch (error: any) {
      console.error('Compliance validation error:', error);
      throw new Error(`Compliance check failed: ${error.message}`);
    }
  };

  const startCampaign = useCallback(async (customerData: Customer[]) => {
    if (campaignState.status === 'running') {
      toast.error('Campaign already running');
      return;
    }

    setCampaignState({
      campaign_id: `CAMP-${Date.now()}`,
      status: 'running',
      agents: initialAgentState,
      results: [],
    });

    toast.success('Campaign started!');

    try {
      // AGENT 1: Customer Segmentation
      updateAgentStatus(1, { status: 'processing', progress: 10 });
      toast.loading('Agent 1: Loading segments and customers...', { id: 'agent1' });

      try {
        // Get real segments from Agent 1
        const realSegments = await getSegments();
        
        // Get real customers from Agent 1
        const customersData = await getCustomers(100, 0); // Get first 100 customers
        const realCustomers = customersData.customers;

        const segments = realSegments.map((segment: Segment) => ({
          segment_id: `seg_${segment.id}`,
          segment_name: segment.name,
          customer_count: segment.customer_count,
          customers: realCustomers.slice(0, Math.min(100, realCustomers.length))
        }));

        updateAgentStatus(1, { status: 'done', progress: 100, data: segments.length });
        toast.success(`Agent 1: Loaded ${segments.length} segments with ${realCustomers.length} customers!`, { id: 'agent1' });
        
        // Use real customers for rest of pipeline
        const activeCustomers = realCustomers.slice(0, 10); // Use first 10 for demo
      } catch (error: any) {
        console.error('Agent 1 error:', error);
        updateAgentStatus(1, { status: 'error', progress: 0 });
        toast.error(`Agent 1 failed: ${error.message}`, { id: 'agent1' });
        
        // Fall back to sample data
        const segments = [
          {
            segment_id: 'high_value',
            segment_name: 'High Value Customers',
            customer_count: customerData.length,
            customers: customerData.slice(0, 100)
          }
        ];
        updateAgentStatus(1, { status: 'done', progress: 100, data: segments.length });
        toast.success('Agent 1: Using sample data (API unavailable)', { id: 'agent1' });
      }

      // AGENT 2: Content Retrieval (MOCKED)
      updateAgentStatus(2, { status: 'processing', progress: 10 });
      toast.loading('Agent 2: Retrieving templates (MOCKED)...', { id: 'agent2' });

      try {
        // Call mock Agent 2 endpoint for content retrieval
        const response = await fetch('/api/agents/agent-2-content-retrieval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'enterprise solutions',
            limit: 5,
          }),
        });

        if (!response.ok) {
          throw new Error(`Mock Agent 2 returned ${response.status}`);
        }

        const data = await response.json();
        const templates = data.results || [];

        updateAgentStatus(2, { status: 'done', progress: 100, data: templates.length });
        toast.success(`Agent 2 (MOCKED): Retrieved ${templates.length} templates!`, { id: 'agent2' });
      } catch (error: any) {
        console.error('Agent 2 mock error:', error);
        updateAgentStatus(2, { status: 'error', progress: 0 });
        toast.error(`Agent 2 failed: ${error.message}`, { id: 'agent2' });
        
        // Fall back to default templates
        const templates = [
          {
            template_id: 'TEMP001',
            template_name: 'Premium Launch',
            subject: 'Exclusive offer for you',
            body: 'Hi there, we have something special for you...',
            approved_date: new Date().toISOString(),
            approval_status: 'APPROVED',
            tags: ['premium', 'launch']
          }
        ];
        updateAgentStatus(2, { status: 'done', progress: 100, data: templates.length });
        toast.success('Agent 2: Using fallback templates', { id: 'agent2' });
      }

      // AGENT 3: Content Generation (MOCKED)
      updateAgentStatus(3, { status: 'processing', progress: 10 });
      toast.loading('Agent 3: Generating variants (MOCKED)...', { id: 'agent3' });

      try {
        // Use real customers from Agent 1 or sample data
        const testCustomers = customerData.slice(0, 10);

        // Call mock Agent 3 endpoint for message generation
        const response = await fetch('/api/agents/agent-3-message-generation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customers: testCustomers,
            template_id: 'default',
            segment: 'general',
            variants_per_customer: 3,
          }),
        });

        if (!response.ok) {
          throw new Error(`Mock Agent 3 returned ${response.status}`);
        }

        const data = await response.json();
        const allMessages = data.variants?.map((v: any) => v.message) || [];
        const variantMapping = data.variants || [];

        updateAgentStatus(3, { status: 'done', progress: 100, data: allMessages.length });
        toast.success(`Agent 3 (MOCKED): Generated ${allMessages.length} variants!`, { id: 'agent3' });
      } catch (error: any) {
        console.error('Agent 3 mock error:', error);
        updateAgentStatus(3, { status: 'error', progress: 0 });
        toast.error(`Agent 3 failed: ${error.message}`, { id: 'agent3' });
        
        // Fall back to sample variants
        const testCustomers = customerData.slice(0, 10);
        const allMessages: string[] = [];
        const variantMapping: Array<{
          customer_id: string;
          variant_id: string;
          message: string;
        }> = [];

        testCustomers.forEach((customer, idx) => {
          for (let v = 1; v <= 3; v++) {
            const variantId = `VAR${String(idx + 1).padStart(3, '0')}_${String.fromCharCode(64 + v)}`;
            const message = `Hi ${customer.name || 'Customer'}, exclusive offer just for you! Variant ${v}`;
            
            allMessages.push(message);
            variantMapping.push({
              customer_id: customer.customer_id || `CUST${String(idx + 1).padStart(3, '0')}`,
              variant_id: variantId,
              message: message
            });
          }
        });

        updateAgentStatus(3, { status: 'done', progress: 100, data: allMessages.length });
        toast.success('Agent 3: Using fallback variants', { id: 'agent3' });
      }

      // AGENT 4: Compliance Validation
      updateAgentStatus(4, { status: 'processing', progress: 20 });
      toast.loading('Agent 4: Running compliance checks...', { id: 'agent4' });

      const complianceResponse = await validateMessages(allMessages);
      
      // Map compliance results back to customers
      const complianceResults: ComplianceResult[] = complianceResponse.results.map((result, idx) => {
        const mapping = variantMapping[idx];
        return {
          variant_id: mapping.variant_id,
          customer_id: mapping.customer_id,
          status: result.status || 'REJECTED',
          safety_scores: result.safety_scores || {
            hate: 0,
            violence: 0,
            sexual: 0,
            self_harm: 0
          },
          selected_for_sending: result.status === 'APPROVED',
          reason: result.reason || 'No reason provided',
          timestamp: new Date().toISOString()
        };
      });

      const approvedCount = complianceResults.filter(r => r.status === 'APPROVED').length;
      const rejectedCount = complianceResults.filter(r => r.status === 'REJECTED').length;

      updateAgentStatus(4, { status: 'done', progress: 100, data: complianceResults.length });
      toast.success(
        `Agent 4: ${approvedCount} approved, ${rejectedCount} rejected`,
        { id: 'agent4' }
      );

      // AGENT 5: Would send messages (simulated)
      updateAgentStatus(5, { status: 'done', progress: 100, data: approvedCount });

      // Update final state with stats
      const stats = {
        total_customers: testCustomers.length,
        total_variants: allMessages.length,
        approved_count: approvedCount,
        rejected_count: rejectedCount,
        approval_rate: (approvedCount / allMessages.length) * 100,
      };

      setCampaignState((prev) => ({
        ...prev,
        status: 'completed',
        results: complianceResults,
        stats,
        completed_at: new Date().toISOString(),
      }));

      toast.success('🎉 Campaign orchestration complete!');

    } catch (error: any) {
      console.error('Campaign orchestration error:', error);
      
      setCampaignState((prev) => ({
        ...prev,
        status: 'error'
      }));

      toast.error(`Campaign failed: ${error.message}`);
    }
  }, [campaignState.status, updateAgentStatus]);

  const resetCampaign = useCallback(() => {
    setCampaignState({
      campaign_id: `CAMP-${Date.now()}`,
      status: 'idle',
      agents: initialAgentState,
      results: [],
    });
    toast.success('Campaign reset');
  }, []);

  return {
    campaignState,
    startCampaign,
    resetCampaign,
    isRunning: campaignState.status === 'running',
    isCompleted: campaignState.status === 'completed',
  };
}
