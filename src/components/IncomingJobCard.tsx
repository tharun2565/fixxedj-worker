import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, fontFamilies, shadows } from '../theme';

export type IncomingJob = {
  id: string;
  title: string;
  category: string;
  fare: string;
  customer: string;
  distance: string;
  eta: string;
  address: string;
  area: string;
  issue?: string;
  photos?: string[];
};

type Props = {
  job: IncomingJob;
  secondsLeft: number;
  onAccept: () => void;
  onDecline: () => void;
};

export function IncomingJobCard({ job, secondsLeft, onAccept, onDecline }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.pulse} />
          <View>
            <View style={styles.idPill}>
              <Text style={styles.workId}>WORK ID #{job.id}</Text>
            </View>
            <Text style={styles.newRequest}>New request</Text>
            <Text style={styles.title}>Incoming Job</Text>
          </View>
        </View>
        <View style={styles.timer}>
          <Text style={styles.timerText}>{secondsLeft}s</Text>
        </View>
      </View>

      <View style={styles.tags}>
        <View style={styles.tagPrimary}>
          <MaterialIcons name="bolt" size={14} color={colors.white} />
          <Text style={styles.tagPrimaryText}>{job.category}</Text>
        </View>
        <View style={styles.tagSecondary}>
          <Text style={styles.tagSecondaryText}>Urgent</Text>
        </View>
      </View>

      <Text style={styles.jobTitle}>{job.title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.customer}>{job.customer}</Text>
        <Text style={styles.distance}>
          {job.distance} · {job.eta}
        </Text>
      </View>

      <View style={styles.addressRow}>
        <Ionicons name="location" size={18} color={colors.brand} />
        <Text style={styles.address}>{job.address}</Text>
      </View>

      <Pressable style={styles.acceptBtn} onPress={onAccept}>
        <Text style={styles.acceptText}>Accept job</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.white} />
      </Pressable>
      <Pressable style={styles.declineBtn} onPress={onDecline}>
        <Ionicons name="close" size={16} color={colors.error} />
        <Text style={styles.declineText}>Decline</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: 'hidden',
    ...shadows.raised,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.brand,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
    marginTop: 6,
  },
  idPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  workId: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.white,
    letterSpacing: 0.4,
  },
  newRequest: {
    marginTop: 2,
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.brand,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.black,
  },
  timer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.brand,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.brand,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagPrimaryText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.white,
  },
  tagSecondary: {
    backgroundColor: colors.black,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagSecondaryText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    color: colors.white,
  },
  jobTitle: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 18,
    color: colors.black,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customer: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.black,
  },
  distance: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: colors.slate500,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  address: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: colors.slate700,
    lineHeight: 18,
  },
  acceptBtn: {
    marginTop: 4,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.brandGlow,
  },
  acceptText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  declineBtn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  declineText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 12,
    color: colors.error,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
