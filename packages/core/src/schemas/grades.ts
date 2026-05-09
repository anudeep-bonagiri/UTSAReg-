import { z } from 'zod';
import { CourseIdSchema } from './course.js';
import { InstructorIdSchema } from './instructor.js';
import { TermIdSchema } from './term.js';

/**
 * Letter-grade counts for a single (course, instructor, term) tuple.
 * Sourced from UTSA Bluebook / Office of Institutional Research exports.
 *
 * Counts are absolute (not percentages) so we can roll them up across terms.
 * Q (drop after deadline) is rare but tracked separately from W.
 */
export const GradeCountsSchema = z.object({
    A: z.number().int().min(0).default(0),
    B: z.number().int().min(0).default(0),
    C: z.number().int().min(0).default(0),
    D: z.number().int().min(0).default(0),
    F: z.number().int().min(0).default(0),
    W: z.number().int().min(0).default(0),
    Q: z.number().int().min(0).default(0),
    /** Pass/Fail and incomplete bucket — usually 0 for letter-graded courses. */
    other: z.number().int().min(0).default(0)
});

export const GradeDistributionSchema = z.object({
    courseId: CourseIdSchema,
    instructorId: InstructorIdSchema,
    /** Term this distribution covers. May be aggregate (e.g. "all-time"). */
    termId: TermIdSchema.optional(),
    counts: GradeCountsSchema,
    totalStudents: z.number().int().min(0)
});

export type GradeCounts = z.infer<typeof GradeCountsSchema>;
export type GradeDistribution = z.infer<typeof GradeDistributionSchema>;

/** GPA value of each letter on the standard 4.0 scale. */
const GPA_POINTS: Readonly<Record<keyof GradeCounts, number | null>> = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    F: 0.0,
    // W/Q/other don't count toward GPA — null skips them.
    W: null,
    Q: null,
    other: null
};

/**
 * Compute the GPA from a GradeCounts. Returns null when no graded students
 * exist (everyone withdrew, or empty input).
 */
export const gpaFromCounts = (counts: GradeCounts): number | null => {
    let totalPoints = 0;
    let totalGraded = 0;
    for (const [letter, value] of Object.entries(GPA_POINTS) as [
        keyof GradeCounts,
        number | null
    ][]) {
        if (value === null) continue;
        const n = counts[letter];
        totalPoints += n * value;
        totalGraded += n;
    }
    return totalGraded === 0 ? null : totalPoints / totalGraded;
};

/**
 * Percent of students who earned at least a C in this distribution. A common
 * difficulty proxy: high "C-or-better" rate = forgiving grading curve.
 */
export const passRateFromCounts = (counts: GradeCounts): number | null => {
    const passing = counts.A + counts.B + counts.C;
    const totalLetterGraded = passing + counts.D + counts.F;
    return totalLetterGraded === 0 ? null : passing / totalLetterGraded;
};

/**
 * Withdrawal rate: how often students bail. High W% is the strongest single
 * "this class is rough" signal in the dataset.
 */
export const withdrawRateFromCounts = (counts: GradeCounts): number | null => {
    const total = counts.A + counts.B + counts.C + counts.D + counts.F + counts.W + counts.Q;
    return total === 0 ? null : (counts.W + counts.Q) / total;
};
