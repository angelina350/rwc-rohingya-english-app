import { Ionicons } from '@expo/vector-icons';
import { useDeferredValue, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SavedTranslation } from '@/api/types';
import { useRecorder } from '@/hooks/useRecorder';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radius, shadow, spacing, TAB_BAR_SPACE, touch } from '@/theme';

export default function WordsScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const { savedTranslations, removeSavedTranslation } = useAppState();
  const { recording, toggle } = useRecorder();

  const translations = useMemo(
    () =>
      savedTranslations.filter((item) =>
        `${item.sourceText} ${item.translatedText}`.toLocaleLowerCase().includes(deferredQuery),
      ),
    [savedTranslations, deferredQuery],
  );

  const onVoiceSearch = async () => {
    const uri = await toggle();
    if (uri) {
      Alert.alert(
        'Voice search unavailable',
        'Speech-to-text search is not connected yet. Use the search field to find saved translations.',
      );
    }
  };

  const renderTranslation = ({ item }: { item: SavedTranslation }) => (
    <View style={styles.row}>
      <View style={styles.translationText}>
        <Text style={styles.direction}>
          {item.direction === 'rhg-en' ? 'Rohingya to English' : 'English to Rohingya'}
        </Text>
        <Text style={styles.source}>{item.sourceText}</Text>
        <Text style={styles.translated}>{item.translatedText}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove saved translation"
        onPress={() => {
          void removeSavedTranslation(item.id).catch(() => {
            Alert.alert('Could not remove', 'Please check your device storage and try again.');
          });
        }}
        style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
      >
        <Ionicons name="bookmark" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.brand}>Rohingya Voice</Text>
        <Text style={styles.title}>Saved</Text>
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Search saved translations"
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search saved translations"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={recording ? 'Stop voice search' : 'Voice search unavailable'}
            accessibilityState={{ busy: recording }}
            onPress={onVoiceSearch}
            style={({ pressed }) => [
              styles.voiceSearch,
              recording && styles.voiceSearchActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={recording ? 'stop' : 'mic'}
              size={22}
              color={recording ? colors.textOnPrimary : colors.primary}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.listSurface}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Saved translations</Text>
          <Text style={styles.sectionCount}>{translations.length}</Text>
        </View>
        <FlatList
          style={styles.list}
          data={translations}
          keyExtractor={(item) => item.id}
          renderItem={renderTranslation}
          initialNumToRender={8}
          windowSize={7}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.rows,
            { paddingBottom: insets.bottom + TAB_BAR_SPACE + spacing.xl },
          ]}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {query
                ? 'No saved translations match your search.'
                : 'Your saved translations will appear here.'}
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  brand: { fontSize: fonts.size.sm, color: colors.textMuted, fontWeight: fonts.weight.bold },
  title: { fontSize: fonts.size.xl, fontWeight: fonts.weight.regular, color: colors.text },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  input: { flex: 1, fontSize: fonts.size.md, color: colors.text },
  voiceSearch: {
    width: touch,
    height: touch,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  voiceSearchActive: { backgroundColor: colors.primary },
  listSurface: { flex: 1, minHeight: 0 },
  list: { flex: 1 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCount: { fontSize: fonts.size.sm, color: colors.textMuted },
  rows: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  translationText: { flex: 1, gap: spacing.xs },
  direction: { fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.primary },
  source: { fontSize: fonts.size.sm, color: colors.textMuted },
  translated: { fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.text },
  removeButton: {
    width: touch,
    height: touch,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fonts.size.md,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
});
