import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandHeader } from '../components/BrandHeader';
import {
  ensureApplicationId,
  setOnboardingMeta,
  type TradeId,
} from '../state/onboardingMeta';
import { colors, fontFamilies } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectExpertise'>;

const APPLIANCE_OPTIONS = [
  { id: 'washing_machine', label: 'Washing Machine', icon: 'local-laundry-service' as const },
  { id: 'refrigerator', label: 'Refrigerator', icon: 'kitchen' as const },
  { id: 'ac_technician', label: 'AC Technician', icon: 'ac-unit' as const },
  { id: 'chimney_repair', label: 'Chimney Repair', icon: 'air' as const },
  { id: 'water_purifier', label: 'Water Purifier', icon: 'water-drop' as const },
];

const EXPERIENCE_OPTIONS = ['< 1 Year', '1 - 3 Years', '3 - 5 Years', '5+ Years'] as const;

export function SelectExpertiseScreen({ navigation, route }: Props) {
  const { gender } = route.params;
  const [trades, setTrades] = useState<Set<TradeId>>(new Set());
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [tradeExperience, setTradeExperience] = useState<string | null>(null);
  const [maidExperience, setMaidExperience] = useState<string | null>(null);

  const showMaleTrades = gender === 'Male' || gender === 'Other';
  const showMaid = gender === 'Female' || gender === 'Other';
  const hasSkillTrade =
    trades.has('electrician') || trades.has('plumber') || trades.has('appliances');

  const canContinue = useMemo(() => {
    if (trades.size === 0) return false;
    if (trades.has('appliances') && subs.size === 0) return false;
    if (hasSkillTrade && !tradeExperience) return false;
    if (trades.has('maid') && !maidExperience) return false;
    return true;
  }, [trades, subs, hasSkillTrade, tradeExperience, maidExperience]);

  const toggleTrade = (id: TradeId) => {
    setTrades((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (id === 'appliances') setSubs(new Set());
        if (id === 'maid') setMaidExperience(null);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSub = (id: string) => {
    setSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setTrades((prev) => {
      if (prev.has('appliances')) return prev;
      const next = new Set(prev);
      next.add('appliances');
      return next;
    });
  };

  const onNext = () => {
    const experience = trades.has('maid') && !hasSkillTrade
      ? maidExperience
      : tradeExperience ?? maidExperience;
    ensureApplicationId();
    setOnboardingMeta({
      trades: Array.from(trades),
      experience,
    });
    navigation.navigate('WaitingVerification');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.headerBar}>
        <BrandHeader
          centered
          onBack={() => navigation.goBack()}
          showLanguage={false}
          showHelp={false}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.stepPill}>
          <MaterialIcons name="verified" size={14} color={colors.brand} />
          <Text style={styles.stepText}>Step 1 of 3: Skill Verification</Text>
        </View>
        <Text style={styles.title}>Select Your Expertise</Text>
        <Text style={styles.subtitle}>
          {gender === 'Female'
            ? 'Maid Service is available for your selected profile.'
            : 'Choose your professional field(s).'}
        </Text>

        {showMaleTrades ? (
          <>
            <TradeCard
              selected={trades.has('electrician')}
              title="Electrician"
              subtitle="Wiring, switches, fuse boxes & lighting"
              emoji="⚡"
              onPress={() => toggleTrade('electrician')}
            />

            <TradeCard
              selected={trades.has('plumber')}
              title="Plumbing"
              subtitle="Pipes, taps, drainage & fittings"
              emoji="🔧"
              onPress={() => toggleTrade('plumber')}
            />

            <View
              style={[
                styles.tradeCard,
                trades.has('appliances') && styles.tradeCardOn,
              ]}
            >
              <Pressable
                style={styles.tradeMain}
                onPress={() => toggleTrade('appliances')}
              >
                <View style={styles.tradeLeft}>
                  <View style={styles.iconBox}>
                    <Text style={styles.emoji}>🔌</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tradeTitle}>
                      Electronic Appliances Repair
                    </Text>
                    <Text style={styles.tradeSub}>
                      Home & kitchen electrical equipment
                    </Text>
                  </View>
                </View>
                <CheckBox on={trades.has('appliances')} />
              </Pressable>

              {trades.has('appliances') ? (
                <View style={styles.drawer}>
                  <View style={styles.drawerHeader}>
                    <Text style={styles.drawerLabel}>
                      SELECT APPLIANCE SUB-SPECIALTIES
                    </Text>
                  </View>
                  <View style={styles.chipGrid}>
                    {APPLIANCE_OPTIONS.map((option) => {
                      const on = subs.has(option.id);
                      return (
                        <Pressable
                          key={option.id}
                          style={[styles.subChip, on && styles.subChipOn]}
                          onPress={() => toggleSub(option.id)}
                        >
                          <MaterialIcons
                            name={option.icon}
                            size={16}
                            color={on ? colors.brand : colors.slate500}
                          />
                          <Text
                            style={[
                              styles.subChipText,
                              on && styles.subChipTextOn,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>

            {hasSkillTrade ? (
              <View style={styles.experienceCard}>
                <Text style={styles.drawerLabel}>YEARS OF EXPERIENCE</Text>
                <View style={styles.expGrid}>
                  {EXPERIENCE_OPTIONS.map((option) => {
                    const on = tradeExperience === option;
                    return (
                      <Pressable
                        key={option}
                        style={[styles.expChip, on && styles.expChipOn]}
                        onPress={() => setTradeExperience(option)}
                      >
                        <Text style={[styles.expText, on && styles.expTextOn]}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        {showMaid ? (
          <View style={[styles.tradeCard, trades.has('maid') && styles.tradeCardOn]}>
            <Pressable style={styles.tradeMain} onPress={() => toggleTrade('maid')}>
              <View style={styles.tradeLeft}>
                <View style={styles.iconBox}>
                  <Text style={styles.emoji}>🧹</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tradeTitle}>Maid Service</Text>
                  <Text style={styles.tradeSub}>
                    Home cleaning & household support
                  </Text>
                </View>
              </View>
              <CheckBox on={trades.has('maid')} />
            </Pressable>

            {trades.has('maid') ? (
              <View style={styles.drawer}>
                <View style={styles.drawerHeader}>
                  <Text style={styles.drawerLabel}>YEARS OF EXPERIENCE</Text>
                </View>
                <View style={styles.expGrid}>
                  {EXPERIENCE_OPTIONS.map((option) => {
                    const on = maidExperience === option;
                    return (
                      <Pressable
                        key={option}
                        style={[styles.expChip, on && styles.expChipOn]}
                        onPress={() => setMaidExperience(option)}
                      >
                        <Text style={[styles.expText, on && styles.expTextOn]}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.continueBtn, !canContinue && styles.continueDisabled]}
          disabled={!canContinue}
          onPress={onNext}
        >
          <Text style={styles.continueText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function TradeCard({
  selected,
  title,
  subtitle,
  emoji,
  onPress,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  emoji: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tradeCard, selected && styles.tradeCardOn]}
      onPress={onPress}
    >
      <View style={styles.tradeMain}>
        <View style={styles.tradeLeft}>
          <View style={styles.iconBox}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tradeTitle}>{title}</Text>
            <Text style={styles.tradeSub}>{subtitle}</Text>
          </View>
        </View>
        <CheckBox on={selected} />
      </View>
    </Pressable>
  );
}

function CheckBox({ on }: { on: boolean }) {
  return (
    <View style={[styles.check, on && styles.checkOn]}>
      {on ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 14,
  },
  stepPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: 'rgba(58,134,255,0.35)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stepText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: colors.brand,
  },
  title: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 24,
    color: colors.slate900,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    color: colors.slate500,
    marginTop: -6,
    marginBottom: 4,
  },
  tradeCard: {
    borderWidth: 2,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  tradeCardOn: {
    borderColor: colors.brand,
    backgroundColor: 'rgba(239, 246, 255, 0.5)',
  },
  tradeMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    paddingRight: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  tradeTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.slate900,
  },
  tradeSub: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.slate300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  drawer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226,232,240,0.9)',
  },
  drawerHeader: {
    marginBottom: 10,
  },
  drawerLabel: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.slate500,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  experienceCard: {
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
  },
  subChipOn: {
    borderColor: colors.brand,
    backgroundColor: '#eff6ff',
  },
  subChipText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: colors.slate700,
    flexShrink: 1,
  },
  subChipTextOn: { color: colors.brand },
  expGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expChip: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  expChipOn: {
    borderColor: colors.brand,
    backgroundColor: '#eff6ff',
  },
  expText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: colors.slate700,
  },
  expTextOn: { color: colors.brand },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
  },
  continueBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueDisabled: { opacity: 0.45 },
  continueText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.white,
  },
});
