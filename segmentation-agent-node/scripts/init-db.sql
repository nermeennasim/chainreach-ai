-- ChainReach AI - Customer Segmentation Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS segments CASCADE;

-- Create segments table
CREATE TABLE segments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL,
    customer_count INTEGER DEFAULT 0,
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    industry VARCHAR(100),
    revenue DECIMAL(15, 2),
    employee_count INTEGER,
    location VARCHAR(255),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Purchase behavior
    total_purchases DECIMAL(15, 2) DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    avg_purchase_value DECIMAL(15, 2) DEFAULT 0,
    last_purchase_date TIMESTAMP,
    products_purchased TEXT[],
    
    -- Engagement metrics
    email_opens INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    website_visits INTEGER DEFAULT 0,
    engagement_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Segmentation
    segment_id INTEGER,
    segment_name VARCHAR(100),
    segment_confidence DECIMAL(5, 2),
    
    -- Custom attributes (JSON for flexibility)
    custom_attributes JSONB,
    
    -- Foreign key
    CONSTRAINT fk_segment FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_segment ON customers(segment_id);
CREATE INDEX idx_customers_industry ON customers(industry);
CREATE INDEX idx_customers_country ON customers(country);
CREATE INDEX idx_customers_engagement ON customers(engagement_score);
CREATE INDEX idx_customers_total_purchases ON customers(total_purchases);
CREATE INDEX idx_customers_last_purchase ON customers(last_purchase_date);
CREATE INDEX idx_segments_name ON segments(name);

-- Note: Triggers commented out for simpler deployment
-- You can manually update timestamps in application code

-- Insert default segments
INSERT INTO segments (name, description, criteria, ai_generated) VALUES
('High Value Customers', 
 'Customers with high purchase value and strong engagement', 
 '{"min_total_purchases": 10000, "min_engagement_score": 75}'::jsonb, 
 false),

('At Risk', 
 'Previously active customers who haven''t engaged recently', 
 '{"days_since_last_purchase": 90, "max_engagement_score": 30}'::jsonb, 
 false),

('New Customers', 
 'Recently acquired customers in their first 30 days', 
 '{"days_since_created": 30}'::jsonb, 
 false),

('VIP Enterprise', 
 'Large enterprise organizations with significant spending', 
 '{"min_employee_count": 1000, "min_revenue": 50000}'::jsonb, 
 false),

('Engaged SMB', 
 'Small/medium businesses with high engagement', 
 '{"max_employee_count": 999, "min_engagement_score": 60, "min_purchase_count": 5}'::jsonb, 
 false);

-- Create a view for segment analytics
CREATE OR REPLACE VIEW segment_analytics AS
SELECT 
    s.id,
    s.name,
    s.description,
    COUNT(c.id) as customer_count,
    COALESCE(SUM(c.total_purchases), 0) as total_revenue,
    COALESCE(AVG(c.total_purchases), 0) as avg_customer_value,
    COALESCE(AVG(c.engagement_score), 0) as avg_engagement_score,
    COALESCE(AVG(c.purchase_count), 0) as avg_purchase_frequency
FROM segments s
LEFT JOIN customers c ON c.segment_id = s.id
GROUP BY s.id, s.name, s.description;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '✅ Created % default segments', (SELECT COUNT(*) FROM segments);
    RAISE NOTICE '📊 Ready to import customer data';
END $$;
