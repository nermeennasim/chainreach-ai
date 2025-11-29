import { Router } from 'express';
import customerController from '../controllers/customerController';

const router = Router();

router.get('/customers', (req, res, next) => customerController.listCustomers(req, res, next));
router.get('/customers/:id', (req, res, next) => customerController.getCustomer(req, res, next));
router.post('/customers', (req, res, next) => customerController.createCustomer(req, res, next));
router.post('/customers/bulk/generate', (req, res, next) => customerController.bulkGenerateCustomers(req, res, next));
router.put('/customers/:id', (req, res, next) => customerController.updateCustomer(req, res, next));
router.delete('/customers/:id', (req, res, next) => customerController.deleteCustomer(req, res, next));

export default router;
