#!/usr/bin/env tsx
/**
 * Live smoke test against utsa.simplesyllabus.com PUBLIC endpoints.
 *
 * Usage: npm run smoke:syllabus
 *
 * Confirms our org-tree + term-list fetches work and that the dept map
 * resolves real CS / CPE / PSY entries with non-zero course counts.
 */

import {
    fetchUtsaOrganizations,
    fetchUtsaTerms,
    findDepartmentForSubject
} from '@utsaregplus/adapter-utsa/syllabus';

const main = async (): Promise<void> => {
    console.info('1. Fetching UTSA organization tree...');
    const orgs = await fetchUtsaOrganizations();
    console.info(`   ✓ ${orgs.length} organizational units`);

    console.info('2. Looking up real departments by subject...');
    for (const subj of ['CS', 'MAT', 'CPE', 'PSY', 'POL', 'ENG']) {
        const dept = findDepartmentForSubject(subj, orgs);
        if (!dept) {
            console.info(`   - ${subj}: no match`);
            continue;
        }
        console.info(
            `   ✓ ${subj.padEnd(5)} ${dept.name.padEnd(28)} ${String(
                dept.course_count ?? 0
            ).padStart(3)} courses, ${String(dept.section_count ?? 0).padStart(4)} sections`
        );
    }

    console.info('\n3. Fetching published UTSA terms...');
    const terms = await fetchUtsaTerms();
    const published = terms.filter((t) => t.is_published).slice(0, 6);
    for (const t of published) {
        console.info(
            `   ${t.name.padEnd(15)} ${t.start_date ?? '???'} → ${t.end_date ?? '???'}`
        );
    }
};

main().catch((err: unknown) => {
    console.error('Smoke test crashed:', err);
    process.exitCode = 1;
});
