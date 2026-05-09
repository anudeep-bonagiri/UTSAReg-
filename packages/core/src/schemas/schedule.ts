import { z } from 'zod';
import { CrnSchema } from './section.js';
import { TermIdSchema } from './term.js';
import { CourseIdSchema } from './course.js';

/**
 * A user-bookmarked course. Kept loose: the user may not have picked a
 * specific section yet, just flagged the course as "interesting."
 */
export const SavedCourseSchema = z.object({
    courseId: CourseIdSchema,
    /** When the user bookmarked it — useful for sort & cleanup. */
    savedAt: z.string().datetime()
});

/**
 * One of possibly many user-built schedules for a given term ("Plan A",
 * "Plan B"). The `crns` are a multiset by intent — you can put a lab and a
 * lecture for the same course in here.
 *
 * The schedule grid renders by joining these CRNs back to Section records.
 */
export const SavedScheduleSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(80).default('Untitled'),
    termId: TermIdSchema,
    crns: z.array(CrnSchema).default([]),
    /** Sections the user has eyed but not committed to (for quick swap). */
    alternateCrns: z.array(CrnSchema).default([]),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    /** Free-text notes the user attached to this plan. */
    notes: z.string().max(2000).default('')
});

/**
 * Top-level user state stored in chrome.storage.local. Versioned so future
 * migrations can detect old layouts.
 */
export const UserStateSchema = z.object({
    schemaVersion: z.literal(1),
    activeTermId: TermIdSchema.optional(),
    savedCourses: z.array(SavedCourseSchema).default([]),
    schedules: z.array(SavedScheduleSchema).default([]),
    activeScheduleId: z.string().optional()
});

export type SavedCourse = z.infer<typeof SavedCourseSchema>;
export type SavedSchedule = z.infer<typeof SavedScheduleSchema>;
export type UserState = z.infer<typeof UserStateSchema>;
