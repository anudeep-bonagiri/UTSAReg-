#!/usr/bin/env tsx
/**
 * Live scrape of catalog.utsa.edu for the major subjects students need
 * during registration. Output is bundled into the extension build.
 *
 * Usage:  npm run data:catalog
 * Output: data/catalog.json   (an array of validated Course records,
 *                              plus a meta header with timestamp)
 *
 * Rerun this whenever the catalog changes (~once per term). The output
 * file lives outside dist/ on purpose — it's source data, not build output.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fetchSubjects } from '@utsaregplus/adapter-utsa/catalog';

// Subjects to scrape. Ordered roughly by relevance to UTSA core flow:
//   - majors: CS, IS, ECE
//   - calculus pipeline: MAT, STA
//   - sci core: BIO, CHE, PHY
//   - gen-ed staples: ENG, HIS, GOV, PSY, ECO
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
    'POL', // government / political science
    'PSY',
    'ECO',
    'COM' // communication
];

const main = async (): Promise<void> => {
    console.info(`[catalog] scraping ${SUBJECTS.length} subjects from catalog.utsa.edu ...`);
    const start = Date.now();

    // Fetch undergrad and grad pages for each subject
    const [undergradMap, gradMap] = await Promise.all([
        fetchSubjects(SUBJECTS, { level: 'undergraduate', concurrency: 5 }),
        fetchSubjects(SUBJECTS, { level: 'graduate', concurrency: 5 })
    ]);

    const allCourses: unknown[] = [];
    const summary: { subject: string; ug: number; gr: number }[] = [];
    for (const subj of SUBJECTS) {
        const ug = undergradMap.get(subj) ?? [];
        const gr = gradMap.get(subj) ?? [];
        allCourses.push(...ug, ...gr);
        summary.push({ subject: subj, ug: ug.length, gr: gr.length });
    }

    const elapsed = Date.now() - start;
    console.info(`[catalog] done in ${elapsed} ms — ${allCourses.length} courses total\n`);
    console.info('  Subject  UG     GR');
    console.info('  -------- ------ ------');
    for (const row of summary) {
        console.info(
            `  ${row.subject.padEnd(8)} ${String(row.ug).padStart(4)}   ${String(row.gr).padStart(4)}`
        );
    }

    const manifest = {
        schemaVersion: 1 as const,
        fetchedAt: new Date().toISOString(),
        subjects: SUBJECTS,
        courseCount: allCourses.length,
        courses: allCourses
    };

    const outPath = 'data/catalog.json';
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(manifest, null, 2));
    console.info(`\n[catalog] wrote ${outPath}`);
};

main().catch((err: unknown) => {
    console.error('[catalog] fatal:', err);
    process.exitCode = 1;
});
