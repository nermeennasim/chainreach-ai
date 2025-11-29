import db from '../config/database';
import { Segment } from '../models/Segment';
import { Customer } from '../models/Customer';

class SegmentService {
  /**
   * Apply segmentation rules to customers
   */
  async applySegmentation(segmentId: number): Promise<{ segmentId: number; segmentName: string; customersUpdated: number }> {
    try {
      // Get segment criteria
      const segmentResult = await db.query<Segment>(
        'SELECT * FROM segments WHERE id = $1',
        [segmentId]
      );

      if (segmentResult.rows.length === 0) {
        throw new Error('Segment not found');
      }

      const segment = segmentResult.rows[0];
      const criteria = segment.criteria;

      // Build dynamic SQL query based on criteria
      const whereConditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (criteria.min_total_purchases !== undefined) {
        whereConditions.push(`total_purchases >= $${paramIndex}`);
        params.push(criteria.min_total_purchases);
        paramIndex++;
      }

      if (criteria.max_total_purchases !== undefined) {
        whereConditions.push(`total_purchases <= $${paramIndex}`);
        params.push(criteria.max_total_purchases);
        paramIndex++;
      }

      if (criteria.min_engagement_score !== undefined) {
        whereConditions.push(`engagement_score >= $${paramIndex}`);
        params.push(criteria.min_engagement_score);
        paramIndex++;
      }

      if (criteria.max_engagement_score !== undefined) {
        whereConditions.push(`engagement_score <= $${paramIndex}`);
        params.push(criteria.max_engagement_score);
        paramIndex++;
      }

      if (criteria.min_purchase_count !== undefined) {
        whereConditions.push(`purchase_count >= $${paramIndex}`);
        params.push(criteria.min_purchase_count);
        paramIndex++;
      }

      if (criteria.industries && criteria.industries.length > 0) {
        whereConditions.push(`industry = ANY($${paramIndex})`);
        params.push(criteria.industries);
        paramIndex++;
      }

      if (criteria.countries && criteria.countries.length > 0) {
        whereConditions.push(`country = ANY($${paramIndex}`);
        params.push(criteria.countries);
        paramIndex++;
      }

      if (criteria.min_employee_count !== undefined) {
        whereConditions.push(`employee_count >= $${paramIndex}`);
        params.push(criteria.min_employee_count);
        paramIndex++;
      }

      if (criteria.min_revenue !== undefined) {
        whereConditions.push(`revenue >= $${paramIndex}`);
        params.push(criteria.min_revenue);
        paramIndex++;
      }

      if (criteria.days_since_last_purchase !== undefined) {
        whereConditions.push(
          `last_purchase_date < NOW() - INTERVAL '${criteria.days_since_last_purchase} days'`
        );
      }

      if (criteria.days_since_created !== undefined) {
        whereConditions.push(
          `created_at >= NOW() - INTERVAL '${criteria.days_since_created} days'`
        );
      }

      // Update customers matching criteria
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const updateQuery = `
        UPDATE customers
        SET segment_id = $${paramIndex}, 
            segment_name = $${paramIndex + 1},
            segment_confidence = 95.0,
            updated_at = NOW()
        ${whereClause}
        RETURNING id
      `;

      params.push(segmentId, segment.name);

      const result = await db.query(updateQuery, params);

      // Update segment customer count
      await db.query(
        'UPDATE segments SET customer_count = $1, updated_at = NOW() WHERE id = $2',
        [result.rows.length, segmentId]
      );

      return {
        segmentId,
        segmentName: segment.name,
        customersUpdated: result.rows.length,
      };
    } catch (error) {
      console.error('Segmentation error:', error);
      throw error;
    }
  }

  /**
   * Get customers in a specific segment
   */
  async getSegmentCustomers(segmentId: number, limit: number = 100, offset: number = 0): Promise<Customer[]> {
    const result = await db.query<Customer>(
      `SELECT * FROM customers 
       WHERE segment_id = $1 
       ORDER BY engagement_score DESC, total_purchases DESC
       LIMIT $2 OFFSET $3`,
      [segmentId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Calculate engagement score for a customer
   */
  calculateEngagementScore(customer: Customer): number {
    let score = 0;

    // Purchase frequency (0-30 points)
    const purchaseCount = customer.purchase_count || 0;
    score += Math.min((purchaseCount / 10) * 30, 30);

    // Email engagement (0-25 points)
    const emailOpens = customer.email_opens || 0;
    const emailClicks = customer.email_clicks || 0;
    const emailRate = emailOpens > 0 ? emailClicks / emailOpens : 0;
    score += emailRate * 25;

    // Website visits (0-20 points)
    const websiteVisits = customer.website_visits || 0;
    score += Math.min((websiteVisits / 20) * 20, 20);

    // Recency (0-25 points)
    if (customer.last_purchase_date) {
      const daysSincePurchase = 
        (Date.now() - new Date(customer.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(25 - (daysSincePurchase / 365) * 25, 0);
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Update engagement scores for all customers
   */
  async updateAllEngagementScores(): Promise<number> {
    const customersResult = await db.query<Customer>('SELECT * FROM customers');
    const customers = customersResult.rows;

    let updated = 0;

    for (const customer of customers) {
      const score = this.calculateEngagementScore(customer);
      await db.query(
        'UPDATE customers SET engagement_score = $1, updated_at = NOW() WHERE id = $2',
        [score, customer.id]
      );
      updated++;
    }

    return updated;
  }
}

export default new SegmentService();
