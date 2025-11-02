import { InfoIcon } from "../../../assets/icons/InfoIcon";
import Modal from "../modals/Modal";
import { closeModals } from "../../../modules/play2/state/settings-store";
import ModalCloseButton from "../buttons/ModalCloseButton";
import { Overlay } from "../Overlay";

interface SettingsOverlayProps {
  closeModal: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  closeModal,
}: SettingsOverlayProps) => {
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
          
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Language Selection</h3>
              <p className="text-sm text-gray-700">
                Use the language selector on the home page to choose your preferred programming language for typing practice.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-semibold text-lg mb-2">Typing Experience</h3>
              <p className="text-sm text-gray-700 mb-2">
                Syntax highlighting is intentionally disabled to ensure proper cursor behavior and optimal typing performance.
              </p>
              <p className="text-xs text-gray-600 italic">
                This design choice prioritizes accurate keystroke detection over visual aesthetics.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Solo Mode</h3>
              <p className="text-sm text-gray-700">
                SpeedTyper Solo is optimized for individual practice. All races are private and stored locally on your machine.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-500 text-center">
                Additional customization options coming in future updates
              </p>
            </div>
          </div>
        </Modal>
      </Overlay>
    </>
  );
};