export interface Customer {
  id?: number;
  customer_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  revenue?: number;
  employee_count?: number;
  location?: string;
  country?: string;
  created_at?: Date;
  updated_at?: Date;
  
  // Purchase behavior
  total_purchases?: number;
  purchase_count?: number;
  avg_purchase_value?: number;
  last_purchase_date?: Date;
  products_purchased?: string[];
  
  // Engagement metrics
  email_opens?: number;
  email_clicks?: number;
  website_visits?: number;
  engagement_score?: number;
  
  // Segmentation
  segment_id?: number;
  segment_name?: string;
  segment_confidence?: number;
  
  // Custom attributes
  custom_attributes?: Record<string, any>;
}

export interface CustomerInput {
  customer_id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  revenue?: number;
  employee_count?: number;
  location?: string;
  country?: string;
  total_purchases?: number;
  purchase_count?: number;
  email_opens?: number;
  email_clicks?: number;
  website_visits?: number;
  custom_attributes?: Record<string, any>;
}
