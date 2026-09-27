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
    body('testerCount').isInt({ min: 1 }),
    body('scenario').optional().isString(),
    body('tasks').isArray({ min: 1 }),
    body('tasks.*.instruction').isString().notEmpty(),
    body('targetMinAge').optional().isInt(),
    body('targetMaxAge').optional().isInt(),
    body('targetGenders').optional().isArray(),
    body('targetItExpertises').optional().isArray()
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    try {
      const { targetUrl, rewardAmount, testerCount, scenario, tasks, targetMinAge, targetMaxAge, targetGenders, targetItExpertises } = req.body;

      const campaign = await prisma.testCampaign.create({
        data: {
          ownerId: req.user!.id,
          targetUrl,
          rewardAmount,
          testerCount,
          scenario,
          targetMinAge,
          targetMaxAge,
          targetGenders: targetGenders || [],
          targetItExpertises: targetItExpertises || [],
          tasks: {
            create: tasks.map((task: any, index: number) => ({
              stepOrder: index + 1,
              instruction: task.instruction,
              maxTimeLimit: task.maxTimeLimit || 300
            }))
          },
          // Create N available jobs based on testerCount
          jobs: {
            create: Array.from({ length: testerCount }).map(() => ({ status: 'AVAILABLE' }))
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

// Lock campaign (OWNER only)
router.post('/:id/lock', requireAuth, requireRole(Role.OWNER), async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.testCampaign.findUnique({
      where: { id: req.params.id }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    if (campaign.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.testCampaign.update({
      where: { id: req.params.id },
      data: { isLocked: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export const campaignRoutes = router;