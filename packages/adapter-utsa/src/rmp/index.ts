import type { Fresh, RmpRating } from '@utsaregplus/core';
import type { RmpClient } from './client.js';
import { pickBestTeacher } from './match.js';
import { parseRmpTeacher } from './parser.js';

export { RmpClient, RmpHttpError, RmpGraphQLError, type RmpClientOptions } from './client.js';
export { pickBestTeacher, scoreCandidate, levenshtein } from './match.js';
export { parseRmpTeacher } from './parser.js';
export {
    RmpSchoolNodeSchema,
    RmpTeacherNodeSchema,
    type RmpSchoolNode,
    type RmpTeacherNode
} from './types.js';

/**
 * High-level convenience: from "instructor name" + (cached or freshly-resolved)
 * UTSA school ID → best-match RmpRating, or null when nobody matches.
 *
 * The adapter never does its own caching — that's the storage layer's job
 * (apps/extension/src/storage/rmpCache.ts). This function is the pure-fetch
 * primitive that the cache wraps.
 */
export const fetchRatingForInstructor = async (
    client: RmpClient,
    opts: { instructorName: string; schoolId: string }
): Promise<Fresh<RmpRating> | null> => {
    const candidates = await client.searchTeachers({
        name: opts.instructorName,
        schoolId: opts.schoolId
    });
    const best = pickBestTeacher(opts.instructorName, candidates);
    if (!best) return null;
    return parseRmpTeacher(best);
};

/**
 * Resolve UTSA's RMP school ID. UTSA's legacy numeric ID is 1198 but we
 * never trust constants; the adapter looks it up at runtime by name and
 * verifies the (city, state) match before accepting it.
 */
export const resolveUtsaSchoolId = async (client: RmpClient): Promise<string> => {
    const node = await client.findSchool('University of Texas at San Antonio');
    if (!node) {
        throw new Error('Could not resolve UTSA on RateMyProfessors');
    }
    const isUtsa =
        node.name.toLowerCase().includes('texas at san antonio') ||
        ((node.city ?? '').toLowerCase().includes('san antonio') &&
            (node.state ?? '').toLowerCase() === 'tx');
    if (!isUtsa) {
        throw new Error(
            `RMP returned a non-UTSA school for the UTSA query: ${node.name} (${node.city ?? '?'}, ${node.state ?? '?'})`
        );
    }
    return node.id;
};
