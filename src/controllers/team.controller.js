import { teamService } from '../services/team.service.js';
import { parsePaginationParams, parseIdParam, parseRequestBody } from '../utils/pagination.js';
import { sendSuccess } from '../utils/response.js';
import { validate, createTeamSchema, updateTeamSchema } from '../utils/validation.js';

export const teamController = {
  async getTeams(c) {
    const { limit, offset } = parsePaginationParams(c);
    const result = await teamService.getTeams({ limit, offset });
    return sendSuccess(c, result);
  },

  async getTeamById(c) {
    const teamId = parseIdParam(c, 'team_id');
    const found = await teamService.getTeamById(teamId);
    return sendSuccess(c, found);
  },

  async createTeam(c) {
    const body = await parseRequestBody(c);
    const validated = validate(createTeamSchema, body);
    const created = await teamService.createTeam(validated);
    return sendSuccess(c, created, 201);
  },

  async updateTeam(c) {
    const teamId = parseIdParam(c, 'team_id');
    const body = await parseRequestBody(c);
    const validated = validate(updateTeamSchema, body);
    const updated = await teamService.updateTeam(teamId, validated);
    return sendSuccess(c, updated);
  },

  async deleteTeam(c) {
    const teamId = parseIdParam(c, 'team_id');
    await teamService.deleteTeam(teamId);
    return sendSuccess(c, { deleted: true });
  },

  async getTeamMembers(c) {
    const teamId = parseIdParam(c, 'team_id');
    const { limit, offset } = parsePaginationParams(c);
    const members = await teamService.getTeamMembers(teamId, { limit, offset });
    return sendSuccess(c, members);
  },

  async getTeamCustomers(c) {
    const teamId = parseIdParam(c, 'team_id');
    const { limit, offset } = parsePaginationParams(c);
    const customers = await teamService.getTeamCustomers(teamId, { limit, offset });
    return sendSuccess(c, customers);
  },
};

