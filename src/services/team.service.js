import { db } from '../db/index.js';
import { team, user, customer } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import logger from '../utils/logger.js';

const TEAM_FIELDS = ['teamName', 'managerId'];

// exclude password
const PUBLIC_USER_SELECT = {
  userId: user.userId,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  teamId: user.teamId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

const sanitizeTeamPayload = (payload) => {
  const sanitized = {};
  for (const field of TEAM_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      sanitized[field] = payload[field];
    }
  }
  return sanitized;
};

class TeamService {
  async getTeams({ limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(team);

      const teams = await db
        .select()
        .from(team)
        .limit(limit)
        .offset(offset);

      return {
        data: teams,
        pagination: {
          total: count,
          limit,
          offset,
        },
      };
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch teams');
      throw new Error('Failed to fetch teams');
    }
  }

  async getTeamById(teamId) {
    try {
      const [record] = await db
        .select()
        .from(team)
        .where(eq(team.teamId, teamId))
        .limit(1);

      return record || null;
    } catch (error) {
      logger.error({ err: error, teamId }, 'Failed to fetch the team by ID');
      throw new Error('Failed to fetch the team');
    }
  }

  async createTeam(payload) {
    try {
      const sanitized = sanitizeTeamPayload(payload);
      const [created] = await db
        .insert(team)
        .values(sanitized)
        .returning({
          teamId: team.teamId,
          ...team,
        });

      logger.info({ teamId: created.teamId, teamName: created.teamName }, 'Team created successfully');
      return created;
    } catch (error) {
      logger.error({ err: error, payload: sanitizeTeamPayload(payload) }, 'Failed to create team');
      throw new Error('Failed to create team');
    }
  }

  async updateTeam(teamId, updates) {
    try {
      const sanitized = sanitizeTeamPayload(updates);
      const [updated] = await db
        .update(team)
        .set(sanitized)
        .where(eq(team.teamId, teamId))
        .returning({
          teamId: team.teamId,
          ...team,
        });

      if (updated) {
        logger.info({ teamId }, 'Team updated successfully');
      }

      return updated || null;
    } catch (error) {
      logger.error({ err: error, teamId, updates: sanitizeTeamPayload(updates) }, 'Failed to update team');
      throw new Error('Failed to update team');
    }
  }

  async deleteTeam(teamId) {
    try {
      const result = await db
        .delete(team)
        .where(eq(team.teamId, teamId))
        .returning({ teamId: team.teamId });

      if (result.length > 0) {
        logger.info({ teamId }, 'Team deleted successfully');
      }

      return result.length > 0;
    } catch (error) {
      logger.error({ err: error, teamId }, 'Failed to delete team');
      throw new Error('Failed to delete team');
    }
  }

  async getTeamMembers(teamId, { limit = 10, offset = 0 } = {}) {
    try {
      return await db
        .select(PUBLIC_USER_SELECT)
        .from(user)
        .where(eq(user.teamId, teamId))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      logger.error({ err: error, teamId, limit, offset }, 'Failed to fetch team members');
      throw new Error('Failed to fetch team members');
    }
  }

  async getTeamCustomers(teamId, { limit = 10, offset = 0 } = {}) {
    try {
      return await db
        .select()
        .from(customer)
        .innerJoin(user, eq(customer.assignedUserId, user.userId))
        .where(eq(user.teamId, teamId))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      logger.error({ err: error, teamId, limit, offset }, 'Failed to fetch customers belong to team');
      throw new Error('Failed to fetch customers belong to team');
    }
  }
}

export const teamService = new TeamService();
