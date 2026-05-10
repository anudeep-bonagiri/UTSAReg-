#!/usr/bin/env tsx
/**
 * Live scrape of UTSA's PUBLIC class schedule for the Fall 2026 term.
 *
 * Output: apps/extension/src/data/sections.json (overwrites hand-curated demo)
 *
 * This is the script that turns the extension from "static snapshot" into
 * "live UTSA Fall 2026 with real CRNs."
 *
 * Run via: npm run data:sections
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fetchAsapSections } from '@utsaregplus/adapter-utsa/asap';

const TERM_ID = '202710'; // Fall 2026
const TERM_LABEL = 'Fall 2026';

// Same coverage as the catalog scrape so search results have data on every
// subject the extension exposes.
const SUBJECTS = [
    'CS',
    'IS',
    'CPE',
    'EE',
    'MAT',
    'STA',
    'BIO',
    'CHE',
    'PHY',
    'ENG',
    'HIS',
    'POL',
    'PSY',
    'ECO',
    'COM'
];

const main = async (): Promise<void> => {
    console.info(`[asap] live scrape: ${SUBJECTS.length} subjects, ${TERM_LABEL} (${TERM_ID})`);
    const start = Date.now();

    // Banner doesn't love huge multi-subject queries — we batch in groups of 3
    // to stay polite and to keep individual failures bounded.
    const BATCH = 3;
    const all: Awaited<ReturnType<typeof fetchAsapSections>> = [];
    const failures: { batch: string[]; error: string }[] = [];

    for (let i = 0; i < SUBJECTS.length; i += BATCH) {
        const batch = SUBJECTS.slice(i, i + BATCH);
        try {
            const sections = await fetchAsapSections({
                termId: TERM_ID,
                subjects: batch
            });
            all.push(...sections);
            console.info(
                `  + ${batch.join(',').padEnd(15)} ${String(sections.length).padStart(4)} sections`
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            failures.push({ batch, error: msg });
            console.warn(`  ! ${batch.join(',')} failed: ${msg}`);
        }
    }

    const elapsed = Date.now() - start;
    console.info(
        `\n[asap] ${all.length} sections in ${elapsed} ms (${failures.length} batch failures)`
    );

    const manifest = {
        schemaVersion: 1 as const,
        termId: TERM_ID,
        termLabel: TERM_LABEL,
        fetchedAt: new Date().toISOString(),
        freshnessSource: 'snapshot' as const,
        note: `Live scrape of asap.utsa.edu/pls/prod/bwckschd.p_get_crse_unsec at ${new Date().toISOString()}. Real CRNs, real instructors, real meeting times.`,
        subjects: SUBJECTS,
        sectionCount: all.length,
        sections: all
    };

    const outPath = 'apps/extension/src/data/sections.json';
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(manifest, null, 2));
    console.info(`\n[asap] wrote ${outPath}`);

    if (all.length === 0) {
        console.error('FAIL: zero sections fetched.');
        process.exitCode = 2;
    }
};

main().catch((err: unknown) => {
    console.error('Scrape crashed:', err);
    process.exitCode = 1;
});
