import { Router } from 'express';
import { z } from 'zod';
import { db } from '../supabase.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router(); router.use(auth);
const roomSchema = z.object({
  name: z.string().min(2).max(100), building_name: z.string().min(2).max(100), floor: z.string().min(1).max(30), room_number: z.string().min(1).max(30),
  type: z.string().min(2).max(60), capacity: z.coerce.number().int().positive(), equipment: z.array(z.string().min(1).max(80)).default([]),
  description: z.string().min(5).max(1000), is_active: z.boolean().default(true), floor_plan_id: z.string().uuid().nullable().optional(), map_x: z.coerce.number().min(0).max(100).nullable().optional(), map_y: z.coerce.number().min(0).max(100).nullable().optional()
});
const select = '*,floor_plans(id,name,building_name,floor,image_url)';

router.get('/',async(req,res,next)=>{try{let q=db.from('rooms').select(select).order('name');if(req.query.admin!=='true')q=q.eq('is_active',true);if(req.query.search)q=q.or(`name.ilike.%${req.query.search}%,location.ilike.%${req.query.search}%,building_name.ilike.%${req.query.search}%`);if(req.query.capacity)q=q.gte('capacity',Number(req.query.capacity));const {data,error}=await q;if(error)throw error;res.json(data)}catch(error){next(error)}});
router.get('/:id',async(req,res,next)=>{try{const {data,error}=await db.from('rooms').select(select).eq('id',req.params.id).single();if(error)throw error;if(!data.is_active&&req.profile.role!=='admin')return res.status(404).json({error:'Room not found'});res.json(data)}catch(error){next(error)}});
router.post('/',admin,async(req,res,next)=>{try{const value=roomSchema.parse(req.body);const {data,error}=await db.from('rooms').insert({...value,location:`${value.building_name} · ${value.floor}`}).select(select).single();if(error)throw error;res.status(201).json(data)}catch(error){if(error instanceof z.ZodError)return res.status(400).json({error:error.issues[0].message});next(error)}});
router.patch('/:id',admin,async(req,res,next)=>{try{const value=roomSchema.partial().parse(req.body);const changes={...value};if(value.building_name||value.floor)changes.location=`${value.building_name||''} · ${value.floor||''}`.replace(/^ · | · $/g,'');const {data,error}=await db.from('rooms').update(changes).eq('id',req.params.id).select(select).single();if(error)throw error;res.json(data)}catch(error){if(error instanceof z.ZodError)return res.status(400).json({error:error.issues[0].message});next(error)}});
router.delete('/:id',admin,async(req,res,next)=>{try{const {error}=await db.from('rooms').update({is_active:false}).eq('id',req.params.id);if(error)throw error;res.status(204).end()}catch(error){next(error)}});
export default router;
