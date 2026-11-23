import { TextStyle } from 'react-native';
import { colors } from './colors';
import { fontFamilies } from './fonts';

export { fontFamilies } from './fonts';

/** Shared type roles — use these for consistent weight across screens */
export const type = {
  screenTitle: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.black,
  } satisfies TextStyle,
  sectionTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.black,
  } satisfies TextStyle,
  heroTitle: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.black,
  } satisfies TextStyle,
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate700,
  } satisfies TextStyle,
  bodyStrong: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.black,
  } satisfies TextStyle,
  labelCaps: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.slate500,
  } satisfies TextStyle,
  button: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.white,
  } satisfies TextStyle,
} as const;

export const typography = {
  headlineLgMobile: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  } satisfies TextStyle,
  headlineMd: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 20,
    lineHeight: 28,
  } satisfies TextStyle,
  bodyMd: {
    fontFamily: fontFamilies.sans,
    fontSize: 16,
    lineHeight: 24,
  } satisfies TextStyle,
  bodyLg: {
    fontFamily: fontFamilies.sans,
    fontSize: 18,
    lineHeight: 26,
  } satisfies TextStyle,
  buttonText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    lineHeight: 20,
  } satisfies TextStyle,
  labelCaps: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  } satisfies TextStyle,
} as const;
