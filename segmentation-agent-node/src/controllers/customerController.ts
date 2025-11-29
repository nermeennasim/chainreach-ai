import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { Customer, CustomerInput } from '../models/Customer';
import segmentService from '../services/segmentService';

class CustomerController {
  /**
   * Helper method to parse ID and determine query type
   */
  private parseId(id: string): { isNumeric: boolean; parsedId: number | string } {
    const isNumeric = /^\d+$/.test(id);
    return {
      isNumeric,
      parsedId: isNumeric ? parseInt(id) : id
    };
  }
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

      const { isNumeric, parsedId } = this.parseId(id);
      
      const result = isNumeric 
        ? await db.query<Customer>(
            'SELECT * FROM customers WHERE id = $1',
            [parsedId]
          )
        : await db.query<Customer>(
            'SELECT * FROM customers WHERE customer_id = $1',
            [parsedId]
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
   * Internal method to create a customer and return the result
   * Used by both createCustomer API endpoint and bulkGenerateCustomers
   */
  private async _createCustomerInternal(customerData: CustomerInput): Promise<Customer> {
    if (!customerData.name || !customerData.email) {
      throw new Error('Name and email are required');
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

    return customer;
  }

  /**
   * POST /api/customers - Create new customer
   */
  async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerData: CustomerInput = req.body;
      const customer = await this._createCustomerInternal(customerData);

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
      if ((error as Error).message === 'Name and email are required') {
        res.status(400).json({
          success: false,
          error: (error as Error).message,
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

      const { isNumeric, parsedId } = this.parseId(id);
      values.push(parsedId);
      const whereClause = isNumeric ? `id = $${paramIndex}` : `customer_id = $${paramIndex}`;
      
      const query = `
        UPDATE customers 
        SET ${fields.join(', ')}
        WHERE ${whereClause}
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

      const { isNumeric, parsedId } = this.parseId(id);
      
      const result = isNumeric
        ? await db.query(
            'DELETE FROM customers WHERE id = $1 RETURNING id',
            [parsedId]
          )
        : await db.query(
            'DELETE FROM customers WHERE customer_id = $1 RETURNING id',
            [parsedId]
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

  /**
   * POST /api/customers/bulk/generate - Generate N sample customers
   */
  async bulkGenerateCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { count = 25 } = req.body;

      if (!count || count < 1 || count > 10000) {
        res.status(400).json({
          success: false,
          error: 'Count must be between 1 and 10000',
        });
        return;
      }

      // Sample data variations for realistic generation
      const industries = [
        'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
        'Pharmaceuticals', 'Energy', 'Telecommunications', 'Media', 'Insurance'
      ];

      const locations = [
        'New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Boston',
        'Seattle', 'Austin', 'Denver', 'Miami', 'Atlanta'
      ];

      const companies = [
        'Tech Solutions Inc', 'Global Finance Corp', 'Health Systems LLC', 'Retail Group', 'Factory Pro',
        'Pharma Research', 'Energy Solutions', 'Telecom Global', 'Media Holdings', 'Insurance Plus'
      ];

      const generateCustomer = (index: number) => {
        const industry = industries[Math.floor(Math.random() * industries.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        const employees = Math.floor(Math.random() * 5000) + 25;
        const purchases = Math.floor(Math.random() * 500000) + 5000;
        const score = Math.floor(Math.random() * 100);

        return {
          customer_id: `CUST-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          name: `Customer ${index + 1}`,
          email: `customer${index + 1}+${Date.now()}@example.com`,
          phone: `+1-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          company: `${company} ${index}`,
          industry,
          revenue: purchases * (Math.random() * 3 + 1),
          employee_count: employees,
          location,
          country: 'USA',
          total_purchases: purchases,
          purchase_count: Math.floor(Math.random() * 50) + 1,
          email_opens: Math.floor(Math.random() * 200),
          email_clicks: Math.floor(Math.random() * 100),
          website_visits: Math.floor(Math.random() * 500),
        };
      };

      const createdCustomers: Customer[] = [];
      const errors: any[] = [];

      // Create customers in batches of 10 for better performance
      const batchSize = 10;
      for (let i = 0; i < count; i += batchSize) {
        const batchPromises = [];
        for (let j = 0; j < batchSize && (i + j) < count; j++) {
          const customerData = generateCustomer(i + j);
          const promise = this._createCustomerInternal(customerData)
            .then((customer) => {
              createdCustomers.push(customer);
            })
            .catch((error) => {
              errors.push({ 
                customer_id: customerData.customer_id, 
                error: error.message || 'Failed to create customer' 
              });
            });
          batchPromises.push(promise);
        }
        await Promise.all(batchPromises);
      }

      res.status(201).json({
        success: true,
        message: `Generated ${createdCustomers.length} customers`,
        data: {
          created: createdCustomers.length,
          failed: errors.length,
          total_requested: count,
          customers: createdCustomers,
          errors: errors.length > 0 ? errors.slice(0, 5) : undefined, // Show first 5 errors
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();
