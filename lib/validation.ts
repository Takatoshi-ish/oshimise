import { z } from 'zod';

export const PlacesSearchQuery = z.object({
  q: z.string().trim().min(1).max(100),
  sessiontoken: z.string().min(1).max(100),
});

export const PlacesDetailsQuery = z.object({
  placeId: z.string().min(1),
  sessiontoken: z.string().min(1).max(100),
});

export const ShareSchema = z.string().trim().min(1).max(200);
export const PriceSchema = z.number().int().min(0).max(4).nullable();

export const PostShopSchema = z.object({
  placeId: z.string().min(1),
  memberId: z.string().uuid(),
  comment: ShareSchema,
  priceLevel: PriceSchema,
  genre: z.string().trim().max(30).nullable(),
  area: z.string().trim().max(30).nullable(),
  photoIds: z.array(z.string().uuid()).max(5).default([]),
});

export const PostRecSchema = z.object({
  shopId: z.string().uuid(),
  memberId: z.string().uuid(),
  comment: ShareSchema,
  photoIds: z.array(z.string().uuid()).max(5).default([]),
});
