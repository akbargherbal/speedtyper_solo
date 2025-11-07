import { CrossIcon } from "../../../../assets/icons/CrossIcon";
import {
  useSettingsStore,
  LanguageDTO,
  setLanguage,
  availableLanguages,
} from "../../state/settings-store";
import { useGameStore } from "../../state/game-store";

export function LanguageSelector() {
  const selectedLanguage = useSettingsStore((s) => s.languageSelected);
  const game = useGameStore((s) => s.game);

  console.log("[LanguageSelector] Render - selectedLanguage:", selectedLanguage?.name);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = event.target.value;
    
    console.log("[LanguageSelector] handleLanguageChange called with:", selectedName);
    
    if (!selectedName) {
      // Handle "clear" option
      setLanguage(null);
      return;
    }

    const newLanguage = availableLanguages.find(
      (lang) => lang.name === selectedName
    );

    if (newLanguage && newLanguage.language !== selectedLanguage?.language) {
      console.log("[LanguageSelector] Setting language to:", newLanguage.name);
      setLanguage(newLanguage);
      game?.next();
    }
  };

  const handleClear = () => {
    console.log("[LanguageSelector] Clear button clicked");
    setLanguage(null);
  };

  return (
    <div className="w-full text-dark-ocean font-thin w-[250px]">
      <h2 className="text-xs mb-1 font-semibold uppercase tracking-widest">
        select language
      </h2>
      <div className="flex items-center">
        <select
          value={selectedLanguage?.name || ""}
          onChange={handleLanguageChange}
          className="flex-1 px-2 bg-gray-200 p-1 rounded cursor-pointer"
        >
          <option value="">nothing selected</option>
          {availableLanguages.map((language) => (
            <option key={language.name} value={language.name}>
              {language.name}
              {selectedLanguage?.name === language.name ? " ✓" : ""}
            </option>
          ))}
        </select>
        {selectedLanguage && (
          <button
            onClick={handleClear}
            className="flex items-center p-1 h-full bg-gray-200 ml-2 rounded"
          >
            <div className="w-2 text-red-500 fill-current mx-1">
              <CrossIcon />
            </div>
            <span>clear</span>
          </button>
        )}
      </div>
    </div>
  );
}