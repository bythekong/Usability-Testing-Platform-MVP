import { Router, Response } from 'express';
import { body } from 'express-validator';
import { Role } from '@usability-testing/shared';
import { prisma } from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Create Campaign (OWNER only)
router.post(
  '/',
  requireAuth,
  requireRole(Role.OWNER),
  [
    body('targetUrl').isURL(),
    body('rewardAmount').isInt({ min: 1 }),
    body('tasks').isArray({ min: 1 }),
    body('tasks.*.instruction').isString().notEmpty()
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    try {
      const { targetUrl, rewardAmount, tasks } = req.body;

      const campaign = await prisma.testCampaign.create({
        data: {
          ownerId: req.user!.id,
          targetUrl,
          rewardAmount,
          tasks: {
            create: tasks.map((task: any, index: number) => ({
              stepOrder: index + 1,
              instruction: task.instruction
            }))
          },
          // Create 1 available job for this MVP by default
          jobs: {
            create: [
              { status: 'AVAILABLE' }
            ]
          }
        },
        include: { tasks: true, jobs: true }
      });

      res.status(201).json(campaign);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get my campaigns (OWNER only)
router.get('/', requireAuth, requireRole(Role.OWNER), async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.testCampaign.findMany({
      where: { ownerId: req.user!.id },
      include: { tasks: true, jobs: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export const campaignRoutes = router;