import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  CreateJobRequestInputSchema,
  CreateOfferInputSchema,
  JobRequestSchema,
  OfferSchema,
  BookingSchema,
} from '@zmd/shared';
import { newId } from './lib/id.js';
import { loadDb, saveDb } from './lib/store.js';

/**
 * Extremely lightweight auth stub:
 * - Send header `x-user-id` to act as a user
 * - Send header `x-role` as customer|provider|admin
 * Replace with real auth later.
 */
function getActor(req: any) {
  const userId = req.headers['x-user-id'];
  const role = req.headers['x-role'];
  if (!userId || !role) return null;
  return { userId: String(userId), role: String(role) };
}

export async function registerRoutes(app: FastifyInstance, dataPath: string) {
  app.get('/health', async () => ({ ok: true }));

  app.get('/categories', async () => {
    const db = loadDb(dataPath);
    return db.categories.filter((c) => c.active);
  });

  app.get('/job-requests', async (req) => {
    const db = loadDb(dataPath);
    const q = z
      .object({
        status: z.string().optional(),
        categoryId: z.string().optional(),
      })
      .parse((req as any).query ?? {});
    let rows = db.jobRequests as any[];
    if (q.status) rows = rows.filter((r) => r.status === q.status);
    if (q.categoryId) rows = rows.filter((r) => r.categoryId === q.categoryId);
    return rows;
  });

  app.post('/job-requests', async (req, reply) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'customer') return reply.code(401).send({ error: 'customer auth required' });

    const input = CreateJobRequestInputSchema.parse((req as any).body ?? {});
    const db = loadDb(dataPath);

    const cat = db.categories.find((c) => c.id === input.categoryId);
    if (!cat || !cat.active) return reply.code(400).send({ error: 'invalid category' });
    if (cat.isProhibited) return reply.code(400).send({ error: 'category prohibited' });

    const now = new Date().toISOString();
    const row = JobRequestSchema.parse({
      id: newId('jr'),
      customerId: actor.userId,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      pricingMode: input.pricingMode,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      locationText: input.locationText,
      location: input.location,
      timeWindowStart: input.timeWindowStart,
      timeWindowEnd: input.timeWindowEnd,
      status: 'OPEN',
      createdAt: now,
    });

    db.jobRequests.push(row);
    saveDb(dataPath, db);
    return row;
  });

  app.get('/job-requests/:id/offers', async (req, reply) => {
    const db = loadDb(dataPath);
    const id = (req as any).params.id;
    const jr = db.jobRequests.find((r) => r.id === id);
    if (!jr) return reply.code(404).send({ error: 'not found' });
    return db.offers.filter((o) => o.jobRequestId === id);
  });

  app.post('/offers', async (req, reply) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'provider') return reply.code(401).send({ error: 'provider auth required' });

    const input = CreateOfferInputSchema.parse((req as any).body ?? {});
    const db = loadDb(dataPath);

    const jr = db.jobRequests.find((r) => r.id === input.jobRequestId);
    if (!jr) return reply.code(404).send({ error: 'job request not found' });
    if (jr.status !== 'OPEN') return reply.code(400).send({ error: 'job request not open' });

    const now = new Date().toISOString();
    const offer = OfferSchema.parse({
      id: newId('of'),
      jobRequestId: jr.id,
      providerId: actor.userId,
      message: input.message ?? '',
      proposedPrice: input.proposedPrice ?? null,
      hourlyRate: input.hourlyRate ?? null,
      status: 'SENT',
      createdAt: now,
    });

    db.offers.push(offer);
    saveDb(dataPath, db);
    return offer;
  });

  app.post('/offers/:id/accept', async (req, reply) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'customer') return reply.code(401).send({ error: 'customer auth required' });

    const db = loadDb(dataPath);
    const offerId = (req as any).params.id;
    const offer = db.offers.find((o) => o.id === offerId);
    if (!offer) return reply.code(404).send({ error: 'offer not found' });

    const jr = db.jobRequests.find((r) => r.id === offer.jobRequestId);
    if (!jr) return reply.code(404).send({ error: 'job request not found' });
    if (jr.customerId !== actor.userId) return reply.code(403).send({ error: 'not your job request' });
    if (jr.status !== 'OPEN') return reply.code(400).send({ error: 'job request not open' });

    // Mark other offers as rejected
    db.offers = db.offers.map((o) => {
      if (o.jobRequestId === jr.id && o.id !== offerId && o.status === 'SENT') return { ...o, status: 'REJECTED' };
      if (o.id === offerId) return { ...o, status: 'ACCEPTED' };
      return o;
    });

    // Create booking
    const now = new Date().toISOString();
    const booking = BookingSchema.parse({
      id: newId('bk'),
      jobRequestId: jr.id,
      offerId: offerId,
      customerId: actor.userId,
      providerId: offer.providerId,
      agreedPrice: offer.proposedPrice ?? offer.hourlyRate ?? null,
      pricingMode: jr.pricingMode,
      status: 'CONFIRMED',
      createdAt: now,
    });

    db.bookings.push(booking);

    // Update job request
    db.jobRequests = db.jobRequests.map((r) => (r.id === jr.id ? { ...r, status: 'BOOKED' } : r));

    saveDb(dataPath, db);
    return booking;
  });

  app.get('/bookings', async (req) => {
    const actor = getActor(req);
    const db = loadDb(dataPath);
    if (!actor) return [];
    // customers see their bookings; providers see theirs; admin sees all
    if (actor.role === 'admin') return db.bookings;
    return db.bookings.filter((b) => b.customerId === actor.userId || b.providerId === actor.userId);
  });

  app.post('/bookings/:id/status', async (req, reply) => {
    const actor = getActor(req);
    if (!actor) return reply.code(401).send({ error: 'auth required' });

    const body = z.object({ status: z.string() }).parse((req as any).body ?? {});
    const db = loadDb(dataPath);
    const id = (req as any).params.id;
    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) return reply.code(404).send({ error: 'booking not found' });

    const allowed = actor.role === 'admin' || booking.customerId === actor.userId || booking.providerId === actor.userId;
    if (!allowed) return reply.code(403).send({ error: 'not allowed' });

    const next = body.status;
    // minimal validation; replace with proper state machine later
    booking.status = next;
    saveDb(dataPath, db);
    return booking;
  });
}
