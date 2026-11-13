import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { config } from '../config.js';
import { pool } from '../db/pool.js';
import { getUserById } from '../services/users.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
});

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[a-zA-Z]/, 'Password needs at least one letter.')
  .regex(/[0-9]/, 'Password needs at least one number.')
  .regex(/[^a-zA-Z0-9]/, 'Password needs at least one special character.');

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  phone: z.string().trim().max(20).optional(),
  password,
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

const signToken = (userId) =>
  jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '7d' });

// Used so a wrong email takes as long to reject as a wrong password.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { fullName, email, phone, password } = parsed.data;
    const hash = await bcrypt.hash(password, 12);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = await client.query(
        'insert into users (email, password_hash) values ($1, $2) returning id',
        [email, hash]
      );
      const userId = inserted.rows[0].id;
      await client.query(
        'insert into profiles (user_id, full_name, phone) values ($1, $2, $3)',
        [userId, fullName, phone || null]
      );
      await client.query('COMMIT');

      const user = await getUserById(userId);
      res.status(201).json({ token: signToken(userId), user });
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        return res.status(409).json({ error: 'That email is already registered.' });
      }
      throw err;
    } finally {
      client.release();
    }
  })
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { email, password } = parsed.data;

    const { rows } = await pool.query(
      'select id, password_hash from users where email = $1',
      [email]
    );
    const row = rows[0];
    const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
    if (!row || !ok) {
      return res.status(401).json({ error: 'Wrong email or password.' });
    }

    const user = await getUserById(row.id);
    res.json({ token: signToken(row.id), user });
  })
);

export default router;
