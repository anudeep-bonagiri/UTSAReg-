/**
 * UTSA Reg+ color tokens.
 *
 * Light mode is the default. Dark mode flips the role-to-value mapping; tokens
 * are referenced through CSS custom properties (see styles/index.css) so a
 * single body[data-theme="dark"] toggle re-themes everything.
 *
 * Naming convention:
 *   - "surface"  background layers (page → card → elevated card)
 *   - "ink"      foreground text & icons
 *   - "border"   dividers and outlines
 *   - "accent"   the one orange — used SPARINGLY for primary CTAs
 *   - "brand"    UTSA midnight blue — headings, brand chrome
 *   - "status"   open/closed/waitlist + general semantic states
 */

// Brand primitives — the literal hex codes UTSA publishes.
const utsaOrange = '#F15A22';
const utsaMidnight = '#032044';
const utsaLimestone = '#F8F4F1';
const utsaConcrete = '#EBE6E2';

export const lightColors = {
    // Surfaces (lightest → most elevated)
    'surface-canvas': '#FBF9F7', // page background — warmer than pure white
    'surface-default': '#FFFFFF', // primary cards
    'surface-raised': '#FFFFFF', // dialogs, popovers (with shadow)
    'surface-muted': utsaLimestone, // subtle alt rows, hover states
    'surface-sunken': utsaConcrete, // input fields, code blocks

    // Ink — text & icons
    'ink-strong': utsaMidnight, // headings, primary text
    'ink-default': '#1A2238', // body
    'ink-muted': '#5A6480', // secondary text
    'ink-subtle': '#8A93AB', // captions, placeholders
    'ink-on-accent': '#FFFFFF', // text on orange
    'ink-on-brand': '#FFFFFF', // text on midnight blue

    // Borders
    'border-default': '#E5DED5',
    'border-strong': '#D4CCBF',
    'border-focus': utsaOrange,

    // Accent — the orange. Used for primary CTAs only.
    'accent-default': utsaOrange,
    'accent-hover': '#D74A15',
    'accent-active': '#B83E10',
    'accent-soft': '#FCE5DA', // 10% wash for highlight backgrounds

    // Brand — midnight blue. For headings, brand chrome, secondary CTAs.
    'brand-default': utsaMidnight,
    'brand-hover': '#06346E',
    'brand-soft': '#E5EAF2',

    // Status colors (semantic, not section-specific)
    'status-open': '#0E7C3A', // healthy green
    'status-open-soft': '#DCF1E2',
    'status-warn': '#B45309', // amber
    'status-warn-soft': '#FCEDD3',
    'status-danger': '#B91C1C',
    'status-danger-soft': '#FBE3E3',
    'status-info': '#1F5BC4',
    'status-info-soft': '#DCE6F8'
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
    'accent-active': '#D74A15',
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
    'status-info-soft': '#15233F'
};

export type ColorToken = keyof typeof lightColors;
