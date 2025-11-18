import { Hono } from 'hono';
import { conversionController } from '../controllers/conversion.controller.js';

const conversionRouter = new Hono();

conversionRouter.get('/', conversionController.getConversions);
conversionRouter.post('/', conversionController.createConversion);
conversionRouter.get('/:conversion_id/', conversionController.getConversionById);
conversionRouter.patch('/:conversion_id/', conversionController.updateConversion);
conversionRouter.delete('/:conversion_id/', conversionController.deleteConversion);

export default conversionRouter;