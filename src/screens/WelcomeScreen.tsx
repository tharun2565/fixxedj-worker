import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandHeader } from '../components/BrandHeader';
import { BRAND_ASSETS } from '../constants/assets';
import { colors, fontFamilies, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const FEATURES = [
  'Instant Daily Payouts',
  'Verified Jobs Near You',
  'Zero Joining Fee',
] as const;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.topSpace} />
      <BrandHeader variant="welcome" showLanguage={false} showHelp={false} />

      <View style={styles.heroWrap}>
        <Image
          source={BRAND_ASSETS.welcomeWorkers}
          style={styles.hero}
          resizeMode="cover"
          accessibilityLabel="Fixxedj Captain team: three workers ready for field jobs"
        />
        <View style={styles.heroFade} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.headline}>
          Your Skill.{' '}
          <Text style={styles.headlineAccent}>Your Freedom.</Text>
        </Text>

        <View style={styles.chips}>
          {FEATURES.map((label) => (
            <View key={label} style={styles.chip}>
              <Ionicons name="checkmark" size={14} color={colors.brand} />
              <Text style={styles.chipText}>{label}</Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryBtnText}>Login</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryBtnText}>Register as New Captain</Text>
        </Pressable>

        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.welcomeBackground,
  },
  topSpace: {
    height: 10,
  },
  heroWrap: {
    width: '100%',
    marginTop: 4,
    overflow: 'hidden',
    flex: 1,
    minHeight: 300,
  },
  hero: {
    width: '100%',
    height: '100%',
    minHeight: 300,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
    backgroundColor: 'rgba(248, 250, 255, 0.88)',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.sm,
    gap: 12,
  },
  headline: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
    color: colors.slate900,
    textAlign: 'center',
  },
  headlineAccent: {
    color: colors.brand,
    fontFamily: fontFamilies.sansBold,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: colors.slate700,
  },
  primaryBtn: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.white,
  },
  secondaryBtn: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    borderRadius: radii.xl,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.slate800,
  },
  homeIndicator: {
    width: 128,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    alignSelf: 'center',
    marginTop: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
