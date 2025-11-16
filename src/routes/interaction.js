import { Hono } from 'hono';
import { interactionController } from '../controllers/interaction.controller.js';

const interactionRouter = new Hono();

interactionRouter.get('/', interactionController.getInteractions);
interactionRouter.post('/', interactionController.createInteraction);
interactionRouter.get('/:interactions_id/', interactionController.getInteractionById);
interactionRouter.patch('/:interactions_id/', interactionController.updateInteraction);
interactionRouter.delete('/:interactions_id/', interactionController.deleteInteraction);

export default interactionRouter;