"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const shared_1 = require("@usability-testing/shared");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// List available jobs (TESTER only)
router.get('/available', auth_1.requireAuth, (0, auth_1.requireRole)(shared_1.Role.TESTER), async (req, res) => {
    try {
        const jobs = await db_1.prisma.jobAssignment.findMany({
            where: { status: 'AVAILABLE', testerId: null },
            include: { campaign: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// List claimed/active jobs for current tester
router.get('/my', auth_1.requireAuth, (0, auth_1.requireRole)(shared_1.Role.TESTER), async (req, res) => {
    try {
        const jobs = await db_1.prisma.jobAssignment.findMany({
            where: { testerId: req.user.id },
            include: { campaign: { include: { tasks: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Claim a job (concurrency safe via updateMany where status = AVAILABLE)
router.post('/:id/claim', auth_1.requireAuth, (0, auth_1.requireRole)(shared_1.Role.TESTER), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.prisma.jobAssignment.updateMany({
            where: {
                id,
                status: 'AVAILABLE',
                testerId: null
            },
            data: {
                status: 'CLAIMED',
                testerId: req.user.id
            }
        });
        if (result.count === 0) {
            return res.status(400).json({ error: 'Job is no longer available or does not exist.' });
        }
        const job = await db_1.prisma.jobAssignment.findUnique({
            where: { id },
            include: { campaign: { include: { tasks: true } } }
        });
        res.json(job);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Submit a job
router.post('/:id/submit', auth_1.requireAuth, (0, auth_1.requireRole)(shared_1.Role.TESTER), [
    (0, express_validator_1.body)('responses').isArray({ min: 1 }),
    (0, express_validator_1.body)('responses.*.taskId').isString().notEmpty(),
    (0, express_validator_1.body)('responses.*.answerText').isString()
], validate_1.validateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const { responses } = req.body;
        // Verify ownership and status
        const job = await db_1.prisma.jobAssignment.findUnique({ where: { id } });
        if (!job || job.testerId !== req.user.id || job.status !== 'CLAIMED') {
            return res.status(403).json({ error: 'Invalid job state or not owner.' });
        }
        await db_1.prisma.$transaction(async (tx) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Review a job (OWNER only)
router.post('/:id/review', auth_1.requireAuth, (0, auth_1.requireRole)(shared_1.Role.OWNER), [
    (0, express_validator_1.body)('status').isIn([shared_1.JobStatus.APPROVED, shared_1.JobStatus.REJECTED])
], validate_1.validateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const job = await db_1.prisma.jobAssignment.findUnique({
            where: { id },
            include: { campaign: true }
        });
        if (!job || job.campaign.ownerId !== req.user.id || job.status !== 'SUBMITTED') {
            return res.status(403).json({ error: 'Invalid job state or not owner.' });
        }
        const updated = await db_1.prisma.jobAssignment.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.jobRoutes = router;
