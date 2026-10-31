import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import type { Category, QuickPhrase } from '@/api/types';
import { BackButton } from '@/components/BackButton';
import { GradientScreen } from '@/components/GradientScreen';
import { Sheet } from '@/components/Sheet';
import { usePlayAudio } from '@/hooks/usePlayAudio';
import { colors, fonts, radius, spacing, TAB_BAR_SPACE } from '@/theme';

export default function ScenarioCategory() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<Category | null>(null);
  const [phrases, setPhrases] = useState<QuickPhrase[]>([]);
  const play = usePlayAudio();

  useEffect(() => {
    api.getCategories().then((all) => setCategory(all.find((c) => c.id === categoryId) ?? null));
    api.getQuickPhrases(categoryId).then(setPhrases);
  }, [categoryId]);

  return (
    <GradientScreen>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <BackButton fallback="/scenario" />
        <Text style={styles.title}>{category?.name ?? 'Quick phrases'}</Text>
        {category && <Text style={styles.sub}>{category.description}</Text>}
      </View>
      <Sheet>
        <FlatList
          data={phrases}
          keyExtractor={(phrase) => phrase.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + TAB_BAR_SPACE + spacing.xl },
          ]}
          ListEmptyComponent={
            <Text style={styles.empty}>No quick phrases are available for this topic yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.phrase}>
                <Text style={styles.name}>{item.english}</Text>
                <Text style={styles.translation}>
                  {item.rohingya ?? item.rohingyalish ?? 'Translation not available'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Play ${item.english}`}
                onPress={() => play({ url: item.audioUrl, fallbackText: item.english })}
                style={({ pressed }) => [styles.play, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="volume-high" size={22} color={colors.primary} />
              </Pressable>
            </View>
          )}
        />
      </Sheet>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  title: { fontSize: fonts.size.xl, fontWeight: fonts.weight.regular, color: colors.text },
  sub: { fontSize: fonts.size.md, color: colors.textMuted },
  list: { padding: spacing.xl, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phrase: { flex: 1, gap: spacing.xs },
  name: { fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.text },
  translation: { fontSize: fonts.size.sm, color: colors.textMuted },
  play: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  empty: {
    marginTop: spacing.xxl,
    color: colors.textMuted,
    fontSize: fonts.size.md,
    textAlign: 'center',
  },
});
