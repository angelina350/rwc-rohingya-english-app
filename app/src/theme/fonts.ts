// Use the platform's native system font consistently; it retains script fallback
// support while the app's sizes and weights provide a shared type scale.
export const fonts = {
  size: { sm: 14, md: 16, lg: 22, xl: 32 },
  weight: { regular: '400', bold: '700' },
} as const;
