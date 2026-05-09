/**
 * Typography scale.
 *
 * Inter (variable) for everything — body, headings, UI. Tabular nums forced
 * on numeric badges (CRN, ratings) so columns line up.
 */
export const typography = {
    fontFamily: {
        sans: '"Inter", "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'
    },

    // Font sizes pinned to a perfect-fourth-ish scale, sized for 14px body.
    fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        xs: ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        sm: ['13px', { lineHeight: '18px', letterSpacing: '0' }],
        base: ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        md: ['15px', { lineHeight: '22px', letterSpacing: '0' }],
        lg: ['17px', { lineHeight: '24px', letterSpacing: '-0.005em' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.015em' }],
        '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.025em' }]
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
