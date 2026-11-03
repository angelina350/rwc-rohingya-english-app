import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { api } from '@/api/client';
import type { Direction, TranslateResult } from '@/api/types';
import { ConfidenceBadge, LOW_CONFIDENCE } from '@/components/ConfidenceBadge';
import { MicButton } from '@/components/MicButton';
import { useAppState } from '@/state/AppState';
import { usePlayAudio } from '@/hooks/usePlayAudio';
import { useRecorder } from '@/hooks/useRecorder';
import { colors, fonts, radius, shadow, spacing, TAB_BAR_SPACE } from '@/theme';
import { promptOpenSettings } from '@/utils/permissions';

const LABELS: Record<Direction, [string, string]> = {
  'rhg-en': ['Rohingya', 'English'],
  'en-rhg': ['English', 'Rohingya'],
};

export default function SpeakScreen() {
  const insets = useSafeAreaInsets();
  const [direction, setDirection] = useState<Direction>('rhg-en');
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savingTranslation, setSavingTranslation] = useState(false);
  const { saveTranslation, savedTranslations } = useAppState();
  const { recording, toggle } = useRecorder();
  const play = usePlayAudio();
  const replay = useAudioPlayer(null);
  const translationSaved =
    !!result?.translatedText &&
    savedTranslations.some(
      (item) =>
        item.sourceText === result.sourceText &&
        item.translatedText === result.translatedText &&
        item.direction === result.direction,
    );

  const speakResult = (r: TranslateResult) => {
    // Read the English side aloud (TTS fallback until backend audio exists).
    const english = r.direction === 'rhg-en' ? r.translatedText : r.sourceText;
    play({ url: r.direction === 'rhg-en' ? r.audioUrl : null, fallbackText: english ?? undefined });
  };

  const run = async (job: () => Promise<TranslateResult>) => {
    setBusy(true);
    try {
      const r = await job();
      setResult(r);
      speakResult(r);
    } catch {
      Alert.alert('Translation failed', 'Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const onMic = async () => {
    const uri = await toggle();
    if (!uri) return;
    setRecordingUri(uri);
    await run(() => api.translateSpeech(uri, direction));
  };

  const onCamera = async () => {
    let perm = await ImagePicker.getCameraPermissionsAsync();
    if (!perm.granted) {
      if (!perm.canAskAgain) {
        return promptOpenSettings(
          'Camera needed',
          'Allow camera access to translate text in photos.',
        );
      }
      perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
    }
    const shot = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'] });
    if (shot.canceled) return;
    await run(() => api.translateImage(shot.assets[0].uri, direction));
  };

  const onReplay = () => {
    if (!recordingUri) return;
    replay.replace({ uri: recordingUri });
    replay.play();
  };

  const onSaveTranslation = async () => {
    if (!result || translationSaved) return;
    if (!result.translatedText) {
      Alert.alert('Could not save', 'This translation does not have translated text yet.');
      return;
    }

    setSavingTranslation(true);
    try {
      await saveTranslation(result);
      Alert.alert('Saved', 'Translation added to your Saved list.');
    } catch {
      Alert.alert('Could not save', 'Please check your device storage and try again.');
    } finally {
      setSavingTranslation(false);
    }
  };

  const swap = () => {
    setDirection((d) => (d === 'rhg-en' ? 'en-rhg' : 'rhg-en'));
    setResult(null);
  };

  const [from, to] = LABELS[direction];
  const fromEnglish = direction === 'en-rhg';
  const micColor = fromEnglish ? colors.primary : colors.directionOrange;
  const dotColor = micColor;
  const ringColor = fromEnglish ? colors.primarySoft : colors.directionOrangeSoft;
  const ringBorderColor = fromEnglish ? colors.glassBorder : colors.directionOrangeBorder;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + TAB_BAR_SPACE + spacing.lg,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>Rohingya Voice</Text>
          <Text style={styles.title}>Translate</Text>
        </View>

        <View style={styles.languageRow}>
          <View style={styles.languageSelector}>
            <View style={styles.languageSide}>
              <View
                style={[
                  styles.languageDot,
                  { backgroundColor: dotColor },
                ]}
              />
              <Text style={styles.language}>{from}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Swap languages. Now ${from} to ${to}`}
              onPress={swap}
              style={({ pressed }) => [styles.swap, pressed && styles.pressed]}
            >
              <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
            </Pressable>
            <Text style={[styles.language, styles.languageRight]}>{to}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Translate text from a photo"
            accessibilityState={{ disabled: busy || recording }}
            onPress={onCamera}
            disabled={busy || recording}
            style={({ pressed }) => [
              styles.cameraButton,
              pressed && styles.pressed,
              (busy || recording) && styles.disabled,
            ]}
          >
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.main}>
          {busy && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Translating…</Text>
            </View>
          )}
          {!busy && result && (
            <View style={styles.result}>
              <Text style={styles.source}>{result.sourceText}</Text>
              <Text style={styles.translated}>{result.translatedText ?? 'No translation yet'}</Text>
              <ConfidenceBadge value={result.confidence} />
              {result.confidence < LOW_CONFIDENCE && (
                <View style={styles.notSure}>
                  <Ionicons name="alert-circle" size={22} color={colors.accent} />
                  <Text style={styles.notSureText}>
                    Not sure. Try again or ask someone to help.
                  </Text>
                </View>
              )}
              <View style={styles.actions}>
                <ActionButton
                  name="volume-high"
                  label="Read aloud"
                  onPress={() => speakResult(result)}
                />
                <ActionButton
                  name="play"
                  label="Replay recording"
                  onPress={onReplay}
                  disabled={!recordingUri}
                />
                <ActionButton
                  name={translationSaved ? 'bookmark' : 'bookmark-outline'}
                  label={translationSaved ? 'Translation saved' : 'Save translation'}
                  onPress={onSaveTranslation}
                  active={translationSaved}
                  disabled={!result.translatedText || savingTranslation}
                />
              </View>
            </View>
          )}

          <View style={styles.micSection}>
            <View style={styles.micRings}>
              <View
                style={[
                  styles.outerRing,
                  { backgroundColor: ringColor, borderColor: ringBorderColor },
                ]}
              />
              <View
                style={[
                  styles.innerRing,
                  { backgroundColor: ringColor, borderColor: ringBorderColor },
                ]}
              />
              <MicButton
                recording={recording}
                onPress={onMic}
                size={160}
                color={micColor}
                recordingColor={colors.recording}
                disabled={busy}
              />
            </View>
            <Text style={styles.headline}>{recording ? 'Listening…' : `Speak ${from}`}</Text>
            <Text style={styles.hint}>
              {recording ? 'Tap the microphone to stop' : 'Tap the microphone to start'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ActionButton({
  name,
  label,
  onPress,
  active = false,
  disabled = false,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: active }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.pressed,
        disabled && !active && styles.disabled,
      ]}
    >
      <Ionicons name={name} size={22} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  header: { gap: spacing.xs },
  brand: { fontSize: fonts.size.sm, color: colors.textMuted, fontWeight: fonts.weight.bold },
  title: { fontSize: fonts.size.xl, fontWeight: fonts.weight.regular, color: colors.text },
  languageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  languageSelector: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  languageSide: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  languageDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
  language: { fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text },
  languageRight: { flex: 1, textAlign: 'right' },
  swap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  main: { flex: 1, flexGrow: 1, minHeight: 340, justifyContent: 'center', gap: spacing.xl },
  loading: { alignItems: 'center', gap: spacing.sm },
  loadingText: { color: colors.textMuted, fontSize: fonts.size.md },
  micSection: { alignItems: 'center', gap: spacing.md },
  micRings: {
    width: 248,
    height: 248,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: 124,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  innerRing: {
    position: 'absolute',
    width: 204,
    height: 204,
    borderRadius: 102,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  headline: {
    fontSize: fonts.size.lg + 2,
    fontWeight: fonts.weight.regular,
    color: colors.text,
    textAlign: 'center',
  },
  hint: { fontSize: fonts.size.sm, color: colors.textMuted, textAlign: 'center' },
  result: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  source: {
    fontSize: fonts.size.md,
    color: colors.textMuted,
    fontWeight: fonts.weight.bold,
  },
  translated: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.text },
  notSure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  notSureText: {
    flex: 1,
    fontSize: fonts.size.md,
    color: colors.text,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.45 },
});
