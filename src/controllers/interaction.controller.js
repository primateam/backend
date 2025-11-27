import { interactionService } from '../services/interaction.service.js';
import { parsePaginationParams, parseIdParam, parseRequestBody } from '../utils/pagination.js';
import { validate, createInteractionSchema, updateInteractionSchema } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';


export const interactionController = {
  async getInteractions(c) {
    const { limit, offset } = parsePaginationParams(c);
    const interactions = await interactionService.getInteractions({ limit, offset });
    return sendSuccess(c, interactions);
  },

  async getInteractionById(c) {
    const interactionId = parseIdParam(c, 'interactions_id');
    const found = await interactionService.getInteractionById(interactionId);
    return sendSuccess(c, found);
  },

  async createInteraction(c) {
    const body = await parseRequestBody(c);
    const validated = validate(createInteractionSchema, body);
    const created = await interactionService.createInteraction(validated);
    return sendSuccess(c, created, 201);
  },

  async updateInteraction(c) {
    const interactionId = parseIdParam(c, 'interactions_id');
    const body = await parseRequestBody(c);
    const validated = validate(updateInteractionSchema.partial(), body);
    const updated = await interactionService.updateInteraction(interactionId, validated);
    return sendSuccess(c, updated);
  },

  async deleteInteraction(c) {
    const interactionId = parseIdParam(c, 'interactions_id');
    await interactionService.deleteInteraction(interactionId);
    return sendSuccess(c, { deleted: true }, 204);
  },
};
