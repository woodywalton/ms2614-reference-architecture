// EUI Borealis design tokens (the brand-aligned successor to Amsterdam).
// Source: Elastic UI Framework — https://eui.elastic.co/docs/getting-started/theming/tokens/colors/
//
// Single source of truth for components that need hex values directly
// (mainly SVG diagrams). For Tailwind class usage, the same values are
// already wired up as CSS variables in src/index.css under semantic names
// (--accent-teal, --accent-blue, etc.), so prefer those when styling DOM.

export const borealis = {
  // Brand colors
  primary:             '#0B64DD',
  accent:              '#BC1E70',
  accentSecondary:     '#008B87',
  success:             '#008A5E',
  warning:             '#FACB3D',
  danger:              '#C61E25',

  // Text colors (for light backgrounds)
  textHeading:         '#111C2C',
  textParagraph:       '#1D2A3E',
  textSubdued:         '#516381',
  textInk:             '#07101F',
  link:                '#1750BA',
  textPrimary:         '#1750BA',
  textAccent:          '#A11262',
  textAccentSecondary: '#047471',
  textSuccess:         '#09724D',
  textWarning:         '#825803',
  textDanger:          '#A71627',

  // Text colors (for dark backgrounds)
  textGhost:           '#FFFFFF',

  // Background tints
  bgPrimaryLight:      '#F1F6FF',
  bgAccentLight:       '#FFF0F8',
  bgTealLight:         '#EAFBFA',
  bgSuccessLight:      '#E9FFF7',
  bgWarningLight:      '#FFF7E2',
  bgDangerLight:       '#FFF3F1',

  // Dark backgrounds
  bgDark:              '#07101F',
  bgDarkPanel:         '#1D2A3E',

  // Borders / neutrals
  borderLight:         '#D3DAE6',
  borderSubdued:       '#E1E5EE',
}
