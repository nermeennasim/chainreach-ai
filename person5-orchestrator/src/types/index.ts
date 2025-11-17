/**
 * Type Definitions
 * 
 * Comprehensive TypeScript type definitions for the entire application.
 */

// ============================================================================
// ORCHESTRATION & CAMPAIGN TYPES
// ============================================================================

export interface CampaignRequest {
  customerIds: string[];
  campaignName: string;
  description?: string;
}

export interface CampaignResult {
  customerId: string;
  segment: string;
  traits: CustomerTraits;
  assignedVariant: string;
  messagePreview: string;
  approved: boolean;
  complianceIssues?: string[];
  processingTime: number;
}

export interface CampaignSummary {
  totalCustomers: number;
  processedCustomers: number;
  approvedCount: number;
  rejectedCount: number;
  successRate: number;
  averageProcessingTime: number;
  results: CampaignResult[];
}

// ============================================================================
// SERVICE API TYPES (Ports 5001-5004)
// ============================================================================

// Person 1: Segmentation Service (Port 5001)
export interface SegmentationRequest {
  customerId: string;
  customerData?: Record<string, any>;
}

export interface SegmentationResponse {
  customerId: string;
  segment: string;
  traits: CustomerTraits;
  confidence: number;
}

export interface CustomerTraits {
  purchaseFrequency: string;
  engagementLevel: string;
  lifetimeValue: number;
  preferredChannel: string;
}

// Person 2: Content Service (Port 5002)
export interface ContentRequest {
  segment: string;
  preferredChannel?: string;
}

export interface ContentResponse {
  segment: string;
  contentItems: ContentItem[];
  totalItems: number;
}

export interface ContentItem {
  id: string;
  subject?: string;
  body?: string;
  text?: string;
  content?: string;
  platform?: string;
}

// Person 3: Generation Service (Port 5003)
export interface GenerationRequest {
  customerId: string;
  segment: string;
  templates: ContentItem[];
  traits?: CustomerTraits;
}

export interface GenerationResponse {
  customerId: string;
  messages: GeneratedMessage[];
  generatedAt: string;
}

export interface GeneratedMessage {
  templateId: string;
  personalizedContent: string;
  variant: string;
  metadata: {
    tone: string;
    personalizationScore: number;
  };
}

// Person 4: Compliance Service (Port 5004)
export interface ComplianceRequest {
  messageId: string;
  content: string;
  channel: string;
  customerId: string;
}

export interface ComplianceResponse {
  messageId: string;
  approved: boolean;
  issues: string[];
  suggestions: string[];
  checkedAt: string;
}

// ============================================================================
// ORIGINAL TYPES (keeping for compatibility)
// ============================================================================

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  targetAudience?: TargetAudience;
  workflow?: WorkflowConfig;
  metrics?: CampaignMetrics;
}

export type CampaignStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'active' 
  | 'paused' 
  | 'completed' 
  | 'cancelled';

export interface TargetAudience {
  demographics?: Demographics;
  interests?: string[];
  behaviors?: string[];
  customSegments?: string[];
}

export interface Demographics {
  ageRange?: [number, number];
  gender?: 'male' | 'female' | 'all';
  location?: string[];
  language?: string[];
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpa: number; // Cost per acquisition
  roi: number; // Return on investment
}

// Workflow Types
export interface WorkflowConfig {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  triggers?: WorkflowTrigger[];
  conditions?: WorkflowCondition[];
}

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  config: Record<string, any>;
  agentId?: string;
  nextSteps?: string[];
}

export type WorkflowStepType = 
  | 'api_call' 
  | 'data_transform' 
  | 'agent_execute' 
  | 'conditional' 
  | 'delay' 
  | 'parallel';

export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event';
  config: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface WorkflowStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep?: string;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  url: string;
  status: 'online' | 'offline' | 'error';
  capabilities: string[];
}

export type AgentType = 
  | 'content_generation' 
  | 'compliance_check' 
  | 'data_analysis' 
  | 'workflow_automation';

// Analytics Types
export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  data: DataPoint[];
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface DashboardMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalConversions: number;
  averageROI: number;
  trendsData: AnalyticsData;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface CampaignFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  targetAudience: TargetAudience;
}

// User Types (if needed)
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  createdAt: Date;
}
