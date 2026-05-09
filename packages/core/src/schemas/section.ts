import { z } from 'zod';
import { CourseIdSchema } from './course.js';
import { TermIdSchema } from './term.js';

/**
 * A 5-digit Course Reference Number — the unique key for a section in ASAP.
 * Students paste these into the registration page to enroll.
 */
export const CrnSchema = z.string().regex(/^\d{5}$/, 'CRN must be exactly 5 digits');

/**
 * Single-letter weekday codes used by Banner / ASAP:
 *   M = Monday, T = Tuesday, W = Wednesday, R = Thursday, F = Friday,
 *   S = Saturday, U = Sunday.
 *
 * "Internet"/"TBA" don't appear here — those become an empty days[] plus a
 * modality of 'online' or a status of 'unscheduled'. Keeping the shape clean
 * means the scheduler never has to special-case "Internet" as a fake weekday.
 */
export const WeekdaySchema = z.enum(['M', 'T', 'W', 'R', 'F', 'S', 'U']);

/**
 * Minutes since midnight in local UTSA time (CT). 0..1439.
 *
 * We store minutes (not strings) so conflict detection is just integer
 * arithmetic. The schedule view formats minutes back to "11:00 AM" at render
 * time, so the source of truth stays simple.
 */
export const MinuteOfDaySchema = z.number().int().min(0).max(1439);

/**
 * A single weekly meeting block: which days, what time window, where.
 *
 * Some sections have multiple meeting blocks (e.g. lecture MWF + lab T) — the
 * Section type holds an array of these.
 */
export const MeetingSchema = z
    .object({
        days: z.array(WeekdaySchema),
        startMin: MinuteOfDaySchema,
        endMin: MinuteOfDaySchema,
        location: z.string().default(''),
        /** Some sections meet only on certain weeks (e.g. 8-week summer). */
        startDate: z.string().date().optional(),
        endDate: z.string().date().optional()
    })
    .refine((m) => m.endMin > m.startMin, {
        message: 'Meeting endMin must be after startMin',
        path: ['endMin']
    });

export const ModalitySchema = z.enum([
    'in_person',
    'online_async',
    'online_sync',
    'hybrid',
    'unspecified'
]);

export const SectionStatusSchema = z.enum(['open', 'closed', 'waitlist', 'cancelled']);

/**
 * A specific offering of a Course in a Term, taught by an instructor at a
 * specific time and place. The CRN is the primary key.
 */
export const SectionSchema = z.object({
    crn: CrnSchema,
    termId: TermIdSchema,
    courseId: CourseIdSchema,
    sectionCode: z.string().min(1), // "001", "002", "01H" honors, etc.
    title: z.string().min(1),
    instructorName: z.string().default('TBA'),
    /**
     * One section can meet multiple times per week with different patterns
     * (e.g. lecture MWF 9am + recitation T 4pm). Sequence matters; we render
     * them in array order.
     */
    meetings: z.array(MeetingSchema).default([]),
    modality: ModalitySchema.default('unspecified'),
    status: SectionStatusSchema.default('open'),
    capacity: z.number().int().min(0).optional(),
    enrolled: z.number().int().min(0).optional(),
    waitlistCount: z.number().int().min(0).optional(),
    creditHours: z.number().min(0).max(12).optional()
});

export type Crn = z.infer<typeof CrnSchema>;
export type Weekday = z.infer<typeof WeekdaySchema>;
export type MinuteOfDay = z.infer<typeof MinuteOfDaySchema>;
export type Meeting = z.infer<typeof MeetingSchema>;
export type Modality = z.infer<typeof ModalitySchema>;
export type SectionStatus = z.infer<typeof SectionStatusSchema>;
export type Section = z.infer<typeof SectionSchema>;
