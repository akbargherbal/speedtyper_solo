import { InfoIcon } from "../../../assets/icons/InfoIcon";
import Modal from "../modals/Modal";
import { closeModals, toggleDebugMode, useSettingsStore } from "../../../modules/play2/state/settings-store";
import ModalCloseButton from "../buttons/ModalCloseButton";
import { Overlay } from "../Overlay";
import { ToggleSelector } from "../../../modules/play2/components/RaceSettings";

interface SettingsOverlayProps {
  closeModal: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  closeModal,
}: SettingsOverlayProps) => {
  const debugMode = useSettingsStore((s) => s.debugMode);

  return (
    <>
      <Overlay onOverlayClick={closeModal}>
        <Modal>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                className="cursor-default w-4 h-auto mr-2"
                title="Personal settings are stored in your browser"
              >
                <InfoIcon />
              </button>
              <h2 className="text-2xl font-bold tracking-wider">Settings</h2>
            </div>
            <ModalCloseButton onButtonClickHandler={closeModals} />
          </div>

          <div className="space-y-6">
            {/* Debug Mode Toggle */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <ToggleSelector
                title="Debug Mode"
                description="Lock focus for screenshots"
                checked={debugMode}
                toggleEnabled={toggleDebugMode}
              />
              <p className="text-xs text-gray-400 mt-2 ml-16">
                Keeps typing area focused even when clicking outside
              </p>
            </div>

            {/* Info Sections - More Concise */}
            <div className="space-y-3">
              <InfoSection
                title="Language"
                description="Select on home page or use Alt + ←/→ keys"
                color="gray"
              />
              
              <InfoSection
                title="Syntax Highlighting"
                description="Disabled for optimal cursor behavior"
                color="blue"
              />
              
              <InfoSection
                title="Solo Mode"
                description="All races stored locally on your machine"
                color="gray"
              />
            </div>

            {/* Footer Note */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                More customization options coming soon
              </p>
            </div>
          </div>
        </Modal>
      </Overlay>
    </>
  );
};

// Reusable info section component
interface InfoSectionProps {
  title: string;
  description: string;
  color: "gray" | "blue";
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, description, color }) => {
  const bgColor = color === "blue" ? "bg-blue-900/30" : "bg-gray-800";
  const borderColor = color === "blue" ? "border-blue-500" : "border-transparent";

  return (
    <div className={`${bgColor} p-3 rounded-lg border-l-4 ${borderColor}`}>
      <h3 className="font-semibold text-base text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
};