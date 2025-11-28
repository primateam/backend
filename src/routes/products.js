import { Hono } from 'hono';
import { productController } from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { idempotencyMiddleware } from '../middleware/idempotencyMiddleware.js';

const productsRouter = new Hono();
const accessPermission = authMiddleware(['admin', 'manager']);

productsRouter.get('/', productController.getProducts);
productsRouter.post('/', idempotencyMiddleware(), accessPermission, productController.createProduct);
productsRouter.get('/:product_id/', productController.getProductById);
productsRouter.patch('/:product_id/', accessPermission, productController.updateProduct);
productsRouter.delete('/:product_id/', accessPermission, productController.deleteProduct);
productsRouter.get('/:product_id/conversions', productController.getProductConversions);

export default productsRouter;