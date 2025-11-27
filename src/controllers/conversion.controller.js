import { conversionService } from '../services/conversion.service.js';
import { parsePaginationParams, parseIdParam, parseRequestBody } from '../utils/pagination.js';
import { validate, createConversionSchema, updateConversionSchema } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';

export const conversionController = {
  async getConversions(c) {
    const { limit, offset } = parsePaginationParams(c);
    const conversions = await conversionService.getConversions({ limit, offset });
    return sendSuccess(c, conversions);
  },

  async getConversionById(c) {
    const conversionId = parseIdParam(c, 'conversion_id');
    const found = await conversionService.getConversionById(conversionId);
    return sendSuccess(c, found);
  },

  async createConversion(c) {
    const body = await parseRequestBody(c);
    const validated = validate(createConversionSchema, body);
    const created = await conversionService.createConversion(validated);
    return sendSuccess(c, created, 201);
  },

  async updateConversion(c) {
    const conversionId = parseIdParam(c, 'conversion_id');
    const body = await parseRequestBody(c);
    const validated = validate(updateConversionSchema.partial(), body);
    const updated = await conversionService.updateConversion(conversionId, validated);
    return sendSuccess(c, updated);
  },

  async deleteConversion(c) {
    const conversionId = parseIdParam(c, 'conversion_id');
    await conversionService.deleteConversion(conversionId);
    return sendSuccess(c, { deleted: true }, 204);
  },
};
