import { useEffect, useMemo, useRef, useState, type ElementRef } from 'react';
import {
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
import { setFaceDraft } from '../state/faceOnboardingDraft';
import {
  ensureApplicationId,
  setOnboardingMeta,
} from '../state/onboardingMeta';
import { colors, fontFamilies, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type OtpInputRef = ElementRef<typeof TextInput>;

const OTP_LENGTH = 6;
const MOCK_INVALID_OTP = '000000';
const DIRECT_HOME_PHONE = '9972696207';

export function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(30);
  const [showOtpError, setShowOtpError] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const inputsRef = useRef<Array<OtpInputRef | null>>([]);

  const isValidPhone = useMemo(() => /^\d{10}$/.test(phone), [phone]);
  const otpValue = digits.join('');
  const isOtpComplete =
    otpValue.length === OTP_LENGTH && digits.every((d) => d !== '');
  const canShowLoginButton = otpVisible && isOtpComplete && acceptedTerms;

  useEffect(() => {
    if (!otpVisible || seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [otpVisible, seconds]);

  const handleGetOtp = () => {
    if (!isValidPhone) {
      setShowPhoneError(true);
      return;
    }
    setShowPhoneError(false);
    setOtpVisible(true);
    setDigits(Array(OTP_LENGTH).fill(''));
    setShowOtpError(false);
    setSeconds(30);
    setTimeout(() => inputsRef.current[0]?.focus(), 150);
  };

  const updateDigit = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setShowOtpError(false);
    if (cleaned && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleLogin = () => {
    if (!canShowLoginButton) return;
    if (otpValue === MOCK_INVALID_OTP) {
      setShowOtpError(true);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
      return;
    }

    if (phone === DIRECT_HOME_PHONE) {
      ensureApplicationId();
      setFaceDraft({
        fullName: 'Tarun',
        dob: '01/01/1995',
        gender: 'Male',
        captured: true,
        aadhaar: '123456789012',
        pan: 'ABCDE1234F',
      });
      setOnboardingMeta({
        trades: ['electrician'],
        experience: '3 - 5 Years',
      });
      navigation.replace('MainTabs');
      return;
    }

    navigation.navigate('FaceVerification');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.titleBar}>
        <Text style={styles.brand}>
          Fixxedj <Text style={styles.brandAccent}>Captain</Text>
        </Text>
        <Pressable style={styles.helpBtn} accessibilityLabel="Help">
          <Ionicons name="help-circle-outline" size={20} color={colors.slate600} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Hey, Captain!</Text>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.fieldTitle}>Mobile number</Text>
            <View style={styles.securePill}>
              <Ionicons name="shield-checkmark" size={13} color={colors.success} />
              <Text style={styles.secureText}>Encrypted</Text>
            </View>
          </View>

          <View style={styles.phoneShell}>
            <View style={styles.country}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(value) => {
                setPhone(value.replace(/\D/g, '').slice(0, 10));
                if (showPhoneError) setShowPhoneError(false);
              }}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="98765 43210"
              placeholderTextColor={colors.slate400}
            />
          </View>

          <Pressable
            style={[styles.getOtpBtn, !isValidPhone && styles.getOtpMuted]}
            onPress={handleGetOtp}
          >
            <Text style={styles.getOtpText}>Get OTP</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>

          {showPhoneError ? (
            <View style={styles.errorRow}>
              <MaterialIcons name="error" size={16} color={colors.error} />
              <Text style={styles.errorText}>Enter a valid 10-digit mobile number</Text>
            </View>
          ) : null}

          {otpVisible ? (
            <View style={styles.otpInline}>
              <View style={styles.otpDivider} />
              <Text style={styles.fieldTitle}>Enter 6-digit OTP</Text>
              <View style={styles.otpRow}>
                {digits.map((digit, index) => (
                  <TextInput
                    key={`otp-${index}`}
                    ref={(ref) => {
                      inputsRef.current[index] = ref;
                    }}
                    style={[styles.otpInput, showOtpError && styles.otpErrorBorder]}
                    value={digit}
                    onChangeText={(value) => updateDigit(index, value)}
                    onKeyPress={({ nativeEvent }) =>
                      onKeyPress(index, nativeEvent.key)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>
              <Pressable
                disabled={seconds > 0}
                onPress={() => {
                  setDigits(Array(OTP_LENGTH).fill(''));
                  setSeconds(30);
                  setShowOtpError(false);
                }}
              >
                <Text style={[styles.resend, seconds > 0 && styles.resendDisabled]}>
                  Resend OTP
                  {seconds > 0 ? ` · 00:${seconds.toString().padStart(2, '0')}` : ''}
                </Text>
              </Pressable>
              {showOtpError ? (
                <View style={styles.errorRow}>
                  <MaterialIcons name="error" size={16} color={colors.error} />
                  <Text style={styles.errorText}>Incorrect OTP. Please try again.</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.bottomBlock}>
          <Pressable
            style={styles.termsRow}
            onPress={() => setAcceptedTerms((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms }}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}>
              {acceptedTerms ? (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              ) : null}
            </View>
            <Text style={styles.termsText}>
              I agree to Fixxedj Captain’s{' '}
              <Text style={styles.legalLink}>Terms & Conditions</Text> and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>.
            </Text>
          </Pressable>

          {canShowLoginButton ? (
            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && styles.pressed]}
              onPress={handleLogin}
            >
              <Text style={styles.loginBtnText}>Login as Captain</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </Pressable>
          ) : (
            <View style={styles.lockedHint}>
              <Ionicons name="lock-closed-outline" size={14} color={colors.slate500} />
              <Text style={styles.loginHint}>
                {otpVisible
                  ? 'Complete OTP and accept Terms to unlock login'
                  : 'Request OTP to continue'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  titleBar: {
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 20,
    color: colors.slate900,
    letterSpacing: -0.4,
  },
  brandAccent: {
    color: colors.brand,
  },
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: 32,
    gap: 16,
  },
  greeting: {
    marginTop: 20,
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: colors.slate900,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    shadowColor: '#0B1C30',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.slate900,
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  secureText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    color: colors.success,
  },
  phoneShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D8E3F5',
    backgroundColor: '#FAFCFF',
    borderRadius: 14,
    minHeight: 56,
    paddingHorizontal: 4,
  },
  country: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  flag: { fontSize: 16 },
  countryCode: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.slate800,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 18,
    letterSpacing: 0.6,
    color: colors.slate900,
  },
  getOtpBtn: {
    marginTop: 4,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  getOtpMuted: {
    opacity: 0.55,
  },
  getOtpText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  otpInline: {
    gap: 12,
    marginTop: 4,
  },
  otpDivider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginBottom: 4,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D8E3F5',
    backgroundColor: '#FAFCFF',
    fontFamily: fontFamilies.sansBold,
    fontSize: 22,
    color: colors.slate900,
  },
  otpErrorBorder: {
    borderColor: colors.error,
  },
  resend: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: colors.brand,
  },
  resendDisabled: {
    color: colors.slate500,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: colors.error,
  },
  bottomBlock: {
    marginTop: 8,
    gap: 14,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: colors.white,
  },
  checkboxOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  termsText: {
    flex: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate600,
  },
  legalLink: {
    color: colors.brand,
    fontFamily: fontFamilies.sansSemiBold,
  },
  loginBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.brand,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  loginBtnText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.white,
  },
  lockedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  loginHint: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: colors.slate500,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
