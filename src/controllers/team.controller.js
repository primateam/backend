import { teamService } from '../services/team.service.js';

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
      console.error(error);
      return c.json({ error: 'Failed to fetch teams' }, 500);
    }
  },

  async getTeamById(c) {
    try {
      const idStr = c.req.param('team_id');
      const teamId = parseInt(idStr, 10);

      if (isNaN(teamId) || teamId < 1) {
        return c.json({ error: 'Invalid team_id' }, 400);
      }

      const found = await teamService.getTeamById(teamId);
      if (!found) return c.json({ error: 'Team not found' }, 404);
      return c.json(found);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch team' }, 500);
    }
  },

  async createTeam(c) {
    try {
      const body = await c.req.json();

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
      console.error(error);
      return c.json({ error: 'Failed to create team' }, 500);
    }
  },

  async updateTeam(c) {
    try {
      const idStr = c.req.param('team_id');
      const teamId = parseInt(idStr, 10);

      if (isNaN(teamId) || teamId < 1) {
        return c.json({ error: 'Invalid team_id' }, 400);
      }

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
      console.error(error);
      return c.json({ error: 'Failed to update team' }, 500);
    }
  },

  async deleteTeam(c) {
    try {
      const idStr = c.req.param('team_id');
      const teamId = parseInt(idStr, 10);

      if (isNaN(teamId) || teamId < 1) {
        return c.json({ error: 'Invalid team_id' }, 400);
      }

      const deleted = await teamService.deleteTeam(teamId);
      if (!deleted) return c.json({ error: 'Team not found' }, 404);
      return c.json({ success: true });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to delete team' }, 500);
    }
  },

  async getTeamMembers(c) {
    try {
      const idStr = c.req.param('team_id');
      const teamId = parseInt(idStr, 10);

      if (isNaN(teamId) || teamId < 1) {
        return c.json({ error: 'Invalid team_id' }, 400);
      }

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

      const members = await teamService.getTeamMembers(teamId, { limit, offset });
      return c.json(members);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch team members' }, 500);
    }
  },

  async getTeamCustomers(c) {
    try {
      const idStr = c.req.param('team_id');
      const teamId = parseInt(idStr, 10);

      if (isNaN(teamId) || teamId < 1) {
        return c.json({ error: 'Invalid team_id' }, 400);
      }

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

      const customers = await teamService.getTeamCustomers(teamId, { limit, offset });
      return c.json(customers);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch team customers' }, 500);
    }
  },
};
