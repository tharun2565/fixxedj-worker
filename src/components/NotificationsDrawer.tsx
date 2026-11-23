import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDuty, type CompletedJobNote } from '../state/dutyContext';
import { colors, fontFamilies, shadows } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function NotificationsDrawer({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { completedJobs, jobInProgress, onDuty } = useDuty();
  const slide = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      slide.setValue(1);
      Animated.spring(slide, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 160,
      }).start();
    }
  }, [visible, slide]);

  const close = () => {
    Animated.timing(slide, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const items: { id: string; title: string; sub: string; tone: 'info' | 'ok' | 'warn' }[] = [];

  if (jobInProgress) {
    items.push({
      id: 'active',
      title: 'Job in progress',
      sub: 'New bookings stay paused until you finish End job.',
      tone: 'warn',
    });
  } else if (onDuty) {
    items.push({
      id: 'duty',
      title: 'You are on duty',
      sub: 'Fixxedj will ping nearby jobs to your map.',
      tone: 'ok',
    });
  } else {
    items.push({
      id: 'off',
      title: 'You are off duty',
      sub: 'Flip On to start receiving bookings.',
      tone: 'info',
    });
  }

  completedJobs.slice(0, 8).forEach((j: CompletedJobNote) => {
    items.push({
      id: `done-${j.id}-${j.at}`,
      title: `Completed · #${j.id}`,
      sub: `${j.title} · ${j.customer} · ${j.at}`,
      tone: 'ok',
    });
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={close} />
        <Animated.View
          style={[
            styles.panel,
            {
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [
                {
                  translateX: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 360],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <Pressable onPress={close} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.black} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  item.tone === 'warn' && styles.cardWarn,
                  item.tone === 'ok' && styles.cardOk,
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    item.tone === 'warn' && styles.dotWarn,
                    item.tone === 'ok' && styles.dotOk,
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSub}>{item.sub}</Text>
                </View>
              </View>
            ))}

            {completedJobs.length === 0 ? (
              <Text style={styles.empty}>
                Job alerts and completed booking updates will show here.
              </Text>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.42)',
  },
  scrim: { flex: 1 },
  panel: {
    width: '86%',
    maxWidth: 360,
    backgroundColor: '#F7F9FF',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    ...shadows.raised,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    minHeight: 48,
  },
  title: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.black,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 14,
  },
  cardWarn: {
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
  },
  cardOk: {
    borderColor: colors.successBorder,
    backgroundColor: colors.successBg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
    marginTop: 5,
  },
  dotWarn: { backgroundColor: '#F59E0B' },
  dotOk: { backgroundColor: colors.success },
  cardTitle: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.black,
  },
  cardSub: {
    marginTop: 3,
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate600,
    lineHeight: 17,
  },
  empty: {
    marginTop: 8,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate500,
    textAlign: 'center',
    lineHeight: 18,
  },
});
