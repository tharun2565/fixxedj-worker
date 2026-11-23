import { useCallback, useMemo, useState } from 'react';
import {
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
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { BrandHeader } from '../components/BrandHeader';
import {
  getFaceDraft,
  setFaceDraft,
} from '../state/faceOnboardingDraft';
import { colors, fontFamilies, spacing } from '../theme';
import type { GenderOption, RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'FaceVerification'>;

function formatDobInput(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isAtLeast21(dob: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dob);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    return false;
  }
  const today = new Date();
  let age = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age >= 21;
}

export function FaceVerificationScreen({ navigation, route }: Props) {
  const initial = getFaceDraft();
  const [fullName, setFullName] = useState(initial.fullName);
  const [dob, setDob] = useState(initial.dob);
  const [gender, setGender] = useState<GenderOption | ''>(initial.gender);
  const [photoUri, setPhotoUri] = useState<string | undefined>(initial.photoUri);
  const [captured, setCaptured] = useState(initial.captured);
  const [dobTouched, setDobTouched] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const draft = getFaceDraft();
      setFullName(draft.fullName);
      setDob(draft.dob);
      setGender(draft.gender);
      setPhotoUri(draft.photoUri);
      setCaptured(draft.captured);

      if (route.params?.facePhotoUri || route.params?.faceCaptured) {
        setFaceDraft({
          photoUri: route.params.facePhotoUri ?? draft.photoUri,
          captured: true,
        });
        setPhotoUri(route.params.facePhotoUri ?? draft.photoUri);
        setCaptured(true);
      }
    }, [route.params?.faceCaptured, route.params?.facePhotoUri]),
  );

  const persist = (partial: {
    fullName?: string;
    dob?: string;
    gender?: GenderOption | '';
  }) => {
    setFaceDraft(partial);
  };

  const dobComplete = /^\d{2}\/\d{2}\/\d{4}$/.test(dob);
  const ageOk = dobComplete ? isAtLeast21(dob) : false;
  const showAgeError = dobTouched && dobComplete && !ageOk;

  const canContinue = useMemo(() => {
    return (
      captured &&
      fullName.trim().length > 1 &&
      dobComplete &&
      ageOk &&
      gender !== ''
    );
  }, [captured, fullName, dobComplete, ageOk, gender]);

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

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Hey, Captain!</Text>
        <Text style={styles.sectionTitle}>Face verification & identity</Text>

        <View style={styles.profileCard}>
          <Pressable
            style={styles.avatarWrap}
            onPress={() => {
              setFaceDraft({ fullName, dob, gender, photoUri, captured });
              navigation.navigate('FaceCamera');
            }}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={42} color={colors.brand} />
              </View>
            )}
            <View style={[styles.avatarBadge, captured && styles.avatarBadgeOk]}>
              <Ionicons
                name={captured ? 'checkmark' : 'camera'}
                size={14}
                color={colors.white}
              />
            </View>
          </Pressable>

          <Pressable
            style={styles.addFaceBtn}
            onPress={() => {
              setFaceDraft({ fullName, dob, gender, photoUri, captured });
              navigation.navigate('FaceCamera');
            }}
          >
            <Text style={styles.addFaceText}>
              {captured ? 'Retake face photo' : 'Add your face'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.brand} />
          </Pressable>

          <Text style={styles.profileHint}>
            This photo will be carried for the validation process.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Personal details</Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Full name (as per ID)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rahul Kumar"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={(value) => {
                setFullName(value);
                persist({ fullName: value });
              }}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Date of birth</Text>
            <TextInput
              style={[styles.input, showAgeError && styles.inputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={dob}
              onChangeText={(value) => {
                const next = formatDobInput(value);
                setDob(next);
                setDobTouched(true);
                persist({ dob: next });
              }}
              maxLength={10}
            />
            <Text style={styles.helper}>Workers must be 21 years or older.</Text>
            {showAgeError ? (
              <Text style={styles.errorText}>
                Age must be above 21 years to continue.
              </Text>
            ) : null}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {(['Male', 'Female', 'Other'] as const).map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.genderChip,
                    gender === option && styles.genderChipOn,
                  ]}
                  onPress={() => {
                    setGender(option);
                    persist({ gender: option });
                  }}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === option && styles.genderTextOn,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.nextBtn, !canContinue && styles.nextDisabled]}
          disabled={!canContinue}
          onPress={() => {
            setFaceDraft({ fullName, dob, gender, photoUri, captured: true });
            navigation.navigate('KycVerification', {
              fullName: fullName.trim(),
              dob,
              gender: gender as GenderOption,
            });
          }}
        >
          <Text style={styles.nextText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F8FF' },
  headerBar: {
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: colors.white,
  },
  scroll: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 14,
  },
  greeting: {
    textAlign: 'center',
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: colors.slate900,
  },
  sectionTitle: {
    textAlign: 'center',
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    color: colors.slate500,
    marginTop: -6,
    marginBottom: 4,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    position: 'relative',
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: '#22C55E',
  },
  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.brand,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarBadgeOk: {
    backgroundColor: '#16A34A',
  },
  addFaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addFaceText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.brand,
  },
  profileHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.slate500,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 16,
  },
  cardHeading: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 17,
    color: colors.slate900,
    letterSpacing: -0.2,
  },
  fieldBlock: {
    gap: 8,
  },
  label: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: colors.slate700,
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: '#D8E3F5',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 16,
    color: colors.slate900,
    backgroundColor: '#FAFCFF',
  },
  inputError: {
    borderColor: colors.error,
  },
  helper: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate500,
  },
  errorText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: colors.error,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderChip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D8E3F5',
    backgroundColor: '#FAFCFF',
  },
  genderChipOn: {
    borderColor: colors.brand,
    backgroundColor: '#EFF6FF',
  },
  genderText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    color: colors.slate700,
  },
  genderTextOn: {
    color: colors.brand,
  },
  footer: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: colors.white,
  },
  nextBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextDisabled: {
    opacity: 0.45,
  },
  nextText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.white,
  },
});
