import { Router } from 'express';
import { z } from 'zod';
import { db } from '../supabase.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();
router.use(auth, admin);
const userInput = z.object({ full_name: z.string().min(2).max(100), email: z.string().email(), role: z.enum(['user', 'admin']) });

router.get('/', async (_req, res, next) => {
  try { const { data, error } = await db.from('profiles').select('id,full_name,email,role,is_active,created_at').order('full_name'); if (error) throw error; res.json(data); } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const input = userInput.extend({ password: z.string().min(8).max(128) }).parse(req.body);
    const { data: created, error: createError } = await db.auth.admin.createUser({ email: input.email, password: input.password, email_confirm: true, user_metadata: { full_name: input.full_name } });
    if (createError) throw createError;
    const { data, error } = await db.from('profiles').update({ full_name: input.full_name, role: input.role, is_active: true }).eq('id', created.user.id).select('id,full_name,email,role,is_active,created_at').single();
    if (error) throw error; res.status(201).json(data);
  } catch (error) { if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues[0].message }); next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const input = userInput.partial().extend({ is_active: z.boolean().optional(), password: z.string().min(8).max(128).optional() }).parse(req.body);
    if (req.params.id === req.user.id && input.is_active === false) return res.status(400).json({ error: 'You cannot deactivate your own account.' });
    if (input.password || input.is_active !== undefined) { const { error } = await db.auth.admin.updateUserById(req.params.id, { ...(input.password && { password: input.password }), ...(input.is_active !== undefined && { ban_duration: input.is_active ? 'none' : '876000h' }) }); if (error) throw error; }
    const changes = Object.fromEntries(Object.entries(input).filter(([key]) => ['full_name', 'email', 'role', 'is_active'].includes(key)));
    const { data, error } = await db.from('profiles').update(changes).eq('id', req.params.id).select('id,full_name,email,role,is_active,created_at').single();
    if (error) throw error; res.json(data);
  } catch (error) { if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues[0].message }); next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try { if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account.' }); const { error } = await db.auth.admin.deleteUser(req.params.id); if (error) throw error; res.status(204).end(); } catch (error) { next(error); }
});
router.post('/:id/password-reset', async (req, res, next) => {
  try { const { data: profile, error: profileError } = await db.from('profiles').select('email').eq('id', req.params.id).single(); if (profileError) throw profileError; const { error } = await db.auth.resetPasswordForEmail(profile.email, { redirectTo: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/login` }); if (error) throw error; res.json({ ok: true }); } catch (error) { next(error); }
});
export default router;
