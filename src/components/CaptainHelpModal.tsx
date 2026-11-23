import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamilies, shadows, type } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  steps?: string[];
};

export function CaptainHelpModal({
  visible,
  onClose,
  title = 'Need help on this booking?',
  steps,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <View style={styles.headLeft}>
              <View style={styles.helpIcon}>
                <Ionicons name="help" size={18} color={colors.white} />
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeHit}>
              <Ionicons name="close" size={20} color={colors.slate600} />
            </Pressable>
          </View>

          {steps?.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>{index + 1}</Text>
              </View>
              <Text style={styles.step}>{step}</Text>
            </View>
          ))}

          <Text style={styles.copy}>
            Stuck mid-job? Reach Fixxedj customer team from your hub for assist. Answer options will appear after the team connects with you.
          </Text>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.48)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    gap: 12,
    paddingBottom: 30,
    ...shadows.raised,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slate200,
    marginBottom: 4,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  helpIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.help,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.sectionTitle,
    flex: 1,
  },
  closeHit: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNum: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.brand,
  },
  step: {
    ...type.body,
    flex: 1,
    color: colors.black,
  },
  copy: {
    ...type.body,
    marginTop: 2,
  },
  closeBtn: {
    marginTop: 4,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.brandGlow,
  },
  closeText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
