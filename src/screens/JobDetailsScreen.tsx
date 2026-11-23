import { useEffect, useRef, useState, type ElementRef } from 'react';
import {
  BackHandler,
  Image,
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
import { CaptainHelpModal } from '../components/CaptainHelpModal';
import { colors, fontFamilies, shadows, type } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetails'>;
type OtpRef = ElementRef<typeof TextInput>;

export function JobDetailsScreen({ navigation, route }: Props) {
  const { job } = route.params;
  const [digits, setDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const inputsRef = useRef<Array<OtpRef | null>>([]);
  const photos =
    job.photos && job.photos.length > 0
      ? job.photos
      : [
          'https://picsum.photos/seed/fixxedj-issue-a/400/300',
          'https://picsum.photos/seed/fixxedj-issue-b/400/300',
        ];
  const issue = job.issue ?? 'Customer reported an issue that needs inspection on site.';

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const updateDigit = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setOtpError(false);
    if (cleaned && index < 3) inputsRef.current[index + 1]?.focus();
  };

  const verify = () => {
    if (digits.some((d) => !d)) {
      setOtpError(true);
      inputsRef.current[0]?.focus();
      return;
    }
    navigation.replace('ActiveJob', { job });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.lockPill}>
          <Ionicons name="lock-closed" size={12} color={colors.white} />
          <Text style={styles.lockText}>IN JOB</Text>
        </View>
        <Text style={styles.headerTitle}>Booking detail</Text>
        <Pressable style={styles.helpBtn} onPress={() => setHelpOpen(true)}>
          <Ionicons name="help-circle" size={24} color={colors.help} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.metaRow}>
          <View style={styles.idPill}>
            <MaterialIcons name="tag" size={12} color={colors.white} />
            <Text style={styles.workId}>WORK ID  #{job.id}</Text>
          </View>
          <View style={styles.enRoute}>
            <View style={styles.enRouteDot} />
            <Text style={styles.enRouteText}>EN ROUTE</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.customerRow}>
            <View style={styles.customerLeft}>
              <Text style={styles.customer}>{job.customer}</Text>
              <View style={styles.rating}>
                <MaterialIcons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>
            <View style={styles.iconActions}>
              <Pressable style={styles.iconBtn} hitSlop={6}>
                <Ionicons name="call" size={16} color={colors.white} />
              </Pressable>
              <Pressable style={[styles.iconBtn, styles.iconBtnChat]} hitSlop={6}>
                <Ionicons name="chatbubble-ellipses" size={16} color={colors.white} />
              </Pressable>
            </View>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color={colors.brand} />
            <Text style={styles.address}>
              {job.address}, {job.area}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{job.title}</Text>
          <Text style={styles.cardSub}>
            {job.category} · {job.distance} · {job.eta}
          </Text>
          <Pressable style={styles.directionsBtn}>
            <MaterialIcons name="directions-car" size={20} color={colors.white} />
            <Text style={styles.directionsText}>Get directions</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.issueHead}>
            <MaterialIcons name="bolt" size={18} color={colors.brand} />
            <Text style={styles.cardTitle}>Reported issue</Text>
          </View>
          <View style={styles.issueBox}>
            <Text style={styles.issueText}>“{issue}”</Text>
          </View>
          <Text style={styles.photosLabel}>
            CUSTOMER ISSUE PHOTOS ({photos.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoRow}
          >
            {photos.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.photoWrap}>
                <Image source={{ uri }} style={styles.photo} />
                <Text style={styles.photoTag}>Issue {index + 1}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <View style={styles.otpHint}>
            <MaterialIcons name="vpn-key" size={18} color={colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={styles.otpTitle}>Arrival verification</Text>
              <Text style={styles.otpCopy}>
                Ask the customer for the 4-digit OTP at the door to start work.
              </Text>
            </View>
          </View>

          <Text style={styles.otpLabel}>ENTER CUSTOMER OTP</Text>
          <View style={styles.otpRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={`otp-${index}`}
                ref={(ref) => {
                  inputsRef.current[index] = ref;
                }}
                style={[styles.otpBox, otpError && styles.otpBoxError]}
                value={digit}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(v) => updateDigit(index, v)}
              />
            ))}
          </View>
          {otpError ? (
            <Text style={styles.errorText}>Enter all 4 digits to continue</Text>
          ) : null}

          <Pressable style={styles.verifyBtn} onPress={verify}>
            <Ionicons name="checkmark-circle" size={18} color={colors.white} />
            <Text style={styles.verifyText}>Verify & start work</Text>
          </Pressable>
        </View>
      </ScrollView>

      <CaptainHelpModal
        visible={helpOpen}
        onClose={() => setHelpOpen(false)}
        steps={[
          'Navigate to the customer using Get directions.',
          'Review issue photos before you arrive.',
          'Enter customer OTP to start work — you stay in this booking until End job.',
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
  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  workId: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.white,
    letterSpacing: 0.3,
  },
  enRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  enRouteDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  enRouteText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.successDark,
  },
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
    gap: 10,
  },
  customerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  customer: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.black,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.slate100,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 12,
    color: colors.slate700,
  },
  iconActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnChat: { backgroundColor: colors.brand },
  addressRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  address: {
    flex: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate600,
    lineHeight: 18,
  },
  cardTitle: {
    ...type.sectionTitle,
  },
  cardSub: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate500,
  },
  directionsBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  directionsText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.white,
  },
  issueHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  issueBox: {
    backgroundColor: colors.slate50,
    borderRadius: 12,
    padding: 12,
  },
  issueText: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate700,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  photosLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.slate500,
  },
  photoRow: { gap: 10 },
  photoWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  photo: {
    width: 148,
    height: 110,
    backgroundColor: colors.surfaceContainer,
  },
  photoTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: colors.black,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontFamily: fontFamilies.mono,
    fontSize: 10,
    color: colors.white,
  },
  otpHint: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
  },
  otpTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  otpCopy: {
    marginTop: 2,
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate600,
    lineHeight: 17,
  },
  otpLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.slate500,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  otpBox: {
    width: 52,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    textAlign: 'center',
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 22,
    color: colors.black,
  },
  otpBoxError: {
    borderColor: colors.error,
  },
  errorText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
  },
  verifyBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
