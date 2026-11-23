import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IncomingJobCard } from './IncomingJobCard';
import { useDuty } from '../state/dutyContext';
import type { RootStackParamList } from '../types/navigation';

export function GlobalIncomingJob() {
  const insets = useSafeAreaInsets();
  const { onDuty, incoming, secondsLeft, acceptJob, declineJob, jobInProgress } =
    useDuty();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!onDuty || jobInProgress || !incoming) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: 72 + Math.max(insets.bottom, 10) }]}
    >
      <IncomingJobCard
        job={incoming}
        secondsLeft={secondsLeft}
        onAccept={() => {
          const job = acceptJob();
          if (job) {
            navigation.navigate('JobDetails', { job });
          }
        }}
        onDecline={declineJob}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 100,
  },
});
