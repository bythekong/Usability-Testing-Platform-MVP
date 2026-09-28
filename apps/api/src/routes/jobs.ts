import { Router, Response } from 'express';
import { body } from 'express-validator';
import { Role, JobStatus } from '@usability-testing/shared';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Setup Multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'videos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate filename based on jobId and taskId
    const { id, taskId } = req.params;
    cb(null, `${id}_${taskId}.webm`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

router.get('/available', requireAuth, requireRole(Role.TESTER), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all campaigns this tester has already interacted with
    const myJobs = await prisma.jobAssignment.findMany({
      where: { testerId: req.user!.id },
      select: { campaignId: true }
    });
    const myCampaignIds = myJobs.map(j => j.campaignId);

    const jobs = await prisma.jobAssignment.findMany({
      where: { 
        status: JobStatus.AVAILABLE, 
        testerId: null, 
        campaign: { isLocked: false },
        campaignId: { notIn: myCampaignIds }
      },
      distinct: ['campaignId'],
      include: {
        campaign: {
          include: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // In-memory filter for demographic targeting
    const filteredJobs = jobs.filter(job => {
      const c = job.campaign;
      
      // Age Check
      if (c.targetMinAge !== null) {
        if (!user.age || user.age < c.targetMinAge) return false;
      }
      if (c.targetMaxAge !== null) {
        if (!user.age || user.age > c.targetMaxAge) return false;
      }

      // Gender Check
      if (c.targetGenders && c.targetGenders.length > 0) {
        if (!user.gender || !c.targetGenders.includes(user.gender)) return false;
      }

      // IT Expertise Check
      if (c.targetItExpertises && c.targetItExpertises.length > 0) {
        if (!user.itExpertise || !c.targetItExpertises.includes(user.itExpertise)) return false;
      }

      return true;
    });

    res.json(filteredJobs);
  } catch (error) {
    console.error(error);
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
        },
        responses: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const sanitizedJobs = jobs.map(job => {
      if (job.campaign.isLocked) {
        return {
          ...job,
          campaign: {
            ...job.campaign,
            targetUrl: 'https://[LOCKED]'
          },
          responses: job.responses.map(r => ({
            ...r,
            videoUrl: null
          }))
        };
      }
      return job;
    });

    res.json(sanitizedJobs);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/claim', requireAuth, requireRole(Role.TESTER), async (req: AuthRequest, res: Response) => {
  try {
    const jobToClaim = await prisma.jobAssignment.findUnique({
      where: { id: req.params.id },
      select: { campaignId: true, status: true, testerId: true }
    });

    if (!jobToClaim || jobToClaim.status !== JobStatus.AVAILABLE || jobToClaim.testerId !== null) {
      return res.status(409).json({ error: 'Job is no longer available or does not exist.' });
    }

    const existingJob = await prisma.jobAssignment.findFirst({
      where: {
        campaignId: jobToClaim.campaignId,
        testerId: req.user!.id
      }
    });

    if (existingJob) {
      return res.status(409).json({ error: 'You have already claimed a job for this campaign.' });
    }

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

router.delete('/:id/reset', requireAuth, requireRole(Role.TESTER), async (req: AuthRequest, res: Response) => {
  try {
    const job = await prisma.jobAssignment.findUnique({
      where: { id: req.params.id },
      include: { responses: true }
    });

    if (!job || job.testerId !== req.user!.id) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    if (job.status !== JobStatus.CLAIMED) {
      return res.status(400).json({ error: 'Cannot reset a job that has already been submitted' });
    }

    // Delete video files from fs
    for (const response of job.responses) {
      if (response.videoUrl) {
        try {
          const filename = response.videoUrl.replace('/uploads/videos/', '');
          const filePath = path.join(process.cwd(), 'uploads', 'videos', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.error('Failed to delete video file', e);
        }
      }
    }

    // Delete responses in DB
    await prisma.taskResponse.deleteMany({
      where: { jobId: job.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id/tasks/:taskId/response', requireAuth, requireRole(Role.TESTER), async (req: AuthRequest, res: Response) => {
  try {
    const { id, taskId } = req.params;
    
    const job = await prisma.jobAssignment.findUnique({
      where: { id },
      include: { responses: { where: { taskId } } }
    });

    if (!job || job.testerId !== req.user!.id) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    if (job.status !== JobStatus.CLAIMED) {
      return res.status(400).json({ error: 'Cannot reset task for a submitted job' });
    }

    const response = job.responses[0];
    if (response) {
      // Delete video file
      if (response.videoUrl) {
        try {
          const filename = response.videoUrl.replace('/uploads/videos/', '');
          const filePath = path.join(process.cwd(), 'uploads', 'videos', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.error('Failed to delete video file', e);
        }
      }

      // Delete DB record
      await prisma.taskResponse.delete({
        where: { id: response.id }
      });
    }

    res.json({ success: true });
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

        for (const response of responses) {
          await tx.taskResponse.upsert({
            where: {
              jobId_taskId: {
                jobId: job.id,
                taskId: response.taskId
              }
            },
            update: {
              answerText: response.answerText
            },
            create: {
              jobId: job.id,
              taskId: response.taskId,
              answerText: response.answerText
            }
          });
        }

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
  '/:id/tasks/:taskId/video',
  requireAuth,
  requireRole(Role.TESTER),
  upload.single('video'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id, taskId } = req.params;
      
      const job = await prisma.jobAssignment.findUnique({
        where: { id },
        include: { campaign: { include: { tasks: true } } }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      if (job.testerId !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      if (job.status !== JobStatus.CLAIMED) {
        return res.status(409).json({ error: 'Job must be claimed to upload video' });
      }

      const task = job.campaign.tasks.find((t: any) => t.id === taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found in this job' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      // Parse and validate structuredAnswer from multipart form field
      let structuredAnswer: object | null = null;
      if (req.body.structuredAnswer) {
        try {
          structuredAnswer = JSON.parse(req.body.structuredAnswer);
        } catch {
          return res.status(400).json({ error: 'Invalid structuredAnswer JSON' });
        }

        // Validate structuredAnswer matches the task type
        const taskType = (task as any).taskType || 'FREE_RESPONSE';
        if (taskType === 'MULTIPLE_CHOICE') {
          const sa = structuredAnswer as any;
          if (sa.type !== 'MULTIPLE_CHOICE' || typeof sa.value !== 'string') {
            return res.status(400).json({ error: 'structuredAnswer must be {type:"MULTIPLE_CHOICE", value: string}' });
          }
          const choices: string[] = (task as any).choices || [];
          if (!choices.includes(sa.value)) {
            return res.status(400).json({ error: 'Selected choice is not valid for this task' });
          }
        } else if (taskType === 'RATING_SCALE') {
          const sa = structuredAnswer as any;
          if (sa.type !== 'RATING_SCALE' || typeof sa.value !== 'number') {
            return res.status(400).json({ error: 'structuredAnswer must be {type:"RATING_SCALE", value: number}' });
          }
          const ratingMin = (task as any).ratingMin ?? 1;
          const ratingMax = (task as any).ratingMax ?? 5;
          if (sa.value < ratingMin || sa.value > ratingMax) {
            return res.status(400).json({ error: `Rating value must be between ${ratingMin} and ${ratingMax}` });
          }
        }
      }

      // Check for existing response to enforce structuredAnswer immutability
      const existingResponse = await prisma.taskResponse.findUnique({
        where: { jobId_taskId: { jobId: id, taskId } }
      });

      // Structured answer is locked once set — never allow overwrite
      const shouldLockAnswer = structuredAnswer !== null && !existingResponse?.structuredAnswerLockedAt;
      const updateData: any = {
        videoUrl: `/uploads/videos/${req.file.filename}`,
      };
      if (shouldLockAnswer) {
        updateData.structuredAnswer = structuredAnswer;
        updateData.structuredAnswerLockedAt = new Date();
      }

      await prisma.taskResponse.upsert({
        where: { jobId_taskId: { jobId: id, taskId } },
        update: updateData,
        create: {
          jobId: id,
          taskId,
          videoUrl: `/uploads/videos/${req.file.filename}`,
          ...(structuredAnswer ? {
            structuredAnswer,
            structuredAnswerLockedAt: new Date(),
          } : {}),
        }
      });

      res.json({ success: true, url: `/uploads/videos/${req.file.filename}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

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
