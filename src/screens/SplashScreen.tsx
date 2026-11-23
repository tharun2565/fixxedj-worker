import { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamilies } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const goNext = () => navigation.replace('Welcome');

  useEffect(() => {
    const timer = setTimeout(goNext, 2400);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Soft ambient glow — Stitch App Open */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />
      <View style={styles.glowSide} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Pressable style={styles.body} onPress={goNext}>
          <View style={styles.topBar}>
            <View style={styles.fleetRow}>
              <View style={styles.fleetDot} />
              <Text style={styles.fleetText}>Connected to Fleet</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.fixxedjPill}>
              <Text style={styles.fixxedj}>Fixxedj</Text>
            </View>
            <Text style={styles.captain}>CAPTAIN</Text>
            <View style={styles.portalPill}>
              <View style={styles.portalDot} />
              <Text style={styles.portalText}>Partner Driver Portal</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.startBtn}>
              <Text style={styles.startText}>Start Working</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.brand} />
            </View>
            <Text style={styles.startHint}>
              Tap to begin shift & receive customer bookings
            </Text>
          </View>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -260,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(96, 165, 250, 0.22)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 40,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(147, 197, 253, 0.28)',
  },
  glowSide: {
    position: 'absolute',
    top: '42%',
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(165, 180, 252, 0.2)',
  },
  safe: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingTop: 8,
  },
  fleetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fleetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  fleetText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  fixxedjPill: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: '#0C1A32',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fixxedj: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 34,
    color: colors.brand,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  captain: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 52,
    color: colors.black,
    letterSpacing: -1.4,
    lineHeight: 56,
    textTransform: 'uppercase',
  },
  portalPill: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  portalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6EE7B7',
  },
  portalText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: colors.white,
    letterSpacing: 0.2,
  },
  footer: {
    paddingBottom: 12,
    gap: 10,
  },
  startBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0C1A32',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  startText: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 16,
    color: colors.brand,
    letterSpacing: -0.2,
  },
  startHint: {
    textAlign: 'center',
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
});
