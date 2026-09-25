"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const shared_1 = require("@usability-testing/shared");
const db_1 = require("../db");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-for-mvp';
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('role').isIn([shared_1.Role.OWNER, shared_1.Role.TESTER])
], validate_1.validateRequest, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: { email, password: hashedPassword, role },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').notEmpty()
], validate_1.validateRequest, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/me', auth_1.requireAuth, async (req, res) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, role: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRoutes = router;
