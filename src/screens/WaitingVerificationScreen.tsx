import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getOnboardingMeta } from '../state/onboardingMeta';
import { colors, fontFamilies } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'WaitingVerification'>;

const STEPS = [
  {
    id: 'submitted',
    title: 'Documents Submitted',
    status: 'done' as const,
  },
  {
    id: 'review',
    title: 'Document Verification',
    status: 'active' as const,
  },
  {
    id: 'hub',
    title: 'In-Person Verification Hub',
    status: 'upcoming' as const,
  },
];

export function WaitingVerificationScreen({ navigation }: Props) {
  const { applicationId } = getOnboardingMeta();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>
          Fixxedj <Text style={styles.brandAccent}>Captain</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <MaterialIcons name="verified-user" size={42} color={colors.brand} />
        </View>

        <View style={styles.pill}>
          <MaterialIcons name="hourglass-top" size={14} color={colors.brand} />
          <Text style={styles.pillText}>Under review</Text>
        </View>

        <Text style={styles.title}>Verification in progress</Text>
        <Text style={styles.sub}>Estimated approval: 1–2 working days</Text>

        <View style={styles.idCard}>
          <Text style={styles.idLabel}>APPLICATION ID</Text>
          <Text style={styles.idValue}>{applicationId}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          {STEPS.map((step, index) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepRail}>
                <View
                  style={[
                    styles.stepDot,
                    step.status === 'done' && styles.stepDotDone,
                    step.status === 'active' && styles.stepDotActive,
                  ]}
                >
                  {step.status === 'done' ? (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  ) : step.status === 'active' ? (
                    <View style={styles.stepDotInner} />
                  ) : null}
                </View>
                {index < STEPS.length - 1 ? (
                  <View
                    style={[
                      styles.stepLine,
                      step.status === 'done' && styles.stepLineDone,
                    ]}
                  />
                ) : null}
              </View>
              <View style={styles.stepCopy}>
                <Text
                  style={[
                    styles.stepTitle,
                    step.status === 'active' && styles.stepTitleActive,
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={styles.stepStatus}>
                  {step.status === 'done'
                    ? 'Completed'
                    : step.status === 'active'
                      ? 'In progress'
                      : 'Upcoming'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.supportRow}>
          <Pressable style={styles.supportBtn}>
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.white} />
            <Text style={styles.supportPrimaryText}>Chat support</Text>
          </Pressable>
          <Pressable style={styles.supportSecondary}>
            <Ionicons name="call-outline" size={18} color={colors.slate800} />
            <Text style={styles.supportSecondaryText}>Call support</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.continueBtn}
          onPress={() => navigation.navigate('HubSchedule')}
        >
          <Text style={styles.continueText}>Schedule hub visit</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.slate900,
  },
  brandAccent: { color: colors.brand },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: 'rgba(58,134,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  pillText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 24,
    color: colors.slate900,
    textAlign: 'center',
  },
  sub: {
    marginTop: 6,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    color: colors.slate500,
    textAlign: 'center',
    marginBottom: 18,
  },
  idCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 14,
    marginBottom: 14,
  },
  idLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.slate500,
    letterSpacing: 0.6,
  },
  idValue: {
    marginTop: 4,
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 20,
    color: colors.slate900,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 18,
  },
  cardTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.slate900,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
  },
  stepRail: {
    width: 28,
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: colors.success },
  stepDotActive: { backgroundColor: colors.brand },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.slate200,
    marginVertical: 4,
  },
  stepLineDone: { backgroundColor: colors.brand },
  stepCopy: { flex: 1, paddingTop: 2 },
  stepTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.slate800,
  },
  stepTitleActive: { color: colors.brand },
  stepStatus: {
    marginTop: 2,
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    backgroundColor: colors.white,
    padding: 16,
    gap: 10,
  },
  supportRow: { flexDirection: 'row', gap: 10 },
  supportBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  supportPrimaryText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.white,
  },
  supportSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  supportSecondaryText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.slate800,
  },
  continueBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
