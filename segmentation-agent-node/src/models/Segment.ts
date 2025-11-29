export interface Segment {
  id?: number;
  name: string;
  description?: string;
  criteria: SegmentCriteria;
  customer_count?: number;
  ai_generated?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface SegmentCriteria {
  min_total_purchases?: number;
  max_total_purchases?: number;
  min_engagement_score?: number;
  max_engagement_score?: number;
  min_purchase_count?: number;
  max_purchase_count?: number;
  industries?: string[];
  countries?: string[];
  min_employee_count?: number;
  max_employee_count?: number;
  min_revenue?: number;
  max_revenue?: number;
  days_since_last_purchase?: number;
  days_since_created?: number;
  [key: string]: any;
}

export interface SegmentInput {
  name: string;
  description?: string;
  criteria: SegmentCriteria;
  ai_generated?: boolean;
}

export interface AISegmentSuggestion {
  name: string;
  description: string;
  criteria: SegmentCriteria;
  marketing_strategy: string;
  estimated_size_percentage: number;
}
