import { Platform, Vibration } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const RING_URI = 'https://actions.google.com/sounds/v1/household/phone_ringing.ogg';
const RING_MS = 2000;

let player: AudioPlayer | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;

function clearStopTimer() {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
}

function stopPlayer() {
  clearStopTimer();
  if (!player) return;
  try {
    player.pause();
  } catch {
    // ignore
  }
  try {
    player.remove();
  } catch {
    // ignore
  }
  player = null;
}

async function vibrateAlert() {
  if (Platform.OS === 'web') return;

  try {
    if (Platform.OS === 'android') {
      Vibration.cancel();
      Vibration.vibrate([0, 400, 160, 400, 160, 500]);
      setTimeout(() => {
        try {
          Vibration.vibrate(350);
        } catch {
          // ignore
        }
      }, 50);
    } else {
      Vibration.vibrate([0, 400, 160, 400, 160, 400]);
    }
  } catch {
    // ignore
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (Platform.OS === 'android') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch {
    // ignore haptic failures
  }
}

export async function playJobAlert() {
  stopPlayer();
  await vibrateAlert();

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });

    player = createAudioPlayer({ uri: RING_URI });
    player.volume = 1;
    player.play();

    stopTimer = setTimeout(() => {
      stopPlayer();
    }, RING_MS);
  } catch {
    // network / audio unavailable — vibration already fired
  }
}
