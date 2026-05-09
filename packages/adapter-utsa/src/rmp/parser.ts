import { liveNow, RmpRatingSchema, type Fresh, type RmpRating } from '@utsaregplus/core';
import type { RmpTeacherNode } from './types.js';

/**
 * Translate a wire-shape RmpTeacherNode into our stable @utsaregplus/core
 * RmpRating, validated by Zod. This is the single boundary where wire
 * sloppiness (nulls, missing fields, sentinel values) gets normalized.
 */

const toInstructorId = (firstName: string, lastName: string): string => {
    const parts = [firstName, lastName]
        .map((s) =>
            s
                .toLowerCase()
                .replace(/[^a-z\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
        )
        .filter((s) => s.length > 0);
    if (parts.length < 2) {
        // Schema requires multi-token id; fall back to repeating the single
        // token so the id is still well-formed and stable.
        const sole = parts[0] ?? 'unknown';
        return `${sole}-${sole}`;
    }
    return parts.join('-');
};

export const parseRmpTeacher = (node: RmpTeacherNode): Fresh<RmpRating> => {
    const instructorId = toInstructorId(node.firstName, node.lastName);

    const rating = RmpRatingSchema.parse({
        instructorId,
        legacyId: String(node.legacyId ?? node.id),
        name: `${node.firstName} ${node.lastName}`.trim(),
        department: node.department ?? '',
        avgRating: node.avgRating ?? 0,
        numRatings: node.numRatings,
        // RMP returns -1 for "not enough data"; map to undefined.
        avgDifficulty:
            node.avgDifficulty !== null &&
            node.avgDifficulty !== undefined &&
            node.avgDifficulty >= 0
                ? node.avgDifficulty
                : undefined,
        wouldTakeAgainPercent:
            node.wouldTakeAgainPercent !== null &&
            node.wouldTakeAgainPercent !== undefined &&
            node.wouldTakeAgainPercent >= 0
                ? node.wouldTakeAgainPercent
                : undefined,
        tags: [],
        fetchedAt: new Date().toISOString()
    });

    // Live wrapper — caller can wrap with cache freshness if needed.
    return liveNow(rating, 60 * 60 * 1000); // 1h SWR window
};
