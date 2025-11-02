import { InfoIcon } from "../../../assets/icons/InfoIcon";
import Modal from "../modals/Modal";
import { closeModals } from "../../../modules/play2/state/settings-store";
import ModalCloseButton from "../buttons/ModalCloseButton";

interface SettingsOverlayProps {
  closeModal: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  closeModal,
}: SettingsOverlayProps) => {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
        <div onClick={(e) => e.stopPropagation()}>
          <Modal>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <button
                  className="cursor-default w-4 h-auto mr-1"
                  title="Personal settings are stored in your browser"
                >
                  <InfoIcon />
                </button>
                <h2 className="text-xl tracking-wider">Personal Settings</h2>
              </div>
              <ModalCloseButton onButtonClickHandler={closeModals} />
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              <p className="mb-2">
                <strong>Language Selection:</strong> Use the language selector on the home page to choose your preferred programming language.
              </p>
              <p className="text-gray-500 italic">
                Note: Syntax highlighting is always disabled to ensure proper typing cursor behavior.
              </p>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded">
              <p className="text-xs text-gray-600">
                Additional settings coming in future updates. Current focus: solo typing practice.
              </p>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};