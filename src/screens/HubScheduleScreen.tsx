import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getOnboardingMeta, setOnboardingMeta } from '../state/onboardingMeta';
import { colors, fontFamilies } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'HubSchedule'>;

const HUBS = [
  {
    id: 'hub1',
    label: 'Fixxedj Hub 1',
    place: 'Brookfield Tech Hub',
    detail: 'ITPL Main Rd • 9:00 AM – 7:00 PM',
    distance: '2.4 km',
  },
  {
    id: 'hub2',
    label: 'Fixxedj Hub 2',
    place: 'Vidhyaranya Pura Hub',
    detail: 'Outer Ring Rd • 9:00 AM – 7:00 PM',
    distance: '5.8 km',
  },
  {
    id: 'hub3',
    label: 'Fixxedj Hub 3',
    place: 'Banashankari Hub',
    detail: '100ft Ring Rd • 9:00 AM – 7:00 PM',
    distance: '8.1 km',
  },
] as const;

const SLOTS = [
  'Today • 11:00 AM',
  'Today • 3:00 PM',
  'Tomorrow • 10:00 AM',
  'Tomorrow • 4:00 PM',
] as const;

export function HubScheduleScreen({ navigation }: Props) {
  const { applicationId } = getOnboardingMeta();
  const [hubId, setHubId] = useState<string>(HUBS[0].id);
  const [slot, setSlot] = useState<string | null>(null);

  const selectedHub = useMemo(
    () => HUBS.find((hub) => hub.id === hubId) ?? HUBS[0],
    [hubId],
  );

  const canBook = Boolean(hubId && slot);

  const bookSlot = () => {
    if (!canBook || !slot) return;
    setOnboardingMeta({
      hubId: selectedHub.id,
      hubLabel: `${selectedHub.label} · ${selectedHub.place}`,
      slotLabel: slot,
    });
    navigation.navigate('CaptainVerified');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.slate700} />
        </Pressable>
        <Text style={styles.brand}>
          Fixxedj <Text style={styles.brandAccent}>Captain</Text>
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <MaterialIcons name="verified-user" size={14} color={colors.brand} />
          <Text style={styles.badgeText}>In-person verification</Text>
        </View>
        <Text style={styles.title}>Schedule Hub Verification</Text>

        <View style={styles.idCard}>
          <View>
            <Text style={styles.idLabel}>APPLICATION ID</Text>
            <Text style={styles.idValue}>{applicationId}</Text>
          </View>
          <View style={styles.pendingPill}>
            <MaterialIcons name="pending-actions" size={14} color={colors.brand} />
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SELECT FIXXEDJ HUB</Text>
        <View style={styles.hubList}>
          {HUBS.map((hub, index) => {
            const on = hub.id === hubId;
            return (
              <Pressable
                key={hub.id}
                style={[styles.hubCard, on && styles.hubCardOn]}
                onPress={() => setHubId(hub.id)}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.hubTitleRow}>
                    <Text style={styles.hubLabel}>{hub.label}</Text>
                    {index === 0 ? (
                      <View style={styles.nearest}>
                        <Text style={styles.nearestText}>Nearest</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.hubPlace}>{hub.place}</Text>
                  <Text style={styles.hubDetail}>{hub.detail}</Text>
                  <Text style={styles.hubDistance}>{hub.distance}</Text>
                </View>
                <Ionicons
                  name={on ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={on ? colors.brand : colors.slate300}
                />
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>LOOK YOUR SLOTS</Text>
        <View style={styles.slotGrid}>
          {SLOTS.map((option) => {
            const on = slot === option;
            return (
              <Pressable
                key={option}
                style={[styles.slotChip, on && styles.slotChipOn]}
                onPress={() => setSlot(option)}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={on ? colors.brand : colors.slate500}
                />
                <Text style={[styles.slotText, on && styles.slotTextOn]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.bookBtn, !canBook && styles.bookDisabled]}
          disabled={!canBook}
          onPress={bookSlot}
        >
          <MaterialIcons name="event-available" size={18} color={colors.white} />
          <Text style={styles.bookText}>Book slot</Text>
        </Pressable>
        <Pressable style={styles.directionsBtn}>
          <MaterialIcons name="directions" size={18} color={colors.brand} />
          <Text style={styles.directionsText}>Get directions</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 17,
    color: colors.slate900,
  },
  brandAccent: { color: colors.brand },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.brand,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 24,
    color: colors.slate900,
  },
  idCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.slate500,
    letterSpacing: 0.5,
  },
  idValue: {
    marginTop: 4,
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.slate900,
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.brand,
  },
  sectionLabel: {
    marginTop: 8,
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.brand,
    letterSpacing: 0.6,
  },
  hubList: { gap: 10 },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 14,
  },
  hubCardOn: {
    borderColor: colors.brand,
    borderWidth: 2,
    backgroundColor: 'rgba(239,246,255,0.7)',
  },
  hubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  hubLabel: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.slate900,
  },
  nearest: {
    backgroundColor: colors.brand,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nearestText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 10,
    color: colors.white,
  },
  hubPlace: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: colors.slate700,
  },
  hubDetail: {
    marginTop: 2,
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  hubDistance: {
    marginTop: 4,
    fontFamily: fontFamilies.sansBold,
    fontSize: 12,
    color: colors.brand,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  slotChipOn: {
    borderColor: colors.brand,
    backgroundColor: '#eff6ff',
  },
  slotText: {
    flexShrink: 1,
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: colors.slate700,
  },
  slotTextOn: { color: colors.brand },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    backgroundColor: colors.white,
    padding: 16,
    gap: 10,
  },
  bookBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookDisabled: { opacity: 0.45 },
  bookText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  directionsBtn: {
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
  directionsText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.brand,
  },
});
