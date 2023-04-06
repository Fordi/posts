import useEventListener from "./useEventListener";
import useShortcutHandler from "./useShortcutHandler";
import useTransform from "./useTransform";

export default function useAccelerators(transformer, deps, target = window) {
  useEventListener(target, 'keydown', useShortcutHandler(useTransform(transformer, deps)));  
}
