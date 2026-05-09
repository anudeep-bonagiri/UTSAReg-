import { z } from 'zod';

/**
 * Stable internal ID for an instructor across our data sources.
 *
 * Format: lowercase-first-last with hyphens, e.g. "murtuza-jadliwala".
 * Generated from the canonical "First Last" form — see normalizeInstructorName
 * in adapter-utsa.
 */
export const InstructorIdSchema = z
    .string()
    .regex(/^[a-z]+(-[a-z]+)+$/, 'InstructorId must be lowercase-hyphenated');

export const InstructorSchema = z.object({
    id: InstructorIdSchema,
    /** Canonical "First Last" form. */
    name: z.string().min(1),
    /** Department, if known (often missing). */
    department: z.string().default(''),
    /** Free-text title (Lecturer, Associate Professor, Adjunct...). */
    title: z.string().default('')
});

/**
 * Rate My Professors snapshot for a single UTSA instructor.
 * `legacyId` is RMP's internal numeric ID — we use it to deep-link.
 */
export const RmpRatingSchema = z.object({
    instructorId: InstructorIdSchema,
    legacyId: z.string().min(1),
    name: z.string().min(1),
    department: z.string().default(''),
    avgRating: z.number().min(0).max(5),
    numRatings: z.number().int().min(0),
    avgDifficulty: z.number().min(0).max(5).optional(),
    wouldTakeAgainPercent: z.number().min(0).max(100).optional(),
    tags: z.array(z.string()).default([]),
    /** ISO timestamp of when this snapshot was scraped. */
    fetchedAt: z.string().datetime()
});

export type InstructorId = z.infer<typeof InstructorIdSchema>;
export type Instructor = z.infer<typeof InstructorSchema>;
export type RmpRating = z.infer<typeof RmpRatingSchema>;
