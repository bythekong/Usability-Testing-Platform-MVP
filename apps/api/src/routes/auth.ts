import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { Role } from '@usability-testing/shared';
import { prisma } from '../db';
import { validateRequest } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { config } from '../config';

const router = Router();

function issueToken(id: string, role: string) {
  return jwt.sign({ id, role }, config.jwtSecret, { expiresIn: '7d' });
}

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').isIn([Role.OWNER, Role.TESTER])
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password, role } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, role },
      });

      res.status(201).json({
        token: issueToken(user.id, user.role),
        user: { id: user.id, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({
        token: issueToken(user.id, user.role),
        user: { id: user.id, email: user.email, role: user.role }
      });
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export const authRoutes = router;
