import { useCodeStore } from "../state/code-store";

export function UntypedChars() {
  const untypedChars = useCodeStore((state) => state.untypedChars);
  return <span className="text-gray-500">{untypedChars()}</span>;
}