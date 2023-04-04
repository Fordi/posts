import { useEffect } from "react";

export default function useEventListener(element, eventName, handler) {
  useEffect(() => {
    element.addEventListener(eventName, handler);
    return () => {
      element.removeEventListener(eventName, handler);
    };
  } ,[element, eventName, handler]);
};