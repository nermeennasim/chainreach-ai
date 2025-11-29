import { Router } from 'express';
import customerController from '../controllers/customerController';

const router = Router();

router.get('/customers', customerController.listCustomers);
router.get('/customers/:id', customerController.getCustomer);
router.post('/customers', customerController.createCustomer);
router.put('/customers/:id', customerController.updateCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);

export default router;
