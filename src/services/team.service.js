import { db } from '../db/index.js';
import { team, user, customer } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

const TEAM_FIELDS = ['teamName', 'managerId'];

// Public user fields for team members (exclude password)
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
      console.error(error);
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
      console.error(error);
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

      return created;
    } catch (error) {
      console.error(error);
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

      return updated || null;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update team');
    }
  }

  async deleteTeam(teamId) {
    try {
      const result = await db
        .delete(team)
        .where(eq(team.teamId, teamId))
        .returning({ teamId: team.teamId });
      return result.length > 0;
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      throw new Error('Failed to fetch customers belong to team');
    }
  }
}

export const teamService = new TeamService();
