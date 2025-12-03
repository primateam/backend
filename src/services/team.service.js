import { db } from '../db/index.js';
import { team, user, customer } from '../db/schema.js';
import { eq, sql, and, or, like } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { NotFoundError, DatabaseError } from '../errors/index.js';
import { buildPaginatedResponse } from '../utils/response.js';

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
  async getTeams({ limit = 10, offset = 0, searchQuery } = {}) {
    try {
      const whereConditions = [];

      if (searchQuery) {
        const searchLike = `%${searchQuery}%`;
        whereConditions.push(
          or(
            like(team.teamName, searchLike),
          )
        );
      }
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(team)
        .where(whereClause);

      const teams = await db
        .select()
        .from(team)
        .where(whereClause)
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(teams, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, limit, offset }, 'Failed to fetch teams');
      throw new DatabaseError('Failed to fetch teams', error);
    }
  }

  async getTeamById(teamId) {
    try {
      const [record] = await db
        .select()
        .from(team)
        .where(eq(team.teamId, teamId))
        .limit(1);

      if (!record) {
        throw new NotFoundError('Team', teamId);
      }

      return record;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, teamId }, 'Failed to fetch team');
      throw new DatabaseError('Failed to fetch team', error);
    }
  }

  async createTeam(payload) {
    try {
      const sanitized = sanitizeTeamPayload(payload);
      const [created] = await db
        .insert(team)
        .values(sanitized)
        .returning();

      logger.info({ teamId: created.teamId, teamName: created.teamName }, 'Team created successfully');

      return created;
    } catch (error) {
      logger.error({ err: error, payload: sanitizeTeamPayload(payload) }, 'Failed to create team');
      throw new DatabaseError('Failed to create team', error);
    }
  }

  async updateTeam(teamId, updates) {
    try {
      const sanitized = sanitizeTeamPayload(updates);
      const [updated] = await db
        .update(team)
        .set(sanitized)
        .where(eq(team.teamId, teamId))
        .returning();

      if (!updated) {
        throw new NotFoundError('Team', teamId);
      }

      logger.info({ teamId }, 'Team updated');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, teamId, updates: sanitizeTeamPayload(updates) }, 'Failed to update team');
      throw new DatabaseError('Failed to update team', error);
    }
  }

  async deleteTeam(teamId) {
    try {
      const result = await db
        .delete(team)
        .where(eq(team.teamId, teamId))
        .returning({ teamId: team.teamId });

      if (result.length === 0) {
        throw new NotFoundError('Team', teamId);
      }

      logger.info({ teamId }, 'Team deleted successfully');
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ err: error, teamId }, 'Failed to delete team');
      throw new DatabaseError('Failed to delete team', error);
    }
  }

  async getTeamMembers(teamId, { limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(user)
        .where(eq(user.teamId, teamId));

      const members = await db
        .select(PUBLIC_USER_SELECT)
        .from(user)
        .where(eq(user.teamId, teamId))
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(members, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, teamId }, 'Failed to fetch team members');
      throw new DatabaseError('Failed to fetch team members', error);
    }
  }

  async getTeamCustomers(teamId, { limit = 10, offset = 0 } = {}) {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)::int` })
        .from(customer)
        .innerJoin(user, eq(customer.assignedUserId, user.userId))
        .where(eq(user.teamId, teamId));

      const customers = await db
        .select()
        .from(customer)
        .innerJoin(user, eq(customer.assignedUserId, user.userId))
        .where(eq(user.teamId, teamId))
        .limit(limit)
        .offset(offset);

      return buildPaginatedResponse(customers, count, limit, offset);
    } catch (error) {
      logger.error({ err: error, teamId }, 'Failed to fetch team customers');
      throw new DatabaseError('Failed to fetch team customers', error);
    }
  }
}

export const teamService = new TeamService();
