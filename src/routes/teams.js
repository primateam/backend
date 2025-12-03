import { Hono } from 'hono';
import { teamController } from '../controllers/team.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { idempotencyMiddleware } from '../middleware/idempotencyMiddleware.js';

const teamsRouter = new Hono();
const accessPermission = authMiddleware(['admin', 'manager']);

teamsRouter.get('/', teamController.getTeams);
teamsRouter.post(
  '/',
  idempotencyMiddleware(),
  accessPermission,
  teamController.createTeam,
);
teamsRouter.get('/:team_id', teamController.getTeamById);
teamsRouter.patch('/:team_id', accessPermission, teamController.updateTeam);
teamsRouter.delete('/:team_id', accessPermission, teamController.deleteTeam);
teamsRouter.get('/:team_id/users', teamController.getTeamMembers);
teamsRouter.get('/:team_id/customers', teamController.getTeamCustomers);

export default teamsRouter;
