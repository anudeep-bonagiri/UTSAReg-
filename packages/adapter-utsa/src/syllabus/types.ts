import { z } from 'zod';

/**
 * Wire-shape schemas for utsa.simplesyllabus.com's PUBLIC API.
 *
 * Endpoints used (verified May 2026, no auth required):
 *   GET /api/organization   -> 73 colleges + departments + course/section counts
 *   GET /api/term           -> 12 published terms with start/end dates
 *
 * The full /api/syllabus search requires authentication, so for now we
 * surface the org tree and term list as live context, plus deep-link to
 * the existing public library URL for the actual syllabus content.
 */

export const SyllabusOrganizationSchema = z.object({
    entity_id: z.string(),
    entity_type: z.string(),
    level: z.number().int(),
    parent_id: z.string().nullable(),
    name: z.string(),
    is_active: z.boolean().optional(),
    full_name: z.string().optional(),
    course_count: z.number().int().min(0).optional(),
    section_count: z.number().int().min(0).optional()
});

export const SyllabusOrganizationListSchema = z.object({
    items: z.array(SyllabusOrganizationSchema),
    length: z.number().int().min(0)
});

export const SyllabusTermSchema = z.object({
    entity_id: z.string(),
    entity_type: z.literal('term'),
    name: z.string(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    syllabus_due_date: z.string().nullable().optional(),
    is_published: z.boolean().optional(),
    is_active: z.boolean().optional()
});

export const SyllabusTermListSchema = z.object({
    items: z.array(SyllabusTermSchema),
    length: z.number().int().min(0)
});

export type SyllabusOrganization = z.infer<typeof SyllabusOrganizationSchema>;
export type SyllabusTerm = z.infer<typeof SyllabusTermSchema>;
