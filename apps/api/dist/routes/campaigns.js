"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const shared_1 = require("@usability-testing/shared");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// Create Campaign (OWNER only)
router.post('/', auth_1.requireAuth, (0, auth_1.requireRole)(shared_1.Role.OWNER), [
    (0, express_validator_1.body)('targetUrl').isURL(),
    (0, express_validator_1.body)('rewardAmount').isInt({ min: 1 }),
    (0, express_validator_1.body)('tasks').isArray({ min: 1 }),
    (0, express_validator_1.body)('tasks.*.instruction').isString().notEmpty()
], validate_1.validateRequest, async (req, res) => {
    try {
        const { targetUrl, rewardAmount, tasks } = req.body;
        const campaign = await db_1.prisma.testCampaign.create({
            data: {
                ownerId: req.user.id,
                targetUrl,
                rewardAmount,
                tasks: {
                    create: tasks.map((task, index) => ({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get my campaigns (OWNER only)
router.get('/', auth_1.requireAuth, (0, auth_1.requireRole)(shared_1.Role.OWNER), async (req, res) => {
    try {
        const campaigns = await db_1.prisma.testCampaign.findMany({
            where: { ownerId: req.user.id },
            include: { tasks: true, jobs: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(campaigns);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.campaignRoutes = router;
