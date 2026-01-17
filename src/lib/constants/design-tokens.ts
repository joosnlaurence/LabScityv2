/**
 * Design Tokens
 * 
 * Values extracted from Figma mockup and scaled to ~60% for web implementation.
 * All values are in rem units (base: 16px = 1rem).
 */

// Font Sizes (scaled to ~60% of Figma)
export const fontSizes = {
  label: "1.8rem", // 48px → 28.8px (large labels)
  input: "1.35rem", // 36px → 21.6px (input text, button text)
} as const;

// Spacing & Sizing (scaled to ~60% of Figma)
export const spacing = {
  inputHeight: "2.75rem", // 74px → 44.4px
  buttonHeight: "3rem", // 82px → 49.2px
  inputWidth: "22rem", // 592px → 355.2px
} as const;

// Border Radius (scaled to ~60% of Figma)
export const radius = {
  card: "0.75rem", // 20px → 12px
  input: "0.56rem", // 15px → 9px
  button: "0.56rem", // 15px → 9px
} as const;

// Component-specific tokens
export const components = {
  form: {
    maxWidth: "58.625rem", // 938px → 562.8px (card width)
    minHeight: "92.75rem", // 1484px → 890.4px (card height)
  },
  logo: {
    size: "23rem", // 368px → 220.8px
  },
} as const;

// Export all tokens as a single object for convenience
export const designTokens = {
  fontSizes,
  spacing,
  radius,
  components,
} as const;
