import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import type { Category, Word } from '@/api/types';
import { categoryIcon } from '@/components/categoryIcon';
import { GradientScreen } from '@/components/GradientScreen';
import { Sheet } from '@/components/Sheet';
import { colors, fonts, radius, shadow, spacing, TAB_BAR_SPACE } from '@/theme';

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getWords()])
      .then(([loadedCategories, loadedWords]) => {
        setCategories(loadedCategories);
        setWords(loadedWords);
      })
      .catch(() => setLoadError(true));
  }, []);

  const activeCategory = categories.find((category) => category.id === selectedCategoryId) ?? null;
  const categoryWords = words.filter((word) => word.categoryId === selectedCategoryId);
  const question = categoryWords[questionIndex] ?? null;
  const otherWords = question ? words.filter((word) => word.id !== question.id) : [];
  const distractors = question
    ? Array.from({ length: 3 }, (_, index) => otherWords[(questionIndex * 3 + index) % otherWords.length])
    : [];
  const choices = question
    ? [...distractors, question].slice(questionIndex % 4).concat([...distractors, question].slice(0, questionIndex % 4))
    : [];
  const withWords = categories.filter((category) =>
    words.some((word) => word.categoryId === category.id),
  );
  const isAnswered = selectedWordId !== null;

  const startCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setQuestionIndex(0);
    setSelectedWordId(null);
    setCompleted(false);
  };

  const returnToCategories = () => {
    setSelectedCategoryId(null);
    setQuestionIndex(0);
    setSelectedWordId(null);
    setCompleted(false);
  };

  const advance = () => {
    if (questionIndex + 1 >= categoryWords.length) {
      setCompleted(true);
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedWordId(null);
  };

  return (
    <GradientScreen>
      <View
        style={[
          styles.header,
          activeCategory && styles.quizHeader,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        {activeCategory ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to learning categories"
            onPress={returnToCategories}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
            <Text style={styles.backText}>Categories</Text>
          </Pressable>
        ) : null}
        <Text style={[styles.title, activeCategory && styles.quizTitle]}>
          {activeCategory?.name ?? 'Learn'}
        </Text>
        <Text style={styles.sub}>
          {activeCategory
            ? completed
              ? 'You finished this category.'
              : `Question ${questionIndex + 1} of ${categoryWords.length}`
            : 'Choose a category to practice words.'}
        </Text>
      </View>

      <Sheet>
        {loadError ? (
          <View style={styles.messageWrap}>
            <Text style={styles.empty}>We couldn’t load the learning activities. Please try again.</Text>
          </View>
        ) : activeCategory ? (
          completed ? (
            <View style={styles.completion}>
              <View style={styles.completionIcon}>
                <Ionicons name="trophy" size={40} color={colors.primary} />
              </View>
              <Text style={styles.completionTitle}>Great work!</Text>
              <Text style={styles.completionText}>
                You practiced all {categoryWords.length} {categoryWords.length === 1 ? 'word' : 'words'} in{' '}
                {activeCategory.name}.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => startCategory(activeCategory.id)}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>Practice again</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={returnToCategories}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryButtonText}>Choose another category</Text>
              </Pressable>
            </View>
          ) : question ? (
            <ScrollView
              contentContainerStyle={[
                styles.quizContent,
                { paddingBottom: insets.bottom + TAB_BAR_SPACE + spacing.xl },
              ]}
            >
              <View
                accessibilityLabel="Blank picture placeholder"
                style={styles.imagePlaceholder}
              >
                <Ionicons name="image-outline" size={30} color={colors.primary} />
                <Text style={styles.placeholderText}>Picture coming soon</Text>
              </View>

              <Text style={styles.answerRohingya}>
                {question.rohingya ?? question.rohingyalish ?? 'Rohingya translation pending'}
              </Text>

              <Text style={styles.prompt}>Choose the matching word</Text>
              <Text
                accessibilityLabel={
                  question.verification === 'verified'
                    ? 'Translation verified'
                    : 'Translation not verified'
                }
                style={[
                  styles.verificationBadge,
                  question.verification === 'verified'
                    ? styles.verifiedBadge
                    : styles.unverifiedBadge,
                ]}
              >
                {question.verification === 'verified' ? 'Verified' : 'Not verified'}
              </Text>
              <View style={styles.options}>
                {choices.map((choice, index) => {
                  const isCorrect = choice.id === question.id;
                  const isSelected = selectedWordId === choice.id;
                  const showCorrect = isAnswered && isCorrect;
                  const showIncorrect = isSelected && !isCorrect;
                  return (
                    <Pressable
                      key={choice.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Option ${index + 1}: ${choice.english}`}
                      accessibilityState={{ disabled: isAnswered, selected: isSelected }}
                      disabled={isAnswered}
                      onPress={() => setSelectedWordId(choice.id)}
                      style={({ pressed }) => [
                        styles.option,
                        showCorrect && styles.correctOption,
                        showIncorrect && styles.incorrectOption,
                        pressed && !isAnswered && styles.pressed,
                      ]}
                    >
                      <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
                      <Text style={styles.optionText}>{choice.english}</Text>
                      {showCorrect ? (
                        <Ionicons name="checkmark-circle" size={22} color={colors.confidenceHigh} />
                      ) : showIncorrect ? (
                        <Ionicons name="close-circle" size={22} color={colors.danger} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              {isAnswered ? (
                <View style={styles.answerArea}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={advance}
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {questionIndex + 1 === categoryWords.length ? 'Finish practice' : 'Next question'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.textOnPrimary} />
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>
          ) : (
            <View style={styles.messageWrap}>
              <Text style={styles.empty}>No words are available in this category yet.</Text>
            </View>
          )
        ) : (
          <FlatList
            data={withWords}
            numColumns={2}
            keyExtractor={(category) => category.id}
            contentContainerStyle={[
              styles.grid,
              { paddingBottom: insets.bottom + TAB_BAR_SPACE + spacing.xl },
            ]}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {categories.length ? 'No learning categories are available yet.' : 'Loading categories…'}
              </Text>
            }
            renderItem={({ item }) => {
              const total = words.filter((word) => word.categoryId === item.id).length;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, ${total} words`}
                  onPress={() => startCategory(item.id)}
                  style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons name={categoryIcon(item.id)} size={32} color={colors.primary} />
                  </View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryMeta}>
                    {total} {total === 1 ? 'word' : 'words'}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </Sheet>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
  quizHeader: { paddingBottom: spacing.sm, gap: spacing.xs },
  title: { fontSize: fonts.size.xl, fontWeight: fonts.weight.regular, color: colors.text },
  quizTitle: { fontSize: fonts.size.lg },
  sub: { fontSize: fonts.size.md, color: colors.textMuted },
  back: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 44 },
  backText: { fontSize: fonts.size.sm, color: colors.text },
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
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  categoryMeta: { fontSize: fonts.size.sm, color: colors.textMuted },
  quizContent: { padding: spacing.md, gap: spacing.xs },
  imagePlaceholder: {
    height: 240,
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: { fontSize: fonts.size.sm, color: colors.textMuted },
  answerRohingya: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  prompt: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  verificationBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
  },
  verifiedBadge: { color: colors.confidenceHigh, backgroundColor: colors.primarySoft },
  unverifiedBadge: { color: colors.text, backgroundColor: colors.directionOrangeSoft },
  options: { gap: spacing.xs },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionLetter: {
    width: 28,
    height: 28,
    lineHeight: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    textAlign: 'center',
  },
  optionText: { flex: 1, color: colors.text, fontSize: fonts.size.md, fontWeight: fonts.weight.bold },
  correctOption: { borderColor: colors.confidenceHigh, backgroundColor: '#EFF9F4' },
  incorrectOption: { borderColor: colors.danger, backgroundColor: colors.recordingSoft },
  pressed: { opacity: 0.88 },
  answerArea: { gap: spacing.md },
  primaryButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    ...shadow.card,
  },
  primaryButtonText: { color: colors.textOnPrimary, fontSize: fonts.size.md, fontWeight: fonts.weight.bold },
  secondaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: colors.primary, fontSize: fonts.size.md, fontWeight: fonts.weight.bold },
  completion: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  completionIcon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
  },
  completionTitle: { fontSize: fonts.size.xl, fontWeight: fonts.weight.bold, color: colors.text },
  completionText: {
    fontSize: fonts.size.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  empty: { color: colors.textMuted, fontSize: fonts.size.md, textAlign: 'center' },
});
