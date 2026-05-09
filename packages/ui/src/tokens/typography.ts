/**
 * Typography scale.
 *
 * UTSA's official type system uses Beausite Fit (display) and Beausite
 * Classic (body) — both paid Type Trust faces we don't ship with the
 * extension. We approximate with Manrope (variable, geometric, similar
 * weight contrast in display weights) for headings and Inter (universal
 * neo-grotesque body face) for everything else. Both are free, hosted by
 * Google Fonts, and pre-loaded in styles/index.css.
 *
 * Tabular nums forced on numeric badges (CRN, ratings) so columns align.
 */
export const typography = {
    fontFamily: {
        display:
            '"Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'
    },

    fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        xs: ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        sm: ['13px', { lineHeight: '18px', letterSpacing: '0' }],
        base: ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        md: ['15px', { lineHeight: '22px', letterSpacing: '0' }],
        lg: ['17px', { lineHeight: '24px', letterSpacing: '-0.005em' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.012em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.018em' }],
        '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.022em' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.026em' }]
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
