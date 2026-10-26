import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import type { Scenario, Word } from '@/api/types';
import { categoryIcon } from '@/components/categoryIcon';
import { GradientScreen } from '@/components/GradientScreen';
import { ProgressBar } from '@/components/ProgressBar';
import { Sheet } from '@/components/Sheet';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radius, shadow, spacing, TAB_BAR_SPACE } from '@/theme';

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { progress } = useAppState();
  const [next, setNext] = useState<Word | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const practiced = progress?.wordsPracticed;

  // Re-fetch the suggestion whenever practice progress changes.
  useEffect(() => {
    api.getNextWord().then(setNext);
  }, [practiced]);

  useEffect(() => {
    api.getWords().then(setWords);
    api.getScenarios().then(setScenarios);
  }, []);

  const total = progress?.wordsTotal ?? 0;
  const pct = total ? (progress?.wordsPracticed ?? 0) / total : 0;

  return (
    <GradientScreen>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Learn</Text>
        <Text style={styles.bigPct}>{Math.round(pct * 100)}%</Text>
        <Text style={styles.sub}>
          {progress?.wordsPracticed ?? 0} of {total} words practiced
        </Text>
        <ProgressBar value={pct} />
      </View>

      <Sheet>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + TAB_BAR_SPACE + spacing.xl },
          ]}
        >
          {next ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Practice next word: ${next.english}`}
              onPress={() => router.push(`/word/${next.id}`)}
              style={({ pressed }) => [styles.next, pressed && { opacity: 0.92 }]}
            >
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text style={styles.nextLabel}>Up next</Text>
                <Text style={styles.nextWord}>{next.english}</Text>
              </View>
              <Ionicons name="mic-circle" size={48} color={colors.accent} />
            </Pressable>
          ) : (
            progress && (
              <View style={styles.done}>
                <Ionicons name="trophy" size={28} color={colors.confidenceMid} />
                <Text style={styles.doneText}>You practiced every word. Great work!</Text>
              </View>
            )
          )}

          <View style={styles.tiles}>
            <Tile
              icon="chatbubbles"
              value={`${progress?.scenariosCompleted ?? 0}/${progress?.scenariosTotal ?? 0}`}
              label="Scenarios done"
            />
            <Tile icon="ribbon" value={progress?.latestScore ?? '–'} label="Latest score" />
          </View>

          <Text style={styles.section}>Phrases</Text>
          {progress?.categories.map((category) => {
            const categoryWords = words.filter((word) => word.categoryId === category.categoryId);
            if (!categoryWords.length) return null;
            return (
              <View key={`phrases-${category.categoryId}`} style={styles.group}>
                <View style={styles.groupHeading}>
                  <Ionicons
                    name={categoryIcon(category.categoryId)}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.topicName}>{category.name}</Text>
                </View>
                {categoryWords.map((word) => (
                  <Pressable
                    key={word.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Practice ${word.english}`}
                    onPress={() => router.push(`/word/${word.id}`)}
                    style={({ pressed }) => [styles.phrase, pressed && { opacity: 0.9 }]}
                  >
                    <View style={styles.phraseText}>
                      <Text style={styles.phraseEnglish}>{word.english}</Text>
                      <Text style={styles.topicMeta}>
                        {word.rohingya ?? word.rohingyalish ?? 'Translation not available'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            );
          })}

          <Text style={styles.section}>Scenarios</Text>
          {progress?.categories.map((category) => {
            const categoryScenarios = scenarios.filter(
              (scenario) => scenario.categoryId === category.categoryId,
            );
            if (!categoryScenarios.length) return null;
            return (
              <View key={`scenarios-${category.categoryId}`} style={styles.group}>
                <View style={styles.groupHeading}>
                  <Ionicons
                    name={categoryIcon(category.categoryId)}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.topicName}>{category.name}</Text>
                </View>
                {categoryScenarios.map((scenario) => (
                  <Pressable
                    key={scenario.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Practice scenario: ${scenario.title}`}
                    onPress={() => router.push(`/scenario/${scenario.id}`)}
                    style={({ pressed }) => [styles.phrase, pressed && { opacity: 0.9 }]}
                  >
                    <View style={styles.phraseText}>
                      <Text style={styles.phraseEnglish}>{scenario.title}</Text>
                      <Text style={styles.topicMeta}>{scenario.turns.length} conversation turns</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            );
          })}

          <Text style={styles.section}>Progress by topic</Text>
          {progress?.categories.map((c) => {
            const done = c.wordsPracticed + c.scenariosDone;
            const all = c.wordsTotal + c.scenariosTotal;
            return (
              <View key={c.categoryId} style={styles.topic}>
                <View style={styles.topicIcon}>
                  <Ionicons name={categoryIcon(c.categoryId)} size={24} color={colors.primary} />
                </View>
                <View style={styles.topicBody}>
                  <Text style={styles.topicName}>{c.name}</Text>
                  <ProgressBar value={all ? done / all : 0} />
                  <Text style={styles.topicMeta}>
                    {c.wordsPracticed}/{c.wordsTotal} words
                    {c.scenariosTotal
                      ? `  ·  ${c.scenariosDone}/${c.scenariosTotal} scenarios`
                      : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Sheet>
    </GradientScreen>
  );
}

function Tile({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string | number;
  label: string;
}) {
  return (
    <View accessibilityLabel={`${label}: ${value}`} style={styles.tile}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
  title: { fontSize: fonts.size.xl, fontWeight: fonts.weight.regular, color: colors.text },
  bigPct: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  sub: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  content: { padding: spacing.xl, gap: spacing.lg },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    ...shadow.card,
  },
  nextLabel: { fontSize: fonts.size.sm, color: colors.textOnPrimary, opacity: 0.85 },
  nextWord: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.textOnPrimary },
  done: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  doneText: { flex: 1, fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.text },
  tiles: { flexDirection: 'row', gap: spacing.md },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  tileValue: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.text },
  tileLabel: { fontSize: fonts.size.sm, color: colors.textMuted, textAlign: 'center' },
  section: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  group: { gap: spacing.sm },
  groupHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  phrase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phraseText: { flex: 1, gap: spacing.xs },
  phraseEnglish: { fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.text },
  topic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicBody: { flex: 1, gap: spacing.sm },
  topicName: { fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.text },
  topicMeta: { fontSize: fonts.size.sm, color: colors.textMuted },
});
