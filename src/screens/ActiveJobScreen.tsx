import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaptainHelpModal } from '../components/CaptainHelpModal';
import { colors, fontFamilies, shadows, type } from '../theme';
import type { BillLine, RootStackParamList } from '../types/navigation';

const VISIT_FEE = 99;

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveJob'>;

type CatalogItem = { id: string; name: string; price: number; hint?: string };

const SERVICES_BY_CAT: Record<string, CatalogItem[]> = {
  'Electrical Repair': [
    { id: 's2', name: 'Ceiling fan overhaul', price: 349, hint: 'Motor + blades' },
    { id: 's3', name: 'Switch / regulator replacement labour', price: 199 },
    { id: 's4', name: 'Wiring check & insulation', price: 249 },
  ],
  Plumbing: [
    { id: 's1', name: 'Leak inspection', price: 249 },
    { id: 's2', name: 'Tap / mixer replacement labour', price: 299 },
    { id: 's3', name: 'Drain unblock', price: 349 },
    { id: 's4', name: 'Under-sink joint reseal', price: 199 },
  ],
  Appliances: [
    { id: 's1', name: 'AC inspection visit', price: 399 },
    { id: 's2', name: 'AC deep clean / filter wash', price: 599 },
    { id: 's3', name: 'Drain pan & exhaust clean', price: 349 },
    { id: 's4', name: 'Gas pressure check', price: 299 },
  ],
};

const CHECKLIST_BY_CAT: Record<string, string[]> = {
  'Electrical Repair': [
    'Fan / fixture running smoothly at full speed',
    'No sparking at switch or regulator',
    'All terminals tightened and insulated',
    'No loose wires exposed',
    'Area cleaned after work',
  ],
  Plumbing: [
    'No drip at joints after 2-minute test',
    'Tap / mixer operates smoothly',
    'Drain flowing freely',
    'Floor / cabinet dried',
    'Old parts handed back to customer',
  ],
  Appliances: [
    'AC cooling and airflow normal',
    'Temperature noticeably cooler',
    'No unusual noise or vibration',
    'Drain line clear, no water leak',
    'Filters / panels refitted correctly',
    'Remote / mode settings explained',
  ],
};

export function ActiveJobScreen({ navigation, route }: Props) {
  const { job } = route.params;
  const services = SERVICES_BY_CAT[job.category] ?? SERVICES_BY_CAT['Electrical Repair'];
  const checklistItems =
    CHECKLIST_BY_CAT[job.category] ?? CHECKLIST_BY_CAT['Electrical Repair'];

  const [selectedServices, setSelectedServices] = useState<CatalogItem[]>([]);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [customService, setCustomService] = useState({ name: '', price: '' });
  const [parts, setParts] = useState<
    { id: string; name: string; qty: number; unitPrice: number; price: number }[]
  >([]);
  const [partsOpen, setPartsOpen] = useState(false);
  const [customPart, setCustomPart] = useState({ name: '', qty: '1', amount: '' });
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const serviceTotal =
    VISIT_FEE + selectedServices.reduce((s, i) => s + i.price, 0);
  const partsTotal = parts.reduce((s, p) => s + p.price, 0);
  const billTotal = serviceTotal + partsTotal;

  const lines: BillLine[] = useMemo(() => {
    const visitLine: BillLine = {
      id: 'visit-fee',
      name: 'Visiting fee',
      price: VISIT_FEE,
      kind: 'service',
    };
    const serviceLines: BillLine[] = selectedServices.map((s) => ({
      id: `svc-${s.id}`,
      name: s.name,
      price: s.price,
      kind: 'service',
    }));
    const partLines: BillLine[] = parts.map((p) => ({
      id: `part-${p.id}`,
      name: p.qty > 1 ? `${p.name} × ${p.qty}` : p.name,
      price: p.price,
      kind: 'part',
      qty: p.qty,
    }));
    return [visitLine, ...serviceLines, ...partLines];
  }, [selectedServices, parts]);

  const toggleService = (item: CatalogItem) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      if (exists) return prev.filter((s) => s.id !== item.id);
      return [...prev, item];
    });
  };

  const addCustomService = () => {
    const name = customService.name.trim();
    const price = Number(customService.price);
    if (!name || !price || Number.isNaN(price)) return;
    setSelectedServices((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name, price },
    ]);
    setCustomService({ name: '', price: '' });
    setAddServiceOpen(false);
    Keyboard.dismiss();
  };

  const addCustomPart = () => {
    const name = customPart.name.trim();
    const qty = Number(customPart.qty);
    const unitPrice = Number(customPart.amount);
    if (!name || !qty || Number.isNaN(qty) || qty < 1) return;
    if (!unitPrice || Number.isNaN(unitPrice) || unitPrice < 1) return;
    const price = qty * unitPrice;
    setParts((prev) => [
      ...prev,
      { id: `cp-${Date.now()}`, name, qty, unitPrice, price },
    ]);
    setCustomPart({ name: '', qty: '1', amount: '' });
    Keyboard.dismiss();
  };

  const removePart = (id: string) => {
    setParts((prev) => prev.filter((p) => p.id !== id));
  };

  const allChecked = checklistItems.every((_, i) => checked[i]);

  const openChecklist = () => {
    if (selectedServices.length === 0) return;
    setChecklistOpen(true);
  };

  const finishChecklist = () => {
    if (!allChecked) return;
    setChecklistOpen(false);
    navigation.replace('Payment', {
      job,
      lines,
      total: billTotal,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.lockPill}>
          <Ionicons name="lock-closed" size={12} color={colors.white} />
          <Text style={styles.lockText}>IN JOB</Text>
        </View>
        <Text style={styles.headerTitle}>Ongoing job</Text>
        <Pressable style={styles.helpBtn} onPress={() => setHelpOpen(true)}>
          <Ionicons name="help-circle" size={24} color={colors.help} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.statusBar}>
              <View style={styles.statusLeft}>
                <View style={styles.liveDot} />
                <Text style={styles.statusText}>WORK IN PROGRESS</Text>
              </View>
              <View style={styles.idPill}>
                <MaterialIcons name="tag" size={12} color={colors.white} />
                <Text style={styles.workId}>#{job.id}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.customerRow}>
                <Text style={styles.customer}>{job.customer}</Text>
                <View style={styles.iconActions}>
                  <Pressable style={styles.iconBtn}>
                    <Ionicons name="call" size={18} color={colors.white} />
                  </Pressable>
                  <Pressable style={[styles.iconBtn, styles.iconBtnChat]}>
                    <Ionicons name="chatbubble-ellipses" size={18} color={colors.white} />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.jobTitle}>{job.title}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Select services after inspection</Text>
                  <Text style={styles.sectionHint}>Tick what needs to be done</Text>
                </View>
                <Pressable style={styles.addBtn} onPress={() => setAddServiceOpen(true)}>
                  <Ionicons name="add" size={18} color={colors.white} />
                  <Text style={styles.addBtnText}>Add</Text>
                </Pressable>
              </View>

              {services.map((item) => {
                const on = selectedServices.some((s) => s.id === item.id);
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.selectRow, on && styles.selectRowOn]}
                    onPress={() => toggleService(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectName}>{item.name}</Text>
                      {item.hint ? <Text style={styles.selectHint}>{item.hint}</Text> : null}
                    </View>
                    <Text style={styles.selectPrice}>₹{item.price}</Text>
                    <Ionicons
                      name={on ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={on ? colors.brand : colors.slate400}
                    />
                  </Pressable>
                );
              })}

              {selectedServices
                .filter((s) => s.id.startsWith('custom-'))
                .map((item) => (
                  <View key={item.id} style={[styles.selectRow, styles.selectRowOn]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectName}>{item.name}</Text>
                      <Text style={styles.selectHint}>Custom service</Text>
                    </View>
                    <Text style={styles.selectPrice}>₹{item.price}</Text>
                  </View>
                ))}
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Parts (optional)</Text>
                  <Text style={styles.sectionHint}>Add only if spare parts were used</Text>
                </View>
                <Pressable
                  style={styles.addPartsBtn}
                  onPress={() => {
                    setCustomPart({ name: '', qty: '1', amount: '' });
                    setPartsOpen(true);
                  }}
                >
                  <Ionicons name="add-circle" size={18} color={colors.brand} />
                  <Text style={styles.addPartsText}>Add</Text>
                </Pressable>
              </View>

              {parts.length === 0 ? (
                <Text style={styles.emptyParts}>No parts added</Text>
              ) : (
                parts.map((p) => (
                  <View key={p.id} style={styles.partRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectName}>{p.name}</Text>
                      <Text style={styles.selectHint}>
                        Qty {p.qty} · ₹{p.unitPrice} each
                      </Text>
                    </View>
                    <Text style={styles.selectPrice}>₹{p.price}</Text>
                    <Pressable onPress={() => removePart(p.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </Pressable>
                  </View>
                ))
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.summaryGreen}>
                <Text style={styles.summaryLabel}>BILL SUMMARY</Text>
                <Text style={styles.summaryAmount}>₹{billTotal}</Text>
                <Text style={styles.summaryParts}>
                  Visit ₹{VISIT_FEE} · Services ₹{serviceTotal - VISIT_FEE} · Parts ₹{partsTotal}
                </Text>
              </View>
              <Pressable
                style={[styles.approveBtn, selectedServices.length === 0 && styles.btnDisabled]}
                disabled={selectedServices.length === 0}
                onPress={openChecklist}
              >
                <MaterialIcons name="task-alt" size={18} color={colors.white} />
                <Text style={styles.approveText}>Work done · Continue</Text>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal visible={addServiceOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalScrim}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={{ flex: 1 }} onPress={() => { Keyboard.dismiss(); setAddServiceOpen(false); }} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHead}>
              <Text style={styles.sectionTitle}>Add custom service</Text>
              <Pressable onPress={() => setAddServiceOpen(false)}>
                <Ionicons name="close" size={22} color={colors.black} />
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Service name"
              placeholderTextColor={colors.slate400}
              value={customService.name}
              onChangeText={(name) => setCustomService((c) => ({ ...c, name }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Quote price ₹"
              placeholderTextColor={colors.slate400}
              keyboardType="number-pad"
              value={customService.price}
              onChangeText={(price) => setCustomService((c) => ({ ...c, price }))}
            />
            <Pressable style={styles.approveBtn} onPress={addCustomService}>
              <Text style={styles.approveText}>Add service</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={partsOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalScrim}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={{ flex: 1 }} onPress={() => { Keyboard.dismiss(); setPartsOpen(false); }} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHead}>
              <Text style={styles.sectionTitle}>Add part</Text>
              <Pressable onPress={() => setPartsOpen(false)}>
                <Ionicons name="close" size={22} color={colors.black} />
              </Pressable>
            </View>
            <Text style={styles.sectionHint}>Part name, quantity, and amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Part name"
              placeholderTextColor={colors.slate400}
              value={customPart.name}
              onChangeText={(name) => setCustomPart((c) => ({ ...c, name }))}
            />
            <View style={styles.dualRow}>
              <TextInput
                style={[styles.input, styles.dualInput]}
                placeholder="Quantity"
                placeholderTextColor={colors.slate400}
                keyboardType="number-pad"
                value={customPart.qty}
                onChangeText={(qty) =>
                  setCustomPart((c) => ({ ...c, qty: qty.replace(/\D/g, '') }))
                }
              />
              <TextInput
                style={[styles.input, styles.dualInput]}
                placeholder="Amount ₹"
                placeholderTextColor={colors.slate400}
                keyboardType="number-pad"
                value={customPart.amount}
                onChangeText={(amount) =>
                  setCustomPart((c) => ({ ...c, amount: amount.replace(/\D/g, '') }))
                }
              />
            </View>
            <Pressable style={styles.approveBtn} onPress={addCustomPart}>
              <Text style={styles.approveText}>Add part</Text>
            </Pressable>
            <Pressable style={styles.doneParts} onPress={() => setPartsOpen(false)}>
              <Text style={styles.donePartsText}>Done</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={checklistOpen} animationType="fade" transparent>
        <View style={styles.modalScrim}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHead}>
              <Text style={styles.sectionTitle}>Resolution checklist</Text>
              <Pressable style={styles.helpBtn} onPress={() => setHelpOpen(true)}>
                <Ionicons name="help-circle" size={22} color={colors.help} />
              </Pressable>
            </View>
            <Text style={styles.sectionHint}>Confirm every point before payment</Text>
            <ScrollView style={{ maxHeight: 360, marginTop: 8 }}>
              {checklistItems.map((label, index) => {
                const on = !!checked[index];
                return (
                  <Pressable
                    key={label}
                    style={[styles.checkRow, on && styles.checkRowOn]}
                    onPress={() => setChecked((c) => ({ ...c, [index]: !c[index] }))}
                  >
                    <Ionicons
                      name={on ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={on ? colors.black : colors.slate400}
                    />
                    <Text style={styles.checkLabel}>{label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              style={[styles.approveBtn, !allChecked && styles.btnDisabled]}
              disabled={!allChecked}
              onPress={finishChecklist}
            >
              <Text style={styles.approveText}>Done · Continue to payment</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <CaptainHelpModal
        visible={helpOpen}
        onClose={() => setHelpOpen(false)}
        steps={[
          '1. Select services after inspection (visit fee ₹99 is always included).',
          '2. Optionally add parts with name, quantity, and amount.',
          '3. Press Work done · Continue for checklist, then payment.',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    marginLeft: 8,
  },
  helpBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  statusBar: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  statusText: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.successDark,
  },
  idPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  workId: { fontFamily: fontFamilies.mono, fontSize: 11, color: colors.white },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 14,
    gap: 10,
    ...shadows.card,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customer: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 20,
    color: colors.black,
  },
  iconActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnChat: { backgroundColor: colors.brand },
  jobTitle: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: colors.slate600,
  },
  sectionTitle: {
    ...type.sectionTitle,
  },
  sectionHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtnText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 12,
    color: colors.white,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.slate50,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  selectRowOn: {
    borderColor: colors.brand,
    backgroundColor: colors.surfaceContainer,
  },
  selectName: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  selectHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    color: colors.slate500,
    marginTop: 2,
  },
  selectPrice: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: colors.slate600,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.slate300,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.brand },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  toggleKnobOn: { alignSelf: 'flex-end' },
  addPartsBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addPartsText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.brand,
  },
  emptyParts: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate500,
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 12,
  },
  approveBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.45 },
  approveText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.white,
  },
  pendingBox: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 12,
  },
  pendingText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: colors.primary,
    textAlign: 'center',
  },
  approvedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.successBg,
    borderRadius: 12,
    padding: 12,
  },
  approvedText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.successDark,
  },
  summaryGreen: {
    backgroundColor: colors.successBg,
    borderRadius: 14,
    padding: 14,
    gap: 2,
  },
  summaryLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.successDark,
  },
  summaryAmount: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 28,
    color: colors.successDark,
  },
  summaryParts: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.successDark,
  },
  slideHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slideHint: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.brand,
  },
  slideTrack: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slideFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(5,150,105,0.2)',
    borderRadius: 28,
  },
  slideLabel: {
    textAlign: 'center',
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 0.6,
  },
  slideThumb: {
    position: 'absolute',
    left: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 10,
    paddingBottom: 28,
  },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  dualRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dualInput: {
    flex: 1,
  },
  doneParts: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donePartsText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.slate50,
    marginBottom: 8,
  },
  checkRowOn: { backgroundColor: colors.surfaceContainer },
  checkLabel: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: colors.black,
  },
  helpLine: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate700,
    lineHeight: 20,
  },
});
