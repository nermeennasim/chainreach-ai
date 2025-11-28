import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { Customer, CustomerInput } from '../models/Customer';
import segmentService from '../services/segmentService';

class CustomerController {
  /**
   * GET /api/customers - List all customers
   */
  async listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const industry = req.query.industry as string;
      const segmentId = req.query.segment_id as string;

      let query = 'SELECT * FROM customers WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (industry) {
        query += ` AND industry = $${paramIndex}`;
        params.push(industry);
        paramIndex++;
      }

      if (segmentId) {
        query += ` AND segment_id = $${paramIndex}`;
        params.push(parseInt(segmentId));
        paramIndex++;
      }

      query += ` ORDER BY engagement_score DESC, total_purchases DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query<Customer>(query, params);

      // Get total count
      const countResult = await db.query('SELECT COUNT(*)::int as total FROM customers');
      const total = countResult.rows[0].total;

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customers/:id - Get customer by ID
   */
  async getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await db.query<Customer>(
        'SELECT * FROM customers WHERE id = $1 OR customer_id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/customers - Create new customer
   */
  async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerData: CustomerInput = req.body;

      if (!customerData.name || !customerData.email) {
        res.status(400).json({
          success: false,
          error: 'Name and email are required',
        });
        return;
      }

      // Generate customer_id if not provided
      const customerId = customerData.customer_id || `CUST-${Date.now()}`;

      const result = await db.query<Customer>(
        `INSERT INTO customers (
          customer_id, name, email, phone, company, industry,
          revenue, employee_count, location, country,
          total_purchases, purchase_count, email_opens, email_clicks, website_visits,
          custom_attributes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          customerId,
          customerData.name,
          customerData.email,
          customerData.phone || null,
          customerData.company || null,
          customerData.industry || null,
          customerData.revenue || 0,
          customerData.employee_count || 0,
          customerData.location || null,
          customerData.country || null,
          customerData.total_purchases || 0,
          customerData.purchase_count || 0,
          customerData.email_opens || 0,
          customerData.email_clicks || 0,
          customerData.website_visits || 0,
          customerData.custom_attributes ? JSON.stringify(customerData.custom_attributes) : null,
        ]
      );

      // Calculate engagement score
      const customer = result.rows[0];
      const engagementScore = segmentService.calculateEngagementScore(customer);

      await db.query(
        'UPDATE customers SET engagement_score = $1 WHERE id = $2',
        [engagementScore, customer.id]
      );

      customer.engagement_score = engagementScore;

      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      if ((error as any).code === '23505') { // Unique constraint violation
        res.status(409).json({
          success: false,
          error: 'Customer with this email already exists',
        });
        return;
      }
      next(error);
    }
  }

  /**
   * PUT /api/customers/:id - Update customer
   */
  async updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates: Partial<CustomerInput> = req.body;

      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'customer_id') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No fields to update',
        });
        return;
      }

      fields.push('updated_at = NOW()');
      values.push(id);

      const query = `
        UPDATE customers 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex} OR customer_id = $${paramIndex}
        RETURNING *
      `;

      const result = await db.query<Customer>(query, values);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/customers/:id - Delete customer
   */
  async deleteCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM customers WHERE id = $1 OR customer_id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();
