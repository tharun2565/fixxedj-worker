import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamilies, shadows } from '../theme';

type Props = {
  visible: boolean;
  title: string;
  hint?: string;
  onClose: () => void;
  onCaptured: (uri: string) => void;
};

export function DocumentCaptureModal({
  visible,
  title,
  hint = 'Place the card inside the frame and capture clearly',
  onClose,
  onCaptured,
}: Props) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (visible && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  useEffect(() => {
    if (!visible) {
      setPreviewUri(null);
      setCameraReady(false);
      setCapturing(false);
    }
  }, [visible]);

  const capture = async () => {
    if (!cameraRef.current || capturing || !cameraReady) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (photo?.uri) setPreviewUri(photo.uri);
    } catch {
      // simulator / permission edge
    } finally {
      setCapturing(false);
    }
  };

  const usePhoto = () => {
    if (!previewUri) return;
    onCaptured(previewUri);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.headerBtn} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerBtn} />
        </View>

        <View style={styles.stage}>
          {!permission?.granted ? (
            <View style={styles.permissionBox}>
              <MaterialIcons name="photo-camera" size={40} color={colors.brand} />
              <Text style={styles.permissionTitle}>Camera access needed</Text>
              <Text style={styles.permissionCopy}>
                Allow camera to capture Aadhaar / PAN photos.
              </Text>
              <Pressable style={styles.permBtn} onPress={requestPermission}>
                <Text style={styles.permBtnText}>Allow camera</Text>
              </Pressable>
            </View>
          ) : previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
                onCameraReady={() => setCameraReady(true)}
              />
              <View style={styles.frame} pointerEvents="none">
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
            </>
          )}
        </View>

        <Text style={styles.hint}>{hint}</Text>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {previewUri ? (
            <>
              <Pressable style={styles.secondaryBtn} onPress={() => setPreviewUri(null)}>
                <Text style={styles.secondaryText}>Retake</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={usePhoto}>
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.primaryText}>Use photo</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.captureBtn, (!cameraReady || capturing) && styles.disabled]}
              disabled={!cameraReady || capturing}
              onPress={capture}
            >
              {capturing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <View style={styles.captureInner} />
              )}
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1220' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.white,
  },
  stage: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(58,134,255,0.35)',
  },
  preview: { width: '100%', height: '100%' },
  frame: {
    ...StyleSheet.absoluteFill,
    margin: 28,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.brand,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.brand,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.brand,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.brand,
    borderBottomRightRadius: 8,
  },
  hint: {
    marginTop: 14,
    marginHorizontal: 24,
    textAlign: 'center',
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brand,
  },
  disabled: { opacity: 0.45 },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.brandGlow,
  },
  primaryText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  secondaryBtn: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.white,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  permissionTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.white,
  },
  permissionCopy: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  permBtn: {
    marginTop: 10,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permBtnText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.white,
  },
});
