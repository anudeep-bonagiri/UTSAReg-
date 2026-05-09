import { z } from 'zod';

/**
 * A four-letter (or three-letter) UTSA subject prefix.
 *
 * Valid: CS, MAT, ENG, BIO, COE, ESL ...
 * Width pinned at 2-4 to absorb edge cases like "ESL" and rare 4-letter subjects.
 */
export const SubjectSchema = z
    .string()
    .min(2)
    .max(4)
    .regex(/^[A-Z]+$/, 'Subject must be uppercase letters');

/**
 * UTSA course numbers are 4 digits. The leading digit hints at level:
 *   1xxx — freshman, 2xxx — sophomore, 3xxx — junior, 4xxx — senior,
 *   5xxx/6xxx/7xxx — graduate.
 */
export const CourseNumberSchema = z.string().regex(/^\d{4}$/, 'Course number must be 4 digits');

/**
 * Stable ID for a course: SUBJECT + NUMBER, no whitespace.
 * Used as the primary key when joining Course ↔ Section ↔ Grade.
 */
export const CourseIdSchema = z
    .string()
    .regex(/^[A-Z]{2,4}\d{4}$/, 'Course ID must be SUBJECT+NUMBER (e.g. CS3343)');

export const CourseLevelSchema = z.enum(['undergraduate', 'graduate']);

/**
 * The catalog-level description of a course (subject + number + title +
 * description + prereqs). One Course has many Sections (per Term).
 */
export const CourseSchema = z.object({
    id: CourseIdSchema,
    subject: SubjectSchema,
    number: CourseNumberSchema,
    title: z.string().min(1),
    description: z.string().default(''),
    creditHours: z.number().min(0).max(12),
    /** Free-text prereq from catalog; structured DAG lives in core/prereq. */
    prereqsRaw: z.string().default(''),
    level: CourseLevelSchema.default('undergraduate'),
    /** Departments this course is cross-listed under, if any. */
    crossListed: z.array(SubjectSchema).default([])
});

export type Subject = z.infer<typeof SubjectSchema>;
export type CourseNumber = z.infer<typeof CourseNumberSchema>;
export type CourseId = z.infer<typeof CourseIdSchema>;
export type CourseLevel = z.infer<typeof CourseLevelSchema>;
export type Course = z.infer<typeof CourseSchema>;

/**
 * Construct the canonical CourseId from subject + number.
 * Pure helper, intentionally narrow — heavier joins live elsewhere.
 */
export const courseIdOf = (subject: Subject, number: CourseNumber): CourseId =>
    `${subject}${number}`;
