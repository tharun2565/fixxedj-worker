import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getOnboardingMeta, type TradeId } from '../state/onboardingMeta';
import { colors, fontFamilies, shadows } from '../theme';

const TRADE_LABEL: Record<string, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  appliances: 'Appliances Repair',
  maid: 'Maid Service',
};

const ALL_TRADES: TradeId[] = ['electrician', 'plumber', 'appliances', 'maid'];

type PendingService = {
  id: string;
  trade: TradeId;
  status: 'pending';
};

export function ServicesScreen() {
  const meta = getOnboardingMeta();
  const trades = meta.trades;
  const [pending, setPending] = useState<PendingService[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const available = useMemo(
    () =>
      ALL_TRADES.filter(
        (t) => !trades.includes(t) && !pending.some((p) => p.trade === t),
      ),
    [trades, pending],
  );

  const requestAdd = (trade: TradeId) => {
    setPending((prev) => [
      ...prev,
      { id: `p-${Date.now()}`, trade, status: 'pending' },
    ]);
    setPickerOpen(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Pressable
          style={[styles.addHeaderBtn, available.length === 0 && styles.addDisabled]}
          disabled={available.length === 0}
          onPress={() => setPickerOpen(true)}
        >
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.addHeaderText}>Add</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionHint}>
          Verified services you can take jobs for
        </Text>
        {trades.length === 0 ? (
          <Text style={styles.empty}>No verified services yet.</Text>
        ) : (
          trades.map((trade) => (
            <View key={trade} style={styles.card}>
              <View style={styles.iconBox}>
                <MaterialIcons name="handyman" size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{TRADE_LABEL[trade] ?? trade}</Text>
                <Text style={styles.cardSub}>
                  Experience: {meta.experience ?? '—'}
                </Text>
                <View style={styles.verifiedPill}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {pending.length > 0 ? (
          <>
            <Text style={[styles.sectionHint, { marginTop: 12 }]}>
              Waiting for hub approval
            </Text>
            {pending.map((p) => (
              <View key={p.id} style={styles.pendingCard}>
                <MaterialIcons name="hourglass-top" size={22} color={colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{TRADE_LABEL[p.trade]}</Text>
                  <Text style={styles.pendingLabel}>Under verification</Text>
                </View>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="slide">
        <View style={styles.scrim}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Request another service</Text>
              <Pressable onPress={() => setPickerOpen(false)}>
                <Ionicons name="close" size={22} color={colors.black} />
              </Pressable>
            </View>
            <Text style={styles.sheetHint}>
              New trades stay under verification until the hub approves.
            </Text>
            {available.map((t) => (
              <Pressable key={t} style={styles.pickRow} onPress={() => requestAdd(t)}>
                <Text style={styles.pickText}>{TRADE_LABEL[t]}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.brand} />
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 22,
    color: colors.black,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addDisabled: { opacity: 0.4 },
  addHeaderText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 12,
    color: colors.white,
  },
  body: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },
  sectionHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  empty: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    color: colors.slate500,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 14,
    ...shadows.card,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.black,
  },
  cardSub: {
    marginTop: 2,
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  verifiedPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 10,
    color: colors.successDark,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    padding: 14,
  },
  pendingLabel: {
    marginTop: 2,
    fontFamily: fontFamilies.sansBold,
    fontSize: 12,
    color: colors.primary,
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 28,
    gap: 8,
  },
  sheetHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.black,
  },
  sheetHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate600,
    marginBottom: 4,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 14,
  },
  pickText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.black,
  },
});
