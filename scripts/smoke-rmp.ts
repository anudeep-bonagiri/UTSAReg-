#!/usr/bin/env tsx
/**
 * Live smoke test against the real RateMyProfessors GraphQL endpoint.
 *
 * Usage:
 *   npm run smoke:rmp
 *
 * What this proves:
 *   1. RMP's API is still reachable with our auth scheme.
 *   2. Our SchoolSearch query still resolves UTSA correctly.
 *   3. Our TeacherSearch query returns at least one known UTSA professor.
 *   4. The response parses cleanly through our Zod validators.
 *   5. parseRmpTeacher produces a well-formed RmpRating.
 *
 * This script HITS THE NETWORK. Don't run in CI without rate-limit awareness.
 */

import {
    RmpClient,
    fetchRatingForInstructor,
    resolveUtsaSchoolId
} from '@utsaregplus/adapter-utsa/rmp';

// Names known to exist on RMP for UTSA — adjust as the program evolves.
const KNOWN_UTSA_INSTRUCTORS = [
    'Murtuza Jadliwala',
    'Rajendra Boppana',
    'Tinghui Wang' // a control: someone else, to verify the school filter
];

const fmt = (n: number | undefined): string => (n === undefined ? '—' : n.toFixed(2));

const main = async (): Promise<void> => {
    const client = new RmpClient();
    console.info('1. Resolving UTSA school ID via SchoolSearch...');
    const schoolId = await resolveUtsaSchoolId(client);
    console.info(`   ✓ schoolId = ${schoolId}`);

    console.info('2. Fetching ratings for known instructors...');
    let ok = 0;
    let missing = 0;
    for (const name of KNOWN_UTSA_INSTRUCTORS) {
        try {
            const result = await fetchRatingForInstructor(client, {
                instructorName: name,
                schoolId
            });
            if (!result) {
                console.warn(`   ⚠ ${name}: no match found`);
                missing += 1;
                continue;
            }
            const r = result.data;
            console.info(
                `   ✓ ${name.padEnd(22)} → ${fmt(r.avgRating).padStart(4)}★ ` +
                    `(${String(r.numRatings).padStart(3)} reviews) ` +
                    `diff=${fmt(r.avgDifficulty)} ` +
                    `repeat=${r.wouldTakeAgainPercent ?? '—'}%`
            );
            ok += 1;
        } catch (err) {
            console.error(`   ✗ ${name}: ${err instanceof Error ? err.message : String(err)}`);
            process.exitCode = 1;
        }
    }

    console.info(
        `\nSmoke test result: ${ok} ok, ${missing} no-match, of ${KNOWN_UTSA_INSTRUCTORS.length} attempted.`
    );
    if (ok === 0) {
        console.error('FAIL: no instructors resolved at all — RMP API contract may have shifted.');
        process.exitCode = 2;
    }
};

main().catch((err: unknown) => {
    console.error('Smoke test crashed:', err);
    process.exitCode = 3;
});
