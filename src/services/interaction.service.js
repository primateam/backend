import { db } from '../db/index.js';
import { interaction } from '../db/schema.js';
import { eq } from 'drizzle-orm';

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
      return await db
        .select()
        .from(interaction)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error(error);
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
      console.error(error);
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

      return created;
    } catch (error) {
      console.error(error);
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

      return updated || null;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update interaction');
    }
  }

  async deleteInteraction(interactionId) {
    try {
      await db
        .delete(interaction)
        .where(eq(interaction.interactionId, interactionId));
      return true;
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      throw new Error('Failed to fetch user interactions');
    }
  }
}

export const interactionService = new InteractionService();

