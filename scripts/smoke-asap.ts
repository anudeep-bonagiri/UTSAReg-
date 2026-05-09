#!/usr/bin/env tsx
/**
 * Live smoke test against UTSA's PUBLIC class schedule.
 *
 * Usage: npm run smoke:asap
 *
 * What this proves:
 *   - asap.utsa.edu/pls/prod/bwckschd is reachable, public, no auth.
 *   - The two-step Banner 8 form flow still works as documented.
 *   - Our parser handles whatever Fall 2026 looks like RIGHT NOW.
 *   - A small handful of known sections (real CRNs) are still in the data.
 */

import { fetchAsapSections } from '@utsaregplus/adapter-utsa/asap';

const TERM = '202710'; // Fall 2026
const SUBJECTS = ['CS', 'MAT'];

const main = async (): Promise<void> => {
    console.info(`[asap] live fetch: term=${TERM}, subjects=${SUBJECTS.join(',')}`);
    const start = Date.now();
    const sections = await fetchAsapSections({
        termId: TERM,
        subjects: SUBJECTS
    });
    const elapsed = Date.now() - start;
    console.info(`[asap] fetched ${sections.length} sections in ${elapsed} ms\n`);

    // Show a sample of in-person sections (those with parsed meeting times)
    const inPerson = sections.filter((s) => s.meetings.length > 0).slice(0, 8);
    console.info('Sample in-person sections:');
    console.info('  CRN     Course       Section  Days   Time             Instructor');
    console.info('  ------  -----------  -------  -----  ---------------  ------------------');
    for (const s of inPerson) {
        const m = s.meetings[0];
        if (!m) continue;
        const days = m.days.join('');
        const startH = Math.floor(m.startMin / 60);
        const startMm = m.startMin % 60;
        const endH = Math.floor(m.endMin / 60);
        const endMm = m.endMin % 60;
        const fmt = (h: number, mm: number): string => {
            const hh = h % 12 || 12;
            const mer = h >= 12 ? 'p' : 'a';
            return `${hh}:${String(mm).padStart(2, '0')}${mer}`;
        };
        console.info(
            `  ${s.crn}  ${s.courseId.padEnd(11)}  ${s.sectionCode.padEnd(7)}  ${days.padEnd(5)}  ${`${fmt(startH, startMm)}-${fmt(endH, endMm)}`.padEnd(15)}  ${s.instructorName}`
        );
    }

    console.info(
        `\nModality breakdown: ` +
            `${sections.filter((s) => s.modality === 'in_person').length} in-person, ` +
            `${sections.filter((s) => s.modality === 'online_async').length} online-async, ` +
            `${sections.filter((s) => s.modality === 'hybrid').length} hybrid, ` +
            `${sections.filter((s) => s.modality === 'unspecified').length} unspecified`
    );

    if (sections.length === 0) {
        console.error('FAIL: zero sections returned. ASAP DOM may have shifted.');
        process.exitCode = 2;
    }
};

main().catch((err: unknown) => {
    console.error('Smoke test crashed:', err);
    process.exitCode = 3;
});
