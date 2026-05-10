/**
 * Typography tokens — editorial collegiate.
 *
 * Display: Fraunces — variable serif with optical-sizing, italic, and SOFT
 * axes. Used at scale for editorial headlines and stat numbers.
 * Body: Mona Sans — refined modern sans, full italic and weight ranges,
 * legible at every size. Github's typeface.
 * Mono: JetBrains Mono — for CRNs, course codes, hashes; tabular by default.
 *
 * UTSA's official typefaces (Beausite Fit / Beausite Classic) are paid;
 * we ship free SIL-OFL alternatives that hold their own visual character.
 */
export const typography = {
    fontFamily: {
        display: '"Fraunces", "Cambria", "Cochin", Georgia, serif',
        sans: '"Mona Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        mono: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'
    },

    fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        xs: ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        sm: ['13px', { lineHeight: '18px', letterSpacing: '0' }],
        base: ['14px', { lineHeight: '21px', letterSpacing: '0' }],
        md: ['15px', { lineHeight: '23px', letterSpacing: '0' }],
        lg: ['17px', { lineHeight: '26px', letterSpacing: '-0.005em' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.012em' }],
        '2xl': ['28px', { lineHeight: '34px', letterSpacing: '-0.022em' }],
        '3xl': ['38px', { lineHeight: '42px', letterSpacing: '-0.026em' }],
        '4xl': ['52px', { lineHeight: '54px', letterSpacing: '-0.030em' }],
        '5xl': ['72px', { lineHeight: '70px', letterSpacing: '-0.036em' }]
    },

    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '800'
    }
} as const;

export type FontSizeToken = keyof typeof typography.fontSize;
export type FontWeightToken = keyof typeof typography.fontWeight;
