import { Hono } from 'hono';
import { productController } from '../controllers/product.controller.js';

const productsRouter = new Hono();

productsRouter.get('/', productController.getProducts);
productsRouter.post('/', productController.createProduct);
productsRouter.get('/:product_id/', productController.getProductById);
productsRouter.patch('/:product_id/', productController.updateProduct);
productsRouter.delete('/:product_id/', productController.deleteProduct);
productsRouter.get('/:product_id/conversions', productController.getProductConversions);

export default productsRouter;