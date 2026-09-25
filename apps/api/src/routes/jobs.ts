import { Router, Response } from 'express';
import { body } from 'express-validator';
import { Role, JobStatus } from '@usability-testing/shared';
import { prisma } from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// List available jobs (TESTER only)
router.get('/available', requireAuth, requireRole(Role.TESTER), async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await prisma.jobAssignment.findMany({
      where: { status: 'AVAILABLE', testerId: null },
      include: { campaign: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List claimed/active jobs for current tester
router.get('/my', requireAuth, requireRole(Role.TESTER), async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await prisma.jobAssignment.findMany({
      where: { testerId: req.user!.id },
      include: { campaign: { include: { tasks: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Claim a job (concurrency safe via updateMany where status = AVAILABLE)
router.post('/:id/claim', requireAuth, requireRole(Role.TESTER), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await prisma.jobAssignment.updateMany({
      where: {
        id,
        status: 'AVAILABLE',
        testerId: null
      },
      data: {
        status: 'CLAIMED',
        testerId: req.user!.id
      }
    });

    if (result.count === 0) {
      return res.status(400).json({ error: 'Job is no longer available or does not exist.' });
    }

    const job = await prisma.jobAssignment.findUnique({
      where: { id },
      include: { campaign: { include: { tasks: true } } }
    });

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit a job
router.post(
  '/:id/submit',
  requireAuth,
  requireRole(Role.TESTER),
  [
    body('responses').isArray({ min: 1 }),
    body('responses.*.taskId').isString().notEmpty(),
    body('responses.*.answerText').isString()
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { responses } = req.body;

      // Verify ownership and status
      const job = await prisma.jobAssignment.findUnique({ where: { id } });
      if (!job || job.testerId !== req.user!.id || job.status !== 'CLAIMED') {
        return res.status(403).json({ error: 'Invalid job state or not owner.' });
      }

      await prisma.$transaction(async (tx) => {
        // Create responses
        for (const resp of responses) {
          await tx.taskResponse.create({
            data: {
              jobId: id,
              taskId: resp.taskId,
              answerText: resp.answerText
            }
          });
        }

        // Update Job Status
        await tx.jobAssignment.update({
          where: { id },
          data: { status: 'SUBMITTED' }
        });
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Review a job (OWNER only)
router.post(
  '/:id/review',
  requireAuth,
  requireRole(Role.OWNER),
  [
    body('status').isIn([JobStatus.APPROVED, JobStatus.REJECTED])
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const job = await prisma.jobAssignment.findUnique({
        where: { id },
        include: { campaign: true }
      });

      if (!job || job.campaign.ownerId !== req.user!.id || job.status !== 'SUBMITTED') {
        return res.status(403).json({ error: 'Invalid job state or not owner.' });
      }

      const updated = await prisma.jobAssignment.update({
        where: { id },
        data: { status }
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export const jobRoutes = router;