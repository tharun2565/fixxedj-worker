import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useDuty, type CompletedJobNote } from '../state/dutyContext';
import { colors, fontFamilies, shadows } from '../theme';

type MonthBucket = {
  key: string;
  label: string;
  jobs: CompletedJobNote[];
  totalAmount: number;
};

type DayBucket = {
  key: string;
  label: string;
  jobs: CompletedJobNote[];
  totalAmount: number;
};

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Today';
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function BookingsScreen() {
  const { completedJobs, jobInProgress } = useDuty();
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const months = useMemo(() => {
    const map = new Map<string, MonthBucket>();
    for (const job of completedJobs) {
      const key = monthKey(job.completedAt);
      const existing = map.get(key);
      if (existing) {
        existing.jobs.push(job);
        existing.totalAmount += job.amount;
      } else {
        map.set(key, {
          key,
          label: monthLabel(job.completedAt),
          jobs: [job],
          totalAmount: job.amount,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [completedJobs]);

  const activeMonthKey = expandedMonth ?? months[0]?.key ?? null;

  const daysForActive = useMemo(() => {
    const month = months.find((m) => m.key === activeMonthKey);
    if (!month) return [] as DayBucket[];
    const map = new Map<string, DayBucket>();
    for (const job of month.jobs) {
      const key = dayKey(job.completedAt);
      const existing = map.get(key);
      if (existing) {
        existing.jobs.push(job);
        existing.totalAmount += job.amount;
      } else {
        map.set(key, {
          key,
          label: dayLabel(job.completedAt),
          jobs: [job],
          totalAmount: job.amount,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [months, activeMonthKey]);

  const thisMonth = months[0];
  const monthCount = thisMonth?.jobs.length ?? 0;
  const monthEarn = thisMonth?.totalAmount ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.sub}>History · like your payout ledger</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <View style={[styles.statCard, styles.statPrimary]}>
            <Text style={styles.statLabel}>THIS MONTH</Text>
            <Text style={styles.statValue}>{monthCount}</Text>
            <Text style={styles.statMeta}>bookings done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabelDark}>COLLECTED</Text>
            <Text style={styles.statValueDark}>₹{monthEarn.toLocaleString('en-IN')}</Text>
            <Text style={styles.statMetaDark}>bill total</Text>
          </View>
        </View>

        {jobInProgress ? (
          <View style={[styles.liveCard]}>
            <MaterialIcons name="bolt" size={18} color={colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={styles.liveTitle}>Live booking in progress</Text>
              <Text style={styles.liveSub}>Finish End job to log it into history</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Month wise</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthChips}
        >
          {months.map((m) => {
            const on = m.key === activeMonthKey;
            return (
              <Pressable
                key={m.key}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => setExpandedMonth(m.key)}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{m.label}</Text>
                <Text style={[styles.chipCount, on && styles.chipTextOn]}>
                  {m.jobs.length}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {daysForActive.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={28} color={colors.brand} />
            </View>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.copy}>
              Completed jobs will group here by month and day.
            </Text>
          </View>
        ) : (
          daysForActive.map((day) => (
            <View key={day.key} style={styles.dayBlock}>
              <View style={styles.dayHead}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Text style={styles.dayTotal}>
                  {day.jobs.length} · ₹{day.totalAmount.toLocaleString('en-IN')}
                </Text>
              </View>
              {day.jobs.map((j) => (
                <View key={`${j.id}-${j.completedAt}`} style={styles.txnCard}>
                  <View style={styles.txnIcon}>
                    <Ionicons name="checkmark" size={16} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txnTitle} numberOfLines={1}>
                      {j.title}
                    </Text>
                    <Text style={styles.txnMeta}>
                      {j.customer} · {j.category} · {j.at}
                    </Text>
                  </View>
                  <View style={styles.txnRight}>
                    <Text style={styles.txnAmount}>₹{j.amount}</Text>
                    <Text style={styles.txnId}>#{j.id}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    backgroundColor: colors.white,
  },
  title: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 22,
    color: colors.black,
  },
  sub: {
    marginTop: 2,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate500,
  },
  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  summaryRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 14,
    ...shadows.card,
  },
  statPrimary: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  statLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  statValue: {
    marginTop: 4,
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 28,
    color: colors.white,
  },
  statMeta: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  statLabelDark: {
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.slate500,
  },
  statValueDark: {
    marginTop: 4,
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 22,
    color: colors.black,
  },
  statMetaDark: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  liveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.brand,
    padding: 12,
  },
  liveTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  liveSub: {
    marginTop: 2,
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate600,
  },
  sectionTitle: {
    marginTop: 4,
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.black,
  },
  monthChips: { gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  chipText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 12,
    color: colors.slate700,
  },
  chipCount: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.brand,
  },
  chipTextOn: { color: colors.white },
  dayBlock: { gap: 8 },
  dayHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  dayLabel: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.slate700,
  },
  dayTotal: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.slate500,
  },
  txnCard: {
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
  txnIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  txnMeta: {
    marginTop: 2,
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    color: colors.slate500,
  },
  txnRight: { alignItems: 'flex-end' },
  txnAmount: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 14,
    color: colors.black,
  },
  txnId: {
    marginTop: 2,
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.slate400,
  },
  empty: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.black,
  },
  copy: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    color: colors.slate500,
    textAlign: 'center',
    lineHeight: 20,
  },
});
