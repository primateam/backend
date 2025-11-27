import { db } from '../db/index.js';
import { interaction } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import logger from '../utils/logger.js';

const INTERACTION_FIELDS = [
  'customerId',
  'userId',
  'contactMethod',
  'durationSeconds',
  'campaignContact',
  'previousOutcome',
  'outcome',
  'notes',
  'interactionDate',
];

const sanitizeInteractionPayload = (payload) => {
  const sanitized = {};
  for (const field of INTERACTION_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      sanitized[field] = payload[field];
    }
  }
  return sanitized;
};

class InteractionService {
  async getInteractions({ limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(interaction);

      const interactions = await db
        .select()
        .from(interaction)
        .limit(limit)
        .offset(offset);

      return {
        data: interactions,
        pagination: {
          total: count,
          limit,
          offset,
        },
      };
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch interactions');
      throw new Error('Failed to fetch interactions');
    }
  }

  async getInteractionById(interactionId) {
    try {
      const [record] = await db
        .select()
        .from(interaction)
        .where(eq(interaction.interactionId, interactionId))
        .limit(1);

      return record || null;
    } catch (error) {
      logger.error({ err: error, interactionId }, 'Failed to fetch the interaction');
      throw new Error('Failed to fetch the interaction');
    }
  }

  async createInteraction(payload) {
    try {
      const sanitized = sanitizeInteractionPayload(payload);
      const [created] = await db
        .insert(interaction)
        .values(sanitized)
        .returning({
          interactionId: interaction.interactionId,
          ...interaction,
        });

      logger.info({ interactionId: created.interactionId, customerId: created.customerId, userId: created.userId }, 'Interaction created successfully');

      return created;
    } catch (error) {
      logger.error({ err: error, payload: sanitizeInteractionPayload(payload) }, 'Failed to create interaction');
      throw new Error('Failed to create interaction');
    }
  }

  async updateInteraction(interactionId, updates) {
    try {
      const sanitized = sanitizeInteractionPayload(updates);
      const [updated] = await db
        .update(interaction)
        .set(sanitized)
        .where(eq(interaction.interactionId, interactionId))
        .returning({
          interactionId: interaction.interactionId,
          ...interaction,
        });

      if (updated) {
        logger.info({ interactionId }, 'Interaction updated successfully');
      }

      return updated || null;
    } catch (error) {
      logger.error({ err: error, interactionId }, 'Failed to update interaction');
      throw new Error('Failed to update interaction');
    }
  }

  async deleteInteraction(interactionId) {
    try {
      const result = await db
        .delete(interaction)
        .where(eq(interaction.interactionId, interactionId))
        .returning({ interactionId: interaction.interactionId });

      if (result.length > 0) {
        logger.info({ interactionId }, 'Interaction deleted successfully');
      }

      return result.length > 0;
    } catch (error) {
      logger.error({ err: error, interactionId }, 'Failed to delete interaction');
      throw new Error('Failed to delete interaction');
    }
  }

  async getInteractionsByCustomer(customerId, { limit = 10, offset = 0 } = {}) {
    try {
      return await db
        .select()
        .from(interaction)
        .where(eq(interaction.customerId, customerId))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      logger.error({ err: error, customerId, limit, offset }, 'Failed to fetch customer interactions');
      throw new Error('Failed to fetch customer interactions');
    }
  }

  async getInteractionsByUser(userId, { limit = 10, offset = 0 } = {}) {
    try {
      return await db
        .select()
        .from(interaction)
        .where(eq(interaction.userId, userId))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      logger.error({ err: error, userId, limit, offset }, 'Failed to fetch user interactions');
      throw new Error('Failed to fetch user interactions');
    }
  }
}

export const interactionService = new InteractionService();

