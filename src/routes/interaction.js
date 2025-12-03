import { Hono } from 'hono';
import { interactionController } from '../controllers/interaction.controller.js';
import { idempotencyMiddleware } from '../middleware/idempotencyMiddleware.js';

const interactionRouter = new Hono();

interactionRouter.get('/', interactionController.getInteractions);
interactionRouter.post(
  '/',
  idempotencyMiddleware(),
  interactionController.createInteraction,
);
interactionRouter.get(
  '/:interaction_id',
  interactionController.getInteractionById,
);
interactionRouter.patch(
  '/:interaction_id',
  interactionController.updateInteraction,
);
interactionRouter.delete(
  '/:interaction_id',
  interactionController.deleteInteraction,
);

export default interactionRouter;
