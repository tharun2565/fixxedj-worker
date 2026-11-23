import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

/** Soft elevation for premium cards — iOS shadow + Android elevation */
export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      elevation: 4,
    },
    default: {},
  })!,
  raised: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.14,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: 10,
    },
    default: {},
  })!,
  brandGlow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.brand,
      shadowOpacity: 0.28,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: {
      elevation: 6,
    },
    default: {},
  })!,
} as const;
