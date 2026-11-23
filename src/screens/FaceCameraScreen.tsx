import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  FlipType,
  manipulateAsync,
  SaveFormat,
} from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setFaceDraft } from '../state/faceOnboardingDraft';
import { colors, fontFamilies, radii } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'FaceCamera'>;

const { width: SCREEN_W } = Dimensions.get('window');
const OVAL_W = Math.min(SCREEN_W * 0.72, 280);
const OVAL_H = OVAL_W * 1.22;

/** Short settle so the user can place their face, then unlock capture. */
const READY_MS = 700;

async function mirrorCapturedPhoto(uri: string): Promise<string> {
  const mirrored = await manipulateAsync(
    uri,
    [{ flip: FlipType.Horizontal }],
    { compress: 0.8, format: SaveFormat.JPEG },
  );
  return mirrored.uri;
}

export function FaceCameraScreen({ navigation }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Soft unlock: once camera is live, briefly wait for positioning, then green.
  useEffect(() => {
    if (!permission?.granted || !cameraReady) {
      setAligned(false);
      return;
    }
    setAligned(false);
    const timer = setTimeout(() => setAligned(true), READY_MS);
    return () => clearTimeout(timer);
  }, [permission?.granted, cameraReady]);

  const statusCopy = aligned
    ? 'Face aligned — ready to capture'
    : 'Position your face inside the oval';

  const finishCapture = async () => {
    if (!aligned || !cameraRef.current || capturing) return;
    let uri: string | undefined;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (photo?.uri) {
        try {
          uri = await mirrorCapturedPhoto(photo.uri);
        } catch {
          uri = photo.uri;
        }
      }
    } catch {
      // Simulator / permission edge cases
    } finally {
      setCapturing(false);
      setFaceDraft({ captured: true, photoUri: uri });
      navigation.navigate('FaceVerification', {
        faceCaptured: true,
        facePhotoUri: uri,
      });
    }
  };

  if (!permission) {
    return <View style={styles.safe} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.permissionBody}>
          <Ionicons name="camera-outline" size={48} color={colors.white} />
          <Text style={styles.permissionTitle}>Camera permission needed</Text>
          <Text style={styles.permissionText}>
            Enable camera access to capture your face for Captain verification.
          </Text>
          <Pressable style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Enable Camera</Text>
          </Pressable>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.cameraPane}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="front"
          onCameraReady={() => setCameraReady(true)}
        />

        <SafeAreaView style={styles.cameraOverlay} edges={['top']}>
          <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={22} color={colors.white} />
          </Pressable>

          <View style={styles.frameWrap}>
            <View
              style={[
                styles.ovalFrame,
                aligned ? styles.ovalGreen : styles.ovalIdle,
              ]}
            />
            <View
              style={[
                styles.statusPill,
                aligned ? styles.statusPillGreen : styles.statusPillIdle,
              ]}
            >
              <Ionicons
                name={aligned ? 'checkmark-circle' : 'scan-outline'}
                size={16}
                color={colors.white}
              />
              <Text style={styles.statusText}>{statusCopy}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.bottomPane}>
        <Text style={styles.bottomTitle}>Capture guidelines</Text>
        <View style={styles.warningRow}>
          <Ionicons name="sunny" size={18} color="#D97706" />
          <Text style={styles.warningText}>
            Keep your face in proper sunlight / bright lighting.
          </Text>
        </View>
        <View style={styles.warningRow}>
          <Ionicons name="alert-circle" size={18} color="#D97706" />
          <Text style={styles.warningText}>
            Do not wear masks or sunglasses while capturing.
          </Text>
        </View>

        <Pressable
          style={[
            styles.captureBtn,
            (!aligned || capturing) && styles.captureDisabled,
          ]}
          disabled={!aligned || capturing}
          onPress={finishCapture}
        >
          <Ionicons name="camera" size={20} color={colors.white} />
          <Text style={styles.captureLabel}>
            {capturing
              ? 'Capturing...'
              : aligned
                ? 'Capture photo'
                : 'Wait for green oval'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B1C30',
  },
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  permissionBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  permissionTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 22,
    color: colors.white,
    textAlign: 'center',
  },
  permissionText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionBtn: {
    marginTop: 8,
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  permissionBtnText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  cancelText: {
    marginTop: 10,
    fontFamily: fontFamilies.sansSemiBold,
    color: 'rgba(255,255,255,0.7)',
  },
  cameraPane: {
    flex: 1.35,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  frameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  ovalFrame: {
    width: OVAL_W,
    height: OVAL_H,
    borderRadius: OVAL_W / 2,
    borderWidth: 4,
    backgroundColor: 'transparent',
  },
  ovalIdle: {
    borderColor: 'rgba(255,255,255,0.85)',
  },
  ovalGreen: {
    borderColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOpacity: 0.55,
    shadowRadius: 18,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: '92%',
  },
  statusPillIdle: {
    backgroundColor: 'rgba(15,23,42,0.7)',
  },
  statusPillGreen: {
    backgroundColor: 'rgba(22,163,74,0.95)',
  },
  statusText: {
    flexShrink: 1,
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: colors.white,
  },
  bottomPane: {
    backgroundColor: colors.white,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -18,
    gap: 12,
    shadowColor: '#0B1C30',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.slate900,
    marginBottom: 2,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate700,
  },
  captureBtn: {
    marginTop: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  captureDisabled: {
    opacity: 0.45,
  },
  captureLabel: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
