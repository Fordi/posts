import { useCallback, useRef, useState } from "react";
import useEventListener from "./useEventListener";

export default function useHovered() {
  const [over, setOver] = useState(false);
  const ref = useRef(null);
  const mouseEnter = useCallback((event) => setOver(true), []);
  const wrappedRef = (element) => {
    ref.current?.removeEventListener('mouseenter', mouseEnter);
    ref.current = element;
    element?.addEventListener('mouseenter', mouseEnter);
  };
  useEventListener(window, 'mouseover', useCallback(({ toElement }) => {
    if (toElement === ref.current || ref.current?.contains(toElement)) return;
    setOver(false);
  }, []));
  return [over, wrappedRef];
};