import { AnimatePresence, motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useSocket } from "../common/hooks/useSocket";
import { Keys, useKeyMap } from "../hooks/useKeyMap";
import { CodeTypingContainer } from "../modules/play2/containers/CodeTypingContainer";
import { useGame } from "../modules/play2/hooks/useGame";
import { useIsCompleted } from "../modules/play2/hooks/useIsCompleted";
import { ResultsContainer } from "../modules/play2/containers/ResultsContainer";
import { useUser } from "../common/api/user";
import { useChallenge } from "../modules/play2/hooks/useChallenge";
import { useEndGame } from "../modules/play2/hooks/useEndGame";
import { useResetStateOnUnmount } from "../modules/play2/hooks/useResetStateOnUnmount";
import { PlayFooter } from "../modules/play2/components/play-footer/PlayFooter";
import { PlayHeader } from "../modules/play2/components/play-header/PlayHeader";
import { useInitializeUserStore } from "../common/state/user-store";
import { useCallback, useEffect, useState } from "react";
import { useConnectionManager } from "../modules/play2/state/connection-store";
import {
  closeModals,
  useHasOpenModal,
  useSettingsStore,
  setLanguage,
  LanguageDTO,
} from "../modules/play2/state/settings-store";
import { useIsPlaying } from "../common/hooks/useIsPlaying";
import { refreshTrends } from "../modules/play2/state/trends-store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import useSWR from "swr";
import { getExperimentalServerUrl } from "../common/utils/getServerUrl";

export const config = { runtime: "experimental-edge" };

const baseUrl = getExperimentalServerUrl();

function Play2Page() {
  const user = useUser();
  useInitializeUserStore(user);
  const isCompleted = useIsCompleted();
  const isPlaying = useIsPlaying();
  useSocket();
  useConnectionManager();
  const hasOpenModal = useHasOpenModal();
  const game = useGame();
  const challenge = useChallenge();
  const [isThrottled, setIsThrottled] = useState(false);

  // Fetch available languages for cycling
  const { data: languagesData } = useSWR(
    baseUrl + "/api/languages",
    (...args) => fetch(...args).then((res) => res.json())
  );
  const languages = (languagesData as undefined | LanguageDTO[]) || [];
  const selectedLanguage = useSettingsStore((s) => s.languageSelected);

  // Language cycling helper
  const cycleLanguage = useCallback(
    (direction: "next" | "prev") => {
      if (languages.length === 0) return;

      const currentIndex = selectedLanguage
        ? languages.findIndex((l) => l.language === selectedLanguage.language)
        : -1;

      let newIndex: number;
      if (direction === "next") {
        newIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % languages.length;
      } else {
        newIndex =
          currentIndex === -1
            ? languages.length - 1
            : (currentIndex - 1 + languages.length) % languages.length;
      }

      const newLanguage = languages[newIndex];
      setLanguage(newLanguage);
      game?.next();

      // Show toast notification
      toast.info(`Switched to ${newLanguage.name}`, {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        className: "bg-dark-lake text-off-white",
      });
    },
    [languages, selectedLanguage, game]
  );

  // Tab key - Next snippet (existing functionality)
  const { capsLockActive } = useKeyMap(
    true,
    Keys.Tab,
    useCallback(() => {
      if (isThrottled) return;
      if (hasOpenModal) return;
      game?.next();
      setIsThrottled(true);
      setTimeout(() => {
        setIsThrottled(false);
      }, 2000);
    }, [isThrottled, hasOpenModal, game])
  );

  // Enter key - Start next race (only on results page)
  useKeyMap(
    isCompleted && !hasOpenModal,
    Keys.Enter,
    useCallback(() => {
      if (isThrottled) return;
      game?.next();
      setIsThrottled(true);
      setTimeout(() => {
        setIsThrottled(false);
      }, 1000);
    }, [isCompleted, isThrottled, game]),
    { blockWhenTyping: false }
  );

  // Alt + Right Arrow - Next language
  useKeyMap(
    !hasOpenModal && languages.length > 0,
    Keys.ArrowRight,
    useCallback(() => {
      if (isThrottled) return;
      cycleLanguage("next");
      setIsThrottled(true);
      setTimeout(() => {
        setIsThrottled(false);
      }, 1000);
    }, [isThrottled, cycleLanguage]),
    { requireAlt: true, blockWhenTyping: false }
  );

  // Alt + Left Arrow - Previous language
  useKeyMap(
    !hasOpenModal && languages.length > 0,
    Keys.ArrowLeft,
    useCallback(() => {
      if (isThrottled) return;
      cycleLanguage("prev");
      setIsThrottled(true);
      setTimeout(() => {
        setIsThrottled(false);
      }, 1000);
    }, [isThrottled, cycleLanguage]),
    { requireAlt: true, blockWhenTyping: false }
  );

  useSettingsStore((s) => s.settingsModalIsOpen);
  useResetStateOnUnmount();
  useEndGame();
  useEffect(() => {
    if (isPlaying) {
      refreshTrends();
      closeModals();
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col relative">
      <>
        <PlayHeader />
        {capsLockActive && (
          <div className="absolute top-[-30px] z-10 flex w-full items-center justify-center gap-2 font-medium text-red-400">
            <div className="w-4 text-dark-ocean">
              <FontAwesomeIcon icon={faLock} className="text-red-400" />
            </div>
            Caps Lock is active
          </div>
        )}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {isCompleted && (
              <>
                <ResultsContainer />
                {/* Keyboard shortcut hints */}
                <div className="flex flex-col items-center gap-2 mt-4 text-sm text-faded-gray">
                  <div>
                    Press <kbd className="px-2 py-1 mx-1 bg-dark-lake rounded">Enter</kbd> or{" "}
                    <kbd className="px-2 py-1 mx-1 bg-dark-lake rounded">Tab</kbd> to continue
                  </div>
                  <div className="text-xs">
                    <kbd className="px-2 py-1 mx-1 bg-dark-lake rounded">Alt + ←/→</kbd> to change language
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {!isCompleted && (
              <CodeTypingContainer
                filePath={challenge.filePath}
                language={challenge.language}
              />
            )}
          </motion.div>
        </AnimatePresence>
        <PlayFooter challenge={challenge} />
      </>
      <ToastContainer />
    </div>
  );
}

export default Play2Page;