import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { promptOpenSettings } from '@/utils/permissions';

/** Tap-to-start / tap-to-stop recording. `toggle()` resolves with the file uri when it stops. */
export function useRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const startedAtMs = useRef<number | null>(null);

  const start = useCallback(async () => {
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        promptOpenSettings('Microphone needed', 'Allow microphone access to record your voice.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAtMs.current = Date.now();
      setRecording(true);
    } catch {
      startedAtMs.current = null;
      Alert.alert('Could not start recording', 'Please try again.');
    }
  }, [recorder]);

  const stop = useCallback(async (): Promise<{ uri: string; durationMillis: number } | null> => {
    try {
      const elapsedMillis = startedAtMs.current === null ? 0 : Date.now() - startedAtMs.current;
      await recorder.stop();
      const durationMillis = Math.max(0, recorder.getStatus().durationMillis, elapsedMillis);
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const uri = recorder.uri;
      return uri ? { uri, durationMillis } : null;
    } catch {
      Alert.alert('Could not save recording', 'Please try again.');
      return null;
    } finally {
      startedAtMs.current = null;
      setRecording(false);
    }
  }, [recorder]);

  const toggleWithDuration = useCallback(async () => {
    if (recording) return stop();
    await start();
    return null;
  }, [recording, start, stop]);

  const toggle = useCallback(async (): Promise<string | null> => {
    const result = await toggleWithDuration();
    return result?.uri ?? null;
  }, [toggleWithDuration]);

  return { recording, toggle, toggleWithDuration };
}
