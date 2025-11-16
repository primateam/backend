import { teamService } from '../services/team.service.js';

export const teamController = {
  async getTeams(c) {
    try {
      const { limit = '10', offset = '0' } = c.req.query();
      const teams = await teamService.getTeams({ limit: Number(limit), offset: Number(offset) });
      return c.json(teams);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch teams' }, 500);
    }
  },

  async getTeamById(c) {
    try {
      const idStr = c.req.param('team_id');
      const teamId = Number(idStr);
      if (!teamId) return c.json({ error: 'Invalid team_id' }, 400);
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
      const teamId = Number(idStr);
      if (!teamId) return c.json({ error: 'Invalid team_id' }, 400);
      const body = await c.req.json();
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
      const teamId = Number(idStr);
      if (!teamId) return c.json({ error: 'Invalid team_id' }, 400);
      const found = await teamService.getTeamById(teamId);
      if (!found) return c.json({ error: 'Team not found' }, 404);
      await teamService.deleteTeam(teamId);
      return c.json({ success: true });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to delete team' }, 500);
    }
  },

  async getTeamMembers(c) {
    try {
      const idStr = c.req.param('team_id');
      const teamId = Number(idStr);
      if (!teamId) return c.json({ error: 'Invalid team_id' }, 400);
      const { limit = '10', offset = '0' } = c.req.query();
      const members = await teamService.getTeamMembers(teamId, { limit: Number(limit), offset: Number(offset) });
      return c.json(members);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch team members' }, 500);
    }
  },

  async getTeamCustomers(c) {
    try {
      const idStr = c.req.param('team_id');
      const teamId = Number(idStr);
      if (!teamId) return c.json({ error: 'Invalid team_id' }, 400);
      const { limit = '10', offset = '0' } = c.req.query();
      const customers = await teamService.getTeamCustomers(teamId, { limit: Number(limit), offset: Number(offset) });
      return c.json(customers);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch team customers' }, 500);
    }
  },
};
