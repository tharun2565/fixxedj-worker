import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  CommonActions,
  type CompositeScreenProps,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaptainSideDrawer } from '../components/CaptainSideDrawer';
import { NotificationsDrawer } from '../components/NotificationsDrawer';
import { getFaceDraft } from '../state/faceOnboardingDraft';
import { useDuty } from '../state/dutyContext';
import { getOnboardingMeta } from '../state/onboardingMeta';
import { colors, fontFamilies, shadows } from '../theme';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BENGALURU: Region = {
  latitude: 12.9352,
  longitude: 77.6245,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const TRADE_LABEL: Record<string, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  appliances: 'Appliances',
  maid: 'Maid Service',
};

const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

export function HomeScreen({ navigation }: Props) {
  const draft = getFaceDraft();
  const meta = getOnboardingMeta();
  const { onDuty, setOnDuty, completedJobs, jobInProgress } = useDuty();
  const mapRef = useRef<MapView>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [region, setRegion] = useState<Region>(BENGALURU);

  const name = draft.fullName.trim() || 'Captain';
  const service = useMemo(
    () => meta.trades.map((t) => TRADE_LABEL[t] ?? t).join(' · ') || 'Captain',
    [meta.trades],
  );

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return completedJobs.filter(
      (j) => new Date(j.completedAt).toDateString() === today,
    ).length;
  }, [completedJobs]);

  const monthEarn = useMemo(() => {
    const now = new Date();
    return completedJobs
      .filter((j) => {
        const d = new Date(j.completedAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, j) => s + j.amount, 0);
  }, [completedJobs]);

  const recenter = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        mapRef.current?.animateToRegion(BENGALURU, 500);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next: Region = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
      setRegion(next);
      mapRef.current?.animateToRegion(next, 500);
    } catch {
      mapRef.current?.animateToRegion(region, 400);
    }
  }, [region]);

  useEffect(() => {
    recenter();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.topSafe}>
        <View style={styles.topBar}>
          <Pressable style={styles.profileHit} onPress={() => setDrawerOpen(true)}>
            {draft.photoUri ? (
              <Image source={{ uri: draft.photoUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={20} color={colors.brand} />
              </View>
            )}
            <View style={styles.nameBlock}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.service} numberOfLines={1}>
                {service}
              </Text>
            </View>
          </Pressable>

          <View style={styles.dutyCenter} pointerEvents="box-none">
            <View style={styles.dutyToggle}>
              <Pressable
                style={[styles.dutyBtn, onDuty && styles.dutyBtnOn]}
                onPress={() => setOnDuty(true)}
              >
                <Text style={[styles.dutyText, onDuty && styles.dutyTextOn]}>On</Text>
              </Pressable>
              <Pressable
                style={[styles.dutyBtn, !onDuty && styles.dutyBtnOff]}
                onPress={() => setOnDuty(false)}
              >
                <Text style={[styles.dutyText, !onDuty && styles.dutyTextOff]}>Off</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.bellBtn} onPress={() => setNotifOpen(true)}>
            <Ionicons name="notifications-outline" size={22} color={colors.white} />
            {(completedJobs.length > 0 || jobInProgress) && <View style={styles.bellDot} />}
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={MAP_PROVIDER}
          initialRegion={BENGALURU}
          showsUserLocation
          showsMyLocationButton={false}
          onRegionChangeComplete={setRegion}
        />

        <View style={styles.mapBadge}>
          <View style={[styles.liveDot, !onDuty && styles.liveDotOff]} />
          <Text style={styles.mapBadgeText}>
            {jobInProgress
              ? 'Job in progress'
              : onDuty
                ? 'On duty · Live map'
                : 'Off duty'}
          </Text>
        </View>

        <Pressable style={styles.recenterBtn} onPress={recenter}>
          <Ionicons name="locate" size={22} color={colors.black} />
        </Pressable>

        <View style={styles.metricStrip}>
          <View style={[styles.metricBox, styles.metricPrimary]}>
            <Text style={styles.metricLabelLight}>TODAY</Text>
            <Text style={styles.metricValueLight}>{todayCount}</Text>
            <Text style={styles.metricMetaLight}>bookings</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>EARNINGS</Text>
            <Text style={styles.metricValue}>₹{monthEarn.toLocaleString('en-IN')}</Text>
            <Text style={styles.metricMeta}>this month</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>ALL</Text>
            <Text style={styles.metricValue}>{completedJobs.length}</Text>
            <Text style={styles.metricMeta}>jobs done</Text>
          </View>
        </View>
      </View>

      <CaptainSideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={() => {
          setDrawerOpen(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            }),
          );
        }}
      />

      <NotificationsDrawer visible={notifOpen} onClose={() => setNotifOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  topSafe: { backgroundColor: colors.brand },
  topBar: {
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileHit: {
    width: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarFallback: {
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 14,
    color: colors.white,
  },
  service: {
    marginTop: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  dutyCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dutyToggle: {
    flexDirection: 'row',
    backgroundColor: colors.black,
    borderRadius: 999,
    padding: 3,
  },
  dutyBtn: {
    minWidth: 48,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  dutyBtnOn: { backgroundColor: colors.white },
  dutyBtnOff: { backgroundColor: '#333333' },
  dutyText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
  dutyTextOn: { color: colors.brand },
  dutyTextOff: { color: colors.white },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    zIndex: 2,
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: colors.brand,
  },
  mapWrap: { flex: 1, backgroundColor: '#DCE9FF' },
  mapBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveDotOff: { backgroundColor: colors.slate400 },
  mapBadgeText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.black,
  },
  recenterBtn: {
    position: 'absolute',
    bottom: 92,
    right: 14,
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  metricStrip: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    ...shadows.card,
  },
  metricPrimary: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  metricLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: 9,
    color: colors.slate500,
  },
  metricValue: {
    marginTop: 2,
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 15,
    color: colors.black,
  },
  metricMeta: {
    marginTop: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    color: colors.slate500,
  },
  metricLabelLight: {
    fontFamily: fontFamilies.mono,
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
  },
  metricValueLight: {
    marginTop: 2,
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.white,
  },
  metricMetaLight: {
    marginTop: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
  },
});
