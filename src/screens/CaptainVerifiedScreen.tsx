import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getFaceDraft } from '../state/faceOnboardingDraft';
import { getOnboardingMeta } from '../state/onboardingMeta';
import { colors, fontFamilies } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CaptainVerified'>;

const TRADE_LABEL: Record<string, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  appliances: 'Appliances',
  maid: 'Maid Service',
};

export function CaptainVerifiedScreen({ navigation }: Props) {
  const draft = getFaceDraft();
  const meta = getOnboardingMeta();
  const category =
    meta.trades.map((t) => TRADE_LABEL[t] ?? t).join(' · ') || 'Captain';
  const displayName = draft.fullName.trim() || 'Captain';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="verified" size={18} color={colors.white} />
          </View>
          <Text style={styles.brand}>
            Fixxedj <Text style={styles.brandAccent}>Captain</Text>
          </Text>
        </View>
        <View style={styles.certifiedPill}>
          <View style={styles.certifiedDot} />
          <Text style={styles.certifiedText}>Verified</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.photoRing}>
          {draft.photoUri ? (
            <Image source={{ uri: draft.photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoFallback}>
              <Ionicons name="person" size={48} color={colors.brand} />
            </View>
          )}
          <View style={styles.verifiedStamp}>
            <MaterialIcons name="workspace-premium" size={14} color={colors.white} />
            <Text style={styles.verifiedStampText}>Hub approved</Text>
          </View>
        </View>

        <Text style={styles.title}>
          You’re officially a{'\n'}
          <Text style={styles.titleAccent}>Fixxedj Captain</Text>
        </Text>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.avatarMiniWrap}>
              {draft.photoUri ? (
                <Image source={{ uri: draft.photoUri }} style={styles.avatarMini} />
              ) : (
                <View style={[styles.avatarMini, styles.photoFallback]} />
              )}
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{displayName}</Text>
                <MaterialIcons name="verified" size={16} color={colors.brand} />
              </View>
              <Text style={styles.captainId}>{meta.applicationId}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {category}
              </Text>
            </View>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Hub</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {meta.hubLabel?.split('·')[0]?.trim() ?? 'Fixxedj Hub'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.replace('MainTabs')}
        >
          <Text style={styles.primaryText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8faff' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 15,
    color: colors.slate900,
  },
  brandAccent: { color: colors.brand },
  certifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  certifiedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  certifiedText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.successDark,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  photoRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 4,
    borderColor: 'rgba(58,134,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: colors.brand,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  photo: {
    width: 152,
    height: 152,
    borderRadius: 76,
  },
  photoFallback: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedStamp: {
    position: 'absolute',
    bottom: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verifiedStampText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.white,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.slate900,
    textAlign: 'center',
  },
  titleAccent: { color: colors.brand },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(58,134,255,0.15)',
    padding: 16,
    gap: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMiniWrap: { position: 'relative' },
  avatarMini: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.slate900,
  },
  captainId: {
    marginTop: 2,
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    color: colors.slate500,
  },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaBox: {
    flex: 1,
    backgroundColor: colors.slate50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate100,
    padding: 10,
  },
  metaLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    color: colors.slate500,
  },
  metaValue: {
    marginTop: 2,
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.slate900,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.white,
  },
});
