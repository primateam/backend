import { db } from '../db/index.js';
import { interaction } from '../db/schema.js';
import { eq, sql, and, or, like } from 'drizzle-orm';
import logger from '../utils/logger.js';
import {
  NotFoundError,
  DatabaseError,
  ForeignKeyError,
  getPostgresErrorCode,
  getPostgresConstraint,
} from '../errors/index.js';
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

/**
 * Handle PostgreSQL constraint errors for interaction operations
 * @param {Error} error - The error from the database
 * @throws {ForeignKeyError} - Appropriate error based on constraint type
 */
function handleInteractionConstraintError(error) {
  const errorCode = getPostgresErrorCode(error);
  const constraint = getPostgresConstraint(error);

  // Foreign key constraint violation
  if (errorCode === '23503') {
    if (constraint?.includes('customer')) {
      throw new ForeignKeyError(
        'The specified customer does not exist',
        constraint,
      );
    }
    if (constraint?.includes('user')) {
      throw new ForeignKeyError(
        'The specified user does not exist',
        constraint,
      );
    }
    throw new ForeignKeyError('Referenced resource does not exist', constraint);
  }
}

class InteractionService {
  async getInteractions({ limit = 10, offset = 0, filters, searchQuery } = {}) {
    try {
      const whereConditions = [];

      if (filters.customerId) {
        whereConditions.push(
          eq(interaction.customerId, parseInt(filters.customerId, 10)),
        );
      }
      if (filters.userId) {
        whereConditions.push(
          eq(interaction.userId, parseInt(filters.userId, 10)),
        );
      }
      if (filters.contactMethod) {
        whereConditions.push(
          eq(interaction.contactMethod, filters.contactMethod),
        );
      }
      if (filters.outcome) {
        whereConditions.push(eq(interaction.outcome, filters.outcome));
      }

      if (searchQuery) {
        const searchLike = `%${searchQuery}%`;
        whereConditions.push(or(like(interaction.notes, searchLike)));
      }
      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(interaction)
        .where(whereClause);

      const interactions = await db
        .select()
        .from(interaction)
        .where(whereClause)
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(interactions, count, limit, offset);
    } catch (error) {
      logger.error(
        { err: error, limit, offset },
        'Failed to fetch interactions',
      );
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
      logger.error(
        { err: error, interactionId },
        'Failed to fetch the interaction',
      );
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

      logger.info(
        {
          interactionId: created.interactionId,
          customerId: created.customerId,
          userId: created.userId,
        },
        'Interaction created successfully',
      );

      return created;
    } catch (error) {
      // Check for constraint violations and throw appropriate errors
      handleInteractionConstraintError(error);

      logger.error(
        { err: error, payload: sanitizeInteractionPayload(payload) },
        'Failed to create interaction',
      );
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

      // Check for constraint violations and throw appropriate errors
      handleInteractionConstraintError(error);

      logger.error(
        { err: error, interactionId },
        'Failed to update interaction',
      );
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
      logger.error(
        { err: error, interactionId },
        'Failed to delete interaction',
      );
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
      logger.error(
        { err: error, customerId, limit, offset },
        'Failed to fetch customer interactions',
      );
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
      logger.error(
        { err: error, userId, limit, offset },
        'Failed to fetch user interactions',
      );
      throw new DatabaseError('Failed to fetch user interactions', error);
    }
  }
}

export const interactionService = new InteractionService();
