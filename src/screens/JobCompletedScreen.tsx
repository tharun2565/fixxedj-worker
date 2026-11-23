import { useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDuty } from '../state/dutyContext';
import { colors, fontFamilies, shadows } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'JobCompleted'>;

const TAGS = [
  'Polite & co-operative',
  'Quick payment',
  'Clear instructions',
  'Safe work environment',
];

const COMMISSION_RATE = 0.22;

export function JobCompletedScreen({ navigation, route }: Props) {
  const { job, lines, total, paymentMethod } = route.params;
  const { finishActiveJob } = useDuty();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const serviceTotal = lines
    .filter((l) => l.kind === 'service')
    .reduce((s, l) => s + l.price, 0);
  const partsTotal = lines
    .filter((l) => l.kind === 'part')
    .reduce((s, l) => s + l.price, 0);
  const partsCount = lines.filter((l) => l.kind === 'part').length;
  const commission = Math.round(serviceTotal * COMMISSION_RATE);
  const earn = serviceTotal - commission + partsTotal;

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const goNext = () => {
    finishActiveJob(job);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.fulfilled}>
            <MaterialIcons name="verified" size={16} color={colors.success} />
            <Text style={styles.fulfilledText}>JOB DONE</Text>
          </View>
          <Pressable style={styles.close} onPress={goNext}>
            <Ionicons name="close" size={20} color={colors.slate600} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color={colors.white} />
          </View>
          <Text style={styles.heroTitle}>Job done</Text>
          <Text style={styles.heroSub}>
            Payment received via {paymentMethod.toUpperCase()} · {job.title}
          </Text>
          <View style={styles.idPill}>
            <Text style={styles.workId}>WORK ID #{job.id}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.earnHead}>
            <View>
              <Text style={styles.earnLabel}>NET EARNINGS CREDITED</Text>
              <Text style={styles.earnAmount}>+ ₹{earn}</Text>
              <Text style={styles.instant}>INSTANT · {paymentMethod.toUpperCase()}</Text>
            </View>
            <View style={styles.walletIcon}>
              <MaterialIcons name="account-balance-wallet" size={26} color={colors.success} />
            </View>
          </View>

          <View style={styles.ledger}>
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Service charges</Text>
              <Text style={styles.ledgerVal}>₹{serviceTotal}</Text>
            </View>
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Parts ({partsCount})</Text>
              <Text style={styles.ledgerVal}>₹{partsTotal}</Text>
            </View>
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Commission cut (22% services)</Text>
              <Text style={styles.ledgerVal}>- ₹{commission}</Text>
            </View>
            <View style={[styles.ledgerRow, styles.ledgerTotal]}>
              <Text style={styles.ledgerTotalLabel}>You earn</Text>
              <Text style={styles.ledgerTotalVal}>₹{earn}</Text>
            </View>
            <Text style={styles.collected}>Customer paid ₹{total}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rateHead}>
            <View>
              <Text style={styles.customer}>{job.customer}</Text>
              <Text style={styles.area}>{job.area}</Text>
            </View>
            <View style={styles.customerPill}>
              <Text style={styles.customerPillText}>CUSTOMER</Text>
            </View>
          </View>
          <Text style={styles.rateAsk}>Rate this customer</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)}>
                <MaterialIcons
                  name={n <= rating ? 'star' : 'star-border'}
                  size={36}
                  color={n <= rating ? '#F59E0B' : colors.slate300}
                />
              </Pressable>
            ))}
          </View>
          <Text style={styles.tagsLabel}>QUICK HIGHLIGHTS</Text>
          <View style={styles.tags}>
            {TAGS.map((tag) => {
              const on = tags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  style={[styles.tag, on && styles.tagOn]}
                  onPress={() => toggleTag(tag)}
                >
                  {on ? (
                    <Ionicons name="checkmark" size={14} color={colors.success} />
                  ) : null}
                  <Text style={[styles.tagText, on && styles.tagTextOn]}>{tag}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.tagsLabel}>CAPTAIN NOTE (OPTIONAL)</Text>
          <TextInput
            style={styles.note}
            placeholder="e.g. Gate code verified…"
            placeholderTextColor={colors.slate400}
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View>

        <Pressable style={styles.doneBtn} onPress={goNext}>
          <MaterialIcons name="home" size={20} color={colors.white} />
          <Text style={styles.doneText}>Done · Go to home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fulfilled: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fulfilledText: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.successDark,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    ...shadows.card,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 20,
    color: colors.black,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate600,
    textAlign: 'center',
  },
  idPill: {
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  workId: { fontFamily: fontFamilies.mono, fontSize: 11, color: colors.white },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
    gap: 12,
    ...shadows.card,
  },
  earnHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.successBg,
    borderRadius: 14,
    padding: 14,
  },
  earnLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.successDark,
  },
  earnAmount: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 28,
    color: colors.successDark,
  },
  instant: {
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.success,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledger: { gap: 8 },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ledgerLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate600,
  },
  ledgerVal: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  ledgerTotal: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
  },
  ledgerTotalLabel: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.black,
  },
  ledgerTotalVal: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 16,
    color: colors.black,
  },
  collected: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  rateHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customer: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.black,
  },
  area: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  customerPill: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  customerPillText: {
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.slate600,
  },
  rateAsk: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.black,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  tagsLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.slate500,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.slate50,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tagOn: { backgroundColor: colors.surfaceContainer },
  tagText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: colors.slate600,
  },
  tagTextOn: { color: colors.black, fontFamily: fontFamilies.sansBold },
  note: {
    minHeight: 72,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 12,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.black,
    textAlignVertical: 'top',
  },
  doneBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.brandGlow,
  },
  doneText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
