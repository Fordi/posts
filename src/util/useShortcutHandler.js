import { useCallback } from "react";
import { keyEventName, normalizeShortcut } from "./keys";

export default function useShortcutHandler(rawSpec) {
  const spec = {};
  const deps = [];

  Object.keys(rawSpec || {}).forEach((combo) => {
    combo.split(',').map(c => c.trim()).forEach(c => {
      spec[normalizeShortcut(c)] = rawSpec[combo];
    });
    deps.push(rawSpec[combo]);
  });

  return useCallback((event) => {
    const combo = keyEventName(event);
    if (spec[combo]) {
      const result = spec[combo](event);
      if (result !== undefined) {
        event.stopPropagation();
      }
      if (result === false) {
        event.preventDefault();
      }
      return result;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
