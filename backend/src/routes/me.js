import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { getUserById } from '../services/users.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.userId);
    if (!user) return res.status(401).json({ error: 'Please log in again.' });
    res.json(user);
  })
);

// Answer to "What brings you to Tradr?"
router.patch(
  '/purpose',
  asyncHandler(async (req, res) => {
    const parsed = z.object({ purpose: z.enum(['find', 'offer', 'both']) }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Choose one of the options.' });
    }
    const { purpose } = parsed.data;

    // People who want to offer services start a draft trader profile.
    await pool.query(
      `update profiles
          set purpose = $1::text,
              trader_status = case
                when $1::text in ('offer', 'both') and trader_status = 'none' then 'draft'
                else trader_status
              end
        where user_id = $2`,
      [purpose, req.userId]
    );
    res.json(await getUserById(req.userId));
  })
);

// The Customer | Trader switch.
router.patch(
  '/mode',
  asyncHandler(async (req, res) => {
    const parsed = z.object({ mode: z.enum(['customer', 'trader']) }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Mode must be customer or trader.' });
    }
    const { mode } = parsed.data;

    if (mode === 'trader') {
      const user = await getUserById(req.userId);
      if (user.traderStatus !== 'approved') {
        return res.status(403).json({ error: 'Your trader profile has not been approved yet.' });
      }
    }
    await pool.query('update profiles set active_mode = $1 where user_id = $2', [mode, req.userId]);
    res.json(await getUserById(req.userId));
  })
);

export default router;
