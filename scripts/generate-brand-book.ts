#!/usr/bin/env tsx
/**
 * UTSA Reg+ Brand Guidelines PDF — strict absolute-positioning version.
 *
 * Output: brand/output/UTSARegPlus-Brand-Guidelines.pdf (17 pages)
 *
 * Every draw call passes explicit (x, y, width). pdfkit never auto-flows.
 * Each renderer fits in its page. No empty pages, no overlap, no drift.
 */

import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { createWriteStream, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const fontsDir = join(root, 'brand/fonts');
const logosDir = join(root, 'brand/logos');
const outDir = join(root, 'brand/output');

const C = {
    orange: '#F15A22',
    midnight: '#032044',
    riverMist: '#C8DCFF',
    talavera: '#265BF7',
    missionClay: '#DBB485',
    brass: '#A06620',
    limestone: '#F8F4F1',
    concrete: '#EBE6E2',
    smoke: '#D5CFC8',
    warmBlack: '#332F21',
    inkMuted: '#5A6480',
    inkSubtle: '#8A93AB',
    statusOpen: '#0E7C3A',
    statusOpenSoft: '#DCF1E2',
    statusInfoSoft: '#C8DCFF',
    danger: '#B91C1C',
    dangerSoft: '#FBE3E3',
    accentSoft: '#FCE5DA',
    white: '#FFFFFF'
} as const;

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

const F = {
    display: join(fontsDir, 'Manrope-ExtraBold.ttf'),
    displayBold: join(fontsDir, 'Manrope-Bold.ttf'),
    body: join(fontsDir, 'Inter-Regular.ttf'),
    bodySemi: join(fontsDir, 'Inter-SemiBold.ttf'),
    bodyBold: join(fontsDir, 'Inter-Bold.ttf')
} as const;

type Doc = PDFKit.PDFDocument;

const newPage = (doc: Doc): void => {
    doc.addPage({ size: 'LETTER', margins: { top: 0, bottom: 0, left: 0, right: 0 } });
};

const fillRect = (doc: Doc, x: number, y: number, w: number, h: number, color: string): void => {
    doc.save().rect(x, y, w, h).fill(color).restore();
};

interface TextOpts {
    font: string;
    size: number;
    color?: string;
    width?: number;
    align?: 'left' | 'right' | 'center';
    characterSpacing?: number;
    lineGap?: number;
}

const text = (doc: Doc, t: string, x: number, y: number, opts: TextOpts): void => {
    doc.font(opts.font)
        .fontSize(opts.size)
        .fillColor(opts.color ?? C.warmBlack);
    const drawOpts: Parameters<Doc['text']>[3] = {};
    if (opts.width !== undefined) drawOpts.width = opts.width;
    if (opts.align) drawOpts.align = opts.align;
    if (opts.characterSpacing !== undefined) drawOpts.characterSpacing = opts.characterSpacing;
    if (opts.lineGap !== undefined) drawOpts.lineGap = opts.lineGap;
    doc.text(t, x, y, drawOpts);
};

const drawSvg = (doc: Doc, fileName: string, x: number, y: number, w: number): void => {
    const svg = readFileSync(join(logosDir, fileName), 'utf8');
    SVGtoPDF(doc, svg, x, y, { width: w });
};

const pageChrome = (doc: Doc, sectionLabel: string, page: number, total: number): void => {
    text(doc, sectionLabel.toUpperCase(), MARGIN, 28, {
        font: F.bodySemi,
        size: 8,
        color: C.inkSubtle,
        characterSpacing: 1.6
    });
    text(doc, `${page} / ${total}`, MARGIN, 28, {
        font: F.bodySemi,
        size: 8,
        color: C.inkSubtle,
        width: CONTENT_W,
        align: 'right',
        characterSpacing: 0.5
    });
    fillRect(doc, MARGIN, 44, CONTENT_W, 0.5, C.smoke);
    fillRect(doc, MARGIN, PAGE_H - 32, 12, 12, C.orange);
    text(doc, 'UTSA Reg+ · Brand Guidelines V1.0 · May 2026', MARGIN + 20, PAGE_H - 28, {
        font: F.body,
        size: 8,
        color: C.inkMuted
    });
};

/**
 * Section header band: eyebrow at y=70, title at y=92, body at y=146,
 * orange divider at y=224. Returns y=248 for the start of content.
 */
const sectionHead = (doc: Doc, eyebrow: string, title: string, body?: string): number => {
    text(doc, eyebrow.toUpperCase(), MARGIN, 70, {
        font: F.bodyBold,
        size: 10,
        color: C.orange,
        characterSpacing: 2.4
    });
    text(doc, title, MARGIN, 92, {
        font: F.display,
        size: 28,
        color: C.midnight,
        width: CONTENT_W,
        characterSpacing: -0.6
    });
    if (body) {
        text(doc, body, MARGIN, 146, {
            font: F.body,
            size: 10.5,
            color: C.warmBlack,
            width: CONTENT_W * 0.82,
            lineGap: 4
        });
    }
    fillRect(doc, MARGIN, 224, 40, 3, C.orange);
    return 248;
};

// =================== PAGES ===================

const renderCover = (doc: Doc): void => {
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, C.midnight);
    fillRect(doc, 0, 0, 18, PAGE_H, C.orange);
    fillRect(doc, PAGE_W - 64, 64, 24, 24, C.orange);

    text(doc, 'UTSA REG+', MARGIN, 96, {
        font: F.bodyBold,
        size: 11,
        color: C.riverMist,
        characterSpacing: 4.0
    });
    fillRect(doc, MARGIN, 124, 36, 2, C.orange);

    text(doc, 'Brand', MARGIN, 200, {
        font: F.display,
        size: 80,
        color: C.white,
        characterSpacing: -2.5,
        width: CONTENT_W
    });
    text(doc, 'Guidelines.', MARGIN, 290, {
        font: F.display,
        size: 80,
        color: C.orange,
        characterSpacing: -2.5,
        width: CONTENT_W
    });

    text(
        doc,
        'Identity, color, type, and voice for the UTSA student-built registration product.',
        MARGIN,
        420,
        {
            font: F.bodySemi,
            size: 14,
            color: C.riverMist,
            width: CONTENT_W * 0.7,
            lineGap: 4
        }
    );

    const baseY = PAGE_H - 200;
    fillRect(doc, MARGIN, baseY, CONTENT_W * 0.45, 0.5, C.riverMist);
    text(doc, 'VERSION', MARGIN, baseY + 18, {
        font: F.bodyBold,
        size: 9,
        color: C.white,
        characterSpacing: 1.6
    });
    text(doc, 'V1.0', MARGIN, baseY + 36, { font: F.display, size: 26, color: C.white });
    text(doc, 'PUBLISHED', MARGIN + 130, baseY + 18, {
        font: F.bodyBold,
        size: 9,
        color: C.white,
        characterSpacing: 1.6
    });
    text(doc, 'May 2026', MARGIN + 130, baseY + 36, {
        font: F.display,
        size: 26,
        color: C.white
    });

    text(
        doc,
        'Built independently by Anudeep Bonagiri (UTSA CS ’27). Faithful to UTSA brand identity but never reusing UTSA logos or wordmarks.',
        MARGIN,
        PAGE_H - 90,
        { font: F.body, size: 9, color: C.riverMist, width: CONTENT_W, lineGap: 3 }
    );
};

const renderTOC = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, 'Contents', page, total);
    sectionHead(doc, 'Table of contents', 'What’s inside.');

    const items: [string, string, string][] = [
        ['01', 'Brand foundation', '03'],
        ['02', 'Voice & positioning', '04'],
        ['03', 'Logo system — primary', '05'],
        ['04', 'Logo — clear space & sizing', '06'],
        ['05', 'Logo — do’s & don’ts', '07'],
        ['06', 'Color — primary', '08'],
        ['07', 'Color — secondary', '09'],
        ['08', 'Color — neutrals', '10'],
        ['09', 'Color — status', '11'],
        ['10', 'Typography — display & body', '12'],
        ['11', 'Typography — scale', '13'],
        ['12', 'Iconography', '14'],
        ['13', 'Application — popup', '15'],
        ['14', 'Application — dashboard', '16'],
        ['15', 'Approval & contact', '17']
    ];

    let y = 260;
    for (const [num, title, p] of items) {
        text(doc, num, MARGIN, y, { font: F.body, size: 11, color: C.inkMuted, width: 36 });
        text(doc, title, MARGIN + 36, y, { font: F.bodySemi, size: 12.5, color: C.midnight });
        text(doc, p, MARGIN, y, {
            font: F.body,
            size: 11,
            color: C.inkMuted,
            width: CONTENT_W,
            align: 'right'
        });
        const titleW = doc.widthOfString(title);
        const startX = MARGIN + 36 + titleW + 8;
        const endX = PAGE_W - MARGIN - 30;
        if (startX < endX) {
            doc.save();
            doc.dash(1, { space: 4 });
            doc.moveTo(startX, y + 8)
                .lineTo(endX, y + 8)
                .strokeColor(C.smoke)
                .lineWidth(0.6)
                .stroke();
            doc.undash();
            doc.restore();
        }
        y += 26;
    }
};

const renderFoundation = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '01 / Brand foundation', page, total);
    const startY = sectionHead(
        doc,
        '01 Brand foundation',
        'Native to UTSA. Built by a student.',
        'UTSA Reg+ replaces six tabs — ASAP, RateMyProfessors, Bluebook, the catalog, Simple Syllabus, a spreadsheet — with one live surface. The brand has to communicate three things instantly: this is for UTSA, this is real-time, this is built by a student who registered here.'
    );

    const colW = (CONTENT_W - 32) / 3;
    const cols: [string, string][] = [
        [
            'Mission',
            'Make registration the smallest part of a student’s week. Live data, conflict-aware, F1-aware.'
        ],
        [
            'Audience',
            'Every UTSA undergrad. Deeper utility for international students and scholarship-protected GPAs.'
        ],
        [
            'Promise',
            'No mocked data, no telemetry, no logos we don’t own. Trust earned by being verifiable.'
        ]
    ];
    cols.forEach(([t, b], i) => {
        const x = MARGIN + (colW + 16) * i;
        fillRect(doc, x, startY, 28, 3, C.orange);
        text(doc, t, x, startY + 14, {
            font: F.display,
            size: 16,
            color: C.midnight,
            width: colW
        });
        text(doc, b, x, startY + 42, {
            font: F.body,
            size: 10,
            color: C.warmBlack,
            width: colW,
            lineGap: 3
        });
    });

    const statsY = startY + 200;
    fillRect(doc, MARGIN, statsY, CONTENT_W, 0.5, C.smoke);
    const stats: [string, string][] = [
        ['2,401', 'live Fall 2026 sections'],
        ['1,416', 'cataloged courses'],
        ['825', 'CS syllabi tracked'],
        ['~32k', 'UTSA students']
    ];
    const statW = CONTENT_W / stats.length;
    stats.forEach(([n, label], i) => {
        const x = MARGIN + statW * i;
        text(doc, n, x, statsY + 22, {
            font: F.display,
            size: 26,
            color: C.midnight,
            width: statW,
            characterSpacing: -1
        });
        text(doc, label.toUpperCase(), x, statsY + 60, {
            font: F.bodyBold,
            size: 8.5,
            color: C.inkMuted,
            width: statW,
            characterSpacing: 1.4
        });
    });
    fillRect(doc, MARGIN, statsY + 84, CONTENT_W, 0.5, C.smoke);
};

const renderVoice = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '02 / Voice & positioning', page, total);
    const startY = sectionHead(
        doc,
        '02 Voice & positioning',
        'Direct. Confident. Never marketing-speak.',
        'The product sounds like a senior CS major who has registered four times: technical when accuracy matters, plain-spoken when the user is panicking, never flowery.'
    );

    const principles: [string, string][] = [
        ['Be specific', '"3 sections of CS 3343 for Fall 2026" — not "your courses".'],
        [
            'Show your work',
            'Every datum has a freshness chip. Live, cached, snapshot — never ambiguous.'
        ],
        [
            'Skip the marketing voice',
            'No "empower," "unlock," or "innovative." Plain English wins.'
        ],
        ['Speak to one student', '"You" not "users." The student in front of the screen.'],
        [
            'Default to technical truth',
            'Banner 8 endpoint, RMP GraphQL, F1 12-credit minimum — name the real systems.'
        ]
    ];

    let y = startY + 6;
    for (const [t, b] of principles) {
        fillRect(doc, MARGIN, y, 4, 16, C.orange);
        text(doc, t, MARGIN + 14, y - 2, {
            font: F.bodyBold,
            size: 13,
            color: C.midnight,
            width: CONTENT_W - 14
        });
        text(doc, b, MARGIN + 14, y + 18, {
            font: F.body,
            size: 11,
            color: C.warmBlack,
            width: CONTENT_W - 14,
            lineGap: 3
        });
        y += 60;
    }
};

const renderLogoPrimary = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '03 / Logo — primary', page, total);
    const startY = sectionHead(
        doc,
        '03 Logo system',
        'Primary lockup.',
        'The horizontal lockup is the default. Use it everywhere there is room. Orange roundel carries the "R+" monogram; the wordmark sits in Midnight.'
    );

    fillRect(doc, MARGIN, startY, CONTENT_W, 170, C.limestone);
    drawSvg(doc, 'logo-primary.svg', MARGIN + 50, startY + 38, 380);
    text(doc, 'PRIMARY ON LIMESTONE', MARGIN, startY + 180, {
        font: F.bodyBold,
        size: 9,
        color: C.inkMuted,
        characterSpacing: 1.6
    });

    fillRect(doc, MARGIN, startY + 210, CONTENT_W, 150, C.midnight);
    drawSvg(doc, 'logo-reverse.svg', MARGIN + 50, startY + 240, 380);
    text(doc, 'REVERSE ON MIDNIGHT', MARGIN, startY + 370, {
        font: F.bodyBold,
        size: 9,
        color: C.inkMuted,
        characterSpacing: 1.6
    });
};

const renderLogoSpacing = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '04 / Clear space & sizing', page, total);
    const startY = sectionHead(
        doc,
        '04 Logo system',
        'Clear space & minimum sizes.',
        'Reserve clear space equal to half the roundel’s height on every side. Below the minimum sizes the wordmark loses legibility — use the mark alone instead.'
    );

    fillRect(doc, MARGIN, startY, CONTENT_W, 200, C.limestone);
    doc.save();
    doc.dash(3, { space: 3 });
    doc.rect(MARGIN + 50, startY + 30, 416, 140)
        .strokeColor(C.orange)
        .lineWidth(0.8)
        .stroke();
    doc.undash();
    doc.restore();
    drawSvg(doc, 'logo-primary.svg', MARGIN + 80, startY + 65, 360);
    text(doc, 'CLEAR SPACE = ½ ROUNDEL HEIGHT ON ALL SIDES', MARGIN, startY + 210, {
        font: F.bodyBold,
        size: 9,
        color: C.inkMuted,
        characterSpacing: 1.4
    });

    const sizeY = startY + 250;
    fillRect(doc, MARGIN, sizeY, CONTENT_W, 0.5, C.smoke);
    text(doc, 'Minimum sizes', MARGIN, sizeY + 16, {
        font: F.display,
        size: 16,
        color: C.midnight
    });
    const minimums: [string, string][] = [
        ['Lockup, digital', '120 px wide'],
        ['Lockup, print', '32 mm wide'],
        ['Mark only, digital', '24 px square'],
        ['Mark only, print', '8 mm square']
    ];
    minimums.forEach(([k, v], i) => {
        const yy = sizeY + 50 + i * 22;
        text(doc, k, MARGIN + 16, yy, { font: F.body, size: 11, color: C.warmBlack });
        text(doc, v, MARGIN, yy, {
            font: F.bodyBold,
            size: 11,
            color: C.midnight,
            width: CONTENT_W - 16,
            align: 'right'
        });
    });
};

const renderLogoDoDont = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '05 / Logo do’s & don’ts', page, total);
    const startY = sectionHead(
        doc,
        '05 Logo system',
        'Do’s and don’ts.',
        'The lockup is fragile by design — it carries weight at small sizes. No effects, no recoloring outside the brand palette, never re-typeset the wordmark.'
    );

    const tileH = 110;
    const tileW = (CONTENT_W - 16) / 2;
    fillRect(doc, MARGIN, startY, tileW, tileH, C.limestone);
    fillRect(doc, MARGIN, startY, 4, tileH, C.statusOpen);
    text(doc, 'DO', MARGIN + 16, startY + 14, {
        font: F.bodyBold,
        size: 9,
        color: C.statusOpen,
        characterSpacing: 1.6
    });
    text(
        doc,
        'Use the primary or reverse lockup as published. Keep the orange roundel intact. Maintain clear space.',
        MARGIN + 16,
        startY + 34,
        { font: F.body, size: 10, color: C.warmBlack, width: tileW - 32, lineGap: 3 }
    );

    fillRect(doc, MARGIN + tileW + 16, startY, tileW, tileH, C.dangerSoft);
    fillRect(doc, MARGIN + tileW + 16, startY, 4, tileH, C.danger);
    text(doc, 'DON’T', MARGIN + tileW + 32, startY + 14, {
        font: F.bodyBold,
        size: 9,
        color: C.danger,
        characterSpacing: 1.6
    });
    text(
        doc,
        'Don’t recolor outside the palette, skew, add drop-shadows, or swap typefaces in the wordmark.',
        MARGIN + tileW + 32,
        startY + 34,
        { font: F.body, size: 10, color: C.warmBlack, width: tileW - 32, lineGap: 3 }
    );

    const listY = startY + tileH + 32;
    text(doc, 'Never…', MARGIN, listY, { font: F.display, size: 16, color: C.midnight });
    const donts = [
        '— Place the wordmark on a low-contrast surface that fails the AA pairing chart.',
        '— Stretch the lockup or alter the roundel’s corner radius.',
        '— Replace the orange "+" with another character or glyph.',
        '— Combine UTSA Reg+ marks with UTSA’s official athletics or institutional logos.',
        '— Use the lockup over a busy photographic background without the Limestone surface.'
    ];
    donts.forEach((item, i) => {
        text(doc, item, MARGIN, listY + 32 + i * 22, {
            font: F.body,
            size: 10.5,
            color: C.warmBlack,
            width: CONTENT_W,
            lineGap: 2
        });
    });
};

interface Swatch {
    name: string;
    hex: string;
    role: string;
    onDark?: boolean;
}

const renderColorPage = (
    doc: Doc,
    page: number,
    total: number,
    eyebrow: string,
    title: string,
    body: string,
    swatches: Swatch[]
): void => {
    pageChrome(doc, eyebrow, page, total);
    const startY = sectionHead(doc, eyebrow.replace(/^\d+\s*\/\s*/, ''), title, body);

    const cols = 2;
    const gap = 14;
    const sw = (CONTENT_W - gap * (cols - 1)) / cols;
    const sh = 116;
    swatches.forEach((s, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = MARGIN + (sw + gap) * col;
        const y = startY + (sh + gap) * row;
        fillRect(doc, x, y, sw, sh, s.hex);
        const fg = s.onDark ? C.white : C.midnight;
        text(doc, s.name, x + 16, y + 16, {
            font: F.display,
            size: 18,
            color: fg,
            width: sw - 32,
            characterSpacing: -0.4
        });
        text(doc, s.role, x + 16, y + sh - 28, {
            font: F.bodySemi,
            size: 10,
            color: s.onDark ? C.riverMist : C.inkMuted,
            width: sw - 32
        });
        const chipW = 84;
        const chipH = 22;
        fillRect(
            doc,
            x + sw - chipW - 12,
            y + sh - chipH - 12,
            chipW,
            chipH,
            s.onDark ? '#FFFFFF22' : '#FFFFFFD9'
        );
        text(doc, s.hex, x + sw - chipW - 12, y + sh - chipH - 6, {
            font: F.bodyBold,
            size: 9,
            color: s.onDark ? C.white : C.midnight,
            width: chipW,
            align: 'center',
            characterSpacing: 1.2
        });
    });
};

const renderTypeSpec = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '10 / Typography', page, total);
    const startY = sectionHead(
        doc,
        '10 Typography',
        'Manrope display. Inter body.',
        'UTSA’s official typefaces are Beausite Fit and Beausite Classic — paid Type Trust faces. UTSA Reg+ uses Manrope (display) and Inter (body). Both SIL OFL licensed and bundled with the build.'
    );

    fillRect(doc, MARGIN, startY, CONTENT_W, 180, C.limestone);
    text(doc, 'Algorithms.', MARGIN + 24, startY + 24, {
        font: F.display,
        size: 64,
        color: C.midnight,
        characterSpacing: -2.5,
        width: CONTENT_W - 48
    });
    text(
        doc,
        'Manrope ExtraBold 800 · -2.5 letter-spacing · used for h1 and headline lockups',
        MARGIN + 24,
        startY + 130,
        { font: F.body, size: 10, color: C.inkMuted, characterSpacing: 1.0 }
    );

    const bodyY = startY + 200;
    fillRect(doc, MARGIN, bodyY, CONTENT_W, 130, C.white);
    fillRect(doc, MARGIN, bodyY, CONTENT_W, 0.5, C.smoke);
    fillRect(doc, MARGIN, bodyY + 130, CONTENT_W, 0.5, C.smoke);
    text(
        doc,
        'Inter is the default body face. Numbers are tabular by default so columnar data — CRNs, ratings, credit hours — line up across rows. The system relies on size and color for hierarchy more than weight, with SemiBold (600) reserved for emphasis and Bold (700) for primary CTAs.',
        MARGIN + 24,
        bodyY + 22,
        { font: F.body, size: 12, color: C.warmBlack, width: CONTENT_W - 48, lineGap: 4 }
    );
    text(doc, 'Inter Regular 400 · 13/19 · default body text', MARGIN + 24, bodyY + 100, {
        font: F.body,
        size: 10,
        color: C.inkMuted,
        characterSpacing: 1.0
    });
};

const renderTypeScale = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '11 / Typography scale', page, total);
    const startY = sectionHead(
        doc,
        '11 Typography',
        'Type scale.',
        'Eight steps. Display weights for h1–h3, body weights for everything else. Letter-spacing tightens at larger sizes; tracking opens at small caps for legibility.'
    );

    const rows: [string, string, number][] = [
        ['Display 4XL', 'Manrope ExtraBold · 48 px', 32],
        ['Display 3XL', 'Manrope ExtraBold · 36 px', 26],
        ['Display 2XL', 'Manrope ExtraBold · 28 px', 22],
        ['Display XL', 'Manrope Bold · 22 px', 18],
        ['Body LG', 'Inter SemiBold · 17 px', 15],
        ['Body MD', 'Inter Regular · 14 px', 13],
        ['Body SM', 'Inter Regular · 13 px', 11],
        ['Caption', 'Inter Bold caps · 10 px', 9]
    ];
    let y = startY + 4;
    rows.forEach(([label, spec, size]) => {
        const isDisplay = spec.startsWith('Manrope');
        const fontPath = isDisplay
            ? spec.includes('ExtraBold')
                ? F.display
                : F.displayBold
            : F.body;
        text(doc, label, MARGIN, y, { font: fontPath, size, color: C.midnight });
        text(doc, spec, MARGIN, y + 4, {
            font: F.body,
            size: 9,
            color: C.inkMuted,
            characterSpacing: 1.2,
            width: CONTENT_W,
            align: 'right'
        });
        y += size + 22;
    });
};

const renderIcons = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '12 / Iconography', page, total);
    const startY = sectionHead(
        doc,
        '12 Iconography',
        'Lucide icons. 1.75-stroke.',
        'UTSA Reg+ uses the open-source Lucide icon set. Icons render at 16 px and 20 px, always with a 1.75-stroke weight. Color follows the surrounding text token — never re-tinted.'
    );

    const items = [
        'Calendar',
        'Clock',
        'Users',
        'BookOpen',
        'Bookmark',
        'Settings',
        'Search',
        'GraduationCap',
        'AlertTriangle',
        'CheckCircle2',
        'Star',
        'MapPin',
        'Trash2',
        'Sun',
        'Moon',
        'LayoutDashboard'
    ];
    const cols = 4;
    const tileW = (CONTENT_W - 16 * (cols - 1)) / cols;
    const tileH = 76;
    items.forEach((name, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = MARGIN + (tileW + 16) * col;
        const y = startY + (tileH + 16) * row;
        fillRect(doc, x, y, tileW, tileH, C.limestone);
        fillRect(doc, x + tileW / 2 - 12, y + 14, 24, 24, C.midnight);
        text(doc, name, x, y + 48, {
            font: F.bodyBold,
            size: 9,
            color: C.midnight,
            width: tileW,
            align: 'center'
        });
    });
};

const renderAppPopup = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '13 / Application: popup', page, total);
    const startY = sectionHead(
        doc,
        '13 Application',
        'Toolbar popup.',
        '420 × 600 Chrome popup. Midnight header with the orange-tile mark and wordmark; tabs use uppercase bold caption with a 3-px orange underline on the active state.'
    );

    const popX = MARGIN + (CONTENT_W - 280) / 2;
    const popY = startY;
    const popW = 280;
    const popH = 380;

    fillRect(doc, popX - 4, popY - 4, popW + 8, popH + 8, C.smoke);
    fillRect(doc, popX, popY, popW, popH, C.limestone);

    fillRect(doc, popX, popY, popW, 96, C.midnight);
    fillRect(doc, popX, popY, popW, 2, C.orange);
    fillRect(doc, popX + 16, popY + 18, 28, 28, C.orange);
    text(doc, 'UTSA Reg+', popX + 52, popY + 20, { font: F.display, size: 14, color: C.white });
    text(doc, 'FALL 2026', popX + 52, popY + 38, {
        font: F.bodyBold,
        size: 7,
        color: C.riverMist,
        characterSpacing: 1.4
    });
    fillRect(doc, popX + 16, popY + 60, popW - 32, 24, C.white);

    const tabsY = popY + 96;
    fillRect(doc, popX, tabsY, popW, 30, C.limestone);
    fillRect(doc, popX, tabsY + 27, popW / 3, 3, C.orange);
    text(doc, 'EXPLORE', popX, tabsY + 11, {
        font: F.bodyBold,
        size: 8,
        color: C.orange,
        width: popW / 3,
        align: 'center',
        characterSpacing: 1.5
    });
    text(doc, 'SCHEDULE', popX + popW / 3, tabsY + 11, {
        font: F.bodyBold,
        size: 8,
        color: C.inkMuted,
        width: popW / 3,
        align: 'center',
        characterSpacing: 1.5
    });
    text(doc, 'SAVED', popX + (2 * popW) / 3, tabsY + 11, {
        font: F.bodyBold,
        size: 8,
        color: C.inkMuted,
        width: popW / 3,
        align: 'center',
        characterSpacing: 1.5
    });

    const cardY = tabsY + 50;
    fillRect(doc, popX + 16, cardY, popW - 32, 84, C.white);
    fillRect(doc, popX + 16, cardY, popW - 32, 0.5, C.smoke);
    fillRect(doc, popX + 16, cardY + 84, popW - 32, 0.5, C.smoke);
    text(doc, 'CS 3343', popX + 28, cardY + 12, {
        font: F.bodyBold,
        size: 11,
        color: C.midnight
    });
    fillRect(doc, popX + 78, cardY + 14, 38, 14, C.statusOpenSoft);
    text(doc, 'OPEN', popX + 78, cardY + 18, {
        font: F.bodyBold,
        size: 7,
        color: C.statusOpen,
        width: 38,
        align: 'center',
        characterSpacing: 1.2
    });
    text(doc, 'Design and Analysis of Algorithms', popX + 28, cardY + 32, {
        font: F.body,
        size: 9,
        color: C.warmBlack
    });
    text(doc, 'Najem  ·  MW 9:00 AM – 10:15 AM  ·  San Pedro II 405', popX + 28, cardY + 48, {
        font: F.body,
        size: 8,
        color: C.inkMuted
    });
    fillRect(doc, popX + 28, cardY + 64, 96, 12, C.statusOpenSoft);
    text(doc, '★ 4.5  LIVE · NOW', popX + 28, cardY + 67, {
        font: F.bodyBold,
        size: 7,
        color: C.statusOpen,
        width: 96,
        align: 'center',
        characterSpacing: 0.8
    });
};

const renderAppDashboard = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '14 / Application: dashboard', page, total);
    const startY = sectionHead(
        doc,
        '14 Application',
        'Full-page dashboard.',
        'Sidebar nav with Midnight wordmark block. Active nav uses the accent-soft tile with Accessible Orange text. Stats render in Manrope ExtraBold 28 px.'
    );

    const dashH = 300;
    fillRect(doc, MARGIN - 2, startY - 2, CONTENT_W + 4, dashH + 4, C.smoke);
    fillRect(doc, MARGIN, startY, CONTENT_W, dashH, C.limestone);

    const sbW = 100;
    fillRect(doc, MARGIN, startY, sbW, dashH, C.white);
    fillRect(doc, MARGIN, startY, sbW, 60, C.midnight);
    fillRect(doc, MARGIN, startY, sbW, 2, C.orange);
    fillRect(doc, MARGIN + 8, startY + 14, 18, 18, C.orange);
    text(doc, 'UTSA Reg+', MARGIN + 30, startY + 18, {
        font: F.display,
        size: 9,
        color: C.white
    });
    text(doc, 'FALL 2026', MARGIN + 30, startY + 32, {
        font: F.bodyBold,
        size: 6,
        color: C.riverMist,
        characterSpacing: 1.0
    });

    const items = ['Course Explorer', 'Weekly Schedule', 'Saved', 'Settings'];
    items.forEach((item, i) => {
        const yy = startY + 80 + i * 22;
        if (i === 1) {
            fillRect(doc, MARGIN + 8, yy - 4, sbW - 16, 18, C.accentSoft);
            text(doc, item, MARGIN + 12, yy, {
                font: F.bodyBold,
                size: 8,
                color: C.orange,
                width: sbW - 24
            });
        } else {
            text(doc, item, MARGIN + 12, yy, {
                font: F.bodySemi,
                size: 8,
                color: C.warmBlack,
                width: sbW - 24
            });
        }
    });

    const mainX = MARGIN + sbW;
    const mainW = CONTENT_W - sbW;
    fillRect(doc, mainX, startY, mainW, 50, C.white);
    fillRect(doc, mainX, startY + 50, mainW, 0.5, C.smoke);
    text(doc, 'Weekly Schedule', mainX + 16, startY + 16, {
        font: F.display,
        size: 16,
        color: C.midnight
    });

    const stN = ['Sections', 'Credits', 'In-person', 'Online'];
    const stV = ['4', '12 / 18', '12', '0'];
    const stY = startY + 70;
    const stW = (mainW - 16 - 12 * 3) / 4;
    stN.forEach((n, i) => {
        const x = mainX + 16 + (stW + 12) * i;
        fillRect(doc, x, stY, stW, 56, C.white);
        fillRect(doc, x, stY, stW, 0.5, C.smoke);
        text(doc, n.toUpperCase(), x + 8, stY + 8, {
            font: F.bodyBold,
            size: 7,
            color: C.inkMuted,
            characterSpacing: 1.2
        });
        text(doc, stV[i] ?? '', x + 8, stY + 24, {
            font: F.display,
            size: 16,
            color: C.midnight
        });
    });

    const gY = stY + 80;
    fillRect(doc, mainX + 16, gY, mainW - 32, 120, C.white);
    fillRect(doc, mainX + 16, gY, mainW - 32, 0.5, C.smoke);
    fillRect(doc, mainX + 32, gY + 14, 60, 30, C.accentSoft);
    fillRect(doc, mainX + 32, gY + 14, 4, 30, C.orange);
    fillRect(doc, mainX + 96, gY + 50, 60, 30, C.statusInfoSoft);
    fillRect(doc, mainX + 96, gY + 50, 4, 30, C.midnight);
    fillRect(doc, mainX + 160, gY + 30, 60, 24, C.statusOpenSoft);
    fillRect(doc, mainX + 160, gY + 30, 4, 24, C.statusOpen);
};

const renderClosing = (doc: Doc, page: number, total: number): void => {
    pageChrome(doc, '15 / Approval & contact', page, total);
    const startY = sectionHead(
        doc,
        '15 Approval & contact',
        'How to use these guidelines.',
        'Versioned. Open-source. The brand artifacts in /brand/ are the authoritative source. Pull requests welcome — but the colors, type, and lockup are normative.'
    );

    fillRect(doc, MARGIN, startY, CONTENT_W, 130, C.midnight);
    fillRect(doc, MARGIN, startY, 6, 130, C.orange);
    text(doc, 'CONTACT', MARGIN + 24, startY + 18, {
        font: F.bodyBold,
        size: 10,
        color: C.riverMist,
        characterSpacing: 2.4
    });
    text(doc, 'Anudeep Bonagiri', MARGIN + 24, startY + 38, {
        font: F.display,
        size: 22,
        color: C.white
    });
    text(doc, 'UTSA CS ’27 · anudeep.bonagiri@gmail.com', MARGIN + 24, startY + 76, {
        font: F.body,
        size: 11,
        color: C.riverMist
    });
    text(doc, 'Source ~/Desktop/UTSARegPlus  ·  Brand /brand/', MARGIN + 24, startY + 96, {
        font: F.body,
        size: 10,
        color: C.riverMist
    });

    fillRect(doc, MARGIN, PAGE_H - 200, 80, 80, C.orange);
    text(doc, 'Generated by scripts/generate-brand-book.ts', MARGIN, PAGE_H - 100, {
        font: F.body,
        size: 9,
        color: C.inkMuted
    });
};

// =================== MAIN ===================

const TOTAL_PAGES = 17;

const main = (): void => {
    const outPath = join(outDir, 'UTSARegPlus-Brand-Guidelines.pdf');
    console.info(`[brand-book] generating ${outPath}`);

    const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        info: {
            Title: 'UTSA Reg+ Brand Guidelines',
            Author: 'Anudeep Bonagiri',
            Subject: 'Brand identity, color, type, and voice for UTSA Reg+',
            Keywords: 'UTSA, brand, design system, registration'
        },
        autoFirstPage: false
    });
    doc.pipe(createWriteStream(outPath));
    doc.registerFont('display', F.display);
    doc.registerFont('display-bold', F.displayBold);
    doc.registerFont('body', F.body);
    doc.registerFont('body-semi', F.bodySemi);
    doc.registerFont('body-bold', F.bodyBold);

    let n = 1;
    newPage(doc);
    renderCover(doc);
    n++;
    newPage(doc);
    renderTOC(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderFoundation(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderVoice(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderLogoPrimary(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderLogoSpacing(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderLogoDoDont(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderColorPage(
        doc,
        n,
        TOTAL_PAGES,
        '06 / Color: primary',
        'Primary palette.',
        'UT San Antonio Orange and Midnight are the only primary colors. Orange for primary CTAs, focus rings, and the orange-tile mark; never as a background for body copy.',
        [
            {
                name: 'UTSA Orange',
                hex: '#F15A22',
                role: 'Primary CTA, mark, focus ring',
                onDark: true
            },
            { name: 'Midnight', hex: '#032044', role: 'Headers, brand chrome, h1', onDark: true }
        ]
    );
    n++;
    newPage(doc);
    renderColorPage(
        doc,
        n,
        TOTAL_PAGES,
        '07 / Color: secondary',
        'Secondary palette.',
        'Reach for these only when a primary would dominate. River Mist softens info; Talavera Blue accents; Mission Clay warms; Brass handles warnings on a brand-safe note.',
        [
            { name: 'River Mist', hex: '#C8DCFF', role: 'Info-soft tile, brand-soft tint' },
            { name: 'Talavera Blue', hex: '#265BF7', role: 'Info accent', onDark: true },
            { name: 'Mission Clay', hex: '#DBB485', role: 'Decorative warm accent' },
            { name: 'Brass', hex: '#A06620', role: 'Warning status, on-brand', onDark: true }
        ]
    );
    n++;
    newPage(doc);
    renderColorPage(
        doc,
        n,
        TOTAL_PAGES,
        '08 / Color: neutrals',
        'Neutrals.',
        'Warm neutrals from UTSA palette. Limestone is the page canvas. Concrete sinks form fields. Smoke is the strong border. Warm Black replaces pure black for body text.',
        [
            { name: 'Limestone', hex: '#F8F4F1', role: 'Page canvas, muted surface' },
            { name: 'Concrete', hex: '#EBE6E2', role: 'Sunken surface, input fields' },
            { name: 'Smoke', hex: '#D5CFC8', role: 'Strong border, heavy divider' },
            { name: 'Warm Black', hex: '#332F21', role: 'Body text', onDark: true }
        ]
    );
    n++;
    newPage(doc);
    renderColorPage(
        doc,
        n,
        TOTAL_PAGES,
        '09 / Color: status',
        'Status & semantic.',
        'Tone is locked to meaning. Open is healthy green. Closed is danger red. Waitlist is Brass. Info is Talavera Blue.',
        [
            {
                name: 'Open',
                hex: '#0E7C3A',
                role: 'Available section, healthy seats',
                onDark: true
            },
            {
                name: 'Waitlist',
                hex: '#A06620',
                role: 'Capacity reached, waitlist open',
                onDark: true
            },
            { name: 'Closed', hex: '#B91C1C', role: 'Unavailable, danger', onDark: true },
            { name: 'Info', hex: '#265BF7', role: 'Hint, link, neutral status', onDark: true }
        ]
    );
    n++;
    newPage(doc);
    renderTypeSpec(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderTypeScale(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderIcons(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderAppPopup(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderAppDashboard(doc, n, TOTAL_PAGES);
    n++;
    newPage(doc);
    renderClosing(doc, n, TOTAL_PAGES);
    n++;

    doc.end();
    console.info('[brand-book] done.');
};

main();
