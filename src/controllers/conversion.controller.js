import { conversionService } from '../services/conversion.service.js';
import { idParamsSchema } from '../validators/crud.validator.js';
import logger from '../utils/logger.js';

export const conversionController = {
  async getConversions(c) {
    try {
      const limitStr = c.req.query('limit') || '10';
      const offsetStr = c.req.query('offset') || '0';

      const limit = parseInt(limitStr, 10);
      const offset = parseInt(offsetStr, 10);

      if (isNaN(limit) || limit < 1 || limit > 100) {
        return c.json({ error: 'Invalid limit. Must be between 1 and 100' }, 400);
      }
      if (isNaN(offset) || offset < 0) {
        return c.json({ error: 'Invalid offset. Must be 0 or greater' }, 400);
      }

      const conversions = await conversionService.getConversions({ limit, offset });
      return c.json(conversions);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch conversions' }, 500);
    }
  },

  async getConversionById(c) {
    let idStr;

    try {
      idStr = c.req.param('conversion_id');
      const validateParams = idParamsSchema.parse({ id: idStr });
      const conversionId = validateParams.id;

      const found = await conversionService.getConversionById(conversionId);
      if (!found) return c.json({ error: 'Conversion not found' }, 404);
      return c.json(found);
    } catch (error) {
      if (error.issue){
        return c.json({ error: 'Conversion id is invalid' }, 400);
      }
      logger.error({ err: error, conversionId: idStr }, 'Controller error: Failed to fetch conversion');
      return c.json({ error: 'Failed to fetch conversion' }, 500);
    }
  },

  async createConversion(c) {
    try {
      const body = await c.req.json();

      // Validate required fields
      if (!body.customerId || !body.productId) {
        return c.json({ error: 'customerId and productId are required' }, 400);
      }

      const customerId = parseInt(body.customerId, 10);
      const productId = parseInt(body.productId, 10);

      if (isNaN(customerId) || customerId < 1) {
        return c.json({ error: 'Invalid customerId' }, 400);
      }
      if (isNaN(productId) || productId < 1) {
        return c.json({ error: 'Invalid productId' }, 400);
      }

      body.customerId = customerId;
      body.productId = productId;

      const created = await conversionService.createConversion(body);
      return c.json(created, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create conversion' }, 500);
    }
  },

  async updateConversion(c) {
    let idStr;

    try {
      idStr = c.req.param('conversion_id');
      const validateParams = idParamsSchema.parse({ id: idStr });
      const conversionId = validateParams.id;

      const body = await c.req.json();

      // Validate IDs if present
      if (body.customerId !== undefined) {
        const customerId = parseInt(body.customerId, 10);
        if (isNaN(customerId) || customerId < 1) {
          return c.json({ error: 'Invalid customerId' }, 400);
        }
        body.customerId = customerId;
      }

      if (body.productId !== undefined) {
        const productId = parseInt(body.productId, 10);
        if (isNaN(productId) || productId < 1) {
          return c.json({ error: 'Invalid productId' }, 400);
        }
        body.productId = productId;
      }

      const updated = await conversionService.updateConversion(conversionId, body);
      if (!updated) return c.json({ error: 'Conversion not found' }, 404);
      return c.json(updated);
    } catch (error) {
      if (error.issue){
        return c.json({ error: 'Conversion id format is invalid' }, 400);
      }
      logger.error({ err: error, conversionId: idStr }, 'Controller error: Failed to fetch conversion');
      return c.json({ error: 'Failed to update conversion' }, 500);
    }
  },

  async deleteConversion(c) {
    let idStr;

    try {
      idStr = c.req.param('conversion_id');
      const validateParams = idParamsSchema.parse({ id: idStr });
      const conversionId = validateParams.id;

      const deleted = await conversionService.deleteConversion(conversionId);
      if (!deleted) return c.json({ error: 'Conversion not found' }, 404);
      return c.json({ success: true });
    } catch (error) {
      if (error.issues){
        return c.json({ error: 'Conversion id format id invalid' }, 400);
      }
      logger.error({ err: error, conversionId: idStr }, 'Controller errro: Failed to fetch conversion');
      return c.json({ error: 'Failed to delete conversion' }, 500);
    }
  },
};
