import { Router } from 'express';
import segmentController from '../controllers/segmentController';

const router = Router();

// AI-powered segmentation
router.post('/segment/analyze', segmentController.analyzeCustomers);

// Segment CRUD operations
router.get('/segments', segmentController.listSegments);
router.get('/segments/:id', segmentController.getSegment);
router.post('/segments', segmentController.createSegment);

// Utilities
router.post('/segment/refresh', segmentController.refreshSegmentation);
router.post('/segments/:id/generate-message', segmentController.generateMessage);
router.post('/segment/calculate-engagement', segmentController.calculateEngagement);

export default router;
