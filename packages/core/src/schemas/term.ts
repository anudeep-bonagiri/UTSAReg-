import { z } from 'zod';

/**
 * UTSA term identifier in Banner's six-digit format.
 *
 * Format: YYYY + season-code where:
 *   - 10 = Spring
 *   - 30 = Summer
 *   - 50 = Fall (UTSA convention; Banner default is 80, but UTSA uses 50)
 *
 * Example: "202650" = Fall 2026.
 *
 * The season-code regex is intentionally permissive (10|20|30|40|50|60|80) so
 * we accept whatever the registrar publishes; the human label is the source of
 * truth for users.
 */
export const TermIdSchema = z
    .string()
    .regex(/^\d{4}(10|20|30|40|50|60|80)$/, 'Term ID must be YYYY + 2-digit season code');

export const TermSeasonSchema = z.enum(['Spring', 'Summer', 'Fall', 'Winter']);

export const TermSchema = z.object({
    id: TermIdSchema,
    label: z.string().min(1),
    season: TermSeasonSchema,
    year: z.number().int().min(2000).max(2100),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    registrationOpensAt: z.string().datetime().optional(),
    registrationClosesAt: z.string().datetime().optional()
});

export type TermId = z.infer<typeof TermIdSchema>;
export type TermSeason = z.infer<typeof TermSeasonSchema>;
export type Term = z.infer<typeof TermSchema>;
