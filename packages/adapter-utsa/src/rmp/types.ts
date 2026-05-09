import { z } from 'zod';

/**
 * RMP GraphQL response schemas.
 *
 * These describe what comes off the wire — never what we expose to the rest
 * of the app. The adapter's job is to translate from this to @utsaregplus/core's
 * RmpRating, which has tighter invariants and a stable shape we control.
 */

export const RmpSchoolNodeSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    legacyId: z.number().int().nullable().optional()
});

export const RmpSchoolSearchResponseSchema = z.object({
    data: z.object({
        newSearch: z.object({
            schools: z.object({
                edges: z.array(
                    z.object({
                        cursor: z.string().optional(),
                        node: RmpSchoolNodeSchema
                    })
                )
            })
        })
    })
});

export const RmpTeacherNodeSchema = z.object({
    id: z.string().min(1),
    /**
     * RMP's old numeric ID — what's used in their public URLs. Comes back
     * as a number from the modern API.
     */
    legacyId: z.number().int().nullable().optional(),
    firstName: z.string().default(''),
    lastName: z.string().default(''),
    department: z.string().nullable().optional(),
    /** 0..5; null/0 means "no ratings yet" */
    avgRating: z.number().min(0).max(5).nullable().optional(),
    numRatings: z.number().int().min(0).default(0),
    avgDifficulty: z.number().min(0).max(5).nullable().optional(),
    wouldTakeAgainPercent: z.number().min(-1).max(100).nullable().optional(),
    school: z
        .object({
            id: z.string(),
            name: z.string()
        })
        .nullable()
        .optional()
});

export const RmpTeacherSearchResponseSchema = z.object({
    data: z.object({
        newSearch: z.object({
            teachers: z.object({
                edges: z.array(
                    z.object({
                        cursor: z.string().optional(),
                        node: RmpTeacherNodeSchema
                    })
                )
            })
        })
    })
});

export type RmpSchoolNode = z.infer<typeof RmpSchoolNodeSchema>;
export type RmpTeacherNode = z.infer<typeof RmpTeacherNodeSchema>;
export type RmpSchoolSearchResponse = z.infer<typeof RmpSchoolSearchResponseSchema>;
export type RmpTeacherSearchResponse = z.infer<typeof RmpTeacherSearchResponseSchema>;

/**
 * Typed GraphQL error frame. RMP usually responds with HTTP 200 even on
 * GraphQL errors, embedding details in the body — we surface those as
 * specific exceptions rather than swallowing.
 */
export const RmpErrorResponseSchema = z.object({
    errors: z
        .array(
            z.object({
                message: z.string(),
                path: z.array(z.union([z.string(), z.number()])).optional()
            })
        )
        .optional()
});
