import { db } from '../db/index.js';
import { interaction } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { NotFoundError, DatabaseError } from '../errors/index.js';
import { buildPaginatedResponse } from '../utils/response.js';

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

      return buildPaginatedResponse(interactions, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch interactions');
      throw new DatabaseError('Failed to fetch interactions', error);
    }
  }

  async getInteractionById(interactionId) {
    try {
      const [record] = await db
        .select()
        .from(interaction)
        .where(eq(interaction.interactionId, interactionId))
        .limit(1);

      if (!record) {
        throw new NotFoundError('Interaction', interactionId);
      }
      return record || null;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, interactionId }, 'Failed to fetch the interaction');
      throw new DatabaseError('Failed to fetch the interaction', error);
    }
  }

  async createInteraction(payload) {
    try {
      const sanitized = sanitizeInteractionPayload(payload);
      const [created] = await db
        .insert(interaction)
        .values(sanitized)
        .returning();

      logger.info({ interactionId: created.interactionId, customerId: created.customerId, userId: created.userId }, 'Interaction created successfully');

      return created;
    } catch (error) {
      logger.error({ err: error, payload: sanitizeInteractionPayload(payload) }, 'Failed to create interaction');
      throw new DatabaseError('Failed to create interaction', error);
    }
  }

  async updateInteraction(interactionId, updates) {
    try {
      const sanitized = sanitizeInteractionPayload(updates);
      const [updated] = await db
        .update(interaction)
        .set(sanitized)
        .where(eq(interaction.interactionId, interactionId))
        .returning();

      if (!updated) {
        throw new NotFoundError('Interaction', interactionId);
      }

      logger.info({ interactionId }, 'Interaction updated successfully');
      return updated || null;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, interactionId }, 'Failed to update interaction');
      throw new DatabaseError('Failed to update interaction', error);
    }
  }

  async deleteInteraction(interactionId) {
    try {
      const result = await db
        .delete(interaction)
        .where(eq(interaction.interactionId, interactionId))
        .returning({ interactionId: interaction.interactionId });

      if (result.length === 0) {
        throw new NotFoundError('Interaction', interactionId);
      }

      logger.info({ interactionId }, 'Interaction deleted successfully');
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, interactionId }, 'Failed to delete interaction');
      throw new DatabaseError('Failed to delete interaction', error);
    }
  }

  async getInteractionsByCustomer(customerId, { limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(interaction)
        .where(eq(interaction.customerId, customerId));

      const interactions = await db
        .select()
        .from(interaction)
        .where(eq(interaction.customerId, customerId))
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(interactions, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, customerId, limit, offset }, 'Failed to fetch customer interactions');
      throw new DatabaseError('Failed to fetch customer interactions', error);
    }
  }

  async getInteractionsByUser(userId, { limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(interaction)
        .where(eq(interaction.userId, userId));

      const interactions = await db
        .select()
        .from(interaction)
        .where(eq(interaction.userId, userId))
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(interactions, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, userId, limit, offset }, 'Failed to fetch user interactions');
      throw new DatabaseError('Failed to fetch user interactions', error);    }
  }
}

export const interactionService = new InteractionService();

