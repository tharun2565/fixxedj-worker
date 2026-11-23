import { useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaptainHelpModal } from '../components/CaptainHelpModal';
import { colors, fontFamilies, shadows, type } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export function PaymentScreen({ navigation, route }: Props) {
  const { job, lines } = route.params;
  const [mode, setMode] = useState<'upi' | 'cash'>('upi');
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const visitLine = lines.find((l) => l.id === 'visit-fee');
  const visitFee = visitLine?.price ?? 99;
  const serviceLines = lines.filter((l) => l.kind === 'service' && l.id !== 'visit-fee');
  const partLines = lines.filter((l) => l.kind === 'part');
  const serviceTotal = serviceLines.reduce((s, l) => s + l.price, 0);
  const partsTotal = partLines.reduce((s, l) => s + l.price, 0);
  const billTotal = visitFee + serviceTotal + partsTotal;

  const canEnd = paymentReceived;

  const endJob = () => {
    if (!canEnd) return;
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'JobCompleted',
          params: {
            job,
            lines,
            total: billTotal,
            paymentMethod: mode,
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.lockPill}>
          <Text style={styles.lockText}>IN JOB</Text>
        </View>
        <Text style={styles.headerTitle}>Payment</Text>
        <Pressable style={styles.helpBtn} onPress={() => setHelpOpen(true)}>
          <MaterialIcons name="help" size={24} color={colors.help} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headline}>Payment & final bill summary</Text>
        <Text style={styles.sub}>Collect dues from {job.customer}</Text>

        <View style={styles.billCard}>
          <View style={styles.idPill}>
            <Text style={styles.workId}>WORK ID #{job.id}</Text>
          </View>
          <Text style={styles.billLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.billAmount}>₹{billTotal}</Text>

          <View style={styles.billLines}>
            <View style={styles.billRow}>
              <Text style={styles.billRowLabel}>Visiting fee</Text>
              <Text style={styles.billRowVal}>₹{visitFee}</Text>
            </View>

            <Text style={[styles.groupTitle, { marginTop: 10 }]}>Service fee</Text>
            {serviceLines.length === 0 ? (
              <Text style={styles.emptyLine}>No services selected</Text>
            ) : (
              serviceLines.map((l) => (
                <View key={l.id} style={styles.billRow}>
                  <Text style={styles.billRowLabel}>{l.name}</Text>
                  <Text style={styles.billRowVal}>₹{l.price}</Text>
                </View>
              ))
            )}
            <View style={styles.billRow}>
              <Text style={styles.billRowLabelBold}>Service total</Text>
              <Text style={styles.billRowValBold}>₹{serviceTotal}</Text>
            </View>

            <Text style={[styles.groupTitle, { marginTop: 10 }]}>Parts</Text>
            {partLines.length === 0 ? (
              <Text style={styles.emptyLine}>No parts added</Text>
            ) : (
              partLines.map((l) => (
                <View key={l.id} style={styles.billRow}>
                  <Text style={styles.billRowLabel}>{l.name}</Text>
                  <Text style={styles.billRowVal}>₹{l.price}</Text>
                </View>
              ))
            )}
            <View style={styles.billRow}>
              <Text style={styles.billRowLabelBold}>Parts total</Text>
              <Text style={styles.billRowValBold}>₹{partsTotal}</Text>
            </View>

            <View style={styles.divider} />
            <View style={styles.billRow}>
              <Text style={styles.totalLabel}>Total amount</Text>
              <Text style={styles.totalVal}>₹{billTotal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, mode === 'upi' && styles.tabOn]}
            onPress={() => {
              setMode('upi');
              setPaymentReceived(false);
            }}
          >
            <MaterialIcons
              name="qr-code-2"
              size={18}
              color={mode === 'upi' ? colors.brand : colors.slate500}
            />
            <Text style={[styles.tabText, mode === 'upi' && styles.tabTextOn]}>UPI</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, mode === 'cash' && styles.tabOn]}
            onPress={() => {
              setMode('cash');
              setPaymentReceived(false);
            }}
          >
            <MaterialIcons
              name="payments"
              size={18}
              color={mode === 'cash' ? colors.brand : colors.slate500}
            />
            <Text style={[styles.tabText, mode === 'cash' && styles.tabTextOn]}>Cash</Text>
          </Pressable>
        </View>

        {mode === 'upi' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Company UPI scanner</Text>
            <View style={styles.qrBox}>
              <MaterialIcons name="qr-code-2" size={120} color={colors.black} />
              <View style={styles.qrBadge}>
                <MaterialIcons name="handyman" size={22} color={colors.white} />
              </View>
            </View>
            <Text style={styles.qrHint}>Customer scans to pay ₹{billTotal}</Text>
            <View style={styles.listen}>
              <View style={styles.liveDot} />
              <Text style={styles.listenText}>
                Listening · fixxedj.{job.id.slice(-4)}@icici
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Cash collection</Text>
            <Text style={styles.qrHint}>Collect ₹{billTotal} in cash from the customer</Text>
          </View>
        )}

        <Pressable
          style={[styles.cashCheck, paymentReceived && styles.cashCheckOn]}
          onPress={() => setPaymentReceived((v) => !v)}
        >
          <MaterialIcons
            name={paymentReceived ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={paymentReceived ? colors.success : colors.slate400}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.cashTitle}>Your payment received</Text>
            <Text style={styles.cashSub}>
              Confirm {mode === 'upi' ? 'UPI' : 'cash'} of ₹{billTotal} before Job done
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          style={[styles.endBtn, !canEnd && styles.endDisabled]}
          disabled={!canEnd}
          onPress={endJob}
        >
          <MaterialIcons name="task-alt" size={20} color={colors.white} />
          <Text style={styles.endText}>Job done</Text>
        </Pressable>
      </SafeAreaView>

      <CaptainHelpModal
        visible={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Payment help"
        steps={[
          'Collect via UPI or cash.',
          'Tick Your payment received after money is in.',
          'Press Job done to rate the customer, then go home.',
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    gap: 8,
  },
  lockPill: {
    backgroundColor: colors.black,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  lockText: {
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.white,
  },
  headerTitle: {
    ...type.screenTitle,
    flex: 1,
  },
  helpBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, gap: 12, paddingBottom: 24 },
  headline: {
    ...type.heroTitle,
  },
  sub: {
    ...type.body,
    marginTop: -6,
  },
  billCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
    gap: 6,
    ...shadows.card,
  },
  idPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 4,
  },
  workId: { fontFamily: fontFamilies.mono, fontSize: 11, color: colors.white },
  billLabel: {
    ...type.labelCaps,
  },
  billAmount: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 32,
    color: colors.black,
  },
  billLines: { marginTop: 8, gap: 6 },
  groupTitle: {
    ...type.labelCaps,
  },
  emptyLine: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  billRowLabel: {
    flex: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate700,
  },
  billRowVal: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  billRowLabelBold: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  billRowValBold: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 13,
    color: colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: colors.slate200,
    marginVertical: 6,
  },
  totalLabel: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 15,
    color: colors.black,
  },
  totalVal: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 16,
    color: colors.brand,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabOn: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.brand },
  tabText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.slate500,
  },
  tabTextOn: { color: colors.brand },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    ...type.sectionTitle,
    alignSelf: 'flex-start',
  },
  qrBox: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBadge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrHint: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: colors.slate700,
  },
  listen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: 'stretch',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  listenText: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    color: colors.slate600,
  },
  cashCheck: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  cashCheckOn: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  cashTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.black,
  },
  cashSub: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    color: colors.slate500,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
  },
  endBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.brandGlow,
  },
  endDisabled: { opacity: 0.4 },
  endText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.white,
  },
});
