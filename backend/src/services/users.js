import { pool } from '../db/pool.js';

export async function getUserById(id) {
  const { rows } = await pool.query(
    `select u.id, u.email, p.full_name, p.phone, p.active_mode, p.purpose, p.trader_status
       from users u
       join profiles p on p.user_id = u.id
      where u.id = $1`,
    [id]
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    phone: r.phone,
    activeMode: r.active_mode,
    purpose: r.purpose,
    traderStatus: r.trader_status,
  };
}
