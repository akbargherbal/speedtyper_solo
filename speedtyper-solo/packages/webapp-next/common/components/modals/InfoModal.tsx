import React from 'react';
import { Modal } from './Modal';
import { Overlay } from '../Overlay';
import { ModalCloseButton } from '../buttons/ModalCloseButton';

interface InfoModalProps {
  closeModal: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ closeModal }) => {
  return (
    <Overlay onOverlayClick={closeModal}>
      <Modal>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
          <ModalCloseButton onButtonClickHandler={closeModal} />
        </div>

        <div className="space-y-6">
          {/* Typing Controls */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">Typing</h3>
            <div className="space-y-2">
              <ShortcutRow 
                keys="Tab" 
                description="Next snippet" 
              />
              <ShortcutRow 
                keys="Enter" 
                description="Continue (from results page)" 
              />
            </div>
          </section>

          {/* Language Selection */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">Language</h3>
            <div className="space-y-2">
              <ShortcutRow 
                keys="Alt + ←" 
                description="Previous language" 
              />
              <ShortcutRow 
                keys="Alt + →" 
                description="Next language" 
              />
            </div>
          </section>

          {/* UI Controls */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">Interface</h3>
            <div className="space-y-2">
              <ShortcutRow 
                keys="Esc" 
                description="Close modals" 
              />
              <ShortcutRow 
                keys="Click anywhere" 
                description="Focus typing area" 
              />
            </div>
          </section>

          {/* App Info */}
          <section className="pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 space-y-2">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="text-white">v1.4.0 (UI Polish)</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="text-white">Solo Practice</span>
              </div>
              <div className="mt-3">
                <a 
                  href="https://github.com/yourusername/speedtyper-solo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          </section>
        </div>
      </Modal>
    </Overlay>
  );
};

interface ShortcutRowProps {
  keys: string;
  description: string;
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ keys, description }) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded hover:bg-gray-750 transition-colors">
      <kbd className="px-3 py-1.5 bg-gray-900 text-white rounded font-mono text-sm border border-gray-700">
        {keys}
      </kbd>
      <span className="text-gray-300 ml-4 flex-1 text-right">{description}</span>
    </div>
  );
};