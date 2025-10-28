import { AnimatePresence, motion } from "framer-motion";
import { useIsPlaying } from "../hooks/useIsPlaying";

export function Footer() {
  const isPlaying = useIsPlaying();
  return (
    <footer
      className="h-10 tracking-tighter"
      style={{
        fontFamily: "Fira Code",
      }}
    >
      {!isPlaying && (
        <div className="w-full bg-dark-ocean">
          <AnimatePresence>
            <motion.div
              className="flex items-center justify-center text-faded-gray"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="hidden sm:flex flex-grow items-center mb-2 text-xs">
                <h1 className="bg-dark-lake py-1 px-2 rounded font-bold text-faded-gray">
                  Tab
                </h1>
                <span className="mx-1 text-faded-gray">Refresh challenge</span>
                <h1 className="bg-dark-lake py-1 px-2 rounded font-bold ml-2 text-faded-gray">
                  Enter
                </h1>

                <span className="mx-1 text-faded-gray">Start race</span>
              </div>
              {/* SOLO MODE: Social media and GitHub star links have been removed. */}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </footer>
  );
}