import { Request, Response, NextFunction } from 'express';
import segmentService from '../services/segmentService';
import aiService from '../services/aiService';
import db from '../config/database';
import { Segment, SegmentInput } from '../models/Segment';
import { Customer } from '../models/Customer';
import { isAIEnabled } from '../config/azure';

class SegmentController {
  /**
   * POST /api/segment/analyze - AI-powered customer segmentation
   */
  async analyzeCustomers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isAIEnabled()) {
        res.status(503).json({
          success: false,
          error: 'AI features are not available. Please configure Azure OpenAI credentials.',
        });
        return;
      }

      // Get all customers (limit for performance)
      const customersResult = await db.query<Customer>(
        'SELECT * FROM customers LIMIT 1000'
      );
      const customers = customersResult.rows;

      if (customers.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No customers found in database. Please import customer data first.',
        });
        return;
      }

      // Get existing segments
      const segmentsResult = await db.query<Segment>('SELECT * FROM segments');
      const existingSegments = segmentsResult.rows;

      // Use AI to suggest new segments
      const suggestedSegments = await aiService.analyzeCustomersForSegmentation(
        customers,
        existingSegments
      );

      res.json({
        success: true,
        data: {
          customersAnalyzed: customers.length,
          suggestedSegments,
          message: 'AI analysis complete. Use POST /api/segments to create these segments.',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/segments - List all segments
   */
  async listSegments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await db.query<Segment & { actual_customer_count: number }>(`
        SELECT s.*, 
               COUNT(c.id)::int as actual_customer_count
        FROM segments s
        LEFT JOIN customers c ON c.segment_id = s.id
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/segments/:id - Get segment details
   */
  async getSegment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const segmentResult = await db.query<Segment>(
        'SELECT * FROM segments WHERE id = $1',
        [id]
      );

      if (segmentResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Segment not found',
        });
        return;
      }

      const customers = await segmentService.getSegmentCustomers(
        parseInt(id),
        limit,
        offset
      );

      res.json({
        success: true,
        data: {
          segment: segmentResult.rows[0],
          customers,
          pagination: {
            limit,
            offset,
            total: segmentResult.rows[0].customer_count || 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/segments - Create new segment
   */
  async createSegment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, criteria, ai_generated = false }: SegmentInput = req.body;

      if (!name || !criteria) {
        res.status(400).json({
          success: false,
          error: 'Name and criteria are required',
        });
        return;
      }

      const result = await db.query<Segment>(
        `INSERT INTO segments (name, description, criteria, ai_generated)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, description || null, JSON.stringify(criteria), ai_generated]
      );

      const newSegment = result.rows[0];

      // Apply segmentation immediately
      const applyResult = await segmentService.applySegmentation(newSegment.id!);

      res.status(201).json({
        success: true,
        data: {
          segment: newSegment,
          applied: applyResult,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/segment/refresh - Re-run segmentation for all segments
   */
  async refreshSegmentation(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // First, reset all customer segments
      await db.query(
        'UPDATE customers SET segment_id = NULL, segment_name = NULL, segment_confidence = NULL'
      );

      const segmentsResult = await db.query<Segment>('SELECT id FROM segments ORDER BY id');
      const results = [];

      for (const segment of segmentsResult.rows) {
        const result = await segmentService.applySegmentation(segment.id!);
        results.push(result);
      }

      res.json({
        success: true,
        data: {
          message: 'Segmentation refreshed for all segments',
          results,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/segments/:id/generate-message - Generate marketing message
   */
  async generateMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isAIEnabled()) {
        res.status(503).json({
          success: false,
          error: 'AI features are not available',
        });
        return;
      }

      const { id } = req.params;
      const { campaignType = 'email' } = req.body;

      const segmentResult = await db.query<Segment>(
        'SELECT * FROM segments WHERE id = $1',
        [id]
      );

      if (segmentResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Segment not found',
        });
        return;
      }

      const segment = segmentResult.rows[0];
      const message = await aiService.generateSegmentMessage(segment, campaignType);

      res.json({
        success: true,
        data: {
          segment: segment.name,
          campaignType,
          message,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/segment/calculate-engagement - Calculate engagement scores
   */
  async calculateEngagement(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await segmentService.updateAllEngagementScores();

      res.json({
        success: true,
        data: {
          customersUpdated: updated,
          message: 'Engagement scores calculated for all customers',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SegmentController();
