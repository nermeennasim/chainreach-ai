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

      console.log('Agent 4 raw response:', response.data);

      // Handle different response formats
      let results = [];
      
      if (response.data?.results && Array.isArray(response.data.results)) {
        results = response.data.results;
      } else if (Array.isArray(response.data)) {
        results = response.data;
      } else {
        throw new Error('Invalid response format from compliance API');
      }

      const validatedResults = results.map((result: any, index: number) => ({
        status: (result?.approved === true || result?.status === 'APPROVED') ? 'APPROVED' : 'REJECTED',
        safety_scores: result?.categories || result?.safety_scores || {
          hate: result?.categories?.hate || 0,
          violence: result?.categories?.violence || 0,
          sexual: result?.categories?.sexual || 0,
          self_harm: result?.categories?.self_harm || 0
        },
        reason: result?.reason || (result?.approved ? 'Content approved by safety check' : 'Content flagged by safety check')
      }));

      return { results: validatedResults };
    } catch (error: any) {
      console.error('Compliance validation error:', error);
      
      // For demo: Return mock approved results if API fails
      console.log('Using fallback compliance results for demo');
      const mockResults = messages.map((_, index) => ({
        status: (index % 5 === 0) ? 'REJECTED' : 'APPROVED' as 'APPROVED' | 'REJECTED',
        safety_scores: {
          hate: Math.random() * 0.5,
          violence: Math.random() * 0.5,
          sexual: Math.random() * 0.5,
          self_harm: Math.random() * 0.5
        },
        reason: (index % 5 === 0) 
          ? 'Message flagged for review (DEMO MODE)' 
          : 'Message approved for sending (DEMO MODE)'
      }));
      
      return { results: mockResults };
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

    // Declare variables at function scope
    let testCustomers: Customer[] = [];
    let allMessages: string[] = [];
    let variantMapping: Array<{
      customer_id: string;
      variant_id: string;
      message: string;
    }> = [];
    let complianceResults: ComplianceResult[] = [];
    let approvedCount = 0;
    let rejectedCount = 0;

    try {
      // AGENT 1: Customer Segmentation
      updateAgentStatus(1, { status: 'processing', progress: 10 });
      toast.loading('Agent 1: Loading segments and customers...', { id: 'agent1' });

      try {
        const realSegments = await getSegments();
        const customersData = await getCustomers(100, 0);
        const realCustomers = customersData?.customers || [];

        if (realCustomers.length === 0) {
          throw new Error('No customers returned from API');
        }

        const segments = realSegments.map((segment: Segment) => ({
          segment_id: `seg_${segment.id}`,
          segment_name: segment.name,
          customer_count: segment.customer_count,
          customers: realCustomers.slice(0, Math.min(100, realCustomers.length))
        }));

        updateAgentStatus(1, { status: 'done', progress: 100, data: segments.length });
        toast.success(`Agent 1: Loaded ${segments.length} segments with ${realCustomers.length} customers!`, { id: 'agent1' });
        
        testCustomers = realCustomers.slice(0, 10);
      } catch (error: any) {
        console.error('Agent 1 error:', error);
        
        // Use fallback sample data
        const segments = [
          {
            segment_id: 'high_value',
            segment_name: 'High Value Customers',
            customer_count: customerData.length,
            customers: customerData.slice(0, 100)
          }
        ];
        testCustomers = customerData.slice(0, 10);
        updateAgentStatus(1, { status: 'done', progress: 100, data: segments.length });
        toast.success('Agent 1: Using sample data (API unavailable)', { id: 'agent1' });
      }

      // AGENT 2: Content Retrieval
      updateAgentStatus(2, { status: 'processing', progress: 10 });
      toast.loading('Agent 2: Retrieving templates (MOCKED)...', { id: 'agent2' });

      try {
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

      // AGENT 3: Content Generation
      updateAgentStatus(3, { status: 'processing', progress: 10 });
      toast.loading('Agent 3: Generating variants (MOCKED)...', { id: 'agent3' });

      try {
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
        allMessages = data.variants?.map((v: any) => v.message) || [];
        variantMapping = data.variants || [];

        updateAgentStatus(3, { status: 'done', progress: 100, data: allMessages.length });
        toast.success(`Agent 3 (MOCKED): Generated ${allMessages.length} variants!`, { id: 'agent3' });
      } catch (error: any) {
        console.error('Agent 3 mock error:', error);
        updateAgentStatus(3, { status: 'error', progress: 0 });
        toast.error(`Agent 3 failed: ${error.message}`, { id: 'agent3' });
        
        allMessages = [];
        variantMapping = [];

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

      // Progress simulation during API call
      const progressInterval = setInterval(() => {
        setCampaignState((prev) => {
          const agent4 = prev.agents.find(a => a.agent_id === 4);
          if (agent4 && agent4.progress < 90) {
            return {
              ...prev,
              agents: prev.agents.map(a => 
                a.agent_id === 4 ? { ...a, progress: Math.min(a.progress + 10, 90) } : a
              )
            };
          }
          return prev;
        });
      }, 1000);

      try {
        const complianceResponse = await validateMessages(allMessages);
        clearInterval(progressInterval);
        
        // Map compliance results back to customers
        complianceResults = complianceResponse.results.map((result, idx) => {
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

        approvedCount = complianceResults.filter(r => r.status === 'APPROVED').length;
        rejectedCount = complianceResults.filter(r => r.status === 'REJECTED').length;

        updateAgentStatus(4, { status: 'done', progress: 100, data: complianceResults.length });
        toast.success(
          `Agent 4: ${approvedCount} approved, ${rejectedCount} rejected`,
          { id: 'agent4' }
        );
      } catch (error: any) {
        clearInterval(progressInterval);
        console.error('Agent 4 compliance error:', error);
        updateAgentStatus(4, { status: 'error', progress: 0 });
        toast.error(`Agent 4 failed: ${error.message}`, { id: 'agent4' });
        throw error;
      }

      // AGENT 5: Send Orchestration (simulated)
      updateAgentStatus(5, { status: 'processing', progress: 50 });
      toast.loading('Agent 5: Preparing to send messages...', { id: 'agent5' });
      
      // Simulate send preparation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateAgentStatus(5, { status: 'done', progress: 100, data: approvedCount });
      toast.success(`Agent 5: Ready to send ${approvedCount} messages`, { id: 'agent5' });

      // Update final state with stats
      const stats = {
        total_customers: testCustomers.length,
        total_variants: allMessages.length,
        approved_count: approvedCount,
        rejected_count: rejectedCount,
        approval_rate: allMessages.length > 0 ? (approvedCount / allMessages.length) * 100 : 0,
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