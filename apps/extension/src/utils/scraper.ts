export interface CourseInfo {
    crn: string;
    subject: string;
    courseNumber: string;
    section: string;
    title: string;
    instructor: string;
    days: string;
    time: string;
    room: string;
    credits: string;
}

export const scrapeAsapResults = (): CourseInfo[] => {
    const courses: CourseInfo[] = [];
    const rows = document.querySelectorAll('.datadisplaytable tr');

    // The ASAP portal structure is notorious for being inconsistent.
    // We look for rows that actually contain course data (usually have a CRN in the first or second cell)
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 10) {
            // Check if the second cell is a 5-digit CRN
            const crn = cells[1]?.textContent?.trim() || '';
            if (/^\d{5}$/.test(crn)) {
                courses.push({
                    crn,
                    subject: cells[2]?.textContent?.trim() || '',
                    courseNumber: cells[3]?.textContent?.trim() || '',
                    section: cells[4]?.textContent?.trim() || '',
                    title: cells[7]?.textContent?.trim() || '',
                    days: cells[8]?.textContent?.trim() || '',
                    time: cells[9]?.textContent?.trim() || '',
                    room: cells[11]?.textContent?.trim() || '',
                    instructor: parseInstructor(cells[16]?.textContent?.trim() || 'TBA'),
                    credits: cells[6]?.textContent?.trim() || '',
                });
            }
        }
    });

    return courses;
};

export const parseInstructor = (raw: string): string => {
    // UTSA ASAP often lists instructors as "Last, First (P)" or "Last, First"
    // We want to return a clean "First Last" for better API matching
    if (!raw || raw === 'TBA' || raw.includes('Staff')) return 'TBA';

    const cleanName = raw.replace(/\(P\)/, '').trim();
    const parts = cleanName.split(',').map(p => p.trim());

    if (parts.length === 2) {
        return `${parts[1]} ${parts[0]}`;
    }

    return cleanName;
};
