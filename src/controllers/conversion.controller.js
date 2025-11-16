import { conversionService } from '../services/conversion.service.js';

export const conversionController = {
  async getConversions(c) {
    try {
      const { limit = '10', offset = '0' } = c.req.query();
      const conversions = await conversionService.getConversions({ limit: Number(limit), offset: Number(offset) });
      return c.json(conversions);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch conversions' }, 500);
    }
  },

  async getConversionById(c) {
    try {
      const idStr = c.req.param('conversion_id');
      const conversionId = Number(idStr);
      if (!conversionId) return c.json({ error: 'Invalid conversion_id' }, 400);
      const found = await conversionService.getConversionById(conversionId);
      if (!found) return c.json({ error: 'Conversion not found' }, 404);
      return c.json(found);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch conversion' }, 500);
    }
  },

  async createConversion(c) {
    try {
      const body = await c.req.json();
      const created = await conversionService.createConversion(body);
      return c.json(created, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create conversion' }, 500);
    }
  },

  async updateConversion(c) {
    try {
      const idStr = c.req.param('conversion_id');
      const conversionId = Number(idStr);
      if (!conversionId) return c.json({ error: 'Invalid conversion_id' }, 400);
      const body = await c.req.json();
      const updated = await conversionService.updateConversion(conversionId, body);
      if (!updated) return c.json({ error: 'Conversion not found' }, 404);
      return c.json(updated);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to update conversion' }, 500);
    }
  },

  async deleteConversion(c) {
    try {
      const idStr = c.req.param('conversion_id');
      const conversionId = Number(idStr);
      if (!conversionId) return c.json({ error: 'Invalid conversion_id' }, 400);
      const found = await conversionService.getConversionById(conversionId);
      if (!found) return c.json({ error: 'Conversion not found' }, 404);
      await conversionService.deleteConversion(conversionId);
      return c.json({ success: true });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to delete conversion' }, 500);
    }
  },
};
