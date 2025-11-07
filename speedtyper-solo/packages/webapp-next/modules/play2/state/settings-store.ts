import create from 'zustand';
import { getExperimentalServerUrl } from '../../../common/utils/getServerUrl';
import { toast } from 'react-toastify';

export interface LanguageDTO {
  language: string;
  name: string;
}

export const availableLanguages: LanguageDTO[] = [
  { language: 'typescript', name: 'TypeScript' },
  { language: 'javascript', name: 'JavaScript' },
  { language: 'python', name: 'Python' },
];

export interface SettingsState {
  settingsModalIsOpen: boolean;
  languageModalIsOpen: boolean;
  leaderboardModalIsOpen: boolean;
  profileModalIsOpen: boolean;
  projectModalIsOpen: boolean;
  publicRacesModalIsOpen: boolean;
  infoModalIsOpen: boolean;
  languageSelected: LanguageDTO | null;
  syntaxHighlighting: boolean;
  raceIsPublic: boolean;
  defaultIsPublic: boolean;
  debugMode: boolean;
}

const SYNTAX_HIGHLIGHTING_KEY = 'syntaxHighlighting';
const DEFAULT_RACE_IS_PUBLIC_KEY = 'defaultRaceIsPublic2';
const LANGUAGE_KEY = 'language';
const DEBUG_MODE_KEY = 'debugMode';

function getInitialToggleStateFromLocalStorage(
  key: string,
  defaultToggleValue: boolean,
): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      let toggleStateStr = localStorage.getItem(key);
      if (!toggleStateStr) {
        localStorage.setItem(key, defaultToggleValue.toString());
        toggleStateStr = defaultToggleValue.toString();
      }
      return toggleStateStr === 'true';
    } catch (e) {
      return defaultToggleValue;
    }
  }
  return defaultToggleValue;
}

function getInitialLanguageFromLocalStorage(key: string): LanguageDTO | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      let languageStr = localStorage.getItem(key) ?? '';
      let lang;
      try {
        lang = JSON.parse(languageStr);
      } catch (e) {
        // ignore
      }
      if (!lang?.language || !lang?.name) {
        const defaultLang = { language: 'javascript', name: 'JavaScript' };
        localStorage.setItem(key, JSON.stringify(defaultLang));
        return defaultLang;
      }
      return lang;
    } catch (e) {
      return { language: 'javascript', name: 'JavaScript' };
    }
  }
  return { language: 'javascript', name: 'JavaScript' };
}

export const useSettingsStore = create<SettingsState>((_set, _get) => ({
  settingsModalIsOpen: false,
  languageModalIsOpen: false,
  leaderboardModalIsOpen: false,
  profileModalIsOpen: false,
  publicRacesModalIsOpen: false,
  projectModalIsOpen: false,
  infoModalIsOpen: false,
  syntaxHighlighting: getInitialToggleStateFromLocalStorage(
    SYNTAX_HIGHLIGHTING_KEY,
    false,
  ),
  raceIsPublic: false,
  defaultIsPublic: getInitialToggleStateFromLocalStorage(
    DEFAULT_RACE_IS_PUBLIC_KEY,
    false,
  ),
  languageSelected: getInitialLanguageFromLocalStorage(LANGUAGE_KEY),
  debugMode: getInitialToggleStateFromLocalStorage(DEBUG_MODE_KEY, false),
}));

export const setLanguage = (language: LanguageDTO | null) => {
  let stored = '';
  if (language) {
    stored = JSON.stringify(language);
  }
  localStorage.setItem(LANGUAGE_KEY, stored);
  useSettingsStore.setState((state) => ({
    ...state,
    languageSelected: language,
  }));
};

export const nextLanguage = () => {
  const currentLanguage = useSettingsStore.getState().languageSelected;
  if (!currentLanguage) {
    setLanguage(availableLanguages[0]);
    return;
  }
  const currentIndex = availableLanguages.findIndex(
    (lang) => lang.language === currentLanguage.language,
  );
  const nextIndex = (currentIndex + 1) % availableLanguages.length;
  const newLanguage = availableLanguages[nextIndex];
  setLanguage(newLanguage);
  
  // Show toast notification
  toast.info(`Switched to ${newLanguage.name}`, {
    position: "bottom-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeButton: false,
    className: "bg-dark-lake text-off-white",
  });
};

export const previousLanguage = () => {
  const currentLanguage = useSettingsStore.getState().languageSelected;
  if (!currentLanguage) {
    setLanguage(availableLanguages[0]);
    return;
  }
  const currentIndex = availableLanguages.findIndex(
    (lang) => lang.language === currentLanguage.language,
  );
  const nextIndex =
    (currentIndex - 1 + availableLanguages.length) % availableLanguages.length;
  const newLanguage = availableLanguages[nextIndex];
  setLanguage(newLanguage);
  
  // Show toast notification
  toast.info(`Switched to ${newLanguage.name}`, {
    position: "bottom-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeButton: false,
    className: "bg-dark-lake text-off-white",
  });
};

export const toggleDebugMode = () => {
  const debugModeStr = localStorage.getItem(DEBUG_MODE_KEY);
  let debugMode = debugModeStr === 'true';
  debugMode = !debugMode;
  localStorage.setItem(DEBUG_MODE_KEY, debugMode.toString());
  useSettingsStore.setState((state) => ({ ...state, debugMode }));
  console.log(`[Debug Mode] ${debugMode ? 'ENABLED' : 'DISABLED'} - Focus behavior ${debugMode ? 'locked for screenshots' : 'normal'}`);
};

export const toggleDefaultRaceIsPublic = () => {
  const booleanStrValue = localStorage.getItem(DEFAULT_RACE_IS_PUBLIC_KEY);
  let defaultIsPublic = booleanStrValue === 'true';
  defaultIsPublic = !defaultIsPublic;
  localStorage.setItem(DEFAULT_RACE_IS_PUBLIC_KEY, defaultIsPublic.toString());
  useSettingsStore.setState((state) => ({ ...state, defaultIsPublic }));
};

export const toggleSyntaxHighlightning = () => {
  const syntaxHighlightingStr = localStorage.getItem(SYNTAX_HIGHLIGHTING_KEY);
  let syntaxHighlighting = syntaxHighlightingStr === 'true';
  syntaxHighlighting = !syntaxHighlighting;
  localStorage.setItem(SYNTAX_HIGHLIGHTING_KEY, syntaxHighlighting.toString());
  useSettingsStore.setState((state) => ({ ...state, syntaxHighlighting }));
};

export const openSettingsModal = () => {
  if (useSettingsStore.getState().profileModalIsOpen) return;
  if (useSettingsStore.getState().leaderboardModalIsOpen) return;
  useSettingsStore.setState((s) => ({
    ...s,
    settingsModalIsOpen: true,
  }));
};

export const openLanguageModal = () => {
  if (useSettingsStore.getState().profileModalIsOpen) return;
  if (useSettingsStore.getState().leaderboardModalIsOpen) return;
  useSettingsStore.setState((s) => ({
    ...s,
    languageModalIsOpen: true,
  }));
};

export const openInfoModal = () => {
  useSettingsStore.setState((s) => ({
    ...s,
    infoModalIsOpen: true,
  }));
};

export const openProfileModal = () => {
  useSettingsStore.setState((s) => ({
    ...s,
    profileModalIsOpen: true,
  }));
};

export const openLeaderboardModal = () => {
  if (useSettingsStore.getState().settingsModalIsOpen) return;
  useSettingsStore.setState((s) => ({
    ...s,
    leaderboardModalIsOpen: true,
  }));
};

export const openPublicRacesModal = () => {
  if (useSettingsStore.getState().settingsModalIsOpen) return;
  useSettingsStore.setState((s) => ({
    ...s,
    publicRacesModalIsOpen: true,
  }));
};

export const openProjectModal = () => {
  useSettingsStore.setState((s) => ({
    ...s,
    projectModalIsOpen: true,
  }));
};

export const useHasOpenModal = () => {
  const leaderboardModalIsOpen = useSettingsStore(
    (s) => s.leaderboardModalIsOpen,
  );
  const settingsModalIsOpen = useSettingsStore((s) => s.settingsModalIsOpen);
  return leaderboardModalIsOpen || settingsModalIsOpen;
};

export const closeModals = () => {
  useSettingsStore.setState((s) => ({
    ...s,
    settingsModalIsOpen: false,
    leaderboardModalIsOpen: false,
    profileModalIsOpen: false,
    publicRacesModalIsOpen: false,
    languageModalIsOpen: false,
    projectModalIsOpen: false,
    infoModalIsOpen: false,
  }));
};

export const toggleRaceIsPublic = () => {
  const baseUrl = getExperimentalServerUrl();
  const url = baseUrl + '/api/races/online';
  fetch(url, {
    method: 'POST',
    credentials: 'include',
  }).then((res) =>
    res.json().then(({ isPublic: raceIsPublic }) => {
      useSettingsStore.setState((s) => ({ ...s, raceIsPublic }));
    }),
  );
};