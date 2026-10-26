import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Word } from '@/api/types';
import { colors, fonts, radius, spacing } from '@/theme';

export interface WordItemProps {
  word: Word;
  saved: boolean;
  /** Best pronunciation score so far, if the word has been practiced. */
  score?: number;
  onToggleSave: (id: string) => void;
  onPlay: (word: Word) => void;
  onOpen: (word: Word) => void;
}

const rohingyaText = (w: Word) => w.rohingya ?? w.rohingyalish ?? 'Not translated yet';

const wordColors = {
  green: colors.primary,
  muted: colors.textMuted,
  sage: colors.primarySoft,
  border: colors.border,
} as const;

function Thumb({ word, size }: { word: Word; size: number }) {
  return word.imageUrl ? (
    <Image
      source={{ uri: word.imageUrl }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
      transition={150}
      cachePolicy="memory-disk"
      recyclingKey={word.id}
      accessibilityLabel={word.english}
    />
  ) : (
    <View
      style={[styles.thumb, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Ionicons name="image-outline" size={size * 0.4} color={wordColors.green} />
    </View>
  );
}

function WordAction({
  name,
  label,
  onPress,
  selected = false,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        selected && styles.actionSelected,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Ionicons name={name} size={22} color={selected ? colors.textOnPrimary : wordColors.green} />
    </Pressable>
  );
}

function WordRowBase({ word, saved, score, onToggleSave, onPlay, onOpen }: WordItemProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Practice saying ${word.english}`}
        onPress={() => onOpen(word)}
        style={styles.rowOpen}
      >
        <Thumb word={word} size={48} />
        <View style={styles.rowText}>
          <Text style={styles.rowRohingya}>{rohingyaText(word)}</Text>
          <Text style={styles.rowEnglish}>
            {word.english}
            {score !== undefined ? `  ·  Best ${score}` : ''}
          </Text>
        </View>
      </Pressable>
      <WordAction
        name="volume-high"
        label={`Play ${word.english}`}
        onPress={() => onPlay(word)}
      />
      <WordAction
        name={saved ? 'bookmark' : 'bookmark-outline'}
        label={saved ? `Unsave ${word.english}` : `Save ${word.english}`}
        selected={saved}
        onPress={() => onToggleSave(word.id)}
      />
    </View>
  );
}

// Memoized: with stable callbacks, toggling one word re-renders only that item.
export const WordRow = memo(WordRowBase);

const styles = StyleSheet.create({
  thumb: { backgroundColor: wordColors.sage, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderBottomWidth: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: wordColors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  rowOpen: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowText: { flex: 1 },
  rowRohingya: { fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: wordColors.green },
  rowEnglish: { fontSize: fonts.size.sm, color: wordColors.muted },
  action: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: wordColors.sage,
  },
  actionSelected: { backgroundColor: wordColors.green },
});
