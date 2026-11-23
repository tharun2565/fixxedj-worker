import { useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, fontFamilies, shadows } from '../theme';

type Bank = {
  id: string;
  holder: string;
  bank: string;
  last4: string;
  verified: boolean;
};

type Withdrawal = {
  id: string;
  amount: number;
  bank: string;
  last4: string;
  at: string;
  status: 'Success' | 'Processing';
};

const INITIAL: Bank[] = [
  {
    id: '1',
    holder: 'Tarun',
    bank: 'HDFC Bank',
    last4: '4821',
    verified: true,
  },
];

const BANK_NAMES = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Yes Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IDFC FIRST Bank',
  'IndusInd Bank',
  'Federal Bank',
  'South Indian Bank',
  'RBL Bank',
];

const IFSC_PREFIX: Record<string, string> = {
  HDFC: 'HDFC Bank',
  ICIC: 'ICICI Bank',
  SBIN: 'State Bank of India',
  UTIB: 'Axis Bank',
  KKBK: 'Kotak Mahindra Bank',
  YESB: 'Yes Bank',
  PUNB: 'Punjab National Bank',
  BARB: 'Bank of Baroda',
  CNRB: 'Canara Bank',
  UBIN: 'Union Bank of India',
  IDFB: 'IDFC FIRST Bank',
  INDB: 'IndusInd Bank',
  FDRL: 'Federal Bank',
  SIBL: 'South Indian Bank',
  RATN: 'RBL Bank',
};

const SEED_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'w1',
    amount: 2500,
    bank: 'HDFC Bank',
    last4: '4821',
    at: 'Today · 10:24 am',
    status: 'Success',
  },
  {
    id: 'w2',
    amount: 1800,
    bank: 'HDFC Bank',
    last4: '4821',
    at: 'Yesterday · 6:12 pm',
    status: 'Success',
  },
  {
    id: 'w3',
    amount: 3200,
    bank: 'HDFC Bank',
    last4: '4821',
    at: '12 Nov · 3:40 pm',
    status: 'Success',
  },
];

export function WalletScreen() {
  const [banks, setBanks] = useState<Bank[]>(INITIAL);
  const [selectedId, setSelectedId] = useState(INITIAL[0].id);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(SEED_WITHDRAWALS);
  const [balance, setBalance] = useState(8976);
  const [form, setForm] = useState({
    holder: '',
    bank: '',
    account: '',
    ifsc: '',
  });
  const [sentVerify, setSentVerify] = useState(false);
  const [showBankSuggest, setShowBankSuggest] = useState(false);

  const verified = banks.filter((b) => b.verified);
  const selected = verified.find((b) => b.id === selectedId) ?? verified[0];

  const bankSuggestions = useMemo(() => {
    const q = form.bank.trim().toLowerCase();
    if (q.length < 1) return [];
    return BANK_NAMES.filter((b) => b.toLowerCase().startsWith(q)).slice(0, 6);
  }, [form.bank]);

  const onIfscChange = (raw: string) => {
    const ifsc = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    const prefix = ifsc.slice(0, 4);
    const detected = IFSC_PREFIX[prefix];
    setForm((f) => ({
      ...f,
      ifsc,
      bank: detected ?? f.bank,
    }));
    if (detected) setShowBankSuggest(false);
  };

  const submitWithdraw = () => {
    Keyboard.dismiss();
    const n = Number(amount);
    if (!selected || !n || n > balance) return;
    const when = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    setWithdrawals((prev) => [
      {
        id: `w-${Date.now()}`,
        amount: n,
        bank: selected.bank,
        last4: selected.last4,
        at: when,
        status: 'Processing',
      },
      ...prev,
    ]);
    setBalance((b) => b - n);
    setWithdrawDone(true);
    setTimeout(() => {
      setWithdrawDone(false);
      setWithdrawOpen(false);
      setAmount('');
    }, 1600);
  };

  const sendForVerification = () => {
    Keyboard.dismiss();
    if (!form.holder.trim() || !form.bank.trim() || !form.account.trim() || form.ifsc.length < 11) {
      return;
    }
    const next: Bank = {
      id: `b-${Date.now()}`,
      holder: form.holder.trim(),
      bank: form.bank.trim(),
      last4: form.account.slice(-4),
      verified: false,
    };
    setBanks((prev) => [...prev, next]);
    setSentVerify(true);
    setTimeout(() => {
      setSentVerify(false);
      setAddOpen(false);
      setForm({ holder: '', bank: '', account: '', ifsc: '' });
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <View style={styles.balanceCard}>
              <Text style={styles.label}>Available balance</Text>
              <Text style={styles.amount}>₹{balance.toLocaleString('en-IN')}.00</Text>
              <View style={styles.row}>
                <Ionicons name="flash" size={16} color={colors.brand} />
                <Text style={styles.hint}>Instant daily payouts after jobs</Text>
              </View>
              <Pressable style={styles.withdrawBtn} onPress={() => setWithdrawOpen(true)}>
                <MaterialIcons name="account-balance" size={18} color={colors.black} />
                <Text style={styles.withdrawText}>Withdraw</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verified bank accounts</Text>
              <Text style={styles.sectionHint}>Only verified methods can receive payouts</Text>
              {verified.map((b) => {
                const on = selected?.id === b.id;
                return (
                  <Pressable
                    key={b.id}
                    style={[styles.bankCard, on && styles.bankCardOn]}
                    onPress={() => setSelectedId(b.id)}
                  >
                    <View style={styles.bankIcon}>
                      <MaterialIcons name="account-balance" size={22} color={colors.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bankName}>{b.bank}</Text>
                      <Text style={styles.bankMeta}>
                        {b.holder} · ****{b.last4}
                      </Text>
                      <View style={styles.verifiedPill}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={on ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={on ? colors.brand : colors.slate400}
                    />
                  </Pressable>
                );
              })}

              {banks.some((b) => !b.verified) ? (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Pending verification</Text>
                  {banks
                    .filter((b) => !b.verified)
                    .map((b) => (
                      <View key={b.id} style={styles.pendingCard}>
                        <Text style={styles.bankName}>{b.bank}</Text>
                        <Text style={styles.bankMeta}>
                          {b.holder} · ****{b.last4}
                        </Text>
                        <Text style={styles.pendingLabel}>Sent for verification</Text>
                      </View>
                    ))}
                </>
              ) : null}

              <Pressable style={styles.addBackup} onPress={() => setAddOpen(true)}>
                <Ionicons name="add-circle-outline" size={20} color={colors.brand} />
                <Text style={styles.addBackupText}>Add backup bank account</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Withdrawal history</Text>
              <Text style={styles.sectionHint}>
                {withdrawals.length} withdrawal{withdrawals.length === 1 ? '' : 's'}
              </Text>
              {withdrawals.map((w) => (
                <View key={w.id} style={styles.historyCard}>
                  <View style={styles.historyIcon}>
                    <MaterialIcons name="south-west" size={18} color={colors.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>Withdraw to {w.bank}</Text>
                    <Text style={styles.historyMeta}>
                      ****{w.last4} · {w.at}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>₹{w.amount.toLocaleString('en-IN')}</Text>
                    <Text
                      style={[
                        styles.historyStatus,
                        w.status === 'Success' && styles.historySuccess,
                      ]}
                    >
                      {w.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <Modal visible={withdrawOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.scrim}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <Pressable style={{ flex: 1 }} onPress={() => { Keyboard.dismiss(); setWithdrawOpen(false); }} />
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Withdraw</Text>
              <Pressable onPress={() => { Keyboard.dismiss(); setWithdrawOpen(false); }}>
                <Ionicons name="close" size={22} color={colors.black} />
              </Pressable>
            </View>
            {selected ? (
              <View style={styles.selectedBank}>
                <Text style={styles.bankName}>{selected.bank}</Text>
                <Text style={styles.bankMeta}>****{selected.last4}</Text>
              </View>
            ) : null}
            <Text style={styles.fieldLabel}>AMOUNT</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="₹0"
              placeholderTextColor={colors.slate400}
              value={amount}
              onChangeText={setAmount}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            {withdrawDone ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                <Text style={styles.successText}>Withdrawal initiated</Text>
              </View>
            ) : (
              <Pressable
                style={styles.primaryBtn}
                onPress={submitWithdraw}
                hitSlop={8}
              >
                <Text style={styles.primaryText}>Use this bank account</Text>
              </Pressable>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={addOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.scrim}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              Keyboard.dismiss();
              setShowBankSuggest(false);
            }}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Add backup account</Text>
              <Pressable onPress={() => { Keyboard.dismiss(); setAddOpen(false); }}>
                <Ionicons name="close" size={22} color={colors.black} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 420 }}
            >
              <Text style={styles.fieldLabel}>ACCOUNT HOLDER NAME</Text>
              <TextInput
                style={styles.input}
                value={form.holder}
                onChangeText={(holder) => setForm((f) => ({ ...f, holder }))}
                placeholder="Name as per bank"
                placeholderTextColor={colors.slate400}
              />

              <Text style={styles.fieldLabel}>IFSC</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="characters"
                value={form.ifsc}
                onChangeText={onIfscChange}
                placeholder="e.g. HDFC0001234"
                placeholderTextColor={colors.slate400}
                maxLength={11}
              />
              <Text style={styles.ifscHint}>Bank name fills automatically from IFSC</Text>

              <Text style={styles.fieldLabel}>BANK NAME</Text>
              <TextInput
                style={styles.input}
                value={form.bank}
                onFocus={() => setShowBankSuggest(true)}
                onChangeText={(bank) => {
                  setForm((f) => ({ ...f, bank }));
                  setShowBankSuggest(true);
                }}
                placeholder="Start typing bank name"
                placeholderTextColor={colors.slate400}
              />
              {showBankSuggest && bankSuggestions.length > 0 ? (
                <View style={styles.suggestBox}>
                  {bankSuggestions.map((b) => (
                    <Pressable
                      key={b}
                      style={styles.suggestRow}
                      onPress={() => {
                        setForm((f) => ({ ...f, bank: b }));
                        setShowBankSuggest(false);
                        Keyboard.dismiss();
                      }}
                    >
                      <Text style={styles.suggestText}>{b}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>ACCOUNT NUMBER</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={form.account}
                onChangeText={(account) => setForm((f) => ({ ...f, account }))}
                placeholder="Account number"
                placeholderTextColor={colors.slate400}
              />

              {sentVerify ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  <Text style={styles.successText}>Sent for verification</Text>
                </View>
              ) : (
                <Pressable style={styles.primaryBtn} onPress={sendForVerification} hitSlop={8}>
                  <Text style={styles.primaryText}>Send for verification</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  },
  title: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 22,
    color: colors.black,
  },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  balanceCard: {
    backgroundColor: colors.black,
    borderRadius: 20,
    padding: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.brand,
    ...shadows.raised,
  },
  label: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  amount: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 34,
    color: colors.white,
  },
  row: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hint: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: colors.brand,
  },
  withdrawBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  withdrawText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.black,
  },
  section: { gap: 10, marginTop: 16 },
  sectionTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.black,
  },
  sectionHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
    marginTop: -4,
  },
  bankCard: {
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
  bankCardOn: { borderColor: colors.brand, backgroundColor: colors.surfaceContainer },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.black,
  },
  bankMeta: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
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
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    padding: 14,
    gap: 2,
  },
  pendingLabel: {
    marginTop: 6,
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.primary,
  },
  addBackup: {
    marginTop: 4,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBackupText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.brand,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 12,
    ...shadows.card,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  historyMeta: {
    marginTop: 2,
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    color: colors.slate500,
  },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 14,
    color: colors.black,
  },
  historyStatus: {
    marginTop: 2,
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: '#B45309',
  },
  historySuccess: { color: colors.success },
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
    gap: 8,
    paddingBottom: 28,
  },
  sheetHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.black,
  },
  selectedBank: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 12,
  },
  fieldLabel: {
    marginTop: 6,
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.slate500,
  },
  ifscHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    color: colors.slate500,
    marginTop: -2,
    marginBottom: 4,
  },
  input: {
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingHorizontal: 12,
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    color: colors.black,
  },
  suggestBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 12,
    marginTop: -4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  suggestRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  suggestText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    color: colors.black,
  },
  primaryBtn: {
    marginTop: 10,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  successBox: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.successBg,
    borderRadius: 12,
    padding: 14,
  },
  successText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.successDark,
  },
});
