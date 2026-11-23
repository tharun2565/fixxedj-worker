import { useMemo, useState } from 'react';
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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandHeader } from '../components/BrandHeader';
import { DocumentCaptureModal } from '../components/DocumentCaptureModal';
import { setFaceDraft } from '../state/faceOnboardingDraft';
import { colors, fontFamilies, radii, shadows, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'KycVerification'>;
type UploadKey = 'aadhaarFront' | 'aadhaarBack' | 'panFront';

const CAPTURE_COPY: Record<UploadKey, { title: string; hint: string }> = {
  aadhaarFront: {
    title: 'Aadhaar · Front',
    hint: 'Capture the front of Aadhaar. Keep text sharp and fully inside the frame.',
  },
  aadhaarBack: {
    title: 'Aadhaar · Back',
    hint: 'Capture the back of Aadhaar with address clearly visible.',
  },
  panFront: {
    title: 'PAN · Front',
    hint: 'Capture the front of PAN card. Avoid glare on the plastic.',
  },
};

export function KycVerificationScreen({ navigation, route }: Props) {
  const { fullName, dob, gender } = route.params;
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [uploads, setUploads] = useState<Record<UploadKey, string | null>>({
    aadhaarFront: null,
    aadhaarBack: null,
    panFront: null,
  });
  const [captureKey, setCaptureKey] = useState<UploadKey | null>(null);

  const aadhaarReady = useMemo(
    () => aadhaar.length === 12 && !!uploads.aadhaarFront && !!uploads.aadhaarBack,
    [aadhaar, uploads.aadhaarFront, uploads.aadhaarBack],
  );

  const panReady = useMemo(
    () => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan) && !!uploads.panFront,
    [pan, uploads.panFront],
  );

  const canContinue = aadhaarReady && panReady;

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
        <Text style={styles.title}>Verify Your Identity</Text>
        <View style={styles.lockRow}>
          <Ionicons name="lock-closed" size={16} color={colors.onSurfaceVariant} />
          <Text style={styles.lockText}>Your data is securely encrypted.</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>PROFILE FROM PREVIOUS STEP</Text>
          <Text style={styles.summaryValue}>{fullName}</Text>
          <Text style={styles.summaryMeta}>
            {dob} • {gender}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleLeft}>
              <MaterialIcons name="badge" size={22} color={colors.brand} />
              <Text style={styles.cardTitle}>Aadhaar Details</Text>
            </View>
            {aadhaarReady ? (
              <View style={styles.readyPill}>
                <MaterialIcons name="check-circle" size={14} color={colors.success} />
                <Text style={styles.readyText}>VERIFIED</Text>
              </View>
            ) : (
              <View style={styles.pendingPill}>
                <MaterialIcons name="warning" size={14} color="#827717" />
                <Text style={styles.pendingText}>PENDING</Text>
              </View>
            )}
          </View>
          <Text style={styles.label}>AADHAAR NUMBER</Text>
          <TextInput
            style={styles.input}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor={colors.slate400}
            keyboardType="number-pad"
            maxLength={12}
            value={aadhaar}
            onChangeText={(v) => setAadhaar(v.replace(/\D/g, '').slice(0, 12))}
          />
          <View style={styles.uploadRow}>
            <UploadBox
              label="Add photo · Front"
              uri={uploads.aadhaarFront}
              onPress={() => setCaptureKey('aadhaarFront')}
            />
            <UploadBox
              label="Add photo · Back"
              uri={uploads.aadhaarBack}
              onPress={() => setCaptureKey('aadhaarBack')}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleLeft}>
              <MaterialIcons name="credit-card" size={22} color={colors.brand} />
              <Text style={styles.cardTitle}>PAN Card Details</Text>
            </View>
            {panReady ? (
              <View style={styles.readyPill}>
                <MaterialIcons name="check-circle" size={14} color={colors.success} />
                <Text style={styles.readyText}>VERIFIED</Text>
              </View>
            ) : (
              <View style={styles.pendingPill}>
                <MaterialIcons name="warning" size={14} color="#827717" />
                <Text style={styles.pendingText}>PENDING</Text>
              </View>
            )}
          </View>
          <Text style={styles.label}>PAN number</Text>
          <TextInput
            style={styles.input}
            placeholder="ABCDE1234F"
            placeholderTextColor={colors.slate400}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            value={pan}
            keyboardType={pan.length >= 5 && pan.length < 9 ? 'number-pad' : 'default'}
            onChangeText={(v) => {
              const up = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
              let next = '';
              for (let i = 0; i < up.length && next.length < 10; i += 1) {
                const ch = up[i];
                const pos = next.length;
                if (pos < 5) {
                  if (/[A-Z]/.test(ch)) next += ch;
                } else if (pos < 9) {
                  if (/[0-9]/.test(ch)) next += ch;
                } else if (/[A-Z]/.test(ch)) {
                  next += ch;
                }
              }
              setPan(next);
            }}
          />
          <UploadBox
            label="Add photo · PAN Front"
            uri={uploads.panFront}
            onPress={() => setCaptureKey('panFront')}
            fullWidth
          />
        </View>

        {!canContinue ? (
          <Text style={styles.gateNote}>
            Enter valid Aadhaar & PAN and capture all ID photos to continue.
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.continueBtn, !canContinue && styles.continueDisabled]}
          disabled={!canContinue}
          onPress={() => {
            setFaceDraft({ aadhaar, pan });
            navigation.navigate('SelectExpertise', { gender });
          }}
        >
          <Text style={styles.continueText}>Continue to Review</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
      </View>

      <DocumentCaptureModal
        visible={captureKey !== null}
        title={captureKey ? CAPTURE_COPY[captureKey].title : 'Capture ID'}
        hint={captureKey ? CAPTURE_COPY[captureKey].hint : undefined}
        onClose={() => setCaptureKey(null)}
        onCaptured={(uri) => {
          if (!captureKey) return;
          setUploads((prev) => ({ ...prev, [captureKey]: uri }));
        }}
      />
    </SafeAreaView>
  );
}

function UploadBox({
  label,
  uri,
  onPress,
  fullWidth,
}: {
  label: string;
  uri: string | null;
  onPress: () => void;
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.uploadBox,
        fullWidth && styles.uploadFull,
        !!uri && styles.uploadDone,
      ]}
      onPress={onPress}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.thumb} />
          <View style={styles.retakeRow}>
            <MaterialIcons name="check-circle" size={16} color={colors.success} />
            <Text style={styles.uploadLabel}>Captured · Retake</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.uploadIcon}>
            <MaterialIcons name="photo-camera" size={22} color={colors.brand} />
          </View>
          <Text style={styles.uploadLabel}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerBar: {
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 26,
    letterSpacing: -0.5,
    color: colors.slate900,
    textAlign: 'center',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: -8,
  },
  lockText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    color: colors.slate500,
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(58,134,255,0.25)',
    padding: 16,
    gap: 4,
    ...shadows.card,
  },
  summaryLabel: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.brand,
  },
  summaryValue: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 17,
    color: colors.slate900,
  },
  summaryMeta: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: colors.slate600,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 18,
    gap: 12,
    ...shadows.card,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
    paddingBottom: 10,
    marginBottom: 2,
  },
  cardTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 17,
    color: colors.slate900,
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff9c4',
    borderColor: '#fbc02d',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pendingText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 10,
    color: '#827717',
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  readyText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 10,
    color: colors.success,
  },
  label: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: colors.slate700,
    marginLeft: 2,
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
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  uploadBox: {
    flex: 1,
    minHeight: 128,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    overflow: 'hidden',
  },
  uploadFull: {
    width: '100%',
    marginTop: 4,
  },
  uploadDone: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
    borderStyle: 'solid',
  },
  thumb: {
    width: '100%',
    height: 72,
    borderRadius: 10,
    backgroundColor: colors.slate200,
  },
  retakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  uploadIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadLabel: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 12,
    color: colors.slate800,
    textAlign: 'center',
  },
  gateNote: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: colors.slate500,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    backgroundColor: colors.white,
    padding: 16,
  },
  continueBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.brandGlow,
  },
  continueDisabled: {
    opacity: 0.4,
  },
  continueText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.white,
  },
});
