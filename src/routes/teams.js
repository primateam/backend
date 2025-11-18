import { Hono } from 'hono';
import { teamController } from '../controllers/team.controller.js';

const teamsRouter = new Hono();

teamsRouter.get('/', teamController.getTeams);
teamsRouter.post('/', teamController.createTeam);
teamsRouter.get('/:team_id/', teamController.getTeamById);
teamsRouter.patch('/:team_id/', teamController.updateTeam);
teamsRouter.delete('/:team_id/', teamController.deleteTeam);
teamsRouter.get('/:team_id/users', teamController.getTeamMembers);
teamsRouter.get('/:team_id/customers', teamController.getTeamCustomers);

export default teamsRouter;