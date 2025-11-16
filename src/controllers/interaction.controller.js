import { interactionService } from '../services/interaction.service.js';

export const interactionController = {
  async getInteractions(c) {
    try {
      const { limit = '10', offset = '0' } = c.req.query();
      const interactions = await interactionService.getInteractions({ limit: Number(limit), offset: Number(offset) });
      return c.json(interactions);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch interactions' }, 500);
    }
  },

  async getInteractionById(c) {
    try {
      const idStr = c.req.param('interactions_id');
      const interactionId = Number(idStr);
      if (!interactionId) return c.json({ error: 'Invalid interactions_id' }, 400);
      const found = await interactionService.getInteractionById(interactionId);
      if (!found) return c.json({ error: 'Interaction not found' }, 404);
      return c.json(found);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch interaction' }, 500);
    }
  },

  async createInteraction(c) {
    try {
      const body = await c.req.json();
      const created = await interactionService.createInteraction(body);
      return c.json(created, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create interaction' }, 500);
    }
  },

  async updateInteraction(c) {
    try {
      const idStr = c.req.param('interactions_id');
      const interactionId = Number(idStr);
      if (!interactionId) return c.json({ error: 'Invalid interactions_id' }, 400);
      const body = await c.req.json();
      const updated = await interactionService.updateInteraction(interactionId, body);
      if (!updated) return c.json({ error: 'Interaction not found' }, 404);
      return c.json(updated);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to update interaction' }, 500);
    }
  },

  async deleteInteraction(c) {
    try {
      const idStr = c.req.param('interactions_id');
      const interactionId = Number(idStr);
      if (!interactionId) return c.json({ error: 'Invalid interactions_id' }, 400);
      const found = await interactionService.getInteractionById(interactionId);
      if (!found) return c.json({ error: 'Interaction not found' }, 404);
      await interactionService.deleteInteraction(interactionId);
      return c.json({ success: true });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to delete interaction' }, 500);
    }
  },
};
