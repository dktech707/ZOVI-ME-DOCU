import { z } from 'zod';

/**
 * Roles
 */
export const RoleSchema = z.enum(['customer', 'provider', 'admin']);
export type Role = z.infer<typeof RoleSchema>;

/**
 * Pricing modes (category-agnostic)
 */
export const PricingModeSchema = z.enum(['FIXED', 'HOURLY', 'QUOTE']);
export type PricingMode = z.infer<typeof PricingModeSchema>;

/**
 * Booking / request status
 */
export const JobRequestStatusSchema = z.enum(['OPEN', 'CANCELLED', 'BOOKED', 'COMPLETED']);
export type JobRequestStatus = z.infer<typeof JobRequestStatusSchema>;

export const OfferStatusSchema = z.enum(['SENT', 'WITHDRAWN', 'ACCEPTED', 'REJECTED']);
export type OfferStatus = z.infer<typeof OfferStatusSchema>;

export const BookingStatusSchema = z.enum(['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

/**
 * Core entities (minimal)
 */
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  isProhibited: z.boolean().default(false),
  requiresVerification: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type Category = z.infer<typeof CategorySchema>;

export const GeoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type GeoPoint = z.infer<typeof GeoPointSchema>;

export const JobRequestSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  categoryId: z.string(),
  title: z.string().min(3),
  description: z.string().min(5),
  pricingMode: PricingModeSchema,
  budgetMin: z.number().nonnegative().nullable().default(null),
  budgetMax: z.number().nonnegative().nullable().default(null),
  locationText: z.string().min(3),
  location: GeoPointSchema,
  timeWindowStart: z.string(), // ISO
  timeWindowEnd: z.string(),   // ISO
  status: JobRequestStatusSchema,
  createdAt: z.string(),
});

export type JobRequest = z.infer<typeof JobRequestSchema>;

export const OfferSchema = z.object({
  id: z.string(),
  jobRequestId: z.string(),
  providerId: z.string(),
  message: z.string().default(''),
  proposedPrice: z.number().nonnegative().nullable().default(null),
  hourlyRate: z.number().nonnegative().nullable().default(null),
  status: OfferStatusSchema,
  createdAt: z.string(),
});

export type Offer = z.infer<typeof OfferSchema>;

export const BookingSchema = z.object({
  id: z.string(),
  jobRequestId: z.string(),
  offerId: z.string(),
  customerId: z.string(),
  providerId: z.string(),
  agreedPrice: z.number().nonnegative().nullable().default(null),
  pricingMode: PricingModeSchema,
  status: BookingStatusSchema,
  createdAt: z.string(),
});

export type Booking = z.infer<typeof BookingSchema>;

/**
 * Requests payloads
 */
export const CreateJobRequestInputSchema = z.object({
  categoryId: z.string(),
  title: z.string().min(3),
  description: z.string().min(5),
  pricingMode: PricingModeSchema,
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  locationText: z.string().min(3),
  location: GeoPointSchema,
  timeWindowStart: z.string(),
  timeWindowEnd: z.string(),
});
export type CreateJobRequestInput = z.infer<typeof CreateJobRequestInputSchema>;

export const CreateOfferInputSchema = z.object({
  jobRequestId: z.string(),
  message: z.string().optional(),
  proposedPrice: z.number().nonnegative().optional(),
  hourlyRate: z.number().nonnegative().optional(),
});
export type CreateOfferInput = z.infer<typeof CreateOfferInputSchema>;
