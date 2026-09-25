import { Router, Response } from 'express';
import { body } from 'express-validator';
import { Role, JobStatus } from '@usability-testing/shared';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.get('/available', requireAuth, requireRole(Role.TESTER), async (_req: AuthRequest, res: Response) => {
  try {
    const jobs = await prisma.jobAssignment.findMany({
      where: { status: JobStatus.AVAILABLE, testerId: null },
      include: { campaign: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my', requireAuth, requireRole(Role.TESTER), async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await prisma.jobAssignment.findMany({
      where: { testerId: req.user!.id },
      include: {
        campaign: {
          include: {
            tasks: { orderBy: { stepOrder: 'asc' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/claim', requireAuth, requireRole(Role.TESTER), async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.jobAssignment.updateMany({
      where: {
        id: req.params.id,
        status: JobStatus.AVAILABLE,
        testerId: null
      },
      data: {
        status: JobStatus.CLAIMED,
        testerId: req.user!.id,
        claimedAt: new Date()
      }
    });

    if (result.count !== 1) {
      return res.status(409).json({ error: 'Job is no longer available or does not exist.' });
    }

    const job = await prisma.jobAssignment.findUnique({
      where: { id: req.params.id },
      include: {
        campaign: {
          include: { tasks: { orderBy: { stepOrder: 'asc' } } }
        }
      }
    });

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

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
      const responses = req.body.responses as Array<{ taskId: string; answerText: string }>;
      const job = await prisma.jobAssignment.findUnique({
        where: { id: req.params.id },
        include: {
          campaign: {
            include: { tasks: { orderBy: { stepOrder: 'asc' } } }
          }
        }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found.' });
      }
      if (job.testerId !== req.user!.id) {
        return res.status(403).json({ error: 'This job is not assigned to the current tester.' });
      }
      if (job.status !== JobStatus.CLAIMED) {
        return res.status(409).json({ error: 'Job is not in a claimable submission state.' });
      }

      const submittedIds = responses.map((response) => response.taskId);
      const uniqueIds = new Set(submittedIds);
      const expectedIds = new Set(job.campaign.tasks.map((task) => task.id));

      if (uniqueIds.size !== submittedIds.length) {
        return res.status(400).json({ error: 'Duplicate task responses are not allowed.' });
      }

      if (
        submittedIds.length !== expectedIds.size ||
        submittedIds.some((taskId) => !expectedIds.has(taskId))
      ) {
        return res.status(400).json({ error: 'Responses must contain every task from this campaign exactly once.' });
      }

      const submitted = await prisma.$transaction(async (tx) => {
        const transition = await tx.jobAssignment.updateMany({
          where: {
            id: job.id,
            testerId: req.user!.id,
            status: JobStatus.CLAIMED
          },
          data: {
            status: JobStatus.SUBMITTED,
            submittedAt: new Date()
          }
        });

        if (transition.count !== 1) {
          return false;
        }

        await tx.taskResponse.createMany({
          data: responses.map((response) => ({
            jobId: job.id,
            taskId: response.taskId,
            answerText: response.answerText
          }))
        });

        return true;
      });

      if (!submitted) {
        return res.status(409).json({ error: 'Job has already been submitted or changed state.' });
      }

      res.json({ success: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ error: 'Responses for this job were already recorded.' });
      }
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.get('/:id/review', requireAuth, requireRole(Role.OWNER), async (req: AuthRequest, res: Response) => {
  try {
    const job = await prisma.jobAssignment.findUnique({
      where: { id: req.params.id },
      include: {
        campaign: {
          include: { tasks: { orderBy: { stepOrder: 'asc' } } }
        },
        tester: {
          select: { id: true, email: true }
        },
        responses: {
          include: { task: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    if (job.campaign.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'This submission does not belong to the current owner.' });
    }
    if (!['SUBMITTED', 'APPROVED', 'REJECTED'].includes(job.status)) {
      return res.status(409).json({ error: 'Job has not been submitted yet.' });
    }

    const responses = [...job.responses].sort((a, b) => a.task.stepOrder - b.task.stepOrder);
    res.json({ ...job, responses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  '/:id/review',
  requireAuth,
  requireRole(Role.OWNER),
  [body('status').isIn([JobStatus.APPROVED, JobStatus.REJECTED])],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    try {
      const job = await prisma.jobAssignment.findUnique({
        where: { id: req.params.id },
        include: { campaign: true }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found.' });
      }
      if (job.campaign.ownerId !== req.user!.id) {
        return res.status(403).json({ error: 'This submission does not belong to the current owner.' });
      }
      if (job.status !== JobStatus.SUBMITTED) {
        return res.status(409).json({ error: 'Only submitted jobs can be reviewed.' });
      }

      const transition = await prisma.jobAssignment.updateMany({
        where: {
          id: job.id,
          status: JobStatus.SUBMITTED
        },
        data: {
          status: req.body.status,
          reviewedAt: new Date()
        }
      });

      if (transition.count !== 1) {
        return res.status(409).json({ error: 'Job was already reviewed or changed state.' });
      }

      const updated = await prisma.jobAssignment.findUnique({ where: { id: job.id } });
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export const jobRoutes = router;
