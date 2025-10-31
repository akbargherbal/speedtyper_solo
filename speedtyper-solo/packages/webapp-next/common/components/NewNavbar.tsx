import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { TerminalIcon } from "../../assets/icons/TerminalIcon";
import { Logo, WebsiteName } from "../../components/Navbar";
import { useGameStore } from "../../modules/play2/state/game-store";
import {
  useConnectionStore,
  ConnectionStatus as ConnectionStatusType,
} from "../../modules/play2/state/connection-store";
import { useIsPlaying } from "../hooks/useIsPlaying";
import { PlayingNow } from "./BattleMatcher";
import Button from "./Button";
import { NewGithubLoginModal } from "./modals/GithubLoginModal";
import { SettingsModal } from "./modals/SettingsModal";

export const navbarFactory = () => {
  return NewNavbar;
};

const HomeLink = () => {
  return (
    <Link href="/">
      <span className="flex items-center cursor-pointer trailing-widest leading-normal text-xl  pl-2 text-off-white hover:text-white mr-2 lg:mr-6">
        <div className="flex items-center mr-4 mb-1">
          <Logo />
        </div>
        <WebsiteName />
      </span>
    </Link>
  );
};

const ConnectionStatus = () => {
  const connectionStatus = useConnectionStore(
    (state) => state.connectionStatus
  );

  const getStatusDetails = (status: ConnectionStatusType) => {
    switch (status) {
      case "connected":
        return {
          color: "bg-green-500",
          text: "Connected",
          animate: true,
        };
      case "connecting":
        return {
          color: "bg-yellow-500",
          text: "Connecting...",
          animate: true,
        };
      case "disconnected":
        return {
          color: "bg-red-500",
          text: "Disconnected",
          animate: false,
        };
      default:
        return {
          color: "bg-gray-500",
          text: "Unknown",
          animate: false,
        };
    }
  };

  const { color, text, animate } = getStatusDetails(connectionStatus);

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 mr-4">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        {animate && (
          <div
            className={`absolute inset-0 w-2 h-2 rounded-full ${color} animate-ping opacity-75`}
          />
        )}
      </div>
      <span className="hidden sm:inline">{text}</span>
    </div>
  );
};

const ProfileSection = () => {
  const isPlaying = useIsPlaying();
  return (
    <>
      {!isPlaying && (
        <AnimatePresence>
          <motion.div
            className="flex-grow flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm flex-grow"></div>
            <ConnectionStatus />
            <NewGithubLoginModal />
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export const NewNavbar = () => {
  const isPlaying = useIsPlaying();
  return (
    <header
      className="mt-2 h-10 tracking-tighter"
      style={{
        fontFamily: "Fira Code",
      }}
    >
      <div className="w-full">
        <div className="flex items-center items-start py-2">
          <HomeLink />
          {!isPlaying && (
            <div className="flex gap-2">
              <Link href="/">
                <Button
                  size="sm"
                  color="invisible"
                  onClick={() => useGameStore.getState().game?.play()}
                  leftIcon={<TerminalIcon />}
                />
              </Link>
              <SettingsModal />
              <PlayingNow />
            </div>
          )}
          <ProfileSection />
        </div>
      </div>
    </header>
  );
};