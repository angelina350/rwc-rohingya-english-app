import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { api } from '@/api/client';
import type { ProgressSummary, SavedTranslation, TranslateResult } from '@/api/types';

interface AppState {
  saved: ReadonlySet<string>;
  toggleSaved: (wordId: string) => void;
  savedTranslations: readonly SavedTranslation[];
  saveTranslation: (translation: TranslateResult) => Promise<void>;
  removeSavedTranslation: (id: string) => Promise<void>;
  progress: ProgressSummary | null;
  recordWordPractice: (wordId: string, score: number) => Promise<void>;
  recordScenarioComplete: (scenarioId: string) => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

/** Shared saved-words + learning progress; the API client is the source of truth. */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<ReadonlySet<string>>(new Set());
  const [savedTranslations, setSavedTranslations] = useState<SavedTranslation[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    Promise.all([api.getSavedWordIds(), api.getSavedTranslations(), api.getProgress()])
      .then(([ids, translations, summary]) => {
        setSaved(new Set(ids));
        setSavedTranslations(translations);
        setProgress(summary);
      })
      .catch(() => {
        Alert.alert('Could not load saved data', 'Please close and reopen the app to try again.');
      });
  }, []);

  // Ref keeps toggleSaved stable (memoized word rows) without side effects in a state updater.
  const savedRef = useRef(saved);
  useEffect(() => {
    savedRef.current = saved;
  }, [saved]);

  const toggleSaved = useCallback((wordId: string) => {
    const next = new Set(savedRef.current);
    const nowSaved = !next.delete(wordId);
    if (nowSaved) next.add(wordId);
    savedRef.current = next;
    setSaved(next);
    void api.setWordSaved(wordId, nowSaved).catch(() => {
      Alert.alert('Could not update saved words', 'Please check your device storage and try again.');
    });
  }, []);

  const saveTranslation = useCallback(async (translation: TranslateResult) => {
    if (!translation.translatedText) {
      throw new Error('A translation result is required before saving.');
    }
    const item = await api.saveTranslation({
      sourceText: translation.sourceText,
      translatedText: translation.translatedText,
      direction: translation.direction,
    });
    setSavedTranslations((current) => [item, ...current]);
  }, []);

  const removeSavedTranslation = useCallback(async (id: string) => {
    await api.removeSavedTranslation(id);
    setSavedTranslations((current) => current.filter((item) => item.id !== id));
  }, []);

  const recordWordPractice = useCallback(async (wordId: string, score: number) => {
    setProgress(await api.saveProgress({ type: 'word', wordId, score }));
  }, []);

  const recordScenarioComplete = useCallback(async (scenarioId: string) => {
    setProgress(await api.saveProgress({ type: 'scenario', scenarioId }));
  }, []);

  const value = useMemo(
    () => ({
      saved,
      toggleSaved,
      savedTranslations,
      saveTranslation,
      removeSavedTranslation,
      progress,
      recordWordPractice,
      recordScenarioComplete,
    }),
    [
      saved,
      toggleSaved,
      savedTranslations,
      saveTranslation,
      removeSavedTranslation,
      progress,
      recordWordPractice,
      recordScenarioComplete,
    ],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState must be used inside AppStateProvider');
  return v;
}
