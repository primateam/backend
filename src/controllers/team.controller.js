import { idParamsSchema, queryParamsSchema } from '../validators/common.validator.js';
import { teamService } from '../services/team.service.js';
import logger from '../utils/logger.js';

export const teamController = {
  async getTeams(c) {
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

      const teams = await teamService.getTeams({ limit, offset });
      return c.json(teams);
    } catch (error) {
      logger.error({ err: error, limit: c.req.query('limit'), offset: c.req.query('offset') }, 'Controller error: Failed to fetch teams');
      return c.json({ error: 'Failed to fetch teams' }, 500);
    }
  },

  async getTeamById(c) {
    let idStr;

    try {
      idStr = c.req.param('team_id');

      const validateParams = idParamsSchema.parse({ id: idStr });
      const teamId = validateParams.id;

      const found = await teamService.getTeamById(teamId);
      if (!found) return c.json({ error: 'Team not found' }, 404);
      return c.json(found);
    } catch (error) {
      if (error.issues) {
        return c.json({ error: 'Invalid team_id' }, 400);
      }
      logger.error({ err: error, teamId: idStr }, 'Failed to fetch team from service');
      return c.json({ error: 'Failed to fetch team' }, 500);
    }
  },

  async createTeam(c) {
    let body;

    try {
      body = await c.req.json();

      if (!body.teamName) {
        return c.json({ error: 'Team name is required' }, 400);
      }

      if (body.managerId !== undefined && body.managerId !== null) {
        const managerId = parseInt(body.managerId, 10);
        if (isNaN(managerId) || managerId < 1) {
          return c.json({ error: 'Invalid managerId' }, 400);
        }
        body.managerId = managerId;
      }

      const created = await teamService.createTeam(body);
      return c.json(created, 201);
    } catch (error) {
      logger.error({ err: error, body }, 'Controller error: Failed to create team');
      return c.json({ error: 'Failed to create team' }, 500);
    }
  },

  async updateTeam(c) {
    let idStr;

    try {
      idStr = c.req.param('team_id');

      const validateParams = idParamsSchema.parse({ id: idStr });
      const teamId = validateParams.id;

      const body = await c.req.json();

      if (body.managerId !== undefined && body.managerId !== null) {
        const managerId = parseInt(body.managerId, 10);
        if (isNaN(managerId) || managerId < 1) {
          return c.json({ error: 'Invalid managerId' }, 400);
        }
        body.managerId = managerId;
      }

      const updated = await teamService.updateTeam(teamId, body);
      if (!updated) return c.json({ error: 'Team not found' }, 404);
      return c.json(updated);
    } catch (error) {
      if (error.issues) {
        return c.json({ error: 'Invalid team_id format' }, 400);
      }
      logger.error({ err: error, teamId: idStr, body: c.req.body }, 'Controller error: Failed to update team');
      return c.json({ error: 'Failed to update team' }, 500);
    }
  },

  async deleteTeam(c) {
    let idStr;

    try {
      idStr = c.req.param('team_id');

      const validateParams = idParamsSchema.parse({ id: idStr });
      const teamId = validateParams.id;

      const deleted = await teamService.deleteTeam(teamId);
      if (!deleted) return c.json({ error: 'Team not found' }, 404);
      return c.json({ success: true });
    } catch (error) {
      if (error.issues) {
        return c.json({ error: 'Invalid team_id format' }, 400);
      }
      logger.error({ err: error, teamId: idStr }, 'Controller error: Failed to delete team');
      return c.json({ error: 'Failed to delete team' }, 500);
    }
  },

  async getTeamMembers(c) {
    let idStr;

    try {
      idStr = c.req.param('team_id');

      const validateParams = idParamsSchema.parse({ id: idStr });
      const teamId = validateParams.id;

      const queryParams = c.req.query();
      const { q, filter, sort } = queryParamsSchema.parse(queryParams);

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

      const members = await teamService.getTeamMembers(teamId, { limit, offset, q, filter, sort });
      return c.json(members);
    } catch (error) {
      if (error.issues) {
        return c.json({ error: 'Invalid parameters' }, 400);
      }
      logger.error({ err: error, teamId: idStr }, 'Failed to fetch team members');
      return c.json({ error: 'Failed to fetch team members' }, 500);
    }
  },

  async getTeamCustomers(c) {
    let idStr;

    try {
      idStr = c.req.param('team_id');

      const validateParams = idParamsSchema.parse({ id: idStr });
      const teamId = validateParams.id;

      const queryParams = c.req.query();
      const { q, filter, sort } = queryParamsSchema.parse(queryParams);

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

      const customers = await teamService.getTeamCustomers(teamId, { limit, offset, q, filter, sort });
      return c.json(customers);
    } catch (error) {
      if (error.issues) {
        return c.json({ error: 'Invalid parameters' }, 400);
      }
      logger.error({ err: error, teamId: idStr }, 'Failed to fetch team customers');
      return c.json({ error: 'Failed to fetch team customers' }, 500);
    }
  },
};
