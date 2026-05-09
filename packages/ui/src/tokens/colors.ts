/**
 * UTSA Reg+ color tokens — built from the official UT San Antonio
 * Brand Guidelines V1.2 (July 2025).
 *
 * The mapping is faithful but not literal: we use UTSA's exact hex codes
 * for primary and neutral palettes, and pull the secondary palette
 * (River Mist, Mission Clay, Talavera Blue, Brass) into specific UI roles
 * (info accents, warm highlights). The result feels native to UTSA's
 * visual identity without re-using their logo or wordmarks.
 *
 * Brand palette source (UT San Antonio Brand Guidelines V1.2, p.11–13):
 *   UT San Antonio Orange  #F15A22
 *   Midnight               #032044
 *   River Mist             #C8DCFF
 *   Mission Clay           #DBB485
 *   Talavera Blue          #265BF7
 *   Brass                  #A06620
 *   Accessible Orange      #D3430D  (WCAG AA on white for small text)
 *   Limestone              #F8F4F1
 *   Concrete               #EBE6E2
 *   Smoke                  #D5CFC8
 *   Black                  #332F21  (warm, not pure)
 *   White                  #FFFFFF
 */

// Brand primitives — the literal hex codes UTSA publishes.
const utsaOrange = '#F15A22';
const utsaOrangeAccessible = '#D3430D';
const midnight = '#032044';
const riverMist = '#C8DCFF';
const missionClay = '#DBB485';
const talaveraBlue = '#265BF7';
const brass = '#A06620';
const limestone = '#F8F4F1';
const concrete = '#EBE6E2';
const smoke = '#D5CFC8';
const utsaBlack = '#332F21';

export const lightColors = {
    // Surfaces (lightest → most elevated)
    'surface-canvas': limestone, // page background — UTSA's canonical Limestone
    'surface-default': '#FFFFFF', // cards, primary surfaces
    'surface-raised': '#FFFFFF', // dialogs, popovers
    'surface-muted': limestone, // subtle alt rows, hover states
    'surface-sunken': concrete, // input fields, code blocks

    // Ink — text & icons. Midnight on light per UTSA accessibility guidance.
    'ink-strong': midnight,
    'ink-default': utsaBlack, // UTSA warm Black for body text — never pure black
    'ink-muted': '#5A6480',
    'ink-subtle': '#8A93AB',
    'ink-on-accent': '#FFFFFF',
    'ink-on-brand': '#FFFFFF',

    // Borders — warm, derived from Smoke
    'border-default': '#E8E1D8',
    'border-strong': smoke,
    'border-focus': utsaOrange,

    // Accent — UTSA Orange. Used ONLY for primary CTAs.
    'accent-default': utsaOrange,
    'accent-hover': utsaOrangeAccessible, // shifts to Accessible Orange on hover
    'accent-active': '#B83E10',
    'accent-soft': '#FCE5DA', // 10% wash for highlight backgrounds

    // Brand — Midnight. Headings, brand chrome, secondary CTAs.
    'brand-default': midnight,
    'brand-hover': '#06346E',
    'brand-soft': riverMist, // UTSA's River Mist as the brand-soft tint

    // Status — green/warn/danger remain neutral, info uses Talavera Blue
    'status-open': '#0E7C3A',
    'status-open-soft': '#DCF1E2',
    'status-warn': brass, // UTSA Brass for "warning" - on-brand warm tone
    'status-warn-soft': '#F4E8D6',
    'status-danger': '#B91C1C',
    'status-danger-soft': '#FBE3E3',
    'status-info': talaveraBlue, // UTSA Talavera Blue for info accents
    'status-info-soft': riverMist, // soft variant uses River Mist

    // Decorative warm accent (used sparingly: highlight chips, illustrations)
    'warm-accent-default': missionClay,
    'warm-accent-soft': '#F2E1CB'
} as const;

export const darkColors: Record<keyof typeof lightColors, string> = {
    'surface-canvas': '#0A0F1F',
    'surface-default': '#0F1729',
    'surface-raised': '#15203A',
    'surface-muted': '#1A2540',
    'surface-sunken': '#06122A',

    'ink-strong': '#F5F7FB',
    'ink-default': '#D8DEEC',
    'ink-muted': '#9AA4BD',
    'ink-subtle': '#6B7390',
    'ink-on-accent': '#FFFFFF',
    'ink-on-brand': '#FFFFFF',

    'border-default': '#1F2A47',
    'border-strong': '#33405E',
    'border-focus': utsaOrange,

    'accent-default': '#FF6E36', // a touch warmer in dark mode for legibility
    'accent-hover': utsaOrange,
    'accent-active': utsaOrangeAccessible,
    'accent-soft': '#3A1E14',

    'brand-default': '#7BA0E0',
    'brand-hover': '#A1BEEB',
    'brand-soft': '#1B2848',

    'status-open': '#34C77A',
    'status-open-soft': '#0F2A1B',
    'status-warn': '#E1A24F',
    'status-warn-soft': '#332417',
    'status-danger': '#F25F5C',
    'status-danger-soft': '#36161A',
    'status-info': '#7AA4F0',
    'status-info-soft': '#15233F',

    'warm-accent-default': '#E5C39A',
    'warm-accent-soft': '#3A2F1E'
};

export type ColorToken = keyof typeof lightColors;
