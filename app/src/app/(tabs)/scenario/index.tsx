import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import type { Category, Word } from '@/api/types';
import { categoryIcon } from '@/components/categoryIcon';
import { GradientScreen } from '@/components/GradientScreen';
import { Sheet } from '@/components/Sheet';
import { colors, fonts, radius, shadow, spacing, TAB_BAR_SPACE } from '@/theme';

/** Landing: choose a topic to browse its quick phrases. */
export default function ScenarioLanding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories);
    api.getWords().then(setWords);
  }, []);

  const withPhrases = categories.filter((category) =>
    words.some((word) => word.categoryId === category.id),
  );

  return (
    <GradientScreen>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Quick phrases</Text>
        <Text style={styles.sub}>Choose a topic to browse useful phrases.</Text>
      </View>
      <Sheet>
        <FlatList
          data={withPhrases}
          numColumns={2}
          keyExtractor={(c) => c.id}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: insets.bottom + TAB_BAR_SPACE + spacing.xl },
          ]}
          renderItem={({ item }) => {
            const total = words.filter((word) => word.categoryId === item.id).length;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${total} quick phrases`}
                onPress={() => router.push(`/scenario/category/${item.id}`)}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
              >
                <View style={styles.icon}>
                  <Ionicons name={categoryIcon(item.id)} size={32} color={colors.primary} />
                </View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {total} {total === 1 ? 'phrase' : 'phrases'}
                </Text>
              </Pressable>
            );
          }}
        />
      </Sheet>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
  title: { fontSize: fonts.size.xl, fontWeight: fonts.weight.regular, color: colors.text },
  sub: { fontSize: fonts.size.md, color: colors.textMuted },
  grid: { padding: spacing.md, paddingTop: spacing.xl },
  card: {
    flex: 1,
    margin: spacing.sm,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadow.card,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  meta: { fontSize: fonts.size.sm, color: colors.textMuted },
});
