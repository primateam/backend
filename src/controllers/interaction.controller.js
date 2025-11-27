import { interactionService } from '../services/interaction.service.js';
import { idParamsSchema } from '../validators/crud.validator.js';
import logger from '../utils/logger.js';


export const interactionController = {
  async getInteractions(c) {
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

      const interactions = await interactionService.getInteractions({ limit, offset });
      return c.json(interactions);
    } catch (error) {
      logger.error({ err: error, limit: c.req.query('limit'), offset: c.req.query('offset') }, 'Controller error: Failed to fetch interactions');
      return c.json({ error: 'Failed to fetch interactions' }, 500);
    }
  },

  async getInteractionById(c) {
    let idStr;

    try {
      idStr = c.req.param('interactions_id');
      const validateParams = idParamsSchema.parse({ id: idStr });
      const interactionId = validateParams.id;

      const found = await interactionService.getInteractionById(interactionId);
      if (!found) return c.json({ error: 'Interaction not found' }, 404);
      return c.json(found);
    } catch (error) {
      if (error.issues){
        return c.json({ error: 'Invalid interaction ID format' }, 400);
      }

      logger.error({ err: error, interactionId: idStr }, 'Controller error: Failed to fetch interaction by ID');
      return c.json({ error: 'Failed to fetch interaction' }, 500);
    }
  },

  async createInteraction(c) {
    let body;
    try {
      body = await c.req.json();

      // Validate required fields
      if (!body.customerId || !body.userId) {
        return c.json({ error: 'customerId and userId are required' }, 400);
      }

      const customerId = parseInt(body.customerId, 10);
      const userId = parseInt(body.userId, 10);

      if (isNaN(customerId) || customerId < 1) {
        return c.json({ error: 'Invalid customerId' }, 400);
      }
      if (isNaN(userId) || userId < 1) {
        return c.json({ error: 'Invalid userId' }, 400);
      }

      body.customerId = customerId;
      body.userId = userId;

      if (body.durationSeconds !== undefined && body.durationSeconds !== null) {
        const duration = parseInt(body.durationSeconds, 10);
        if (isNaN(duration) || duration < 0) {
          return c.json({ error: 'Invalid durationSeconds' }, 400);
        }
        body.durationSeconds = duration;
      }

      const created = await interactionService.createInteraction(body);
      return c.json(created, 201);
    } catch (error) {
      logger.error({ err: error, body }, 'Controller error: Failed to create interaction');
      return c.json({ error: 'Failed to create interaction' }, 500);
    }
  },

  async updateInteraction(c) {
    let idStr;
    try {
      idStr = c.req.param('interactions_id');
      const interactionId = parseInt(idStr, 10);

      if (isNaN(interactionId) || interactionId < 1) {
        return c.json({ error: 'Invalid interactions_id' }, 400);
      }

      const body = await c.req.json();

      // Validate IDs if present
      if (body.customerId !== undefined) {
        const customerId = parseInt(body.customerId, 10);
        if (isNaN(customerId) || customerId < 1) {
          return c.json({ error: 'Invalid customerId' }, 400);
        }
        body.customerId = customerId;
      }

      if (body.userId !== undefined) {
        const userId = parseInt(body.userId, 10);
        if (isNaN(userId) || userId < 1) {
          return c.json({ error: 'Invalid userId' }, 400);
        }
        body.userId = userId;
      }

      if (body.durationSeconds !== undefined && body.durationSeconds !== null) {
        const duration = parseInt(body.durationSeconds, 10);
        if (isNaN(duration) || duration < 0) {
          return c.json({ error: 'Invalid durationSeconds' }, 400);
        }
        body.durationSeconds = duration;
      }

      const updated = await interactionService.updateInteraction(interactionId, body);
      if (!updated) return c.json({ error: 'Interaction not found' }, 404);
      return c.json(updated);
    } catch (error) {
      if (error.issues){
        return c.json({ error: 'Invalid interaction ID format' }, 400);
      }

      logger.error({ err: error, interactionId: idStr }, 'Controller error: Failed to update interaction');
      return c.json({ error: 'Failed to update interaction' }, 500);
    }
  },

  async deleteInteraction(c) {
    let idStr;
    try {
      idStr = c.req.param('interactions_id');
      const interactionId = parseInt(idStr, 10);

      if (isNaN(interactionId) || interactionId < 1) {
        return c.json({ error: 'Invalid interactions_id' }, 400);
      }

      const deleted = await interactionService.deleteInteraction(interactionId);
      if (!deleted) return c.json({ error: 'Interaction not found' }, 404);
      return c.json({ success: true });
    } catch (error) {
      if (error.issues){
        return c.json({ error: 'Invalid interaction ID format' }, 400);
      }

      logger.error({ err: error, interactionId: idStr }, 'Controller error: Failed to delete interaction');
      return c.json({ error: 'Failed to delete interaction' }, 500);
    }
  },
};
