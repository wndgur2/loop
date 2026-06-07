import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { type Lang, type TKey, translations } from './translations';

const STORAGE_KEY = 'loop.lang';

type Vars = Record<string, string | number>;

type I18nState = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Vars) => string;
};

const I18nContext = createContext<I18nState | null>(null);

function format(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** 언어 설정을 앱 전역에 제공. 선택값은 AsyncStorage에 영속. 기본 한국어. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');

  useEffect(() => {
    // 비동기 로드 → 저장된 언어 복원(렌더 차단하지 않음).
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'ko' || v === 'en') setLangState(v);
    });
  }, []);

  const value = useMemo<I18nState>(
    () => ({
      lang,
      setLang: (l) => {
        setLangState(l);
        void AsyncStorage.setItem(STORAGE_KEY, l);
      },
      t: (key, vars) => format(translations[lang][key] ?? translations.ko[key] ?? key, vars),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}

/** 자주 쓰는 t만 필요할 때. */
export function useT() {
  return useI18n().t;
}
